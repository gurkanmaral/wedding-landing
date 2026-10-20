import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import LandingPage from '../landing/LandingPage.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { consumeOpened } from './openedFlag.js'
import { findTemplate, templates } from '../templates/registry.js'

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

export default function Router() {
  const template = findTemplate(window.location.pathname)

  useEffect(() => {
    if (template) return
    document.title = 'Wedfolio — Wedding invitation websites'
    document.documentElement.lang = 'en'
  }, [template])

  return template ? <TemplateShell template={template} /> : <LandingPage />
}
