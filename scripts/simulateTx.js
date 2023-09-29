const ABI = require("../artifacts/contracts/Malicious.sol/Rug.json");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const fs = require("fs");
const {TraceParser,extractTransferFromLogs,extractDataFromLogs,parseAddress} = require("./traceParser");

//stealSelector 74 228 victimadr linkadd transferfromSelect 32 128 100 128 0 linkadd 38977

let traceTx = async (txHash, filename,provider) => {
  console.log("Current block : ", await provider.getBlockNumber());
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


async function tokenDetail(address,signer,victim){
  const erc20Token = new ethers.Contract(address,ERC20ABI,signer);
  const _name = await erc20Token.name();
  const _symbol = await erc20Token.symbol();
  const _balance = await erc20Token.balanceOf(victim);

  return {name:_name,symbol:_symbol,finalbalance:_balance,address:address};
}


async function main() {

    //Initialize
    const VICTIM = "0x058A871358c1B01039A265635eA282c3F435a9Ed"; //Random chainlink owner
    const CHAINLINKADDRESS = "0x514910771AF9Ca656af840dff83E8264EcF986CA";


    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    await provider.send("hardhat_impersonateAccount", [VICTIM]);
    const impersonateSigner = provider.getSigner(VICTIM);


// Deploy contract
    const Rug = await ethers.getContractFactory("Rug");
    const rugSigned = await Rug.connect(impersonateSigner); 
    const rug = await rugSigned.deploy();
    await rug.deployed();
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
    console.log("Transaction approved: ",approvetx);

    // Rug contract 
    console.log("Steal ");
    const delegatedTransfer = await rugContract.stealToken("0x058A871358c1B01039A265635eA282c3F435a9Ed");
    console.log("Steal transaction: ",delegatedTransfer);
    const transactionhash = await delegatedTransfer.hash;

    //Extract data from transaction trace
    const transactionTraces = await traceTx(transactionhash,'./scripts/traces.json',provider);
    const externalcallLogs = await TraceParser(transactionTraces);
    const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    console.log("ChangedERC20 from logs: ",changedERC20Tokens);

    const extractedData = await Promise.all(changedERC20Tokens.map((erc20address)=>{
      //Parse address
      const parsedERC20Address = parseAddress(erc20address);
      return tokenDetail(parsedERC20Address,impersonateSigner,VICTIM)
    }));

    console.log("Response array: ",extractedData);

    //Write extracted data array to file
    fs.writeFileSync("./scripts/ERC20change.json",JSON.stringify(extractedData));
  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
