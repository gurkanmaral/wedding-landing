import { useEffect, useRef, useState } from 'react'
import { buildWall, layoutVars, wallLayout } from './wall.js'

// The painted İznik wall with a glaze highlight that follows the pointer or
// the tilt of the phone; names sit in the medallion, date on the cobalt band.
export default function IznikHero({ partner1, partner2, dateLabel, place, tagline }) {
  const rootRef = useRef(null)
  const hostRef = useRef(null)
  const [layout, setLayout] = useState(() => wallLayout(window.innerWidth, window.innerHeight))

  useEffect(() => {
    const root = rootRef.current
    const wall = buildWall(hostRef.current, { mode: 'painted', onLayout: setLayout })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const light = { x: wall.layout.width * 0.28, y: wall.layout.height * 0.22, tx: null, ty: null, last: 0 }
    wall.setLight(light.x, light.y)

    const onMove = (event) => {
      const rect = root.getBoundingClientRect()
      light.tx = event.clientX - rect.left
      light.ty = event.clientY - rect.top
      light.last = performance.now()
    }
    const onTilt = (event) => {
      if (event.gamma == null || event.beta == null) return
      const { width, height } = wall.layout
      light.tx = width * (0.5 + Math.max(-0.5, Math.min(0.5, event.gamma / 50)))
      light.ty = height * (0.35 + Math.max(-0.35, Math.min(0.45, (event.beta - 45) / 70)))
      light.last = performance.now()
    }
    // iOS asks before sharing motion; the first touch is the moment to ask
    const askTilt = () => {
      const request = window.DeviceOrientationEvent?.requestPermission
      if (typeof request === 'function') request.call(window.DeviceOrientationEvent).catch(() => {})
    }

    let raf = 0
    let visible = true
    const frame = (now) => {
      raf = 0
      if (!visible) return
      raf = requestAnimationFrame(frame)
      const { width, height } = wall.layout
      const t = now / 1000
      let tx = light.tx
      let ty = light.ty
      if (tx === null || now - light.last > 4000) {
        tx = width * (0.5 + 0.36 * Math.sin(t * 0.21))
        ty = height * (0.34 + 0.22 * Math.sin(t * 0.29 + 0.8))
      }
      light.x += (tx - light.x) * 0.05
      light.y += (ty - light.y) * 0.05
      wall.setLight(light.x, light.y)
    }
    let observer = null
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
      root.addEventListener('pointerdown', askTilt, { once: true })
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(frame)
      })
      observer.observe(root)
    }

    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      root.removeEventListener('pointerdown', askTilt)
      wall.dispose()
    }
  }, [])

  const len = Math.max(4, partner1.length, partner2.length)
  return (
    <header ref={rootRef} className="iz-hero" style={layoutVars(layout)}>
      <div ref={hostRef} className="iz-hero-wall" aria-hidden="true" />
      <div className="izw-copy">
        <div className="izw-medal">
          {tagline ? <p className="izw-tagline">{tagline}</p> : null}
          <h1 className="izw-names" style={{ '--len': len }}>
            <span>{partner1}</span>
            <span className="izw-amp">&amp;</span>
            <span>{partner2}</span>
          </h1>
        </div>
        <div className="izw-band">
          <p className="izw-date">{dateLabel}</p>
          <p className="izw-place">{place}</p>
        </div>
      </div>
    </header>
  )
}
