// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPropertyOracle
 * @dev Interface for Property Oracle contract
 */
interface IPropertyOracle {
    function verifyPropertyOwnership(string calldata propertyId, address owner) external view returns (bool);
    function getProperty(string calldata propertyId) external view returns (
        string memory _propertyId,
        string memory fullAddress,
        address owner,
        uint256 marketValue,
        uint256 lastValuation,
        bool isVerified,
        bool isActive,
        uint256 lastInspection
    );
    function isPropertyVerified(string calldata propertyId) external view returns (bool);
}
