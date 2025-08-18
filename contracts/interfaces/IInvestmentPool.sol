// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IInvestmentPool
 * @dev Interface for Investment Pool contract
 */
interface IInvestmentPool {
    function addDepositToPool(uint256 depositId, uint256 amount) external;
    function withdrawFromDeposit(uint256 depositId, uint256 shareAmount) external;
    function getDepositPool(uint256 depositId) external view returns (
        uint256 totalAmount,
        uint256 availableAmount,
        uint256 totalInvested,
        uint256 expectedReturn,
        uint256 actualReturn,
        uint256 startDate,
        uint256 endDate,
        bool isActive
    );
}
