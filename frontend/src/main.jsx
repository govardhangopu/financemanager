import { StrictMode } from 'react'
import { AuthProvider } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FinanceProvider>
        <App />
      </FinanceProvider>
    </AuthProvider>
  </StrictMode>,
)
