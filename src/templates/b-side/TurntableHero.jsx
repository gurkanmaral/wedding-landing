import { useEffect, useMemo, useRef } from 'react'
import { createDeckStage, deckTexts, ARM_PLAY } from './deck.js'

// The record keeps playing behind the hero copy: same composition as the
// intro's last frame. Pauses off screen; static under reduced motion.
export default function TurntableHero({ partner1, partner2, dateText, place, date, lang }) {
  const hostRef = useRef(null)
  const stageRef = useRef(null)
  const texts = useMemo(
    () => deckTexts({ partner1, partner2, dateText, place, date, lang }),
    [partner1, partner2, dateText, place, date, lang],
  )

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const stage = createDeckStage(host, {})
    stageRef.current = stage
    stage.placeHero()
    stage.armState.angle = ARM_PLAY
    stage.applyArm()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) stage.setSpin(1)

    const resize = new ResizeObserver(() => {
      stage.measure()
      stage.placeHero()
    })
    resize.observe(host)
    const visible = new IntersectionObserver(([entry]) => stage.pause(!entry.isIntersecting))
    visible.observe(host)

    const onMove = (event) => stage.setParallax((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    const onTilt = (event) => {
      if (event.gamma == null) return
      stage.setParallax(Math.max(-1, Math.min(1, event.gamma / 25)), Math.max(-1, Math.min(1, (event.beta - 45) / 25)))
    }
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
    }
    return () => {
      resize.disconnect()
      visible.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      stage.dispose()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    stageRef.current?.setTexts(texts)
  }, [texts])

  return <div ref={hostRef} className="bs-deck-host" aria-hidden="true" />
}
