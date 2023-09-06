let popupWindowId = null;
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("Background js called");
  if (message.action == "OPEN_EXTENSION") {
    const page = message.event.method == 'personal_sign' ? 'sign/index.html':'index.html';
    chrome.windows.create({
      url:page,
      type:"popup",
      width:400,
      height:720,
      left:100,
      top:100,
      focused:true
    },(window)=>{
      //Save window id
      popupWindowId = window.id;

      // Event listner on the window
      chrome.windows.onRemoved.addListener((closedWindowId)=>{
        if(closedWindowId == popupWindowId){
          sendResponse("success");

          popupWindowId = null;
        }
      })
      // Send response to the content script
      sendResponse({type:message.event.method,data: message.event.params})

    });
  }
  else if(message.action == "CLOSE_EXTENSION"){

    // Close window
    chrome.windows.remove(popupWindowId);

  }


    
  });