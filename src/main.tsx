import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { userManager } from './auth/userManager'
import { edition } from './edition'

// The paper's colours and fonts (index.css)
document.documentElement.dataset.edition = edition.id

// A silent login (see AuthProvider) answers on /auth/callback inside a hidden frame. That frame
// only hands the answer to the page and never starts the site itself.
if (window.parent !== window && window.location.pathname === '/auth/callback') {
  void userManager.signinSilentCallback()
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
