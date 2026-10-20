// B-Side: a 70s record-sleeve composition built from DOM + SVG — a printed
// sleeve, a walnut turntable seen from above, a spinning record whose groove
// sheen stays fixed while the grooves and label turn, and a tonearm.
// Shared by the page hero and the intro scene, so the intro's last frame is
// exactly the hero.
import { gsap } from 'gsap'
import './deck.css'

const NS = 'http://www.w3.org/2000/svg'
export const INK = { vinyl: '#1a1a1a', yellow: '#f2c14e', orange: '#e4572e', cream: '#f7f1e3', blue: '#3a6ea5' }
export const DECK_RATIO = 0.78 // deck height / width
export const ARM_PLAY = 30.4 // degrees: needle on the lead-in groove
const PLATTER = { x: 0.38, y: 0.39 } // platter centre, in deck widths
export const RECORD_D = 0.62 // record diameter, in deck widths

let uid = 0

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

function text(parent, value, attrs) {
  const element = svg('text', attrs, parent)
  element.textContent = value
  return element
}

// Font size that keeps a line inside `width` (rough average glyph width k·size).
function fit(value, max, width, k = 0.56) {
  return Math.min(max, width / Math.max(value.length * k, 1))
}

/* ------------------------------------------------------------ copy */

const COPY = {
  en: {
    sub: 'OUR LOVE SONG · SIDE A',
    labelTop: 'SIDE A · 33 1/3 RPM · STEREO',
    labelBottom: 'A1 · I DO (FOREVER MIX)',
    stereo: 'STEREO',
  },
  tr: {
    sub: 'AŞK ŞARKIMIZ · A YÜZÜ',
    labelTop: 'A YÜZÜ · 33 1/3 DEVİR · STEREO',
    labelBottom: 'A1 · EVET (SONSUZ VERSİYON)',
    stereo: 'STEREO',
  },
}

export function deckTexts({ partner1, partner2, dateText, place, date, lang = 'en' }) {
  const copy = COPY[lang] ?? COPY.en
  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
  const day = date ? `${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}` : '0821'
  return {
    ...copy,
    names: `${partner1} & ${partner2}`,
    date: String(dateText || '').toLocaleUpperCase(locale),
    place: String(place || '').toLocaleUpperCase(locale),
    catalog: `WED-${day}`,
  }
}

/* ----------------------------------------------------------- label */

function fillLabel(root, t) {
  root.replaceChildren()
  const id = `bsd${(uid += 1)}`
  const defs = svg('defs', {}, root)
  svg('path', { id: `${id}-top`, d: 'M -73 0 A 73 73 0 0 1 73 0' }, defs)
  svg('path', { id: `${id}-bot`, d: 'M -82 0 A 82 82 0 0 0 82 0' }, defs)
  const clip = svg('clipPath', { id: `${id}-clip` }, defs)
  svg('circle', { r: 100 }, clip)

  svg('circle', { r: 100, fill: INK.yellow }, root)
  svg('circle', { r: 95, fill: 'none', stroke: INK.orange, 'stroke-width': 6 }, root)
  svg('circle', { r: 89, fill: 'none', stroke: INK.vinyl, 'stroke-width': 0.8, opacity: 0.55 }, root)
  // printed 70s stripes behind the spindle
  const stripes = svg('g', { 'clip-path': `url(#${id}-clip)` }, root)
  ;[INK.orange, INK.vinyl, INK.blue].forEach((color, i) => svg('rect', { x: -100, y: 4 + i * 6, width: 200, height: 3.6, fill: color }, stripes))

  const arc = (pathId, value, size) => {
    const el = svg('text', { class: 'bsd-mono', 'font-size': size, fill: INK.vinyl, 'letter-spacing': 1.6 }, root)
    const path = svg('textPath', { href: `#${pathId}`, startOffset: '50%', 'text-anchor': 'middle' }, el)
    path.textContent = value
  }
  arc(`${id}-top`, t.labelTop, 8.6)
  arc(`${id}-bot`, t.labelBottom, 8)

  const nameSize = fit(t.names, 27, 150, 0.5)
  const names = text(root, t.names, { class: 'bsd-display', y: -22, 'text-anchor': 'middle', 'font-size': nameSize, fill: INK.vinyl })
  if (t.names.length * nameSize * 0.5 > 150) {
    names.setAttribute('textLength', 150)
    names.setAttribute('lengthAdjust', 'spacingAndGlyphs')
  }
  text(root, t.date, { class: 'bsd-mono', y: 42, 'text-anchor': 'middle', 'font-size': fit(t.date, 8.4, 120, 0.62), fill: INK.vinyl, 'letter-spacing': 1 })
  text(root, t.place, { class: 'bsd-mono', y: 54, 'text-anchor': 'middle', 'font-size': fit(t.place, 7, 100, 0.62), fill: INK.vinyl, opacity: 0.75, 'letter-spacing': 1 })
  // spindle hole
  svg('circle', { r: 5.5, fill: '#0b0b0b', stroke: '#8d8a84', 'stroke-width': 1 }, root)
}

