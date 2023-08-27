// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Rug {
    uint number = 20;

    function buy() public payable {

    }

    function setValue(uint256 num) public returns(uint) {
        number = num;
        return number;
    }
    receive()external payable{

    }




}
