// Boğaz at night as a layered illustration (SVG + one painted canvas):
// stars and the moon, the hazy far shore with the 15 Temmuz bridge (slender
// towers, inclined zigzag hangers, unsuspended side spans, LED light strip),
// the wooded Kandilli slope with umbrella pines and the observatory dome,
// a row of wooden yalıs with cumbas, eaves and boathouse arches, and an
// İstanbul vapur. The water is painted every frame: broken reflections of
// the lit windows, moon glitter, the ferry's wake — and in the intro the
// names written into that wake. Shared by the page hero and the intro.
import './bosphorusArt.css'

const NS = 'http://www.w3.org/2000/svg'
const H = 1000
let mounts = 0

export function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function el(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag)
  if (attrs) for (const key in attrs) node.setAttribute(key, attrs[key])
  if (parent) parent.appendChild(node)
  return node
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

function mix(a, b, t) {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}

function stops(gradient, list) {
  list.forEach(([offset, color, opacity = 1]) => el('stop', { offset, 'stop-color': color, 'stop-opacity': opacity }, gradient))
}

// Small hash for stable shimmer patterns without per-frame allocation.
function hash(a, b) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export function grainUrl(seed = 9) {
  const canvas = document.createElement('canvas')
  canvas.width = 180
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(180, 180)
  const random = seeded(seed)
  for (let i = 0; i < image.data.length; i += 4) {
    const v = random() * 255
    image.data[i] = v
    image.data[i + 1] = v
    image.data[i + 2] = v
    image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

// Night-toned yalı palette: aşı boyası red, cream, pearl grey, ochre, white, rose.
const PALETTE = [
  { wall: '#8a3434', trim: '#eadcc2', shutters: true },
  { wall: '#e6dbc4', trim: '#7b5b3b', shutters: false },
  { wall: '#aab3bd', trim: '#f2ead9', shutters: true },
  { wall: '#c69657', trim: '#f4e7cd', shutters: false },
  { wall: '#efe9dc', trim: '#56677b', shutters: true },
  { wall: '#a2585d', trim: '#f2e3cf', shutters: false },
]
const NIGHT = '#0b1630'

/**
 * Mounts the illustration into `host` (which must be positioned).
 * mode 'hero': windows mostly lit, ferries pass, the bridge lights sweep now and then.
 * mode 'intro': windows mostly dark until lit by the guest; the intro drives the ferry and the names.
 * afterIntro: the hero mounts under the intro's last frame, where the vapur has
 * just sailed off to the right, so the next one only comes in a little later.
 */
export function mountBosphorus(host, { mode = 'hero', reduce = false, afterIntro = false } = {}) {
  const intro = mode === 'intro'
  mounts += 1
  const uid = `bz${mounts}`
  const id = (name) => `${uid}-${name}`
  const url = (name) => `url(#${id(name)})`

  const root = document.createElement('div')
  root.className = 'bz-art'
  const back = el('svg', { class: 'bz-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  const canvas = document.createElement('canvas')
  canvas.className = 'bz-layer'
  const front = el('svg', { class: 'bz-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  const vignette = document.createElement('div')
  vignette.className = 'bz-vignette'
  const grain = document.createElement('div')
  grain.className = 'bz-grain'
  grain.style.backgroundImage = `url(${grainUrl()})`
  root.append(back, canvas, front, vignette, grain)
  host.appendChild(root)
  const ctx = canvas.getContext('2d')

  const state = {
    sweep: -1, // position of the bright band running along the bridge, 0..1
    bridgeGlow: intro ? 0.45 : 1,
    ferryX: -1e5, // stern x in scene units
    ferryScripted: false,
    namesAlpha: 0,
  }
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 }
  let W = 1000
  let L = null
  let k = 1
  let yalis = []
  let windows = []
  let queue = []
  let clock = 0
  let nextToggle = 1
  let ferry = null
  let sweepStops = []
  let waterGradient = null
  let names = null
  let litTarget = intro ? 0.14 : 0.82
  // the intro ends with every window lit and the bridge sweep just finished
  let sweepClock = afterIntro ? 4 : 0
  // Twinkles, blinks and the water shimmer run on the wall clock, so the intro
  // and the hero mounted under it are in step during the cross-fade.
  const wallPhase = () => performance.now() / 1000
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

  /* ------------------------------------------------------------ back */

  function buildBack() {
    back.replaceChildren()
    back.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const { portrait, sf, Y1, deckY, S, cx, xl, xr, towerTop, moon } = L
    const random = seeded(21)
    const defs = el('defs', null, back)

    stops(el('radialGradient', { id: id('moonGlow') }, defs), [
      [0, '#f6e7c8', 0.5],
      [0.25, '#f6e7c8', 0.14],
      [1, '#f6e7c8', 0],
    ])
    stops(el('radialGradient', { id: id('moonDisc'), cx: 0.4, cy: 0.36, r: 0.72 }, defs), [
      [0, '#fffbf1'],
      [0.62, '#f5e8c8'],
      [1, '#d6c193'],
    ])
    stops(el('radialGradient', { id: id('city'), cx: 0.5, cy: 1, r: 0.75 }, defs), [
      [0, '#f6c667', 0.22],
      [0.5, '#e09a5a', 0.08],
      [1, '#f6c667', 0],
    ])
    stops(el('linearGradient', { id: id('ridgeFar'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#2c4874'],
      [1, '#1a2f52'],
    ])
    stops(el('linearGradient', { id: id('ridgeNear'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#1b2f52'],
      [1, '#101e38'],
    ])
    stops(el('linearGradient', { id: id('tower'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#f3d79a'],
      [0.18, '#b99a68'],
      [0.6, '#3c4560'],
      [1, '#16233c'],
    ])
    const anchorL = xl - S * 0.3
    const anchorR = xr + S * 0.3
    const sweep = el('linearGradient', { id: id('sweep'), gradientUnits: 'userSpaceOnUse', x1: anchorL, y1: 0, x2: anchorR, y2: 0 }, defs)
    sweepStops = [0, 0, 0.5, 1, 1].map((offset) => el('stop', { offset, 'stop-color': '#f6c667' }, sweep))
    const soft = el('filter', { id: id('soft'), x: '-20%', y: '-200%', width: '140%', height: '500%' }, defs)
    el('feGaussianBlur', { stdDeviation: 9 }, soft)
    const glow = el('filter', { id: id('lampGlow'), x: '-200%', y: '-200%', width: '500%', height: '500%' }, defs)
    el('feGaussianBlur', { stdDeviation: 2.4 }, glow)

    // stars, thinning toward the city glow
    const stars = el('g', null, back)
    const starCount = Math.round((W * deckY) / (portrait ? 3600 : 5200))
    for (let i = 0; i < starCount; i += 1) {
      const x = random() * W
      const y = Math.pow(random(), 1.5) * (deckY - 70)
      if (Math.hypot(x - moon.x, y - moon.y) < moon.r * 2.6) continue
      const big = random() < 0.08
      const star = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (big ? 1.5 + random() : 0.5 + random() * 0.8).toFixed(2), fill: random() < 0.2 ? '#f6e7c8' : '#e9eef5', opacity: (0.35 + random() * 0.6).toFixed(2) }, stars)
      if (random() < 0.3) {
        star.setAttribute('class', 'bz-twinkle')
        star.style.animationDelay = `${(-random() * 4 - wallPhase()).toFixed(2)}s`
      }
    }

    // the moon, with soft maria and a halo
    el('circle', { cx: moon.x, cy: moon.y, r: moon.r * 7, fill: url('moonGlow') }, back)
    el('circle', { cx: moon.x, cy: moon.y, r: moon.r * 1.9, fill: 'none', stroke: '#f6e7c8', 'stroke-opacity': 0.07, 'stroke-width': moon.r * 0.5 }, back)
    const clip = el('clipPath', { id: id('moonClip') }, defs)
    el('circle', { cx: moon.x, cy: moon.y, r: moon.r }, clip)
    el('circle', { cx: moon.x, cy: moon.y, r: moon.r, fill: url('moonDisc') }, back)
    const maria = el('g', { 'clip-path': url('moonClip'), fill: '#b9a57c', opacity: 0.32 }, back)
    ;[
      [-0.32, -0.28, 0.34, 0.22],
      [0.12, -0.38, 0.22, 0.16],
      [0.2, 0.05, 0.3, 0.24],
      [-0.18, 0.3, 0.2, 0.14],
      [0.46, 0.38, 0.14, 0.1],
    ].forEach(([dx, dy, rx, ry]) => el('ellipse', { cx: moon.x + dx * moon.r, cy: moon.y + dy * moon.r, rx: rx * moon.r, ry: ry * moon.r }, maria))
    // a thin terminator shadow so the disc reads as a sphere
    el('circle', { cx: moon.x + moon.r * 0.18, cy: moon.y + moon.r * 0.1, r: moon.r, fill: 'none', stroke: '#8f7c58', 'stroke-opacity': 0.25, 'stroke-width': moon.r * 0.16, 'clip-path': url('moonClip') }, back)

    // long thin clouds lit by the moon
    const clouds = el('g', { filter: url('soft'), fill: '#6f86ad' }, back)
    ;[
      [moon.x - moon.r * 2, moon.y + moon.r * 0.9, W * 0.28, 9, 0.22],
      [W * 0.25, deckY - 200, W * 0.3, 12, 0.12],
      [W * 0.62, deckY - 120, W * 0.36, 10, 0.1],
    ].forEach(([x, y, rx, ry, o]) => el('ellipse', { cx: x, cy: y, rx, ry, opacity: o }, clouds))

    el('rect', { x: 0, y: deckY - 190, width: W, height: Y1 - deckY + 190, fill: url('city') }, back)

    // far shore: two ridges that rise to deck level at the bridge's ends and dip under the span
    const ridge = (lift, wobble, seed) => {
      const r = seeded(seed)
      const phase = r() * 10
      let d = `M-20 ${Y1} `
      for (let x = -20; x <= W + 20; x += 18) {
        const u = (x - cx) / (S / 2)
        const dip = Math.exp(-(u * u) / 0.42) * 55
        const y = deckY + lift + dip + Math.sin(x * 0.011 + phase) * wobble + Math.sin(x * 0.037 + phase * 2) * wobble * 0.35
        d += `L${x.toFixed(1)} ${y.toFixed(1)} `
      }
      return `${d}L${W + 20} ${Y1} Z`
    }
    el('path', { d: ridge(-6, 16, 3), fill: url('ridgeFar') }, back)

    // a floodlit mosque on the far ridge, when there is room for it
    const mosqueX = !portrait ? xl - S * 0.42 : -1
    if (mosqueX > 60) drawMosque(back, mosqueX, deckY + 4, sf * 1.1)

    el('path', { d: ridge(22, 12, 8), fill: url('ridgeNear') }, back)

    // city lights scattered over both ridges
    const lights = el('g', null, back)
    const lightCount = Math.round(W / (portrait ? 9 : 14))
    for (let i = 0; i < lightCount; i += 1) {
      const x = random() * W
      const u = (x - cx) / (S / 2)
      const top = deckY + 4 + Math.exp(-(u * u) / 0.42) * 55
      const y = top + 8 + random() * (Y1 - top - 20)
      const light = el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (0.7 + random() * 1.1).toFixed(2), fill: random() < 0.7 ? '#f6c667' : '#fff1d6', opacity: (0.45 + random() * 0.5).toFixed(2) }, lights)
      if (random() < 0.35) {
        light.setAttribute('class', 'bz-twinkle')
        light.style.animationDelay = `${(-random() * 4 - wallPhase()).toFixed(2)}s`
      }
    }

    drawBridge(back, { sf, Y1, deckY, S, cx, xl, xr, towerTop, anchorL, anchorR, portrait })
  }

  function drawMosque(parent, x, base, s) {
    const g = el('g', { fill: '#d9c08e', opacity: 0.62 }, parent)
    const glow = el('ellipse', { cx: x, cy: base - 26 * s, rx: 60 * s, ry: 40 * s, fill: '#f6c667', opacity: 0.12, filter: url('soft') }, parent)
    parent.insertBefore(glow, g)
    el('rect', { x: x - 26 * s, y: base - 18 * s, width: 52 * s, height: 18 * s }, g)
    el('path', { d: `M${x - 18 * s} ${base - 18 * s} A${18 * s} ${15 * s} 0 0 1 ${x + 18 * s} ${base - 18 * s} Z` }, g)
    el('path', { d: `M${x - 30 * s} ${base - 10 * s} A${10 * s} ${8 * s} 0 0 1 ${x - 12 * s} ${base - 10 * s} Z` }, g)
    el('path', { d: `M${x + 12 * s} ${base - 10 * s} A${10 * s} ${8 * s} 0 0 1 ${x + 30 * s} ${base - 10 * s} Z` }, g)
    el('rect', { x: x - 0.6 * s, y: base - 40 * s, width: 1.2 * s, height: 8 * s }, g)
    ;[-34, 34].forEach((dx) => {
      el('rect', { x: x + dx * s - 1.6 * s, y: base - 62 * s, width: 3.2 * s, height: 62 * s }, g)
      el('rect', { x: x + dx * s - 2.6 * s, y: base - 46 * s, width: 5.2 * s, height: 1.6 * s }, g)
      el('path', { d: `M${x + dx * s - 1.8 * s} ${base - 62 * s} L${x + dx * s} ${base - 74 * s} L${x + dx * s + 1.8 * s} ${base - 62 * s} Z` }, g)
    })
  }

  function drawBridge(parent, { Y1, deckY, S, cx, xl, xr, towerTop, anchorL, anchorR, portrait }) {
    const g = el('g', null, parent)
    const deckH = Math.max(3, S * 0.011)
    const mid = deckY - 5
    const cableY = (x) => {
      const u = (x - cx) / (S / 2)
      return towerTop + (mid - towerTop) * (1 - u * u)
    }
    const cableW = Math.max(1.1, S * 0.0026)

    // towers: slender tapering steel legs, floodlit from below and crowned by aviation lights
    ;[xl, xr].forEach((x) => {
      const w0 = Math.max(4.5, S * 0.017)
      const w1 = w0 * 0.68
      el('path', { d: `M${x - w0 / 2} ${Y1} L${x - w1 / 2} ${towerTop - 4} L${x + w1 / 2} ${towerTop - 4} L${x + w0 / 2} ${Y1} Z`, fill: url('tower') }, g)
      el('rect', { x: x - w1 * 0.7, y: towerTop - 7, width: w1 * 1.4, height: 4, fill: '#d8bd83' }, g)
      const blinkDelay = `${(-wallPhase()).toFixed(2)}s`
      el('circle', { cx: x, cy: towerTop - 10, r: 5, fill: '#ff4b4b', opacity: 0.35, filter: url('lampGlow'), class: 'bz-blink', style: `animation-delay:${blinkDelay}` }, g)
      el('circle', { cx: x, cy: towerTop - 10, r: 1.6, fill: '#ff6b6b', class: 'bz-blink', style: `animation-delay:${blinkDelay}` }, g)
    })

    // deck (continuous viaduct) with the LED strip underneath
    el('rect', { x: -20, y: deckY, width: W + 40, height: deckH, fill: '#101d35' }, g)
    el('line', { x1: -20, y1: deckY + deckH, x2: W + 20, y2: deckY + deckH, stroke: url('sweep'), 'stroke-width': 1.4 }, g)
    el('line', { x1: -20, y1: deckY + deckH * 0.5, x2: W + 20, y2: deckY + deckH * 0.5, stroke: url('sweep'), 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-dasharray': `0.1 ${portrait ? 5 : 7}` }, g)

    // inclined hangers in the classic zigzag
    const n = portrait ? 22 : 38
    let hangers = ''
    for (let i = 1; i < n; i += 1) {
      const x = xl + (i * S) / n
      const foot = x + (i % 2 ? 1 : -1) * (S / n) * 0.45
      hangers += `M${x.toFixed(1)} ${cableY(x).toFixed(1)} L${foot.toFixed(1)} ${deckY} `
    }
    el('path', { d: hangers, stroke: url('sweep'), 'stroke-width': portrait ? 0.55 : 0.8, opacity: 0.55, fill: 'none' }, g)

    // main and back-stay cables (the side spans are not suspended)
    const cable = `M${anchorL} ${deckY + 8} Q${xl - S * 0.15} ${towerTop + (deckY - towerTop) * 0.55} ${xl} ${towerTop} Q${cx} ${2 * mid - towerTop} ${xr} ${towerTop} Q${xr + S * 0.15} ${towerTop + (deckY - towerTop) * 0.55} ${anchorR} ${deckY + 8}`
    el('path', { d: cable, stroke: url('sweep'), 'stroke-width': cableW, fill: 'none' }, g)
    el('path', { d: cable, stroke: url('sweep'), 'stroke-width': cableW * 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': `0.1 ${portrait ? 6 : 9}` }, g)
  }

  /* ----------------------------------------------------------- front */

  function buildFront() {
    front.replaceChildren()
    front.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const { portrait, sf, Y1 } = L
    const random = seeded(7)
    const defs = el('defs', null, front)

    const clap = el('pattern', { id: id('clap'), width: 8, height: 3.4 * sf, patternUnits: 'userSpaceOnUse' }, defs)
    el('rect', { x: 0, y: 0, width: 8, height: 0.7 * sf, fill: '#000', opacity: 0.22 }, clap)
    el('rect', { x: 0, y: 0.7 * sf, width: 8, height: 0.5 * sf, fill: '#fff', opacity: 0.05 }, clap)
    stops(el('linearGradient', { id: id('warmA'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#fff0c4'],
      [0.55, '#ffc66e'],
      [1, '#e8913f'],
    ])
    stops(el('linearGradient', { id: id('warmB'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#fff6e2'],
      [1, '#f3c27a'],
    ])
    stops(el('linearGradient', { id: id('glass'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#2a3a58'],
      [0.4, '#141f35'],
      [1, '#0a1222'],
    ])
    stops(el('radialGradient', { id: id('wash'), cx: 0.5, cy: 0.6, r: 0.7 }, defs), [
      [0, '#ffb35c', 0.55],
      [1, '#ffb35c', 0],
    ])
    stops(el('linearGradient', { id: id('hill'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#0f1e36'],
      [1, '#070e1d'],
    ])
    const glowFilter = el('filter', { id: id('glow'), x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs)
    el('feGaussianBlur', { stdDeviation: 4.5 * sf }, glowFilter)

    drawTreeline(front, random)

    const bodies = el('g', null, front)
    const washes = el('g', null, front)
    const glows = el('g', { filter: url('glow'), style: 'mix-blend-mode:screen' }, front)
    const panes = el('g', null, front)
    const previous = windows
    yalis = []
    windows = []
    queue = []

    let x = -random() * 50 * sf
    let index = 0
    while (x < W + 10) {
      const floors = random() < (portrait ? 0.5 : 0.6) ? 3 : 2
      const cols = 3 + Math.floor(random() * 4)
      const pitch = 20 * sf
      const w = cols * pitch + 18 * sf
      buildYali({ x, w, floors, cols, pitch, palette: PALETTE[(index * 7 + Math.floor(random() * 3)) % PALETTE.length], bodies, washes, glows, panes, random })
      const gap = random() < 0.35 ? (16 + random() * 34) * sf : 1.5 * sf
      if (gap > 10) {
        // garden wall and a lantern between neighbours
        el('rect', { x: x + w, y: Y1 - 13 * sf, width: gap, height: 13 * sf, fill: '#283247' }, bodies)
        el('rect', { x: x + w, y: Y1 - 13 * sf, width: gap, height: 1.4 * sf, fill: '#56637d' }, bodies)
        drawLantern(bodies, glows, x + w + gap / 2, Y1 - 13 * sf, sf)
      }
      x += w + gap
      index += 1
    }

    // quay edge catching the moonlight
    el('rect', { x: 0, y: Y1 - 1.2, width: W, height: 2.4, fill: '#5f6f8c', opacity: 0.7 }, front)

    // restore the lit fraction across a re-layout
    const litFraction = previous.length ? previous.filter((w) => w.on).length / previous.length : afterIntro ? 1 : litTarget
    windows.forEach((w) => {
      if (random() < litFraction) setWindow(w, true, true)
    })

    ferry = buildFerry(front, sf * (portrait ? 0.95 : 1.12))
  }

  function drawTreeline(parent, random) {
    const { sf, Y1, portrait } = L
    let d = `M-30 ${Y1} L-30 ${Y1 - 80 * sf} `
    let rim = ''
    let x = -30
    while (x < W + 30) {
      const kind = random()
      const base = Y1 - (62 + random() * 26) * sf
      if (kind < 0.42) {
        // umbrella pine: a crooked trunk and a flat, layered crown
        const h = (48 + random() * 34) * sf
        const w = (34 + random() * 26) * sf
        const lean = (random() - 0.5) * 10 * sf
        d += `L${x} ${base} L${x + w * 0.46} ${base} L${x + w * 0.47 + lean} ${base - h * 0.62} `
        d += `C${x + w * 0.1} ${base - h * 0.62} ${x - w * 0.05} ${base - h * 0.86} ${x + w * 0.2} ${base - h * 0.92} `
        d += `C${x + w * 0.3} ${base - h * 1.04} ${x + w * 0.7} ${base - h * 1.04} ${x + w * 0.8} ${base - h * 0.93} `
        d += `C${x + w * 1.08} ${base - h * 0.88} ${x + w * 0.98} ${base - h * 0.62} ${x + w * 0.53 + lean} ${base - h * 0.62} `
        d += `L${x + w * 0.54} ${base} L${x + w} ${base} `
        rim += `M${x + w * 0.22} ${base - h * 0.95} C${x + w * 0.35} ${base - h * 1.03} ${x + w * 0.66} ${base - h * 1.03} ${x + w * 0.78} ${base - h * 0.95} `
        x += w * 0.92
      } else if (kind < 0.7) {
        // cypress
        const h = (64 + random() * 54) * sf
        const w = (9 + random() * 6) * sf
        d += `L${x} ${base} C${x - w * 0.2} ${base - h * 0.5} ${x + w * 0.35} ${base - h * 0.9} ${x + w * 0.5} ${base - h} C${x + w * 0.65} ${base - h * 0.9} ${x + w * 1.2} ${base - h * 0.5} ${x + w} ${base} `
        rim += `M${x + w * 0.5} ${base - h} C${x + w * 0.7} ${base - h * 0.85} ${x + w} ${base - h * 0.6} ${x + w * 1.05} ${base - h * 0.4} `
        x += w + random() * 6 * sf
      } else {
        // rounded plane tree
        const h = (36 + random() * 30) * sf
        const w = (30 + random() * 26) * sf
        d += `L${x} ${base} C${x - w * 0.1} ${base - h * 0.7} ${x + w * 0.3} ${base - h * 1.05} ${x + w * 0.55} ${base - h} C${x + w * 0.95} ${base - h * 0.96} ${x + w * 1.1} ${base - h * 0.5} ${x + w} ${base} `
        rim += `M${x + w * 0.2} ${base - h * 0.85} C${x + w * 0.35} ${base - h * 1.02} ${x + w * 0.7} ${base - h * 1.0} ${x + w * 0.88} ${base - h * 0.8} `
        x += w * 0.85
      }
    }
    d += `L${W + 30} ${Y1} Z`
    el('path', { d, fill: url('hill') }, parent)
    el('path', { d: rim, fill: 'none', stroke: '#6f86b0', 'stroke-opacity': 0.28, 'stroke-width': 1.1 * sf }, parent)

    // Kandilli observatory dome on the slope
    const ox = portrait ? W * 0.16 : W * 0.1
    const oy = Y1 - 96 * sf
    const og = el('g', null, parent)
    el('rect', { x: ox - 16 * sf, y: oy, width: 32 * sf, height: 18 * sf, fill: '#1a2944' }, og)
    el('path', { d: `M${ox - 12 * sf} ${oy} A${12 * sf} ${12 * sf} 0 0 1 ${ox + 12 * sf} ${oy} Z`, fill: '#2a3c5e' }, og)
    el('path', { d: `M${ox - 11 * sf} ${oy - 3 * sf} A${12 * sf} ${12 * sf} 0 0 1 ${ox + 2 * sf} ${oy - 11.5 * sf}`, fill: 'none', stroke: '#a9bbdc', 'stroke-opacity': 0.5, 'stroke-width': 1 }, og)
    el('rect', { x: ox - 3 * sf, y: oy + 6 * sf, width: 5 * sf, height: 6 * sf, fill: '#ffcf7a' }, og)
  }

  function drawLantern(bodies, glows, x, top, sf) {
    el('rect', { x: x - 0.6 * sf, y: top - 14 * sf, width: 1.2 * sf, height: 14 * sf, fill: '#1a1f2b' }, bodies)
    el('circle', { cx: x, cy: top - 15.5 * sf, r: 2 * sf, fill: '#ffe2a3' }, bodies)
    el('circle', { cx: x, cy: top - 15.5 * sf, r: 7 * sf, fill: '#ffb85c', opacity: 0.8 }, glows)
  }

  function buildYali({ x, w, floors, cols, pitch, palette, bodies, washes, glows, panes, random }) {
    const { sf, Y1 } = L
    const wall = mix(palette.wall, NIGHT, 0.5)
    const wallLight = mix(palette.wall, NIGHT, 0.42)
    const trim = mix(palette.trim, NIGHT, 0.42)
    const trimDark = mix(palette.trim, '#000000', 0.55)
    const plinth = 16 * sf
    const floorH = 31 * sf
    const bodyTop = Y1 - plinth - floors * floorH
    const roofH = 13 * sf
    const g = el('g', null, bodies)

    // stone quay with boathouse arches
    el('rect', { x, y: Y1 - plinth, width: w, height: plinth, fill: mix('#8a93a3', NIGHT, 0.55) }, g)
    const arches = w > 110 * sf ? 2 : 1
    for (let a = 0; a < arches; a += 1) {
      const ax = x + (w / (arches + 1)) * (a + 1)
      const aw = 15 * sf
      el('path', { d: `M${ax - aw / 2} ${Y1} L${ax - aw / 2} ${Y1 - plinth * 0.5} A${aw / 2} ${aw / 2} 0 0 1 ${ax + aw / 2} ${Y1 - plinth * 0.5} L${ax + aw / 2} ${Y1} Z`, fill: '#03070f' }, g)
    }
    el('rect', { x, y: Y1 - plinth, width: w, height: 1.2 * sf, fill: '#a3aec2', opacity: 0.35 }, g)

    // timber body with clapboard
    const bodyH = floors * floorH
    el('rect', { x, y: bodyTop, width: w, height: bodyH, fill: wall }, g)
    el('rect', { x, y: bodyTop, width: w, height: bodyH, fill: url('clap') }, g)

    // the cumba: a projecting upper bay on carved brackets
    let cumba = null
    if (random() < 0.8) {
      const span = Math.min(3, cols - 1)
      const start = Math.floor((cols - span) / 2)
      const cx0 = x + 9 * sf + start * pitch - 3 * sf
      const cw = span * pitch + 6 * sf
      const bottom = Y1 - plinth - floorH
      cumba = { x0: cx0, x1: cx0 + cw }
      el('rect', { x: cx0, y: bodyTop, width: cw, height: bottom - bodyTop, fill: wallLight }, g)
      el('rect', { x: cx0, y: bodyTop, width: cw, height: bottom - bodyTop, fill: url('clap') }, g)
      el('rect', { x: cx0 - 1.6 * sf, y: bodyTop, width: 1.6 * sf, height: bottom - bodyTop, fill: '#000', opacity: 0.35 }, g)
      el('rect', { x: cx0 + cw, y: bodyTop, width: 2.4 * sf, height: bottom - bodyTop + 4 * sf, fill: '#000', opacity: 0.4 }, g)
      el('rect', { x: cx0, y: bottom, width: cw, height: 2 * sf, fill: trim }, g)
      let brackets = ''
      const count = Math.max(3, Math.round(cw / (11 * sf)))
      for (let b = 0; b <= count; b += 1) {
        const bx = cx0 + (cw / count) * b
        brackets += `M${bx - 1.2 * sf} ${bottom + 2 * sf} L${bx + 1.2 * sf} ${bottom + 2 * sf} L${bx + 0.3 * sf} ${bottom + 8 * sf} Z `
      }
      el('path', { d: brackets, fill: trim }, g)
      el('rect', { x: cx0, y: bottom + 2 * sf, width: cw, height: 6 * sf, fill: '#000', opacity: 0.22 }, g)
    }

    // floor bands and corner boards
    for (let f = 1; f < floors; f += 1) el('rect', { x, y: Y1 - plinth - f * floorH - 1.1 * sf, width: w, height: 2.2 * sf, fill: trim }, g)
    el('rect', { x, y: bodyTop, width: 2.8 * sf, height: bodyH, fill: trim }, g)
    el('rect', { x: x + w - 2.8 * sf, y: bodyTop, width: 2.8 * sf, height: bodyH, fill: trim }, g)

    // wide eaves and a shallow hipped roof
    el('rect', { x, y: bodyTop, width: w, height: 5 * sf, fill: '#000', opacity: 0.32 }, g)
    el('rect', { x: x - 8 * sf, y: bodyTop - 4.5 * sf, width: w + 16 * sf, height: 4.5 * sf, fill: trimDark }, g)
    const roofTop = bodyTop - 4.5 * sf - roofH
    el('path', { d: `M${x - 7 * sf} ${bodyTop - 4.5 * sf} L${x + 18 * sf} ${roofTop} L${x + w - 18 * sf} ${roofTop} L${x + w + 7 * sf} ${bodyTop - 4.5 * sf} Z`, fill: '#221f2a' }, g)
    el('path', { d: `M${x - 7 * sf} ${bodyTop - 4.5 * sf} L${x + 18 * sf} ${roofTop} L${x + w - 18 * sf} ${roofTop}`, fill: 'none', stroke: '#9fb2d4', 'stroke-opacity': 0.42, 'stroke-width': 0.9 }, g)
    const chimneyX = x + w * (0.25 + random() * 0.5)
    el('rect', { x: chimneyX, y: roofTop - 8 * sf, width: 5 * sf, height: 9 * sf, fill: '#2b2832' }, g)
    el('rect', { x: chimneyX - 0.8 * sf, y: roofTop - 9.5 * sf, width: 6.6 * sf, height: 1.8 * sf, fill: '#3a3644' }, g)

    const wash = el('rect', { x, y: bodyTop, width: w, height: bodyH + plinth * 0.4, fill: url('wash'), opacity: 0, class: 'bz-wash' }, washes)
    const yali = { x, w, top: roofTop, on: 0, total: 0, wash, guest: false, reflect: wall, windows: [] }

    // windows: frames and shutters drawn with the body, glass and light above
    const winW = 11 * sf
    for (let f = 0; f < floors; f += 1) {
      const floorTop = Y1 - plinth - (f + 1) * floorH
      const wy = floorTop + floorH * 0.2
      const wh = floorH * (f === floors - 1 ? 0.62 : 0.58)
      for (let c = 0; c < cols; c += 1) {
        const wx = x + 9 * sf + c * pitch + (pitch - winW) / 2
        const inCumba = cumba && f > 0 && wx > cumba.x0 && wx < cumba.x1
        if (palette.shutters && !inCumba) {
          el('rect', { x: wx - 4 * sf, y: wy, width: 3.2 * sf, height: wh, fill: mix(palette.wall, '#000000', 0.62) }, g)
          el('rect', { x: wx + winW + 0.8 * sf, y: wy, width: 3.2 * sf, height: wh, fill: mix(palette.wall, '#000000', 0.62) }, g)
        }
        el('rect', { x: wx - 1.3 * sf, y: wy - 1.3 * sf, width: winW + 2.6 * sf, height: wh + 2.6 * sf, fill: trim }, g)
        if (f === floors - 1) el('path', { d: `M${wx - 2.5 * sf} ${wy - 2 * sf} L${wx + winW / 2} ${wy - 5.5 * sf} L${wx + winW + 2.5 * sf} ${wy - 2 * sf} Z`, fill: trim }, g)
        el('rect', { x: wx, y: wy, width: winW, height: wh, fill: url('glass') }, panes)
        const lit = el('rect', { x: wx, y: wy, width: winW, height: wh, fill: random() < 0.75 ? url('warmA') : url('warmB'), class: 'bz-lit' }, panes)
        lit.style.opacity = 0
        el('path', { d: `M${wx + winW / 2} ${wy} V${wy + wh} M${wx} ${wy + wh * 0.42} H${wx + winW}`, stroke: trimDark, 'stroke-width': 0.9 * sf, fill: 'none' }, panes)
        const glow = el('rect', { x: wx - winW * 0.6, y: wy - wh * 0.2, width: winW * 2.2, height: wh * 1.5, fill: '#ffb45a', class: 'bz-glow' }, glows)
        glow.style.opacity = 0
        const win = { x: wx, y: wy, w: winW, h: wh, lit, glow, on: false, yali, index: windows.length }
        windows.push(win)
        yali.windows.push(win)
        yali.total += 1
      }
    }
    yalis.push(yali)
  }

  function buildFerry(parent, s) {
    // an İstanbul vapur heading right: black boot, white hull, two lit decks and a buff funnel
    const g = el('g', null, parent)
    const glow = el('g', { filter: url('glow'), style: 'mix-blend-mode:screen', opacity: 0.85 }, g)
    el('rect', { x: 24, y: -40, width: 160, height: 10, fill: '#ffb45a' }, glow)
    el('rect', { x: 48, y: -53, width: 108, height: 9, fill: '#ffb45a' }, glow)
    // smoke drifting aft
    const smoke = el('g', { fill: '#8d9bb5', opacity: 0.18, filter: url('glow') }, g)
    ;[[86, -92, 10], [70, -98, 13], [50, -102, 16], [26, -104, 18]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r }, smoke))
    el('path', { d: 'M2 -16 Q0 -20 6 -23 L200 -23 Q214 -25 222 -32 L216 -8 Q208 3 194 3 L16 3 Q4 3 2 -16 Z', fill: '#e2e7ef' }, g)
    el('path', { d: 'M3 -9 L218 -14 L216 -8 Q208 3 194 3 L16 3 Q5 3 3 -9 Z', fill: '#0e1220' }, g)
    el('path', { d: 'M4 -22 L202 -22 Q214 -24 221 -30', fill: 'none', stroke: '#ffffff', 'stroke-opacity': 0.6, 'stroke-width': 1 }, g)
    // main deck
    el('rect', { x: 20, y: -42, width: 168, height: 19, fill: '#cdd5e1' }, g)
    el('rect', { x: 20, y: -43.5, width: 170, height: 2, fill: '#f1f4f8' }, g)
    let windowsPath = ''
    for (let i = 0; i < 16; i += 1) windowsPath += `M${26 + i * 10} -38 h6.4 v8 h-6.4 Z `
    el('path', { d: windowsPath, fill: '#ffd38a' }, g)
    // upper deck and wheelhouse
    el('rect', { x: 44, y: -55, width: 116, height: 12, fill: '#d6dde8' }, g)
    el('rect', { x: 42, y: -56.5, width: 120, height: 1.8, fill: '#f4f6f9' }, g)
    let upperPath = ''
    for (let i = 0; i < 11; i += 1) upperPath += `M${50 + i * 10} -52 h6 v6 h-6 Z `
    el('path', { d: upperPath, fill: '#ffe1a6' }, g)
    el('rect', { x: 150, y: -66, width: 22, height: 11, fill: '#e3e8ef' }, g)
    el('rect', { x: 153, y: -63, width: 16, height: 4.5, fill: '#2f4466' }, g)
    // railing
    let rail = 'M40 -61 H160 '
    for (let i = 0; i <= 12; i += 1) rail += `M${40 + i * 10} -61 V-56.5 `
    el('path', { d: rail, stroke: '#e9eef5', 'stroke-width': 0.8, fill: 'none', opacity: 0.8 }, g)
    // funnel
    el('path', { d: 'M90 -56 L94 -86 L108 -86 L106 -56 Z', fill: '#e8d9b0' }, g)
    el('path', { d: 'M93.4 -80 L94 -86 L108 -86 L107.6 -80 Z', fill: '#111522' }, g)
    // mast and navigation lights
    el('path', { d: 'M178 -66 L182 -98', stroke: '#cfd6e2', 'stroke-width': 1.2 }, g)
    el('circle', { cx: 182, cy: -99, r: 1.8, fill: '#ffffff' }, g)
    el('circle', { cx: 182, cy: -99, r: 6, fill: '#fff', opacity: 0.3, filter: url('glow') }, g)
    el('circle', { cx: 176, cy: -46, r: 1.6, fill: '#4cff9a' }, g)
    el('circle', { cx: 4, cy: -26, r: 1.4, fill: '#ffffff' }, g)
    g.style.display = 'none'
    return { node: g, scale: s, length: 222 * s }
  }

  /* ----------------------------------------------------------- water */

  function prepareWater() {
    const { Y1 } = L
    waterGradient = ctx.createLinearGradient(0, Y1, 0, H)
    waterGradient.addColorStop(0, '#1b335a')
    waterGradient.addColorStop(0.18, '#112546')
    waterGradient.addColorStop(0.6, '#0a1730')
    waterGradient.addColorStop(1, '#050b19')
  }

  function drawWater(t) {
    const { Y1, moon, Yf, sf } = L
    ctx.setTransform(k, 0, 0, k, 0, 0)
    ctx.clearRect(0, Y1 - 2, W, H - Y1 + 2)
    ctx.globalAlpha = 1
    ctx.fillStyle = waterGradient
    ctx.fillRect(0, Y1 - 1, W, H - Y1 + 1)

    // rows grow taller toward the viewer, like real ripples in perspective
    let row = 0
    for (let y = Y1; y < H; row += 1) {
      const depth = y - Y1
      const dy = 2 + depth * 0.03
      const amp = 1 + depth * 0.05
      const swayA = Math.sin(t * 1.25 + y * 0.13)
      const swayB = Math.sin(t * 0.7 + y * 0.047)
      const bar = dy * 0.62

      for (let j = 0; j < yalis.length; j += 1) {
        const yali = yalis[j]
        const height = Y1 - yali.top
        if (depth > height * 1.25) continue
        const fade = 1 - depth / (height * 1.25)
        const wob = (swayA * 0.8 + Math.sin(t * 1.6 + y * 0.21 + j * 1.7) * 0.6) * amp + swayB * amp * 0.5
        ctx.globalAlpha = 0.32 * fade
        ctx.fillStyle = yali.reflect
        ctx.fillRect(yali.x + wob, y, yali.w, bar)
        if (!yali.on) continue
        // warm streaks below each lit window, broken by the ripples
        ctx.fillStyle = '#ffc06a'
        const ws = yali.windows
        for (let i = 0; i < ws.length; i += 1) {
          const win = ws[i]
          if (!win.on) continue
          const mirrorTop = Y1 - (win.y + win.h)
          const mirrorBottom = (Y1 - win.y) * 1.35
          let strength
          if (depth >= mirrorTop && depth <= mirrorBottom) strength = 0.75
          else if (depth > mirrorBottom && depth < mirrorBottom + 70 * sf && hash(row, win.index) > 0.55) strength = 0.32 * (1 - (depth - mirrorBottom) / (70 * sf))
          else continue
          const h = hash(row + Math.floor(t * 3), win.index)
          if (h < 0.18) continue
          ctx.globalAlpha = strength * fade * (0.55 + h * 0.45)
          const jitter = Math.sin(t * 2.1 + y * 0.31 + win.index) * amp * 0.9 + wob * 0.6
          ctx.fillRect(win.x - 1 + jitter, y, win.w + 2 + amp * 0.6, bar)
        }
      }

      // moonlit wavelets drifting slowly
      ctx.fillStyle = '#9fb6dc'
      for (let s = 0; s < 3; s += 1) {
        const h1 = hash(row, s + 11)
        const len = (8 + h1 * 30) * (1 + depth * 0.008)
        const x = ((h1 * W * 1.7 + t * (6 + h1 * 10) * (s % 2 ? 1 : -1)) % (W + len)) - len * 0.5
        ctx.globalAlpha = 0.07 + 0.08 * hash(row, s)
        ctx.fillRect(x < 0 ? x + W : x, y + bar * 0.3, len, Math.max(0.6, bar * 0.35))
      }

      // moon glitter path
      const spread = 8 + depth * 0.32
      const glints = 2
      ctx.fillStyle = '#f6e7c8'
      for (let s = 0; s < glints; s += 1) {
        const h2 = hash(row * 3 + Math.floor(t * 2.2 + s * 0.5), s + 3)
        if (h2 < 0.35) continue
        const gx = moon.x + (h2 - 0.5) * spread * 2 + Math.sin(t + y * 0.2) * amp
        ctx.globalAlpha = 0.3 * (1 - depth / (H - Y1)) * h2
        ctx.fillRect(gx, y + bar * 0.2, 3 + h2 * 9 + depth * 0.04, Math.max(0.7, bar * 0.4))
      }
      y += dy
    }

    drawFerryWater(t, Yf, sf)
    if (state.namesAlpha > 0.01 && names) drawNames(t)

    // shoreline shadow under the quay
    ctx.globalAlpha = 0.55
    ctx.fillStyle = '#02050c'
    ctx.fillRect(0, Y1, W, 2.5)
    ctx.globalAlpha = 1
  }

  function drawFerryWater(t, Yf) {
    if (!ferry) return
    const fx = state.ferryX
    const s = ferry.scale
    const len = ferry.length
    if (fx > W + 40 || fx + len < -W * 0.7) return
    // hull reflection and the warm reflection of the lit decks
    ctx.globalAlpha = 0.55
    ctx.fillStyle = '#02050c'
    ctx.fillRect(fx + 6 * s, Yf, 200 * s, 9 * s)
    ctx.fillStyle = '#ffc874'
    for (let r = 0; r < 12; r += 1) {
      const y = Yf + 6 * s + r * 3.4 * s
      const wob = Math.sin(t * 2.4 + r * 0.9) * (1.5 + r * 0.5)
      ctx.globalAlpha = 0.34 * (1 - r / 12)
      for (let seg = 0; seg < 6; seg += 1) {
        if (hash(r + Math.floor(t * 4), seg) < 0.3) continue
        ctx.fillRect(fx + (26 + seg * 27) * s + wob, y, 20 * s, 1.6 * s)
      }
    }
    // bow wave
    const bow = fx + len
    ctx.fillStyle = '#e9eef5'
    ctx.globalAlpha = 0.55
    ctx.beginPath()
    ctx.ellipse(bow - 10 * s, Yf + 1.5 * s, 16 * s, 3 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    // diverging wake line spreading toward the viewer
    for (let i = 0; i < 26; i += 1) {
      const u = i / 26
      const x = bow - 14 * s - u * 300 * s
      const y = Yf + 4 * s + u * 70 * s
      if (hash(i + Math.floor(t * 5), 7) < 0.25) continue
      ctx.globalAlpha = 0.4 * (1 - u)
      ctx.fillRect(x, y, 12 * s * (1 - u * 0.5), 1.4 * s)
    }
    // churned water trailing the stern
    for (let i = 0; i < 48; i += 1) {
      const u = i / 48
      const x = fx - u * W * 0.55
      const spread = 3 + u * 22 * s
      for (let j = 0; j < 3; j += 1) {
        const h = hash(i * 3 + j, Math.floor(t * 6))
        if (h < 0.3) continue
        ctx.globalAlpha = 0.45 * (1 - u) * h
        ctx.fillRect(x - h * 10, Yf + 3 * s + (h - 0.3) * spread, 6 + h * 14, 1.3 * s)
      }
    }
  }

  function drawNames(t) {
    const { namesY } = L
    const src = names.canvas
    const targetW = Math.min(W * 0.88, 920)
    const scale = targetW / src.width
    const squash = 0.6
    const h = src.height * scale * squash
    const x0 = W / 2 - targetW / 2
    const y0 = namesY - h / 2
    const reveal = state.ferryScripted ? state.ferryX - 6 : W + 10
    if (reveal <= x0) return
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, reveal, H)
    ctx.clip()
    const step = 4
    for (let sy = 0; sy < src.height; sy += step) {
      const off = Math.sin(t * 1.8 + sy * 0.09) * 2.4 + Math.sin(t * 1.1 + sy * 0.23) * 1.3
      ctx.globalAlpha = state.namesAlpha * (0.82 + 0.18 * Math.sin(t * 3 + sy * 0.5))
      ctx.drawImage(src, 0, sy, src.width, step, x0 + off, y0 + sy * scale * squash, targetW, step * scale * squash + 0.6)
    }
    ctx.restore()
  }

  // Foam-white script on a transparent canvas, ready to be painted into the water.
  function setNames(text) {
    const [font, size] = ['"Great Vibes", "Italianno", cursive', 170]
    const measure = document.createElement('canvas').getContext('2d')
    measure.font = `${size}px ${font}`
    const tw = Math.ceil(measure.measureText(text).width)
    const c = document.createElement('canvas')
    c.width = Math.min(2400, tw + 160)
    c.height = 280
    const g = c.getContext('2d')
    g.font = `${size}px ${font}`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.shadowColor = 'rgba(246, 198, 103, 0.95)'
    g.shadowBlur = 28
    g.fillStyle = '#fff3d8'
    g.fillText(text, c.width / 2, 150, c.width - 80)
    g.shadowBlur = 0
    g.fillStyle = 'rgba(255,255,255,0.9)'
    g.fillText(text, c.width / 2, 150, c.width - 80)
    // break the strokes up into foam
    g.globalCompositeOperation = 'destination-out'
    const random = seeded(text.length * 31)
    for (let i = 0; i < 1600; i += 1) {
      g.globalAlpha = 0.3 + random() * 0.5
      g.fillRect(random() * c.width, random() * c.height, 1 + random() * 3, 1 + random() * 1.5)
    }
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-over'
    names = { canvas: c }
  }

  /* --------------------------------------------------------- windows */

  function setWindow(win, on, instant = false) {
    if (win.on === on) return
    win.on = on
    if (instant) {
      win.lit.style.transition = 'none'
      win.glow.style.transition = 'none'
    }
    win.lit.style.opacity = on ? 1 : 0
    win.glow.style.opacity = on ? 0.7 : 0
    if (instant) {
      win.lit.style.transition = ''
      win.glow.style.transition = ''
    }
    const yali = win.yali
    yali.on += on ? 1 : -1
    yali.wash.style.opacity = ((yali.on / yali.total) * 0.55).toFixed(2)
  }

  function schedule(list, start, stagger) {
    list.forEach((win, i) => queue.push({ win, at: start + i * stagger }))
    queue.sort((a, b) => a.at - b.at)
  }

  // Lights the yalı under a point (0..1 of the host). Returns true when it is a newly lit house.
  function lightAt(nx, ny) {
    if (!L) return false
    const vx = ((nx + 0.03) / 1.06) * W - parallax.x * 0.5
    const vy = ((ny + 0.03) / 1.06) * H
    if (vy < L.Y1 - 230 * L.sf || vy > H) return false
    for (let i = 0; i < yalis.length; i += 1) {
      const yali = yalis[i]
      if (vx < yali.x - 4 || vx > yali.x + yali.w + 4) continue
      const dark = yali.windows.filter((w) => !w.on && !queue.some((q) => q.win === w))
      if (!dark.length) return false
      dark.sort((a, b) => Math.abs(a.x - vx) + Math.abs(a.y - vy) * 0.3 - (Math.abs(b.x - vx) + Math.abs(b.y - vy) * 0.3))
      schedule(dark, clock, 0.06)
      const fresh = !yali.guest
      yali.guest = true
      return fresh
    }
    return false
  }

  // Every remaining window switches on, sweeping left to right.
  function cascade(duration = 2) {
    const dark = windows.filter((w) => !w.on && !queue.some((q) => q.win === w))
    dark.sort((a, b) => a.x - b.x + (b.y - a.y) * 0.02)
    schedule(dark, clock, dark.length ? duration / dark.length : 0)
  }

  /* ------------------------------------------------------------ loop */

  function layout() {
    const hw = host.clientWidth || window.innerWidth
    const hh = host.clientHeight || window.innerHeight
    const lw = hw * 1.06
    const lh = hh * 1.06
    W = (H * lw) / lh
    const portrait = W < 800
    const sf = portrait ? 0.8 : 1
    const Y1 = portrait ? 712 : 690
    const deckY = portrait ? 512 : 468
    const S = portrait ? W * 0.8 : Math.min(W * 0.46, 960)
    const cx = portrait ? W * 0.53 : W * 0.57
    const towerTop = deckY - S * (portrait ? 0.24 : 0.2)
    L = {
      portrait,
      sf,
      Y1,
      deckY,
      S,
      cx,
      xl: cx - S / 2,
      xr: cx + S / 2,
      towerTop,
      moon: portrait ? { x: W * 0.8, y: 116, r: 25 } : { x: W * 0.83, y: 150, r: 36 },
      Yf: Y1 + (portrait ? 96 : 84),
      namesY: portrait ? 885 : 888,
    }
    canvas.width = Math.round(lw * dpr)
    canvas.height = Math.round(lh * dpr)
    k = canvas.height / H
    buildBack()
    buildFront()
    prepareWater()
    if (!intro && state.ferryX < -1e4) state.ferryX = afterIntro && !reduce ? -(ferry?.length ?? 200) - W * 0.35 : W * 0.18
    render()
  }

  function tick(dt) {
    while (queue.length && queue[0].at <= clock) setWindow(queue.shift().win, true)

    if (clock > nextToggle && !reduce) {
      // the shore breathes: lamps go on and off now and then
      const lit = windows.filter((w) => w.on).length / Math.max(1, windows.length)
      const pick = windows[Math.floor(Math.random() * windows.length)]
      if (pick) setWindow(pick, lit < litTarget ? true : !pick.on)
      nextToggle = clock + 0.7 + Math.random() * 2.2
    }

    if (!intro && ferry) {
      state.ferryX += dt * (W / 28)
      if (state.ferryX > W + 60) state.ferryX = -ferry.length - Math.random() * W * 0.9
      sweepClock += dt
      const cycle = sweepClock % 13
      state.sweep = cycle < 3.6 ? (cycle / 3.6) * 1.4 - 0.2 : -1
    }

    parallax.x += (parallax.tx - parallax.x) * 0.05
    parallax.y += (parallax.ty - parallax.y) * 0.05
  }

  function render() {
    if (!L) return
    // parallax: the far shore drifts less than the yalıs and the water
    back.style.transform = `translate3d(${(-parallax.x * 5).toFixed(2)}px, ${(-parallax.y * 3).toFixed(2)}px, 0)`
    const near = `translate3d(${(-parallax.x * 13).toFixed(2)}px, ${(-parallax.y * 6).toFixed(2)}px, 0)`
    front.style.transform = near
    canvas.style.transform = near

    // bridge LED strip: a bright band runs along the cables
    const glow = state.bridgeGlow
    const s = state.sweep
    const active = s > -0.5
    const band = 0.12
    const a = Math.min(1, Math.max(0, s - band))
    const c = Math.min(1, Math.max(0, s + band))
    const b = Math.min(c, Math.max(a, s))
    sweepStops[1].setAttribute('offset', a.toFixed(3))
    sweepStops[2].setAttribute('offset', b.toFixed(3))
    sweepStops[3].setAttribute('offset', c.toFixed(3))
    const base = (0.35 + 0.55 * glow).toFixed(3)
    for (let i = 0; i < 5; i += 1) sweepStops[i].setAttribute('stop-opacity', base)
    sweepStops[2].setAttribute('stop-color', active ? '#fff5dc' : '#f6c667')
    sweepStops[2].setAttribute('stop-opacity', active ? 1 : base)

    if (ferry) {
      const visible = state.ferryX < W + 40 && state.ferryX + ferry.length > -40
      ferry.node.style.display = visible ? '' : 'none'
      if (visible) ferry.node.setAttribute('transform', `translate(${state.ferryX.toFixed(2)} ${L.Yf}) scale(${ferry.scale})`)
    }
    drawWater(wallPhase())
  }

  let raf = 0
  let last = performance.now()
  let paused = false
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (paused || document.hidden) {
      last = now
      return
    }
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    clock += dt
    tick(dt)
    render()
  }

  layout()
  const staticOnly = reduce && !intro
  if (!staticOnly) raf = requestAnimationFrame(loop)
  let resizeFrame = 0
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(layout)
  })
  observer.observe(host)

  return {
    state,
    get view() {
      return { W, H, ...L }
    },
    get ferryLength() {
      return ferry ? ferry.length : 200
    },
    get yaliCount() {
      return yalis.filter((y) => y.x + y.w > 0 && y.x < W).length
    },
    setNames(text) {
      setNames(text)
    },
    lightAt,
    cascade,
    setPointer(x, y) {
      parallax.tx = x
      parallax.ty = y
    },
    setPaused(value) {
      paused = value
    },
    dispose() {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(resizeFrame)
      observer.disconnect()
      root.remove()
    },
  }
}
