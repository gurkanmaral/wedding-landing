// Departures: an illustrated sky (layered paper-cut clouds drifting at
// different depths, sun glow, grain), a folded paper plane drawn as shaded
// facets, and the boarding pass it unfolds into. DOM + SVG + canvas, shared
// by the page hero and the intro scene.
import { gsap } from 'gsap'
import './sky.css'

const NS = 'http://www.w3.org/2000/svg'
export const INK = { board: '#121417', yellow: '#f4d35e', white: '#ffffff', sky: '#3a86ff', coral: '#ee6c4d' }
let uid = 0

function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function node(tag, className, parent) {
  const element = document.createElement(tag)
  if (className) element.className = className
  parent?.appendChild(element)
  return element
}

function svg(tag, attrs = {}, parent) {
  const element = document.createElementNS(NS, tag)
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value))
  parent?.appendChild(element)
  return element
}

/* ------------------------------------------------------------ clouds */

const LAYERS = [
  { top: 0.05, height: 0.2, wisp: true, count: 5, speed: 170, depth: 0.15 },
  { top: 0.42, height: 0.2, count: 6, scale: 0.75, mid: '#eef4fc', shadow: '#c9daef', speed: 130, depth: 0.3 },
  { top: 0.53, height: 0.25, count: 5, scale: 1, mid: '#f2f6fc', shadow: '#bccfe8', speed: 85, depth: 0.55 },
  { top: 0.69, height: 0.36, count: 4, scale: 1.25, mid: '#fcf1ea', shadow: '#efbca6', speed: 52, depth: 1, front: true },
]

