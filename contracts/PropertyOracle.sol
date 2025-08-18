// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PropertyOracle
 * @dev Verify property conditions and ownership for Korean real estate
 * @author JeonseVault Team
 */
contract PropertyOracle is AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Property data structure
    struct PropertyData {
        string propertyId;
        string fullAddress;
        address owner;
        uint256 marketValue;
        uint256 lastValuation;
        bool isVerified;
        bool isActive;
        uint256 lastInspection;
        PropertyType propertyType;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    enum PropertyType {
        Apartment,
        House,
        Officetel,
        Villa,
        Commercial
    }
    
    // Storage
    mapping(string => PropertyData) public properties;
    mapping(address => string[]) public ownerProperties;
    mapping(string => address[]) public propertyHistory;
    string[] public allPropertyIds;
    
    // Verification settings
    uint256 public constant VERIFICATION_VALIDITY_PERIOD = 180 days; // 6 months
    uint256 public constant VALUATION_VALIDITY_PERIOD = 365 days; // 1 year
    uint256 public constant MIN_PROPERTY_VALUE = 100000000 * 10**18; // 100M KRW
    uint256 public constant MAX_PROPERTY_VALUE = 50000000000 * 10**18; // 50B KRW
    
    // Events
    event PropertyRegistered(
        string indexed propertyId,
        address indexed owner,
        uint256 marketValue,
        PropertyType propertyType
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

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Register a new property in the system
     * @param propertyId Unique property identifier (Korean address-based)
     * @param fullAddress Complete property address
     * @param owner Property owner address
     * @param marketValue Current market value in KRW
     * @param propertyType Type of property
     */
    function registerProperty(
        string calldata propertyId,
        string calldata fullAddress,
        address owner,
        uint256 marketValue,
        PropertyType propertyType
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
    {
        require(bytes(propertyId).length > 0, "Property ID required");
        require(bytes(fullAddress).length > 0, "Address required");
        require(owner != address(0), "Invalid owner address");
        require(
            marketValue >= MIN_PROPERTY_VALUE && marketValue <= MAX_PROPERTY_VALUE,
            "Invalid property value"
        );
        require(!properties[propertyId].isActive, "Property already registered");
        
        properties[propertyId] = PropertyData({
            propertyId: propertyId,
            fullAddress: fullAddress,
            owner: owner,
            marketValue: marketValue,
            lastValuation: block.timestamp,
            isVerified: false,
            isActive: true,
            lastInspection: 0,
            propertyType: propertyType,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        ownerProperties[owner].push(propertyId);
        propertyHistory[propertyId].push(owner);
        allPropertyIds.push(propertyId);
        
        emit PropertyRegistered(propertyId, owner, marketValue, propertyType);
    }

    /**
     * @dev Verify property ownership and conditions
     * @param propertyId Property to verify
     * @param owner Expected owner address
     * @return True if verification successful
     */
    function verifyPropertyOwnership(string calldata propertyId, address owner) 
        external 
        view 
        returns (bool) 
    {
        PropertyData storage property = properties[propertyId];
        
        // Check if property exists and is active
        if (!property.isActive) {
            return false;
        }
        
        // Check ownership
        if (property.owner != owner) {
            return false;
        }
        
        // Check if verification is still valid
        if (property.isVerified && 
            block.timestamp <= property.lastInspection + VERIFICATION_VALIDITY_PERIOD) {
            return true;
        }
        
        // If not recently verified, require manual verification
        return property.isVerified;
    }

    /**
     * @dev Verify property through physical inspection
     * @param propertyId Property to verify
     */
    function verifyProperty(string calldata propertyId) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(properties[propertyId].isActive, "Property not registered");
        
        PropertyData storage property = properties[propertyId];
        property.isVerified = true;
        property.lastInspection = block.timestamp;
        property.updatedAt = block.timestamp;
        
        emit PropertyVerified(propertyId, msg.sender, block.timestamp);
    }

    /**
     * @dev Update property market value
     * @param propertyId Property to update
     * @param newValue New market value
     */
    function updatePropertyValue(string calldata propertyId, uint256 newValue) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
    {
        require(properties[propertyId].isActive, "Property not registered");
        require(
            newValue >= MIN_PROPERTY_VALUE && newValue <= MAX_PROPERTY_VALUE,
            "Invalid property value"
        );
        
        PropertyData storage property = properties[propertyId];
        uint256 oldValue = property.marketValue;
        
        property.marketValue = newValue;
        property.lastValuation = block.timestamp;
        property.updatedAt = block.timestamp;
        
        emit PropertyValueUpdated(propertyId, oldValue, newValue, block.timestamp);
    }

    /**
     * @dev Transfer property ownership
     * @param propertyId Property to transfer
     * @param newOwner New owner address
     */
    function transferOwnership(string calldata propertyId, address newOwner) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
    {
        require(properties[propertyId].isActive, "Property not registered");
        require(newOwner != address(0), "Invalid new owner");
        
        PropertyData storage property = properties[propertyId];
        address oldOwner = property.owner;
        
        // Update property owner
        property.owner = newOwner;
        property.updatedAt = block.timestamp;
        
        // Update owner mappings
        ownerProperties[newOwner].push(propertyId);
        propertyHistory[propertyId].push(newOwner);
        
        // Remove from old owner's list
        _removeFromOwnerProperties(oldOwner, propertyId);
        
        emit OwnershipTransferred(propertyId, oldOwner, newOwner);
    }

    /**
     * @dev Record property inspection
     * @param propertyId Property inspected
     */
    function recordInspection(string calldata propertyId) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(properties[propertyId].isActive, "Property not registered");
        
        PropertyData storage property = properties[propertyId];
        property.lastInspection = block.timestamp;
        property.updatedAt = block.timestamp;
        
        emit PropertyInspected(propertyId, msg.sender, block.timestamp);
    }

    /**
     * @dev Remove property from owner's list
     * @param owner Owner address
     * @param propertyId Property to remove
     */
    function _removeFromOwnerProperties(address owner, string memory propertyId) internal {
        string[] storage ownerProps = ownerProperties[owner];
        for (uint256 i = 0; i < ownerProps.length; i++) {
            if (keccak256(bytes(ownerProps[i])) == keccak256(bytes(propertyId))) {
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
    }

    // View functions
    function getProperty(string calldata propertyId) 
        external 
        view 
        returns (PropertyData memory) 
    {
        return properties[propertyId];
    }

    function getOwnerProperties(address owner) 
        external 
        view 
        returns (string[] memory) 
    {
        return ownerProperties[owner];
    }

    function getPropertyHistory(string calldata propertyId) 
        external 
        view 
        returns (address[] memory) 
    {
        return propertyHistory[propertyId];
    }

    function getAllProperties() 
        external 
        view 
        returns (string[] memory) 
    {
        return allPropertyIds;
    }

    function isPropertyVerified(string calldata propertyId) 
        external 
        view 
        returns (bool) 
    {
        PropertyData storage property = properties[propertyId];
        return property.isVerified && 
               property.isActive &&
               block.timestamp <= property.lastInspection + VERIFICATION_VALIDITY_PERIOD;
    }

    function isValueCurrent(string calldata propertyId) 
        external 
        view 
        returns (bool) 
    {
        PropertyData storage property = properties[propertyId];
        return property.isActive &&
               block.timestamp <= property.lastValuation + VALUATION_VALIDITY_PERIOD;
    }

    function getPropertyCount() external view returns (uint256) {
        return allPropertyIds.length;
    }

    function getVerifiedPropertyCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allPropertyIds.length; i++) {
            if (properties[allPropertyIds[i]].isVerified && 
                properties[allPropertyIds[i]].isActive) {
                count++;
            }
        }
        return count;
    }

    // Admin functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function deactivateProperty(string calldata propertyId) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(properties[propertyId].isActive, "Property not active");
        properties[propertyId].isActive = false;
        properties[propertyId].updatedAt = block.timestamp;
    }

    function reactivateProperty(string calldata propertyId) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(!properties[propertyId].isActive, "Property already active");
        require(bytes(properties[propertyId].propertyId).length > 0, "Property not registered");
        
        properties[propertyId].isActive = true;
        properties[propertyId].updatedAt = block.timestamp;
    }

    // Batch operations for efficiency
    function batchVerifyProperties(string[] calldata propertyIds) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        for (uint256 i = 0; i < propertyIds.length; i++) {
            if (properties[propertyIds[i]].isActive) {
                properties[propertyIds[i]].isVerified = true;
                properties[propertyIds[i]].lastInspection = block.timestamp;
                properties[propertyIds[i]].updatedAt = block.timestamp;
                
                emit PropertyVerified(propertyIds[i], msg.sender, block.timestamp);
            }
        }
    }

    function batchUpdateValues(
        string[] calldata propertyIds, 
        uint256[] calldata newValues
    ) 
        external 
        onlyRole(ORACLE_ROLE) 
        whenNotPaused 
    {
        require(propertyIds.length == newValues.length, "Array length mismatch");
        
        for (uint256 i = 0; i < propertyIds.length; i++) {
            if (properties[propertyIds[i]].isActive && 
                newValues[i] >= MIN_PROPERTY_VALUE && 
                newValues[i] <= MAX_PROPERTY_VALUE) {
                
                uint256 oldValue = properties[propertyIds[i]].marketValue;
                properties[propertyIds[i]].marketValue = newValues[i];
                properties[propertyIds[i]].lastValuation = block.timestamp;
                properties[propertyIds[i]].updatedAt = block.timestamp;
                
                emit PropertyValueUpdated(propertyIds[i], oldValue, newValues[i], block.timestamp);
            }
        }
    }
}
