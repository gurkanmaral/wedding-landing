import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { createTheatre } from './theatre.js'
import { useTicketTear } from './ticketTear.js'

const KICKER = { en: 'Now showing', tr: 'Vizyonda' }

// The picture palace, curtains open, the couple's title card on the silver
// screen; the same layers the intro ends on.
export default function CinemaHero({ partner1, partner2, dateLabel, timeLabel, place, lang }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  useTicketTear()

  useEffect(() => {
    const host = stageRef.current
    const root = rootRef.current
    if (!host || !root) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const afterIntro = Boolean(document.querySelector('.invitation-intro'))
    const playOwnOpening = !afterIntro && !reduce
    const theatre = createTheatre(host, {
      names: [partner1, partner2],
      lang,
      reduce,
      state: playOwnOpening ? { open: 0.05, light: 0, beam: 0 } : {},
      onLayout: (L) => root.style.setProperty('--cn-stage-y', `${L.stageY}px`),
    })
    const st = theatre.state
    let tl = null
    if (playOwnOpening) {
      tl = gsap
        .timeline({ delay: 0.35 })
        .to(st, { beam: 0.6, light: 0.4, duration: 0.06 })
        .to(st, { beam: 0.1, light: 0.1, duration: 0.06 })
        .to(st, { beam: 1, light: 1, duration: 0.4 })
        .to(st, { open: 1, duration: 2.6, ease: 'power3.inOut' }, 0.2)
    }

    const onMove = (event) => {
      theatre.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }
    const onTilt = (event) => {
      if (event.gamma == null) return
      theatre.setPointer(Math.max(-1, Math.min(1, event.gamma / 30)), Math.max(-1, Math.min(1, ((event.beta ?? 45) - 45) / 30)))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    const io = new IntersectionObserver(([entry]) => theatre.setPaused(!entry.isIntersecting))
    io.observe(root)

    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      tl?.kill()
      theatre.dispose()
    }
  }, [partner1, partner2, lang])

  return (
    <header ref={rootRef} className="cn-hero">
      <div ref={stageRef} className="cn-hero-stage" />
      <h1 className="cn-sr">
        {partner1} &amp; {partner2}
      </h1>
      <p className="cn-hero-kicker">{KICKER[lang] ?? KICKER.en}</p>
      <p className="cn-hero-date">{dateLabel}</p>
      <p className="cn-hero-place">
        {place}
        {timeLabel ? <span> · {timeLabel}</span> : null}
      </p>
    </header>
  )
}
