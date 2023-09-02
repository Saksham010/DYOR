const hre = require("hardhat");
const ABI = require("../artifacts/contracts/Malicious.sol/Rug.json");
const ERC20ABI = require("../ABI/ERC20ABI.json");

async function main() {
// Deploy contract
    const Rug = await hre.ethers.getContractFactory("Rug");
    const rug = await Rug.deploy();

    await rug.deployed();

    console.log("Rug contract has been deployed with address: ",rug.address);


    // Simulate transaction
    const impersonateSigner = await ethers.getImpersonatedSigner("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199");
    // await impersonateSigner

    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    const balanceWei = await provider.getBalance("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199");
    console.log("Balance : ", ethers.utils.formatEther(balanceWei));

    // Rug contract: 0x9155497EAE31D432C0b13dBCc0615a37f55a2c87
    // Contract instance
    const MaliciousContract  = new ethers.Contract(rug.address,ABI.abi,impersonateSigner);
    console.log("Calling function");

    const tx = await MaliciousContract.buy({value:ethers.utils.parseUnits("100","ether")});
    console.log("Transfer Transaction: ",tx);

    // const MaliciousContractProvider  = new ethers.Contract(,ABI.abi,provider)";
    const tx2 = await MaliciousContract.setValue(10);
    console.log("Non transfer transaction: ",tx2);

    // Approval for ERC20 tokens
    const ERC20Token = new ethers.Contract("addresss",ERC20ABI,impersonateSigner);
    const tokenName = await ERC20Token.name();
    console.log("Token name: ",tokenName);
    console.log("Approving");
    const approvetx = await ERC20Token.approve("spender",ether.utils.parseUnits("100","ether"));
    console.log("Transaction approved: ",approvetx);

    





    
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