/* ----------------------------------------------------------- sleeve */

function fillSleeve(root, t) {
  root.replaceChildren()
  const id = `bss${(uid += 1)}`
  const defs = svg('defs', {}, root)
  const clip = svg('clipPath', { id: `${id}-sky` }, defs)
  svg('rect', { x: 0, y: 0, width: 300, height: 182 }, clip)

  svg('rect', { width: 300, height: 300, fill: INK.cream }, root)
  // ring wear from the record inside
  svg('circle', { cx: 150, cy: 150, r: 131, fill: 'none', stroke: '#6b4a2a', 'stroke-width': 7, opacity: 0.06 }, root)

  // a record rising like the sun, haloed by a 70s rainbow
  const sun = svg('g', { 'clip-path': `url(#${id}-sky)` }, root)
  const bands = [
    [132, INK.blue],
    [116, INK.cream],
    [111, INK.yellow],
    [95, INK.cream],
    [90, INK.orange],
    [74, INK.cream],
    [69, INK.vinyl],
  ]
  bands.forEach(([r, fill]) => svg('circle', { cx: 150, cy: 182, r, fill }, sun))
  for (let r = 30; r < 67; r += 2.6) svg('circle', { cx: 150, cy: 182, r, fill: 'none', stroke: '#ffffff', 'stroke-width': 0.35, opacity: 0.09 }, sun)
  svg('path', { d: 'M150 182 L104 132 A69 69 0 0 1 128 117 Z', fill: '#ffffff', opacity: 0.07 }, sun)
  svg('circle', { cx: 150, cy: 182, r: 24, fill: INK.yellow }, sun)
  svg('circle', { cx: 150, cy: 182, r: 2.4, fill: INK.vinyl }, sun)

  // horizon stripes
  ;[INK.blue, INK.yellow, INK.orange, INK.vinyl].forEach((fill, i) => svg('rect', { x: 0, y: 186 + i * 7.5, width: 300, height: 4.6, fill }, root))

  const nameSize = fit(t.names, 34, 262, 0.5)
  const names = text(root, t.names, { class: 'bsd-display', x: 150, y: 250, 'text-anchor': 'middle', 'font-size': nameSize, fill: INK.vinyl })
  if (t.names.length * nameSize * 0.5 > 262) {
    names.setAttribute('textLength', 262)
    names.setAttribute('lengthAdjust', 'spacingAndGlyphs')
  }
  text(root, t.sub, { class: 'bsd-mono', x: 150, y: 266, 'text-anchor': 'middle', 'font-size': 7.4, fill: INK.orange, 'letter-spacing': 2.4 })
  const details = [t.date, t.place].filter(Boolean).join('  ·  ')
  text(root, details, { class: 'bsd-mono', x: 150, y: 284, 'text-anchor': 'middle', 'font-size': fit(details, 6.6, 250, 0.62), fill: INK.vinyl, opacity: 0.8, 'letter-spacing': 1 })

  // sleeve furniture
  svg('rect', { x: 14, y: 14, width: 44, height: 13, rx: 6.5, fill: 'none', stroke: INK.vinyl, 'stroke-width': 1 }, root)
  text(root, t.stereo, { class: 'bsd-mono', x: 36, y: 23.2, 'text-anchor': 'middle', 'font-size': 6.4, fill: INK.vinyl, 'letter-spacing': 1.5 })
  text(root, t.catalog, { class: 'bsd-mono', x: 286, y: 23.2, 'text-anchor': 'end', 'font-size': 6.4, fill: INK.vinyl, 'letter-spacing': 1 })
}

/* ------------------------------------------------------------ deck */

function buildDeck(parent) {
  const deck = node('div', 'bsd-deck', parent)
  const plate = node('div', 'bsd-plate', deck)
  node('div', 'bsd-platter', plate)
  node('div', 'bsd-start', plate)
  const speeds = node('div', 'bsd-speeds', plate)
  node('span', 'is-on', speeds)
  node('span', '', speeds)
  node('div', 'bsd-led', plate)
  const pitch = node('div', 'bsd-pitch', plate)
  node('span', '', pitch)
  node('div', 'bsd-badge', plate).textContent = 'B-SIDE · DIRECT DRIVE'
  return deck
}

