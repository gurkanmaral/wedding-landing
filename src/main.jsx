import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MeditteraeanPage from './MeditteraeanPage.jsx'

const currentPath = window.location.pathname
const Page = currentPath === '/meditteraean' ? MeditteraeanPage : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
