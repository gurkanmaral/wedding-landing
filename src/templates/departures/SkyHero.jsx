import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { createSky, createPlane } from './sky.js'

const NS = 'http://www.w3.org/2000/svg'

// The intro's sky continues behind the hero: illustrated clouds drift at
// different depths and the paper plane glides along a dotted route.
export default function SkyHero() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // mounted underneath the fading intro: carry on from its last frame
    const introSky = document.querySelector('.invitation-intro .dps-sky')
    const sky = createSky(host, { seed: 23, follow: introSky })
    const layer = document.createElementNS(NS, 'svg')
    layer.setAttribute('class', 'dpp-sky-svg')
    layer.style.zIndex = '3'
    sky.root.appendChild(layer)
    const maskId = `dpm${Math.random().toString(36).slice(2, 8)}`
    const defs = document.createElementNS(NS, 'defs')
    const mask = document.createElementNS(NS, 'mask')
    mask.setAttribute('id', maskId)
    mask.setAttribute('maskUnits', 'userSpaceOnUse')
    const reveal = document.createElementNS(NS, 'path')
    reveal.setAttribute('fill', 'none')
    reveal.setAttribute('stroke', '#fff')
    reveal.setAttribute('stroke-width', '8')
    mask.appendChild(reveal)
    defs.appendChild(mask)
    layer.appendChild(defs)
    const trail = document.createElementNS(NS, 'path')
    trail.setAttribute('class', 'dpp-trail')
    trail.setAttribute('mask', `url(#${maskId})`)
    layer.appendChild(trail)
    const plane = createPlane(layer)

    let length = 1
    let w = 1
    let h = 1
    let built = { w: 0, h: 0 }
    const layout = () => {
      w = host.clientWidth || window.innerWidth
      h = host.clientHeight || window.innerHeight
      layer.setAttribute('viewBox', `0 0 ${w} ${h}`)
      mask.setAttribute('x', '0')
      mask.setAttribute('y', '0')
      mask.setAttribute('width', String(w))
      mask.setAttribute('height', String(h))
      const portrait = w / h < 1.1
      const d = portrait
        ? `M ${-0.1 * w} ${0.42 * h} C ${0.3 * w} ${0.44 * h}, ${0.52 * w} ${0.1 * h}, ${1.15 * w} ${0.14 * h}`
        : `M ${0.4 * w} ${0.86 * h} C ${0.62 * w} ${0.74 * h}, ${0.68 * w} ${0.16 * h}, ${1.12 * w} ${0.1 * h}`
      trail.setAttribute('d', d)
      reveal.setAttribute('d', d)
      length = trail.getTotalLength() || 1
      reveal.setAttribute('stroke-dasharray', `${length} ${length}`)
      // mobile toolbars nudge the height constantly; only redraw clouds for real changes
      if (w !== built.w || Math.abs(h - built.h) > built.h * 0.15) {
        if (built.w) sky.rebuild()
        built = { w, h }
      }
    }
    layout()

    const base = () => Math.min(w, h) / 620
    const place = (k) => {
      const at = trail.getPointAtLength(k * length)
      const ahead = trail.getPointAtLength(Math.min(length, k * length + 2))
      const behind = trail.getPointAtLength(Math.max(0, k * length - 2))
      Object.assign(plane.pose, {
        x: at.x,
        y: at.y,
        rotation: (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI,
        scale: base() * (0.65 + k * 0.55),
        facing: 1,
      })
      plane.apply()
      reveal.setAttribute('stroke-dashoffset', String(length * (1 - k)))
    }

    const FLIGHT = 14
    const CYCLE = 18
    let offset = 0
    const tick = (time) => {
      const local = (time - offset) % CYCLE
      const k = Math.min(1, local / FLIGHT)
      place(k)
      layer.style.opacity = local > FLIGHT + 2.5 ? '0' : '1'
    }
    if (reduce) {
      place(0.55)
      sky.pause(true)
    } else {
      // after the intro the sky is empty (the plane became the pass): the
      // next flight starts a moment later instead of popping in mid-route
      offset = gsap.ticker.time - (introSky ? FLIGHT + 2.6 : 2)
      gsap.ticker.add(tick)
    }

    const resize = new ResizeObserver(() => {
      layout()
      if (reduce) place(0.55)
    })
    resize.observe(host)

    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      if (reduce || entry.isIntersecting === visible) return
      visible = entry.isIntersecting
      sky.pause(!visible)
      if (visible) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    })
    io.observe(host)

    const onMove = (event) => sky.setParallax((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1)
    const onTilt = (event) => {
      if (event.gamma == null) return
      sky.setParallax(Math.max(-1, Math.min(1, event.gamma / 25)), Math.max(-1, Math.min(1, (event.beta - 45) / 25)))
    }
    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
    }

    return () => {
      gsap.ticker.remove(tick)
      resize.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      sky.dispose()
    }
  }, [])

  return <div ref={hostRef} className="dp-sky-host" aria-hidden="true" />
}
