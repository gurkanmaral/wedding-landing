// Departures: an illustrated sky. A paper plane flies in through the clouds,
// growing as it comes toward you, and loops lazily. Tap to catch it: it swoops
// into your hands, flattens along its creases and unfolds panel by panel into
// a boarding pass with the couple's names, destination, date, gate and seat.
import { gsap } from 'gsap'
import { createSky, createPlane, createPass, passInfo } from '../../../templates/departures/sky.js'

const NS = 'http://www.w3.org/2000/svg'

export const fonts = () => [
  { family: 'Bebas Neue', google: 'Bebas+Neue' },
  { family: 'JetBrains Mono', weight: 600, google: 'JetBrains+Mono:wght@500;600;700' },
  { family: 'JetBrains Mono', weight: 500 },
]

export const copy = {
  en: { prompt: 'Catch the paper plane — tap' },
  tr: { prompt: 'Kâğıt uçağı yakalayın — dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const root = document.createElement('div')
  root.className = 'dpi-root'
  root.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
  host.appendChild(root)

  const sky = createSky(root, { seed: 23 })
  const planeSvg = document.createElementNS(NS, 'svg')
  planeSvg.setAttribute('class', 'dpp-sky-svg')
  planeSvg.setAttribute('aria-hidden', 'true')
  // between the mid clouds and the front bank, so it really flies "through" them
  planeSvg.style.zIndex = '3'
  sky.root.appendChild(planeSvg)
  const plane = createPlane(planeSvg)
  const pass = createPass(root)
  gsap.set(pass.wrap, { autoAlpha: 0 })

  const info = passInfo({
    partner1: template.couple[0],
    partner2: template.couple[1],
    destination: template.place,
    dateText: template.dateLabel,
    date: new Date(`${template.date}T12:00:00`),
    lang: template.lang,
  })

  let w = 1
  let h = 1
  const layout = () => {
    w = host.clientWidth || window.innerWidth
    h = host.clientHeight || window.innerHeight
    planeSvg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    pass.layout(w, h, info)
  }
  layout()

  // flight state
  const state = { mode: 'idle', approach: 0, k: 0, facing: 1, px: 0, py: 0, time: 0 }
  const idleScale = () => Math.min(w, h) / 560
  const idlePose = (time, out) => {
    const u = time * 0.42
    const a = state.approach
    const x = w * (0.5 + 0.27 * Math.sin(u)) + state.px * 18
    const y = h * (0.34 + 0.06 * Math.sin(2 * u)) + state.py * 10
    // fly in from far away, top-left
    out.x = w * 0.12 + (x - w * 0.12) * a
    out.y = h * 0.16 + (y - h * 0.16) * a
    out.scale = idleScale() * (0.12 + 0.88 * a) * (1 + 0.14 * Math.sin(u + 1.3))
    out.dx = 0.27 * w * Math.cos(u) * a + (x - w * 0.12) * (1 - a) * 0.6
    out.dy = 0.12 * h * Math.cos(2 * u) * a + (y - h * 0.16) * (1 - a) * 0.6
    return out
  }
  const idle = { x: 0, y: 0, scale: 0, dx: 1, dy: 0 }
  gsap.to(state, { approach: 1, duration: 2.6, ease: 'power2.out' })

  const orient = (dx, dy, dt) => {
    const target = dx >= 0 ? 1 : -1
    state.facing += (target - state.facing) * Math.min(1, dt * 3.2)
    const right = (Math.atan2(dy, dx) * 180) / Math.PI
    const left = (Math.atan2(-dy, -dx) * 180) / Math.PI
    return state.facing >= 0 ? right : left
  }

  // catch path: a swoop from where the plane is to the centre of the screen
  const swoop = { x0: 0, y0: 0, s0: 0, r0: 0, f0: 1, cx: 0, cy: 0, x1: 0, y1: 0, s1: 1 }
  let last = 0
  const tick = (time) => {
    const dt = Math.min(0.05, time - last)
    last = time
    state.time = time
    const p = plane.pose
    if (state.mode === 'idle') {
      idlePose(time, idle)
      p.x = idle.x
      p.y = idle.y
      p.scale = idle.scale
      p.rotation = orient(idle.dx, idle.dy, dt) + Math.sin(time * 1.7) * 2
      p.facing = state.facing
      plane.apply()
    } else if (state.mode === 'swoop') {
      const k = state.k
      const ik = 1 - k
      const x = ik * ik * swoop.x0 + 2 * ik * k * swoop.cx + k * k * swoop.x1
      const y = ik * ik * swoop.y0 + 2 * ik * k * swoop.cy + k * k * swoop.y1
      const dx = 2 * ik * (swoop.cx - swoop.x0) + 2 * k * (swoop.x1 - swoop.cx)
      const dy = 2 * ik * (swoop.cy - swoop.y0) + 2 * k * (swoop.y1 - swoop.cy)
      p.x = x
      p.y = y
      p.scale = swoop.s0 + (swoop.s1 - swoop.s0) * k * k
      const heading = orient(dx, dy, dt)
      // level out as it arrives
      const settle = Math.max(0, (k - 0.7) / 0.3)
      p.rotation = heading * (1 - settle)
      p.facing = state.facing
      plane.apply()
    }
  }
  gsap.ticker.add(tick)

  const observer = new ResizeObserver(() => {
    const before = pass.size?.portrait
    layout()
    if (state.mode === 'done' && pass.size?.portrait !== before) pass.apply()
  })
  observer.observe(host)

  let timeline = null
  const finish = () => {
    state.mode = 'done'
    onOpened?.()
  }

  const open = () => {
    if (timeline) return
    gsap.killTweensOf(state)
    const p = plane.pose
    const { pw, ph } = pass.size
    const caughtScale = Math.max(pw, ph) / 205
    Object.assign(swoop, {
      x0: p.x,
      y0: p.y,
      s0: p.scale,
      cx: w * (p.x < w / 2 ? 0.2 : 0.8),
      cy: h * 0.86,
      x1: w / 2,
      y1: h / 2,
      s1: caughtScale * 1.08,
    })
    state.k = 0
    state.mode = 'swoop'
    planeSvg.style.zIndex = '25'
    const morph = { t: 0 }
    const flow = { speed: 1 }
    const hw = pw / 2 / caughtScale
    const hh = ph / 2 / caughtScale

    timeline = gsap.timeline({ onComplete: finish })
    timeline
      .to(flow, { speed: 2.6, duration: 0.6, ease: 'power2.in', onUpdate: () => sky.setSpeed(flow.speed) }, 0)
      .to(state, { k: 1, duration: 1.25, ease: 'power2.inOut' }, 0)
      .call(() => {
        state.mode = 'caught'
        state.facing = 1
        Object.assign(plane.pose, { x: w / 2, y: h / 2, rotation: 0, facing: 1 })
      }, null, 1.25)
      // caught: a little give in the hand
      .to(plane.pose, { scale: caughtScale, duration: 0.45, ease: 'back.out(3)', onUpdate: plane.apply }, 1.25)
      .to(plane.pose, { keyframes: [{ rotation: -4 }, { rotation: 2.5 }, { rotation: 0 }], duration: 0.45, ease: 'sine.inOut', onUpdate: plane.apply }, 1.25)
      .to(flow, { speed: 0.6, duration: 1.2, ease: 'power2.out', onUpdate: () => sky.setSpeed(flow.speed) }, 1.2)
      // flatten along the creases into a folded sheet…
      .to(morph, { t: 1, duration: 0.6, ease: 'power2.inOut', onUpdate: () => plane.morph(morph.t, hw, hh) }, 1.65)
      .to(pass.wrap, { autoAlpha: 1, duration: 0.12 }, 2.22)
      .to(planeSvg, { autoAlpha: 0, duration: 0.12 }, 2.3)
      // …then open it, panel by panel
      .to(pass.state, { fold1: 0, offset: 0.5, duration: 0.7, ease: 'power2.inOut', onUpdate: pass.apply }, 2.4)
      .to(pass.state, { fold2: 0, offset: 0, duration: 0.7, ease: 'power2.inOut', onUpdate: pass.apply }, 3.05)
      .fromTo(pass.wrap, { rotationX: 10, y: 8 }, { rotationX: 0, y: 0, duration: 1, ease: 'power2.out' }, 3.3)
      .call(() => setCaption?.('date', 'top'), null, 3.9)
      .to({}, { duration: 0.01 }, 5.5)
  }

  return {
    open,
    skip: () => {
      if (timeline) {
        timeline.progress(1)
        return
      }
      state.mode = 'done'
      gsap.set(planeSvg, { autoAlpha: 0 })
      gsap.set(pass.wrap, { autoAlpha: 1 })
      Object.assign(pass.state, { fold1: 0, fold2: 0, offset: 0 })
      pass.apply()
      finish()
    },
    setPointer: (x, y) => {
      state.px = x
      state.py = y
      sky.setParallax(x, y)
    },
    dispose: () => {
      timeline?.kill()
      gsap.killTweensOf([state, plane.pose, pass.state, pass.wrap, planeSvg])
      gsap.ticker.remove(tick)
      observer.disconnect()
      sky.dispose()
      root.remove()
    },
  }
}
