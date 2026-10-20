// The message in a bottle, drawn in SVG: thick tinted glass with Fresnel-dark
// edges and long speculars, a cork with real grain, a rolled parchment tied
// with twine inside, its shadow and caustic on the sand. Plus the parchment
// itself — painted paper texture between two rolls — for the unrolling moment.
import { el, stops, seeded } from './bodrumArt.js'

// Bottle in local units: axis along +x, base at x=0, lip at x=300, radius 46.
const BODY = 'M6 -40 Q1 -46 12 -46 L178 -46 C206 -46 220 -19 240 -15.5 L287 -15.5 L289 -18.5 L300 -18.5 L300 18.5 L289 18.5 L287 15.5 L240 15.5 C220 19 206 46 178 46 L12 46 Q1 46 6 40 Z'

export function corkPattern(defs, uid) {
  const pattern = el('pattern', { id: `${uid}-cork`, width: 24, height: 24, patternUnits: 'userSpaceOnUse' }, defs)
  el('rect', { width: 24, height: 24, fill: '#bf9058' }, pattern)
  const random = seeded(3)
  for (let i = 0; i < 26; i += 1) {
    el('ellipse', { cx: random() * 24, cy: random() * 24, rx: 0.5 + random() * 1.6, ry: 0.4 + random() * 0.9, fill: random() < 0.6 ? '#7d5630' : '#dcb47e', opacity: 0.4 + random() * 0.5 }, pattern)
  }
}

