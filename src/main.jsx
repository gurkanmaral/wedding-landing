import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MedDreamSparkPage from './MedDreamSparkPage.jsx'
import RoyalWeddingPage from './RoyalWeddingPage.jsx'
import MedDreamSparkTemplatePage from './MedDreamSparkTemplatePage.jsx'
import CelestialWeddingPage from './CelestialWeddingPage.jsx'
import MedDreamSparkArtDecoTemplatePage from './MedDreamSparkArtDecoTemplatePage.jsx'

const currentPath = window.location.pathname
const Page =
  currentPath === '/meditteraean'
    ? MedDreamSparkPage
    : currentPath === '/spark'
      ? MedDreamSparkTemplatePage
    : currentPath === '/artdeco'
      ? MedDreamSparkArtDecoTemplatePage
    : currentPath === '/royal'
      ? RoyalWeddingPage
    : currentPath === '/celestial'
      ? CelestialWeddingPage
      : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
