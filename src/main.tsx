import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const preventZoom = (event: Event) => event.preventDefault()
document.addEventListener('gesturestart', preventZoom, { passive: false })
document.addEventListener('gesturechange', preventZoom, { passive: false })
document.addEventListener('gestureend', preventZoom, { passive: false })
document.addEventListener('dblclick', preventZoom, { passive: false })
document.addEventListener('touchmove', event => {
  const scale = (event as TouchEvent & { scale?: number }).scale
  if (typeof scale === 'number' && scale !== 1) event.preventDefault()
}, { passive: false })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
