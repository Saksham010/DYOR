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
  }
chrome.runtime.onMessage.addListener(sendResponseToExtension);




