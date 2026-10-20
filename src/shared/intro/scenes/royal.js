// Royal Garden — "The rose opens". An illustrated deep-rose bud on draped
// black velvet, lit by two candles. Opening: layered SVG petals unfurl from
// the outside in, revealing a gold-foil monogram in the heart; a few petals
// fall; the couple's names appear in gilded Cormorant Garamond italic and the
// view rises over the bloom. Built from DOM, SVG and canvas only (no WebGL).
import { gsap } from 'gsap'
import { foilTile, el, svgEl, sceneRoot, loop, seeded, textWidth } from '../foil.js'

export const fonts = () => [
  { family: 'Cormorant Garamond', weight: 500, style: 'italic', google: 'Cormorant+Garamond:ital,wght@0,500;1,400;1,500' },
  { family: 'Cormorant Garamond', weight: 500 },
]

export const copy = {
  en: { prompt: 'Let the rose bloom', open: 'Let the rose bloom' },
  tr: { prompt: 'Gülü açın', open: 'Gülü açın' },
}

const css = (s, id) => `
${s}{position:absolute;inset:0;overflow:hidden;background:#0b0306;contain:strict;user-select:none;-webkit-user-select:none}
${s} .world{position:absolute;inset:0;transform-origin:50% 45%;will-change:transform}
${s} canvas.velvet{position:absolute;inset:0;width:100%;height:100%}
${s} .pool{position:absolute;border-radius:50%;pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(closest-side,rgba(255,150,80,.30),rgba(200,80,50,.12) 45%,rgba(120,30,30,0) 100%)}
${s} .spot{position:absolute;border-radius:50%;pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(closest-side,rgba(255,214,190,.16),rgba(180,60,80,.07) 55%,rgba(0,0,0,0))}
${s} .candle{position:absolute;bottom:-2%;transform:translateX(-50%)}
${s} .wax{position:absolute;inset:0;border-radius:12% / 3%;
  background:linear-gradient(90deg,#6f5a3e 0%,#bfa982 16%,#f4e8cf 38%,#fffaf0 50%,#e8d7b4 66%,#a38c66 86%,#5e4b32 100%)}
${s} .wax::before{content:'';position:absolute;left:0;right:0;top:-3%;height:6%;border-radius:50%;
  background:radial-gradient(60% 60% at 50% 45%,#fff6df,#e4d1ad 70%,#b29b74)}
${s} .wax::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,170,90,.35),rgba(255,170,90,0) 22%);border-radius:inherit}
${s} .flame{position:absolute;left:50%;bottom:100%;transform-origin:50% 100%;will-change:transform}
${s} .flame svg{display:block;width:100%;height:100%;overflow:visible}
${s} .glow{position:absolute;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;mix-blend-mode:screen;
  background:radial-gradient(closest-side,rgba(255,236,190,.55),rgba(255,170,90,.22) 30%,rgba(255,120,60,.07) 60%,rgba(255,120,60,0))}
${s} svg.rose{position:absolute;overflow:visible;will-change:transform}
${s} .name{position:absolute;left:50%;transform:translate(-50%,-50%);white-space:nowrap;text-align:center;opacity:0;
  font-family:'Cormorant Garamond','Cormorant',Garamond,Georgia,serif;font-style:italic;font-weight:500;line-height:1.1;
  filter:drop-shadow(0 1px 0 #6b4a16) drop-shadow(0 1.5px 0 #4a320c) drop-shadow(0 10px 20px rgba(0,0,0,.6));--sheen:130%}
${s} .gold{background-image:linear-gradient(100deg,rgba(255,255,255,0) 44%,rgba(255,251,232,.9) 50%,rgba(255,255,255,0) 56%),
  var(--${id}-foil),linear-gradient(180deg,#fff1c4 0%,#ecc778 30%,#b98838 55%,#f1d690 76%,#a9792e 100%);
  background-size:320% 100%,160px 160px,100% 100%;background-position:var(--sheen) 0,0 0,0 0;background-repeat:no-repeat,repeat,no-repeat;
  -webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;padding:0 .08em}
`

