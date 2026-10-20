import { useEffect, useRef } from 'react'
import { mountGlasshouse } from './glasshouseArt.js'
import { loop } from '../../shared/intro/foil.js'

// The illustrated glasshouse behind the hero copy: layered parallax (pointer or
// tilt), swaying fronds, shifting light and dust. Rebuilt when the size changes.
export default function GlasshouseHero({ names, date }) {
  const hostRef = useRef(null)
  const [a, b] = names

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const art = mountGlasshouse(host, { names: [a, b], date, motion: !reduce })
    let visible = true
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(host)
    const resize = new ResizeObserver(() => art.layout())
    resize.observe(host)

    const onPointer = (event) => {
      art.setParallax((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    }
    const onTilt = (event) => {
      if (event.gamma == null) return
      art.setParallax(Math.max(-1, Math.min(1, event.gamma / 25)), Math.max(-1, Math.min(1, (event.beta - 45) / 30)))
    }
    let stop = () => {}
    if (!reduce) {
      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
      stop = loop((dt, t) => {
        if (visible) art.tick(t)
      })
    } else {
      art.tick(0)
    }
    return () => {
      stop()
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
      art.dispose()
    }
  }, [a, b, date])

  return <div ref={hostRef} className="org-art" aria-hidden="true" />
}
