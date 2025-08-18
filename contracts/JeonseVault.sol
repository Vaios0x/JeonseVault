// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IPropertyOracle.sol";
import "./interfaces/IComplianceModule.sol";
import "./interfaces/IInvestmentPool.sol";

/**
 * @title JeonseVault
 * @dev Main escrow contract for Korean Jeonse housing deposit system
 * @author JeonseVault Team
 */
contract JeonseVault is ReentrancyGuard, Pausable, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    // Contract dependencies
    IPropertyOracle public propertyOracle;
    IComplianceModule public complianceModule;
    IInvestmentPool public investmentPool;
    
    // State variables
    Counters.Counter private _depositCounter;
    mapping(uint256 => Deposit) public deposits;
    mapping(address => uint256[]) public userDeposits;
    mapping(address => uint256) public userTotalDeposits;
    
    uint256 public totalValueLocked;
    uint256 public constant ESCROW_FEE = 10; // 0.1% in basis points
    uint256 public constant EARLY_RELEASE_FEE = 100; // 1% for early release
    uint256 public constant MIN_DEPOSIT_AMOUNT = 1000000 * 10**18; // 1M KRW minimum
    uint256 public constant MAX_DEPOSIT_AMOUNT = 10000000000 * 10**18; // 10B KRW maximum
    
    struct Deposit {
        uint256 id;
        address tenant;
        address landlord;
        uint256 amount;
        uint256 startDate;
        uint256 endDate;
        string propertyId;
        string propertyAddress;
        DepositStatus status;
        uint256 investmentPoolShare;
        uint256 createdAt;
        uint256 releasedAt;
        bool isInvestmentEnabled;
    }
    
    enum DepositStatus {
        Active,
        Completed,
        Disputed,
        Refunded,
        EarlyReleased
    }
    
    // Events
    event DepositCreated(
        uint256 indexed depositId,
        address indexed tenant,
        address indexed landlord,
        uint256 amount,
        string propertyId
    );
    
    event DepositReleased(
        uint256 indexed depositId,
        address indexed tenant,
        uint256 amount,
        uint256 fee
    );
    
    event DepositDisputed(
        uint256 indexed depositId,
        address indexed disputer,
        string reason
    );
    
    event InvestmentEnabled(
        uint256 indexed depositId,
        uint256 sharePercentage
    );
    
    event EmergencyWithdrawal(
        uint256 indexed depositId,
        address indexed recipient,
        uint256 amount
    );

    // Modifiers
    modifier onlyTenant(uint256 depositId) {
        require(deposits[depositId].tenant == msg.sender, "Not authorized: only tenant");
        _;
    }
    
    modifier onlyLandlord(uint256 depositId) {
        require(deposits[depositId].landlord == msg.sender, "Not authorized: only landlord");
        _;
    }
    
    modifier onlyParties(uint256 depositId) {
        require(
            deposits[depositId].tenant == msg.sender || 
            deposits[depositId].landlord == msg.sender,
            "Not authorized: only parties"
        );
        _;
    }
    
    modifier depositExists(uint256 depositId) {
        require(depositId <= _depositCounter.current() && depositId > 0, "Deposit does not exist");
        _;
    }
    
    modifier validDepositAmount() {
        require(
            msg.value >= MIN_DEPOSIT_AMOUNT && msg.value <= MAX_DEPOSIT_AMOUNT,
            "Invalid deposit amount"
        );
        _;
    }

    constructor(
        address _propertyOracle,
        address _complianceModule,
        address _investmentPool
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        propertyOracle = IPropertyOracle(_propertyOracle);
        complianceModule = IComplianceModule(_complianceModule);
        investmentPool = IInvestmentPool(_investmentPool);
    }

    /**
     * @dev Create a new Jeonse deposit
     * @param landlord Address of the landlord
     * @param endDate Contract end date (timestamp)
     * @param propertyId Unique property identifier
     * @param propertyAddress Full property address
     * @param enableInvestment Whether to enable fractional investment
     */
    function createDeposit(
        address landlord,
        uint256 endDate,
        string calldata propertyId,
        string calldata propertyAddress,
        bool enableInvestment
    ) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validDepositAmount 
    {
        require(landlord != address(0), "Invalid landlord address");
        require(landlord != msg.sender, "Tenant cannot be landlord");
        require(endDate > block.timestamp + 365 days, "Minimum 1 year contract");
        require(endDate <= block.timestamp + 3650 days, "Maximum 10 year contract");
        require(bytes(propertyId).length > 0, "Property ID required");
        require(bytes(propertyAddress).length > 0, "Property address required");
        
        // Verify compliance for both parties
        require(complianceModule.checkCompliance(msg.sender), "Tenant not compliant");
        require(complianceModule.checkCompliance(landlord), "Landlord not compliant");
        
        // Verify property ownership
        require(
            propertyOracle.verifyPropertyOwnership(propertyId, landlord),
            "Property ownership verification failed"
        );
        
        _depositCounter.increment();
        uint256 depositId = _depositCounter.current();
        
        deposits[depositId] = Deposit({
            id: depositId,
            tenant: msg.sender,
            landlord: landlord,
            amount: msg.value,
            startDate: block.timestamp,
            endDate: endDate,
            propertyId: propertyId,
            propertyAddress: propertyAddress,
            status: DepositStatus.Active,
            investmentPoolShare: 0,
            createdAt: block.timestamp,
            releasedAt: 0,
            isInvestmentEnabled: enableInvestment
        });
        
        userDeposits[msg.sender].push(depositId);
        userDeposits[landlord].push(depositId);
        userTotalDeposits[msg.sender] += msg.value;
        totalValueLocked += msg.value;
        
        if (enableInvestment) {
            _enableInvestment(depositId);
        }
        
        emit DepositCreated(depositId, msg.sender, landlord, msg.value, propertyId);
    }

    /**
     * @dev Release deposit back to tenant after contract ends
     * @param depositId The deposit ID to release
     */
    function releaseDeposit(uint256 depositId) 
        external 
        nonReentrant 
        whenNotPaused 
        depositExists(depositId) 
        onlyLandlord(depositId) 
    {
        Deposit storage deposit = deposits[depositId];
        require(deposit.status == DepositStatus.Active, "Deposit not active");
        require(block.timestamp >= deposit.endDate, "Contract not yet ended");
        
        uint256 fee = (deposit.amount * ESCROW_FEE) / 10000;
        uint256 releaseAmount = deposit.amount - fee;
        
        deposit.status = DepositStatus.Completed;
        deposit.releasedAt = block.timestamp;
        
        totalValueLocked -= deposit.amount;
        userTotalDeposits[deposit.tenant] -= deposit.amount;
        
        // Handle investment pool withdrawal if applicable
        if (deposit.isInvestmentEnabled && deposit.investmentPoolShare > 0) {
            investmentPool.withdrawFromDeposit(depositId, deposit.investmentPoolShare);
        }
        
        // Transfer funds
        (bool success, ) = payable(deposit.tenant).call{value: releaseAmount}("");
        require(success, "Transfer to tenant failed");
        
        emit DepositReleased(depositId, deposit.tenant, releaseAmount, fee);
    }

    /**
     * @dev Early release of deposit (with penalty)
     * @param depositId The deposit ID to release early
     */
    function earlyReleaseDeposit(uint256 depositId) 
        external 
        nonReentrant 
        whenNotPaused 
        depositExists(depositId) 
        onlyParties(depositId) 
    {
        Deposit storage deposit = deposits[depositId];
        require(deposit.status == DepositStatus.Active, "Deposit not active");
        require(block.timestamp < deposit.endDate, "Use regular release");
        
        uint256 earlyFee = (deposit.amount * EARLY_RELEASE_FEE) / 10000;
        uint256 escrowFee = (deposit.amount * ESCROW_FEE) / 10000;
        uint256 totalFee = earlyFee + escrowFee;
        uint256 releaseAmount = deposit.amount - totalFee;
        
        deposit.status = DepositStatus.EarlyReleased;
        deposit.releasedAt = block.timestamp;
        
        totalValueLocked -= deposit.amount;
        userTotalDeposits[deposit.tenant] -= deposit.amount;
        
        // Handle investment pool withdrawal if applicable
        if (deposit.isInvestmentEnabled && deposit.investmentPoolShare > 0) {
            investmentPool.withdrawFromDeposit(depositId, deposit.investmentPoolShare);
        }
        
        // Transfer funds
        (bool success, ) = payable(deposit.tenant).call{value: releaseAmount}("");
        require(success, "Transfer to tenant failed");
        
        emit DepositReleased(depositId, deposit.tenant, releaseAmount, totalFee);
    }

    /**
     * @dev Initiate dispute for a deposit
     * @param depositId The deposit ID to dispute
     * @param reason Reason for the dispute
     */
    function disputeDeposit(uint256 depositId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        depositExists(depositId) 
        onlyParties(depositId) 
    {
        Deposit storage deposit = deposits[depositId];
        require(deposit.status == DepositStatus.Active, "Deposit not active");
        require(bytes(reason).length > 0, "Dispute reason required");
        
        deposit.status = DepositStatus.Disputed;
        
        emit DepositDisputed(depositId, msg.sender, reason);
    }

    /**
     * @dev Enable fractional investment for a deposit
     * @param depositId The deposit ID to enable investment for
     */
    function _enableInvestment(uint256 depositId) internal {
        Deposit storage deposit = deposits[depositId];
        require(deposit.isInvestmentEnabled, "Investment not enabled for this deposit");
        
        // Enable 20% of deposit for fractional investment
        uint256 investmentShare = (deposit.amount * 20) / 100;
        deposit.investmentPoolShare = investmentShare;
        
        investmentPool.addDepositToPool(depositId, investmentShare);
        
        emit InvestmentEnabled(depositId, 20);
    }

    /**
     * @dev Admin function to resolve disputes
     * @param depositId The disputed deposit ID
     * @param resolution 0 = refund to tenant, 1 = release to tenant, 2 = split
     */
    function resolveDispute(uint256 depositId, uint8 resolution) 
        external 
        onlyRole(ADMIN_ROLE) 
        depositExists(depositId) 
    {
        Deposit storage deposit = deposits[depositId];
        require(deposit.status == DepositStatus.Disputed, "Deposit not disputed");
        
        if (resolution == 0) {
            // Refund to tenant
            deposit.status = DepositStatus.Refunded;
            totalValueLocked -= deposit.amount;
            userTotalDeposits[deposit.tenant] -= deposit.amount;
            
            (bool success, ) = payable(deposit.tenant).call{value: deposit.amount}("");
            require(success, "Refund failed");
        } else if (resolution == 1) {
            // Release to tenant (normal process)
            deposit.status = DepositStatus.Completed;
            uint256 fee = (deposit.amount * ESCROW_FEE) / 10000;
            uint256 releaseAmount = deposit.amount - fee;
            
            totalValueLocked -= deposit.amount;
            userTotalDeposits[deposit.tenant] -= deposit.amount;
            
            (bool success, ) = payable(deposit.tenant).call{value: releaseAmount}("");
            require(success, "Release failed");
        } else if (resolution == 2) {
            // Split between parties (50/50 after fees)
            deposit.status = DepositStatus.Completed;
            uint256 fee = (deposit.amount * ESCROW_FEE) / 10000;
            uint256 splitAmount = (deposit.amount - fee) / 2;
            
            totalValueLocked -= deposit.amount;
            userTotalDeposits[deposit.tenant] -= deposit.amount;
            
            (bool success1, ) = payable(deposit.tenant).call{value: splitAmount}("");
            (bool success2, ) = payable(deposit.landlord).call{value: splitAmount}("");
            require(success1 && success2, "Split transfer failed");
        }
        
        deposit.releasedAt = block.timestamp;
    }

    /**
     * @dev Emergency withdrawal function for admin
     * @param depositId The deposit ID for emergency withdrawal
     * @param recipient Address to receive the funds
     */
    function emergencyWithdraw(uint256 depositId, address recipient) 
        external 
        onlyRole(ADMIN_ROLE) 
        depositExists(depositId) 
    {
        Deposit storage deposit = deposits[depositId];
        require(deposit.status == DepositStatus.Active, "Deposit not active");
        require(recipient != address(0), "Invalid recipient");
        
        uint256 amount = deposit.amount;
        deposit.status = DepositStatus.Refunded;
        deposit.releasedAt = block.timestamp;
        
        totalValueLocked -= amount;
        userTotalDeposits[deposit.tenant] -= amount;
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(depositId, recipient, amount);
    }

    // View functions
    function getDeposit(uint256 depositId) external view returns (Deposit memory) {
        return deposits[depositId];
    }
    
    function getUserDeposits(address user) external view returns (uint256[] memory) {
        return userDeposits[user];
    }
    
    function getTotalDeposits() external view returns (uint256) {
        return _depositCounter.current();
    }
    
    function getDepositsByStatus(DepositStatus status) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 totalDeposits = _depositCounter.current();
        
        // Count deposits with matching status
        for (uint256 i = 1; i <= totalDeposits; i++) {
            if (deposits[i].status == status) {
                count++;
            }
        }
        
        // Create array with matching deposits
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= totalDeposits; i++) {
            if (deposits[i].status == status) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function updatePropertyOracle(address newOracle) external onlyRole(ADMIN_ROLE) {
        require(newOracle != address(0), "Invalid oracle address");
        propertyOracle = IPropertyOracle(newOracle);
    }
    
    function updateComplianceModule(address newModule) external onlyRole(ADMIN_ROLE) {
        require(newModule != address(0), "Invalid module address");
        complianceModule = IComplianceModule(newModule);
    }
    
    function updateInvestmentPool(address newPool) external onlyRole(ADMIN_ROLE) {
        require(newPool != address(0), "Invalid pool address");
        investmentPool = IInvestmentPool(newPool);
    }
    
    // Withdraw accumulated fees
    function withdrawFees() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance - totalValueLocked;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
}
