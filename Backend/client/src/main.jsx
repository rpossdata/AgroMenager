import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // .jsx is inferred
import './index.css'

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