export function buildBottle(parent, uid) {
  const id = (name) => `${uid}-${name}`
  const url = (name) => `url(#${id(name)})`
  const defs = el('defs', null, parent)
  corkPattern(defs, uid)
  stops(el('linearGradient', { id: id('glassBack'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#0f4a3f', 0.55],
    [0.25, '#4fa792', 0.2],
    [0.55, '#bdeee0', 0.12],
    [0.85, '#3d8d78', 0.28],
    [1, '#0d3f36', 0.6],
  ])
  stops(el('linearGradient', { id: id('glassFront'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#0b3a32', 0.7],
    [0.08, '#2d7e6b', 0.35],
    [0.3, '#a6e6d5', 0.08],
    [0.62, '#ffffff', 0.02],
    [0.86, '#3e9a83', 0.2],
    [1, '#0a352d', 0.75],
  ])
  stops(el('linearGradient', { id: id('roll'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#8a6634'],
    [0.3, '#f1ddb2'],
    [0.5, '#fbeccc'],
    [0.85, '#b88f55'],
    [1, '#6f5028'],
  ])
  stops(el('linearGradient', { id: id('corkShade'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#3d2510', 0.55],
    [0.35, '#fff1d6', 0.15],
    [0.6, '#000000', 0],
    [1, '#2b1808', 0.6],
  ])
  stops(el('linearGradient', { id: id('streak'), x1: 0, y1: 0, x2: 1, y2: 0 }, defs), [
    [0, '#ffffff', 0],
    [0.15, '#ffffff', 0.85],
    [0.7, '#ffffff', 0.6],
    [1, '#ffffff', 0],
  ])
  stops(el('radialGradient', { id: id('caustic') }, defs), [
    [0, '#f4ffd8', 0.85],
    [0.5, '#c8f2c0', 0.35],
    [1, '#c8f2c0', 0],
  ])
  stops(el('radialGradient', { id: id('shadow') }, defs), [
    [0, '#6b4a22', 0.45],
    [1, '#6b4a22', 0],
  ])
  const clip = el('clipPath', { id: id('inside') }, defs)
  el('path', { d: BODY }, clip)

  const root = el('g', null, parent)
  const local = el('g', { transform: 'translate(-160 0)' }, root)
  // shadow and caustic on the sand (the caustic falls away from the sun)
  const ground = el('g', null, local)
  el('ellipse', { cx: 150, cy: 50, rx: 165, ry: 14, fill: url('shadow') }, ground)
  el('ellipse', { cx: 96, cy: 56, rx: 70, ry: 9, fill: url('caustic'), style: 'mix-blend-mode:screen' }, ground)

  el('path', { d: BODY, fill: url('glassBack') }, local)
  // a pinch of sand that rolled in with the sea
  const inside = el('g', { 'clip-path': url('inside') }, local)
  const random = seeded(8)
  for (let i = 0; i < 40; i += 1) {
    el('circle', { cx: 14 + random() * 160, cy: 40 - random() * random() * 10, r: 0.6 + random() * 1.4, fill: random() < 0.5 ? '#e7cf9c' : '#b8955c' }, inside)
  }

  // the rolled letter, tied with twine
  const scroll = el('g', null, local)
  el('rect', { x: 52, y: -12, width: 210, height: 24, rx: 4, fill: url('roll') }, scroll)
  el('ellipse', { cx: 262, cy: 0, rx: 3.6, ry: 12, fill: '#e9d3a5' }, scroll)
  el('path', { d: 'M262 -6 a3 6 0 1 0 0.01 0', fill: 'none', stroke: '#a88655', 'stroke-width': 0.8 }, scroll)
  el('path', { d: 'M148 -12 L151 12 M154 -12 L157 12', stroke: '#8b3a2a', 'stroke-width': 2.4 }, scroll)

  // the cork
  const cork = el('g', null, local)
  el('path', { d: 'M280 -13 L318 -14.5 L318 14.5 L280 13 Z', fill: url('cork') }, cork)
  el('path', { d: 'M280 -13 L318 -14.5 L318 14.5 L280 13 Z', fill: url('corkShade') }, cork)
  el('ellipse', { cx: 318, cy: 0, rx: 4.2, ry: 14.5, fill: '#d2a670' }, cork)
  el('ellipse', { cx: 318, cy: 0, rx: 2.2, ry: 8, fill: 'none', stroke: '#9c7444', 'stroke-width': 0.6 }, cork)

  // front glass and its light
  el('path', { d: BODY, fill: url('glassFront') }, local)
  el('path', { d: BODY, fill: 'none', stroke: '#e6fff6', 'stroke-opacity': 0.55, 'stroke-width': 1.3 }, local)
  el('path', { d: 'M10 -40 L178 -40 C202 -40 216 -17 238 -11 L290 -11', fill: 'none', stroke: '#06302a', 'stroke-opacity': 0.35, 'stroke-width': 2 }, local)
  el('ellipse', { cx: 6, cy: 0, rx: 5, ry: 40, fill: 'none', stroke: '#9fe0cc', 'stroke-opacity': 0.55, 'stroke-width': 3 }, local)
  el('rect', { x: 287, y: -18.5, width: 13, height: 37, rx: 2, fill: '#bff3e3', opacity: 0.35 }, local)
  el('path', { d: 'M289 -16 H299', stroke: '#ffffff', 'stroke-width': 1.6, opacity: 0.8 }, local)
  el('path', { d: 'M22 -33 L172 -33 Q182 -33 178 -29 L24 -28 Q16 -29 22 -33 Z', fill: url('streak') }, local)
  el('path', { d: 'M200 -32 C214 -26 222 -15 236 -12', stroke: '#ffffff', 'stroke-width': 2.2, 'stroke-linecap': 'round', fill: 'none', opacity: 0.75 }, local)
  el('path', { d: 'M244 -11 H282', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.7 }, local)
  el('path', { d: 'M30 30 Q100 37 168 30', stroke: '#e8fff8', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none', opacity: 0.25 }, local)
  const glint = el('g', { transform: 'translate(206 -30)' }, local)
  el('path', { d: 'M0 -9 L1.2 -1.2 L9 0 L1.2 1.2 L0 9 L-1.2 1.2 L-9 0 L-1.2 -1.2 Z', fill: '#ffffff' }, glint)
  el('circle', { r: 3.2, fill: '#ffffff', opacity: 0.9 }, glint)

  // foam ring while it floats
  const foam = el('ellipse', { cx: 150, cy: 30, rx: 175, ry: 13, fill: 'none', stroke: '#ffffff', 'stroke-width': 4, 'stroke-dasharray': '10 6 3 8', opacity: 0 }, local)

  return { root, scroll, cork, glint, foam, ground }
}

/* -------------------------------------------------------- parchment */

function paperTexture(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const c = canvas.getContext('2d')
  c.fillStyle = '#f2e2bd'
  c.fillRect(0, 0, width, height)
  const random = seeded(29)
  for (let i = 0; i < 46; i += 1) {
    const x = random() * width
    const y = random() * height
    const r = 30 + random() * width * 0.3
    const g = c.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(176,128,62,${0.04 + random() * 0.07})`)
    g.addColorStop(1, 'rgba(176,128,62,0)')
    c.fillStyle = g
    c.fillRect(x - r, y - r, r * 2, r * 2)
  }
  c.lineWidth = 1
  for (let i = 0; i < 900; i += 1) {
    const x = random() * width
    const y = random() * height
    const a = random() * Math.PI
    const len = 3 + random() * 12
    c.strokeStyle = random() < 0.5 ? 'rgba(120,84,40,0.08)' : 'rgba(255,250,235,0.25)'
    c.beginPath()
    c.moveTo(x, y)
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    c.stroke()
  }
  for (let i = 0; i < 18; i += 1) {
    c.fillStyle = `rgba(140,92,40,${0.08 + random() * 0.12})`
    c.beginPath()
    c.arc(random() * width, random() * height, 1 + random() * 3.5, 0, Math.PI * 2)
    c.fill()
  }
  // darker, sea-worn edges
  const edge = (x0, y0, x1, y1) => {
    const g = c.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, 'rgba(140,96,44,0.45)')
    g.addColorStop(1, 'rgba(140,96,44,0)')
    c.fillStyle = g
    c.fillRect(0, 0, width, height)
  }
  edge(0, 0, width * 0.09, 0)
  edge(width, 0, width * 0.91, 0)
  edge(0, 0, 0, height * 0.06)
  edge(0, height, 0, height * 0.94)
  // deckled side edges
  c.globalCompositeOperation = 'destination-out'
  for (let y = 0; y < height; y += 3) {
    c.beginPath()
    c.arc(random() * 6, y, 2 + random() * 5, 0, Math.PI * 2)
    c.arc(width - random() * 6, y, 2 + random() * 5, 0, Math.PI * 2)
    c.fill()
  }
  c.globalCompositeOperation = 'source-over'
  return canvas.toDataURL('image/png')
}

function compassRose(parent, x, y, r) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent)
  el('circle', { r, fill: 'none', stroke: '#8a6a3e', 'stroke-width': 0.8, opacity: 0.7 }, g)
  el('circle', { r: r * 0.82, fill: 'none', stroke: '#8a6a3e', 'stroke-width': 0.5, 'stroke-dasharray': '1 2', opacity: 0.7 }, g)
  let dark = ''
  let lightPath = ''
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const len = i % 2 ? r * 0.62 : r * 1.1
    const tip = [Math.cos(a) * len, Math.sin(a) * len]
    const left = [Math.cos(a - Math.PI / 2) * r * 0.13, Math.sin(a - Math.PI / 2) * r * 0.13]
    const right = [Math.cos(a + Math.PI / 2) * r * 0.13, Math.sin(a + Math.PI / 2) * r * 0.13]
    dark += `M0 0 L${left[0].toFixed(2)} ${left[1].toFixed(2)} L${tip[0].toFixed(2)} ${tip[1].toFixed(2)} Z `
    lightPath += `M0 0 L${right[0].toFixed(2)} ${right[1].toFixed(2)} L${tip[0].toFixed(2)} ${tip[1].toFixed(2)} Z `
  }
  el('path', { d: lightPath, fill: '#e1b16a' }, g)
  el('path', { d: dark, fill: '#2c3e50' }, g)
  el('circle', { r: r * 0.08, fill: '#b8862f' }, g)
  return g
}

function measure(text, font) {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font
  return ctx.measureText(text).width
}

// The letter: paper between two wooden-cored rolls; `setUnroll(u)` opens it 0..1.
export function buildParchment(parent, uid, { width: Wp, height: Hp, names, kicker, place, lang }) {
  const upper = (value) => value.toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-GB')
  const id = (name) => `${uid}-${name}`
  const url = (name) => `url(#${id(name)})`
  const defs = el('defs', null, parent)
  stops(el('linearGradient', { id: id('cyl'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#7e5a2c'],
    [0.28, '#efd9aa'],
    [0.48, '#fcefd2'],
    [0.8, '#b48a51'],
    [1, '#5e421f'],
  ])
  const blur = el('filter', { id: id('shadow'), x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs)
  el('feGaussianBlur', { stdDeviation: 12 }, blur)
  const clip = el('clipPath', { id: id('reveal') }, defs)
  const clipRect = el('rect', { x: -Wp / 2 - 2, y: -Hp / 2, width: Wp + 4, height: 0 }, clip)

  const root = el('g', null, parent)
  const shadow = el('rect', { x: -Wp / 2 + 10, y: -Hp / 2 + 24, width: Wp - 20, height: 0, fill: '#3a2a14', opacity: 0.35, filter: url('shadow') }, root)
  const sheet = el('g', { 'clip-path': url('reveal') }, root)
  el('image', { href: paperTexture(Math.round(Math.min(900, Wp * 2)), Math.round(Math.min(1100, Hp * 2))), x: -Wp / 2, y: -Hp / 2, width: Wp, height: Hp, preserveAspectRatio: 'none' }, sheet)

  const ink = '#2c3e50'
  compassRose(sheet, 0, -Hp / 2 + Hp * 0.14, Wp * 0.055)
  el('text', { x: 0, y: -Hp / 2 + Hp * 0.27, 'text-anchor': 'middle', fill: '#7a5a3a', 'font-family': '"Josefin Sans", sans-serif', 'font-size': Wp * 0.038, 'letter-spacing': Wp * 0.012 }, sheet).textContent = upper(kicker)

  const scriptFont = '"Allura", "Great Vibes", cursive'
  const widest = Math.max(measure(names[0], `100px ${scriptFont}`), measure(names[1], `100px ${scriptFont}`), 1)
  const fs = Math.min(Wp * 0.22, (Wp * 0.84 * 100) / widest)
  const mid = Hp * 0.02
  const text = (value, y, size, color) => {
    const node = el('text', { x: 0, y, 'text-anchor': 'middle', fill: color, 'font-family': scriptFont, 'font-size': size }, sheet)
    node.textContent = value
    return node
  }
  text(names[0], mid - fs * 0.42, fs, ink)
  text('&', mid + fs * 0.2, fs * 0.6, '#b8862f')
  text(names[1], mid + fs * 0.92, fs, ink)

  // a twisted-rope rule and the place
  const ruleY = Hp * 0.31
  el('path', { d: `M${-Wp * 0.3} ${ruleY} H${Wp * 0.3}`, stroke: '#8a6a3e', 'stroke-width': 3, 'stroke-dasharray': '2.2 1.6', fill: 'none' }, sheet)
  el('path', { d: `M${-Wp * 0.3} ${ruleY} H${Wp * 0.3}`, stroke: '#c9a46a', 'stroke-width': 1, fill: 'none' }, sheet)
  el('circle', { cx: 0, cy: ruleY, r: 4.5, fill: '#f2e2bd', stroke: '#8a6a3e', 'stroke-width': 1.2 }, sheet)
  el('text', { x: 0, y: Hp * 0.4, 'text-anchor': 'middle', fill: ink, 'font-family': '"Josefin Sans", sans-serif', 'font-size': Wp * 0.042, 'letter-spacing': Wp * 0.01 }, sheet).textContent = upper(place)

  // the rolls
  const rollW = Wp + 18
  const roll = (r) => {
    const g = el('g', null, root)
    const body = el('rect', { x: -rollW / 2, y: -r, width: rollW, height: r * 2, rx: r * 0.4, fill: url('cyl') }, g)
    const capL = el('ellipse', { cx: -rollW / 2, cy: 0, rx: r * 0.32, ry: r, fill: '#e3c793', stroke: '#8a6a3e', 'stroke-width': 0.8 }, g)
    const capR = el('ellipse', { cx: rollW / 2, cy: 0, rx: r * 0.32, ry: r, fill: '#e3c793', stroke: '#8a6a3e', 'stroke-width': 0.8 }, g)
    return { g, body, capL, capR }
  }
  const top = roll(9)
  const bottom = roll(16)
  const twine = el('g', null, bottom.g)
  el('path', { d: 'M-6 -16 L-3 16 M3 -16 L6 16', stroke: '#8b3a2a', 'stroke-width': 3 }, twine)
  el('path', { d: 'M4 16 q6 10 -2 18 M-4 16 q-8 8 -1 16', stroke: '#8b3a2a', 'stroke-width': 1.8, fill: 'none' }, twine)

  const setRoll = (part, r) => {
    part.body.setAttribute('y', -r)
    part.body.setAttribute('height', r * 2)
    part.body.setAttribute('rx', r * 0.4)
    part.capL.setAttribute('ry', r)
    part.capR.setAttribute('ry', r)
    part.capL.setAttribute('rx', r * 0.32)
    part.capR.setAttribute('rx', r * 0.32)
  }

  const setUnroll = (u) => {
    const revealed = Hp * u
    clipRect.setAttribute('height', revealed)
    shadow.setAttribute('height', Math.max(0, revealed - 20))
    top.g.setAttribute('transform', `translate(0 ${-Hp / 2})`)
    top.g.style.opacity = u > 0.01 ? 1 : 0
    const r = 16 - u * 6
    setRoll(bottom, r)
    // the bottom roll comes slightly toward the viewer as it opens
    bottom.g.setAttribute('transform', `translate(0 ${-Hp / 2 + revealed}) scale(${1 + u * 0.03})`)
  }
  setUnroll(0)

  return { root, twine, setUnroll }
}
