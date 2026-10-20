import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import LandingPage from '../landing/LandingPage.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { consumeOpened } from './openedFlag.js'
import { findTemplate, templates } from '../templates/registry.js'
import { WeddingCardProvider } from '../api/WeddingCardContext.jsx'

const AdminPage = lazy(() => import('../admin/AdminPage.jsx'))
const WeddingCardManagerPage = lazy(() => import('../admin/WeddingCardManagerPage.jsx'))
const AuthPage = lazy(() => import('../account/AuthPage.jsx'))
const DesignPage = lazy(() => import('../landing/DesignPage.jsx'))

const AUTH_PATHS = ['/login', '/register', '/confirm-email', '/resend-confirmation', '/forgot-password', '/reset-password', '/account']

const InvitationIntro = lazy(() => import('../shared/intro/InvitationIntro.jsx'))
const pages = Object.fromEntries(templates.map((t) => [t.slug, lazy(t.load)]))

function introDisabled(template) {
  const params = new URLSearchParams(window.location.search)
  if (params.get('intro') === 'off') return true
  if (consumeOpened() === template.slug) return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Rendered after the page inside the same Suspense boundary, so its effect
// only runs once the page has committed; two frames later it has painted.
function Painted({ onPainted }) {
  const callback = useRef(onPainted)
  useEffect(() => {
    let second = 0
    let timer = 0
    // a short grace period lets WebGL heroes compile and draw their first frame
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        timer = setTimeout(() => callback.current(), 200)
      })
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
      clearTimeout(timer)
    }
  }, [])
  return null
}

const pageFallback = <div style={{ minHeight: '100svh', background: 'var(--boot-bg, transparent)' }} />

function TemplateShell({ template }) {
  // 'intro' → envelope only, 'reveal' → page mounted under a fading intro, 'done' → page only
  const [phase, setPhase] = useState(() => (introDisabled(template) ? 'done' : 'intro'))
  // the intro holds its last frame until the page underneath has painted
  const [painted, setPainted] = useState(false)
  const Page = pages[template.slug]
  // Start downloading the page while the envelope is on screen.
  const pageReady = useMemo(() => template.load(), [template])

  useEffect(() => {
    document.title = template.title
    document.documentElement.lang = template.lang
  }, [template])

  useEffect(() => {
    if (phase !== 'intro') return
    window.scrollTo(0, 0)
    const { style } = document.documentElement
    const previous = { overflow: style.overflow, background: style.background }
    style.overflow = 'hidden'
    // the scrollbar gutter beside the intro shows the root background
    style.background = template.intro.bg
    return () => {
      style.overflow = previous.overflow
      style.background = previous.background
    }
  }, [phase, template])

  return (
    <>
      {phase !== 'intro' && (
        <ErrorBoundary>
          <Suspense fallback={pageFallback}>
            <Page />
            <Painted onPainted={() => setPainted(true)} />
          </Suspense>
        </ErrorBoundary>
      )}
      {phase !== 'done' && (
        <Suspense fallback={<div className="fixed inset-0 z-[100]" style={{ background: template.intro.bg }} />}>
          <InvitationIntro
            template={template}
            pageReady={pageReady}
            pagePainted={painted}
            onReveal={() => setPhase('reveal')}
            onDone={() => setPhase('done')}
          />
        </Suspense>
      )}
    </>
  )
}

function appPage(pathname) {
  if (pathname.startsWith('/tasarim/')) return 'design'
  if (pathname === '/admin') return 'admin'
  if (pathname === '/manage') return 'manage'
  if (AUTH_PATHS.includes(pathname)) return 'auth'
  return null
}

export default function Router() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const app = appPage(pathname)
  const template = app ? null : findTemplate(pathname)

  useEffect(() => {
    if (template || app) return
    document.title = 'Wedfolio — Online düğün davetiyeleri'
    document.documentElement.lang = 'tr'
  }, [template, app])

  if (app) {
    return (
      <ErrorBoundary>
        <Suspense fallback={null}>
          {app === 'admin' && <AdminPage />}
          {app === 'manage' && <WeddingCardManagerPage />}
          {app === 'auth' && <AuthPage />}
          {app === 'design' && <DesignPage slug={decodeURIComponent(pathname.split('/')[2] ?? '')} />}
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <WeddingCardProvider>{template ? <TemplateShell template={template} /> : <LandingPage />}</WeddingCardProvider>
  )
}
