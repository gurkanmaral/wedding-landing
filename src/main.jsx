import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MedDreamSparkPage from './MedDreamSparkPage.jsx'
import RoyalWeddingPage from './RoyalWeddingPage.jsx'
import MedDreamSparkTemplatePage from './MedDreamSparkTemplatePage.jsx'
import CelestialWeddingPage from './CelestialWeddingPage.jsx'
import MedDreamSparkArtDecoTemplatePage from './MedDreamSparkArtDecoTemplatePage.jsx'
import GildedRomeTemplatePage from './GildedRomeTemplatePage.jsx'
import SakuraWeddingPage from './SakuraWeddingPage.jsx'
import AutumnFallsPage from './AutumnFallsPage.jsx'
import AegeanWeddingPage from './AegeanWeddingPage.jsx'
import WeddingCardManagerPage from './WeddingCardManagerPage.jsx'
import AuthPage from './AuthPage.jsx'
import AdminPage from './AdminPage.jsx'
import { WeddingCardProvider } from './api/WeddingCardContext.jsx'

const currentPath = window.location.pathname
const routeRoot = `/${currentPath.split('/').filter(Boolean)[0] || ''}`
const authPaths = [
  '/login',
  '/register',
  '/confirm-email',
  '/resend-confirmation',
  '/forgot-password',
  '/reset-password',
  '/account',
]
const Page =
  currentPath === '/admin'
    ? AdminPage
    : authPaths.includes(currentPath)
    ? AuthPage
    : currentPath === '/manage'
    ? WeddingCardManagerPage
    : routeRoot === '/meditteraean'
    ? MedDreamSparkPage
    : routeRoot === '/spark'
      ? MedDreamSparkTemplatePage
    : routeRoot === '/artdeco'
      ? MedDreamSparkArtDecoTemplatePage
    : routeRoot === '/gilded-rome'
      ? GildedRomeTemplatePage
    : routeRoot === '/royal'
      ? RoyalWeddingPage
    : routeRoot === '/celestial'
      ? CelestialWeddingPage
    : routeRoot === '/sakura'
      ? SakuraWeddingPage
    : routeRoot === '/autumn'
      ? AutumnFallsPage
    : routeRoot === '/aegean'
      ? AegeanWeddingPage
      : App

export { Page }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WeddingCardProvider>
      <Page />
    </WeddingCardProvider>
  </StrictMode>,
)
