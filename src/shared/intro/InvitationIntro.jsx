import { useEffect, useRef, useState } from 'react'
import { createEnvelopeScene } from './envelopeScene.js'
import { loadFonts } from './fonts.js'
import './intro.css'

const copy = {
  en: { open: 'Open the invitation', skip: 'Skip', hint: 'Tap the envelope or press Enter' },
  tr: { open: 'Davetiyeyi aç', skip: 'Geç', hint: 'Zarfa dokunun ya da Enter’a basın' },
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140
}

export default function InvitationIntro({ template, pageReady, onReveal, onDone }) {
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const buttonRef = useRef(null)
  const [stage, setStage] = useState('loading') // loading → ready → opening → leaving
  const callbacks = useRef({ onReveal, onDone })
  useEffect(() => {
    callbacks.current = { onReveal, onDone }
  }, [onReveal, onDone])
  const { intro, lang } = template
  const text = copy[lang] ?? copy.en

  useEffect(() => {
    let cancelled = false
    let scene = null

    const finish = async () => {
      await Promise.resolve(pageReady).catch(() => {})
      if (cancelled) return
      callbacks.current.onReveal()
      // give the page a frame to paint underneath before fading
      requestAnimationFrame(() => {
        if (!cancelled) setStage('leaving')
      })
    }

    loadFonts(intro).then(() => {
      if (cancelled || !hostRef.current) return
      try {
        scene = createEnvelopeScene(hostRef.current, template, { onOpened: finish })
      } catch {
        // No WebGL: go straight to the invitation.
        finish()
        return
      }
      sceneRef.current = scene
      setStage('ready')
    })

    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
    }
  }, [template, intro, pageReady])

  useEffect(() => {
    if (stage === 'ready') buttonRef.current?.focus({ preventScroll: true })
    if (stage !== 'leaving') return
    // fallback in case transitionend never fires (e.g. background tab)
    const timer = setTimeout(() => callbacks.current.onDone(), 1400)
    return () => clearTimeout(timer)
  }, [stage])

  const open = () => {
    if (stage !== 'ready') return
    setStage('opening')
    sceneRef.current?.open()
  }

  const skip = () => {
    if (stage === 'leaving') return
    if (sceneRef.current) {
      setStage('opening')
      sceneRef.current.skip()
    } else {
      callbacks.current.onReveal()
      callbacks.current.onDone()
    }
  }

  const onPointerMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = (event.clientY / window.innerHeight) * 2 - 1
    sceneRef.current?.setPointer(x, y)
  }

  return (
    <div
      className="invitation-intro"
      data-stage={stage}
      style={{
        '--intro-bg': intro.bg,
        '--intro-text': intro.text,
        '--intro-font': `"${intro.font}", Georgia, serif`,
        '--intro-hover-text': isLight(intro.text) ? intro.ink : intro.card,
      }}
      onPointerMove={onPointerMove}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && stage === 'leaving') callbacks.current.onDone()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${template.couple[0]} & ${template.couple[1]}`}
      lang={lang}
    >
      <div ref={hostRef} className="invitation-intro__stage" onClick={open} />

      <button type="button" className="invitation-intro__skip" onClick={skip}>
        {text.skip}
      </button>

      <div className="invitation-intro__actions">
        <button ref={buttonRef} type="button" className="invitation-intro__open" onClick={open} disabled={stage !== 'ready'}>
          {text.open}
        </button>
        <p className="invitation-intro__hint">{text.hint}</p>
      </div>
    </div>
  )
}
