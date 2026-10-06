import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { initAnalytics } from './lib/analytics.ts'
import { captureUtmOnLoad } from './lib/waitlist.ts'
import './index.css'

captureUtmOnLoad()
initAnalytics()

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root is missing.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
