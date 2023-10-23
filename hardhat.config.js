require("@nomicfoundation/hardhat-toolbox");
require("hardhat-tracer");
const fs = require("fs");


task("simulateTx","Simulates the transaction")
  .addPositionalParam("contractAddr")
  .addPositionalParam("param2")
  .setAction(async (taskArgs,hre)=>{
    console.log("Task Args: ",taskArgs);
    //Write to argument file
    fs.writeFileSync('./scripts/argument.json',JSON.stringify(taskArgs));
});

//DYOR SEPOLIA: https://eth-sepolia.g.alchemy.com/v2/GxMLyxi4tXxfrtIHBBQyXZhORKs_ChAP
//DYOR MAINNET : https://eth-mainnet.g.alchemy.com/v2/jqgmhlIy4fIg1SrqLptgOsCba0sf-40B

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks:{
    hardhat:{
      forking:{
        url:"https://eth-sepolia.g.alchemy.com/v2/GxMLyxi4tXxfrtIHBBQyXZhORKs_ChAP",
        blockNumber:4546278
    
      },
      mining:{
        auto:true,
      },
      allowUnlimitedContractSize:true,
      gas:"auto"
    }
  }
};
