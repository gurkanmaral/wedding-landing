// Art Deco — "The gilded gates". An illustrated, full-screen pair of black
// lacquer and emerald gates with fine gold-foil Deco ornament (sunburst fan,
// stepped chevrons, pinstripes, fluted rods) and a faceted emerald-cut stone
// as the lock. Opening: the stone turns and flashes, eleven beams fan out, the
// gates swing away in CSS 3D perspective into emerald space with gold dust,
// and the couple's names rise in gilded Playfair Display.
// Built from DOM, SVG and canvas only (no WebGL).
import { gsap } from 'gsap'
import { foilTile, grainTile, svgURL, el, sceneRoot, loop, seeded, textWidth } from '../foil.js'

export const fonts = () => [
  { family: 'Playfair Display', weight: 500, google: 'Playfair+Display:ital,wght@0,400;0,500;1,400;1,500' },
  { family: 'Playfair Display', weight: 400, style: 'italic' },
]

export const copy = {
  en: { prompt: 'Open the gates', open: 'Open the gates' },
  tr: { prompt: 'Kapıları açın', open: 'Kapıları açın' },
}

const OPEN_DEG = 104
const GOLD_STOPS = [
  [0, '#7a5418'],
  [0.16, '#e6bf68'],
  [0.27, '#fff0bb'],
  [0.4, '#c8953f'],
  [0.56, '#8d6522'],
  [0.72, '#efcd7a'],
  [0.86, '#b88a36'],
  [1, '#7d5719'],
]

