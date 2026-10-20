// Bodrum: a message in a bottle. On the Aegean shore a glass bottle bobs in
// the shallows, refracting the sea, and a wave carries it up onto the sand.
// Tap — or drag the cork — and it squeaks, pops out in a spray of droplets,
// the rolled letter slides from the neck, rises toward you and unrolls with
// the couple's names. The letter fades and the same shore, with the opened
// bottle and its cork left on the sand, is the page hero.
import { gsap } from 'gsap'
import { mountShore, el } from '../../../templates/bodrum/bodrumArt.js'
import {
  CORK_REST,
  SCROLL,
  SCROLL_OUT,
  buildParchment,
  createBottlePainter,
  mountBottleLayer,
  openPose,
  restPose,
  wetness,
} from '../../../templates/bodrum/bottleArt.js'

export const fonts = () => [
  { family: 'Allura', google: 'Allura' },
  { family: 'Josefin Sans', weight: 400, google: 'Josefin+Sans:wght@400' },
]

export const copy = {
  en: { prompt: 'Pull the cork — there’s a message for you' },
  tr: { prompt: 'Mantarı çekin, size bir mesaj var' },
}

let instances = 0

export default function create(host, template, { onOpened, setCaption }) {
  instances += 1
  const uid = `bdi${instances}`
  const art = mountShore(host)
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const painter = createBottlePainter()

  const geometry = () => {
    const v = art.view
    const width = v.portrait ? v.W * 0.84 : Math.min(v.W * 0.28, 540)
    const height = v.portrait ? Math.min(width * 1.22, 470) : Math.min(width * 0.95, 500)
    return { v, rest: restPose(v), paper: { width, height, cy: v.portrait ? 410 : 480 } }
  }

  // bottle pose and the moving parts, all driven by GSAP and painted each frame
  const g0 = geometry()
  const b = {
    x: g0.rest.x + g0.v.W * (g0.v.portrait ? 0.12 : 0.1),
    y: g0.v.Yh + (g0.v.Ys - g0.v.Yh) * 0.55,
    a: 12,
    s: g0.rest.s * 0.5,
    pull: 0,
    corkX: 0,
    corkY: 0,
    corkR: 0,
    scroll: 0,
    scrollY: 27,
    scrollA: -2,
    showScroll: true,
    floating: 1,
    foam: 1,
    hint: 0,
  }
  const p = { x: 0, y: 0, a: 0, s: 1, u: 0, r: 18 }
  let parchment = null

  /* ----------------------------------------------------- droplets */
  const MAX = small ? 22 : 40
  const particles = Array.from({ length: MAX }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 1, life: 0, ground: 0 }))
  const mist = { x: 0, y: 0, life: 0 }
  const tip = { x: 0, y: 0, dx: 1, dy: 0 }
  const neckTip = (out) => {
    const rad = (b.a * Math.PI) / 180
    out.x = b.x + Math.cos(rad) * 140 * b.s
    out.y = b.y + Math.sin(rad) * 140 * b.s
    out.dx = Math.cos(rad)
    out.dy = Math.sin(rad)
    return out
  }

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;'
  // a soft warm light gathers behind the letter while it is read
  const focus = document.createElement('div')
  focus.style.cssText =
    'position:absolute;inset:0;opacity:0;background:radial-gradient(42% 48% at 50% 46%, rgb(255 246 222 / 0.5), transparent 72%),radial-gradient(130% 95% at 50% 46%, transparent 52%, rgb(14 46 70 / 0.32));'
  const svg = el('svg', { class: 'bd-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  overlay.append(focus, svg)
  const ring = el('circle', { r: 0, fill: 'none', stroke: '#ffffff', 'stroke-width': 2.5, opacity: 0 }, svg)

  const pop = () => {
    neckTip(tip)
    const groundY = b.y + 50 * b.s
    for (let i = 0; i < MAX; i += 1) {
      const q = particles[i]
      const speed = 90 + Math.random() * 230
      const lift = 140 + Math.random() * 260
      q.x = tip.x
      q.y = tip.y
      q.vx = tip.dx * speed + (Math.random() - 0.5) * 120
      q.vy = tip.dy * speed - lift
      q.r = (1.2 + Math.random() * 2.8) * Math.max(0.8, b.s)
      q.life = 1
      q.ground = groundY + Math.random() * 30
    }
    Object.assign(mist, { x: tip.x, y: tip.y, life: 1 })
    ring.setAttribute('cx', tip.x)
    ring.setAttribute('cy', tip.y)
    gsap.fromTo(ring, { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 46 * b.s }, opacity: 0, duration: 0.45, ease: 'power2.out' })
  }

  const drawDrops = (c, k, dt) => {
    c.setTransform(k, 0, 0, k, 0, 0)
    if (mist.life > 0) {
      mist.life -= dt * 1.6
      const r = (1 - mist.life) * 60 * b.s + 8
      const g = c.createRadialGradient(mist.x, mist.y, 0, mist.x, mist.y, r)
      g.addColorStop(0, `rgba(255,255,255,${0.5 * Math.max(0, mist.life)})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = g
      c.fillRect(mist.x - r, mist.y - r, r * 2, r * 2)
    }
    for (let i = 0; i < MAX; i += 1) {
      const q = particles[i]
      if (q.life <= 0) continue
      if (q.y < q.ground) {
        q.vy += 900 * dt
        q.x += q.vx * dt
        q.y += q.vy * dt
        c.globalAlpha = 0.85
        c.fillStyle = 'rgba(206,240,246,0.9)'
        c.beginPath()
        c.ellipse(q.x, q.y, q.r * 0.8, q.r * 1.1, Math.atan2(q.vy, q.vx) + Math.PI / 2, 0, Math.PI * 2)
        c.fill()
        c.fillStyle = '#ffffff'
        c.fillRect(q.x - q.r * 0.35, q.y - q.r * 0.5, q.r * 0.35, q.r * 0.35)
      } else {
        // a dark wet spot on the sand
        q.life -= dt * 0.8
        c.globalAlpha = 0.3 * q.life
        c.fillStyle = '#9b7a45'
        c.beginPath()
        c.ellipse(q.x, q.ground, q.r * 2, q.r * 0.7, 0, 0, Math.PI * 2)
        c.fill()
      }
    }
    c.globalAlpha = 1
  }

  /* -------------------------------------------------------- frame */
  let lastT = null
  let viewW = 0
  let settled = false
  const pose = { ...b }
  const bottleLayer = mountBottleLayer(host, art, (c, k, t) => {
    const dt = lastT == null ? 0 : Math.min(Math.max(t - lastT, 0), 0.05)
    lastT = t
    const v = art.view
    if (v.W !== viewW) {
      viewW = v.W
      svg.setAttribute('viewBox', `0 0 ${v.W} 1000`)
      // a resize after the bottle has landed keeps it where the hero will draw it
      if (settled) Object.assign(b, restPose(v))
    }
    Object.assign(pose, b)
    pose.y = b.y + b.floating * Math.sin(t * 2.2) * 5 * b.s
    pose.a = b.a + b.floating * Math.sin(t * 1.7) * 6
    painter.draw(c, k, pose, { src: art.canvas, t, wet: b.floating > 0.5 ? 0 : wetness(art, pose) * (1 - b.floating), hint: b.hint * (0.5 + 0.5 * Math.sin(t * 3)) })
    drawDrops(c, k, dt)
    if (parchment) {
      parchment.root.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.a.toFixed(2)}) scale(${p.s.toFixed(4)})`)
      parchment.setUnroll(p.u, p.r)
    }
  })
  host.appendChild(overlay)

  /* ------------------------------------------------------ arrival */
  const arrival = gsap.timeline({ delay: 0.6, onComplete: () => (settled = true) })
  arrival
    // the next wave is the one that carries the bottle in
    .call(() => art.startWave())
    .to(art.state, { surge: 1, duration: 0.5 }, 0)
    .to(b, { x: () => geometry().rest.x, y: () => geometry().rest.y, s: () => geometry().rest.s, duration: 2.0, ease: 'power2.out' }, 0.15)
    .to(b, { keyframes: [{ a: -22, duration: 0.8 }, { a: 6, duration: 0.6 }, { a: g0.rest.a, duration: 0.7, ease: 'back.out(2)' }] }, 0.15)
    .to(b, { floating: 0, duration: 1.3, ease: 'power1.inOut' }, 0.5)
    .to(b, { foam: 0, duration: 1 }, 1.2)
    .to(b, { hint: 1, duration: 0.8 }, 2.4)
    .to(art.state, { surge: 0, duration: 2.6 }, 2.4)

  /* --------------------------------------------------- the gesture */
  let timeline = null
  let drag = null
  const toScene = (event) => {
    const rect = host.getBoundingClientRect()
    const W = art.view.W
    return {
      x: (((event.clientX - rect.left) / rect.width + 0.03) / 1.06) * W,
      y: (((event.clientY - rect.top) / rect.height + 0.03) / 1.06) * 1000,
    }
  }
  const requestOpen = () => {
    if (!timeline) host.click()
  }
  const onDown = (event) => {
    if (timeline || arrival.isActive()) return
    const pt = toScene(event)
    neckTip(tip)
    if (Math.hypot(pt.x - tip.x, pt.y - tip.y) < 90 * b.s + 40) drag = { x: pt.x, y: pt.y, start: b.pull }
  }
  const onMove = (event) => {
    if (!drag || timeline) return
    const pt = toScene(event)
    const along = ((pt.x - drag.x) * tip.dx + (pt.y - drag.y) * tip.dy) / b.s
    b.pull = Math.max(0, Math.min(34, drag.start + along * 0.8))
    if (b.pull > 26) {
      drag = null
      requestOpen()
    }
  }
  const onUp = () => {
    if (!drag || timeline) return
    drag = null
    gsap.to(b, { pull: 0, duration: 0.45, ease: 'back.out(3)' })
  }
  host.addEventListener('pointerdown', onDown)
  host.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)

  /* --------------------------------------------------------- open */
  const liftLetter = () => {
    const g = geometry()
    parchment = buildParchment(svg, uid, {
      width: g.paper.width,
      height: g.paper.height,
      names: template.couple,
      kicker: template.lang === 'tr' ? 'Davetlisiniz' : 'You are invited',
      place: template.place ?? '',
      lang: template.lang,
    })
    b.showScroll = false
    // start exactly where the rolled letter left the neck, at the same size
    const rad = (b.a * Math.PI) / 180
    const along = ((SCROLL.x0 + SCROLL.x1) / 2 + b.scroll - 160) * b.s
    const sx = b.x + Math.cos(rad) * along
    const sy = b.y + Math.sin(rad) * along
    const s0 = ((SCROLL.x1 - SCROLL.x0) * b.s) / parchment.rollLength
    const half = (g.paper.height / 2) * s0
    Object.assign(p, { x: sx - half * Math.sin(rad), y: sy + half * Math.cos(rad), a: b.a, s: s0, u: 0, r: (SCROLL.r * b.s) / s0 })
    parchment.root.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.a.toFixed(2)}) scale(${p.s.toFixed(4)})`)
    parchment.setUnroll(0, p.r)
    // it keeps travelling out of the neck, then sweeps up toward you
    const drift = Math.cos(rad) * 60 * b.s
    gsap.to(p, { keyframes: [{ x: p.x + drift, duration: 0.3, ease: 'power1.out' }, { x: g.v.W / 2, duration: 0.9, ease: 'power2.inOut' }] })
    gsap.to(p, { y: g.paper.cy, duration: 1.2, ease: 'power3.out' })
    gsap.to(p, { s: 1, r: 18, duration: 1.2, ease: 'power2.inOut' })
    gsap.to(p, { keyframes: [{ a: 4, duration: 0.6, ease: 'sine.out' }, { a: 0, duration: 0.5, ease: 'sine.inOut' }] })
    // the twine slips off as it arrives
    gsap.to(parchment.twine, { y: 46, rotation: 28, opacity: 0, transformOrigin: '50% 0%', duration: 0.5, ease: 'power2.in', delay: 0.9 })
  }

  const open = () => {
    if (timeline) return
    arrival.progress(1)
    drag = null
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(b, { hint: 0, duration: 0.3 }, 0)
      .to(b, { pull: Math.max(b.pull, 14), duration: 0.45, ease: 'power1.in' }, 0)
      .to(b, { keyframes: [{ corkR: 6 }, { corkR: -6 }, { corkR: 5 }, { corkR: -4 }, { corkR: 0 }], duration: 0.42 }, 0)
      .call(pop, null, 0.5)
      .to(b, { pull: CORK_REST.pull, duration: 0.08, ease: 'power2.out' }, 0.5)
      .to(b, { corkX: CORK_REST.corkX, duration: 1.0, ease: 'power1.out' }, 0.56)
      .to(b, { corkY: -150, duration: 0.4, ease: 'power2.out' }, 0.56)
      .to(b, { corkY: CORK_REST.corkY, duration: 0.6, ease: 'bounce.out' }, 0.96)
      .to(b, { corkR: CORK_REST.corkR, duration: 1.05, ease: 'power2.out' }, 0.56)
      .to(b, { scrollY: 0, scrollA: 0, duration: 0.55, ease: 'sine.inOut' }, 0.7)
      .to(b, { scroll: SCROLL_OUT, duration: 0.95, ease: 'power2.in' }, 0.85)
      .call(liftLetter, null, 1.8)
      .to(focus, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, 1.9)
      .to(p, { u: 1, duration: 1.45, ease: 'power2.inOut' }, 2.85)
      .call(() => setCaption?.('date', 'top'), null, 3.5)
      .to(p, { y: '-=10', duration: 1.6, ease: 'sine.inOut' }, 4.3)
      // the letter and the light fade; the shore with the opened bottle stays, as the hero shows it
      .to(overlay, { opacity: 0, duration: 0.9, ease: 'power1.inOut' }, 5.6)
      .call(() => setCaption?.(null), null, 5.7)
  }

  return {
    open,
    skip: () => {
      if (timeline) {
        timeline.progress(1)
        return
      }
      // straight to the hero's pose, so the dissolve has nothing to jump
      arrival.progress(1)
      Object.assign(b, openPose(art.view))
      overlay.style.opacity = 0
      onOpened?.()
    },
    setPointer: (x, y) => art.setPointer(x, y),
    dispose: () => {
      arrival.kill()
      timeline?.kill()
      gsap.killTweensOf([b, p, ring, overlay, focus, art.state])
      if (parchment) gsap.killTweensOf([parchment.twine])
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      bottleLayer.dispose()
      overlay.remove()
      art.dispose()
    },
  }
}
