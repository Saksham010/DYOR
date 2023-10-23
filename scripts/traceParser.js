const { ethers } = require("hardhat");
const {whatsabi} = require("@shazow/whatsabi");

function getSignature(data){
    const functionSignature = data.slice(0,8);  //Get function signature
    return functionSignature;
}

// Evaluate token balance 
function TraceParser(executionTrace){
    const tracelogs = executionTrace.structLogs;
    const externalcallLogs = tracelogs.filter((callobj)=>{ //Get all the CALL opcode
        return callobj.op == "CALL";
    });
    console.log("Externalcall logs: ",externalcallLogs);
    return externalcallLogs;
}

function extractTransferFromLogs(externalcallLogs){
    if(externalcallLogs !== undefined){
        

        // const transferFromLogs = [];
        // const transferFromSignature = "0000000000000000000000000000000000000000000000000000000023b872dd";
        const tokenlist = [];
        
        //Extracting transferFrom logs
        externalcallLogs.map((calllogs)=>{
            const callstack = calllogs.stack;

            //Potential token 
            const ptokenadr = callstack[callstack.length -2]; //2nd element of the stack
            console.log("Ptokenadr: ",ptokenadr);

            // Map memory and find signature to see if the signature matches
            const callmemory = calllogs.memory;
            callmemory.map((str)=>{
                const expectedsignature = getSignature(str);
                if(expectedsignature == "a9059cbb" || expectedsignature == "23b872dd"){
                    console.log("Transfer found");
                    tokenlist.push(ptokenadr);
                }

            })

            // callstack.map((data)=>{
            //     if(data == transferFromSignature){
            //         transferFromLogs.push(calllogs);
            //     }
            // });    
        });

        // console.log("Transfer from logs: ",transferFromLogs);
        console.log("Token list: ",tokenlist);

        // Remove recurrent data:
        const uniquelist = [...new Set(tokenlist)];

    
        return uniquelist;
    }

}

function extractDataFromLogs(transferFromLogs){
    if(transferFromLogs !== undefined){
        let transferedTokens = [];
        
        transferFromLogs.map((obj)=>{
            const storagedata = obj.storage;
            const targetAddressList = Object.values(storagedata);
            transferedTokens = targetAddressList;   
        });

        console.log("Transfer token logs: ",transferedTokens);
    
        return transferedTokens;
    }
}

function parseAddress(address){
    const trimedaddr =address.slice(24,address.length);
    return '0x'+trimedaddr;
}

// Remove cases of selector collison
async function omitImposter(tokenlist,provider,abi){
    // Remove repition in token list
    const uniquelist = [...new Set(tokenlist)];
    const purelist = [];

    console.log("MAPPING START");
    const finalList = Promise.allSettled(uniquelist.map(async (address)=>{

        // const code = await provider.getCode(address);
        // const selectors = whatsabi.selectorsFromBytecode(code);
        // console.log(selectors); // -> ["0x06fdde03", "0x46423aa7", "0x55944a42", ...]



        // const tContract = new ethers.Contract(address,abi,provider);
        // // Try to fetch ERC20 data
        try{
            await tContract.name();
            await tContract.symbol();
            await tContract.decimals();
            await tContract.totalSupply();
        }
        catch(err){
            return ""
        }
        // return address;
    }));

    console.log("MAPPING END");
    // return uniquelist;

    // // Remove Empty string
    // finalList.then((list)=>{
    //     const filteredList = list.filter((address)=>address != ""); //Remove empty address in list
    //     console.log("Achieved address: ",filteredList);
    //     return filteredList;
    // })
}

module.exports = {TraceParser,extractTransferFromLogs,extractDataFromLogs,parseAddress,omitImposter};