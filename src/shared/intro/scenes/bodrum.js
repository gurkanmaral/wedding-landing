// Bodrum: a message in a bottle. On the Aegean shore at golden hour a glass
// bottle bobs in the shallows and a wave rolls it up onto the sand. Tap — or
// drag the cork — and it squeaks, pops out in a spray of droplets, the rolled
// letter slides from the neck, rises toward you and unrolls with the couple's
// names. The bottle and letter fade and the same shore becomes the page hero.
import { gsap } from 'gsap'
import { mountShore, el } from '../../../templates/bodrum/bodrumArt.js'
import { buildBottle, buildParchment } from '../../../templates/bodrum/bottleArt.js'

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

  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
  const svg = el('svg', { class: 'bd-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  const drops = document.createElement('canvas')
  drops.className = 'bd-layer'
  drops.style.pointerEvents = 'none'
  overlay.append(svg, drops)
  host.appendChild(overlay)
  const dctx = drops.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

  const bottle = buildBottle(svg, uid)
  const ring = el('circle', { r: 0, fill: 'none', stroke: '#ffffff', 'stroke-width': 2.5, opacity: 0 }, svg)

  const geometry = () => {
    const v = art.view
    const s = v.portrait ? (v.W * 0.6) / 320 : Math.min(v.W * 0.24, 430) / 320
    const width = v.portrait ? v.W * 0.84 : Math.min(v.W * 0.3, 560)
    return {
      v,
      rest: { x: v.W * (v.portrait ? 0.45 : 0.46), y: v.portrait ? 786 : 784, a: v.portrait ? -9 : -7, s },
      paper: { width, height: v.portrait ? Math.min(width * 1.25, 500) : Math.min(width * 1.1, 620), cy: v.portrait ? 420 : 470 },
    }
  }

  // bottle pose and the moving parts, all driven by GSAP and applied each frame
  const g0 = geometry()
  const b = {
    x: g0.v.W * 0.66,
    y: g0.v.Yh + (g0.v.Ys - g0.v.Yh) * 0.5,
    a: 14,
    s: g0.rest.s * 0.4,
    pull: 0,
    corkX: 0,
    corkY: 0,
    corkR: 0,
    scroll: 0,
    foam: 0.9,
    floating: 1,
  }
  const p = { x: 0, y: 0, a: 0, s: 1, u: 0 }
  let parchment = null

  /* ----------------------------------------------------- droplets */
  const MAX = small ? 22 : 40
  const particles = Array.from({ length: MAX }, () => ({ x: 0, y: 0, vx: 0, vy: 0, r: 1, life: 0, ground: 0 }))
  const mist = { x: 0, y: 0, life: 0 }
  const neckTip = (out) => {
    const rad = (b.a * Math.PI) / 180
    out.x = b.x + Math.cos(rad) * 140 * b.s
    out.y = b.y + Math.sin(rad) * 140 * b.s
    out.dx = Math.cos(rad)
    out.dy = Math.sin(rad)
    return out
  }
  const tip = { x: 0, y: 0, dx: 1, dy: 0 }

  const pop = () => {
    neckTip(tip)
    const ground = b.y + 44 * b.s
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
      q.ground = ground + Math.random() * 30
    }
    Object.assign(mist, { x: tip.x, y: tip.y, life: 1 })
    ring.setAttribute('cx', tip.x)
    ring.setAttribute('cy', tip.y)
    gsap.fromTo(ring, { attr: { r: 4 }, opacity: 0.9 }, { attr: { r: 46 * b.s }, opacity: 0, duration: 0.45, ease: 'power2.out' })
  }

  const drawDrops = (dt) => {
    const k = drops.height / 1000
    dctx.setTransform(1, 0, 0, 1, 0, 0)
    dctx.clearRect(0, 0, drops.width, drops.height)
    dctx.setTransform(k, 0, 0, k, 0, 0)
    if (mist.life > 0) {
      mist.life -= dt * 1.6
      const r = (1 - mist.life) * 60 * b.s + 8
      const g = dctx.createRadialGradient(mist.x, mist.y, 0, mist.x, mist.y, r)
      g.addColorStop(0, `rgba(255,255,255,${0.5 * Math.max(0, mist.life)})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      dctx.fillStyle = g
      dctx.fillRect(mist.x - r, mist.y - r, r * 2, r * 2)
    }
    for (let i = 0; i < MAX; i += 1) {
      const q = particles[i]
      if (q.life <= 0) continue
      if (q.y < q.ground) {
        q.vy += 900 * dt
        q.x += q.vx * dt
        q.y += q.vy * dt
        dctx.globalAlpha = 0.85
        dctx.fillStyle = 'rgba(206,240,246,0.9)'
        dctx.beginPath()
        dctx.ellipse(q.x, q.y, q.r * 0.8, q.r * 1.1, Math.atan2(q.vy, q.vx) + Math.PI / 2, 0, Math.PI * 2)
        dctx.fill()
        dctx.fillStyle = '#ffffff'
        dctx.fillRect(q.x - q.r * 0.35, q.y - q.r * 0.5, q.r * 0.35, q.r * 0.35)
      } else {
        // a dark wet spot on the sand
        q.life -= dt * 0.8
        dctx.globalAlpha = 0.3 * q.life
        dctx.fillStyle = '#9b7a45'
        dctx.beginPath()
        dctx.ellipse(q.x, q.ground, q.r * 2, q.r * 0.7, 0, 0, Math.PI * 2)
        dctx.fill()
      }
    }
    dctx.globalAlpha = 1
  }

  /* -------------------------------------------------------- frame */
  let raf = 0
  let last = performance.now()
  let clock = 0
  let viewW = 0
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    clock += dt
    const v = art.view
    if (v.W !== viewW) {
      viewW = v.W
      svg.setAttribute('viewBox', `0 0 ${v.W} 1000`)
      const rect = host.getBoundingClientRect()
      drops.width = Math.round(rect.width * 1.06 * dpr)
      drops.height = Math.round(rect.height * 1.06 * dpr)
    }
    const bob = b.floating * Math.sin(clock * 2.2) * 5
    const rock = (1 - b.floating) * Math.sin(clock * 1.3) * 0.7 + b.floating * Math.sin(clock * 1.7) * 6
    bottle.root.setAttribute('transform', `translate(${b.x.toFixed(2)} ${(b.y + bob).toFixed(2)}) rotate(${(b.a + rock).toFixed(2)}) scale(${b.s.toFixed(4)})`)
    bottle.cork.setAttribute('transform', `translate(${(b.pull + b.corkX).toFixed(2)} ${b.corkY.toFixed(2)}) rotate(${b.corkR.toFixed(1)} 299 0)`)
    bottle.scroll.setAttribute('transform', `translate(${b.scroll.toFixed(2)} 0)`)
    bottle.foam.setAttribute('opacity', b.foam.toFixed(2))
    bottle.ground.setAttribute('opacity', (1 - b.floating).toFixed(2))
    const twinkle = 0.55 + 0.45 * Math.sin(clock * 3.1)
    bottle.glint.setAttribute('transform', `translate(206 -30) scale(${twinkle.toFixed(3)}) rotate(${(clock * 20).toFixed(1)})`)
    if (parchment) {
      parchment.root.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.a.toFixed(2)}) scale(${p.s.toFixed(4)})`)
      parchment.setUnroll(p.u)
    }
    drawDrops(dt)
  }
  raf = requestAnimationFrame(frame)

  /* ------------------------------------------------------ arrival */
  const arrival = gsap.timeline({ delay: 0.7 })
  arrival
    .call(() => {
      // time the next wave so it is the one that carries the bottle in
      art.state.swashOffset = -art.time
    })
    .to(art.state, { surge: 1, duration: 0.5 }, 0)
    .to(b, { x: () => geometry().rest.x, y: () => geometry().rest.y, s: () => geometry().rest.s, duration: 1.9, ease: 'power2.out' }, 0.1)
    .to(b, { keyframes: [{ a: -28, duration: 0.7 }, { a: 10, duration: 0.6 }, { a: g0.rest.a, duration: 0.7, ease: 'back.out(2)' }] }, 0.1)
    .to(b, { floating: 0, duration: 1.4, ease: 'power1.inOut' }, 0.4)
    .to(b, { foam: 0, duration: 0.9 }, 1.1)
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
    bottle.scroll.style.display = 'none'
    // start exactly where the rolled letter left the neck
    const rad = (b.a * Math.PI) / 180
    const sx = b.x + Math.cos(rad) * (157 + b.scroll - 160) * b.s
    const sy = b.y + Math.sin(rad) * (157 + b.scroll - 160) * b.s
    const s0 = (210 * b.s) / (g.paper.width + 18)
    const half = (g.paper.height / 2) * s0
    Object.assign(p, { x: sx - half * Math.sin(rad), y: sy + half * Math.cos(rad), a: b.a, s: s0, u: 0 })
    gsap.to(p, { x: g.v.W / 2, y: g.paper.cy, a: 0, s: 1, duration: 0.95, ease: 'power3.inOut' })
    gsap.to(parchment.twine, { opacity: 0, duration: 0.35, delay: 0.7 })
  }

  const open = () => {
    if (timeline) return
    arrival.progress(1)
    drag = null
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(b, { pull: Math.max(b.pull, 16), duration: 0.45, ease: 'power1.in' }, 0)
      .to(b, { keyframes: [{ corkR: 6 }, { corkR: -6 }, { corkR: 5 }, { corkR: -4 }, { corkR: 0 }], duration: 0.42 }, 0)
      .call(pop, null, 0.5)
      .to(b, { pull: 40, duration: 0.08, ease: 'power2.out' }, 0.5)
      .to(b, { corkX: 70, duration: 1.0, ease: 'power1.out' }, 0.56)
      .to(b, { corkY: -170, duration: 0.4, ease: 'power2.out' }, 0.56)
      .to(b, { corkY: 64, duration: 0.6, ease: 'bounce.out' }, 0.96)
      .to(b, { corkR: 560, duration: 1.05, ease: 'power2.out' }, 0.56)
      .to(b, { scroll: 245, duration: 0.9, ease: 'power2.inOut' }, 0.8)
      .call(liftLetter, null, 1.72)
      .to(p, { u: 1, duration: 1.25, ease: 'power2.inOut' }, 2.75)
      .call(() => setCaption?.('date', 'top'), null, 3.3)
      .to(p, { y: '-=12', duration: 1.6, ease: 'sine.inOut' }, 4.0)
      .to(overlay, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 5.1)
      .call(() => setCaption?.(null), null, 5.2)
  }

  return {
    open,
    skip: () => (timeline ? timeline.progress(1) : onOpened?.()),
    setPointer: (x, y) => art.setPointer(x * 0.6, y * 0.6),
    dispose: () => {
      cancelAnimationFrame(raf)
      arrival.kill()
      timeline?.kill()
      gsap.killTweensOf([b, p, ring, overlay, art.state])
      if (parchment) gsap.killTweensOf([parchment.twine])
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      overlay.remove()
      art.dispose()
    },
  }
}
