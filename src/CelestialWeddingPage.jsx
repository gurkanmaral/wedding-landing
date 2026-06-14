import { useEffect, useMemo, useRef, useState } from 'react'

const EVENT_DATE = new Date('2026-09-12T17:30:00-07:00')

const schedule = [
  {
    phase: 10,
    time: '4:30 in the afternoon',
    title: 'Arrival & Stardust',
    body: 'Find your seat as the sun begins to set over the vineyard. Sparkling wine awaits.',
  },
  {
    phase: 35,
    time: '5:30 in the evening',
    title: 'The Ceremony',
    body: 'We exchange our vows beneath the old oak as the first stars appear.',
  },
  {
    phase: 60,
    time: '6:30 in the evening',
    title: 'Cocktails & Constellations',
    body: 'Golden-hour drinks, canapes and a little stargazing on the terrace.',
  },
  {
    phase: 82,
    time: '8:00 in the evening',
    title: 'Dinner Beneath the Stars',
    body: 'A long-table feast under a canopy of lights and open sky.',
  },
  {
    phase: 100,
    time: '10:00 till late',
    title: 'Dancing & Moonlight',
    body: 'The band plays, the floor opens, and we celebrate until the moon is high.',
  },
]

const venueDetails = [
  {
    key: 'Ceremony',
    value: 'Open-air, on the East Lawn beneath the old oak. Arrive by 5:00pm.',
  },
  {
    key: 'Parking',
    value: 'Complimentary valet at the main gate, plus a shuttle from The Stellar Hotel.',
  },
  {
    key: 'Stay',
    value: 'Room block held under "Aurora & Elias" until 1 August 2026.',
  },
]

const gallery = [
  'First rooftop evening',
  'Late-night city walk',
  'Autumn proposal',
  'Vineyard weekend',
  'Moonlit dinner',
  'Favorite memory',
]

