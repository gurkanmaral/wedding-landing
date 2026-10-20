// Royal Garden — "The rose opens". An illustrated garden rose (cupped, many
// petals in a tight spiral) as a bud on draped black velvet, lit by two
// candles. Opening: the petals unfurl from the outside in, revealing a
// gold-foil monogram in the heart; a few small curled petals drift down beside
// the bloom; the couple's names appear in gilded Cormorant Garamond italic
// below it (the date sits at the top) and the view rises over the bloom.
// Built from DOM, SVG and canvas only (no WebGL).
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
${s} .name .amp{font-size:.7em;margin:0 .2em;font-weight:400}
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

// Unit cupped petal: base at the origin, broad rounded rim toward -y.
const PETAL = 'M0 0C.35 -.02 .95 -.3 .98 -.62C1 -.9 .55 -1.04 0 -1C-.55 -1.04 -1 -.9 -.98 -.62C-.95 -.3 -.35 -.02 0 0Z'
// The rim rolled back on itself, catching the light.
const LIP = 'M.94 -.66C.86 -.95 .4 -1.03 0 -1C-.4 -1.03 -.86 -.95 -.94 -.66C-.72 -.84 -.36 -.88 0 -.86C.36 -.88 .72 -.84 .94 -.66Z'
const GOLDEN = 137.508

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
  // viewBox unit = open radius of the bloom
  const rose = svgEl('svg', { class: 'rose', viewBox: '-1.15 -1.15 2.3 2.3' }, world)
  const defs = svgEl('defs', {}, rose)
  defs.innerHTML = `
<radialGradient id="${id}pb" cx=".5" cy="1" r="1.04">
  <stop offset="0" stop-color="#22020a"/><stop offset=".28" stop-color="#4f061b"/><stop offset=".58" stop-color="#8a0f35"/>
  <stop offset=".8" stop-color="#ad1b45"/><stop offset=".92" stop-color="#c7355f"/><stop offset=".975" stop-color="#b52650"/><stop offset="1" stop-color="#7c0b2b"/></radialGradient>
<radialGradient id="${id}ps" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#ffb3c4" stop-opacity=".2"/><stop offset="1" stop-color="#ff8fab" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}sh" cx=".5" cy=".75" r=".62"><stop offset="0" stop-color="#050001" stop-opacity=".75"/><stop offset=".7" stop-color="#050001" stop-opacity=".35"/><stop offset="1" stop-color="#050001" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc2cf" stop-opacity=".7"/><stop offset=".55" stop-color="#e2557a" stop-opacity=".35"/><stop offset="1" stop-color="#b01c47" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}hh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3c0715"/><stop offset=".7" stop-color="#1c0208"/><stop offset="1" stop-color="#0a0003"/></radialGradient>
<radialGradient id="${id}hg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd690" stop-opacity=".5"/><stop offset=".5" stop-color="#ff9f6a" stop-opacity=".16"/><stop offset="1" stop-color="#ff9f6a" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}cl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb070" stop-opacity=".22"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}mg" x1="0" y1="0" x2=".9" y2="1">
  <stop offset="0" stop-color="#8a6322"/><stop offset=".25" stop-color="#f3d27f"/><stop offset=".38" stop-color="#fff2c2"/><stop offset=".55" stop-color="#c39040"/><stop offset=".78" stop-color="#efcc7c"/><stop offset="1" stop-color="#83591b"/></linearGradient>
<pattern id="${id}mf" patternUnits="userSpaceOnUse" width="60" height="60"><image href="${foil}" width="60" height="60"/></pattern>
<path id="${id}p" d="${PETAL}"/>
<path id="${id}l" d="${LIP}"/>`

  // the heart: dark hollow, warm glow and the gold-foil monogram (under every petal)
  const heart = svgEl('g', {}, rose)
  svgEl('circle', { r: '.24', fill: `url(#${id}hh)` }, heart)
  const heartGlow = svgEl('circle', { r: '.36', fill: `url(#${id}hg)`, opacity: '0' }, heart)
  {
    const mono = svgEl('g', { transform: 'scale(.0155)' }, heart)
    const locale = template.lang === 'tr' ? 'tr-TR' : 'en-GB'
    const initial = (name) => (Array.from(String(name ?? '').trim())[0] ?? '').toLocaleUpperCase(locale)
    const layer = (fill, dx, dy, opacity = 1) => {
      const g = svgEl('g', { fill, transform: `translate(${dx} ${dy})`, opacity: String(opacity) }, mono)
      svgEl('circle', { r: '12.8', fill: 'none', stroke: fill, 'stroke-width': '.8' }, g)
      svgEl('circle', { r: '11.4', fill: 'none', stroke: fill, 'stroke-width': '.35' }, g)
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
    layer('#120800', 0.35, 0.5, 0.8)
    layer('#fff4cf', -0.22, -0.22, 0.6)
    layer(`url(#${id}mg)`, 0, 0)
    layer(`url(#${id}mf)`, 0, 0)
  }

  // petals in phyllotaxis order: outermost drawn first, the tight spiral last
  const N = small ? 46 : 60
  const random = seeded(19)
  const petals = []
  for (let i = N - 1; i >= 0; i -= 1) {
    const t = i / (N - 1) // 0 = innermost .. 1 = outermost
    const g = svgEl('g', {}, rose)
    // soft shadow cast on the ring below, body, velvet sheen, darkening, rolled lip
    svgEl('use', { href: `#${id}p`, fill: `url(#${id}sh)`, transform: 'translate(0 .05) scale(1.16 1.1)' }, g)
    svgEl('use', { href: `#${id}p`, fill: `url(#${id}pb)` }, g)
    svgEl('use', { href: `#${id}p`, fill: `url(#${id}ps)` }, g)
    const shade = svgEl('use', { href: `#${id}p`, fill: '#160109', opacity: '.4' }, g)
    const lip = t > 0.4 ? svgEl('use', { href: `#${id}l`, fill: `url(#${id}lp)`, opacity: '0' }, g) : null
    const jitter = 0.92 + random() * 0.16
    petals.push({
      g,
      shade,
      lip,
      t,
      angle: i * GOLDEN + (random() - 0.5) * 8,
      // open: cupped rings around the heart; closed: a tight spiral bud
      r: 0.2 + 0.38 * Math.pow(t, 0.85),
      L: (0.12 + 0.37 * t) * jitter,
      W: (0.11 + 0.25 * t) * jitter,
      rc: 0.015 + 0.17 * t,
      sc: 1.9 + (0.62 - 1.9) * t,
      twist: 30 + 30 * (1 - t),
      start: (1 - t) * 0.55 + random() * 0.04,
      dark: 0.2 * (1 - t),
    })
  }

  // candlelight falling on the bloom from both sides
  svgEl('circle', { cx: '-.75', cy: '.05', r: '.9', fill: `url(#${id}cl)`, style: 'mix-blend-mode:screen' }, rose)
  svgEl('circle', { cx: '.75', cy: '.05', r: '.9', fill: `url(#${id}cl)`, style: 'mix-blend-mode:screen' }, rose)

  // a few small, curled petals that drift down beside the bloom
  const fallen = [235, 122, 302].map((deg, i) => {
    const g = svgEl('g', { opacity: '0' }, rose)
    svgEl('use', { href: `#${id}p`, fill: `url(#${id}sh)`, transform: 'translate(0 .06) scale(1.1)' }, g)
    svgEl('use', { href: `#${id}p`, fill: `url(#${id}pb)` }, g)
    svgEl('use', { href: `#${id}l`, fill: `url(#${id}lp)`, opacity: '.8' }, g)
    const rad = (deg * Math.PI) / 180
    return { g, x: Math.sin(rad) * 0.95, y: -Math.cos(rad) * 0.95, f: -1, seed: i * 1.7 + 0.4, spin: i % 2 ? -1 : 1 }
  })

  /* ---------------------------------------------------------------- names */
  const [first, second] = template.couple
  const names = el('div', 'name', world)
  el('span', 'gold', names, first)
  el('span', 'gold amp', names, '&')
  el('span', 'gold', names, second)

  /* --------------------------------------------------------------- layout */
  const L = { W: 0, H: 0, R: 1, nameH: 0, painted: false }
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

    // open bloom ≈ 60% of the short side, closed bud ≈ 28%
    const short = Math.min(W, H)
    const R = Math.min(short * 0.285, H * 0.27, W * 0.45)
    L.R = R
    const cx = W / 2
    const cy = H * (W > H ? 0.49 : 0.46)
    const box = R * 2.3
    Object.assign(rose.style, { left: `${cx - box / 2}px`, top: `${cy - box / 2}px`, width: `${box}px`, height: `${box}px` })
    Object.assign(spot.style, { left: `${cx - R * 2.4}px`, top: `${cy - R * 2.2}px`, width: `${R * 4.8}px`, height: `${R * 4.4}px` })

    // names on one line below the bloom; the date caption sits at the top
    const probe = (size) => `italic 500 ${size}px "Cormorant Garamond", Georgia, serif`
    const line = textWidth(`${first}${second}`, probe(100)) + textWidth('&', probe(70)) + 60
    const size = Math.min(H * 0.075, (W * 0.86 * 100) / Math.max(line, 1))
    names.style.fontSize = `${size.toFixed(1)}px`
    const y = Math.min(cy + R * 1.08 + H * 0.035 + size * 0.6, H * 0.9 - size * 0.6)
    names.style.top = `${y.toFixed(1)}px`
    L.nameH = size

    // candles flank the bloom at the edges
    const cw = Math.max(16, short * 0.055)
    const x = Math.max(W * 0.05, W / 2 - H * 0.78)
    candles.forEach((c) => {
      const left = c.side < 0 ? x : W - x
      const height = H * 0.4
      Object.assign(c.candle.style, { left: `${left}px`, width: `${cw}px`, height: `${height}px` })
      Object.assign(c.flame.style, { width: `${cw * 0.62}px`, height: `${cw * 1.55}px`, marginLeft: `${-cw * 0.31}px`, marginBottom: `${cw * 0.02}px` })
      const fy = H * 1.02 - height - cw * 0.9
      const pool = Math.max(W, H) * 0.55
      Object.assign(c.pool.style, { left: `${left - pool / 2}px`, top: `${fy - pool / 2}px`, width: `${pool}px`, height: `${pool}px` })
      Object.assign(c.glow.style, { left: `${left}px`, top: `${fy}px`, width: `${cw * 9}px`, height: `${cw * 9}px` })
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
    const sway = Math.sin(t * 0.4) * 1.8
    for (let i = 0; i < petals.length; i += 1) {
      const p = petals[i]
      let o = smooth((state.bloom - p.start) / 0.45)
      o = Math.min(1, o + (1 - o) * 0.03 * p.t * (0.5 + 0.5 * Math.sin(t * 0.9 + i)))
      const angle = p.angle + p.twist * (1 - o) + sway
      const r = lerp(p.rc, p.r, o)
      const s = lerp(p.sc, 1, o)
      p.g.setAttribute(
        'transform',
        `rotate(${angle.toFixed(2)}) translate(0 ${(-r).toFixed(4)}) scale(${(p.W * s * lerp(0.86, 1, o)).toFixed(4)} ${(p.L * s).toFixed(4)})`,
      )
      p.shade.setAttribute('opacity', (p.dark + 0.32 * (1 - o)).toFixed(3))
      if (p.lip) p.lip.setAttribute('opacity', (0.15 + 0.7 * o).toFixed(3))
    }
    heartGlow.setAttribute('opacity', (state.glow * (0.85 + 0.15 * Math.sin(t * 2.1))).toFixed(3))

    for (let i = 0; i < fallen.length; i += 1) {
      const p = fallen[i]
      if (p.f < 0) continue
      p.f += dt
      const f = p.f
      const out = Math.sign(p.x) || 1
      const x = p.x + out * (0.22 * f + 0.08 * Math.sin(f * 1.8 + p.seed))
      const y = p.y + 0.2 * f * f + 0.18 * f
      const curl = 0.35 + 0.65 * Math.abs(Math.cos(f * 2.1 + p.seed))
      p.g.setAttribute('opacity', Math.min(1, f * 3).toFixed(3))
      p.g.setAttribute(
        'transform',
        `translate(${x.toFixed(4)} ${y.toFixed(4)}) rotate(${(p.spin * (40 + f * 75)).toFixed(2)}) scale(${(0.15 * curl).toFixed(4)} .26) translate(0 .5)`,
      )
    }

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
    names.style.opacity = state.names.toFixed(3)
    names.style.transform = `translate(-50%,calc(-50% + ${((1 - state.names) * L.nameH * 0.45).toFixed(1)}px))`
    names.style.setProperty('--sheen', `${(state.sheen < 0 ? 130 : lerp(130, -30, state.sheen)).toFixed(1)}%`)

    // the view rises over the bloom and leans in
    world.style.transform = state.rise > 0 ? `translate3d(0,${(state.rise * L.H * 0.03).toFixed(1)}px,0) scale(${(1 + state.rise * 0.1).toFixed(4)})` : ''
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
    // small petals let go at the rim and drift down beside the bloom
    fallen.forEach((p, i) => timeline.call(() => (p.f = 0), null, 1.5 + i * 0.35))
    timeline
      .to(state, { names: 1, duration: 1.2, ease: 'power2.out' }, 2.1)
      .set(state, { sheen: 0 }, 2.3)
      .to(state, { sheen: 1, duration: 1.4, ease: 'sine.inOut' }, 2.3)
      .call(() => setCaption?.('date', 'top'), null, 2.9)
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
