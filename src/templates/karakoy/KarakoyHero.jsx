import { useEffect, useRef } from 'react'
import { createKinetic } from './kinetic.js'

// Full-viewport kinetic lockup: the same stage the intro ends on, so the
// hand-off is seamless. Letters lean away from the pointer or the phone's
// tilt and spring back.
export default function KarakoyHero({ partner1, partner2, dateLabel, timeLabel, venue, city, c }) {
  const rootRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const host = stageRef.current
    const root = rootRef.current
    if (!host || !root) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // mounted underneath the fading intro: start on its final frame
    const afterIntro = Boolean(document.querySelector('.invitation-intro'))
    const kinetic = createKinetic(host, { names: [partner1, partner2], mode: 'lockup', drawn: afterIntro || reduce ? 1 : 0, reduce })
    if (afterIntro || reduce) kinetic.settle()
    else kinetic.enter()

    const onMove = (event) => kinetic.pointerClient(event.clientX, event.clientY)
    const onLeave = () => kinetic.clearPointer()
    const onTilt = (event) => {
      if (event.gamma == null) return
      kinetic.setTilt(event.gamma / 28, ((event.beta ?? 45) - 45) / 30)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const onUp = (event) => event.pointerType === 'touch' && onLeave()
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    const io = new IntersectionObserver(([entry]) => kinetic.setPaused(!entry.isIntersecting))
    io.observe(root)

    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('deviceorientation', onTilt)
      kinetic.dispose()
    }
  }, [partner1, partner2])

  return (
    <header ref={rootRef} className="kk-hero">
      <div ref={stageRef} className="kk-hero-stage" />
      <h1 className="kk-sr">
        {partner1} &amp; {partner2}
      </h1>
      <p className="kk-hero-tag">
        <span className="kk-hero-no">№ 01</span> {c.tagline}
      </p>
      <p className="kk-hero-date">{dateLabel}</p>
      <p className="kk-hero-foot">
        <span>{venue}</span>
        <span>{city}</span>
        <span>{timeLabel}</span>
      </p>
    </header>
  )
}