function getCountdownParts() {
  let diff = Math.max(0, EVENT_DATE.getTime() - Date.now())
  const days = Math.floor(diff / 864e5)
  diff -= days * 864e5
  const hours = Math.floor(diff / 36e5)
  diff -= hours * 36e5
  const minutes = Math.floor(diff / 6e4)
  diff -= minutes * 6e4
  const seconds = Math.floor(diff / 1e3)

  return [
    { label: 'Days', value: String(days).padStart(3, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Minutes', value: String(minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(seconds).padStart(2, '0') },
  ]
}

function Divider({ mark = 'moon' }) {
  return (
    <div className="cw-divider" aria-hidden="true">
      <span className="cw-bar" />
      <svg viewBox="0 0 28 28" className="cw-divider-mark">
        {mark === 'moon' ? (
          <path d="M18.7 23.6a10.2 10.2 0 0 1-9.8-16.8 9 9 0 1 0 12.3 12.3 10 10 0 0 1-2.5 4.5Z" />
        ) : (
          <path d="M14 2.8 16.8 11 25 14l-8.2 2.8L14 25l-2.8-8.2L3 14l8.2-3Z" />
        )}
      </svg>
      <span className="cw-bar right" />
    </div>
  )
}

function PhotoSlot({ label, className = '' }) {
  return (
    <div className={`cw-photo-slot ${className}`}>
      <div className="cw-photo-orbit" />
      <span>{label}</span>
    </div>
  )
}

export default function CelestialWeddingPage() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const [countdown, setCountdown] = useState(getCountdownParts)
  const [attending, setAttending] = useState('yes')
  const [formState, setFormState] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const firstName = useMemo(
    () => formState.name.trim().split(' ')[0] || 'friend',
    [formState.name],
  )

  useEffect(() => {
    const interval = window.setInterval(() => setCountdown(getCountdownParts()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targets = [...rootRef.current.querySelectorAll('.cw-reveal:not(.in)')]
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('in')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.18 },
    )

    targets.forEach((target) => observer.observe(target))
    if (reduceMotion) targets.forEach((target) => target.classList.add('in'))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let frame = 0
    let stars = []
    let meteors = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = canvas.width = rect.width * ratio
      height = canvas.height = rect.height * ratio
      const count = Math.min(220, Math.floor((rect.width * rect.height) / 4200))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.4 + 0.3) * ratio,
        glow: Math.random() < 0.12,
        phase: Math.random(),
        speed: Math.random() * 0.02 + 0.004,
      }))
    }

    const spawnMeteor = () => {
      if (reduceMotion) return
      meteors.push({
        x: Math.random() * width * 0.7,
        y: Math.random() * height * 0.4,
        length: (Math.random() * 120 + 90) * (window.devicePixelRatio || 1),
        speed: (Math.random() * 7 + 7) * (window.devicePixelRatio || 1),
        alpha: 1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      stars.forEach((star) => {
        star.phase += star.speed
        const twinkle = 0.5 + 0.5 * Math.sin(star.phase * Math.PI * 2)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, 7)
        ctx.fillStyle = star.glow
          ? `rgba(240,210,150,${0.35 + twinkle * 0.6})`
          : `rgba(232,235,250,${0.25 + twinkle * 0.65})`
        ctx.shadowBlur = star.glow ? 8 * (window.devicePixelRatio || 1) : 0
        ctx.shadowColor = 'rgba(240,210,150,.7)'
        ctx.fill()
      })

      ctx.shadowBlur = 0
      for (let i = meteors.length - 1; i >= 0; i -= 1) {
        const meteor = meteors[i]
        const gradient = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - meteor.length,
          meteor.y - meteor.length * 0.45,
        )
        gradient.addColorStop(0, `rgba(255,240,200,${meteor.alpha})`)
        gradient.addColorStop(1, 'rgba(255,240,200,0)')
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.6 * (window.devicePixelRatio || 1)
        ctx.beginPath()
        ctx.moveTo(meteor.x, meteor.y)
        ctx.lineTo(meteor.x - meteor.length, meteor.y - meteor.length * 0.45)
        ctx.stroke()
        meteor.x += meteor.speed
        meteor.y += meteor.speed * 0.45
        meteor.alpha -= 0.012
        if (meteor.alpha <= 0) meteors.splice(i, 1)
      }

      frame = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    const meteorTimer = window.setInterval(() => {
      if (Math.random() < 0.6) spawnMeteor()
    }, 3800)
    const firstMeteor = window.setTimeout(spawnMeteor, 1400)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(meteorTimer)
      window.clearTimeout(firstMeteor)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const onSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formState.name.trim()) nextErrors.name = true
    if (
      attending === 'yes' &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.email.trim())
    ) {
      nextErrors.email = true
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitted(true)
  }

  return (
    <div ref={rootRef} className="celestial-page">
      <style>{`
        .celestial-page {
          --night-0: oklch(0.13 0.035 268);
          --night-1: oklch(0.16 0.045 266);
          --night-2: oklch(0.20 0.052 264);
          --night-3: oklch(0.25 0.055 262);
          --panel: oklch(0.155 0.04 268);
          --gold: oklch(0.83 0.108 84);
          --gold-soft: oklch(0.86 0.07 86);
          --gold-deep: oklch(0.70 0.10 76);
          --starlight: oklch(0.96 0.012 90);
          --mist: oklch(0.80 0.028 270);
          --mist-dim: oklch(0.66 0.03 272);
          --line: oklch(0.40 0.04 270 / 0.45);
          background: var(--night-0);
          color: var(--starlight);
          font-family: "Cormorant Garamond", Georgia, serif;
          overflow-x: hidden;
        }
        .celestial-page * { box-sizing: border-box; }
        .celestial-page section { position: relative; }
        .cw-eyebrow {
          color: var(--gold);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .74rem;
          font-weight: 400;
          letter-spacing: .42em;
          text-transform: uppercase;
        }
        .cw-eyebrow.dim { color: var(--mist-dim); }
        .cw-script { font-style: italic; font-weight: 500; }
        .cw-wrap { width: min(1120px, calc(100% - 56px)); margin: 0 auto; }
        .cw-section { padding: clamp(80px, 12vh, 150px) 0; }
        .cw-section-head { margin-bottom: 64px; text-align: center; }
        .cw-section-head h2,
        .cw-story-copy h2,
        .cw-venue-info h2 {
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: 0;
        }
        .cw-section-head h2 {
          margin: 18px 0 0;
          font-size: clamp(2.4rem, 5.5vw, 4rem);
        }
        .cw-lead {
          max-width: 560px;
          margin: 18px auto 0;
          color: var(--mist);
          font-size: 1.2rem;
        }
        .cw-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: var(--gold);
        }
        .cw-bar {
          height: 1px;
          width: 64px;
          background: linear-gradient(90deg, transparent, var(--gold-deep));
        }
        .cw-bar.right { background: linear-gradient(90deg, var(--gold-deep), transparent); }
        .cw-divider-mark {
          width: 22px;
          height: 22px;
          fill: currentColor;
          filter: drop-shadow(0 0 8px oklch(0.84 0.1 84 / .35));
        }
        .cw-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 1.1s cubic-bezier(.2,.7,.2,1), transform 1.1s cubic-bezier(.2,.7,.2,1);
        }
        .cw-reveal.in { opacity: 1; transform: none; }
        .cw-d1 { transition-delay: .12s; }
        .cw-d2 { transition-delay: .24s; }
        .cw-d3 { transition-delay: .36s; }
        .cw-hero {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 24px 60px;
          text-align: center;
          background:
            radial-gradient(120% 90% at 50% 8%, oklch(0.26 0.07 270 / .55), transparent 60%),
            radial-gradient(120% 120% at 50% 120%, oklch(0.30 0.06 300 / .35), transparent 55%),
            linear-gradient(180deg, var(--night-1), var(--night-0));
        }
        .cw-starfield { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .cw-hero-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; }
        .cw-moon {
          width: 120px;
          height: 120px;
          margin-bottom: 36px;
          position: relative;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 32%, oklch(0.96 0.02 92), oklch(0.86 0.05 86) 60%, oklch(0.74 0.08 80));
          box-shadow: 0 0 0 1px oklch(0.9 0.05 88 / .25), 0 0 60px oklch(0.86 0.09 86 / .55), 0 0 140px oklch(0.84 0.1 84 / .35);
        }
        .cw-moon::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            radial-gradient(circle at 70% 64%, oklch(0.74 0.06 80 / .55), transparent 42%),
            radial-gradient(circle at 52% 30%, oklch(0.70 0.05 78 / .45), transparent 26%);
          mix-blend-mode: multiply;
        }
        .cw-moon-halo {
          position: absolute;
          inset: -26px;
          border: 1px solid var(--line);
          border-radius: 50%;
          animation: cw-spin 60s linear infinite;
        }
        .cw-moon-halo::before {
          content: "";
          position: absolute;
          top: -3px;
          left: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
        }
        @keyframes cw-spin { to { transform: rotate(360deg); } }
        .cw-hero-names {
          margin: 6px 0 4px;
          font-size: clamp(3.6rem, 12vw, 8.5rem);
          font-weight: 400;
          line-height: .92;
          letter-spacing: .01em;
        }
        .cw-hero-names span {
          display: block;
          margin: .18em 0;
          color: var(--gold);
          font-size: .42em;
          font-style: italic;
          letter-spacing: .02em;
        }
        .cw-hero-sub,
        .cw-scroll-cue,
        .cw-count-label,
        .cw-time,
        .cw-detail-key,
        .cw-btn,
        .cw-field label,
        .cw-attend label,
        .cw-footer-meta {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .cw-hero-sub {
          margin-top: 22px;
          color: var(--mist);
          font-size: .82rem;
          font-weight: 300;
          letter-spacing: .34em;
          text-transform: uppercase;
        }
        .cw-hero-date {
          margin-top: 14px;
          color: var(--gold-soft);
          font-size: 1.5rem;
          letter-spacing: .04em;
        }
        .cw-scroll-cue {
          position: absolute;
          bottom: 30px;
          left: 50%;
          z-index: 2;
          display: flex;
          transform: translateX(-50%);
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--mist-dim);
          font-size: .66rem;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        .cw-scroll-cue span:last-child {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
          animation: cw-fall 1.8s ease-in-out infinite;
        }
        @keyframes cw-fall {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
        .cw-countdown { background: linear-gradient(180deg, var(--night-0), var(--night-1)); text-align: center; }
        .cw-count-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(14px, 4vw, 52px);
          margin-top: 20px;
        }
        .cw-count-cell { position: relative; width: clamp(96px, 20vw, 150px); }
        .cw-count-orbit { position: absolute; inset: -12px; border: 1px solid var(--line); border-radius: 50%; opacity: .5; }
        .cw-count-dot {
          position: absolute;
          top: -12px;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
          transform-origin: 50% calc(50% + 12px);
          animation: cw-spin 10s linear infinite;
        }
        .cw-count-num {
          color: var(--starlight);
          font-size: clamp(3rem, 8vw, 5.2rem);
          font-variant-numeric: tabular-nums;
          line-height: 1;
          text-shadow: 0 0 30px oklch(0.84 0.1 84 / .25);
        }
        .cw-count-label {
          margin-top: 14px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .32em;
          text-transform: uppercase;
        }
        .cw-story { background: var(--night-0); }
        .cw-story-grid,
        .cw-venue-grid {
          display: grid;
          align-items: center;
          gap: clamp(36px, 6vw, 90px);
        }
        .cw-story-grid { grid-template-columns: 1fr 1fr; }
        .cw-story-photo { position: relative; }
        .cw-frame-ring { position: absolute; inset: -14px; border: 1px solid var(--line); pointer-events: none; }
        .cw-frame-ring::before,
        .cw-frame-ring::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1px solid var(--gold);
        }
        .cw-frame-ring::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
        .cw-frame-ring::after { right: -1px; bottom: -1px; border-left: 0; border-top: 0; }
        .cw-photo-slot {
          min-height: 320px;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid oklch(0.84 0.1 84 / .22);
          background:
            radial-gradient(circle at 25% 20%, oklch(0.83 0.108 84 / .22), transparent 22%),
            radial-gradient(circle at 78% 74%, oklch(0.34 0.08 290 / .55), transparent 30%),
            linear-gradient(145deg, var(--night-2), var(--night-0));
          color: var(--mist);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .7rem;
          letter-spacing: .24em;
          text-align: center;
          text-transform: uppercase;
        }
        .cw-photo-orbit {
          position: absolute;
          width: 62%;
          aspect-ratio: 1;
          border: 1px solid var(--line);
          border-radius: 50%;
          animation: cw-spin 48s linear infinite;
        }
        .cw-photo-orbit::before,
        .cw-photo-orbit::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
        }
        .cw-photo-orbit::before { top: 4%; left: 18%; width: 5px; height: 5px; }
        .cw-photo-orbit::after { right: 8%; bottom: 22%; width: 3px; height: 3px; }
        .cw-story-copy h2,
        .cw-venue-info h2 {
          margin: 14px 0 22px;
          font-size: clamp(2.2rem, 4.6vw, 3.4rem);
        }
        .cw-story-copy p {
          margin-bottom: 18px;
          color: var(--mist);
          font-size: 1.18rem;
        }
        .cw-story-copy .hl { color: var(--gold-soft); font-style: italic; }
        .cw-constellation { margin-top: 30px; color: var(--gold); }
        .cw-schedule { background: linear-gradient(180deg, var(--night-0), var(--night-1) 40%, var(--night-0)); }
        .cw-timeline { max-width: 760px; margin: 0 auto; position: relative; padding-left: 8px; }
        .cw-timeline::before {
          content: "";
          position: absolute;
          left: 31px;
          top: 18px;
          bottom: 18px;
          width: 1px;
          background: linear-gradient(180deg, transparent, var(--line), transparent);
        }
        .cw-tl-item {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 24px;
          align-items: start;
          padding: 22px 0;
        }
        .cw-phase {
          width: 46px;
          height: 46px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: var(--night-3);
          flex: none;
        }
        .cw-phase-lit {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 34% 34%, oklch(0.95 0.02 90), oklch(0.84 0.06 86) 70%);
        }
        .cw-phase-shadow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--night-2);
        }
        .cw-time {
          color: var(--gold);
          font-size: .74rem;
          letter-spacing: .26em;
          text-transform: uppercase;
        }
        .cw-tl-body h3 { margin: 6px 0; font-size: 1.9rem; font-weight: 400; line-height: 1.1; }
        .cw-tl-body p { max-width: 46ch; color: var(--mist); font-size: 1.06rem; }
        .cw-venue { background: var(--night-0); }
        .cw-venue-grid { grid-template-columns: 1.15fr .85fr; align-items: stretch; }
        .cw-starmap {
          min-height: 420px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          background: radial-gradient(80% 80% at 30% 20%, oklch(0.22 0.06 264), var(--night-1));
        }
        .cw-starmap svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .cw-pin { position: absolute; left: 50%; top: 54%; z-index: 2; transform: translate(-50%, -100%); text-align: center; }
        .cw-pin-dot {
          width: 14px;
          height: 14px;
          margin: 0 auto 8px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 6px oklch(0.84 0.1 84 / .18), 0 0 24px var(--gold);
          animation: cw-pulse 2.6s ease-in-out infinite;
        }
        @keyframes cw-pulse { 50% { box-shadow: 0 0 0 12px oklch(0.84 0.1 84 / 0), 0 0 24px var(--gold); } }
        .cw-pin-tag {
          border: 1px solid var(--line);
          background: oklch(0.16 0.04 268 / .8);
          color: var(--starlight);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .68rem;
          letter-spacing: .24em;
          padding: 6px 12px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .cw-venue-info { display: flex; flex-direction: column; justify-content: center; }
        .cw-address { margin-bottom: 24px; color: var(--gold-soft); font-size: 1.3rem; font-style: italic; }
        .cw-detail-row { display: flex; gap: 16px; padding: 18px 0; border-top: 1px solid var(--line); }
        .cw-detail-row:last-of-type { border-bottom: 1px solid var(--line); }
        .cw-detail-key {
          width: 96px;
          flex: none;
          padding-top: 5px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .24em;
          text-transform: uppercase;
        }
        .cw-detail-value { color: var(--mist); font-size: 1.12rem; }
        .cw-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 50px;
          margin-top: 30px;
          border: 0;
          background: var(--gold);
          color: var(--night-0);
          cursor: pointer;
          font-size: .74rem;
          letter-spacing: .24em;
          padding: 15px 30px;
          text-decoration: none;
          text-transform: uppercase;
          transition: transform .3s, box-shadow .3s, background .3s;
        }
        .cw-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px oklch(0.84 0.1 84 / .3); background: var(--gold-soft); }
        .cw-btn.ghost { border: 1px solid var(--gold-deep); background: transparent; color: var(--gold); }
        .cw-btn.ghost:hover { background: oklch(0.84 0.1 84 / .1); box-shadow: none; }
        .cw-gallery { background: linear-gradient(180deg, var(--night-0), var(--night-1)); }
        .cw-gallery-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: 150px;
          gap: 14px;
        }
        .cw-gallery-cell { position: relative; overflow: hidden; }
        .cw-gallery-cell::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid transparent;
          pointer-events: none;
          transition: border-color .4s;
        }
        .cw-gallery-cell:hover .cw-photo-slot { transform: scale(1.04); }
        .cw-gallery-cell:hover::after { border-color: var(--gold-deep); }
        .cw-gallery-cell .cw-photo-slot { width: 100%; height: 100%; min-height: 0; transition: transform .5s cubic-bezier(.2,.7,.2,1); }
        .g-a, .g-c { grid-column: span 2; grid-row: span 2; }
        .g-b, .g-d { grid-column: span 2; grid-row: span 1; }
        .g-e, .g-f { grid-column: span 3; grid-row: span 1; }
        .cw-rsvp {
          background: radial-gradient(120% 80% at 50% 0%, oklch(0.24 0.07 272 / .6), transparent 55%), var(--night-0);
          text-align: center;
        }
        .cw-rsvp-card {
          max-width: 660px;
          margin: 0 auto;
          position: relative;
          border: 1px solid var(--line);
          background: var(--panel);
          padding: clamp(34px, 5vw, 64px);
        }
        .cw-corner { position: absolute; width: 16px; height: 16px; border: 1px solid var(--gold); }
        .cw-corner.tl { top: 14px; left: 14px; border-right: 0; border-bottom: 0; }
        .cw-corner.tr { top: 14px; right: 14px; border-left: 0; border-bottom: 0; }
        .cw-corner.bl { bottom: 14px; left: 14px; border-right: 0; border-top: 0; }
        .cw-corner.br { right: 14px; bottom: 14px; border-left: 0; border-top: 0; }
        .cw-field { margin-bottom: 22px; text-align: left; }
        .cw-field label {
          display: block;
          margin-bottom: 9px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .24em;
          text-transform: uppercase;
        }
        .cw-field input,
        .cw-field select,
        .cw-field textarea {
          width: 100%;
          border: 1px solid var(--line);
          background: oklch(0.12 0.03 268);
          color: var(--starlight);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.12rem;
          outline: none;
          padding: 13px 16px;
          transition: border-color .3s, box-shadow .3s;
        }
        .cw-field input:focus,
        .cw-field select:focus,
        .cw-field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px oklch(0.84 0.1 84 / .12); }
        .cw-field textarea { min-height: 90px; resize: vertical; }
        .cw-field.err input { border-color: oklch(0.6 0.14 25); }
        .cw-msg {
          display: none;
          margin-top: 6px;
          color: oklch(0.72 0.13 28);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .66rem;
          letter-spacing: .1em;
        }
        .cw-field.err .cw-msg { display: block; }
        .cw-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .cw-attend { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
        .cw-attend input { display: none; }
        .cw-attend label {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 58px;
          border: 1px solid var(--line);
          color: var(--mist);
          cursor: pointer;
          font-size: .8rem;
          letter-spacing: .16em;
          padding: 16px;
          text-transform: uppercase;
          transition: .3s;
        }
        .cw-attend label:hover,
        .cw-attend input:checked + label {
          border-color: var(--gold);
          background: oklch(0.84 0.1 84 / .08);
          color: var(--gold);
        }
        .cw-submit { width: 100%; margin-top: 8px; }
        .cw-thanks { padding: 30px 10px; animation: cw-fadein .8s both; }
        .cw-thanks .cw-moon { width: 72px; height: 72px; margin: 0 auto 10px; }
        .cw-thanks-title { margin: 18px 0 10px; color: var(--gold-soft); font-size: 2.8rem; }
        .cw-thanks p { color: var(--mist); font-size: 1.2rem; }
        @keyframes cw-fadein { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .cw-footer {
          border-top: 1px solid var(--line);
          background: var(--night-0);
          padding: 70px 24px 60px;
          text-align: center;
        }
        .cw-footer-names { color: var(--starlight); font-size: 2.4rem; font-style: italic; }
        .cw-footer-names span { color: var(--gold); }
        .cw-footer-meta {
          margin-top: 18px;
          color: var(--mist-dim);
          font-size: .72rem;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        @media (max-width: 820px) {
          .cw-wrap { width: min(100% - 40px, 1120px); }
          .cw-story-grid,
          .cw-venue-grid { grid-template-columns: 1fr; }
          .cw-venue-info { order: 2; }
          .cw-gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 130px; }
          .g-a, .g-c { grid-column: span 2; grid-row: span 2; }
          .g-b, .g-d, .g-e, .g-f { grid-column: span 1; grid-row: span 1; }
          .cw-row2 { grid-template-columns: 1fr; }
          .cw-attend { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cw-reveal { opacity: 1; transform: none; transition: none; }
          .cw-moon-halo,
          .cw-count-dot,
          .cw-photo-orbit,
          .cw-scroll-cue span:last-child { animation: none; }
        }
      `}</style>

      <section className="cw-hero" id="hero">
        <canvas className="cw-starfield" ref={canvasRef} aria-hidden="true" />
        <div className="cw-hero-inner">
          <div className="cw-moon">
            <div className="cw-moon-halo" />
          </div>
          <div className="cw-eyebrow cw-reveal in">Together with their families</div>
          <h1 className="cw-hero-names cw-reveal in cw-d1">
            Aurora<span>and</span>Elias
          </h1>
          <div className="cw-hero-sub cw-reveal in cw-d2">
            invite you to celebrate their wedding
          </div>
          <div className="cw-hero-date cw-reveal in cw-d2">
            Saturday - the twelfth of September - 2026
          </div>
        </div>
        <div className="cw-scroll-cue">
          <span>Scroll</span>
          <span />
        </div>
      </section>

      <section className="cw-countdown cw-section" id="countdown">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Counting down to forever
            </div>
            <h2>
              Until we say <span className="cw-script">I do</span>
            </h2>
          </div>
          <div className="cw-count-grid cw-reveal cw-d1">
            {countdown.map((item, index) => (
              <div className="cw-count-cell" key={item.label}>
                <div className="cw-count-orbit" />
                <span
                  className="cw-count-dot"
                  style={{ animationDuration: `${10 + index * 3}s` }}
                />
                <div className="cw-count-num">{item.value}</div>
                <div className="cw-count-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-story cw-section" id="story">
        <div className="cw-wrap">
          <div className="cw-story-grid">
            <div className="cw-story-photo cw-reveal">
              <div className="cw-frame-ring" />
              <PhotoSlot label="Drop your favorite photo" />
            </div>
            <div className="cw-story-copy cw-reveal cw-d1">
              <div className="cw-eyebrow">Our Story</div>
              <h2>Written in the stars</h2>
              <p>
                We met on a rooftop in late autumn, both of us pretending to know
                the constellations. <span className="hl">Elias</span> pointed at a
                planet and called it a star; <span className="hl">Aurora</span> let
                him believe it for exactly three minutes.
              </p>
              <p>
                Five years, two cities and one very persistent houseplant later, he
                asked under that same sky - and this time, she knew every star by name.
              </p>
              <div className="cw-constellation">
                <svg width="220" height="44" viewBox="0 0 220 44" fill="none" aria-hidden="true">
                  <path d="M6 30 L52 14 L96 26 L140 10 L186 22 L214 8" stroke="currentColor" strokeWidth="1" strokeOpacity=".5" />
                  <g fill="currentColor">
                    <circle cx="6" cy="30" r="2.5" />
                    <circle cx="52" cy="14" r="3.5" />
                    <circle cx="96" cy="26" r="2" />
                    <circle cx="140" cy="10" r="3" />
                    <circle cx="186" cy="22" r="2.5" />
                    <circle cx="214" cy="8" r="3.5" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-schedule cw-section" id="schedule">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              The Order of Events
            </div>
            <h2>An evening under the sky</h2>
            <p className="cw-lead">
              Follow the moon through the night - from first light at the ceremony
              to the last dance beneath the stars.
            </p>
          </div>
          <div className="cw-timeline">
            {schedule.map((item, index) => (
              <div className={`cw-tl-item cw-reveal cw-d${Math.min(index, 3)}`} key={item.title}>
                <div className="cw-phase" aria-hidden="true">
                  <span className="cw-phase-lit" />
                  <span
                    className="cw-phase-shadow"
                    style={{ transform: `translateX(${item.phase}%)` }}
                  />
                </div>
                <div className="cw-tl-body">
                  <div className="cw-time">{item.time}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-venue cw-section" id="venue">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Where to find us
            </div>
            <h2>The Observatory Estate</h2>
          </div>
          <div className="cw-venue-grid">
            <div className="cw-starmap cw-reveal">
              <svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="var(--line)" strokeWidth="1" fill="none">
                  <path d="M40 60 L120 110 L90 200 L180 230" />
                  <path d="M260 70 L330 130 L300 220 L360 280" />
                  <path d="M150 330 L230 300 L300 360" />
                </g>
                <g fill="var(--gold)" opacity=".75">
                  <circle cx="40" cy="60" r="2" />
                  <circle cx="120" cy="110" r="2.6" />
                  <circle cx="90" cy="200" r="1.8" />
                  <circle cx="180" cy="230" r="2.2" />
                  <circle cx="260" cy="70" r="2.4" />
                  <circle cx="330" cy="130" r="2" />
                  <circle cx="300" cy="220" r="2.6" />
                  <circle cx="360" cy="280" r="1.8" />
                  <circle cx="150" cy="330" r="2.2" />
                  <circle cx="230" cy="300" r="2.6" />
                  <circle cx="300" cy="360" r="2" />
                </g>
              </svg>
              <div className="cw-pin">
                <div className="cw-pin-dot" />
                <div className="cw-pin-tag">Lumiere Estate</div>
              </div>
            </div>
            <div className="cw-venue-info cw-reveal cw-d1">
              <div className="cw-eyebrow">The Celebration</div>
              <h2>Lumiere Estate</h2>
              <div className="cw-address">1700 Stargrove Lane, Napa Valley, California</div>
              {venueDetails.map((detail) => (
                <div className="cw-detail-row" key={detail.key}>
                  <div className="cw-detail-key">{detail.key}</div>
                  <div className="cw-detail-value">{detail.value}</div>
                </div>
              ))}
              <a
                className="cw-btn"
                href="https://maps.google.com/?q=Napa+Valley+California"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-gallery cw-section" id="gallery">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Moments, collected
            </div>
            <h2>Our constellation</h2>
            <p className="cw-lead">
              A few of our favorite nights so far - drop in your own photos to make
              it yours.
            </p>
          </div>
          <div className="cw-gallery-grid cw-reveal cw-d1">
            {gallery.map((item, index) => (
              <div className={`cw-gallery-cell g-${String.fromCharCode(97 + index)}`} key={item}>
                <PhotoSlot label={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-rsvp cw-section" id="rsvp">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Kindly Reply
            </div>
            <h2>Will you join us?</h2>
            <p className="cw-lead">Please respond by the first of August, 2026.</p>
          </div>
          <div className="cw-rsvp-card cw-reveal cw-d1">
            <span className="cw-corner tl" />
            <span className="cw-corner tr" />
            <span className="cw-corner bl" />
            <span className="cw-corner br" />

            {submitted ? (
              <div className="cw-thanks">
                <div className="cw-moon" />
                <div className="cw-thanks-title cw-script">
                  {attending === 'yes' ? 'See you under the stars!' : "We'll miss you"}
                </div>
                <p>
                  {attending === 'yes'
                    ? `Thank you, ${firstName}. Your reply is on its way to us across the stars.`
                    : `Thank you for letting us know, ${firstName}. We will raise a glass to you under the moon.`}
                </p>
                <button className="cw-btn ghost" type="button" onClick={() => setSubmitted(false)}>
                  Edit response
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="cw-attend">
                  <input
                    checked={attending === 'yes'}
                    id="att-yes"
                    name="attending"
                    onChange={() => setAttending('yes')}
                    type="radio"
                    value="yes"
                  />
                  <label htmlFor="att-yes">Joyfully accepts</label>
                  <input
                    checked={attending === 'no'}
                    id="att-no"
                    name="attending"
                    onChange={() => setAttending('no')}
                    type="radio"
                    value="no"
                  />
                  <label htmlFor="att-no">Regretfully declines</label>
                </div>

                <div className={`cw-field ${errors.name ? 'err' : ''}`}>
                  <label htmlFor="in-name">Full name</label>
                  <input
                    id="in-name"
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Aurora Vance"
                    type="text"
                    value={formState.name}
                  />
                  <div className="cw-msg">Please let us know who is coming.</div>
                </div>

                <div className="cw-row2">
                  <div className={`cw-field ${errors.email ? 'err' : ''}`}>
                    <label htmlFor="in-email">Email</label>
                    <input
                      id="in-email"
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                      type="email"
                      value={formState.email}
                    />
                    <div className="cw-msg">A valid email, please.</div>
                  </div>
                  {attending === 'yes' && (
                    <div className="cw-field">
                      <label htmlFor="in-guests">Number of guests</label>
                      <select id="in-guests" defaultValue="1">
                        <option value="1">1 - just me</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  )}
                </div>

                {attending === 'yes' && (
                  <div className="cw-field">
                    <label htmlFor="in-meal">Menu preference</label>
                    <select id="in-meal" defaultValue="">
                      <option value="">Select an option</option>
                      <option>Garden vegetarian</option>
                      <option>Land beef short rib</option>
                      <option>Sea seared halibut</option>
                      <option>Children's plate</option>
                    </select>
                  </div>
                )}

                <div className="cw-field">
                  <label htmlFor="in-note">A note for the couple</label>
                  <textarea
                    id="in-note"
                    placeholder="Leave a wish, a song request, or a memory"
                  />
                </div>
                <button className="cw-btn cw-submit" type="submit">
                  Send our reply
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="cw-footer">
        <Divider mark="star" />
        <div className="cw-footer-names">
          Aurora <span>&amp;</span> Elias
        </div>
        <div className="cw-footer-meta">12 - 09 - 2026 - Napa Valley, California</div>
      </footer>
    </div>
  )
}
