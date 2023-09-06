console.log("Injected js has run");
let response = 'EMPTY';

// Listen for messages from other frames (including GLOBAL content script)
if (!window.isolatedContentListenerAdded) {
  window.isolatedContentListenerAdded = true;
  window.addEventListener("message", (event) => {
    if (event.source === window && event.data.type === "FROM_GLOBAL") {
      response = event.data.data;
      // Process the received data here
      console.log("Received data in ISOLATED content script:", response);
    }
  });
}

function sendResponseToExtension(msg,sender,sendResponse){
    console.log("Message Received from chrome extension: ",msg);
    if(msg == 'REQUEST_DATA'){
      sendResponse(response);
    }
    else if(msg == 'ACCEPT'){
      sendResponse('ACCEPTED');
      // Send signal to open metamask
      window.postMessage({type:"FROM_ISOLATED",data:msg},"*");
    }
    else if(msg == "REJECT"){
      sendResponse('REJECTED');

      // send signal to not open metamask
      window.postMessage({type:"FROM_ISOLATED",data:msg},"*");
    }
  }
chrome.runtime.onMessage.addListener(sendResponseToExtension);




