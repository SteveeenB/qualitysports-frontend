import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPixel, getStoredConsent } from './utils/metaPixel.js'

// Solo inicializar Pixel si el usuario ya dio consentimiento de marketing previamente
const prevConsent = getStoredConsent()
if (prevConsent?.marketing === true) {
  initPixel()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
