import logo from "../assets/logo.png";
import {parseApprovalData,getRPCURL} from "../../helper";
import {approve,approveForAll} from "../../signature";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ERC20ABI from "../ABI/erc20abi.json";
import ERC721ABI from "../ABI/erc721.json";

export default function ApprovePage(props:any){

    const [erc20data,setERC20Data] = useState({
        from:"",
        to:"",
        spender:"",
        value:0,
        name:'',
        symbol:'',
        signature:'',
        element:<></>
    });

    const [erc721data,setERC721Data] = useState({
        from:"",
        to:"",
        spender:"",
        id:-1,
        name:'',
        symbol:'',
        signature:'',
        imgpath:'',
        element:<></>
    });
    const [element,setElement] = useState(<>Intercepting...</>)


    console.log("Props: ",props);
    console.log("ERC721data :",erc721data);
    console.log("ERC20: ",erc20data);
    
    // console.log("APPR PROPS: ",props);

    useEffect(()=>{

        async function fetchAndSetERC20Data(){
            const data:string = props.data.data;
            const eoaFrom:string = props.data.from;
            const contractTo:string = props.data.to; 
            const {signature,spender,value} = parseApprovalData(data); 

            // const provider = new ethers.BrowserProvider(window.ethereum);
            // const provider = new ethers.JsonRpcProvider("");
            // const provider = new ethers.JsonRpcProvider("https://polygon-testnet-rpc.allthatnode.com:8545");
            const chainid:string = props.chainid;
            const rpc_url:string = getRPCURL(chainid);
            const provider = new ethers.JsonRpcProvider(rpc_url);
            const contract = new ethers.Contract(contractTo,ERC20ABI,provider);
            const name = await contract.name();
            const symbol = await contract.symbol();

            //Update information
            setERC20Data((obj)=>{
                return {
                    ...obj,
                    from:eoaFrom,
                    to:contractTo,
                    spender:spender,
                    value:value,
                    name:name,
                    symbol:symbol,
                    signature:signature,
                }
            });

            const element = <>
                <div>
                    <h1 className='text-3xl font-bold'>DYOR</h1>
                </div>
                <h1><code>Token Approval request</code></h1>
                <div className='flex justify-center pt-2'>
                    <img src={logo} className="rounded-md logo" alt="DYOR logo" />
                </div>
                <div className="pt-4">
                    <p className="text-sm "><code>Method:</code>{props.method}</p>
                    <p className="text-sm "><code>Token:</code>{name}</p>
                    <p className="text-xs pt-1"><code>Signer:</code>{eoaFrom}</p>
                    <p className="text-xs pt-1"><code>Interacting with:</code>{contractTo}</p>

                </div>

                <div className="p-1 bg-stone-100 rounded-md mt-7 h-40 max-h-40 flex justify-center items-center">
                    <p>Approving will allow the "{spender}" to spend {value} {symbol} tokens on your behalf</p>

                </div>                
            </>
            setElement(element);

//{"types":{"PermitSingle":[{"name":"details","type":"PermitDetails"},{"name":"spender","type":"address"},{"name":"sigDeadline","type":"uint256"}],"PermitDetails":[{"name":"token","type":"address"},{"name":"amount","type":"uint160"},{"name":"expiration","type":"uint48"},{"name":"nonce","type":"uint48"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"Permit2","chainId":"5","verifyingContract":"0x000000000022d473030f116ddee9f6b43ac78ba3"},"primaryType":"PermitSingle","message":{"details":{"token":"0x9e9adc71262ab77b460e80d41dded76dd43407e9","amount":"1461501637330902918203684832716283019655932542975","expiration":"1697188333","nonce":"0"},"spender":"0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad","sigDeadline":"1694598133"}}
        }

        async function fetchAndSetERC721Data(signature:string,spender:string,value:number){
            const eoaFrom:string = props.data.from;
            const contractTo:string = props.data.to; 

            const provider = new ethers.JsonRpcProvider("https://goerli.infura.io/v3/fa87d92eec3b4a9da73b6efebd186450");
            // const provider = new ethers.JsonRpcProvider("https://polygon-testnet-rpc.allthatnode.com:8545");
            // const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com");
            const contract = new ethers.Contract(contractTo,ERC721ABI,provider);
            const name = await contract.name();
            const symbol = await contract.symbol();
            const tokenURI = await contract.tokenURI(value);
            // const response:any = await fetch(tokenURI);
            // const imgURL = await response["image"];

            
            // console.log("name: ",name," symbol:", symbol," uri: ",tokenURI,"image: ",imgURL);

            //Update information
            setERC721Data((obj)=>{
                return {
                    ...obj,
                    from:eoaFrom,
                    to:contractTo,
                    spender:spender,
                    id:value,
                    name:name,
                    symbol:symbol,
                    signature:signature,
                    imgpath:tokenURI,
                }
            });
            
            const element = <>
                <h1>Approve NFT</h1>
                <img src={logo}></img>

                <h5>Method: {props.method}</h5>
                <h5>From: {eoaFrom}</h5> 
                <h5>Contract: {contractTo}</h5>
                <h5>Spender: {spender}</h5>

                <h5>Token Name: {name} </h5>
                <img src={tokenURI}></img>
                <h5>This allows spender to spend {symbol} nft id : {value}  on your behalf</h5>

            </>
            setElement(element);

        }


        if(props.status){
            const {signature,spender,value} = parseApprovalData(props.data.data); 
            console.log("Signature: ",signature);
            console.log("approve: ",approve);

            if(signature == approve){
                console.log("Singature == approve");

                fetchAndSetERC20Data();

            }
            else if(signature == approveForAll){
                console.log("Singature == approveforall");

                fetchAndSetERC721Data(signature,spender,value);
 
            }
    
        }
    },[props])


    // const getElement =()=>{
    //     if(props){

    //         const {signature} = parseApprovalData(props.data.data);
    //         if(signature == approve){
    //             return <>
    //                 <h1>Approve token</h1>
    //                 <img src={logo}></img>
    
    //                 <h5>Method: {props.method}</h5>
    //                 <h5>From: {erc20data.from}</h5> 
    //                 <h5>Contract: {erc20data.to}</h5>
    //                 <h5>Spender: {erc20data.spender}</h5>
    
    //                 <h5>Token Name: {erc20data.name} </h5>
    //                 <h5>This allows spender to spend {erc20data.value} {erc20data.symbol} tokens on your behalf</h5>
                        
    //             </>
    //         }else if(signature == approveForAll){
    //             return <>
    //                 <h1>Approve NFT</h1>
    //                 <img src={logo}></img>
    
    //                 <h5>Method: {props.method}</h5>
    //                 <h5>From: {erc721data.from}</h5> 
    //                 <h5>Contract: {erc721data.to}</h5>
    //                 <h5>Spender: {erc721data.spender}</h5>
    
    //                 <h5>Token Name: {erc721data.name} </h5>
    //                 <img src={erc721data.imgpath}></img>
    //                 <h5>This allows spender to spend {erc721data.symbol} nft id : {erc721data.id}  on your behalf</h5>
    
    //             </>
    //         }else{
    //             return <>Default</>
    //         }
    //     }
    //     return <>Noprops</>


    // }




    return(
        <>
            {element}

        </>
    )
}