const css = (s, id) => `
${s}{position:absolute;inset:0;overflow:hidden;background:#020403;contain:strict;user-select:none;-webkit-user-select:none}
${s} .world{position:absolute;inset:0;transform-origin:50% 50%;will-change:transform}
${s} .space{position:absolute;inset:-8%;background:
  repeating-conic-gradient(from 0deg at 50% 47%,rgba(240,200,120,.075) 0deg 1.1deg,transparent 1.1deg 7.5deg),
  radial-gradient(64% 56% at 50% 47%,#1d8a67 0%,#0d5442 30%,#04271e 68%,#020e0b 100%)}
${s} .space::after{content:'';position:absolute;inset:0;background-image:var(--${id}-grain);opacity:.55}
${s} .rings{position:absolute;left:50%;top:47%;width:150vmax;height:150vmax;transform:translate(-50%,-50%);border-radius:50%;
  background:repeating-radial-gradient(circle,transparent 0 7.2vmax,rgba(230,190,110,.07) 7.2vmax 7.35vmax)}
${s} canvas.dust{position:absolute;inset:0;width:100%;height:100%}
${s} .names{position:absolute;left:50%;top:0;transform:translate(-50%,-50%);text-align:center;white-space:nowrap;
  font-family:'Playfair Display','Didot','Bodoni 72',Georgia,serif;font-weight:500;line-height:1.04;letter-spacing:.01em;
  filter:drop-shadow(0 1px 0 #6b4a16) drop-shadow(0 2px 0 #4a320c) drop-shadow(0 12px 22px rgba(0,0,0,.55));opacity:0;
  --sheen:130%}
${s} .names span{display:inline-block;padding:0 .04em}
${s} .names .amp{font-style:italic;font-weight:400;font-size:.66em;margin:0 .22em}
${s} .names.stacked span{display:block}
${s} .names.stacked .amp{margin:.06em 0}
${s} .gold{background-image:linear-gradient(100deg,rgba(255,255,255,0) 44%,rgba(255,251,232,.95) 50%,rgba(255,255,255,0) 56%),
  var(--${id}-foil),linear-gradient(180deg,#fff2bf 0%,#efc96f 28%,#b98535 52%,#f3d68c 72%,#a8772c 100%);
  background-size:320% 100%,180px 180px,100% 100%;background-position:var(--sheen) 0,0 0,0 0;background-repeat:no-repeat,repeat,no-repeat;
  -webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
${s} .gates{position:absolute;inset:0}
${s} .leaf{position:absolute;top:0;height:100%;transform-style:preserve-3d;will-change:transform}
${s} .leaf.l{transform-origin:0 50%}
${s} .leaf.r{transform-origin:100% 50%}
${s} .face{position:absolute;inset:0;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden}
${s} .back{transform:rotateY(180deg);background:linear-gradient(90deg,#050605,#121413 50%,#050605);box-shadow:inset 0 0 0 2px #8d6522,inset 0 0 0 5px #050605,inset 0 0 0 6px #6b4a16}
${s} .inner{position:absolute;inset:0}
${s} .leaf.r .inner{transform:scaleX(-1)}
${s} .lacquer,${s} .wall{background:
  linear-gradient(112deg,rgba(255,255,255,0) calc(var(--rx) - 16%),rgba(255,255,255,.075) var(--rx),rgba(255,255,255,0) calc(var(--rx) + 14%)),
  radial-gradient(130% 90% at 30% 18%,#1b1d1c 0%,#0a0b0a 55%,#030303 100%)}
${s} .lacquer{position:absolute;inset:0}
${s} .lacquer::after,${s} .field::after,${s} .wall::after{content:'';position:absolute;inset:0;background-image:var(--${id}-grain);opacity:.6;pointer-events:none}
${s} .field{position:absolute;background:
  linear-gradient(112deg,rgba(255,255,255,0) calc(var(--rx) - 14%),rgba(190,255,225,.09) var(--rx),rgba(255,255,255,0) calc(var(--rx) + 12%)),
  radial-gradient(120% 70% at 70% 40%,#0c5a45 0%,#06392c 50%,#03221a 100%)}
${s} svg.art{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
${s} .sheen{position:absolute;inset:0;overflow:hidden;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}
${s} .sheen i{position:absolute;top:-10%;bottom:-10%;left:0;width:70%;
  background:linear-gradient(100deg,rgba(255,246,214,0) 28%,rgba(255,246,214,.18) 40%,rgba(255,252,236,.95) 50%,rgba(255,246,214,.18) 60%,rgba(255,246,214,0) 72%)}
${s} .wall{position:absolute;top:0;height:100%;overflow:hidden}
${s} .wall.right .inner{transform:scaleX(-1)}
${s} .beams{position:absolute;left:0;top:0;width:0;height:0}
${s} .beams b{position:absolute;bottom:0;transform-origin:50% 100%;mix-blend-mode:screen;
  background:linear-gradient(to top,rgba(255,240,200,.95),rgba(255,226,160,.4) 38%,rgba(255,220,150,0));
  clip-path:polygon(47% 100%,53% 100%,100% 0,0 0)}
${s} .gem{position:absolute;left:0;top:0;will-change:transform;filter:drop-shadow(0 .6vmin 1.4vmin rgba(0,0,0,.6))}
${s} .gem svg{display:block;width:100%;height:100%;overflow:visible}
${s} .flash{position:absolute;left:50%;top:50%;width:300%;height:300%;transform:translate(-50%,-50%);border-radius:50%;opacity:0;
  background:radial-gradient(circle,rgba(255,255,245,1) 0%,rgba(200,255,230,.55) 14%,rgba(255,214,140,.18) 38%,rgba(255,214,140,0) 66%);mix-blend-mode:screen;pointer-events:none}
`

// Gold layering for an ornament <g>: cast shadow, bright bevel edge, gold bands, foil crinkle.
function goldSVG({ id, width, height, paths, foil, lift }) {
  const stops = GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')
  const body = paths.map((d) => `<path d="${d}" fill-rule="evenodd"/>`).join('')
  return `<svg class="art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
<defs>
<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${(width * 0.9).toFixed(1)}" y2="${(height * 0.55).toFixed(1)}">${stops}</linearGradient>
<pattern id="${id}f" patternUnits="userSpaceOnUse" width="180" height="180"><image href="${foil}" width="180" height="180"/></pattern>
<g id="${id}o">${body}</g>
</defs>
<use href="#${id}o" fill="#0d0700" opacity=".8" transform="translate(${lift.toFixed(2)} ${(lift * 1.5).toFixed(2)})"/>
<use href="#${id}o" fill="#fff5d0" opacity=".6" transform="translate(${(-lift * 0.45).toFixed(2)} ${(-lift * 0.45).toFixed(2)})"/>
<use href="#${id}o" fill="url(#${id}g)"/>
<use href="#${id}o" fill="url(#${id}f)"/>
</svg>`
}

