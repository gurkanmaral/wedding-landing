import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { mountKinaScene } from './kinaArt.js'
import { buildMandala, setMandalaProgress } from './mandala.js'

function nameSize(a, b) {
  const longest = Math.max(a.length, b.length, 4)
  return `${Math.min(10, 46 / (0.62 * longest)).toFixed(2)}cqi`
}

// Full-viewport candlelit hero: the same illustration the intro ends on.
export function KinaHero({ partner1, partner2, dateLabel, timeLabel, place, c }) {
  const hostRef = useRef(null)
  const medallionRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    const medallion = medallionRef.current
    if (!host || !medallion) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = mountKinaScene(host, { reduce })
    const mandala = buildMandala()
    medallion.insertBefore(mandala.svg, medallion.firstChild)
    // after the intro the mandala is already drawn; only draw it on when there was no intro
    const afterIntro = Boolean(document.querySelector('.invitation-intro'))
    const state = { p: reduce || afterIntro ? 1 : 0 }
    setMandalaProgress(mandala, state.p)
    const tween = reduce || afterIntro
      ? null
      : gsap.to(state, { p: 1, duration: 2.8, delay: 0.4, ease: 'power1.inOut', onUpdate: () => setMandalaProgress(mandala, state.p) })

    const onMove = (event) => {
      scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }
    const onTilt = (event) => {
      if (event.gamma == null) return
      scene.setPointer(Math.max(-1, Math.min(1, event.gamma / 30)), Math.max(-1, Math.min(1, (event.beta - 45) / 30)))
    }
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
    }
    const observer = new IntersectionObserver(([entry]) => scene.setPaused(!entry.isIntersecting))
    observer.observe(host)
    return () => {
      tween?.kill()
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      mandala.svg.remove()
      scene.dispose()
    }
  }, [])

  return (
    <header className="kina-hero">
      <div ref={hostRef} className="kina-hero-scene" aria-hidden="true" />
      <p className="kina-hero-kicker">{c.tagline}</p>
      <div ref={medallionRef} className="kina-medallion">
        <h1 className="kina-names" style={{ '--kina-name-size': nameSize(partner1, partner2) }}>
          <span>{partner1}</span>
          <span className="kina-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
      </div>
      <div className="kina-hero-foot">
        <p className="kina-hero-date">
          {dateLabel} · {timeLabel}
        </p>
        <p className="kina-hero-place">{place}</p>
      </div>
    </header>
  )
}

// A def (frame drum) in henna and brass, the instrument of every kına night.
function Def({ playing }) {
  const zils = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return (
      <g key={i} transform={`translate(${(Math.cos(a) * 92).toFixed(1)} ${(Math.sin(a) * 92).toFixed(1)}) rotate(${((a * 180) / Math.PI + 90).toFixed(1)})`}>
        <rect x="-9" y="-5" width="18" height="10" rx="2" fill="#2a0b0e" />
        <ellipse cx="-4" cy="0" rx="5" ry="6.5" fill="url(#kina-def-zil)" />
        <ellipse cx="4" cy="0" rx="5" ry="6.5" fill="url(#kina-def-zil)" />
      </g>
    )
  })
  const petals = Array.from({ length: 12 }, (_, i) => (
    <path key={i} transform={`rotate(${i * 30})`} d="M0 -18C-9 -30 -9 -46 0 -56C9 -46 9 -30 0 -18Z" />
  ))
  return (
    <svg className="kina-def" data-playing={playing} viewBox="-110 -110 220 220" aria-hidden="true">
      <defs>
        <radialGradient id="kina-def-skin" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fbeedb" />
          <stop offset="0.7" stopColor="#ecd2ac" />
          <stop offset="1" stopColor="#c99d68" />
        </radialGradient>
        <radialGradient id="kina-def-zil" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.55" stopColor="#d4a24c" />
          <stop offset="1" stopColor="#6e4614" />
        </radialGradient>
      </defs>
      <circle r="104" fill="#5a2a12" />
      <circle r="98" fill="none" stroke="#9a5a2a" strokeWidth="6" />
      {zils}
      <circle r="80" fill="url(#kina-def-skin)" />
      <g fill="none" stroke="#7a3e1d" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        {petals}
        <circle r="14" />
        <circle r="66" strokeDasharray="1 6" />
        <circle r="72" />
      </g>
    </svg>
  )
}

export function TurkuSection({ c, ornament }) {
  const [current, setCurrent] = useState(0)
  const t = c.turku
  return (
    <section className="inv-section kina-turku">
      <header className="inv-heading" data-reveal>
        <p className="inv-kicker">{t.kicker}</p>
        <h2 className="inv-title">{t.title}</h2>
        <div className="inv-ornament" aria-hidden="true">
          {ornament}
        </div>
      </header>
      <div className="kina-turku-card" data-reveal>
        <Def playing={current >= 0} />
        <div className="kina-turku-body">
          <p className="kina-turku-intro">{t.intro}</p>
          <ol className="kina-turku-list">
            {t.tracks.map((track, i) => (
              <li key={track.title} data-current={current === i}>
                <button type="button" onClick={() => setCurrent(current === i ? -1 : i)} aria-pressed={current === i}>
                  <span className="kina-turku-no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="kina-turku-title">
                    {track.title}
                    <small>{track.note}</small>
                  </span>
                  <span className="kina-turku-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </button>
                <a
                  className="kina-turku-listen"
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.title} türkü`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.listen}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
