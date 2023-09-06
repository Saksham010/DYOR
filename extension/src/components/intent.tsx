// Handle underlying wallet according to intent
function handleIntent(INTENT:string){
    chrome.tabs && chrome.tabs.query({
    active: true,
    }, tabs => {
    console.log("Blocking the wallet");

    chrome.tabs.sendMessage(tabs[0].id || 0, INTENT,(response)=>{
    if(response == "REJECTED"){
        console.log("Closing the tab");
    }
    else if(response == "ACCEPTED"){
        console.log("Invoking metamask");
    }    
    })
    });
}

export default function HandleIntent(){
    return(
        <>
            <button onClick={()=>{handleIntent("REJECT")}} >Reject</button>
            <button onClick={()=>{handleIntent("ACCEPT")}}>Continue</button>

        </>
    )

}