import logo from "../assets/logo.png";
import {parseApprovalData} from "../../helper";
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
        signature:''
    });

    const [erc721data,setERC721Data] = useState({
        from:"",
        to:"",
        spender:"",
        id:-1,
        name:'',
        symbol:'',
        signature:'',
        imgpath:''
    })


    console.log("Props: ",props);
    console.log("ERC20data :",erc20data);
    // console.log("APPR PROPS: ",props);

    useEffect(()=>{

        async function fetchAndSetERC20Data(){
            const data:string = props.data.data;
            const eoaFrom:string = props.data.from;
            const contractTo:string = props.data.to; 
            const {signature,spender,value} = parseApprovalData(data); 

            // const provider = new ethers.BrowserProvider(window.ethereum);
            const provider = new ethers.JsonRpcProvider("");
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
                    signature:signature
                }
            })
        }

        async function fetchAndSetERC721Data(){
            const data:string = props.data.data;
            const eoaFrom:string = props.data.from;
            const contractTo:string = props.data.to; 
            const {signature,spender,value} = parseApprovalData(data); 

            const provider = new ethers.JsonRpcProvider("https://goerli.infura.io/v3/fa87d92eec3b4a9da73b6efebd186450");
            const contract = new ethers.Contract(contractTo,ERC721ABI,provider);
            const name = await contract.name();
            const symbol = await contract.symbol();
            const tokenURI = await contract.tokenURI(value);

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
                    imgpath:tokenURI
                }
            })

        }


        if(props.status){
            const {signature} = parseApprovalData(props.data.data); 

            if(signature == approve){

                fetchAndSetERC20Data();
            }
            else if(signature == approveForAll){
                fetchAndSetERC721Data();
            }else{
                console.log("Propstatus: ",props.status);
            }
    
        }
    },[props])

    const approvalElement =
    <>
        <h1>Approve token</h1>
        <img src={logo}></img>

        <h5>Method: {props.method}</h5>
        <h5>From: {erc20data.from}</h5> 
        <h5>Contract: {erc20data.to}</h5>
        <h5>Spender: {erc20data.spender}</h5>

        <h5>Token Name: {erc20data.name} </h5>
        <h5>This allows spender to spend {erc20data.value} {erc20data.symbol} tokens on your behalf</h5>

    </>

    const approveForAllElement = 
    <>
        <h1>Approve NFT</h1>
        <img src={logo}></img>

        <h5>Method: {props.method}</h5>
        <h5>From: {erc721data.from}</h5> 
        <h5>Contract: {erc721data.to}</h5>
        <h5>Spender: {erc721data.spender}</h5>

        <h5>Token Name: {erc721data.name} </h5>
        <img src={erc721data.imgpath}></img>
        <h5>This allows spender to spend {erc721data.symbol} nft id : {erc721data.id}  on your behalf</h5>


    </>

    const element = ()=>{
        if(props.method == approve){
            return approvalElement;
        }
        else if(props.method == approveForAll){
            return approveForAllElement;
        }
        else{
            return approvalElement;
        }

    }


    return(
        <>
            {element()}

        </>
    )
}