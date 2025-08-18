// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title InvestmentPool
 * @dev Enables fractional investment in Jeonse deposits
 * @author JeonseVault Team
 */
contract InvestmentPool is ERC20, ReentrancyGuard, Pausable, AccessControl {
    using SafeMath for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VAULT_ROLE = keccak256("VAULT_ROLE");
    
    // Investment pool state
    mapping(address => uint256) public userShares;
    mapping(uint256 => DepositPool) public depositPools;
    mapping(address => uint256[]) public userInvestments;
    mapping(uint256 => address[]) public depositInvestors;
    
    uint256 public totalPoolValue;
    uint256 public totalShares;
    uint256 public constant MIN_INVESTMENT = 50000 * 10**18; // 50K KRW minimum
    uint256 public constant MANAGEMENT_FEE = 50; // 0.5% annual management fee
    uint256 public constant PERFORMANCE_FEE = 1000; // 10% performance fee
    
    struct DepositPool {
        uint256 depositId;
        uint256 totalAmount;
        uint256 availableAmount;
        uint256 totalInvested;
        uint256 expectedReturn;
        uint256 actualReturn;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        mapping(address => uint256) investorShares;
    }
    
    struct InvestmentInfo {
        uint256 depositId;
        uint256 amount;
        uint256 shares;
        uint256 investmentDate;
        uint256 expectedReturn;
        bool isActive;
    }
    
    // Events
    event DepositAdded(uint256 indexed depositId, uint256 amount, uint256 expectedReturn);
    event InvestmentMade(address indexed investor, uint256 indexed depositId, uint256 amount, uint256 shares);
    event InvestmentWithdrawn(address indexed investor, uint256 indexed depositId, uint256 amount, uint256 profit);
    event ReturnsDistributed(uint256 indexed depositId, uint256 totalReturns);
    event FeesCollected(uint256 managementFees, uint256 performanceFees);

    constructor() ERC20("JeonseVault Pool Token", "JVP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add a new deposit to the investment pool
     * @param depositId The deposit ID from JeonseVault
     * @param amount Amount available for investment
     */
    function addDepositToPool(uint256 depositId, uint256 amount) 
        external 
        onlyRole(VAULT_ROLE) 
        whenNotPaused 
    {
        require(amount > 0, "Invalid amount");
        require(!depositPools[depositId].isActive, "Deposit already in pool");
        
        DepositPool storage pool = depositPools[depositId];
        pool.depositId = depositId;
        pool.totalAmount = amount;
        pool.availableAmount = amount;
        pool.totalInvested = 0;
        pool.expectedReturn = _calculateExpectedReturn(amount);
        pool.actualReturn = 0;
        pool.startDate = block.timestamp;
        pool.endDate = block.timestamp + 365 days; // 1 year investment period
        pool.isActive = true;
        
        totalPoolValue = totalPoolValue.add(amount);
        
        emit DepositAdded(depositId, amount, pool.expectedReturn);
    }

    /**
     * @dev Invest in a specific deposit pool
     * @param depositId The deposit ID to invest in
     */
    function investInDeposit(uint256 depositId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value >= MIN_INVESTMENT, "Investment below minimum");
        require(depositPools[depositId].isActive, "Deposit pool not active");
        require(depositPools[depositId].availableAmount >= msg.value, "Insufficient available amount");
        
        DepositPool storage pool = depositPools[depositId];
        
        // Calculate shares based on investment amount
        uint256 shares = _calculateShares(msg.value, depositId);
        
        // Update pool state
        pool.availableAmount = pool.availableAmount.sub(msg.value);
        pool.totalInvested = pool.totalInvested.add(msg.value);
        pool.investorShares[msg.sender] = pool.investorShares[msg.sender].add(shares);
        
        // Update user state
        userShares[msg.sender] = userShares[msg.sender].add(shares);
        userInvestments[msg.sender].push(depositId);
        depositInvestors[depositId].push(msg.sender);
        
        // Mint pool tokens
        _mint(msg.sender, shares);
        totalShares = totalShares.add(shares);
        
        emit InvestmentMade(msg.sender, depositId, msg.value, shares);
    }

    /**
     * @dev Withdraw investment from a deposit pool
     * @param depositId The deposit ID to withdraw from
     */
    function withdrawFromDeposit(uint256 depositId, uint256 shareAmount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(shareAmount > 0, "Invalid share amount");
        require(depositPools[depositId].investorShares[msg.sender] >= shareAmount, "Insufficient shares");
        
        DepositPool storage pool = depositPools[depositId];
        require(block.timestamp >= pool.endDate, "Investment period not ended");
        
        // Calculate withdrawal amount including returns
        uint256 withdrawalAmount = _calculateWithdrawalAmount(depositId, shareAmount);
        uint256 profit = withdrawalAmount.sub(shareAmount);
        
        // Update pool state
        pool.investorShares[msg.sender] = pool.investorShares[msg.sender].sub(shareAmount);
        
        // Update user state
        userShares[msg.sender] = userShares[msg.sender].sub(shareAmount);
        
        // Burn pool tokens
        _burn(msg.sender, shareAmount);
        totalShares = totalShares.sub(shareAmount);
        
        // Collect fees
        uint256 managementFee = _calculateManagementFee(shareAmount);
        uint256 performanceFee = _calculatePerformanceFee(profit);
        uint256 netAmount = withdrawalAmount.sub(managementFee).sub(performanceFee);
        
        // Transfer funds
        (bool success, ) = payable(msg.sender).call{value: netAmount}("");
        require(success, "Withdrawal transfer failed");
        
        emit InvestmentWithdrawn(msg.sender, depositId, netAmount, profit);
    }

    /**
     * @dev Distribute returns to all investors in a deposit pool
     * @param depositId The deposit ID to distribute returns for
     * @param totalReturns The total returns to distribute
     */
    function distributeReturns(uint256 depositId, uint256 totalReturns) 
        external 
        payable 
        onlyRole(VAULT_ROLE) 
        whenNotPaused 
    {
        require(msg.value == totalReturns, "Incorrect return amount");
        require(depositPools[depositId].isActive, "Deposit pool not active");
        
        DepositPool storage pool = depositPools[depositId];
        pool.actualReturn = totalReturns;
        
        emit ReturnsDistributed(depositId, totalReturns);
    }

    /**
     * @dev Calculate expected returns for a deposit amount
     * @param amount The deposit amount
     * @return Expected annual return (5-8% APY)
     */
    function _calculateExpectedReturn(uint256 amount) internal pure returns (uint256) {
        // Conservative 6% annual return estimate
        return amount.mul(6).div(100);
    }

    /**
     * @dev Calculate shares for an investment
     * @param amount Investment amount
     * @param depositId Deposit ID
     * @return Number of shares
     */
    function _calculateShares(uint256 amount, uint256 depositId) internal view returns (uint256) {
        DepositPool storage pool = depositPools[depositId];
        if (pool.totalInvested == 0) {
            return amount; // 1:1 ratio for first investor
        }
        
        // Calculate shares based on proportion of total pool
        return amount.mul(pool.totalAmount).div(pool.availableAmount.add(pool.totalInvested));
    }

    /**
     * @dev Calculate withdrawal amount including returns
     * @param depositId Deposit ID
     * @param shareAmount Shares to withdraw
     * @return Total withdrawal amount
     */
    function _calculateWithdrawalAmount(uint256 depositId, uint256 shareAmount) 
        internal 
        view 
        returns (uint256) 
    {
        DepositPool storage pool = depositPools[depositId];
        
        // Calculate base amount
        uint256 baseAmount = shareAmount;
        
        // Calculate proportional returns
        uint256 userProportion = shareAmount.mul(10000).div(pool.totalInvested);
        uint256 userReturns = pool.actualReturn.mul(userProportion).div(10000);
        
        return baseAmount.add(userReturns);
    }

    /**
     * @dev Calculate management fee (0.5% annual)
     * @param amount Amount to calculate fee on
     * @return Management fee amount
     */
    function _calculateManagementFee(uint256 amount) internal pure returns (uint256) {
        return amount.mul(MANAGEMENT_FEE).div(10000);
    }

    /**
     * @dev Calculate performance fee (10% of profits)
     * @param profit Profit amount
     * @return Performance fee amount
     */
    function _calculatePerformanceFee(uint256 profit) internal pure returns (uint256) {
        return profit.mul(PERFORMANCE_FEE).div(10000);
    }

    // View functions
    function getDepositPool(uint256 depositId) external view returns (
        uint256 totalAmount,
        uint256 availableAmount,
        uint256 totalInvested,
        uint256 expectedReturn,
        uint256 actualReturn,
        uint256 startDate,
        uint256 endDate,
        bool isActive
    ) {
        DepositPool storage pool = depositPools[depositId];
        return (
            pool.totalAmount,
            pool.availableAmount,
            pool.totalInvested,
            pool.expectedReturn,
            pool.actualReturn,
            pool.startDate,
            pool.endDate,
            pool.isActive
        );
    }

    function getUserInvestments(address user) external view returns (uint256[] memory) {
        return userInvestments[user];
    }

    function getUserSharesInDeposit(address user, uint256 depositId) external view returns (uint256) {
        return depositPools[depositId].investorShares[user];
    }

    function getDepositInvestors(uint256 depositId) external view returns (address[] memory) {
        return depositInvestors[depositId];
    }

    function getTotalPoolStats() external view returns (
        uint256 _totalPoolValue,
        uint256 _totalShares,
        uint256 _totalInvestors
    ) {
        return (totalPoolValue, totalShares, totalSupply());
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function collectFees() external onlyRole(ADMIN_ROLE) {
        // Collect accumulated management and performance fees
        uint256 feeBalance = address(this).balance.sub(totalPoolValue);
        require(feeBalance > 0, "No fees to collect");
        
        (bool success, ) = payable(msg.sender).call{value: feeBalance}("");
        require(success, "Fee collection failed");
        
        emit FeesCollected(feeBalance, 0);
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Allow contract to receive Ether
    receive() external payable {}
}
