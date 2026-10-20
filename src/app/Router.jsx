import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
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

function TemplateShell({ template }) {
  // 'intro' → envelope only, 'reveal' → page mounted under a fading intro, 'done' → page only
  const [phase, setPhase] = useState(() => (introDisabled(template) ? 'done' : 'intro'))
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
    const previous = style.overflow
    style.overflow = 'hidden'
    return () => {
      style.overflow = previous
    }
  }, [phase])

  return (
    <>
      {phase !== 'intro' && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Page />
          </Suspense>
        </ErrorBoundary>
      )}
      {phase !== 'done' && (
        <Suspense fallback={<div className="fixed inset-0 z-[100]" style={{ background: template.intro.bg }} />}>
          <InvitationIntro
            template={template}
            pageReady={pageReady}
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
