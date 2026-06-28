import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactFlowProvider } from '@xyflow/react'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </AuthGate>
  </React.StrictMode>,
)
