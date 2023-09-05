// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'



const title = document.getElementsByTagName('title')[0].innerText;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <App title={title}/>
)
