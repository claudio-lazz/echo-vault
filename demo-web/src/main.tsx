import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@solana/wallet-adapter-react-ui/styles.css'
import { Buffer } from 'buffer'
import App from './App.tsx'
import { SolanaProvider } from './lib/solana'
import { ToastProvider } from './lib/toast'

if (!window.Buffer) {
  window.Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </SolanaProvider>
  </StrictMode>,
)
