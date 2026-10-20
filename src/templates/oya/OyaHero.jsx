import { useEffect, useRef } from 'react'
import { createLight, mountLace } from './laceArt.js'

function nameSize(a, b) {
  const longest = Math.max(a.length, b.length, 4)
  return `${Math.min(7.5, 33 / (0.6 * longest)).toFixed(2)}cqi`
}

// Hero: the finished medallion turning very slowly on linen, its shadow
// sliding away from a light that follows the pointer or the phone's tilt.
export function OyaHero({ partner1, partner2, dateLabel, timeLabel, place, c }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lace = mountLace(host)
    const start = performance.now()
    const light = createLight(
      (x, y) => {
        lace.set({ lx: x, ly: y, spin: reduce ? 0 : ((performance.now() - start) / 1000) * 1.4 })
      },
      { reduce },
    )
    const observer = new IntersectionObserver(([entry]) => light.setPaused(!entry.isIntersecting))
    observer.observe(host)
    return () => {
      observer.disconnect()
      light.dispose()
      lace.dispose()
    }
  }, [])

  return (
    <header className="oya-hero">
      <div ref={hostRef} className="oya-hero-scene" aria-hidden="true" />
      <p className="oya-hero-kicker">{c.tagline}</p>
      <div className="oya-center">
        <h1 className="oya-names" style={{ '--oya-name-size': nameSize(partner1, partner2) }}>
          <span>{partner1}</span>
          <span className="oya-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
      </div>
      <div className="oya-hero-foot">
        <p className="oya-hero-date">
          {dateLabel} · {timeLabel}
        </p>
        <p className="oya-hero-place">{place}</p>
      </div>
    </header>
  )
}

// A small oya rosette tile, used as the lace shadow that drifts over the whole page.
const tile = (() => {
  const petals = Array.from({ length: 8 }, (_, i) => `<path transform='rotate(${i * 45} 90 90)' d='M90 66C82 56 82 44 90 34C98 44 98 56 90 66Z'/>`).join('')
  const scallops = Array.from({ length: 16 }, (_, i) => {
    const a0 = (i / 16) * Math.PI * 2
    const a1 = ((i + 1) / 16) * Math.PI * 2
    const p = (r, a) => `${(90 + Math.cos(a) * r).toFixed(1)} ${(90 + Math.sin(a) * r).toFixed(1)}`
    return `M${p(62, a0)}Q${p(74, (a0 + a1) / 2)} ${p(62, a1)}`
  }).join('')
  const corners = [0, 180].flatMap((x) => [0, 180].map((y) => `<circle cx='${x}' cy='${y}' r='16'/><circle cx='${x}' cy='${y}' r='7'/>`)).join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'><g fill='none' stroke='#6b5b53' stroke-width='1.5'><circle cx='90' cy='90' r='22'/><circle cx='90' cy='90' r='10'/>${petals}<path d='${scallops}'/>${corners}</g></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})()

export function OyaBackdrop() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const light = createLight(
      (x, y) => {
        el.style.transform = `translate3d(${(-x * 26).toFixed(1)}px, ${(-y * 20 + 8).toFixed(1)}px, 0)`
      },
      { reduce },
    )
    return () => light.dispose()
  }, [])
  return (
    <div className="oya-backdrop" aria-hidden="true">
      <div ref={ref} className="oya-backdrop-lace" style={{ backgroundImage: tile }} />
    </div>
  )
}
