
    /*global chrome*/
import { useState,useEffect } from 'react'
import './App.css'
import SignPage from './components/signpage'
import HandleIntent from './components/intent'
import ApprovePage from './components/approvepage'
import DYORLOGO from "./assets/logo.png";
import { getRPCURL, getSignature } from '../helper'
import { approve, approveForAll } from '../signature'
import { FetchedResponseInterface } from './interface/interface'
import { ethers } from "ethers";
import { whatsabi } from "@shazow/whatsabi";

function App(props:{title:string}) {
  const title = props.title;
  console.log("Props:",title);


  const [fetchedResponse,setFetchedResponse] = useState<FetchedResponseInterface>({
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
        chrome.tabs.sendMessage(tabs[0].id || 0, "REQUEST_DATA",(response:any)=>{
          console.log("Response received on fronend: ",response);
  
          //Fetched data and chain id
          const dataObj = response.calldata;
          const id = response.chaindata;   
          // const eventmethod = response.method; //Get event method   
          console.log("Data obj : ",dataObj);
  
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


  const getabi = async (provider:any,address:string,signature:string) =>{
    const code = await provider.getCode(address);
    const selectors = whatsabi.selectorsFromBytecode(code);
    console.log("SELECTORS: ",selectors);
    // Check if the signature matches
    selectors.map((s)=>{
      if(s == '0x'+signature){
        console.log("Function selector match found");
      }
    });
    const abi = whatsabi.abiFromBytecode(code);
    console.log("ABI: ",abi);
    return {abi};
  }


  const pagedata = ()=>{

    if(title == 'DYOR Shield'){
      return home;
    }else{
      // If the data hasnot been fetched
      if(!isFetched){
        return (<h1>Fetching...</h1>);
      }

      if(fetchedResponse.method == "personal_sign" || fetchedResponse.method == "eth_signTypedData_v4"){
        return (
          <SignPage method={fetchedResponse.method} message={fetchedResponse.params[0]} signer={fetchedResponse.params[1]}/>
        )
      }else{
        
        //Identify method
        const signature = getSignature(fetchedResponse.params[0].data);
        console.log("Fetched signature: ",signature);

        if(signature == approve || signature == approveForAll){
          console.log("Signature matched approval: ",signature);
          return(
            <ApprovePage method={fetchedResponse.method} data={fetchedResponse.params[0]} status={isFetched} chainid={chainid} signaturetype={signature}/>
          )
        }
        else{
          //To decode calldata
          const targetContract = fetchedResponse.params[0].to;
          const RPC_URL = getRPCURL(fetchedResponse.chainid);
          const provider = new ethers.JsonRpcProvider(RPC_URL);

          const tx = {
            method:fetchedResponse.method,
            params:fetchedResponse.params
          }
          console.log("Transaction: ",tx);

          //API call to the server to get the response
          
          // Load bytecode 
          getabi(provider,targetContract,signature).then((abi)=>{
            //Pass it to hardhat
            console.log("GOT abi: ",abi);

          })
          console.log("To decode response: ",fetchedResponse);
          return(
            <h1>No matching signature found</h1>
          )
        }
      }

    }
  }

  // "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000652d142000000000000000000000000000000000000000000000000000000000000000030a000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001600000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000ffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000065549cd600000000000000000000000000000000000000000000000000000000000000000000000000000000000000003fc91a3afd70395cd496c647d5a6cc9d4b2b7fad00000000000000000000000000000000000000000000000000000000652d16de00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000416b82c1dbc2e294a49628d52bac21175429013d67161732b68d21f48b012e767c4a9b627df4261c4a16c2fe62ed06a7adfa38d7eb206ddb3636530364d2e8fa351c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000006a94d74f43000000000000000000000000000000000000000000000000000000b7268912391a4500000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b1f9840a85d5af5bf1d1762f925bdaddc4201f9840001f4fff9976782d46cc05630d1f6ebab18b2324d6b140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000b7268912391a45"


  // console.log("Page data: ",pagedata);

  console.log("Fetched Response: ",fetchedResponse );

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
