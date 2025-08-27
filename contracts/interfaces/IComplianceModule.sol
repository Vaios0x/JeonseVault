// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IComplianceModule
 * @dev Interface for Compliance Module contract
 */
interface IComplianceModule {
    // Core compliance functions
    function checkCompliance(address user) external view returns (bool);
    function checkTransactionLimits(address user, uint256 amount) external returns (bool);
    
    // User verification
    function verifyUser(
        address user,
        string calldata realName,
        string calldata identificationNumber,
        string calldata phoneNumber,
        string calldata bankAccount,
        uint8 level
    ) external;
    
    function updateComplianceLevel(address user, uint8 newLevel) external;
    function extendVerification(address user) external;
    
    // Suspicious activity management
    function reportSuspiciousActivity(address user, string calldata reason) external;
    function blacklistUser(address user, string calldata reason) external;
    function removeFromBlacklist(address user) external;
    
    // View functions
    function getUserCompliance(address user) external view returns (
        address userAddress,
        string memory realName,
        string memory identificationNumber,
        string memory phoneNumber,
        string memory bankAccount,
        bool isVerified,
        bool isActive,
        uint256 verificationDate,
        uint256 lastUpdate,
        uint8 level,
        uint256 transactionLimit,
        uint256 monthlyLimit,
        uint256 monthlySpent,
        uint256 lastMonthReset
    );
    
    function getVerifiedUserCount() external view returns (uint256);
    function getAllVerifiedUsers() external view returns (address[] memory);
    function getUserByPhone(string calldata phoneNumber) external view returns (address);
    function getUserById(string calldata identificationNumber) external view returns (address);
    function isUserVerified(address user) external view returns (bool);
    function isUserBlacklisted(address user) external view returns (bool);
    function getUserTransactionLimit(address user) external view returns (uint256);
    function getUserMonthlyLimit(address user) external view returns (uint256);
    function getUserMonthlySpent(address user) external view returns (uint256);
    
    // Admin functions
    function pause() external;
    function unpause() external;
    function deactivateUser(address user) external;
    function reactivateUser(address user) external;
    
    // Batch operations
    function batchVerifyUsers(
        address[] calldata users,
        string[] calldata realNames,
        string[] calldata idNumbers,
        string[] calldata phoneNumbers,
        string[] calldata bankAccounts,
        uint8[] calldata levels
    ) external;
    
    // Events
    event UserVerified(
        address indexed user,
        string realName,
        uint8 level,
        uint256 timestamp
    );
    
    event ComplianceLevelUpdated(
        address indexed user,
        uint8 oldLevel,
        uint8 newLevel
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
}
