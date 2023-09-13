import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
export default function SignPage(props:any){

    const [element,setElement] = useState(<>Intercepting...</>);

    function hexToString(hex:string):string {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16);
          str += String.fromCharCode(charCode);
        }
        return str;
    }

    useEffect(()=>{
        if(props.method == "eth_signTypedData_v4"){

            const accessor = JSON.parse(props.signer);
            console.log("OBJ : ",accessor)


            const tempelement = <>
                <div>
                    <div>
                        <h1 className='text-3xl font-bold'>DYOR</h1>
                    </div>
                    <h1><code>Signature request</code></h1>

                    <div className='flex justify-center pt-2'>
                        <img src={logo} className="rounded-md logo" alt="DYOR logo" />
                    </div>
                    <div className="pt-4">
                        <p className="text-sm "><code>Method:</code>{props.method}</p>
                        <p className="text-sm pt-1"><code>Type:</code>{accessor.primaryType}</p>
                    </div>
                    <div><p className="text-sm pt-2">Details</p></div>
                    <div className="pt-1 bg-stone-100 rounded-md mt-7 h-40 max-h-40 flex justify-center items-center text-left">
                        <div>

                            <p className="text-xsc block"><code>Token:</code>{accessor.message.details.token}</p>
                            <p className="text-xsc block"><code>Amount:</code>{accessor.message.details.amount}</p>
                            <p className="text-xsc block"><code>Expiration:</code>{accessor.message.details.expiration}</p>
                            <p className="text-xsc block"><code>Nonce:</code>{accessor.message.details.nonce}</p>
                            <p className="text-xsc block"><code>Spender:</code>{accessor.message.spender}</p>
                            <p className="text-xsc block"><code>Token:</code>{accessor.message.sigDeadline}</p>

                        </div>
                    </div>
                </div>
            
            </>
            setElement(tempelement);
        }
        else if(props.method == 'personal_sign'){
            const tempelement = <>
                <div>
                    <div>
                        <h1 className='text-3xl font-bold'>DYOR</h1>
                    </div>
                    <h1><code>Signature request</code></h1>

                    <div className='flex justify-center pt-2'>
                        <img src={logo} className="rounded-md logo" alt="DYOR logo" />
                    </div>
                    <div className="pt-4">
                        <p className="text-sm "><code>Method:</code>{props.method}</p>
                        <p className="text-xs pt-1"><code>Signer:</code>{props.signer}</p>
                    </div>

                    <div className="p-1 bg-stone-100 rounded-md mt-7 h-40 max-h-40 flex justify-center items-center text-left">
                        <p>{props.message?hexToString(props.message):props.message}</p>

                    </div>
                </div>

            </>
            setElement(tempelement);
        }

    },[props])

    return(
        <>
            {element}
        </>
    )
}