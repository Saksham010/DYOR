
import { useState,useEffect } from 'react'
import './App.css'
import SignPage from './components/signpage'
import HandleIntent from './components/intent'
import ApprovePage from './components/approvepage'
import DYORLOGO from "./assets/logo.png";



function App(props:{title:string}) {
  const title = props.title;
  console.log("Props:",title);
  const [fetchedResponse,setFetchedResponse] = useState({
    method:"",
    params:[],
    chainid:"0x1"
  });
  const [chainid, setchainId] = useState("0x5");
  const [isFetched,setIsFetched] = useState(false);
  //Home page component
  const home = <>
          <div>
            <h1 className='text-3xl font-bold'>DYOR</h1>
          </div>
          <div className='flex justify-center pt-2'>
            <img src={DYORLOGO} className="rounded-md logo" alt="Vite logo" />
          </div>
          <div className="card pt-5">
            <p className='text-base'>
              <code>Welcome to DYOR</code> 
            </p>
          </div>
          <p className="read-the-docs pt-3 text-sm">
            Hello adventurer <br></br>Let me help you do your own research <br></br>I'll shield you from wallet drainers and malicious dapps.
          </p>
        <div className="card pt-6 text-base">
          <p>
            <code>Your funds are SAFU</code> 
          </p>
        </div>
  </>

  // Method: personal_sign

// Message: hello

// Signer: 0xEBCE0f0e40c55E8A36691b27FE0145d7CEa431b5

  console.log("Fetched data: ",fetchedResponse);


  useEffect(() => {

    if(title != 'DYOR Shield'){
      /**
       * We can't use "chrome.runtime.sendMessage" for sending messages from React.
       * For sending messages from React we need to specify which tab to send it to.
       */
      chrome.tabs && chrome.tabs.query({
        active: true,
        }, tabs => {
        /**
         * Sends a single message to the content script(s) in the specified tab,
         * with an optional callback to run when a response is sent back.
         *
         * The runtime.onMessage event is fired in each content script running
         * in the specified tab for the current extension.
         */
        console.log("Sending message ... tabs: ",tabs);
        chrome.tabs.sendMessage(tabs[0].id || 0, "REQUEST_DATA",(response)=>{
          console.log("Response received on fronend: ",response);
  
          //Fetched data and chain id
          const dataObj = response.calldata;
          const id = response.chaindata;      
  
          //Update data
          setFetchedResponse((currobj)=>{
            return {
              ...currobj,
              ...dataObj
            }
          });
  
          setchainId(id);
  
          setIsFetched(true);
        })
      });
    }
  },[]);


  const pagedata = ()=>{
    if(title == 'DYOR Shield'){
      return home;
    }else if(title == 'DYOR Shield - Sign'){
      return (
        <SignPage method={fetchedResponse.method} message={fetchedResponse.params[0]} signer={fetchedResponse.params[1]}/>
      )
    }else{
      return(
        <ApprovePage method={fetchedResponse.method} data={fetchedResponse.params[0]} status={isFetched} chainid={chainid} />
      )
    }
  }

  // console.log("Page data: ",pagedata);

  return (
    <>
      {/* {chainid} */}
      
    <div className='flex flex-col justify-between	'>

      {pagedata()}

      {title == 'DYOR Shield'?"":<HandleIntent/>}
      
    </div>

    </>
  )
}

export default App
