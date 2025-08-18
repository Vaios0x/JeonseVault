// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IComplianceModule
 * @dev Interface for Compliance Module contract
 */
interface IComplianceModule {
    function checkCompliance(address user) external view returns (bool);
    function checkTransactionLimits(address user, uint256 amount) external returns (bool);
    function isUserVerified(address user) external view returns (bool);
    function isUserBlacklisted(address user) external view returns (bool);
    function getUserTransactionLimit(address user) external view returns (uint256);
}
