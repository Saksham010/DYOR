const {ethers, providers} = require("ethers");
const hre = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
// const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const fs = require("fs");
const ABI = require("../artifacts/contracts/Malicious.sol/Rug.json");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const {TraceParser,extractTransferFromLogs,extractDataFromLogs,parseAddress} = require("./traceParser");

let traceTx = async (txHash, filename,provider) => {
  console.log("TX: ",txHash);
  const indexedResponse = await provider.send("debug_traceTransaction", [txHash]).then((res) => {
    console.log(`Got a response with keys: ${Object.keys(res)}`);
    const indexedRes = {
      ...res,
      structLogs: res.structLogs.map((structLog, index) => ({
        index,
        ...structLog,
      })),
    };

    if (filename) {
      fs.writeFileSync(filename, JSON.stringify(indexedRes, null, 2));
    } else {
      console.log("INDEXES: ");
      console.log(indexedRes);
    }
    return indexedRes;
  });
  return await indexedResponse;
};


async function tokenDetail(address,signer,victim,gas,provider){
  const erc20Token = new ethers.Contract(address,ERC20ABI,signer);
  const _name = await erc20Token.name();
  const _symbol = await erc20Token.symbol();
  const _balance = await erc20Token.balanceOf(victim);
  const etherbalance = await provider.getBalance(victim);
  const _fbalance = ethers.utils.formatUnits(_balance.toString(),"ether");
  const _fbalancewei = _balance;

  return {name:_name,symbol:_symbol,address,gas,finalbalance:_fbalance,finalbalancewei:_fbalancewei,finaletherbalance:etherbalance};
}


const getfinaldata = async (contract,addr,obj,provider) =>{
  const balance = await contract.balanceOf(addr);
  const _finalbalance = obj.finalbalancewei;
  const balancedifference = _finalbalance.sub(balance);
  const initialether = await provider.getBalance(addr);

  const sdata = {
    ...obj,
    "initialetherbalance":initialether,
    "originalbalance":ethers.utils.formatUnits(balance.toString(),"ether"),
    "balancechangewei":balancedifference,
    "balancechange":ethers.utils.formatUnits(balancedifference,"ether"),
    "ethercheck":initialether.sub(obj.gas)
  };
  return sdata;
}


async function main() {

    //Initialize
    const VICTIM = "0x058A871358c1B01039A265635eA282c3F435a9Ed"; //Random chainlink owner
    const CHAINLINKADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    await provider.send("hardhat_impersonateAccount", [VICTIM]);
    const impersonateSigner = provider.getSigner(VICTIM);

    console.log("Current block : ", await provider.getBlockNumber());

    // Taking a snapshot
    const snapshot = await provider.send("evm_snapshot",[]);

// Deploy contract
    const Rug = await hre.ethers.getContractFactory("Rug");
    // const Rug = await ethers.Contract()
    const rugSigned = Rug.connect(impersonateSigner); 
    const rug = await rugSigned.deploy();
    const rugReceipt = await rug.deployed();
    const rugFinalReceipt = await rug.deployTransaction.wait();
    const rugGas = rugFinalReceipt.gasUsed;
    console.log("Rug receipt: ",rugFinalReceipt);
    console.log("Rug contract has been deployed with address: ",rug.address);

    //OUR: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199

    const balanceWei = await provider.getBalance(VICTIM);
    console.log("Balance : ", ethers.utils.formatEther(balanceWei));

    // Contract instance
    const rugContract  = new ethers.Contract(rug.address,ABI.abi,impersonateSigner);
    // Contract instance for ERC20 tokens
    const ERC20Token = new ethers.Contract(CHAINLINKADDRESS,ERC20ABI,impersonateSigner);
    const tokenName = await ERC20Token.name();
    console.log("Token name: ",tokenName);

    //Approve the contract for delegation
    console.log("Approving");
    const approvetx = await ERC20Token.approve(`${rug.address}`,ethers.utils.parseUnits("50","ether"));
    const approveReceipt = await approvetx.wait();
    const approvegas = await approveReceipt.gasUsed;
    console.log("Transaction approved: ",approvetx);

    // Rug contract 
    console.log("Steal ");
    const delegatedTransfer = await rugContract.stealToken("0x058A871358c1B01039A265635eA282c3F435a9Ed");
    const transferReceipt = await delegatedTransfer.wait();
    const gas = await transferReceipt.gasUsed;
    const transactionhash = await delegatedTransfer.hash;
    console.log("Steal transaction: ",transferReceipt);

    //Extract data from transaction trace
    const transactionTraces = await traceTx(transactionhash,'./scripts/traces.json',provider);
    const externalcallLogs = await TraceParser(transactionTraces);
    const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    console.log("ChangedERC20 from logs: ",changedERC20Tokens);

    const extractedData = await Promise.all(changedERC20Tokens.map((erc20address)=>{
      //Parse address
      const parsedERC20Address = parseAddress(erc20address);
      return tokenDetail(parsedERC20Address,impersonateSigner,VICTIM,gas.add(approvegas).add(rugGas),provider)
    }));

    //Revert to snapshot
    await provider.send("evm_revert",[snapshot]);
  
    console.log("Current block : ", await provider.getBlockNumber());
    //Update original balance
    const simulatedData = await Promise.all(extractedData.map((ctokens,i)=>{
      const ctokencontract = new ethers.Contract(ctokens.address,ERC20ABI,provider);
      return getfinaldata(ctokencontract,VICTIM,extractedData[i],provider);
    }));

    console.log("Final data: ",simulatedData);
    //Write extracted data array to file
    fs.writeFileSync("./scripts/ERC20change.json",JSON.stringify(simulatedData));
  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
