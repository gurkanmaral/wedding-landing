// Oya: an Anatolian needle-lace medallion drawn as fine SVG thread, ring by
// ring from the centre, with dusty-rose carnations, sage leaves and small
// raised crocheted flowers on the scalloped edge. Its shadow is a blurred
// copy (<use>) that moves against the light (pointer / gyro). Shared by the
// page hero and the intro.
import { gsap } from 'gsap'
import { seeded } from '../../shared/intro/core.js'
import './lace.css'

const TAU = Math.PI * 2
const f = (n) => Math.round(n * 10) / 10
const P = (r, a) => `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`

function petal(a, r0, r1, w) {
  const s = r1 - r0
  return `M${P(r0, a - w)}C${P(r0 + s * 0.55, a - w * 1.1)} ${P(r1 - s * 0.12, a - w * 0.35)} ${P(r1, a)}C${P(r1 - s * 0.12, a + w * 0.35)} ${P(r0 + s * 0.55, a + w * 1.1)} ${P(r0, a + w)}`
}

const ring = (r) => `M${f(-r)} 0A${r} ${r} 0 1 0 ${f(r)} 0A${r} ${r} 0 1 0 ${f(-r)} 0`
const loop = (x, y, r) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${f(r * 2)} 0a${r} ${r} 0 1 0 ${f(-r * 2)} 0`

const THREAD = 'stroke:var(--oya-thread,#fffaf1)'
const ROSE = 'stroke:var(--oya-rose,#c49a91)'
const SAGE = 'stroke:var(--oya-sage,#93a283)'
const GOLD = 'stroke:var(--oya-gold,#b89b5e)'

// rings of stitches, centre outward; each entry is [style, d]
function rings() {
  const out = []
  // 0 — picot edge around the names
  const r0 = []
  r0.push([THREAD, ring(196)])
  for (let k = 0; k < 48; k += 1) {
    const a = (k / 48) * TAU
    r0.push([THREAD, loop(Math.cos(a) * 188, Math.sin(a) * 188, 5)])
  }
  out.push(r0)
  // 1 — diamond net ground
  const r1 = []
  for (let pass = 0; pass < 2; pass += 1) {
    let d = ''
    for (let k = 0; k <= 48; k += 1) {
      const a = ((k + pass * 0.5) / 48) * TAU
      d += `${k ? 'L' : 'M'}${P(k % 2 ? 252 : 204, a)}`
    }
    r1.push([THREAD, d])
  }
  r1.push([THREAD, ring(256)])
  out.push(r1)
  // 2 — sixteen netted petals
  const r2 = []
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * TAU
    const w = (Math.PI / 16) * 0.9
    r2.push([THREAD, petal(a, 258, 336, w)])
    r2.push([THREAD, petal(a, 268, 318, w * 0.55)])
    r2.push([THREAD, `M${P(262, a)}L${P(330, a)}M${P(286, a - w * 0.55)}L${P(286, a + w * 0.55)}M${P(304, a - w * 0.42)}L${P(304, a + w * 0.42)}`])
  }
  out.push(r2)
  // 3 — chain of small arches, crocheted in sixteen runs
  const r3 = []
  for (let g = 0; g < 16; g += 1) {
    let d = ''
    for (let j = 0; j < 4; j += 1) {
      const k = g * 4 + j
      const a0 = (k / 64) * TAU
      const a1 = ((k + 1) / 64) * TAU
      d += `${j ? 'L' : 'M'}${P(338, a0)}Q${P(360, (a0 + a1) / 2)} ${P(338, a1)}`
    }
    r3.push([THREAD, d])
  }
  r3.push([GOLD, ring(338)])
  out.push(r3)
  // 4 — twelve carnations (karanfil) with sage leaves
  const r4 = []
  for (let k = 0; k < 12; k += 1) {
    const a = (k / 12) * TAU
    const w = TAU / 12
    r4.push([SAGE, `M${P(352, a - 0.05)}Q${P(366, a)} ${P(352, a + 0.05)}`])
    r4.push([ROSE, petal(a, 364, 442, w * 0.14)])
    r4.push([ROSE, petal(a - w * 0.16, 366, 424, w * 0.11)])
    r4.push([ROSE, petal(a + w * 0.16, 366, 424, w * 0.11)])
    r4.push([SAGE, petal(a + w * 0.5, 352, 408, w * 0.12)])
    r4.push([SAGE, `M${P(354, a + w * 0.5)}L${P(400, a + w * 0.5)}`])
  }
  out.push(r4)
  // 5 — scalloped outer edge with picots
  const r5 = []
  for (let k = 0; k < 24; k += 1) {
    const a0 = (k / 24) * TAU
    const a1 = ((k + 1) / 24) * TAU
    const am = (a0 + a1) / 2
    let d = `M${P(446, a0)}Q${P(502, am)} ${P(446, a1)}`
    d += `M${P(452, a0 + 0.03)}Q${P(490, am)} ${P(452, a1 - 0.03)}`
    const [x, y] = [Math.cos(am) * 482, Math.sin(am) * 482]
    d += loop(x, y, 5)
    r5.push([THREAD, d])
  }
  out.push(r5)
  return out
}

function bloom(uid, a, r) {
  const x = Math.cos(a) * r
  const y = Math.sin(a) * r
  const petals = Array.from({ length: 5 }, (_, i) => `<ellipse cx="0" cy="-12" rx="8" ry="13" transform="rotate(${i * 72})"/>`).join('')
  const stitches = Array.from({ length: 5 }, (_, i) => `<path d="M0 -5L0 -20" transform="rotate(${i * 72})"/>`).join('')
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f((a * 180) / Math.PI + 90)})"><g class="oya-bloom">
    <g style="fill:var(--oya-petal,url(#${uid}-petal));stroke:var(--oya-petal-edge,#a98179);stroke-width:1.2">${petals}</g>
    <g fill="none" style="stroke:var(--oya-stitch,rgba(255,250,241,0.7))" stroke-width="1.2" stroke-dasharray="2 2.5">${stitches}</g>
    <circle r="5.5" style="fill:var(--oya-bead,url(#${uid}-bead))"/>
  </g></g>`
}

