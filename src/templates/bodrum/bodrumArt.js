// The Aegean shore at Bodrum as a gouache-style illustration (SVG + one
// painted canvas): a late-afternoon sky with soft cumulus, distant islands,
// a dry golden hill with whitewashed cube houses, blue doors, bougainvillea,
// cypresses and the stone windmills on the ridge, a gulet with white sails on
// the horizon, and a turquoise sea whose waves run up the sand and draw back.
// Shared by the page hero and the intro (which adds the bottle on top).
import './bodrumArt.css'

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

export function el(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag)
  if (attrs) for (const key in attrs) node.setAttribute(key, attrs[key])
  if (parent) parent.appendChild(node)
  return node
}

export function stops(gradient, list) {
  list.forEach(([offset, color, opacity = 1]) => el('stop', { offset, 'stop-color': color, 'stop-opacity': opacity }, gradient))
}

function hash(a, b) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function smooth(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

function grainUrl() {
  const canvas = document.createElement('canvas')
  canvas.width = 180
  canvas.height = 180
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(180, 180)
  const random = seeded(13)
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

/**
 * Mounts the shore into `host` (which must be positioned).
 * Returns the layout (`view`), a `state` the intro can drive (surge: a bigger wave), and lifecycle methods.
 */
export function mountShore(host, { reduce = false } = {}) {
  mounts += 1
  const uid = `bd${mounts}`
  const id = (name) => `${uid}-${name}`
  const url = (name) => `url(#${id(name)})`

  const root = document.createElement('div')
  root.className = 'bd-art'
  const back = el('svg', { class: 'bd-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  const canvas = document.createElement('canvas')
  canvas.className = 'bd-layer'
  const front = el('svg', { class: 'bd-layer', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid slice' })
  const light = document.createElement('div')
  light.className = 'bd-light'
  const grain = document.createElement('div')
  grain.className = 'bd-grain'
  grain.style.backgroundImage = `url(${grainUrl()})`
  root.append(back, canvas, front, light, grain)
  host.appendChild(root)
  const ctx = canvas.getContext('2d')
  const base = document.createElement('canvas')
  const bctx = base.getContext('2d')

  const state = { surge: 0, swashOffset: 0 }
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 }
  let W = 1000
  let L = null
  let k = 1
  let clock = 0
  let gulet = null
  let mills = []
  let gulls = []
  let filmGradient = null
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

  /* ------------------------------------------------------------ back */

  function buildBack() {
    back.replaceChildren()
    back.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const { Yh, sun, portrait } = L
    const defs = el('defs', null, back)
    stops(el('linearGradient', { id: id('sky'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#5fb3dd'],
      [0.42, '#93d1e8'],
      [0.78, '#d8eee6'],
      [1, '#f8ead0'],
    ])
    stops(el('radialGradient', { id: id('sun') }, defs), [
      [0, '#fffaf0', 1],
      [0.12, '#fff1cf', 0.9],
      [0.35, '#ffe2a8', 0.35],
      [1, '#ffe2a8', 0],
    ])
    stops(el('linearGradient', { id: id('cloud'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
      [0, '#ffffff'],
      [0.6, '#fbf4e8'],
      [1, '#d6e2e6'],
    ])
    // gouache edge: a slight turbulent displacement gives painted, not vector, outlines
    const paint = el('filter', { id: id('paint'), x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs)
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.035, numOctaves: 3, seed: 4, result: 'n' }, paint)
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 9, xChannelSelector: 'R', yChannelSelector: 'G' }, paint)
    const blur = el('filter', { id: id('blur'), x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs)
    el('feGaussianBlur', { stdDeviation: 14 }, blur)

    el('rect', { x: 0, y: 0, width: W, height: Yh + 4, fill: url('sky') }, back)
    el('circle', { cx: sun.x, cy: sun.y, r: sun.r * 9, fill: url('sun') }, back)
    el('circle', { cx: sun.x, cy: sun.y, r: sun.r, fill: '#fffaf0', opacity: 0.95 }, back)

    // soft cumulus near the horizon and a few high wisps
    const random = seeded(31)
    const clouds = el('g', { filter: url('paint') }, back)
    const cloudCount = portrait ? 4 : 7
    for (let c = 0; c < cloudCount; c += 1) {
      const cx = ((c + 0.3 + random() * 0.4) / cloudCount) * W
      const cy = Yh - 60 - random() * (portrait ? 120 : 140)
      const s = (0.6 + random() * 0.8) * (portrait ? 0.8 : 1)
      const g = el('g', { opacity: (0.75 + random() * 0.25).toFixed(2) }, clouds)
      el('ellipse', { cx, cy: cy + 10 * s, rx: 90 * s, ry: 14 * s, fill: '#d4e2e7' }, g)
      for (let b = 0; b < 6; b += 1) {
        const bx = cx + (b - 2.5) * 26 * s + (random() - 0.5) * 12 * s
        const r = (18 + random() * 22) * s * (1 - Math.abs(b - 2.5) * 0.12)
        el('circle', { cx: bx, cy: cy - r * 0.35, r, fill: url('cloud') }, g)
      }
    }
    const wisps = el('g', { filter: url('blur'), fill: '#ffffff', opacity: 0.5 }, back)
    el('ellipse', { cx: W * 0.3, cy: Yh * 0.28, rx: W * 0.22, ry: 10 }, wisps)
    el('ellipse', { cx: W * 0.7, cy: Yh * 0.18, rx: W * 0.18, ry: 7 }, wisps)

    // distant islands across the water, in blue haze
    const islands = el('g', { filter: url('paint') }, back)
    const island = (x0, x1, h, color) => {
      const mid = (x0 + x1) / 2
      el('path', { d: `M${x0} ${Yh + 2} C${x0 + (mid - x0) * 0.4} ${Yh - h * 0.6} ${mid - (x1 - x0) * 0.15} ${Yh - h} ${mid} ${Yh - h} C${mid + (x1 - x0) * 0.2} ${Yh - h} ${x1 - (x1 - mid) * 0.35} ${Yh - h * 0.5} ${x1} ${Yh + 2} Z`, fill: color }, islands)
    }
    island(W * 0.52, W * 1.05, portrait ? 34 : 42, '#a9c6d4')
    island(W * 0.7, W * 0.92, portrait ? 22 : 26, '#94b6c7')
    island(W * 0.36, W * 0.5, 12, '#b5ced9')
  }

  /* ----------------------------------------------------------- front */

  function hillY(x) {
    const { peakX, peakY, endX, Yh } = L
    if (x <= peakX) return peakY + 18 * Math.pow((peakX - x) / Math.max(peakX, 1), 2) + Math.sin(x * 0.05) * 3
    const t = smooth(peakX, endX, x)
    return peakY + (Yh + 22 - peakY) * t + Math.sin(x * 0.045) * 4 * (1 - t)
  }

  function buildFront() {
    front.replaceChildren()
    front.setAttribute('viewBox', `0 0 ${W} ${H}`)
    const { sf, Yh, endX, peakX, portrait } = L
    const defs = el('defs', null, front)
    stops(el('linearGradient', { id: id('hill'), x1: 0, y1: 0, x2: 0.4, y2: 1 }, defs), [
      [0, '#e2bf7d'],
      [0.5, '#cfa462'],
      [1, '#b7894c'],
    ])
    stops(el('linearGradient', { id: id('sail'), x1: 0, y1: 0, x2: 1, y2: 0 }, defs), [
      [0, '#e3ddd0'],
      [0.6, '#fffaf0'],
      [1, '#fff4dc'],
    ])
    const paint = el('filter', { id: id('paint'), x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs)
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.06, numOctaves: 2, seed: 9, result: 'n' }, paint)
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 3, xChannelSelector: 'R', yChannelSelector: 'G' }, paint)
    const texture = el('filter', { id: id('texture'), x: 0, y: 0, width: '100%', height: '100%' }, defs)
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.9, numOctaves: 2, seed: 2 }, texture)
    el('feColorMatrix', { values: '0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 -1.4 0.9' }, texture)

    // the hill, with scrub and a painted texture
    let d = `M-20 ${Yh + 24} L-20 ${hillY(-20)} `
    for (let x = -20; x <= endX + 30; x += 10) d += `L${x} ${hillY(x).toFixed(1)} `
    d += `L${endX + 40} ${Yh + 24} Z`
    const hillClip = el('clipPath', { id: id('hillClip') }, defs)
    el('path', { d }, hillClip)
    const hill = el('g', { filter: url('paint') }, front)
    el('path', { d, fill: url('hill') }, hill)
    const random = seeded(17)
    const scrub = el('g', { 'clip-path': url('hillClip') }, hill)
    for (let i = 0; i < (portrait ? 40 : 70); i += 1) {
      const x = random() * (endX + 20)
      const y = hillY(x) + 4 + random() * (Yh + 20 - hillY(x))
      el('ellipse', { cx: x, cy: y, rx: (6 + random() * 18) * sf, ry: (3 + random() * 6) * sf, fill: random() < 0.5 ? '#8c8f52' : '#a79a5c', opacity: 0.55 }, scrub)
    }
    // the shaded flank facing away from the sun
    el('path', { d: `M-20 ${hillY(-20)} L${peakX} ${hillY(peakX)} L${peakX - 40} ${Yh + 24} L-20 ${Yh + 24} Z`, fill: '#8a6a3c', opacity: 0.16, 'clip-path': url('hillClip') }, hill)
    el('rect', { x: -20, y: hillY(peakX) - 10, width: endX + 60, height: Yh - hillY(peakX) + 40, filter: url('texture'), opacity: 0.25, 'clip-path': url('hillClip'), style: 'mix-blend-mode:multiply' }, hill)

    // windmills on the ridge
    mills = []
    const millXs = portrait ? [peakX - 34 * sf, peakX + 40 * sf] : [peakX - 70 * sf, peakX + 4 * sf, peakX + 78 * sf]
    millXs.forEach((x, i) => {
      if (x < 6) return
      mills.push(drawMill(front, x, hillY(x) + 3, portrait ? sf * 0.85 : sf, i))
    })

    // whitewashed houses tumbling down to the water, back rows first
    const village = el('g', null, front)
    const rowStep = 13 * sf
    const top = hillY(peakX) + 38 * sf
    for (let y = top; y < Yh + 20; y += rowStep) {
      let x = -10 + random() * 20
      while (x < endX + 10) {
        const w = (20 + random() * 22) * sf
        const h = (14 + random() * 14) * sf
        const ground = hillY(x + w / 2)
        if (y > ground + 10 * sf && random() > 0.18) {
          if (random() < 0.12) drawTree(village, x + w * 0.4, y, sf, random)
          else drawHouse(village, x, y, w, h, sf, random)
        }
        x += w + random() * 6 * sf
      }
    }
    // a little harbour wall and moored boats at the foot of the hill
    el('rect', { x: -20, y: Yh + 20, width: endX + 10, height: 5 * sf, fill: '#e7dcc6' }, front)
    el('rect', { x: -20, y: Yh + 24, width: endX + 10, height: 2 * sf, fill: '#9b8a6e', opacity: 0.6 }, front)
    for (let b = 0; b < (portrait ? 3 : 6); b += 1) {
      const bx = endX * (0.15 + b * (portrait ? 0.28 : 0.14)) + random() * 10
      const by = Yh + 32 * sf + random() * 6
      const s = sf * (0.8 + random() * 0.4)
      el('path', { d: `M${bx} ${by} q${10 * s} ${4 * s} ${22 * s} 0 l${-2 * s} ${-3 * s} h${-18 * s} Z`, fill: b % 2 ? '#ffffff' : '#2c6e9e' }, front)
      el('path', { d: `M${bx + 12 * s} ${by - 3 * s} V${by - 20 * s}`, stroke: '#6b5a44', 'stroke-width': 0.7 }, front)
    }

    gulet = drawGulet(front, portrait ? 0.62 : 0.82)
    gulls = []
    for (let g = 0; g < (portrait ? 3 : 5); g += 1) {
      const node = el('path', { d: 'M-9 0 Q-4.5 -5 0 0 Q4.5 -5 9 0', fill: 'none', stroke: '#33475c', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, front)
      gulls.push({ node, x: random() * W, y: 120 + random() * (Yh - 300), speed: 8 + random() * 10, phase: random() * 6, s: (0.7 + random() * 0.6) * sf })
    }
  }

  function drawHouse(parent, x, y, w, h, sf, random) {
    const g = el('g', null, parent)
    const side = (4 + random() * 4) * sf
    // shaded side wall, sunny front wall, flat roof with parapet
    el('path', { d: `M${x - side} ${y - h + side * 0.35} L${x} ${y - h} L${x} ${y} L${x - side} ${y - side * 0.1} Z`, fill: '#c3cfd8' }, g)
    el('rect', { x, y: y - h, width: w, height: h, fill: '#fbf7ee' }, g)
    el('rect', { x: x - side, y: y - h - 2.4 * sf, width: w + side, height: 2.6 * sf, fill: '#efe7d8' }, g)
    el('rect', { x, y: y - h + 0.2, width: w, height: 1.6 * sf, fill: '#b9b2a6', opacity: 0.5 }, g)
    // blue door and windows
    const blue = random() < 0.7 ? '#1d5e8f' : '#2f8fbf'
    if (random() < 0.6) {
      const dx = x + w * (0.2 + random() * 0.5)
      el('path', { d: `M${dx} ${y} V${y - h * 0.48} a${2.6 * sf} ${2.6 * sf} 0 0 1 ${5.2 * sf} 0 V${y} Z`, fill: blue }, g)
    }
    const windows = 1 + Math.floor(random() * 2)
    for (let i = 0; i < windows; i += 1) {
      const wx = x + (w / (windows + 1)) * (i + 1) - 2 * sf
      el('rect', { x: wx, y: y - h * 0.82, width: 4 * sf, height: 4.6 * sf, fill: '#26527a' }, g)
      el('rect', { x: wx - 0.6 * sf, y: y - h * 0.82 - 0.8 * sf, width: 5.2 * sf, height: 0.8 * sf, fill: '#a9b9c6' }, g)
    }
    if (random() < 0.28) {
      // bougainvillea spilling over a corner
      const bx = x + (random() < 0.5 ? 0 : w)
      for (let i = 0; i < 7; i += 1) {
        el('circle', { cx: bx + (random() - 0.5) * 10 * sf, cy: y - h * (0.4 + random() * 0.6), r: (1.6 + random() * 2.4) * sf, fill: i < 2 ? '#4f6b3a' : random() < 0.5 ? '#d6337f' : '#ef6aa8' }, g)
      }
    }
  }

  function drawTree(parent, x, y, sf, random) {
    if (random() < 0.55) {
      const h = (22 + random() * 18) * sf
      el('path', { d: `M${x} ${y} C${x - 4 * sf} ${y - h * 0.5} ${x - 1 * sf} ${y - h * 0.9} ${x + 1.5 * sf} ${y - h} C${x + 4 * sf} ${y - h * 0.9} ${x + 7 * sf} ${y - h * 0.5} ${x + 3 * sf} ${y} Z`, fill: '#3c5a36' }, parent)
    } else {
      el('ellipse', { cx: x, cy: y - 8 * sf, rx: 10 * sf, ry: 7 * sf, fill: '#8d9a6a' }, parent)
      el('ellipse', { cx: x + 3 * sf, cy: y - 10 * sf, rx: 6 * sf, ry: 4 * sf, fill: '#a9b384' }, parent)
    }
  }

  function drawMill(parent, x, ground, sf, i) {
    const g = el('g', null, parent)
    const h = 34 * sf
    const w0 = 19 * sf
    const w1 = 15 * sf
    el('path', { d: `M${x - w0 / 2} ${ground} L${x - w1 / 2} ${ground - h} L${x + w1 / 2} ${ground - h} L${x + w0 / 2} ${ground} Z`, fill: '#efe6d3' }, g)
    el('path', { d: `M${x - w0 / 2} ${ground} L${x - w1 / 2} ${ground - h} L${x - w1 * 0.1} ${ground - h} L${x - w0 * 0.1} ${ground} Z`, fill: '#cdbd9f' }, g)
    el('path', { d: `M${x - 2.4 * sf} ${ground} V${ground - 8 * sf} a${2.4 * sf} ${2.4 * sf} 0 0 1 ${4.8 * sf} 0 V${ground} Z`, fill: '#5d4630' }, g)
    el('path', { d: `M${x - w1 / 2 - 1.5 * sf} ${ground - h} L${x} ${ground - h - 11 * sf} L${x + w1 / 2 + 1.5 * sf} ${ground - h} Z`, fill: '#7a5a3c' }, g)
    const hubX = x + w1 * 0.1
    const hubY = ground - h + 2 * sf
    const sails = el('g', null, g)
    let spars = ''
    let cloth = ''
    const R = 26 * sf
    for (let s = 0; s < 8; s += 1) {
      const a = (s / 8) * Math.PI * 2
      const ex = Math.cos(a) * R
      const ey = Math.sin(a) * R
      spars += `M0 0 L${ex.toFixed(2)} ${ey.toFixed(2)} `
      if (s % 2 === 0) {
        const b = a + 0.32
        cloth += `M${(ex * 0.3).toFixed(2)} ${(ey * 0.3).toFixed(2)} L${ex.toFixed(2)} ${ey.toFixed(2)} L${(Math.cos(b) * R * 0.92).toFixed(2)} ${(Math.sin(b) * R * 0.92).toFixed(2)} Z `
      }
    }
    el('path', { d: cloth, fill: '#fffaf0', opacity: 0.92 }, sails)
    el('path', { d: spars, stroke: '#5b4632', 'stroke-width': 1.1 * sf, fill: 'none' }, sails)
    el('circle', { cx: 0, cy: 0, r: 1.8 * sf, fill: '#4a3826' }, sails)
    return { node: sails, x: hubX, y: hubY, speed: 0.35 + i * 0.12, angle: i * 0.7 }
  }

  function drawGulet(parent, s) {
    // a two-masted Bodrum gulet heading left: varnished hull, white sheer strake, gaff sails
    const g = el('g', null, parent)
    el('path', { d: 'M0 -16 L-26 -21', stroke: '#4a2c18', 'stroke-width': 1.6 }, g)
    el('path', { d: 'M-24 -21 L38 -96 M38 -96 L126 -64 M38 -96 V-12 M104 -66 V-14', stroke: '#6a5640', 'stroke-width': 0.8, fill: 'none' }, g)
    el('path', { d: 'M-22 -21 L36 -92 L34 -20 Z', fill: url('sail') }, g)
    el('path', { d: 'M41 -14 L41 -90 L80 -78 L95 -16 Z', fill: url('sail') }, g)
    el('path', { d: 'M106 -14 L106 -62 L126 -55 L130 -16 Z', fill: url('sail') }, g)
    el('path', { d: 'M41 -90 L80 -78 M106 -62 L126 -55', stroke: '#c9bfac', 'stroke-width': 0.8 }, g)
    el('path', { d: 'M0 -16 Q60 -7 128 -13 L134 -19 L131 2 Q70 8 12 1 Q3 -4 0 -16 Z', fill: '#5d3720' }, g)
    el('path', { d: 'M0 -16 Q60 -7 128 -13 L134 -19 L133 -14 Q70 -3 2 -11 Z', fill: '#f6f1e6' }, g)
    el('rect', { x: 58, y: -16, width: 38, height: 6, rx: 1.5, fill: '#efe5d2' }, g)
    el('path', { d: 'M38 -12 V-98 M104 -14 V-66', stroke: '#4a3220', 'stroke-width': 1.6 }, g)
    el('path', { d: 'M38 -98 l6 1.6 l-6 1.6 Z', fill: '#c8282e' }, g)
    return { node: g, scale: s }
  }

  /* --------------------------------------------------------- the sea */

  function paintBase() {
    base.width = canvas.width
    base.height = canvas.height
    const { Yh, Ys, sun } = L
    const c = bctx
    c.setTransform(k, 0, 0, k, 0, 0)
    c.clearRect(0, 0, W, H)
    const sea = c.createLinearGradient(0, Yh, 0, Ys)
    sea.addColorStop(0, '#4c95bf')
    sea.addColorStop(0.08, '#1f7db4')
    sea.addColorStop(0.45, '#0e6ba8')
    sea.addColorStop(0.78, '#1b93bd')
    sea.addColorStop(0.93, '#45c1d2')
    sea.addColorStop(1, '#8bd8e6')
    c.fillStyle = sea
    c.fillRect(0, Yh, W, Ys - Yh + 2)
    // warm sheen under the sun
    const sheen = c.createRadialGradient(sun.x, Yh, 0, sun.x, Yh, W * 0.5)
    sheen.addColorStop(0, 'rgba(255,240,205,0.55)')
    sheen.addColorStop(1, 'rgba(255,240,205,0)')
    c.fillStyle = sheen
    c.fillRect(0, Yh, W, (Ys - Yh) * 0.6)

    // sand: wet near the water, pale and warm higher up, a deep golden foreground
    const sand = c.createLinearGradient(0, Ys, 0, H)
    sand.addColorStop(0, '#d9bf8d')
    sand.addColorStop(0.12, '#ecd6aa')
    sand.addColorStop(0.45, '#f6e7c8')
    sand.addColorStop(1, '#e1b16a')
    c.fillStyle = sand
    c.fillRect(0, Ys, W, H - Ys)
    const random = seeded(5)
    // ripple marks left by the wind
    c.lineWidth = 1.2
    for (let i = 0; i < 60; i += 1) {
      const y = Ys + 40 + random() * (H - Ys - 40)
      const x = random() * W
      const len = 30 + random() * 90
      c.strokeStyle = `rgba(160,120,60,${0.08 + random() * 0.08})`
      c.beginPath()
      c.moveTo(x, y)
      c.quadraticCurveTo(x + len / 2, y - 3 - random() * 3, x + len, y)
      c.stroke()
    }
    // grain
    const grains = Math.round((W * (H - Ys)) / 22)
    for (let i = 0; i < grains; i += 1) {
      const y = Ys + random() * (H - Ys)
      c.fillStyle = random() < 0.5 ? `rgba(120,86,40,${0.1 + random() * 0.2})` : `rgba(255,250,235,${0.2 + random() * 0.4})`
      c.fillRect(random() * W, y, 0.8 + random() * 1.4, 0.8 + random())
    }
    // a few shells and pebbles
    for (let i = 0; i < 9; i += 1) {
      const x = random() * W
      const y = Ys + 60 + random() * (H - Ys - 70)
      const r = 2 + random() * 4
      c.fillStyle = random() < 0.5 ? '#fbf1e0' : '#b9a58a'
      c.beginPath()
      c.ellipse(x, y, r * 1.4, r, random() * 3, 0, Math.PI * 2)
      c.fill()
      c.fillStyle = 'rgba(110,80,40,0.25)'
      c.beginPath()
      c.ellipse(x + 1, y + r * 0.8, r * 1.3, r * 0.4, 0, 0, Math.PI * 2)
      c.fill()
    }
    filmGradient = ctx.createLinearGradient(0, Ys - 10, 0, Ys + 140)
    filmGradient.addColorStop(0, 'rgba(70,193,210,0.9)')
    filmGradient.addColorStop(0.5, 'rgba(150,225,232,0.55)')
    filmGradient.addColorStop(1, 'rgba(200,240,240,0.25)')
  }

  function swashRun(t) {
    const T = 6.5
    const p = (((t + state.swashOffset) % T) + T) % T / T
    if (p < 0.3) {
      const u = p / 0.3
      return { run: 1 - (1 - u) * (1 - u), p, rushing: true }
    }
    const u = (p - 0.3) / 0.7
    return { run: 1 - u * u * (3 - 2 * u), p, rushing: false }
  }

  function swashFront(x, t, run, reach) {
    return L.Ys - 6 + run * reach * (1 + 0.2 * Math.sin(x * 0.012 + t * 0.3) + 0.1 * Math.sin(x * 0.041 + 1.3))
  }

  function drawSea(t) {
    const { Yh, Ys, sun } = L
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(base, 0, 0)
    ctx.setTransform(k, 0, 0, k, 0, 0)

    // brush-stroke wavelets, finer near the horizon
    let row = 0
    const span = Ys - Yh
    for (let y = Yh + 1; y < Ys - 4; row += 1) {
      const depth = (y - Yh) / span
      const dy = 1.4 + depth * 6
      const thick = Math.max(0.5, dy * 0.3)
      for (let s = 0; s < 5; s += 1) {
        const h = hash(row, s)
        const len = (5 + h * 24) * (0.35 + depth * 1.6)
        const dir = s % 2 ? 1 : -1
        let x = (h * W * 1.9 + t * (3 + h * 6) * dir * (0.4 + depth)) % (W + len)
        if (x < -len) x += W + len
        ctx.globalAlpha = (0.12 + h * 0.3) * (0.5 + depth * 0.6)
        ctx.fillStyle = s < 3 ? '#e9fbff' : '#08578f'
        ctx.fillRect(x, y + Math.sin(t * 1.2 + row) * 0.4, len, thick)
      }
      // sun glitter
      const spread = 10 + depth * 120
      for (let s = 0; s < 3; s += 1) {
        const h = hash(row * 7 + Math.floor(t * 3 + s * 0.37), s + 2)
        if (h < 0.45) continue
        ctx.globalAlpha = (0.95 - depth * 0.6) * h
        ctx.fillStyle = '#fffbea'
        ctx.fillRect(sun.x + (h - 0.7) * spread * 2.4, y, 2 + h * 8 * (0.4 + depth), thick * 1.2)
      }
      y += dy
    }

    // gulet reflection
    if (gulet) {
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#fffaf0'
      const gx = gulet.x
      const gs = gulet.scale
      for (let r = 0; r < 6; r += 1) {
        const wob = Math.sin(t * 2 + r) * 1.5
        ctx.fillRect(gx + (-10 + r * 3) * gs + wob, Yh + 13 + r * 2.2, 110 * gs - r * 6, 1)
      }
    }

    // the swash: a breaking line, the thin sheet of water running up the sand, and its lace edge
    const reach = (L.portrait ? 62 : 58) * (1 + state.surge * 1.3)
    const { run, p, rushing } = swashRun(t)
    if (p > 0.84 || p < 0.06) {
      const b = p > 0.84 ? (p - 0.84) / 0.16 : 1 - p / 0.06
      ctx.globalAlpha = 0.8 * b
      ctx.fillStyle = '#f4fdff'
      for (let x = 0; x < W; x += 14) {
        if (hash(x, Math.floor(t * 8)) < 0.2) continue
        ctx.fillRect(x, Ys - 22 - b * 6 + Math.sin(x * 0.03) * 2, 14, 2.2)
      }
    }
    // wet sand left by the last wave
    if (!rushing) {
      const dry = (p - 0.3) / 0.7
      ctx.globalAlpha = 0.32 * (1 - dry)
      ctx.fillStyle = '#b8935a'
      ctx.beginPath()
      ctx.moveTo(0, Ys - 6)
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, swashFront(x, t, run, reach))
      for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, swashFront(x, t, 1, reach))
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 0.45 * (1 - dry)
      ctx.strokeStyle = '#fffaf0'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, swashFront(x, t, 1, reach) - 1)
      ctx.stroke()
    }
    if (run > 0.02) {
      ctx.globalAlpha = 0.9
      ctx.fillStyle = filmGradient
      ctx.beginPath()
      ctx.moveTo(0, Ys - 12)
      for (let x = 0; x <= W; x += 16) ctx.lineTo(x, swashFront(x, t, run, reach))
      ctx.lineTo(W, Ys - 12)
      ctx.closePath()
      ctx.fill()
      // lace foam
      ctx.strokeStyle = '#ffffff'
      ctx.lineCap = 'round'
      ctx.lineWidth = 3.2
      ctx.globalAlpha = 0.85 * Math.min(1, run * 3)
      ctx.beginPath()
      for (let x = 0; x <= W; x += 10) ctx.lineTo(x, swashFront(x, t, run, reach) + Math.sin(x * 0.2 + t * 2) * 0.8)
      ctx.stroke()
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.5 * Math.min(1, run * 3)
      ctx.setLineDash([6, 5, 2, 7])
      ctx.beginPath()
      for (let x = 0; x <= W; x += 12) ctx.lineTo(x, swashFront(x, t, run, reach) - 7 - Math.sin(x * 0.07 + t) * 3)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#ffffff'
      for (let x = 0; x < W; x += 9) {
        const h = hash(x, 5)
        if (h < 0.5) continue
        ctx.globalAlpha = 0.6 * h
        ctx.fillRect(x, swashFront(x, t, run, reach) - 3 - h * 12, 1.6, 1.6)
      }
    }
    ctx.globalAlpha = 1
  }

  /* ------------------------------------------------------------ loop */

  function layout() {
    const hw = host.clientWidth || window.innerWidth
    const hh = host.clientHeight || window.innerHeight
    const lw = hw * 1.06
    const lh = hh * 1.06
    W = (H * lw) / lh
    const portrait = W < 800
    const sf = portrait ? 0.78 : 1
    const Yh = portrait ? 600 : 505
    L = {
      portrait,
      sf,
      Yh,
      Ys: portrait ? 742 : 715,
      sun: portrait ? { x: W * 0.8, y: Yh - 92, r: 22 } : { x: W * 0.8, y: Yh - 110, r: 28 },
      peakX: portrait ? W * 0.16 : W * 0.12,
      peakY: Yh - (portrait ? 74 : 200),
      endX: portrait ? W * 0.72 : W * 0.44,
      guletX: portrait ? W * 0.66 : W * 0.6,
    }
    canvas.width = Math.round(lw * dpr)
    canvas.height = Math.round(lh * dpr)
    k = canvas.height / H
    buildBack()
    buildFront()
    paintBase()
    render()
  }

  function render() {
    if (!L) return
    back.style.transform = `translate3d(${(-parallax.x * 6).toFixed(2)}px, ${(-parallax.y * 3).toFixed(2)}px, 0)`
    const near = `translate3d(${(-parallax.x * 12).toFixed(2)}px, ${(-parallax.y * 6).toFixed(2)}px, 0)`
    front.style.transform = near
    canvas.style.transform = near
    const t = clock
    if (gulet) {
      gulet.x = L.guletX + Math.sin(t * 0.03) * W * 0.04
      const bob = Math.sin(t * 0.9) * 0.8
      gulet.node.setAttribute('transform', `translate(${gulet.x.toFixed(2)} ${(L.Yh + 13 + bob).toFixed(2)}) rotate(${(Math.sin(t * 0.7) * 1.2).toFixed(2)}) scale(${gulet.scale})`)
    }
    for (let i = 0; i < mills.length; i += 1) {
      const m = mills[i]
      m.node.setAttribute('transform', `translate(${m.x.toFixed(2)} ${m.y.toFixed(2)}) rotate(${((m.angle + t * m.speed) * 57.3).toFixed(1)})`)
    }
    for (let i = 0; i < gulls.length; i += 1) {
      const g = gulls[i]
      const x = ((g.x + t * g.speed) % (W + 60)) - 30
      const y = g.y + Math.sin(t * 0.5 + g.phase) * 10
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(t * 3 + g.phase))
      g.node.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${g.s.toFixed(2)} ${(g.s * flap).toFixed(2)})`)
    }
    drawSea(t)
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
    parallax.x += (parallax.tx - parallax.x) * 0.05
    parallax.y += (parallax.ty - parallax.y) * 0.05
    render()
  }

  layout()
  if (!reduce) raf = requestAnimationFrame(loop)
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
    get time() {
      return clock
    },
    // where the running water reaches right now at x (scene units)
    waterlineAt(x) {
      const reach = (L.portrait ? 62 : 58) * (1 + state.surge * 1.3)
      return swashFront(x, clock, swashRun(clock).run, reach)
    },
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
