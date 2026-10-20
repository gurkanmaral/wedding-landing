import { useEffect, useRef } from 'react'
import { createStage } from '../../shared/intro/core.js'
import { buildBalloonSky } from './balloons.js'
import { paintLandscape } from './landscape.js'

// Illustrated valley: a painted sky, two painted terrain layers with live 3D balloons between them.
export default function KapadokyaHero({ children }) {
  const rootRef = useRef(null)
  const backRef = useRef(null)
  const frontRef = useRef(null)
  const skyRef = useRef(null)
  const paintRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const paint = () => {
      const { width, height } = root.getBoundingClientRect()
      paintLandscape(backRef.current, frontRef.current, { width, height, dpr: Math.min(window.devicePixelRatio || 1, 2), sky: paintRef.current })
    }
    paint()
    let lastWidth = root.clientWidth
    let timer = 0
    const ro = new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - lastWidth) < 2) return
      lastWidth = root.clientWidth
      clearTimeout(timer)
      timer = setTimeout(paint, 120)
    })
    ro.observe(root)

    let stage = null
    try {
      stage = createStage(skyRef.current, { fov: 40, cameraZ: 30 })
      const small = Math.min(window.innerWidth, window.innerHeight) < 640
      const sky = buildBalloonSky(stage, { count: small ? 12 : 22 })
      stage.onResize(() => sky.place())
      stage.onFrame((dt, t) => sky.update(dt, t, reduce))
    } catch {
      // no WebGL: the painted valley still stands on its own
    }

    // gentle parallax between the painted layers
    const onMove = (event) => {
      if (reduce) return
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      root.style.setProperty('--px', x.toFixed(3))
      root.style.setProperty('--py', y.toFixed(3))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const io = new IntersectionObserver(([entry]) => stage?.setPaused(!entry.isIntersecting))
    io.observe(root)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      stage?.dispose()
    }
  }, [])

  return (
    <header ref={rootRef} className="kap-hero">
      <canvas ref={paintRef} className="kap-layer kap-layer--sky" aria-hidden="true" />
      <canvas ref={backRef} className="kap-layer kap-layer--back" aria-hidden="true" />
      <div ref={skyRef} className="kap-layer kap-layer--balloons" aria-hidden="true" />
      <canvas ref={frontRef} className="kap-layer kap-layer--front" aria-hidden="true" />
      {children}
    </header>
  )
}
