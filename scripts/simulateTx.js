const {ethers} = require("ethers");
const hre = require("hardhat");
const fs = require('fs-extra')

// const helpers = require("@nomicfoundation/hardhat-network-helpers");
// require("@nomicfoundation/hardhat-toolbox");

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

// {
//   "method": "eth_sendTransaction",
//   "params": [
//       {
//           "gas": "0x50e75",
//           "from": "0x9f5155f3d39f79d57c419870a713eec8328e1917",
//           "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
//           "data": "0x3593564c00000000000000000000000000000000000000000000000000000000000000600000000000000000
// 0000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000652e1f5c
// 00000000000000000000000000000000000000000000000000000000000000040a00000c0000000000000000000000000000000000000000000000
// 00000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000001600000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000ffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000006555aa0800000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad00000000000000000000000000000000000000000000000000000000652e241000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041a28239e3df6d47d3041cfc8e8b1d4f003a7ab677623bd90a45e77ed912469e712f29d2d26c1a1d209a1c80c83837d5eb65a91e225a2e145c6a82ecdbae877ed91b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000004fefa17b724000000000000000000000000000000000000000000000000000008a8a445e8fa33600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984002710fff9976782d46cc05630d1f6ebab18b2324d6b1400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000001aa535d3d0c000000000000000000000000000000000000000000000000000002e15cc08c809f900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8fff9976782d46cc05630d1f6ebab18b2324d6b140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000b8a0106757ad2f"
//       }
//   ]
// }
// // "gas": "0x50e75",
// "gas": "0x2a43a",


async function main() {
  // Read argument
    const transactionData = await fs.readJSON('./scripts/transaction.json');
    const VICTIM = transactionData.params[0].from;
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    await provider.send("hardhat_impersonateAccount", [VICTIM]);
    const impersonateSigner = provider.getSigner(VICTIM);

    console.log("Current block : ", await provider.getBlockNumber());

    // Taking a snapshot
    const snapshot = await provider.send("evm_snapshot",[]);

    //Send transaction 
    const unknowntx = await impersonateSigner.sendTransaction(transactionData.params[0]);
    const txReceipt = await unknowntx.wait();
    const gas =  txReceipt.gasUsed;
    const transactionhash = unknowntx.hash;
    console.log("Transaction receipt: ",txReceipt);


    const transactionTraces = await traceTx(transactionhash,'./scripts/traces.json',provider);
    const externalcallLogs = await TraceParser(transactionTraces);
    const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    console.log("ChangedERC20 from logs: ",changedERC20Tokens);

    const extractedData = await Promise.all(changedERC20Tokens.map((erc20address)=>{
      //Parse address
      const parsedERC20Address = parseAddress(erc20address);
      return tokenDetail(parsedERC20Address,impersonateSigner,VICTIM,gas,provider)
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



    //Initialize
    // const VICTIM = "0x058A871358c1B01039A265635eA282c3F435a9Ed"; //Random chainlink owner
    // const CHAINLINKADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";

    // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    // await provider.send("hardhat_impersonateAccount", [VICTIM]);
    // const impersonateSigner = provider.getSigner(VICTIM);

    // console.log("Current block : ", await provider.getBlockNumber());

    // // Taking a snapshot
    // const snapshot = await provider.send("evm_snapshot",[]);

// Deploy contract
    // const Rug = await hre.ethers.getContractFactory("Rug");
    // // const Rug = await ethers.Contract()
    // const rugSigned = Rug.connect(impersonateSigner); 
    // const rug = await rugSigned.deploy();
    // const rugReceipt = await rug.deployed();
    // const rugFinalReceipt = await rug.deployTransaction.wait();
    // const rugGas = rugFinalReceipt.gasUsed;
    // console.log("Rug receipt: ",rugFinalReceipt);
    // console.log("Rug contract has been deployed with address: ",rug.address);

    //OUR: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199

    // const balanceWei = await provider.getBalance(VICTIM);
    // console.log("Balance : ", ethers.utils.formatEther(balanceWei));

    // Contract instance
    // const rugContract  = new ethers.Contract(rug.address,ABI.abi,impersonateSigner);
    // // Contract instance for ERC20 tokens
    // const ERC20Token = new ethers.Contract(CHAINLINKADDRESS,ERC20ABI,impersonateSigner);
    // const tokenName = await ERC20Token.name();
    // console.log("Token name: ",tokenName);

    //Approve the contract for delegation
    // console.log("Approving");
    // const approvetx = await ERC20Token.approve(`${rug.address}`,ethers.utils.parseUnits("50","ether"));
    // const approveReceipt = await approvetx.wait();
    // const approvegas = await approveReceipt.gasUsed;
    // console.log("Transaction approved: ",approvetx);

    // Rug contract 
    // console.log("Steal ");
    // const delegatedTransfer = await rugContract.stealToken("0x058A871358c1B01039A265635eA282c3F435a9Ed");
    // const transferReceipt = await delegatedTransfer.wait();
    // const gas = await transferReceipt.gasUsed;
    // const transactionhash = await delegatedTransfer.hash;
    // console.log("Steal transaction: ",transferReceipt);

    //Extract data from transaction trace
    // const transactionTraces = await traceTx(transactionhash,'./scripts/traces.json',provider);
    // const externalcallLogs = await TraceParser(transactionTraces);
    // const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    // const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    // console.log("ChangedERC20 from logs: ",changedERC20Tokens);

    // const extractedData = await Promise.all(changedERC20Tokens.map((erc20address)=>{
    //   //Parse address
    //   const parsedERC20Address = parseAddress(erc20address);
    //   return tokenDetail(parsedERC20Address,impersonateSigner,VICTIM,gas.add(approvegas).add(rugGas),provider)
    // }));

    // //Revert to snapshot
    // await provider.send("evm_revert",[snapshot]);
  
    // console.log("Current block : ", await provider.getBlockNumber());
    // //Update original balance
    // const simulatedData = await Promise.all(extractedData.map((ctokens,i)=>{
    //   const ctokencontract = new ethers.Contract(ctokens.address,ERC20ABI,provider);
    //   return getfinaldata(ctokencontract,VICTIM,extractedData[i],provider);
    // }));

    // console.log("Final data: ",simulatedData);
    // //Write extracted data array to file
    // fs.writeFileSync("./scripts/ERC20change.json",JSON.stringify(simulatedData));
  
  }

main().then(()=>{process.exit(0)}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
