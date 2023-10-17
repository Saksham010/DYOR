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
        

        const transferFromLogs = [];
        const transferFromSignature = "0000000000000000000000000000000000000000000000000000000023b872dd";
        
        //Extracting transferFrom logs
        externalcallLogs.map((calllogs)=>{
            const callstack = calllogs.stack;
            callstack.map((data)=>{
                if(data == transferFromSignature){
                    transferFromLogs.push(calllogs);
                }
            });    
        });

        console.log("Transfer from logs: ",transferFromLogs);
    
        return transferFromLogs;
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


module.exports = {TraceParser,extractTransferFromLogs,extractDataFromLogs,parseAddress};