function buildArm(parent) {
  const root = svg('svg', { class: 'bsd-arm', viewBox: '0 0 100 78', 'aria-hidden': 'true' }, parent)
  const defs = svg('defs', {}, root)
  const chrome = svg('linearGradient', { id: `bsa${(uid += 1)}`, x1: 0, y1: 0, x2: 1, y2: 1 }, defs)
  ;[
    ['0', '#f4f3ef'],
    ['0.45', '#9c9a95'],
    ['0.7', '#e9e7e2'],
    ['1', '#6f6d69'],
  ].forEach(([offset, color]) => svg('stop', { offset, 'stop-color': color }, chrome))
  const chromeFill = `url(#${chrome.id})`

  // fixed base, rest and anti-skate knob
  svg('circle', { cx: 84, cy: 16, r: 7.2, fill: chromeFill }, root)
  svg('circle', { cx: 84, cy: 16, r: 5, fill: '#1d1c1a' }, root)
  svg('rect', { x: 86.4, y: 46, width: 3.2, height: 5, rx: 0.8, fill: '#2a2927', stroke: '#77736d', 'stroke-width': 0.4 }, root)
  svg('circle', { cx: 93.5, cy: 27, r: 2.4, fill: chromeFill }, root)
  svg('circle', { cx: 93.5, cy: 27, r: 1.1, fill: '#1d1c1a' }, root)

  const arm = svg('g', {}, root)
  // counterweight
  svg('rect', { x: 80.2, y: 1.5, width: 7.6, height: 9.5, rx: 1.6, fill: '#252422', stroke: chromeFill, 'stroke-width': 0.6 }, arm)
  svg('line', { x1: 80.6, y1: 5, x2: 87.4, y2: 5, stroke: chromeFill, 'stroke-width': 0.5 }, arm)
  // tube
  svg('line', { x1: 84, y1: 11, x2: 84, y2: 54.5, stroke: chromeFill, 'stroke-width': 1.7, 'stroke-linecap': 'round' }, arm)
  svg('circle', { cx: 84, cy: 16, r: 2.4, fill: chromeFill }, arm)
  // headshell + cartridge, offset toward the spindle
  const shell = svg('g', { transform: 'rotate(10 84 60)' }, arm)
  svg('rect', { x: 81.5, y: 53, width: 5, height: 9.4, rx: 0.9, fill: '#d9d7d2', stroke: '#8f8c86', 'stroke-width': 0.3 }, shell)
  svg('rect', { x: 82.1, y: 55.2, width: 3.8, height: 5.4, rx: 0.4, fill: INK.orange }, shell)
  svg('line', { x1: 86.5, y1: 55, x2: 89.6, y2: 53.6, stroke: chromeFill, 'stroke-width': 0.6, 'stroke-linecap': 'round' }, shell)
  svg('circle', { cx: 84, cy: 60.4, r: 0.45, fill: '#111' }, shell)
  return { root, arm }
}

/* ---------------------------------------------------------- layout */

// Hero composition for a w×h viewport: deck, record and sleeve in px.
export function heroLayout(w, h) {
  const portrait = w / h < 1.1
  let dw
  let dx
  let dy
  let sleeve
  if (portrait) {
    dw = Math.min(w * 0.86, h * 0.46)
    dx = (w - dw) / 2 + dw * 0.03
    dy = h * 0.91 - dw * DECK_RATIO
    const s = dw * 0.6
    sleeve = { s, cx: dx + s * 0.48, cy: dy - s * 0.12, r: -7 }
  } else {
    dw = Math.min(w * 0.4, h * 0.78)
    dx = w * 0.95 - dw
    dy = (h - dw * DECK_RATIO) / 2 + h * 0.05
    const s = dw * 0.62
    sleeve = { s, cx: dx + s * 0.08, cy: dy + s * 0.28, r: -8 }
  }
  return {
    w,
    h,
    portrait,
    deck: { x: dx, y: dy, w: dw, h: dw * DECK_RATIO },
    record: { cx: dx + PLATTER.x * dw, cy: dy + PLATTER.y * dw, d: RECORD_D * dw },
    sleeve,
  }
}

/* ----------------------------------------------------------- stage */

