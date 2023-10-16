// {
//     "method": "eth_sendTransaction",
//     "params": [
//         {
//             "gas": "0xb58f",
//             "from": "0x54e864f0b5ae1f8c2b7404b04b2c7735172653f0",
//             "to": "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
//             "data": "0x095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
//         }
//     ]
// }
import { APPROVAL } from "./types/types";
import {RPC_LIST} from "./rpclist/rpclist";


export function parseApprovalData(data:string):APPROVAL{
    const trimed = data.slice(2,data.length); //Remove 0x
    const functionSignature = trimed.slice(0,8);  //Get function signature
    const remainingdata = trimed.slice(8,trimed.length); //Spender address + value (64+64)
    const addrpart = remainingdata.slice(0,remainingdata.length/2); // Spender address
    const valuepart = remainingdata.slice(remainingdata.length/2,remainingdata.length); //Value in hex

    // Parse the address part (0x + 40hex);
    const address = "0x" + addrpart.slice(-40);
    const value = parseInt(valuepart,16);

    return {
        signature:functionSignature,
        spender:address,
        value,
    }
}

export function getSignature(data:string):string{
    const trimed = data.slice(2,data.length); //Remove 0x
    const functionSignature = trimed.slice(0,8);  //Get function signature
    return functionSignature;
}
export function getRPCURL(chainID:string):string{
    let url = "https://eth.llamarpc.com";

    switch(chainID){

        case "0x1":
            url = RPC_LIST.eth_rpc;
            break;

        case "0x5":
            url = RPC_LIST.goerli_rpc;
            break;
        
        case "0xaa36a7":
            url = RPC_LIST.sepolia_rpc;
            break;
        
        case "0x2105":
            url = RPC_LIST.base_rpc
            break;
        
        case "0x14a33":
            url = RPC_LIST.base_testnet_rpc;
            break;

        case "0x89":
            url = RPC_LIST.polygon_rpc;
            break;
        
        case "0x13881":
            url = RPC_LIST.mumbai_rpc;
            break;

        case "0x38":
            url = RPC_LIST.bsc_rpc;
            break;
        
        case "0x61":
            url = RPC_LIST.bsc_tetnet_rpc;
            break;
             
        default:
            url = RPC_LIST.eth_rpc;
            break;
    }

    return url;
}



// const signv4:string = '{"types":{"PermitSingle":[{"name":"details","type":"PermitDetails"},{"name":"spender","type":"address"},{"name":"sigDeadline","type":"uint256"}],"PermitDetails":[{"name":"token","type":"address"},{"name":"amount","type":"uint160"},{"name":"expiration","type":"uint48"},{"name":"nonce","type":"uint48"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"Permit2","chainId":"5","verifyingContract":"0x000000000022d473030f116ddee9f6b43ac78ba3"},"primaryType":"PermitSingle","message":{"details":{"token":"0x9e9adc71262ab77b460e80d41dded76dd43407e9","amount":"1461501637330902918203684832716283019655932542975","expiration":"1697188333","nonce":"0"},"spender":"0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad","sigDeadline":"1694598133"}}';
// const finalob  = JSON.parse(signv4);
// console.log(finalob);



