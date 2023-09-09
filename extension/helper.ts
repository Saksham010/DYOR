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
console.log(parseApprovalData("0xa22cb4650000000000000000000000001e0049783f008a0085193e00003d00cd54003c710000000000000000000000000000000000000000000000000000000000000001"))





