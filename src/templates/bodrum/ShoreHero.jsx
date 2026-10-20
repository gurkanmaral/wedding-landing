import { useEffect, useRef } from 'react'
import { mountShore } from './bodrumArt.js'
import { createBottlePainter, mountBottleLayer, openPose, wetness } from './bottleArt.js'

const clamp = (v) => Math.max(-1, Math.min(1, v))

// The live Bodrum shore behind the hero, with pointer / tilt parallax, and the
// opened bottle and its cork left on the sand where the intro ends.
export default function ShoreHero() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const art = mountShore(host, { reduce })
    const painter = createBottlePainter()
    const bottle = mountBottleLayer(host, art, (ctx, k, t) => {
      const pose = openPose(art.view)
      painter.draw(ctx, k, pose, { src: art.canvas, t, wet: wetness(art, pose) })
    })
    const onMove = (event) => {
      if (reduce) return
      art.setPointer(clamp((event.clientX / window.innerWidth) * 2 - 1), clamp((event.clientY / window.innerHeight) * 2 - 1))
    }
    const onTilt = (event) => {
      if (reduce || event.gamma == null) return
      art.setPointer(clamp(event.gamma / 25), clamp((event.beta - 45) / 25))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    const observer = new IntersectionObserver(([entry]) => art.setPaused(!entry.isIntersecting))
    observer.observe(host)
    return () => {
      observer.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      bottle.dispose()
      art.dispose()
    }
  }, [])

  return <div ref={hostRef} className="bd-hero-art" aria-hidden="true" />
}
