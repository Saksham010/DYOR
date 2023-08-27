require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    hardhat:{
      forking:{
        url:"https://eth-mainnet.g.alchemy.com/v2/jqgmhlIy4fIg1SrqLptgOsCba0sf-40B"
      }
    }
  }
};
