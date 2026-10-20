import { useEffect, useRef } from 'react'
import { mountBosphorus } from './bosphorusArt.js'

const clamp = (v) => Math.max(-1, Math.min(1, v))

// The live Bosphorus illustration behind the hero: parallax with the pointer or
// the phone's tilt, and the yalı windows switch on wherever the guest points.
export default function BosphorusHero() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const art = mountBosphorus(host, { mode: 'hero', reduce })

    const onMove = (event) => {
      const rect = host.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width
      const ny = (event.clientY - rect.top) / rect.height
      if (!reduce) art.setPointer(clamp(nx * 2 - 1), clamp(ny * 2 - 1))
      if (ny > 0 && ny < 1) art.lightAt(nx, ny)
    }
    const onTilt = (event) => {
      if (reduce || event.gamma == null) return
      art.setPointer(clamp(event.gamma / 25), clamp((event.beta - 45) / 25))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    const observer = new IntersectionObserver(([entry]) => art.setPaused(!entry.isIntersecting))
    observer.observe(host)

    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      art.dispose()
    }
  }, [])

  return <div ref={hostRef} className="bz-hero-art" aria-hidden="true" />
}
