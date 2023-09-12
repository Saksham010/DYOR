console.log("Injected js has run");
let response = 'EMPTY';
let chaindata = 'EMPTY';

// Listen for messages from other frames (including GLOBAL content script)
if (!window.isolatedContentListenerAdded) {
  window.isolatedContentListenerAdded = true;
  window.addEventListener("message", (event) => {
    if (event.source === window && event.data.type === "FROM_GLOBAL") {

      // response = {type:"TRANSACTION",data:event.data.data };
      response = event.data.data;
      // Process the received data here
      console.log("Received data in ISOLATED content script:", response);
    }
    else if(event.source === window && event.data.type === "FROM_GLOBAL_CHAINID"){
      // chaindata = {type:"ID",data: event.data.data};
      chaindata = event.data.data;
      console.log("Received chainid from ISOLATED content scripts: ",response);
    }
  });
}

function sendResponseToExtension(msg,sender,sendResponse){
    console.log("Message Received from chrome extension: ",msg);
    if(msg == 'REQUEST_DATA'){
      console.log("DATA to be sent to extension: ",{calldata:response,chaindata});
      sendResponse({calldata:response,chaindata});
    }
    else if(msg == 'ACCEPT'){
      sendResponse({type:"INTENT",data:'ACCEPTED'});
      // Send signal to open metamask
      window.postMessage({type:"FROM_ISOLATED",data:msg},"*");
    }
    else if(msg == "REJECT"){
      sendResponse({type:"INTENT",data:'REJECTED'});

      // send signal to not open metamask
      window.postMessage({type:"FROM_ISOLATED",data:msg},"*");
    }
  }
chrome.runtime.onMessage.addListener(sendResponseToExtension);




