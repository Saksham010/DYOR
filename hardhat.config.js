require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    hardhat:{
      forking:{
        url:"https://eth-mainnet.g.alchemy.com/v2/jqgmhlIy4fIg1SrqLptgOsCba0sf-40B",
        blockNumber:18226134
    
      },
      mining:{
        auto:true,
      }
    }
  }
};