const maskURL = (width, height, paths) =>
  svgURL(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><g fill="#fff">${paths
      .map((d) => `<path d="${d}" fill-rule="evenodd"/>`)
      .join('')}</g></svg>`,
  )

/* ------------------------------------------------------------- ornament */

// One gate leaf in its own pixels: hinge at x = 0, meeting edge at x = w.
// Math coordinates (y up from the vertical centre) are converted on output.
function leafOrnament(w, h, H, gw, gy) {
  const k = Math.min(w, H * 0.48)
  const f = (n) => n.toFixed(1)
  const Y = (y) => h / 2 - y
  const P = (pts) => `M${pts.map(([x, y]) => `${f(x)} ${f(Y(y))}`).join('L')}Z`
  const R = (x0, y0, x1, y1) => P([[x0, y0], [x1, y0], [x1, y1], [x0, y1]])
  const paths = []

  // outer frame, slimmer along the meeting edge
  const e = 0.03 * k
  paths.push(R(0, -h / 2, w, h / 2) + R(e, -h / 2 + e, w - e * 0.4, h / 2 - e))

  // emerald field with two pinstripes
  const fx0 = 0.09 * k
  const fx1 = w - 0.032 * k
  const fy = h / 2 - 0.09 * k
  const ring = (x0, y0, x1, y1, t) => R(x0, y0, x1, y1) + R(x0 + t, y0 + t, x1 - t, y1 - t)
  paths.push(ring(fx0 - 0.022 * k, -fy - 0.022 * k, fx1 + 0.016 * k, fy + 0.022 * k, Math.max(1, 0.006 * k)))
  paths.push(ring(fx0 + 0.03 * k, -fy + 0.03 * k, fx1 - 0.02 * k, fy - 0.03 * k, Math.max(0.8, 0.0035 * k)))

  // fluted rods by the hinge
  const rodW = Math.max(1.2, 0.011 * k)
  const rodX = [0, 1, 2].map((i) => fx0 + 0.075 * k + i * 0.05 * k)
  rodX.forEach((x) => paths.push(R(x - rodW / 2, -fy + 0.06 * k, x + rodW / 2, fy - 0.06 * k)))
  const freeX = rodX[2] + 0.05 * k

  // half sunburst rising from the meeting edge
  const Rf = Math.min(0.88 * (w - freeX), 0.26 * H)
  const yF = H * 0.43 - Rf
  const cx = w
  const cy = Y(yF)
  const disc = (r) => `M${f(cx)} ${f(cy)}L${f(cx)} ${f(cy - r)}A${f(r)} ${f(r)} 0 0 0 ${f(cx - r)} ${f(cy)}Z`
  const band = (ri, ro) =>
    `M${f(cx)} ${f(cy - ro)}A${f(ro)} ${f(ro)} 0 0 0 ${f(cx - ro)} ${f(cy)}L${f(cx - ri)} ${f(cy)}A${f(ri)} ${f(ri)} 0 0 1 ${f(cx)} ${f(cy - ri)}Z`
  const r0 = Rf * 0.26
  paths.push(disc(r0))
  paths.push(band(r0 * 1.12, r0 * 1.2))
  paths.push(band(Rf * 1.04, Rf * 1.058))
  const pt = (r, a) => [w + Math.cos(a) * r, yF + Math.sin(a) * r]
  for (let j = 0; j < 7; j += 1) {
    const a = Math.PI / 2 + (j * Math.PI) / 12
    const len = j % 2 === 0 ? Rf : Rf * 0.78
    const ri = r0 * 1.32
    paths.push(
      P(
        j === 0
          ? [pt(ri, a), pt(len, a), pt(len, a + 0.05), pt(ri, a + 0.013)]
          : [pt(ri, a - 0.013), pt(len, a - 0.05), pt(len, a + 0.05), pt(ri, a + 0.013)],
      ),
    )
  }

  // stepped octagonal escutcheon halves around the stone
  const half = (o) => {
    const A = 0.5 * gw + o
    const B = 0.66 * gw + o
    const C = 0.16 * gw + 0.414 * o
    return [[0, B], [-(A - C), B], [-A, B - C], [-A, -(B - C)], [-(A - C), -B], [0, -B]]
  }
  const shift = (pts) => pts.map(([x, y]) => [x + w, y + gy])
  const cRing = (o1, o2) => P(shift([...half(o2), ...half(o1).reverse()]))
  paths.push(cRing(0.03 * gw, 0.11 * gw))
  paths.push(cRing(0.15 * gw, 0.17 * gw))
  paths.push(cRing(0.21 * gw, 0.222 * gw))
  const plateA = 0.722 * gw
  const railX1 = w - plateA - 0.02 * k
  if (railX1 - freeX > 6) {
    const t = Math.max(1, 0.006 * k)
    for (const dy of [-0.41 * gw, 0, 0.41 * gw]) paths.push(R(freeX, gy + dy - t, railX1, gy + dy + t))
  }

  // stepped chevrons
  const cw = fx1 - freeX + 0.02 * k
  const steps = 4
  const sx = cw / steps
  const sy = Math.min(sx * 0.62, (0.14 * H) / (steps - 1))
  const t = Math.min(sx, sy) * 0.4
  for (let c = 0; c < 4; c += 1) {
    const y0 = -0.2 * H - c * t * 2.3
    const upper = [[w, y0]]
    for (let i = 1; i <= steps; i += 1) {
      upper.push([w - i * sx, y0 - (i - 1) * sy])
      if (i < steps) upper.push([w - i * sx, y0 - i * sy])
    }
    const lower = [[w, y0 - t], ...upper.slice(1).map(([x, y]) => [x - t, y - t])]
    paths.push(P([...upper, ...lower.reverse()]))
  }

  return { paths, field: { left: fx0, width: fx1 - fx0, top: h / 2 - fy, height: fy * 2 }, k }
}

// Side wall (wide screens): stepped gold jamb at the opening and paired pilasters.
function wallOrnament(width, h, k, count) {
  const f = (n) => n.toFixed(1)
  const R = (x0, x1) => `M${f(x0)} 0L${f(x1)} 0L${f(x1)} ${f(h)}L${f(x0)} ${f(h)}Z`
  const paths = []
  for (let i = 0; i < 3; i += 1) {
    const x = width - 0.012 * k - i * 0.05 * k
    paths.push(R(x - (0.022 - i * 0.005) * k, x))
  }
  const step = Math.max(40, 0.3 * k)
  for (let i = 1; i <= count; i += 1) {
    const x = width - 0.2 * k - i * step
    if (x < 4) break
    const t = Math.max(1, 0.005 * k)
    paths.push(R(x - t, x), R(x - 0.03 * k - t, x - 0.03 * k))
  }
  return paths
}

// Emerald (octagonal step) cut seen face-on, unit coordinates, y down.
function buildGem(svgHost, foil, uid) {
  const A0 = 50
  const B0 = 66
  const C0 = 16
  const ring = (d) => {
    const A = A0 - d
    const B = B0 - d
    const c = Math.max(1, C0 - d * 0.414)
    return [[A, -(B - c)], [A - c, -B], [-A + c, -B], [-A, -(B - c)], [-A, B - c], [-A + c, B], [A - c, B], [A, B - c]]
  }
  const pts = (list) => list.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const normals = [45, 90, 135, 180, 225, 270, 315, 0].map((deg) => (deg * Math.PI) / 180)
  const insets = [0, 8, 15, 21]
  const stops = GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')
  const bezelOuter = ring(-7)
  const bezelInner = ring(-1)
  const facets = []
  let markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-64 -82 128 164">
<defs>
<linearGradient id="${uid}bg" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient>
<pattern id="${uid}bf" patternUnits="userSpaceOnUse" width="90" height="90"><image href="${foil}" width="90" height="90"/></pattern>
<radialGradient id="${uid}tg" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#7ff0c8" stop-opacity=".55"/><stop offset=".55" stop-color="#0f6e52" stop-opacity="0"/></radialGradient>
</defs>
<path d="M${pts(bezelOuter)}ZM${pts(bezelInner)}Z" fill-rule="evenodd" fill="#140b01" transform="translate(.8 1.2)"/>
<path d="M${pts(bezelOuter)}ZM${pts(bezelInner)}Z" fill-rule="evenodd" fill="url(#${uid}bg)"/>
<path d="M${pts(bezelOuter)}ZM${pts(bezelInner)}Z" fill-rule="evenodd" fill="url(#${uid}bf)"/>`
  for (let r = 0; r < 3; r += 1) {
    const outer = ring(insets[r])
    const inner = ring(insets[r + 1])
    for (let i = 0; i < 8; i += 1) {
      const j = (i + 1) % 8
      markup += `<polygon data-f="${r}-${i}" points="${pts([outer[i], outer[j], inner[j], inner[i]])}" stroke="rgba(200,255,232,.32)" stroke-width=".45" stroke-linejoin="round"/>`
    }
  }
  const table = ring(insets[3])
  markup += `<polygon data-t="1" points="${pts(table)}" stroke="rgba(200,255,232,.4)" stroke-width=".5"/>`
  // pavilion steps seen through the table
  for (const d of [27, 33, 39]) markup += `<polygon points="${pts(ring(d))}" fill="none" stroke="rgba(170,255,220,.16)" stroke-width=".6"/>`
  markup += `<path d="M${pts([table[1], ring(39)[1]])}M${pts([table[2], ring(39)[2]])}M${pts([table[5], ring(39)[5]])}M${pts([table[6], ring(39)[6]])}" stroke="rgba(170,255,220,.14)" stroke-width=".5"/>`
  markup += `<polygon points="${pts(table)}" fill="url(#${uid}tg)"/>`
  const star = (x, y, s) =>
    `M${x} ${y - s}Q${x + s * 0.12} ${y - s * 0.12} ${x + s} ${y}Q${x + s * 0.12} ${y + s * 0.12} ${x} ${y + s}Q${x - s * 0.12} ${y + s * 0.12} ${x - s} ${y}Q${x - s * 0.12} ${y - s * 0.12} ${x} ${y - s}Z`
  markup += `<path data-g="0" d="${star(-22, -40, 13)}" fill="#fffef6" opacity="0"/>`
  markup += `<path data-g="1" d="${star(30, 22, 10)}" fill="#fffef6" opacity="0"/>`
  markup += `</svg>`
  svgHost.innerHTML = markup
  const svg = svgHost.firstElementChild
  for (let r = 0; r < 3; r += 1) {
    for (let i = 0; i < 8; i += 1) facets.push({ node: svg.querySelector(`[data-f="${r}-${i}"]`), phi: normals[i], ring: r })
  }
  return {
    facets,
    table: svg.querySelector('[data-t]'),
    glints: [svg.querySelector('[data-g="0"]'), svg.querySelector('[data-g="1"]')],
  }
}

