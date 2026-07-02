import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { CustomerProvider } from './context/CustomerContext.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CustomerProvider>
      <App />
    </CustomerProvider>
  </BrowserRouter>,
)
