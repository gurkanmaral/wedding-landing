import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import Router from './app/Router.jsx'
import { I18nProvider } from './app/i18n.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <Router />
    </I18nProvider>
  </StrictMode>,
)
