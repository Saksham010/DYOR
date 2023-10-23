const {ethers} = require("ethers");
const hre = require("hardhat");
const fs = require('fs-extra')
const sigUtil = require("@metamask/eth-sig-util");

// const helpers = require("@nomicfoundation/hardhat-network-helpers");
// require("@nomicfoundation/hardhat-toolbox");

const ABI = require("../artifacts/contracts/Malicious.sol/Rug.json");
const ERC20ABI = require("../ABI/ERC20ABI.json");
const {
    TraceParser,
    extractTransferFromLogs,
    extractDataFromLogs,
    parseAddress,
    omitImposter
} = require("./traceParser");

let traceTx = async (txHash, filename, provider) => {
    console.log("TX: ", txHash);
    const indexedResponse = await provider.send("debug_traceTransaction", [txHash]).then((res) => {
        console.log(`Got a response with keys: ${
            Object.keys(res)
        }`);
        const indexedRes = {
            ...res,
            structLogs: res.structLogs.map(
                (structLog, index) => ({
                    index,
                    ...structLog
                })
            )
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


async function tokenDetail(address, signer, victim, gas, provider) {
    const erc20Token = new ethers.Contract(address, ERC20ABI, signer);
    const _name = await erc20Token.name();
    const _symbol = await erc20Token.symbol();
    const _balance = await erc20Token.balanceOf(victim);
    const etherbalance = await provider.getBalance(victim);
    const _fbalance = ethers.utils.formatUnits(_balance.toString(), "ether");
    const _fbalancewei = _balance;

    return {
        name: _name,
        symbol: _symbol,
        address,
        gas,
        finalbalance: _fbalance,
        finalbalancewei: _fbalancewei,
        finaletherbalance: etherbalance
    };
}


const getfinaldata = async (contract, addr, obj, provider) => {
    const balance = await contract.balanceOf(addr);
    const _finalbalance = obj.finalbalancewei;
    const balancedifference = _finalbalance.sub(balance);
    const initialether = await provider.getBalance(addr);

    const sdata = {
        ...obj,
        "initialetherbalance": initialether,
        "originalbalance": ethers.utils.formatUnits(balance.toString(), "ether"),
        "balancechangewei": balancedifference,
        "balancechange": ethers.utils.formatUnits(balancedifference, "ether"),
        "ethercheck": initialether.sub(obj.gas)
    };
    return sdata;
}

// {
// "method": "eth_sendTransaction",
// "params": [
//       {
//           "gas": "0x50e75",
//           "from": "0x9f5155f3d39f79d57c419870a713eec8328e1917",
//           "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
//           "data": "0x3593564c00000000000000000000000000000000000000000000000000000000000000600000000000000000
// 0000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000652e1f5c
// 00000000000000000000000000000000000000000000000000000000000000040a00000c0000000000000000000000000000000000000000000000
// 00000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000044000000000000000000000000000000000000000000000000000000000000001600000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000ffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000006555aa0800000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad00000000000000000000000000000000000000000000000000000000652e241000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041a28239e3df6d47d3041cfc8e8b1d4f003a7ab677623bd90a45e77ed912469e712f29d2d26c1a1d209a1c80c83837d5eb65a91e225a2e145c6a82ecdbae877ed91b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000004fefa17b724000000000000000000000000000000000000000000000000000008a8a445e8fa33600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984002710fff9976782d46cc05630d1f6ebab18b2324d6b1400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000001aa535d3d0c000000000000000000000000000000000000000000000000000002e15cc08c809f900000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8fff9976782d46cc05630d1f6ebab18b2324d6b140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000b8a0106757ad2f"
//       }
// ]
// }
// // "gas": "0x50e75",
// "gas": "0x2a43a",


async function main() { // Read argument
    const transactionData = await fs.readJSON('./scripts/transaction.json');
    const VICTIM = transactionData.params[0].from;
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    await provider.send("hardhat_impersonateAccount", [VICTIM]);
    const impersonateSigner = provider.getSigner(VICTIM);

    console.log("Current block : ", await provider.getBlockNumber());

    // Taking a snapshot
    const snapshot = await provider.send("evm_snapshot", []);

    // const firstapprove = {
    //     "method": "eth_sendTransaction",
    //     "params": [
    //         {
    //             "gasLimit": "0x72db",
    //             "from": "0x54e864f0b5ae1f8c2b7404b04b2c7735172653f0",
    //             "to": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
    //             "data": "0x095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    //         }
    //     ],
    //     "chainid": "0x1"
    // }
    // const responseapprove = await impersonateSigner.sendTransaction(firstapprove.params[0]);
    // console.log("First approve: ", responseapprove);

    // const permit2tx = {
    //     "method": "eth_signTypedData_v4",
    //     "params": ["0x54e864f0b5ae1f8c2b7404b04b2c7735172653f0", "{\"types\":{\"PermitSingle\":[{\"name\":\"details\",\"type\":\"PermitDetails\"},{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"sigDeadline\",\"type\":\"uint256\"}],\"PermitDetails\":[{\"name\":\"token\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint160\"},{\"name\":\"expiration\",\"type\":\"uint48\"},{\"name\":\"nonce\",\"type\":\"uint48\"}],\"EIP712Domain\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"chainId\",\"type\":\"uint256\"},{\"name\":\"verifyingContract\",\"type\":\"address\"}]},\"domain\":{\"name\":\"Permit2\",\"chainId\":\"11155111\",\"verifyingContract\":\"0x000000000022d473030f116ddee9f6b43ac78ba3\"},\"primaryType\":\"PermitSingle\",\"message\":{\"details\":{\"token\":\"0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8\",\"amount\":\"1461501637330902918203684832716283019655932542975\",\"expiration\":\"1700659629\",\"nonce\":\"0\"},\"spender\":\"0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad\",\"sigDeadline\":\"1698069429\"}}"]
    // } 
    // {
    //     "types": {
    //         "PermitSingle": [
    //             {
    //                 "name": "details",
    //                 "type": "PermitDetails"
    //             }, {
    //                 "name": "spender",
    //                 "type": "address"
    //             }, {
    //                 "name": "sigDeadline",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "PermitDetails": [
    //             {
    //                 "name": "token",
    //                 "type": "address"
    //             }, {
    //                 "name": "amount",
    //                 "type": "uint160"
    //             }, {
    //                 "name": "expiration",
    //                 "type": "uint48"
    //             }, {
    //                 "name": "nonce",
    //                 "type": "uint48"
    //             }
    //         ],
    //         "EIP712Domain": [
    //             {
    //                 "name": "name",
    //                 "type": "string"
    //             }, {
    //                 "name": "chainId",
    //                 "type": "uint256"
    //             }, {
    //                 "name": "verifyingContract",
    //                 "type": "address"
    //             }
    //         ]
    //     },
    //     "domain": {
    //         "name": "Permit2",
    //         "chainId": "11155111",
    //         "verifyingContract": "0x000000000022d473030f116ddee9f6b43ac78ba3"
    //     },
    //     "primaryType": "PermitSingle",
    //     "message": {
    //         "details": {
    //             "token": "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8",
    //             "amount": "1461501637330902918203684832716283019655932542975",
    //             "expiration": "1700659629",
    //             "nonce": "0"
    //         },
    //         "spender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
    //         "sigDeadline": "1698069429"
    //     }
    // }


    //Permit 2 approval
    // signTypedData_v4()
    // const permit2data =JSON.parse(permit2tx.params[1]);
    // delete permit2data.types.EIP712Domain; //To resolve unused type error
    // const permit2approve = await impersonateSigner._signTypedData(permit2data.domain,permit2data.types,permit2data.message);
    // console.log("Permit2 approval: ",permit2approve);

    // const permit2approve = sigUtil.signTypedData(impersonateSigner,permit2tx,sigUtil);
    // console.log("Permit2 approved");

    // Send transaction
    const unknowntx = await impersonateSigner.sendTransaction(transactionData.params[0]);
    const txReceipt = await unknowntx.wait();
    const gas = txReceipt.gasUsed;
    const transactionhash = unknowntx.hash;
    console.log("Transaction receipt: ", txReceipt);


    const transactionTraces = await traceTx(transactionhash, './scripts/traces.json', provider);
    const externalcallLogs = await TraceParser(transactionTraces);
    // const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    // const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    const expectedERC20Tokens = extractTransferFromLogs(externalcallLogs);
    console.log("ChangedERC20 from logs: ", expectedERC20Tokens);

    console.log("Validate start");

    // Validate if the changedERC20 is valid or not
    const validErcList = await Promise.all(expectedERC20Tokens.map(async (address) => {
        const parsedAddress = parseAddress(address);
        console.log("PARSED ADDRESS: ", parsedAddress);
        const tContract = new ethers.Contract(parsedAddress, ERC20ABI, provider);
        // // Try to fetch ERC20 data
        try {
            await tContract.name();
            await tContract.symbol();
            await tContract.decimals();
            await tContract.totalSupply();
        } catch (err) {
            console.log("ERROR during fetch: ", err);
            return ""
        }
        return parsedAddress;
    }));

    // Filter empty string
    const changedERC20tokens = validErcList.filter((x) => x != '');

    // const changedERC20tokens = await Promise.all(omitImposter(expectedERC20Tokens,provider,ERC20ABI));

    console.log("Changed final token: ", changedERC20tokens);

    const extractedData = await Promise.all(changedERC20tokens.map((erc20address) => { // Parse address
        return tokenDetail(erc20address, impersonateSigner, VICTIM, gas, provider)
    }));


    // Revert to snapshot
    await provider.send("evm_revert", [snapshot]);

    console.log("Current block : ", await provider.getBlockNumber());
    // Update original balance
    const simulatedData = await Promise.all(extractedData.map((ctokens, i) => {
        const ctokencontract = new ethers.Contract(ctokens.address, ERC20ABI, provider);
        return getfinaldata(ctokencontract, VICTIM, extractedData[i], provider);
    }));

    console.log("Final data: ", simulatedData);
    // Write extracted data array to file
    fs.writeFileSync("./scripts/ERC20change.json", JSON.stringify(simulatedData));


    // Initialize
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

    // OUR: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199

    // const balanceWei = await provider.getBalance(VICTIM);
    // console.log("Balance : ", ethers.utils.formatEther(balanceWei));

    // Contract instance
    // const rugContract  = new ethers.Contract(rug.address,ABI.abi,impersonateSigner);
    // // Contract instance for ERC20 tokens
    // const ERC20Token = new ethers.Contract(CHAINLINKADDRESS,ERC20ABI,impersonateSigner);
    // const tokenName = await ERC20Token.name();
    // console.log("Token name: ",tokenName);

    // Approve the contract for delegation
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

    // Extract data from transaction trace
    // const transactionTraces = await traceTx(transactionhash,'./scripts/traces.json',provider);
    // const externalcallLogs = await TraceParser(transactionTraces);
    // const tranferFromLogs = extractTransferFromLogs(externalcallLogs); //Extract transfercall CALL
    // const changedERC20Tokens = extractDataFromLogs(tranferFromLogs); //Get the transferred token list
    // console.log("ChangedERC20 from logs: ",changedERC20Tokens);

    // const extractedData = await Promise.all(changedERC20Tokens.map((erc20address)=>{
    // //Parse address
    // const parsedERC20Address = parseAddress(erc20address);
    // return tokenDetail(parsedERC20Address,impersonateSigner,VICTIM,gas.add(approvegas).add(rugGas),provider)
    // }));

    // //Revert to snapshot
    // await provider.send("evm_revert",[snapshot]);

    // console.log("Current block : ", await provider.getBlockNumber());
    // //Update original balance
    // const simulatedData = await Promise.all(extractedData.map((ctokens,i)=>{
    // const ctokencontract = new ethers.Contract(ctokens.address,ERC20ABI,provider);
    // return getfinaldata(ctokencontract,VICTIM,extractedData[i],provider);
    // }));

    // console.log("Final data: ",simulatedData);
    // //Write extracted data array to file
    // fs.writeFileSync("./scripts/ERC20change.json",JSON.stringify(simulatedData));

}main().then(() => {
    process.exit(0)
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


// ETH to uniswap
// {
//     "method": "eth_sendTransaction",
//     "params": [
//         {
//             "gasLimit": "0x43a00",
//             "value": "0x16345785d8a0000",
//             "from": "0xb38274154efb3724000efa642f1c9929e6413bd8",
//             "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
//             "data": "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006534cd0800000000000000000000000000000000000000000000000000000000000000030b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000016345785d8a000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000011c37937e080000000000000000000000000000000000000000000000000000007f5267971c0ee200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bfff9976782d46cc05630d1f6ebab18b2324d6b14000bb81f9840a85d5af5bf1d1762f925bdaddc4201f9840000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000470de4df820000000000000000000000000000000000000000000000000000001fdae40089b8aa00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bfff9976782d46cc05630d1f6ebab18b2324d6b140027101f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000000000000000000000"
//         }
//     ],
//     "chainid": "0x1"
// }


// UNISWAP to ETH
// {
// "method": "eth_sendTransaction",
// "params": [
//       {
//           "gasLimit": "0x46d94",
//           "from": "0xb38274154efb3724000efa642f1c9929e6413bd8",
//           "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
//           "data": "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006535ea98000000000000000000000000000000000000000000000000000000000000000300000c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000055f9c59390800000000000000000000000000000000000000000000000000000be3c7e62dd5e1d00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f9840001f4fff9976782d46cc05630d1f6ebab18b2324d6b1400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000004657febe8d8000000000000000000000000000000000000000000000000000009b3e50e5b0ff1200000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8fff9976782d46cc05630d1f6ebab18b2324d6b140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000001597acf488e5d30"
//       }
// ],
// "chainid": "0x1"
// }


// Aave (USDC) deposit:
// {
// "method": "eth_sendTransaction",
// "params": [
//       {
//           "gasLimit": "0x493e0",
//           "from": "0x54e864f0b5ae1f8c2b7404b04b2c7735172653f0",
//           "to": "0x6ae43d3271ff6888e7fc43fd7321a503ff738951",
//           "data": "0x617ba03700000000000000000000000094a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8000000000000000000000000000000000000000000000000000000000098968000000000000000000000000054e864f0b5ae1f8c2b7404b04b2c7735172653f00000000000000000000000000000000000000000000000000000000000000000"
//       }
// ],
// "chainid": "0x1"
// }


// USDC TO ETH (UNISWAP)
// {
// "method": "eth_sendTransaction",
// "params": [
//       {
//           "gasLimit": "0x39123",
//           "from": "0x54e864f0b5ae1f8c2b7404b04b2c7735172653f0",
//           "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
//           "data": "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006536518800000000000000000000000000000000000000000000000000000000000000030a000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000016000000000000000000000000094a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8000000000000000000000000ffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000655dd79200000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad000000000000000000000000000000000000000000000000000000006536519a00000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041fee10e754070f5a5094d1167366bb735ea1b01b996c0bd5046d8b015e6b7f739379f0b4fc217a961ef80e97f5232da3a3cffa64c7a3dede307ff68cbba55010f1c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000009896800000000000000000000000000000000000000000000000000015f68684baf22300000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8000bb8fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000015f68684baf223"
//       }
// ],
// "chainid": "0x1"
// }