// emerald colour ramp, brightness 0..1
const DARK = [3, 34, 27]
const MID = [16, 118, 90]
const BRIGHT = [140, 246, 206]
function emerald(b) {
  const [a, c, t] = b < 0.6 ? [DARK, MID, b / 0.6] : [MID, BRIGHT, (b - 0.6) / 0.4]
  return `rgb(${(a[0] + (c[0] - a[0]) * t) | 0},${(a[1] + (c[1] - a[1]) * t) | 0},${(a[2] + (c[2] - a[2]) * t) | 0})`
}

/* ---------------------------------------------------------------- scene */

export default function create(host, template, { onOpened, setCaption }) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const foil = foilTile(256, 7)
  const grain = grainTile(180, 3)
  const { root, id } = sceneRoot(host, 'deco', css)
  root.style.setProperty(`--${id}-grain`, `url(${grain})`)
  root.style.setProperty(`--${id}-foil`, `url(${foil})`)
  root.style.setProperty('--rx', '40%')

  const world = el('div', 'world', root)
  el('div', 'space', world)
  el('div', 'rings', world)
  const dustCanvas = el('canvas', 'dust', world)
  const dctx = dustCanvas.getContext('2d')

  // names (text nodes only, never HTML: they may come from the API)
  const [first, second] = template.couple
  const names = el('div', 'names', world)
  el('span', 'gold', names, first)
  el('span', 'gold amp', names, '&')
  el('span', 'gold', names, second)

  const gates = el('div', 'gates', world)
  const leaves = ['l', 'r'].map((side) => {
    const leaf = el('div', `leaf ${side}`, gates)
    const front = el('div', 'face front', leaf)
    el('div', 'face back', leaf)
    const inner = el('div', 'inner', front)
    el('div', 'lacquer', inner)
    const field = el('div', 'field', inner)
    const art = el('div', '', inner)
    const sheen = el('div', 'sheen', inner)
    const band = el('i', '', sheen)
    return { leaf, field, art, sheen, band }
  })
  const walls = ['left', 'right'].map((side) => {
    const wall = el('div', `wall ${side}`, gates)
    const inner = el('div', 'inner', wall)
    return { wall, inner }
  })

  const beams = el('div', 'beams', world)
  const beamList = Array.from({ length: 11 }, (_, i) => {
    const beam = el('b', '', beams)
    beam.dataset.long = i % 2 === 0 ? '1' : '0.72'
    beam.dataset.angle = String((i * 360) / 11)
    return beam
  })

  const gemNode = el('div', 'gem', world)
  const gemSvg = el('div', '', gemNode)
  gemSvg.style.cssText = 'position:absolute;inset:0'
  const flash = el('div', 'flash', gemNode)
  const gem = buildGem(gemSvg, foil, `${id}gem`)

  /* --------------------------------------------------------------- dust */
  const dustCount = small ? 90 : 220
  const random = seeded(31)
  const dust = Array.from({ length: dustCount }, () => ({
    x: (random() - 0.5) * 3,
    y: (random() - 0.5) * 2,
    z: 0.3 + random() * 2.7,
    size: random() < 0.07 ? 2.6 + random() * 2.4 : 0.7 + random() * 1.3,
    phase: random() * 40,
  }))
  const sprite = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const ctx = c.getContext('2d')
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(255,248,220,1)')
    g.addColorStop(0.3, 'rgba(255,214,130,.55)')
    g.addColorStop(1, 'rgba(255,200,110,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 32, 32)
    return c
  })()

  /* ------------------------------------------------------------- layout */
  const L = { W: 1, H: 1, gateW: 1, gw: 1, gh: 1, gx: 0, gy: 0, finalY: 0, finalS: 0.5, dpr: 1 }
  const layout = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    if (W === L.W && H === L.H) return
    L.W = W
    L.H = H
    const gateW = Math.min(W, H * 1.25)
    const w = gateW / 2
    const gw = Math.min(0.3 * gateW, 0.17 * H)
    const gyMath = 0.02 * H
    Object.assign(L, { gateW, gw, gh: gw * 1.32, gx: W / 2, gy: H / 2 - gyMath })

    gates.style.perspective = `${Math.round(Math.max(W, H) * 1.25)}px`
    gates.style.perspectiveOrigin = '50% 50%'
    const { paths, field, k } = leafOrnament(w, H, H, gw, gyMath)
    const lift = Math.max(0.8, k * 0.004)
    leaves.forEach((leaf, i) => {
      leaf.leaf.style.width = `${w}px`
      leaf.leaf.style.left = `${(W - gateW) / 2 + i * w}px`
      Object.assign(leaf.field.style, {
        left: `${field.left}px`,
        top: `${field.top}px`,
        width: `${field.width}px`,
        height: `${field.height}px`,
      })
      leaf.art.innerHTML = goldSVG({ id: `${id}${i}`, width: w, height: H, paths, foil, lift })
      const mask = maskURL(w, H, paths)
      leaf.sheen.style.webkitMaskImage = mask
      leaf.sheen.style.maskImage = mask
      leaf.w = w
    })
    const wallW = Math.ceil((W - gateW) / 2) + 1
    walls.forEach((wall, i) => {
      wall.wall.style.display = wallW > 3 ? '' : 'none'
      wall.wall.style.width = `${wallW}px`
      wall.wall.style.left = i === 0 ? '0px' : `${W - wallW}px`
      wall.inner.innerHTML =
        wallW > 3 ? goldSVG({ id: `${id}w${i}`, width: wallW, height: H, paths: wallOrnament(wallW, H, k, small ? 4 : 10), foil, lift }) : ''
    })

    gemNode.style.width = `${gw}px`
    gemNode.style.height = `${L.gh}px`
    gemNode.style.marginLeft = `${-gw / 2}px`
    gemNode.style.marginTop = `${-L.gh / 2}px`

    // beams fan out from the lock
    beams.style.left = `${L.gx}px`
    beams.style.top = `${L.gy}px`
    const reach = Math.hypot(W, H) * 0.62
    beamList.forEach((beam) => {
      const long = Number(beam.dataset.long)
      beam.style.width = `${gw * 0.9 * long}px`
      beam.style.height = `${reach * long}px`
      beam.style.left = `${(-gw * 0.45 * long).toFixed(1)}px`
      beam.style.transform = `rotate(${beam.dataset.angle}deg)`
    })

    // names: stacked on tall screens, one line on wide ones
    const stacked = W / H < 1
    names.classList.toggle('stacked', stacked)
    const probe = (size) => `500 ${size}px "Playfair Display", Georgia, serif`
    let size
    if (stacked) {
      const widest = Math.max(textWidth(first, probe(100)), textWidth(second, probe(100)))
      size = Math.min(H * 0.082, (W * 0.84 * 100) / Math.max(widest, 1))
    } else {
      const line = textWidth(`${first}${second}`, probe(100)) + textWidth('&', `italic 400 66px "Playfair Display", Georgia, serif`) + 70
      size = Math.min(H * 0.105, (gateW * 0.84 * 100) / Math.max(line, 1))
    }
    names.style.fontSize = `${size.toFixed(1)}px`
    const nameY = H * 0.49
    L.nameY = nameY
    names.style.top = `${nameY}px`
    const namesH = names.offsetHeight || size * (stacked ? 2.8 : 1.1)
    const finalH = Math.min(H * 0.085, namesH * 0.42)
    L.finalS = finalH / L.gh
    L.finalY = nameY - namesH / 2 - finalH * 0.75

    L.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    dustCanvas.width = Math.round(W * L.dpr)
    dustCanvas.height = Math.round(H * L.dpr)
  }
  const observer = new ResizeObserver(layout)
  observer.observe(host)
  layout()

  /* --------------------------------------------------------------- loop */
  const state = { px: 0, py: 0, spin: 0, flash: 0, beams: 0, beamLen: 0, open: 0, lift: 0, names: 0, push: 0, rush: 0, sheen: -1 }
  const lerp = (a, b, t) => a + (b - a) * t

  const stop = loop((dt, t) => {
    const { W, H } = L
    // lacquer reflections drift with the pointer
    root.style.setProperty('--rx', `${(40 + state.px * 14).toFixed(1)}%`)

    // gold glint sweeps across the ornament every few seconds
    const u = (t % 5.5) / 5.5
    leaves.forEach((leaf) => {
      const x = u < 0.42 ? lerp(-0.8, 1.2, u / 0.42) : 2
      leaf.band.style.transform = `translate3d(${(x * leaf.w).toFixed(1)}px,0,0)`
    })

    // gates swing away from the viewer
    const deg = state.open * OPEN_DEG
    leaves[0].leaf.style.transform = `rotateY(${deg.toFixed(2)}deg)`
    leaves[1].leaf.style.transform = `rotateY(${(-deg).toFixed(2)}deg)`

    // the stone: light wheels round the facets (a slow turn), spins on open
    const light = t * 0.55 + state.spin * 0.05
    for (let i = 0; i < gem.facets.length; i += 1) {
      const facet = gem.facets[i]
      const c = Math.cos(facet.phi - light)
      const b = 0.16 + 0.62 * Math.pow(Math.max(0, c), 1.6) + facet.ring * 0.06 + state.flash * 0.35
      facet.node.setAttribute('fill', emerald(Math.min(1, b)))
    }
    gem.table.setAttribute('fill', emerald(Math.min(1, 0.4 + 0.18 * Math.sin(light * 1.3) + state.flash * 0.5)))
    gem.glints[0].setAttribute('opacity', Math.pow(Math.max(0, Math.cos(light - 2.3)), 12).toFixed(3))
    gem.glints[1].setAttribute('opacity', Math.pow(Math.max(0, Math.cos(light + 0.6)), 12).toFixed(3))
    const gx = L.gx + state.px * 6 * (1 - state.lift)
    const gy = lerp(L.gy, L.finalY, state.lift) + state.py * 4 * (1 - state.lift)
    const scale = lerp(1, L.finalS, state.lift)
    const turn = 0.93 + 0.07 * Math.cos(t * 0.45)
    gemNode.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0) rotate(${state.spin.toFixed(1)}deg) scale(${(scale * turn).toFixed(4)},${scale.toFixed(4)})`
    flash.style.opacity = state.flash.toFixed(3)

    beams.style.opacity = state.beams.toFixed(3)
    beams.style.transform = `rotate(${(t * 3 + state.beamLen * 18).toFixed(2)}deg) scale(${Math.max(0.001, state.beamLen).toFixed(3)})`

    // names rise, a sheen rakes across them
    names.style.opacity = state.names.toFixed(3)
    names.style.transform = `translate(-50%,calc(-50% + ${((1 - state.names) * H * 0.05).toFixed(1)}px))`
    names.style.setProperty('--sheen', `${(state.sheen < 0 ? 130 : lerp(130, -30, state.sheen)).toFixed(1)}%`)

    world.style.transform = state.push > 0 ? `scale(${(1 + state.push * 0.32).toFixed(4)})` : ''

    // gold dust in the emerald space (only once it can be seen)
    if (state.open > 0.01) {
      const dpr = L.dpr
      dctx.setTransform(1, 0, 0, 1, 0, 0)
      dctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height)
      dctx.globalCompositeOperation = 'lighter'
      const cx = (W / 2) * dpr
      const cy = H * 0.47 * dpr
      const spread = H * 0.55 * dpr
      for (let i = 0; i < dust.length; i += 1) {
        const p = dust[i]
        p.z -= dt * (0.02 + state.rush)
        if (p.z < 0.2) {
          p.z += 2.8
          p.x = (random() - 0.5) * 3
          p.y = (random() - 0.5) * 2
        }
        const sx = cx + ((p.x + Math.sin(t * 0.3 + p.phase) * 0.04) / p.z) * spread
        const sy = cy + ((p.y + Math.cos(t * 0.23 + p.phase) * 0.05) / p.z) * spread
        const s = (p.size * dpr * 3.2) / p.z
        const twinkle = 0.45 + 0.55 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.7 + p.phase), 3)
        dctx.globalAlpha = Math.min(1, twinkle * Math.min(1, (3 - p.z) * 1.5) * state.open)
        dctx.drawImage(sprite, sx - s / 2, sy - s / 2, s, s)
      }
      dctx.globalAlpha = 1
    }
  })

  /* --------------------------------------------------------------- open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      // the lock turns and flashes
      .to(state, { spin: 360, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to(state, { flash: 1, duration: 0.25, ease: 'power2.in' }, 0.6)
      .to(state, { flash: 0.1, duration: 1.1, ease: 'power2.out' }, 0.85)
      // eleven beams of light
      .to(state, { beams: 0.9, duration: 0.25 }, 0.7)
      .to(state, { beamLen: 1, duration: 1, ease: 'power3.out' }, 0.7)
      .to(state, { beams: 0, duration: 1.1, ease: 'power1.in' }, 1.6)
      // the stone lifts away to crown the names
      .to(state, { lift: 1, duration: 1.6, ease: 'power2.inOut' }, 1.0)
      // the gates swing open
      .to(state, { open: 1, duration: 2.2, ease: 'power3.inOut' }, 1.0)
      // names rise in gold, a sheen rakes across
      .to(state, { names: 1, duration: 1.1, ease: 'power2.out' }, 2.3)
      .set(state, { sheen: 0 }, 2.5)
      .to(state, { sheen: 1, duration: 1.4, ease: 'sine.inOut' }, 2.5)
      .call(() => setCaption?.('date'), null, 3.0)
      // push through the gates into the dust
      .to(state, { push: 1, duration: 1.4, ease: 'power2.inOut' }, 3.8)
      .to(state, { rush: 1.6, duration: 1.4, ease: 'power2.in' }, 3.8)
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
      observer.disconnect()
      root.remove()
    },
  }
}
