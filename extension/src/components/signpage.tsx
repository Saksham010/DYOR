import logo from "../assets/logo.png";
export default function SignPage(props:any){

    function hexToString(hex:string):string {
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16);
          str += String.fromCharCode(charCode);
        }
        return str;
    }



    return(
        <>
            <h1>Sign your message</h1>

            <img src={logo}></img>

            <p>Method: {props.method}</p>
            <p>Message: {props.message?hexToString(props.message):props.message}</p>
            <p>Signer: {props.signer}</p>

        </>
    )
}