import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactGA from "react-ga4";
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Initialize GA4
ReactGA.initialize("G-VQFVTCPQ72");

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
