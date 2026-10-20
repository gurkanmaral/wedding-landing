import { useEffect, useRef, useState } from 'react'
import { markOpened } from '../app/openedFlag.js'
import { loadFonts } from '../shared/intro/fonts.js'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The real 3D envelope from the invitation intro, embedded in the hero.
// Opening it goes full screen and lands on the template without replaying the intro.
export default function HeroEnvelope({ template, children }) {
  const stageRef = useRef(null)
  const sceneRef = useRef(null)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    let cancelled = false
    let scene = null

    Promise.all([import('../shared/intro/envelopeScene.js'), loadFonts(template.intro)]).then(([{ createEnvelopeScene }]) => {
      if (cancelled || !stageRef.current) return
      try {
        scene = createEnvelopeScene(stageRef.current, template, {
          particleCount: 18,
          onOpened: () => {
            markOpened(template.slug)
            window.location.assign(template.path)
          },
        })
        sceneRef.current = scene
      } catch {
        // no WebGL: the button below still opens the invitation
      }
    })

    return () => {
      cancelled = true
      scene?.dispose()
      sceneRef.current = null
    }
  }, [template])

  useEffect(() => {
    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      sceneRef.current?.setPointer(x, y)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const open = () => {
    if (opening) return
    if (!sceneRef.current || reducedMotion()) {
      window.location.assign(template.path)
      return
    }
    setOpening(true)
    // let the stage expand to full screen before the animation starts
    requestAnimationFrame(() => requestAnimationFrame(() => sceneRef.current?.open()))
  }

  return (
    <div className="hero-envelope">
      <div
        className="hero-envelope__backdrop"
        data-active={opening}
        style={{ background: template.intro.bg }}
        aria-hidden="true"
      />
      <div ref={stageRef} className="hero-envelope__stage" data-opening={opening} onClick={open} aria-hidden="true" />
      {children}
      <button type="button" className="landing-button landing-button--wax hero-envelope__open" onClick={open} disabled={opening}>
        Open the {template.name} invitation
      </button>
    </div>
  )
}
