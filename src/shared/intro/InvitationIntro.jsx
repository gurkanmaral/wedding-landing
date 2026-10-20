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

export default function InvitationIntro({ template, pageReady, pagePainted, onReveal, onDone }) {
  const hostRef = useRef(null)
  const sceneRef = useRef(null)
  const buttonRef = useRef(null)
  // a tap that lands while the scene is still loading opens it as soon as it is ready
  const pendingOpen = useRef(false)
  const [stage, setStage] = useState('loading') // loading → ready → opening; 'leaving' is derived below
  const [sceneCopy, setSceneCopy] = useState(null)
  const [caption, setCaption] = useState({ value: null, placement: 'bottom' })
  // the scene has finished and the page is mounting underneath
  const [revealed, setRevealed] = useState(false)
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
      setRevealed(true)
    }

    const load = sceneModules[`./scenes/${intro.scene ?? 'envelope'}.js`] ?? sceneModules['./scenes/envelope.js']
    // a real card's own place and date, so scenes print what the page shows
    const eventDate = String(cardDetail(card, 'eventDate', cardDetail(card, 'date', ''))).slice(0, 10)
    const personal = {
      ...template,
      couple,
      dateLabel: dateText,
      place: cardDetail(card, 'city', template.place),
      date: /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : template.date,
    }

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
  }, [template, intro, pageReady, loading, couple, dateText, lang, card])

  // The last frame of every scene is the page's opening view, so the intro
  // stays put until the page has painted beneath it and then dissolves into
  // it. A slow device still gets there: after 4s it fades regardless.
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    if (!revealed) return undefined
    const timer = setTimeout(() => setTimedOut(true), 4000)
    return () => clearTimeout(timer)
  }, [revealed])
  const view = revealed && (pagePainted || timedOut) ? 'leaving' : stage

  useEffect(() => {
    if (stage === 'ready' && pendingOpen.current) {
      pendingOpen.current = false
      setStage('opening')
      sceneRef.current?.open()
      return undefined
    }
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
    return undefined
  }, [stage])

  useEffect(() => {
    if (view !== 'leaving') return undefined
    // fallback in case transitionend never fires (e.g. background tab)
    const timer = setTimeout(() => callbacks.current.onDone(), 1400)
    return () => clearTimeout(timer)
  }, [view])

  const open = () => {
    if (stage === 'loading') {
      pendingOpen.current = true
      return
    }
    if (stage !== 'ready') return
    setStage('opening')
    sceneRef.current?.open()
  }

  const skip = () => {
    if (view === 'leaving') return
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
      data-stage={view}
      style={{
        '--intro-bg': intro.bg,
        '--intro-text': intro.text,
        '--intro-font': `"${intro.font}", Georgia, serif`,
        '--intro-hover-text': isLight(intro.text) ? intro.ink : intro.card,
      }}
      onPointerMove={onPointerMove}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && view === 'leaving') callbacks.current.onDone()
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
        <button ref={buttonRef} type="button" className="invitation-intro__open" onClick={open} disabled={view === 'opening' || view === 'leaving'}>
          {sceneCopy?.prompt ?? ui.loading}
        </button>
      </div>
    </div>
  )
}
