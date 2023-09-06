// content.js

function closeExtension(){
  chrome.runtime.sendMessage("hchgggjaefgaecmiepfegkjpnbjbopkb",{action:"CLOSE_EXTENSION"});

}


function checkForEthereum() {
  console.log("Content script called")
  console.log("Window ethereum: ",window.ethereum);
  if (window.ethereum != undefined) {
    // Modify window.ethereum here
    console.log("window.ethereum is available!");
    console.log("Modifying window ethereum");
    let metamaskrequest = window.ethereum.request;
    window.ethereum.request = async (e) =>{
      console.log("E: ",e);
      if(e.method == 'personal_sign'){
        //Send data to injected js
        window.postMessage({ type: "FROM_GLOBAL", data: e }, "*");

        //Open chrome extension
        await new Promise((resolve,reject) => {
          chrome.runtime.sendMessage("hchgggjaefgaecmiepfegkjpnbjbopkb", { action: "OPEN_EXTENSION", event:e}, (res) => {
            console.log("Response from background js: ",res);

            // Listen for response from the wallet shield
            window.addEventListener("message", (event) => {

              if (event.data.type === "FROM_ISOLATED") {

                const intent = event.data.data;

                if(intent == "ACCEPT"){
                  // Close extension
                  closeExtension();
                  window.removeEventListener("message",()=>{
                    console.log("Accepted: Closed");
                  });

                  resolve("The intent has been accepted");
                  
                }
                else if(intent == "REJECT"){
                  closeExtension();
                  // Remove listener
                  window.removeEventListener("message",()=>{
                    console.log("Rejected: Closed");
                  });
                  reject("The intent has been rejected");
                  // throw new Error("User rejected permission"); //Left to handle properly
                }
              }
            });
          });
        });
      }

      return await metamaskrequest({...e})

    }
    console.log("Window Ethereum modified");

  } else {
    // If not available yet, wait and check again
    setTimeout(checkForEthereum, 2000); // Check every 2000 milliseconds
  }
}

checkForEthereum();