// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();

/// @title A contract for funding a project
/// @author Great Actor
/// @notice You can use this contract for only the most basic simulation
contract FundMe {
    // Type declarations
    using PriceConverter for uint256;

    // State variables
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;
    address public immutable i_owner;
    AggregatorV3Interface public immutable i_priceFeed;

    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    // Modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeed) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    function fund() public payable {
        console.log(" msg val ", msg.value);
        console.log(" tototal ", msg.value.getConversionRate(i_priceFeed));
        require(msg.value.getConversionRate(i_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        addressToAmountFunded[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function getVersion() public view returns (uint256){
        // ETH/USD price feed address of Goerli Network.
        return i_priceFeed.version();
    }

    function withdraw() public onlyOwner {
        console.log("I am the owner, and I am withdrawing the money!");
        console.log("The owner is: %s", i_owner);
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}
