import { useEffect, useRef } from 'react'
import { mountWinter } from './winterArt.js'
import { loop } from '../../shared/intro/foil.js'

// The chalet night behind the hero copy: parallax (pointer or tilt), falling
// snow in depth, chimney smoke, firelight and frost on the pane.
export default function WinterHero() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const art = mountWinter(host, { motion: !reduce, frost: true })
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
        if (visible) art.tick(dt, t)
      })
    }
    return () => {
      stop()
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
      art.dispose()
    }
  }, [])

  return <div ref={hostRef} className="sng-art" aria-hidden="true" />
}