function cloudTile(width, height, layer, random) {
  const tile = svg('svg', { class: 'dps-tile', viewBox: `0 0 ${width} ${height}`, width, height, 'aria-hidden': 'true' })
  const id = `dps${(uid += 1)}`
  const defs = svg('defs', {}, tile)
  const grad = svg('linearGradient', { id: `${id}-g`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs)
  svg('stop', { offset: '0.35', 'stop-color': '#ffffff' }, grad)
  svg('stop', { offset: '1', 'stop-color': layer.mid ?? '#f4f7fc' }, grad)

  const shadowGroup = svg('g', { fill: layer.shadow ?? '#cddcf0' }, tile)
  const mainGroup = svg('g', { fill: `url(#${id}-g)` }, tile)
  const lightGroup = svg('g', { fill: '#ffffff', opacity: 0.55 }, tile)

  const step = width / layer.count
  for (let i = 0; i < layer.count; i += 1) {
    if (layer.wisp) {
      const x = step * i + random() * step * 0.6
      const y = height * (0.3 + random() * 0.5)
      const rx = height * (0.9 + random() * 1.6)
      const ry = height * (0.035 + random() * 0.05)
      ;[0, -width, width].forEach((offset) => {
        if (x + offset + rx < 0 || x + offset - rx > width) return
        svg('ellipse', { cx: x + offset, cy: y, rx, ry }, mainGroup)
        svg('ellipse', { cx: x + offset + rx * 0.25, cy: y + ry * 2.4, rx: rx * 0.6, ry: ry * 0.7 }, mainGroup)
      })
      continue
    }
    const cw = height * (1.1 + random() * 1.3) * layer.scale
    const ch = cw * (0.36 + random() * 0.12)
    const x = step * i + random() * step * 0.5
    const by = height * (0.62 + random() * 0.34)
    const bumps = 3 + Math.floor(random() * 4)
    const circles = []
    for (let k = 0; k < bumps; k += 1) {
      const t = (k + 0.5) / bumps
      const r = ch * (0.3 + random() * 0.36) * (1 - Math.abs(t - 0.45) * 0.8)
      circles.push([x + cw * (0.14 + t * 0.72), by - r - ch * 0.12 * Math.sin(t * Math.PI), r])
    }
    const baseH = ch * 0.34
    ;[0, -width, width].forEach((offset) => {
      if (x + offset + cw < 0 || x + offset > width) return
      const ox = x + offset
      const lift = ch * 0.07
      svg('rect', { x: ox, y: by - baseH, width: cw, height: baseH, rx: baseH / 2 }, shadowGroup)
      svg('rect', { x: ox + ch * 0.02, y: by - baseH - lift, width: cw - ch * 0.04, height: baseH, rx: baseH / 2 }, mainGroup)
      circles.forEach(([cx, cy, r], k) => {
        const cxo = cx + offset
        svg('circle', { cx: cxo, cy, r }, shadowGroup)
        svg('circle', { cx: cxo, cy: cy - lift, r: r * 0.97 }, mainGroup)
        if (k % 2 === 0) svg('circle', { cx: cxo - r * 0.22, cy: cy - lift - r * 0.26, r: r * 0.5 }, lightGroup)
      })
    })
  }
  return tile
}

export function createSky(container, { seed = 11 } = {}) {
  const root = node('div', 'dps-sky', container)
  node('div', 'dps-sun', root)
  const layerEls = LAYERS.map((layer, i) => {
    const wrap = node('div', `dps-layer${layer.front ? ' dps-layer--front' : ''}`, root)
    wrap.style.top = `${layer.top * 100}%`
    wrap.style.height = `${layer.height * 100}%`
    wrap.style.zIndex = String(i + 1)
    const strip = node('div', 'dps-strip', wrap)
    return { layer, wrap, strip, tween: null, quickX: gsap.quickTo(wrap, 'x', { duration: 1.1, ease: 'power3' }), quickY: gsap.quickTo(wrap, 'y', { duration: 1.1, ease: 'power3' }) }
  })
  node('div', 'dps-grain', root)

  let speed = 1
  let paused = false
  const build = () => {
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight
    layerEls.forEach((entry, i) => {
      entry.tween?.kill()
      const layerH = Math.max(40, Math.round(height * entry.layer.height))
      const tileW = Math.max(width, layerH * 4)
      const tile = cloudTile(tileW, layerH, entry.layer, seeded(seed + i * 31))
      entry.strip.replaceChildren(tile, tile.cloneNode(true))
      entry.strip.style.width = `${tileW * 2}px`
      gsap.set(entry.strip, { x: 0 })
      entry.tween = gsap.to(entry.strip, { x: -tileW, duration: entry.layer.speed * (tileW / 1600), ease: 'none', repeat: -1 })
      entry.tween.timeScale(speed)
      if (paused) entry.tween.pause()
    })
  }
  build()

  return {
    root,
    layers: layerEls.map((entry) => entry.wrap),
    rebuild: build,
    setParallax(px, py) {
      layerEls.forEach(({ layer, quickX, quickY }) => {
        quickX(-px * 26 * layer.depth)
        quickY(-py * 12 * layer.depth)
      })
    },
    setSpeed(value) {
      speed = value
      layerEls.forEach(({ tween }) => tween?.timeScale(value))
    },
    get speed() {
      return speed
    },
    pause(value) {
      paused = value
      layerEls.forEach(({ tween }) => (value ? tween?.pause() : tween?.play()))
    },
    dispose() {
      layerEls.forEach(({ tween, wrap }) => {
        tween?.kill()
        gsap.killTweensOf(wrap)
      })
      root.remove()
    },
  }
}

/* ------------------------------------------------------- paper plane */

// Folded dart, nose along +x, drawn as shaded facets. Every facet has four
// points so it can morph into a flat sheet.
const FACETS = [
  { fill: '#c6d5ea', points: [[100, 0], [-100, 9], [-62, -5], [-62, -5]] }, // far wing, underside
  { fill: '#a9bcd8', points: [[100, 0], [-62, -5], [-80, 27], [-80, 27]] }, // keel
  { fill: '#ffffff', points: [[100, 0], [-92, -49], [-62, -5], [-62, -5]] }, // near wing
  { fill: '#eef3fa', points: [[100, 0], [-34, -27], [-62, -5], [-62, -5]] }, // folded flap
]
const CREASES = [
  [[100, 0], [-62, -5]],
  [[100, 0], [-34, -27]],
]

export function createPlane(parent) {
  const group = svg('g', { class: 'dpp-plane' }, parent)
  const polys = FACETS.map((facet) => svg('polygon', { fill: facet.fill, points: facet.points.join(' ') }, group))
  const creases = svg('g', { stroke: '#8ea4c6', 'stroke-width': 0.9, 'stroke-linecap': 'round', opacity: 0.7 }, group)
  CREASES.forEach(([a, b]) => svg('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, creases))
  // a coral pinstripe on the trailing edge of the near wing
  const stripe = svg('line', { x1: -88, y1: -42, x2: -64, y2: -8, stroke: INK.coral, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, group)

  const pose = { x: 0, y: 0, rotation: 0, scale: 1, facing: 1 }
  const apply = () => {
    group.setAttribute(
      'transform',
      `translate(${pose.x.toFixed(1)} ${pose.y.toFixed(1)}) rotate(${pose.rotation.toFixed(2)}) scale(${(pose.scale * pose.facing).toFixed(4)} ${pose.scale.toFixed(4)})`,
    )
  }

  // t: 0 folded plane → 1 flat rectangle (half-sizes hw, hh in plane units)
  const morph = (t, hw, hh) => {
    const corners = [
      [hw, -hh],
      [-hw, -hh],
      [-hw, hh],
      [hw, hh],
    ]
    FACETS.forEach((facet, i) => {
      const pts = facet.points.map(([x, y], k) => `${(x + (corners[k][0] - x) * t).toFixed(2)},${(y + (corners[k][1] - y) * t).toFixed(2)}`)
      polys[i].setAttribute('points', pts.join(' '))
      polys[i].style.fill = t > 0 ? `color-mix(in srgb, ${facet.fill} ${Math.round((1 - t) * 100)}%, #ffffff)` : ''
    })
    creases.setAttribute('opacity', (0.7 * (1 - t)).toFixed(3))
    stripe.setAttribute('opacity', (1 - Math.min(1, t * 1.6)).toFixed(3))
  }

  return { group, pose, apply, morph }
}

/* ----------------------------------------------------- boarding pass */

const PASS_COPY = {
  en: { title: 'BOARDING PASS', passengers: 'PASSENGERS', from: 'FROM', to: 'TO', fromValue: 'WHEREVER YOU ARE', date: 'DATE', gate: 'GATE', seat: 'SEAT', cls: 'CLASS', clsValue: 'FOREVER', flight: 'FLIGHT' },
  tr: { title: 'BİNİŞ KARTI', passengers: 'YOLCULAR', from: 'NEREDEN', to: 'NEREYE', fromValue: 'NEREDE OLURSANIZ', date: 'TARİH', gate: 'KAPI', seat: 'KOLTUK', cls: 'SINIF', clsValue: 'SONSUZ', flight: 'UÇUŞ' },
}

export function passInfo({ partner1, partner2, destination, dateText, date, lang = 'en' }) {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
  const up = (value) => String(value || '').toLocaleUpperCase(locale)
  const initials = `${up(partner1).charAt(0)}${up(partner2).charAt(0)}`
  const mmdd = date && Number.isFinite(date.getTime()) ? `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}` : '0724'
  return {
    ...(PASS_COPY[lang] ?? PASS_COPY.en),
    names: `${up(partner1)} & ${up(partner2)}`,
    to: up(destination),
    dateValue: up(dateText),
    gateValue: 'B12',
    seatValue: '2A · 2B',
    flightValue: `${initials} ${mmdd}`,
  }
}

function fitFont(ctx, value, family, max, width, weight = '400') {
  let size = max
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(value).width > width && size > 8) {
    size *= 0.94
    ctx.font = `${weight} ${size}px ${family}`
  }
  return size
}

const DISPLAY = '"Bebas Neue", "Archivo", sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'

function field(ctx, label, value, x, y, unit, { color = INK.board, size = 1, maxWidth = unit * 8 } = {}) {
  ctx.fillStyle = '#6d7480'
  ctx.font = `500 ${unit * 0.34}px ${MONO}`
  ctx.fillText(label, x, y)
  ctx.fillStyle = color
  fitFont(ctx, value, DISPLAY, unit * 0.82 * size, maxWidth)
  ctx.fillText(value, x, y + unit * 0.92 * size)
}

function barcode(ctx, x, y, w, h, seed, vertical = false) {
  const random = seeded(seed)
  ctx.fillStyle = INK.board
  let p = 0
  const length = vertical ? h : w
  while (p < length) {
    const bar = 1 + Math.floor(random() * 3.2)
    const gap = 1 + Math.floor(random() * 2.4)
    const unit = length / 140
    if (vertical) ctx.fillRect(x, y + p, w, bar * unit)
    else ctx.fillRect(x + p, y, bar * unit, h)
    p += (bar + gap) * unit
  }
}

function planeGlyph(ctx, x, y, size, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(23, 12)
  ctx.lineTo(1, 3)
  ctx.lineTo(6, 12)
  ctx.lineTo(1, 21)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Draws the pass in reading orientation. portrait: a tall mobile-style pass
// (folds are horizontal); landscape: a classic wide pass (folds vertical).
export function drawPass(canvas, info, { width, height, portrait, dpr = 1 }) {
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const W = width
  const H = height
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // paper
  ctx.fillStyle = '#fbfaf6'
  ctx.fillRect(0, 0, W, H)
  const random = seeded(5)
  for (let i = 0; i < (W * H) / 60; i += 1) {
    ctx.fillStyle = `rgba(80,70,50,${0.02 + random() * 0.04})`
    ctx.fillRect(random() * W, random() * H, 1, 1)
  }

  if (!portrait) {
    const u = H / 10 // unit
    const stubX = (W * 2) / 3
    // header band
    ctx.fillStyle = INK.sky
    ctx.fillRect(0, 0, W, u * 1.7)
    ctx.fillStyle = '#ffffff'
    fitFont(ctx, info.title, DISPLAY, u * 1.05, stubX * 0.5)
    ctx.fillText(info.title, u * 0.6, u * 1.18)
    ctx.font = `600 ${u * 0.42}px ${MONO}`
    ctx.textAlign = 'right'
    ctx.fillText(`${info.flight} ${info.flightValue}`, stubX - u * 0.6, u * 1.05)
    ctx.fillText(`${info.gate} ${info.gateValue}`, W - u * 0.6, u * 1.05)
    ctx.textAlign = 'left'

    // passengers
    ctx.fillStyle = '#6d7480'
    ctx.font = `500 ${u * 0.36}px ${MONO}`
    ctx.fillText(info.passengers, u * 0.6, u * 2.65)
    ctx.fillStyle = INK.board
    fitFont(ctx, info.names, DISPLAY, u * 1.9, stubX - u * 1.2)
    ctx.fillText(info.names, u * 0.6, u * 4.35)

    // route
    field(ctx, info.from, info.fromValue, u * 0.6, u * 5.25, u, { maxWidth: stubX * 0.4 })
    planeGlyph(ctx, stubX * 0.47, u * 5.55, u * 0.75, INK.coral)
    field(ctx, info.to, info.to, stubX * 0.56, u * 5.25, u, { size: 1.25, maxWidth: stubX * 0.42 })

    // details row
    const cols = [info.date, info.gate, info.seat, info.cls]
    const values = [info.dateValue, info.gateValue, info.seatValue, info.clsValue]
    const colW = (stubX - u * 1.2) / 4
    cols.forEach((label, i) =>
      field(ctx, label, values[i], u * 0.6 + colW * i, u * 7.7, u, { color: i === 1 ? INK.coral : INK.board, maxWidth: colW * 0.92 }),
    )

    // stub
    ctx.fillStyle = '#6d7480'
    ctx.font = `500 ${u * 0.32}px ${MONO}`
    ctx.fillText(info.passengers, stubX + u * 0.6, u * 2.65)
    ctx.fillStyle = INK.board
    fitFont(ctx, info.names, DISPLAY, u * 0.85, W - stubX - u * 1.2)
    ctx.fillText(info.names, stubX + u * 0.6, u * 3.55)
    field(ctx, info.to, info.to, stubX + u * 0.6, u * 4.35, u, { maxWidth: W - stubX - u * 1.2 })
    field(ctx, info.seat, info.seatValue, stubX + u * 0.6, u * 6, u, { size: 0.8, maxWidth: (W - stubX) * 0.4 })
    field(ctx, info.gate, info.gateValue, stubX + (W - stubX) * 0.55, u * 6, u, { size: 0.8, color: INK.coral, maxWidth: (W - stubX) * 0.4 })
    barcode(ctx, stubX + u * 0.6, u * 7.6, W - stubX - u * 1.2, u * 1.25, 9)

    // coral foot stripe
    ctx.fillStyle = INK.coral
    ctx.fillRect(0, H - u * 0.28, W, u * 0.28)

    // perforation + notches
    ctx.strokeStyle = 'rgba(18,20,23,0.35)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([u * 0.16, u * 0.16])
    ctx.beginPath()
    ctx.moveTo(stubX, u * 2)
    ctx.lineTo(stubX, H - u * 0.7)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(stubX, 0, u * 0.42, 0, Math.PI * 2)
    ctx.arc(stubX, H, u * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    // the fold that the plane left behind
    ctx.strokeStyle = 'rgba(18,20,23,0.07)'
    ctx.beginPath()
    ctx.moveTo(W / 3, 0)
    ctx.lineTo(W / 3, H)
    ctx.stroke()
  } else {
    const u = W / 10
    const stubY = (H * 2) / 3
    ctx.fillStyle = INK.sky
    ctx.fillRect(0, 0, W, u * 1.8)
    ctx.fillStyle = '#ffffff'
    fitFont(ctx, info.title, DISPLAY, u * 1.05, W * 0.55)
    ctx.fillText(info.title, u * 0.6, u * 1.25)
    ctx.font = `600 ${u * 0.4}px ${MONO}`
    ctx.textAlign = 'right'
    ctx.fillText(`${info.flight} ${info.flightValue}`, W - u * 0.6, u * 1.12)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#6d7480'
    ctx.font = `500 ${u * 0.36}px ${MONO}`
    ctx.fillText(info.passengers, u * 0.6, u * 2.9)
    ctx.fillStyle = INK.board
    fitFont(ctx, info.names, DISPLAY, u * 1.5, W - u * 1.2)
    ctx.fillText(info.names, u * 0.6, u * 4.3)

    field(ctx, info.from, info.fromValue, u * 0.6, u * 5.5, u, { maxWidth: W - u * 1.2 })
    planeGlyph(ctx, u * 0.6, u * 7.15, u * 0.7, INK.coral)
    field(ctx, info.to, info.to, u * 1.7, u * 6.95, u, { size: 1.4, maxWidth: W - u * 2.3 })

    const half = (W - u * 1.2) / 2
    field(ctx, info.date, info.dateValue, u * 0.6, u * 9.4, u, { maxWidth: half * 0.94 })
    field(ctx, info.gate, info.gateValue, u * 0.6 + half, u * 9.4, u, { color: INK.coral, maxWidth: half * 0.94 })
    field(ctx, info.seat, info.seatValue, u * 0.6, u * 11.3, u, { maxWidth: half * 0.94 })
    field(ctx, info.cls, info.clsValue, u * 0.6 + half, u * 11.3, u, { maxWidth: half * 0.94 })

    // stub
    ctx.fillStyle = '#6d7480'
    ctx.font = `500 ${u * 0.34}px ${MONO}`
    ctx.fillText(info.passengers, u * 0.6, stubY + u * 1.1)
    ctx.fillStyle = INK.board
    fitFont(ctx, info.names, DISPLAY, u * 0.9, W - u * 1.2)
    ctx.fillText(info.names, u * 0.6, stubY + u * 2)
    ctx.font = `600 ${u * 0.4}px ${MONO}`
    ctx.fillText(`${info.to} · ${info.gate} ${info.gateValue}`, u * 0.6, stubY + u * 2.8)
    barcode(ctx, u * 0.6, stubY + u * 3.4, W - u * 1.2, H - stubY - u * 4.2, 9)

    ctx.fillStyle = INK.coral
    ctx.fillRect(0, H - u * 0.3, W, u * 0.3)

    ctx.strokeStyle = 'rgba(18,20,23,0.35)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([u * 0.16, u * 0.16])
    ctx.beginPath()
    ctx.moveTo(u * 0.7, stubY)
    ctx.lineTo(W - u * 0.7, stubY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(0, stubY, u * 0.42, 0, Math.PI * 2)
    ctx.arc(W, stubY, u * 0.42, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = 'rgba(18,20,23,0.07)'
    ctx.beginPath()
    ctx.moveTo(0, H / 3)
    ctx.lineTo(W, H / 3)
    ctx.stroke()
  }
  return canvas
}

// Pass size for a viewport (reading orientation).
export function passSize(w, h) {
  const portrait = w / h < 1
  if (portrait) {
    const width = Math.min(w * 0.84, (h * 0.66) / 1.9)
    return { portrait, width, height: width * 1.9 }
  }
  const width = Math.min(w * 0.8, h * 0.62 * 1.9)
  return { portrait, width, height: width / 1.9 }
}

// Three-panel folded pass, built for CSS 3D flips. Panel 0 is the base;
// panel 1 hinges on its far edge, panel 2 on panel 1's far edge.
export function createPass(parent) {
  const wrap = node('div', 'dpp-pass-wrap', parent)
  const base = node('div', 'dpp-pass', wrap)
  const panels = []
  let host = base
  for (let i = 0; i < 3; i += 1) {
    const panel = i === 0 ? host : node('div', 'dpp-panel', host)
    if (i === 0) panel.classList.add('dpp-panel')
    const front = node('div', 'dpp-face dpp-face--front', panel)
    node('div', 'dpp-shade', front)
    const back = node('div', 'dpp-face dpp-face--back', panel)
    node('div', 'dpp-shade', back)
    panels.push({ panel, front, back })
    host = panel
  }
  const canvas = document.createElement('canvas')
  const state = { fold1: 1, fold2: 1, offset: 1 }
  let size = null

  const layout = (w, h, info) => {
    size = passSize(w, h)
    const { portrait, width, height } = size
    const pw = portrait ? width : width / 3
    const ph = portrait ? height / 3 : height
    drawPass(canvas, info, { width, height, portrait, dpr: Math.min(window.devicePixelRatio || 1, 2) })
    const url = `url(${canvas.toDataURL('image/png')})`
    wrap.classList.toggle('is-portrait', portrait)
    Object.assign(wrap.style, { left: `${(w - width) / 2}px`, top: `${(h - height) / 2}px`, width: `${width}px`, height: `${height}px` })
    panels.forEach(({ panel, front }, i) => {
      Object.assign(panel.style, { width: `${pw}px`, height: `${ph}px` })
      if (i > 0) {
        panel.style.left = portrait ? '0px' : `${pw}px`
        panel.style.top = portrait ? `${ph}px` : '0px'
      }
      front.style.backgroundImage = url
      front.style.backgroundSize = `${width}px ${height}px`
      front.style.backgroundPosition = portrait ? `0 ${-i * ph}px` : `${-i * pw}px 0`
    })
    size.pw = pw
    size.ph = ph
    apply()
    return size
  }

  const apply = () => {
    if (!size) return
    const axis = size.portrait ? 'X' : 'Y'
    // landscape: panel 1 swings toward the viewer (negative Y); portrait: positive X
    const a1 = (size.portrait ? 180 : -180) * state.fold1
    const a2 = (size.portrait ? -180 : 180) * state.fold2
    panels[1].panel.style.transform = `rotate${axis}(${a1.toFixed(2)}deg) translateZ(-0.5px)`
    panels[2].panel.style.transform = `rotate${axis}(${a2.toFixed(2)}deg) translateZ(0.5px)`
    const shift = state.offset * (size.portrait ? size.ph : size.pw)
    base.style.transform = size.portrait ? `translateY(${shift.toFixed(1)}px)` : `translateX(${shift.toFixed(1)}px)`
    const s1 = Math.abs(Math.sin(state.fold1 * Math.PI)) * 0.4
    const s2 = Math.abs(Math.sin(state.fold2 * Math.PI)) * 0.4
    panels[1].front.firstChild.style.opacity = s1
    panels[1].back.firstChild.style.opacity = s1
    panels[2].front.firstChild.style.opacity = s2
    panels[2].back.firstChild.style.opacity = s2
  }

  return { wrap, state, layout, apply, get size() { return size } }
}