/* -------------------------------------------------------------- velvet */

// Draped black velvet: soft vertical folds, sheen on the crests, fibre grain.
function paintVelvet(canvas, W, H, dpr) {
  const w = Math.max(1, Math.round(W * dpr))
  const h = Math.max(1, Math.round(H * dpr))
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(w, h)
  const d = image.data
  const random = seeded(41)
  const fibre = new Float32Array(w)
  for (let x = 0; x < w; x += 1) fibre[x] = (random() - 0.5) * 0.12
  const folds = Math.max(5, Math.round(W / 120))
  for (let y = 0; y < h; y += 1) {
    const v = y / h
    for (let x = 0; x < w; x += 1) {
      const u = x / w
      const sway = Math.sin(v * 3.2 + u * 4) * 0.012
      const a = (u + sway) * folds * Math.PI * 2
      // fold luminance: broad drape plus a narrower secondary fold
      const l = 0.5 + 0.32 * Math.sin(a) + 0.18 * Math.sin(a * 2.3 + 1.3 + v * 1.4)
      const crest = Math.pow(Math.max(0, l), 5)
      const vignette = 1 - 0.55 * Math.pow(Math.hypot(u - 0.5, (v - 0.45) * 1.1) * 1.4, 2)
      const n = 1 + fibre[x] + (random() - 0.5) * 0.18
      const k = Math.max(0, vignette) * n
      const i = (y * w + x) * 4
      d[i] = (10 + 26 * l + 90 * crest) * k
      d[i + 1] = (3 + 6 * l + 22 * crest) * k
      d[i + 2] = (6 + 11 * l + 36 * crest) * k
      d[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}

/* ---------------------------------------------------------------- rose */

// Unit petal: base at the origin, tip toward -y, half-width 1, length 1.
const PETAL = 'M0 0C.55 -.08 1.06 -.45 .93 -.78C.83 -1.02 .3 -1.05 0 -.95C-.3 -1.05 -.83 -1.02 -.93 -.78C-1.06 -.45 -.55 -.08 0 0Z'
const LIP = 'M.86 -.8C.74 -.98 .32 -1 0 -.92C-.32 -1 -.74 -.98 -.86 -.8'
const VEIN = 'M0 -.04C.02 -.35 -.02 -.62 0 -.88'

// Rings from outermost (drawn first) to innermost.
const RINGS = [
  { n: 5, L: 0.6, W: 0.4, r: 0.12, off: 0 },
  { n: 5, L: 0.52, W: 0.35, r: 0.1, off: 36 },
  { n: 5, L: 0.43, W: 0.3, r: 0.09, off: 14 },
  { n: 4, L: 0.34, W: 0.26, r: 0.09, off: 52 },
  { n: 4, L: 0.26, W: 0.21, r: 0.1, off: 8 },
  { n: 3, L: 0.18, W: 0.17, r: 0.135, off: 33, heart: true },
  { n: 3, L: 0.13, W: 0.14, r: 0.13, off: 93, heart: true },
]

export default function create(host, template, { onOpened, setCaption }) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const foil = foilTile(256, 11)
  const { root, id } = sceneRoot(host, 'rose', css)
  root.style.setProperty(`--${id}-foil`, `url(${foil})`)

  const world = el('div', 'world', root)
  const velvet = el('canvas', 'velvet', world)
  const spot = el('div', 'spot', world)
  const candles = [-1, 1].map((side, i) => {
    const pool = el('div', 'pool', world)
    const candle = el('div', 'candle', world)
    el('div', 'wax', candle)
    const flame = el('div', 'flame', candle)
    flame.innerHTML = `<svg viewBox="-20 -92 40 96"><defs>
<radialGradient id="${id}fl${i}" cx=".5" cy=".72" r=".62"><stop offset="0" stop-color="#fffef4"/><stop offset=".28" stop-color="#ffe7a6"/><stop offset=".6" stop-color="#ff9d3c" stop-opacity=".85"/><stop offset="1" stop-color="#ff6a1e" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}fb${i}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7fb2ff" stop-opacity=".7"/><stop offset="1" stop-color="#3a5cff" stop-opacity="0"/></radialGradient></defs>
<path d="M0 -90C6 -62 18 -40 16 -20C14 -4 6 2 0 2C-6 2 -14 -4 -16 -20C-18 -40 -6 -62 0 -90Z" fill="url(#${id}fl${i})"/>
<ellipse cx="0" cy="-8" rx="6" ry="9" fill="url(#${id}fb${i})"/>
<path d="M0 4L0 -10" stroke="#1d0f08" stroke-width="2" stroke-linecap="round"/></svg>`
    const glow = el('div', 'glow', world)
    return { side, pool, candle, flame, glow, seed: i * 3.7 + 1.3 }
  })

  /* ------------------------------------------------------------- rose svg */
  const rose = svgEl('svg', { class: 'rose', viewBox: '-1 -1 2 2' }, world)
  const defs = svgEl('defs', {}, rose)
  defs.innerHTML = `
<linearGradient id="${id}pb" x1="0" y1="1" x2="0" y2="0">
  <stop offset="0" stop-color="#2c030e"/><stop offset=".22" stop-color="#5e0920"/><stop offset=".58" stop-color="#9a1238"/><stop offset=".86" stop-color="#b81f4a"/><stop offset="1" stop-color="#8e0f33"/></linearGradient>
<radialGradient id="${id}ps" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#ff8fab" stop-opacity=".34"/><stop offset=".6" stop-color="#ff6f8e" stop-opacity=".08"/><stop offset="1" stop-color="#ff6f8e" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}pe" cx=".5" cy=".55" r=".62"><stop offset=".62" stop-color="#1a0208" stop-opacity="0"/><stop offset="1" stop-color="#1a0208" stop-opacity=".75"/></radialGradient>
<radialGradient id="${id}hh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4a0a1a"/><stop offset=".65" stop-color="#22030b"/><stop offset="1" stop-color="#0d0104"/></radialGradient>
<radialGradient id="${id}hg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd690" stop-opacity=".55"/><stop offset=".5" stop-color="#ff9f6a" stop-opacity=".18"/><stop offset="1" stop-color="#ff9f6a" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}mg" x1="0" y1="0" x2=".9" y2="1">
  <stop offset="0" stop-color="#8a6322"/><stop offset=".25" stop-color="#f3d27f"/><stop offset=".38" stop-color="#fff2c2"/><stop offset=".55" stop-color="#c39040"/><stop offset=".78" stop-color="#efcc7c"/><stop offset="1" stop-color="#83591b"/></linearGradient>
<pattern id="${id}mf" patternUnits="userSpaceOnUse" width="60" height="60"><image href="${foil}" width="60" height="60"/></pattern>
<path id="${id}p" d="${PETAL}"/>`

  const random = seeded(19)
  const petals = []
  const ringCount = RINGS.length
  let heartGroup = null
  RINGS.forEach((ring, ri) => {
    if (ring.heart && !heartGroup) heartGroup = buildHeart()
    for (let i = 0; i < ring.n; i += 1) {
      const g = svgEl('g', {}, rose)
      // shadow, body, sheen, edge darkening, closed-state shade, rolled lip
      svgEl('use', { href: `#${id}p`, fill: '#080003', opacity: '.55', transform: 'translate(0 .04) scale(1.06 1.04)' }, g)
      svgEl('use', { href: `#${id}p`, fill: `url(#${id}pb)` }, g)
      svgEl('use', { href: `#${id}p`, fill: `url(#${id}ps)` }, g)
      svgEl('use', { href: `#${id}p`, fill: `url(#${id}pe)` }, g)
      const shade = svgEl('use', { href: `#${id}p`, fill: '#14010a', opacity: '.5' }, g)
      svgEl('path', { d: LIP, fill: 'none', stroke: '#ff9ab3', 'stroke-opacity': '.38', 'stroke-width': '.035', 'stroke-linecap': 'round' }, g)
      svgEl('path', { d: VEIN, fill: 'none', stroke: '#3a0412', 'stroke-opacity': '.35', 'stroke-width': '.02' }, g)
      const depth = ri / (ringCount - 1) // 0 outer .. 1 inner
      petals.push({
        g,
        shade,
        angle: ring.off + (i * 360) / ring.n + (random() - 0.5) * 10,
        L: ring.L * (0.94 + random() * 0.12),
        W: ring.W * (0.94 + random() * 0.12),
        r: ring.r,
        // closed bud: petals pulled in, twisted and cupped over the heart
        rc: ring.heart ? 0.0 : 0.02 + 0.03 * (1 - depth),
        sc: ring.heart ? 1.25 : 0.34 + 0.24 * depth,
        twist: 46 + 20 * depth,
        start: depth * 0.5 + random() * 0.05,
        fall: -1,
        fallSeed: random(),
      })
    }
  })

  // the heart: dark hollow, glow and a gold-foil monogram (drawn below the inner petals)
  function buildHeart() {
    const group = svgEl('g', {}, rose)
    svgEl('circle', { r: '.17', fill: `url(#${id}hh)` }, group)
    const glow = svgEl('circle', { r: '.3', fill: `url(#${id}hg)`, opacity: '0' }, group)
    const mono = svgEl('g', { transform: 'scale(.01)' }, group)
    const locale = template.lang === 'tr' ? 'tr-TR' : 'en-GB'
    const initial = (name) => (Array.from(String(name ?? '').trim())[0] ?? '').toLocaleUpperCase(locale)
    const layer = (fill, dx, dy, opacity = 1) => {
      const g = svgEl('g', { fill, transform: `translate(${dx} ${dy})`, opacity: String(opacity) }, mono)
      svgEl('circle', { r: '12.8', fill: 'none', stroke: fill, 'stroke-width': '.9' }, g)
      svgEl('circle', { r: '11.3', fill: 'none', stroke: fill, 'stroke-width': '.4' }, g)
      const text = (value, x, y, size) => {
        const t = svgEl('text', { x, y, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g)
        t.style.fontFamily = "'Cormorant Garamond', Garamond, Georgia, serif"
        t.style.fontStyle = 'italic'
        t.style.fontWeight = '500'
        t.textContent = value
      }
      text(initial(template.couple[0]), '-4.2', '-1', '13')
      text(initial(template.couple[1]), '4.4', '2.2', '13')
      text('&', '0', '.6', '5.2')
    }
    layer('#120800', 0.4, 0.6, 0.8)
    layer('#fff4cf', -0.25, -0.25, 0.6)
    layer(`url(#${id}mg)`, 0, 0)
    layer(`url(#${id}mf)`, 0, 0)
    group.dataset.heart = '1'
    return { group, glow }
  }

  // which outer petals let go
  const fallers = [petals[1], petals[3], petals[7]]

  /* ---------------------------------------------------------------- names */
  const [first, second] = template.couple
  const nameNodes = [first, second].map((name) => {
    const node = el('div', 'name', world)
    el('span', 'gold', node, name)
    return node
  })

  /* --------------------------------------------------------------- layout */
  const L = { W: 0, H: 0, S: 1, cx: 0, cy: 0, nameH: 0 }
  let velvetTimer = 0
  const layout = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    if (W === L.W && H === L.H) return
    L.W = W
    L.H = H
    clearTimeout(velvetTimer)
    velvetTimer = setTimeout(() => paintVelvet(velvet, W, H, Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25)), L.painted ? 120 : 0)
    L.painted = true

    // the open rose's radius
    const S = Math.min(W * 0.42, H * 0.235)
    L.S = S
    L.cx = W / 2
    L.cy = H * 0.46
    Object.assign(rose.style, { left: `${L.cx - S}px`, top: `${L.cy - S}px`, width: `${S * 2}px`, height: `${S * 2}px` })
    Object.assign(spot.style, { left: `${L.cx - S * 2.2}px`, top: `${L.cy - S * 2}px`, width: `${S * 4.4}px`, height: `${S * 4}px` })

    // names above and below the bloom, clear of the date caption
    const maxW = Math.min(W * 0.84, H * 0.95)
    const widest = Math.max(textWidth(first, 'italic 500 100px "Cormorant Garamond", Georgia, serif'), textWidth(second, 'italic 500 100px "Cormorant Garamond", Georgia, serif'))
    const size = Math.min(H * 0.085, (maxW * 100) / Math.max(widest, 1) / 1.06)
    nameNodes.forEach((node, i) => {
      node.style.fontSize = `${size.toFixed(1)}px`
      node.style.top = `${(i === 0 ? L.cy - S * 1.08 - size * 0.55 : L.cy + S * 1.0 + size * 0.6).toFixed(1)}px`
    })
    L.nameH = size

    // candles flank the rose at the edges
    const cw = Math.max(16, Math.min(W, H) * 0.055)
    const x = Math.max(W * 0.05, W / 2 - H * 0.78)
    candles.forEach((c) => {
      const left = c.side < 0 ? x : W - x
      const height = H * 0.4
      Object.assign(c.candle.style, { left: `${left}px`, width: `${cw}px`, height: `${height}px` })
      Object.assign(c.flame.style, { width: `${cw * 0.62}px`, height: `${cw * 1.55}px`, marginLeft: `${-cw * 0.31}px`, marginBottom: `${cw * 0.02}px` })
      c.fx = left
      c.fy = H * 1.02 - height - cw * 0.9
      c.cw = cw
      const pool = Math.max(W, H) * 0.55
      Object.assign(c.pool.style, { left: `${left - pool / 2}px`, top: `${c.fy - pool / 2}px`, width: `${pool}px`, height: `${pool}px` })
      Object.assign(c.glow.style, { left: `${left}px`, top: `${c.fy}px`, width: `${cw * 9}px`, height: `${cw * 9}px` })
    })
  }
  const observer = new ResizeObserver(layout)
  observer.observe(host)
  layout()

  /* ----------------------------------------------------------------- loop */
  const state = { px: 0, py: 0, bloom: 0, glow: 0, names: 0, rise: 0, flare: 0, sheen: -1 }
  const smooth = (x) => {
    const t = Math.min(1, Math.max(0, x))
    return t * t * (3 - 2 * t)
  }
  const lerp = (a, b, t) => a + (b - a) * t

  const stop = loop((dt, t) => {
    // the bloom: each petal unfurls on its own schedule, outside-in
    const sway = Math.sin(t * 0.4) * 2.2
    for (let i = 0; i < petals.length; i += 1) {
      const p = petals[i]
      let o = smooth((state.bloom - p.start) / 0.5)
      o = Math.min(1, o + (1 - o) * 0.035 * (0.5 + 0.5 * Math.sin(t * 0.9 + i)))
      const angle = p.angle + p.twist * (1 - o) + sway
      const r = lerp(p.rc, p.r, o)
      const sy = p.L * lerp(p.sc, 1, o)
      const sx = p.W * lerp(p.sc * 0.82, 1, o)
      let prefix = ''
      if (p.fall >= 0) {
        p.fall += dt
        const f = p.fall
        // drift outward, tumble and drop out of frame (rose units)
        const drop = 0.35 * f * f + 0.25 * f
        const drift = Math.sin(f * 1.9 + p.fallSeed * 6) * 0.18 * f
        const rad = (angle * Math.PI) / 180
        const dirX = Math.sin(rad)
        const dirY = -Math.cos(rad)
        const mid = r + sy * 0.5
        const dx = drift + dirX * 0.22 * f
        const dy = drop + dirY * 0.22 * f
        const spin = f * 70 * (p.fallSeed > 0.5 ? 1 : -1)
        prefix = `translate(${dx.toFixed(4)} ${dy.toFixed(4)}) rotate(${spin.toFixed(2)} ${(dirX * mid).toFixed(4)} ${(dirY * mid).toFixed(4)})`
      }
      p.g.setAttribute('transform', `${prefix} rotate(${angle.toFixed(2)}) translate(0 ${(-r).toFixed(4)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`)
      p.shade.setAttribute('opacity', (0.55 * (1 - o) + 0.06).toFixed(3))
    }
    if (heartGroup) heartGroup.glow.setAttribute('opacity', (state.glow * (0.85 + 0.15 * Math.sin(t * 2.1))).toFixed(3))
    const breathe = 1 + 0.008 * Math.sin(t * 0.9)
    rose.style.transform = `translate3d(${(state.px * 5).toFixed(1)}px,${(state.py * 4).toFixed(1)}px,0) scale(${breathe.toFixed(4)})`

    // candlelight: layered sines, no per-frame randomness
    for (let i = 0; i < candles.length; i += 1) {
      const c = candles[i]
      const s = c.seed
      const f = (0.84 + 0.08 * Math.sin(t * 9.3 + s) + 0.05 * Math.sin(t * 23.1 + s * 2) + 0.04 * Math.sin(t * 4.7 + s * 5)) * (1 + state.flare * 0.25)
      const lean = Math.sin(t * 1.7 + s) * 3 + Math.sin(t * 5.3 + s * 3) * 1.5 - state.px * 4
      c.flame.style.transform = `rotate(${lean.toFixed(2)}deg) scale(${(0.92 + 0.08 * f).toFixed(3)},${f.toFixed(3)})`
      c.glow.style.opacity = (0.7 + 0.3 * f).toFixed(3)
      c.glow.style.transform = `translate(-50%,-50%) scale(${(0.9 + 0.12 * f).toFixed(3)})`
      c.pool.style.opacity = (0.55 + 0.35 * f).toFixed(3)
    }

    // names
    nameNodes.forEach((node, i) => {
      node.style.opacity = state.names.toFixed(3)
      const dy = (1 - state.names) * L.nameH * (i === 0 ? -0.45 : 0.45)
      node.style.transform = `translate(-50%,calc(-50% + ${dy.toFixed(1)}px))`
      node.style.setProperty('--sheen', `${(state.sheen < 0 ? 130 : lerp(130, -30, state.sheen)).toFixed(1)}%`)
    })

    // the view rises over the bloom and leans in
    world.style.transform = state.rise > 0 ? `translate3d(0,${(state.rise * L.H * 0.035).toFixed(1)}px,0) scale(${(1 + state.rise * 0.12).toFixed(4)})` : ''
  })

  /* ----------------------------------------------------------------- open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(state, { flare: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .to(state, { flare: 0, duration: 1.4, ease: 'power2.inOut' }, 0.4)
      // petals unfurl outside-in, the heart glows
      .to(state, { bloom: 1, duration: 2.6, ease: 'sine.inOut' }, 0)
      .to(state, { glow: 1, duration: 1.2, ease: 'power2.out' }, 1.4)
    // a few outer petals let go and fall in front of the bloom
    fallers.forEach((p, i) =>
      timeline.call(
        () => {
          p.fall = 0
          rose.appendChild(p.g)
        },
        null,
        1.6 + i * 0.3,
      ),
    )
    timeline
      .to(state, { names: 1, duration: 1.2, ease: 'power2.out' }, 2.1)
      .set(state, { sheen: 0 }, 2.3)
      .to(state, { sheen: 1, duration: 1.4, ease: 'sine.inOut' }, 2.3)
      .call(() => setCaption?.('date'), null, 2.9)
      .to(state, { rise: 1, duration: 1.5, ease: 'power2.inOut' }, 3.3)
  }

  return {
    open,
    skip: () => {
      if (!timeline) open()
      timeline.progress(1)
    },
    setPointer: (x, y) => {
      state.px = x
      state.py = y
    },
    dispose: () => {
      timeline?.kill()
      stop()
      clearTimeout(velvetTimer)
      observer.disconnect()
      root.remove()
    },
  }
}
