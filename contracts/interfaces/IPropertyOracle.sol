// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPropertyOracle
 * @dev Interface for Property Oracle contract
 */
interface IPropertyOracle {
    // Core verification functions
    function verifyPropertyOwnership(string calldata propertyId, address owner) external view returns (bool);
    function verifyProperty(string calldata propertyId) external;
    function isPropertyVerified(string calldata propertyId) external view returns (bool);
    function isValueCurrent(string calldata propertyId) external view returns (bool);
    
    // Property management
    function registerProperty(
        string calldata propertyId,
        string calldata fullAddress,
        address owner,
        uint256 marketValue,
        uint8 propertyType
    ) external;
    
    function updatePropertyValue(string calldata propertyId, uint256 newValue) external;
    function transferOwnership(string calldata propertyId, address newOwner) external;
    function recordInspection(string calldata propertyId) external;
    
    // View functions
    function getProperty(string calldata propertyId) external view returns (
        string memory _propertyId,
        string memory fullAddress,
        address owner,
        uint256 marketValue,
        uint256 lastValuation,
        bool isVerified,
        bool isActive,
        uint256 lastInspection,
        uint8 propertyType,
        uint256 createdAt,
        uint256 updatedAt
    );
    
    function getOwnerProperties(address owner) external view returns (string[] memory);
    function getPropertyHistory(string calldata propertyId) external view returns (address[] memory);
    function getAllProperties() external view returns (string[] memory);
    function getPropertyCount() external view returns (uint256);
    function getVerifiedPropertyCount() external view returns (uint256);
    
    // Admin functions
    function pause() external;
    function unpause() external;
    function deactivateProperty(string calldata propertyId) external;
    function reactivateProperty(string calldata propertyId) external;
    
    // Batch operations
    function batchVerifyProperties(string[] calldata propertyIds) external;
    function batchUpdateValues(string[] calldata propertyIds, uint256[] calldata newValues) external;
    
    // Events
    event PropertyRegistered(
        string indexed propertyId,
        address indexed owner,
        uint256 marketValue,
        uint8 propertyType
    );
    
    event PropertyVerified(
        string indexed propertyId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event PropertyValueUpdated(
        string indexed propertyId,
        uint256 oldValue,
        uint256 newValue,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        string indexed propertyId,
        address indexed oldOwner,
        address indexed newOwner
    );
    
    event PropertyInspected(
        string indexed propertyId,
        address indexed inspector,
        uint256 timestamp
    );
}
