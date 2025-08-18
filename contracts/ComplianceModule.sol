// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplianceModule
 * @dev KYC/AML compliance and real-name verification for Korean users
 * @author JeonseVault Team
 */
contract ComplianceModule is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    
    // User compliance data
    struct UserCompliance {
        address userAddress;
        string realName;
        string identificationNumber; // Hashed Korean ID number
        string phoneNumber;
        string bankAccount;
        bool isVerified;
        bool isActive;
        uint256 verificationDate;
        uint256 lastUpdate;
        ComplianceLevel level;
        uint256 transactionLimit;
        uint256 monthlyLimit;
        uint256 monthlySpent;
        uint256 lastMonthReset;
    }
    
    enum ComplianceLevel {
        None,
        Basic,      // Basic KYC - up to 10M KRW
        Standard,   // Standard KYC - up to 100M KRW  
        Premium,    // Premium KYC - up to 1B KRW
        Corporate   // Corporate account - up to 10B KRW
    }
    
    // Storage
    mapping(address => UserCompliance) public userCompliance;
    mapping(string => address) public phoneToAddress;
    mapping(string => address) public idToAddress;
    address[] public verifiedUsers;
    
    // Compliance settings
    uint256 public constant VERIFICATION_VALIDITY_PERIOD = 365 days; // 1 year
    uint256 public constant BASIC_LIMIT = 10000000 * 10**18; // 10M KRW
    uint256 public constant STANDARD_LIMIT = 100000000 * 10**18; // 100M KRW
    uint256 public constant PREMIUM_LIMIT = 1000000000 * 10**18; // 1B KRW
    uint256 public constant CORPORATE_LIMIT = 10000000000 * 10**18; // 10B KRW
    
    // Suspicious activity tracking
    mapping(address => uint256) public suspiciousActivityCount;
    mapping(address => bool) public blacklistedUsers;
    mapping(address => uint256) public lastTransactionTime;
    
    // Events
    event UserVerified(
        address indexed user,
        string realName,
        ComplianceLevel level,
        uint256 timestamp
    );
    
    event ComplianceLevelUpdated(
        address indexed user,
        ComplianceLevel oldLevel,
        ComplianceLevel newLevel
    );
    
    event SuspiciousActivityReported(
        address indexed user,
        string reason,
        uint256 timestamp
    );
    
    event UserBlacklisted(
        address indexed user,
        string reason,
        uint256 timestamp
    );
    
    event TransactionLimitExceeded(
        address indexed user,
        uint256 attemptedAmount,
        uint256 limit
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
    }

    /**
     * @dev Verify user with KYC information
     * @param user User address to verify
     * @param realName User's real name (Korean)
     * @param identificationNumber Hashed Korean ID number
     * @param phoneNumber Korean phone number
     * @param bankAccount Bank account information
     * @param level Compliance level to assign
     */
    function verifyUser(
        address user,
        string calldata realName,
        string calldata identificationNumber,
        string calldata phoneNumber,
        string calldata bankAccount,
        ComplianceLevel level
    ) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(bytes(realName).length > 0, "Real name required");
        require(bytes(identificationNumber).length > 0, "ID number required");
        require(bytes(phoneNumber).length > 0, "Phone number required");
        require(level != ComplianceLevel.None, "Invalid compliance level");
        
        // Check for duplicates
        require(phoneToAddress[phoneNumber] == address(0), "Phone number already registered");
        require(idToAddress[identificationNumber] == address(0), "ID already registered");
        require(!userCompliance[user].isVerified, "User already verified");
        
        uint256 transactionLimit = _getTransactionLimit(level);
        
        userCompliance[user] = UserCompliance({
            userAddress: user,
            realName: realName,
            identificationNumber: identificationNumber,
            phoneNumber: phoneNumber,
            bankAccount: bankAccount,
            isVerified: true,
            isActive: true,
            verificationDate: block.timestamp,
            lastUpdate: block.timestamp,
            level: level,
            transactionLimit: transactionLimit,
            monthlyLimit: transactionLimit * 10, // 10x transaction limit for monthly
            monthlySpent: 0,
            lastMonthReset: block.timestamp
        });
        
        // Update mappings
        phoneToAddress[phoneNumber] = user;
        idToAddress[identificationNumber] = user;
        verifiedUsers.push(user);
        
        emit UserVerified(user, realName, level, block.timestamp);
    }

    /**
     * @dev Check if user is compliant for transactions
     * @param user User address to check
     * @return True if user is compliant
     */
    function checkCompliance(address user) external view returns (bool) {
        UserCompliance storage compliance = userCompliance[user];
        
        // Basic checks
        if (!compliance.isVerified || !compliance.isActive) {
            return false;
        }
        
        // Check if blacklisted
        if (blacklistedUsers[user]) {
            return false;
        }
        
        // Check verification validity
        if (block.timestamp > compliance.verificationDate + VERIFICATION_VALIDITY_PERIOD) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Check transaction limits before processing
     * @param user User address
     * @param amount Transaction amount
     * @return True if within limits
     */
    function checkTransactionLimits(address user, uint256 amount) 
        external 
        returns (bool) 
    {
        UserCompliance storage compliance = userCompliance[user];
        
        if (!this.checkCompliance(user)) {
            return false;
        }
        
        // Check single transaction limit
        if (amount > compliance.transactionLimit) {
            emit TransactionLimitExceeded(user, amount, compliance.transactionLimit);
            return false;
        }
        
        // Reset monthly spending if needed
        if (block.timestamp >= compliance.lastMonthReset + 30 days) {
            compliance.monthlySpent = 0;
            compliance.lastMonthReset = block.timestamp;
        }
        
        // Check monthly limit
        if (compliance.monthlySpent + amount > compliance.monthlyLimit) {
            emit TransactionLimitExceeded(user, amount, compliance.monthlyLimit);
            return false;
        }
        
        // Update monthly spending
        compliance.monthlySpent += amount;
        compliance.lastUpdate = block.timestamp;
        lastTransactionTime[user] = block.timestamp;
        
        return true;
    }

    /**
     * @dev Update user's compliance level
     * @param user User address
     * @param newLevel New compliance level
     */
    function updateComplianceLevel(address user, ComplianceLevel newLevel) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
        whenNotPaused 
    {
        require(userCompliance[user].isVerified, "User not verified");
        require(newLevel != ComplianceLevel.None, "Invalid level");
        
        UserCompliance storage compliance = userCompliance[user];
        ComplianceLevel oldLevel = compliance.level;
        
        compliance.level = newLevel;
        compliance.transactionLimit = _getTransactionLimit(newLevel);
        compliance.monthlyLimit = compliance.transactionLimit * 10;
        compliance.lastUpdate = block.timestamp;
        
        emit ComplianceLevelUpdated(user, oldLevel, newLevel);
    }

    /**
     * @dev Report suspicious activity
     * @param user User address
     * @param reason Reason for suspicion
     */
    function reportSuspiciousActivity(address user, string calldata reason) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
        whenNotPaused 
    {
        require(userCompliance[user].isVerified, "User not verified");
        require(bytes(reason).length > 0, "Reason required");
        
        suspiciousActivityCount[user]++;
        
        // Auto-blacklist after 3 suspicious activities
        if (suspiciousActivityCount[user] >= 3) {
            blacklistedUsers[user] = true;
            userCompliance[user].isActive = false;
            
            emit UserBlacklisted(user, "Multiple suspicious activities", block.timestamp);
        }
        
        emit SuspiciousActivityReported(user, reason, block.timestamp);
    }

    /**
     * @dev Blacklist a user
     * @param user User address to blacklist
     * @param reason Reason for blacklisting
     */
    function blacklistUser(address user, string calldata reason) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
        whenNotPaused 
    {
        require(userCompliance[user].isVerified, "User not verified");
        require(bytes(reason).length > 0, "Reason required");
        
        blacklistedUsers[user] = true;
        userCompliance[user].isActive = false;
        userCompliance[user].lastUpdate = block.timestamp;
        
        emit UserBlacklisted(user, reason, block.timestamp);
    }

    /**
     * @dev Remove user from blacklist
     * @param user User address to whitelist
     */
    function removeFromBlacklist(address user) 
        external 
        onlyRole(ADMIN_ROLE) 
        whenNotPaused 
    {
        require(blacklistedUsers[user], "User not blacklisted");
        
        blacklistedUsers[user] = false;
        userCompliance[user].isActive = true;
        userCompliance[user].lastUpdate = block.timestamp;
        suspiciousActivityCount[user] = 0; // Reset suspicious activity count
    }

    /**
     * @dev Get transaction limit for compliance level
     * @param level Compliance level
     * @return Transaction limit in wei
     */
    function _getTransactionLimit(ComplianceLevel level) internal pure returns (uint256) {
        if (level == ComplianceLevel.Basic) {
            return BASIC_LIMIT;
        } else if (level == ComplianceLevel.Standard) {
            return STANDARD_LIMIT;
        } else if (level == ComplianceLevel.Premium) {
            return PREMIUM_LIMIT;
        } else if (level == ComplianceLevel.Corporate) {
            return CORPORATE_LIMIT;
        }
        return 0;
    }

    // View functions
    function getUserCompliance(address user) 
        external 
        view 
        returns (UserCompliance memory) 
    {
        return userCompliance[user];
    }

    function getVerifiedUserCount() external view returns (uint256) {
        return verifiedUsers.length;
    }

    function getAllVerifiedUsers() external view returns (address[] memory) {
        return verifiedUsers;
    }

    function getUserByPhone(string calldata phoneNumber) 
        external 
        view 
        returns (address) 
    {
        return phoneToAddress[phoneNumber];
    }

    function getUserById(string calldata identificationNumber) 
        external 
        view 
        returns (address) 
    {
        return idToAddress[identificationNumber];
    }

    function isUserVerified(address user) external view returns (bool) {
        return userCompliance[user].isVerified && userCompliance[user].isActive;
    }

    function isUserBlacklisted(address user) external view returns (bool) {
        return blacklistedUsers[user];
    }

    function getUserTransactionLimit(address user) external view returns (uint256) {
        return userCompliance[user].transactionLimit;
    }

    function getUserMonthlyLimit(address user) external view returns (uint256) {
        return userCompliance[user].monthlyLimit;
    }

    function getUserMonthlySpent(address user) external view returns (uint256) {
        UserCompliance storage compliance = userCompliance[user];
        
        // Reset if new month
        if (block.timestamp >= compliance.lastMonthReset + 30 days) {
            return 0;
        }
        
        return compliance.monthlySpent;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function deactivateUser(address user) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
    {
        require(userCompliance[user].isVerified, "User not verified");
        userCompliance[user].isActive = false;
        userCompliance[user].lastUpdate = block.timestamp;
    }

    function reactivateUser(address user) 
        external 
        onlyRole(COMPLIANCE_OFFICER_ROLE) 
    {
        require(userCompliance[user].isVerified, "User not verified");
        require(!blacklistedUsers[user], "User blacklisted");
        
        userCompliance[user].isActive = true;
        userCompliance[user].lastUpdate = block.timestamp;
    }

    function extendVerification(address user) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        require(userCompliance[user].isVerified, "User not verified");
        
        userCompliance[user].verificationDate = block.timestamp;
        userCompliance[user].lastUpdate = block.timestamp;
    }

    // Batch operations
    function batchVerifyUsers(
        address[] calldata users,
        string[] calldata realNames,
        string[] calldata idNumbers,
        string[] calldata phoneNumbers,
        string[] calldata bankAccounts,
        ComplianceLevel[] calldata levels
    ) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(
            users.length == realNames.length &&
            users.length == idNumbers.length &&
            users.length == phoneNumbers.length &&
            users.length == bankAccounts.length &&
            users.length == levels.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < users.length; i++) {
            _verifyUserInternal(
                users[i],
                realNames[i],
                idNumbers[i],
                phoneNumbers[i],
                bankAccounts[i],
                levels[i]
            );
        }
    }

    function _verifyUserInternal(
        address user,
        string memory realName,
        string memory identificationNumber,
        string memory phoneNumber,
        string memory bankAccount,
        ComplianceLevel level
    ) internal {
        if (user != address(0) && 
            !userCompliance[user].isVerified &&
            phoneToAddress[phoneNumber] == address(0) &&
            idToAddress[identificationNumber] == address(0)) {
            
            uint256 transactionLimit = _getTransactionLimit(level);
            
            userCompliance[user] = UserCompliance({
                userAddress: user,
                realName: realName,
                identificationNumber: identificationNumber,
                phoneNumber: phoneNumber,
                bankAccount: bankAccount,
                isVerified: true,
                isActive: true,
                verificationDate: block.timestamp,
                lastUpdate: block.timestamp,
                level: level,
                transactionLimit: transactionLimit,
                monthlyLimit: transactionLimit * 10,
                monthlySpent: 0,
                lastMonthReset: block.timestamp
            });
            
            phoneToAddress[phoneNumber] = user;
            idToAddress[identificationNumber] = user;
            verifiedUsers.push(user);
            
            emit UserVerified(user, realName, level, block.timestamp);
        }
    }
}