/** The medallion's markup: a <g id="{uid}-lace"> to be referenced by the shadow. */
export function laceMarkup(uid) {
  const groups = rings()
    .map((items, i) => `<g data-ring="${i}">${items.map(([style, d]) => `<path d="${d}" style="${style}" pathLength="1" stroke-dasharray="1 1"/>`).join('')}</g>`)
    .join('')
  const blooms = Array.from({ length: 12 }, (_, k) => bloom(uid, ((k + 0.5) / 12) * TAU, 452)).join('')
  return `<defs>
    <radialGradient id="${uid}-petal" cx="0.5" cy="0.75" r="0.8">
      <stop offset="0" stop-color="#f1dcd6"/><stop offset="0.55" stop-color="#d4b3aa"/><stop offset="1" stop-color="#a98179"/>
    </radialGradient>
    <radialGradient id="${uid}-bead" cx="0.35" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#f6e7bf"/><stop offset="0.6" stop-color="#b89b5e"/><stop offset="1" stop-color="#7a6437"/>
    </radialGradient>
  </defs>
  <g id="${uid}-lace" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${groups}<g class="oya-blooms">${blooms}</g></g>`
}

/* -------------------------------------------------------------- linen */

export function paintLinen(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const tile = document.createElement('canvas')
  tile.width = 192
  tile.height = 192
  const t = tile.getContext('2d')
  const random = seeded(5)
  t.fillStyle = '#efe6da'
  t.fillRect(0, 0, 192, 192)
  for (let y = 0; y < 192; y += 3) {
    t.fillStyle = `rgba(107,91,83,${(0.03 + random() * 0.05).toFixed(3)})`
    t.fillRect(0, y, 192, 1 + (random() > 0.85 ? 1 : 0))
  }
  for (let x = 0; x < 192; x += 3) {
    t.fillStyle = `rgba(255,253,248,${(0.12 + random() * 0.18).toFixed(3)})`
    t.fillRect(x, 0, 1, 192)
  }
  // slubs, the little thick knots of hand-woven linen
  for (let i = 0; i < 40; i += 1) {
    t.fillStyle = random() > 0.5 ? 'rgba(107,91,83,0.08)' : 'rgba(255,255,255,0.35)'
    if (random() > 0.5) t.fillRect(random() * 192, Math.floor(random() * 64) * 3, 6 + random() * 16, 1.5)
    else t.fillRect(Math.floor(random() * 64) * 3, random() * 192, 1.5, 6 + random() * 16)
  }
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')
  ctx.fillRect(0, 0, width, height)
  const glow = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, Math.max(width, height) * 0.75)
  glow.addColorStop(0, 'rgba(255,252,244,0.55)')
  glow.addColorStop(0.5, 'rgba(251,248,243,0.1)')
  glow.addColorStop(1, 'rgba(160,135,115,0.28)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

/* -------------------------------------------------------------- light */

/**
 * A soft light that follows the pointer or the phone's tilt and drifts on its
 * own when idle. onUpdate(x, y) gets smoothed values in -1..1 every frame.
 */
export function createLight(onUpdate, { reduce = false } = {}) {
  let tx = 0.35
  let ty = -0.4
  let x = tx
  let y = ty
  let lastInput = -1e9
  let paused = false
  let raf = 0
  let time = 0
  let last = performance.now()
  const onMove = (event) => {
    tx = (event.clientX / window.innerWidth) * 2 - 1
    ty = (event.clientY / window.innerHeight) * 2 - 1
    lastInput = time
  }
  const onTilt = (event) => {
    if (event.gamma == null) return
    tx = Math.max(-1, Math.min(1, event.gamma / 30))
    ty = Math.max(-1, Math.min(1, (event.beta - 40) / 30))
    lastInput = time
  }
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (paused) return
    time += dt
    if (!reduce && time - lastInput > 3) {
      tx = Math.sin(time * 0.23) * 0.55
      ty = Math.cos(time * 0.17) * 0.45 - 0.15
    }
    x += (tx - x) * 0.04
    y += (ty - y) * 0.04
    onUpdate(x, y)
  }
  if (!reduce) {
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
  }
  raf = requestAnimationFrame(frame)
  return {
    set(nx, ny) {
      tx = nx
      ty = ny
      lastInput = time
    },
    setPaused(v) {
      paused = v
    },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
    },
  }
}

