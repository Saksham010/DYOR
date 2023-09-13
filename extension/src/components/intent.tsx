// Handle underlying wallet according to intent
function handleIntent(INTENT:string){
    chrome.tabs && chrome.tabs.query({
    active: true,
    }, tabs => {
    console.log("Blocking the wallet");

    chrome.tabs.sendMessage(tabs[0].id || 0, INTENT,(response)=>{
        if(response.data == "REJECTED"){
            console.log("Closing the tab");
        }
        else if(response.data == "ACCEPTED"){
            console.log("Invoking metamask");
        }    
    })
    });
}

export default function HandleIntent(){
    return(
        <div className="mt-36 flex justify-between pl-2 pr-2" >

            <div >
                <button onClick={()=>{handleIntent("ACCEPT")}} className="border-1 border-black hover:border-amber-600">Continue</button>
            </div>
            <div>
                <button onClick={()=>{handleIntent("REJECT")}} className="border-1 border-black hover:border-amber-600">Reject</button>
            </div>

        </div>
    )

}