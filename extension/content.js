// content.js
function checkForEthereum() {
  console.log("Content script called")
  console.log("Window ethereum: ",window.ethereum);
  if (window.ethereum != undefined) {
    // Modify window.ethereum here
    console.log("window.ethereum is available!");
    console.log("Modifying window ethereum");
    let tempobj = window.ethereum.request;
    window.ethereum.request = async (e) =>{
      console.log("E: ",e);
      if(e.method == 'personal_sign'){
        await new Promise((resolve) => {
          chrome.runtime.sendMessage("hchgggjaefgaecmiepfegkjpnbjbopkb", { action: "openExtension", event:e}, (res) => {
            console.log("Response: ",res);
            resolve();
          });
        });
      }
      
      const ret = await tempobj({...e});
      return ret;
    }
    console.log("Window Ethereum modified");
    return;
  } else {
    // If not available yet, wait and check again
    setTimeout(checkForEthereum, 2000); // Check every 2000 milliseconds
    return;
  }
}

checkForEthereum();