import { useEffect, useMemo, useRef, useState } from 'react'
import { cardDetail, useWeddingCard } from '../../api/weddingCardContext'
import { loadFontList } from './fonts.js'
import './intro.css'

// Each template names its scene in the registry (intro.scene); default is the envelope.
const sceneModules = import.meta.glob('./scenes/*.js')

const uiCopy = {
  en: { skip: 'Skip', loading: 'Preparing your invitation' },
  tr: { skip: 'Geç', loading: 'Davetiyeniz hazırlanıyor' },
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140
}

function formatDate(dateValue, lang) {
  const date = new Date(dateValue)
  if (!Number.isFinite(date.getTime())) return ''
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function InvitationIntro({ template, pageReady, onReveal, onDone }) {
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const buttonRef = useRef(null)
  const [stage, setStage] = useState('loading') // loading → ready → opening → leaving
  const [sceneCopy, setSceneCopy] = useState(null)
  const [caption, setCaption] = useState({ value: null, placement: 'bottom' })
  const callbacks = useRef({ onReveal, onDone })
  useEffect(() => {
    callbacks.current = { onReveal, onDone }
  }, [onReveal, onDone])

  const { intro, lang } = template
  const ui = uiCopy[lang] ?? uiCopy.en
  const { card, loading } = useWeddingCard()

  // The couple's own names and date when the link is for a real card.
  const couple = useMemo(() => {
    const [a, b] = (card?.name || '').split('&').map((v) => v.trim())
    return [cardDetail(card, 'partner1', a || template.couple[0]), cardDetail(card, 'partner2', b || template.couple[1])]
  }, [card, template])
  const dateText = useMemo(
    () => cardDetail(card, 'dateLabel', formatDate(cardDetail(card, 'eventDate', `${template.date}T12:00:00`), lang)),
    [card, template, lang],
  )

  useEffect(() => {
    if (loading) return undefined
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

    const load = sceneModules[`./scenes/${intro.scene ?? 'envelope'}.js`] ?? sceneModules['./scenes/envelope.js']
    const personal = { ...template, couple, dateLabel: dateText }

    load()
      .then(async (mod) => {
        await loadFontList(mod.fonts?.(personal) ?? [])
        if (cancelled || !hostRef.current) return
        setSceneCopy(mod.copy?.[lang] ?? mod.copy?.en ?? null)
        scene = mod.default(hostRef.current, personal, {
          onOpened: finish,
          setCaption: (value, placement = 'bottom') => !cancelled && setCaption({ value, placement }),
        })
        sceneRef.current = scene
        setStage('ready')
      })
      .catch(() => {
        // No WebGL or the scene failed: go straight to the invitation.
        finish()
      })

    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
    }
  }, [template, intro, pageReady, loading, couple, dateText, lang])

  useEffect(() => {
    if (stage === 'ready') {
      // Enter or Space opens it without moving focus (no focus ring over the scene)
      const onKey = (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        buttonRef.current?.click()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (stage !== 'leaving') return undefined
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
    sceneRef.current?.setPointer?.(x, y)
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
      aria-label={`${couple[0]} & ${couple[1]}`}
      lang={lang}
    >
      <div ref={hostRef} className="invitation-intro__stage" onClick={open} />

      <p
        className="invitation-intro__caption"
        data-visible={caption.value === 'date'}
        data-placement={caption.placement}
        aria-live="polite"
      >
        {caption.value === 'date' ? dateText : ''}
      </p>

      <button type="button" className="invitation-intro__skip" onClick={skip}>
        {ui.skip}
      </button>

      <div className="invitation-intro__actions">
        <button ref={buttonRef} type="button" className="invitation-intro__open" onClick={open} disabled={stage !== 'ready'}>
          {sceneCopy?.prompt ?? ui.loading}
        </button>
      </div>
    </div>
  )
}
