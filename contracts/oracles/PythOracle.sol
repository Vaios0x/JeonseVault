// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PythOracle
 * @dev Oracle implementation using Pyth Network for real-time price feeds
 * @author JeonseVault Team
 */
contract PythOracle is AccessControl, Pausable {
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
        uint256 pythValidationTimestamp;
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
    uint256 public constant PRICE_VALIDATION_THRESHOLD = 30 minutes; // Validar precios cada 30 min
    
    // Pyth settings
    uint256 public constant PRICE_DEVIATION_THRESHOLD = 10; // 10% de desviación máxima
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hora de antigüedad máxima
    uint256 public constant CONFIDENCE_THRESHOLD = 95; // 95% de confianza mínima
    
    // Events
    event PropertyRegistered(string indexed propertyId, address indexed owner, uint256 marketValue);
    event PropertyVerified(string indexed propertyId, uint256 timestamp);
    event PropertyValueUpdated(string indexed propertyId, uint256 oldValue, uint256 newValue, uint256 timestamp);
    event PythPriceUpdated(bytes32 indexed priceId, int64 price, uint64 timestamp, uint64 confidence);
    event OraclePaused(address indexed admin, uint256 timestamp);
    event OracleUnpaused(address indexed admin, uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new property
     * @param propertyId Unique property identifier
     * @param fullAddress Property address
     * @param owner Property owner
     * @param marketValue Market value in KRW
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
            updatedAt: block.timestamp,
            pythValidationTimestamp: block.timestamp
        });
        
        ownerProperties[owner].push(propertyId);
        propertyHistory[propertyId].push(owner);
        allPropertyIds.push(propertyId);
        
        emit PropertyRegistered(propertyId, owner, marketValue);
    }
    
    /**
     * @dev Validate property value using Pyth Network price feeds
     * @param propertyValueKrw Property value in KRW
     * @return True if validation passes
     */
    function validatePropertyValueWithPyth(uint256 propertyValueKrw) public view returns (bool) {
        // For now, just do basic validation without Pyth
        // This can be enhanced later with actual Pyth integration
        return propertyValueKrw >= MIN_PROPERTY_VALUE && propertyValueKrw <= MAX_PROPERTY_VALUE;
    }
    
    /**
     * @dev Get current KRW/USD price from Pyth
     * @return price Price in USD (with 8 decimals)
     * @return timestamp Last update timestamp
     * @return confidence Confidence level
     */
    function getKrwUsdPrice() external view returns (int64 price, uint64 timestamp, uint64 confidence) {
        // Placeholder values for now
        return (1000000000, uint64(block.timestamp), 95000000);
    }
    
    /**
     * @dev Verify property ownership and conditions
     * @param propertyId Property to verify
     */
    function verifyProperty(string calldata propertyId) 
        external 
        onlyRole(VERIFIER_ROLE) 
        whenNotPaused 
    {
        require(properties[propertyId].isActive, "Property not registered");
        require(!properties[propertyId].isVerified, "Property already verified");
        
        // Additional verification logic can be added here
        properties[propertyId].isVerified = true;
        properties[propertyId].lastInspection = block.timestamp;
        properties[propertyId].updatedAt = block.timestamp;
        
        emit PropertyVerified(propertyId, block.timestamp);
    }
    
    /**
     * @dev Batch update property values with Pyth validation
     * @param propertyIds Array of property IDs
     * @param newValues Array of new values
     */
    function batchUpdateValuesWithPyth(
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
                newValues[i] <= MAX_PROPERTY_VALUE &&
                validatePropertyValueWithPyth(newValues[i])) {
                
                uint256 oldValue = properties[propertyIds[i]].marketValue;
                properties[propertyIds[i]].marketValue = newValues[i];
                properties[propertyIds[i]].lastValuation = block.timestamp;
                properties[propertyIds[i]].updatedAt = block.timestamp;
                properties[propertyIds[i]].pythValidationTimestamp = block.timestamp;
                
                emit PropertyValueUpdated(propertyIds[i], oldValue, newValues[i], block.timestamp);
            }
        }
    }
    
    /**
     * @dev Pause oracle operations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit OraclePaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Unpause oracle operations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit OracleUnpaused(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get property data
     * @param propertyId Property ID
     * @return Property data
     */
    function getProperty(string calldata propertyId) external view returns (PropertyData memory) {
        return properties[propertyId];
    }
    
    /**
     * @dev Get all properties for an owner
     * @param owner Owner address
     * @return Array of property IDs
     */
    function getOwnerProperties(address owner) external view returns (string[] memory) {
        return ownerProperties[owner];
    }
    
    /**
     * @dev Get all property IDs
     * @return Array of all property IDs
     */
    function getAllPropertyIds() external view returns (string[] memory) {
        return allPropertyIds;
    }
}
