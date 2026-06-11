import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MedDreamSparkPage from './MedDreamSparkPage.jsx'
import RoyalWeddingPage from './RoyalWeddingPage.jsx'

const currentPath = window.location.pathname
const Page =
  currentPath === '/meditteraean'
    ? MedDreamSparkPage
    : currentPath === '/royal'
      ? RoyalWeddingPage
      : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
