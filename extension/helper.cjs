"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseApprovalData = void 0;
function parseApprovalData(data) {
    var trimed = data.slice(2, data.length); //Remove 0x
    var functionSignature = trimed.slice(0, 8); //Get function signature
    var remainingdata = trimed.slice(8, trimed.length); //Spender address + value (64+64)
    var addrpart = remainingdata.slice(0, remainingdata.length / 2); // Spender address
    var valuepart = remainingdata.slice(remainingdata.length / 2, remainingdata.length); //Value in hex
    // Parse the address part (0x + 40hex);
    var address = "0x" + addrpart.slice(-40);
    var value = parseInt(valuepart, 16);
    return {
        signature: functionSignature,
        spender: address,
        value: value,
    };
}
exports.parseApprovalData = parseApprovalData;
console.log(parseApprovalData("0xa22cb4650000000000000000000000001e0049783f008a0085193e00003d00cd54003c710000000000000000000000000000000000000000000000000000000000000001"));