export function createDeckStage(host, { texts }) {
  const root = node('div', 'bsd-stage', host)
  const backdrop = node('div', 'bsd-backdrop', root)
  const sleeveLayer = node('div', 'bsd-layer bsd-layer--sleeve', root)
  const deckLayer = node('div', 'bsd-layer bsd-layer--deck', root)
  const recordLayer = node('div', 'bsd-layer bsd-layer--record', root)
  const armLayer = node('div', 'bsd-layer bsd-layer--arm', root)
  node('div', 'bsd-grain', root)

  // big rainbow arcs behind everything
  const arcs = svg('svg', { class: 'bsd-arcs', viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid slice' }, backdrop)
  ;[
    [70, INK.blue],
    [62, INK.yellow],
    [54, INK.orange],
    [46, '#2a2522'],
  ].forEach(([r, stroke]) => svg('circle', { cx: 100, cy: 100, r, fill: 'none', stroke, 'stroke-width': 5.4 }, arcs))

  const sleeve = node('div', 'bsd-sleeve', sleeveLayer)
  const sleeveArt = svg('svg', { viewBox: '0 0 300 300', 'aria-hidden': 'true' }, sleeve)
  node('div', 'bsd-sleeve-wear', sleeve)

  const deck = buildDeck(deckLayer)

  const record = node('div', 'bsd-record', recordLayer)
  const spin = node('div', 'bsd-spin', record)
  const label = svg('svg', { class: 'bsd-label', viewBox: '-100 -100 200 200', 'aria-hidden': 'true' }, spin)
  node('div', 'bsd-sheen', record)

  const { root: armSvg, arm } = buildArm(armLayer)

  const setTexts = (value) => {
    fillSleeve(sleeveArt, value)
    fillLabel(label, value)
  }
  if (texts) setTexts(texts)

  let layout = heroLayout(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight)
  const measure = () => {
    layout = heroLayout(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight)
    const { deck: d, sleeve: s, record: r } = layout
    Object.assign(deck.style, { width: `${d.w}px`, height: `${d.h}px` })
    Object.assign(armSvg.style, { width: `${d.w}px`, height: `${d.h}px` })
    gsap.set([deck, armSvg], { x: d.x, y: d.y })
    Object.assign(sleeve.style, { width: `${s.s}px`, height: `${s.s}px` })
    Object.assign(record.style, { width: `${r.d}px`, height: `${r.d}px` })
    root.style.setProperty('--deck-w', `${d.w}px`)
    return layout
  }
  const placeHero = () => {
    const { sleeve: s, record: r } = layout
    gsap.set(sleeve, { x: s.cx, y: s.cy, xPercent: -50, yPercent: -50, scale: 1, rotation: s.r })
    gsap.set(record, { x: r.cx, y: r.cy, xPercent: -50, yPercent: -50, scale: 1, rotation: 0 })
  }
  measure()

  // tonearm: angle in degrees, lift 0..1
  const armState = { angle: 0, lift: 0 }
  const applyArm = () => {
    const k = 1 + armState.lift * 0.035
    arm.setAttribute('transform', `rotate(${armState.angle.toFixed(2)} 84 16) translate(84 16) scale(${k.toFixed(4)}) translate(-84 -16)`)
    armSvg.style.setProperty('--lift', armState.lift.toFixed(3))
  }
  applyArm()

  const spinTween = gsap.to(spin, { rotation: '+=360', duration: 1.8, ease: 'none', repeat: -1, paused: true })
  spinTween.timeScale(0)
  let spinRamp = null
  const setSpin = (speed, duration = 0) => {
    spinRamp?.kill()
    if (speed > 0 && spinTween.paused()) spinTween.play()
    if (duration > 0) spinRamp = gsap.to(spinTween, { timeScale: speed, duration, ease: 'power1.inOut' })
    else spinTween.timeScale(speed)
  }

  // pointer parallax: the sleeve sits deeper than the deck
  const movers = [
    [gsap.quickTo(sleeveLayer, 'x', { duration: 0.9, ease: 'power3' }), gsap.quickTo(sleeveLayer, 'y', { duration: 0.9, ease: 'power3' }), -10, -7],
    [gsap.quickTo(backdrop, 'x', { duration: 1.2, ease: 'power3' }), gsap.quickTo(backdrop, 'y', { duration: 1.2, ease: 'power3' }), -18, -12],
  ]
  const front = [deckLayer, recordLayer, armLayer]
  const frontX = front.map((layer) => gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3' }))
  const frontY = front.map((layer) => gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3' }))
  const setParallax = (px, py) => {
    movers.forEach(([qx, qy, ax, ay]) => {
      qx(px * ax)
      qy(py * ay)
    })
    frontX.forEach((q) => q(px * 7))
    frontY.forEach((q) => q(py * 5))
    // the light on the vinyl follows the pointer a little
    record.style.setProperty('--sheen', `${(px * 14).toFixed(1)}deg`)
  }

  return {
    root,
    backdrop,
    sleeve,
    sleeveLayer,
    deck,
    deckLayer,
    record,
    recordLayer,
    armLayer,
    armState,
    applyArm,
    measure,
    placeHero,
    setTexts,
    setSpin,
    setParallax,
    get layout() {
      return layout
    },
    pause(value) {
      if (value) spinTween.pause()
      else if (spinTween.timeScale() > 0) spinTween.play()
      root.classList.toggle('is-paused', value)
    },
    dispose() {
      spinRamp?.kill()
      spinTween.kill()
      gsap.killTweensOf([sleeve, record, deck, armSvg, sleeveLayer, backdrop, ...front, armState])
      root.remove()
    },
  }
}
