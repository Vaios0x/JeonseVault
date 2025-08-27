// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IInvestmentPool
 * @dev Interface for Investment Pool contract
 */
interface IInvestmentPool {
    // Core investment functions
    function addDepositToPool(uint256 depositId, uint256 amount) external;
    function investInDeposit(uint256 depositId) external payable;
    function withdrawFromDeposit(uint256 depositId, uint256 shareAmount) external;
    function distributeReturns(uint256 depositId, uint256 totalReturns) external payable;
    
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
    );
    
    function getUserInvestments(address user) external view returns (uint256[] memory);
    function getUserSharesInDeposit(address user, uint256 depositId) external view returns (uint256);
    function getDepositInvestors(uint256 depositId) external view returns (address[] memory);
    function getTotalPoolStats() external view returns (
        uint256 totalPoolValue,
        uint256 totalShares,
        uint256 totalInvestors
    );
    
    // ERC20 functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    // Admin functions
    function pause() external;
    function unpause() external;
    function collectFees() external;
    function emergencyWithdraw() external;
    
    // Events
    event DepositAdded(uint256 indexed depositId, uint256 amount, uint256 expectedReturn);
    event InvestmentMade(address indexed investor, uint256 indexed depositId, uint256 amount, uint256 shares);
    event InvestmentWithdrawn(address indexed investor, uint256 indexed depositId, uint256 amount, uint256 profit);
    event ReturnsDistributed(uint256 indexed depositId, uint256 totalReturns);
    event FeesCollected(uint256 managementFees, uint256 performanceFees);
    
    // ERC20 Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
