chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log("Background js called");
    if (message.action == "openExtension") {
      const page = message.event.method == 'personal_sign' ? 'sign/index.html':'index.html';
      chrome.windows.create({
        url:page,
        type:"popup",
        width:800,
        height:600,
        left:100,
        top:100,
        focused:true
      },(window)=>{
        let popupWindowId = window.id;

        // Event listner on the window
        chrome.windows.onRemoved.addListener((closedWindowId)=>{
          if(closedWindowId == popupWindowId){
            sendResponse("success");

            popupWindowId = null;
          }
        })
      });
    }

    
  });