/* -------------------------------------------------------------- mount */

let counter = 0

/**
 * Builds linen, light, lace and its shadow inside host.
 * Returns { root, set({ lx, ly, spin, scale, boost }), setLight(x, y), setSpin(deg), setShadowScale(s), setBoost(v), crochet(), dispose }.
 */
export function mountLace(host, { blank = false } = {}) {
  counter += 1
  const uid = `oya${counter}`
  const root = document.createElement('div')
  root.className = 'oya-stage'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = `
    <canvas class="oya-linen"></canvas>
    <div class="oya-light"></div>
    <div class="oya-medallion">
      <div class="oya-shadow"><div class="oya-shadow-inner"><svg viewBox="-500 -500 1000 1000"><use href="#${uid}-lace"/></svg></div></div>
      <div class="oya-lace-wrap"><svg class="oya-lace" viewBox="-500 -500 1000 1000">${laceMarkup(uid)}</svg></div>
    </div>`
  host.appendChild(root)
  const linen = root.querySelector('.oya-linen')
  const light = root.querySelector('.oya-light')
  const shadow = root.querySelector('.oya-shadow')
  const lace = root.querySelector('.oya-lace-wrap')
  const paths = [...root.querySelectorAll('.oya-lace [data-ring]')].map((g) => [...g.querySelectorAll('path')])
  const blooms = [...root.querySelectorAll('.oya-bloom')]

  const state = { lx: 0, ly: 0, spin: 0, scale: 1, boost: 0 }
  const apply = () => {
    const { lx, ly, spin, scale, boost } = state
    // the shadow falls away from the light; closer light → bigger, softer shadow
    const ox = -lx * 22 * scale
    const oy = (-ly * 18 + 10) * scale
    shadow.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) scale(${(1.04 * scale).toFixed(3)}) rotate(${spin.toFixed(2)}deg)`
    shadow.style.opacity = (0.34 + boost * 0.2).toFixed(3)
    lace.style.transform = `rotate(${spin.toFixed(2)}deg)`
    light.style.setProperty('--lx', `${(50 + lx * 32).toFixed(1)}%`)
    light.style.setProperty('--ly', `${(45 + ly * 30).toFixed(1)}%`)
    light.style.opacity = (0.75 + boost * 0.25).toFixed(3)
  }

  const resize = () => {
    const rect = root.getBoundingClientRect()
    paintLinen(linen, rect.width || window.innerWidth, rect.height || window.innerHeight)
  }
  const observer = new ResizeObserver(resize)
  observer.observe(root)

  if (blank) {
    paths.flat().forEach((p) => {
      p.style.strokeDashoffset = '1'
    })
    gsap.set(blooms, { scale: 0, transformOrigin: '50% 50%' })
  }
  apply()

  return {
    root,
    // update several of lx, ly, spin, scale, boost at once
    set(values) {
      Object.assign(state, values)
      apply()
    },
    setLight(x, y) {
      state.lx = x
      state.ly = y
      apply()
    },
    setSpin(deg) {
      state.spin = deg
      apply()
    },
    setShadowScale(s) {
      state.scale = s
      apply()
    },
    setBoost(v) {
      state.boost = v
      apply()
    },
    // ring by ring from the centre, each ring stitched around the circle
    crochet(duration = 3) {
      const tl = gsap.timeline()
      const weights = [0.12, 0.14, 0.2, 0.14, 0.24, 0.16]
      let at = 0
      paths.forEach((ringPaths, i) => {
        const d = duration * weights[i]
        tl.to(ringPaths, { strokeDashoffset: 0, duration: d * 0.55, ease: 'none', stagger: { amount: d * 0.45 } }, at)
        at += d * 0.82
      })
      tl.to(blooms, { scale: 1, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2.2)', stagger: { amount: 0.4 } }, at - 0.15)
      return tl
    },
    dispose() {
      observer.disconnect()
      root.remove()
    },
  }
}
