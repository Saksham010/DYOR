
import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignPage from './components/signpage'
import HandleIntent from './components/intent'
import ApprovePage from './components/approvepage'



function App(props:{title:string}) {
  const title = props.title;
  console.log("Props:",title);
  const [count, setCount] = useState(0);
  const [fetchedResponse,setFetchedResponse] = useState({
    method:"",
    params:[]
  });
  const [isFetched,setIsFetched] = useState(false);
  //Home page component
  const home = <>
        <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
  </>

  console.log("Fetched data: ",fetchedResponse);


  useEffect(() => {
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
        setFetchedResponse((currobj)=>{
          return {
            ...currobj,
            ...response
          }
        });      
        // After fetching set fetched to true
        setIsFetched(true);
      })
    });
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
        <ApprovePage method={fetchedResponse.method} data={fetchedResponse.params[0]} status={isFetched} />
      )
    }
  }

  // console.log("Page data: ",pagedata);

  return (
    <>
      

      {pagedata()}

      <HandleIntent/>

    </>
  )
}

export default App
