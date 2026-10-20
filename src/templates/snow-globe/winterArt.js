// Snow Globe: a timber chalet on Uludağ on a December night, drawn as an
// engraved winter print with gouache-like washes — night-blue sky, moonlit
// ridges, snow-laden pines, warm windows. Generated SVG rasterised into <img>
// layers, plus canvas snowfall and a procedural frost vignette. Shared by the
// page hero and the snow-globe intro (which also paints a round version of
// the same scene inside the glass).
import { seeded, grainTile } from '../../shared/intro/foil.js'

const INK = '#0b1e33'
const SNOW = '#f4f8fc'
const SNOW_SHADE = '#a9c0d6'

const n1 = (v) => Math.round(v * 10) / 10
const n3 = (v) => Math.round(v * 1000) / 1000

/* ------------------------------------------------------------ shapes */

// Blend two #rrggbb colours; used to sink distant trees into the night haze.
function mix(a, b, t) {
  const p = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
  const ch = (i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0')
  return `#${ch(0)}${ch(1)}${ch(2)}`
}

// Smooth closed path through points (quadratic curves via the midpoints).
function smooth(pts) {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(pts[pts.length - 1], pts[0])
  let d = `M${n3(m0[0])} ${n3(m0[1])}`
  for (let i = 0; i < pts.length; i += 1) {
    const p = pts[i]
    const m = mid(p, pts[(i + 1) % pts.length])
    d += `Q${n3(p[0])} ${n3(p[1])} ${n3(m[0])} ${n3(m[1])}`
  }
  return `${d}Z`
}

const PINE = { shade: '#0c2229', body: '#173a3b', lit: '#3b6d5f', trunk: '#2b1c16', fog: '#6d8cab' }

/**
 * A snow-laden fir, 1 unit tall, root at 0,0 and up = −y. Tiered boughs with
 * drooping, ragged tips; the moon (upper right) lights the right-hand side,
 * the left falls into shadow, and every bough carries a dripping cushion of
 * snow. `fog` 0…1 sinks it into the distance.
 */
function pine(seed, fog = 0) {
  const rand = seeded(seed)
  const c = (k) => mix(PINE[k], PINE.fog, fog)
  const sn = (col) => mix(col, '#b9cde0', fog * 0.55)
  const tiers = 6 + Math.floor(rand() * 2)
  const lean = (rand() - 0.5) * 0.03
  // the lit side brightens toward its outer tips (shared by every bough of this tree)
  const lit = `pl${Math.round(fog * 100)}`
  let wash = `<defs><linearGradient id="${lit}" x1="0" x2="1"><stop offset=".25" stop-color="${c('body')}"/><stop offset="1" stop-color="${c('lit')}"/></linearGradient></defs>`
  let ink = ''
  // trunk, shaded on the left
  wash += `<path d="M-0.034 0.01L-0.024 -0.2L0.024 -0.2L0.034 0.01Z" fill="${c('trunk')}"/>`
  wash += `<path d="M0.004 0.01L0.004 -0.2L0.024 -0.2L0.034 0.01Z" fill="${mix(c('trunk'), '#6b5446', 0.35)}"/>`
  const boughs = []
  for (let i = 0; i < tiers; i += 1) {
    const k = i / (tiers - 1)
    const yb = -0.1 - 0.68 * k ** 0.95
    const yt = i === tiers - 1 ? -1 : yb - (0.25 - k * 0.06)
    const hw = 0.07 + 0.34 * (1 - k) ** 0.9 * (0.9 + rand() * 0.2)
    const cx = lean * -yb
    const half = (side) => {
      const droop = 0.03 + rand() * 0.04
      const tip = [cx + side * hw, yb + droop]
      // a gently sagging upper surface, so each tier stands proud of the one above
      const ctrl = [cx + side * hw * 0.48, yt + (yb - yt) * 0.6]
      let d = `M${n3(cx)} ${n3(yt)}Q${n3(ctrl[0])} ${n3(ctrl[1])} ${n3(tip[0])} ${n3(tip[1])}`
      // the underside: a garland of needle clusters hanging between shallow notches
      const clusters = 3 + Math.floor(rand() * 2)
      let px = tip[0]
      for (let j = 1; j <= clusters; j += 1) {
        const f = 1 - j / (clusters + 0.5)
        const x = cx + side * hw * f
        const y = yb + droop * (0.3 + f * 0.6) + rand() * 0.012
        d += `Q${n3((px + x) / 2)} ${n3(yb - 0.035 - rand() * 0.02)} ${n3(x)} ${n3(y)}`
        px = x
      }
      d += `Q${n3((px + cx) / 2)} ${n3(yb - 0.04)} ${n3(cx)} ${n3(yb - 0.03)}Z`
      return { d, ctrl, tip }
    }
    boughs.push({ yb, yt, hw, cx, l: half(-1), r: half(1) })
  }
  boughs.forEach((b, i) => {
    wash += `<path d="${b.l.d}" fill="${c('shade')}"/><path d="${b.r.d}" fill="url(#${lit})"/>`
    ink += `<path d="${b.l.d}${b.r.d}"/>`
    // a cushion of snow resting along each side: rounded on top, dripping underneath,
    // thinning toward the tip; moonlit white on the right, cold blue in the shadow
    for (const side of [-1, 1]) {
      const h = side < 0 ? b.l : b.r
      const at = (t) => [
        (1 - t) ** 2 * b.cx + 2 * (1 - t) * t * h.ctrl[0] + t * t * h.tip[0],
        (1 - t) ** 2 * b.yt + 2 * (1 - t) * t * h.ctrl[1] + t * t * h.tip[1],
      ]
      const t0 = i === boughs.length - 1 ? 0 : 0.12
      const t1 = 0.86 + rand() * 0.1
      const depth = (b.yb - b.yt) * (0.42 + rand() * 0.12)
      const top = []
      const bottom = []
      const steps = 12
      for (let s = 0; s <= steps; s += 1) {
        const u = s / steps
        const [x, y] = at(t0 + (t1 - t0) * u)
        const ends = Math.sin(Math.PI * u) ** 0.6
        top.push([x, y - depth * 0.3 * ends])
        const drip = s % 4 === 2 ? 0.45 + rand() * 0.35 : 0.08 * Math.sin(u * 17 + i)
        bottom.unshift([x, y + depth * ends * (1 - u * 0.5) * (0.5 + drip)])
      }
      wash += `<path d="${smooth([...top, ...bottom])}" fill="${side < 0 ? sn('#9fb7cf') : sn(SNOW)}"/>`
      if (side > 0) {
        // a soft blue underside gives the lit cushion its volume
        const under = bottom.slice(1, -1)
        const band = [...under.slice().reverse().map(([x, y]) => [x, y - depth * 0.22]), ...under]
        wash += `<path d="${smooth(band)}" fill="${sn('#bccfe2')}"/>`
      }
    }
  })
  return { wash, ink }
}

// Distant forest along a ridge: small tiered firs, snow-dusted on the lit side.
function treeLine(cam, y0, y1, count, rand, scaleMin, scaleMax, color, dust) {
  let d = ''
  let s = ''
  for (let i = 0; i < count; i += 1) {
    const x = rand() * cam.W * 1.2 - cam.W * 0.1
    const y = y0 + (y1 - y0) * rand()
    const h = scaleMin + (scaleMax - scaleMin) * rand()
    const w = h * (0.26 + rand() * 0.08)
    const tiers = 3 + (rand() > 0.6 ? 1 : 0)
    for (let k = 0; k < tiers; k += 1) {
      const f = k / tiers
      const top = y - h * (0.42 + f * 0.58)
      const base = y - h * f * 0.78
      const hw = w * (1 - f * 0.68)
      const sag = h * 0.05
      d += `M${n1(x)} ${n1(top)}L${n1(x + hw * 0.55)} ${n1(base - (base - top) * 0.3)}L${n1(x + hw)} ${n1(base + sag)}L${n1(x + hw * 0.35)} ${n1(base - sag * 0.4)}L${n1(x - hw * 0.35)} ${n1(base - sag * 0.4)}L${n1(x - hw)} ${n1(base + sag)}L${n1(x - hw * 0.55)} ${n1(base - (base - top) * 0.3)}Z`
      s += `M${n1(x)} ${n1(top)}L${n1(x + hw * 0.62)} ${n1(base - (base - top) * 0.22)}L${n1(x + hw * 0.2)} ${n1(base - (base - top) * 0.45)}Z`
    }
    d += `M${n1(x - w * 0.08)} ${n1(y)}h${n1(w * 0.16)}v${n1(-h * 0.1)}h${n1(-w * 0.16)}Z`
  }
  return `<path d="${d}" fill="${color}"/><path d="${s}" fill="${dust}" fill-opacity=".55"/>`
}

/* ------------------------------------------------------------ chalet */

// Chalet in units of its own width (x −0.5…0.5), ground at 0, up = −y.
function chalet() {
  const logs = []
  for (let y = -0.135; y > -0.62; y -= 0.04) logs.push(y)
  let out = ''
  // warm light pooled on the snow in front
  out += '<ellipse cx="0" cy="0.05" rx="0.75" ry="0.12" fill="url(#pool)"/>'
  // stone base
  out += '<rect x="-0.43" y="-0.13" width="0.86" height="0.14" fill="#5e6b78"/>'
  let stones = ''
  const rand = seeded(4)
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      const x = -0.42 + c * 0.095 + (r % 2) * 0.045
      const sw = Math.min(0.08 + rand() * 0.012, 0.425 - x)
      if (sw < 0.02) continue
      stones += `<rect x="${n3(x)}" y="${n3(-0.125 + r * 0.043)}" width="${n3(sw)}" height="0.036" rx="0.012" fill="${['#76838f', '#6a7784', '#838f9a'][(r + c) % 3]}"/>`
    }
  }
  out += stones
  // log walls
  out += '<rect x="-0.4" y="-0.62" width="0.8" height="0.5" fill="url(#logs)"/>'
  let logLines = ''
  logs.forEach((y) => {
    logLines += `M-0.4 ${n3(y)}L0.4 ${n3(y)}`
  })
  out += `<path d="${logLines}" stroke="#2e1a0f" stroke-width="0.006" stroke-opacity=".7"/>`
  logs.forEach((y) => {
    out += `<rect x="-0.4" y="${n3(y - 0.034)}" width="0.8" height="0.008" fill="#c08a52" fill-opacity=".35"/>`
  })
  // log ends at the corners
  logs.forEach((y) => {
    for (const x of [-0.415, 0.415]) out += `<circle cx="${x}" cy="${n3(y - 0.02)}" r="0.019" fill="#a8743f" stroke="#2e1a0f" stroke-width="0.004"/>`
  })
  // gable with vertical boards
  out += '<path d="M-0.4 -0.62L0 -0.97L0.4 -0.62Z" fill="#7a5030"/>'
  let boards = ''
  for (let x = -0.36; x <= 0.36; x += 0.045) boards += `M${n3(x)} -0.62L${n3(x)} ${n3(-0.62 - (0.4 - Math.abs(x)) * 0.875)}`
  out += `<path d="${boards}" stroke="#3a2416" stroke-width="0.005" stroke-opacity=".7"/>`
  // windows: warm light, mullions, berry-red shutters with heart cut-outs
  const windowAt = (x, y, w, h, shutters) => {
    let s = `<rect x="${n3(x - w * 0.62)}" y="${n3(y - h * 0.62)}" width="${n3(w * 1.24)}" height="${n3(h * 1.24)}" fill="url(#glow)" opacity=".9"/>`
    s += `<rect x="${n3(x - w / 2 - 0.012)}" y="${n3(y - h / 2 - 0.012)}" width="${n3(w + 0.024)}" height="${n3(h + 0.024)}" fill="#3a2416"/>`
    s += `<rect x="${n3(x - w / 2)}" y="${n3(y - h / 2)}" width="${n3(w)}" height="${n3(h)}" fill="url(#pane)"/>`
    // curtains
    s += `<path d="M${n3(x - w / 2)} ${n3(y - h / 2)}q${n3(w * 0.22)} ${n3(h * 0.4)} 0 ${n3(h)}zM${n3(x + w / 2)} ${n3(y - h / 2)}q${n3(-w * 0.22)} ${n3(h * 0.4)} 0 ${n3(h)}z" fill="#c0392b" fill-opacity=".55"/>`
    s += `<path d="M${n3(x)} ${n3(y - h / 2)}V${n3(y + h / 2)}M${n3(x - w / 2)} ${n3(y - h * 0.08)}H${n3(x + w / 2)}" stroke="#3a2416" stroke-width="0.012"/>`
    if (shutters) {
      for (const side of [-1, 1]) {
        const sx = x + side * (w / 2 + 0.045)
        s += `<rect x="${n3(sx - 0.035)}" y="${n3(y - h / 2 - 0.008)}" width="0.07" height="${n3(h + 0.016)}" fill="#a3302a"/>`
        s += `<path d="M${n3(sx)} ${n3(y - 0.004)}c-0.016 -0.02 -0.03 0.004 0 0.024c0.03 -0.02 0.016 -0.044 0 -0.024z" fill="#2a0e0b"/>`
        s += `<path d="M${n3(sx - 0.035)} ${n3(y - h * 0.18)}h0.07M${n3(sx - 0.035)} ${n3(y + h * 0.18)}h0.07" stroke="#5c1a16" stroke-width="0.004"/>`
      }
    }
    // a little snow on the sill
    s += `<path d="M${n3(x - w / 2 - 0.03)} ${n3(y + h / 2 + 0.012)}q${n3(w / 2 + 0.03)} -0.03 ${n3(w + 0.06)} 0q-0.01 0.02 ${n3(-(w + 0.06))} 0z" fill="${SNOW}"/>`
    return s
  }
  out += windowAt(-0.24, -0.36, 0.13, 0.15, true)
  out += windowAt(0.24, -0.36, 0.13, 0.15, true)
  // door with a wreath
  out += '<rect x="-0.085" y="-0.31" width="0.17" height="0.31" fill="url(#glow)" opacity=".85"/>'
  out += '<rect x="-0.07" y="-0.29" width="0.14" height="0.29" fill="#5a3520" stroke="#2e1a0f" stroke-width="0.008"/>'
  out += '<path d="M-0.045 -0.27h0.09v0.11h-0.09zM-0.045 -0.13h0.09v0.11h-0.09z" fill="none" stroke="#2e1a0f" stroke-width="0.005"/>'
  out += '<circle cx="0" cy="-0.215" r="0.042" fill="none" stroke="#24452e" stroke-width="0.022"/>'
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2
    out += `<circle cx="${n3(Math.cos(a) * 0.042)}" cy="${n3(-0.215 + Math.sin(a) * 0.042)}" r="0.008" fill="#d0362a"/>`
  }
  out += '<path d="M-0.015 -0.17l0.015 -0.012l0.015 0.012l-0.006 0.03zM0.015 -0.17l-0.015 -0.012" fill="#c0392b"/>'
  // balcony across the gable
  out += '<rect x="-0.37" y="-0.64" width="0.74" height="0.025" fill="#4a2c1a"/>'
  let balusters = ''
  for (let x = -0.35; x <= 0.351; x += 0.035) balusters += `<path d="M${n3(x - 0.008)} -0.62h0.016l0.006 0.02l-0.006 0.02h-0.016l-0.006 -0.02z" fill="#6b4224" stroke="#2e1a0f" stroke-width="0.003" transform="translate(0 -0.07)"/>`
  out += balusters
  out += '<rect x="-0.37" y="-0.73" width="0.74" height="0.018" fill="#4a2c1a"/>'
  out += `<path d="M-0.38 -0.735q0.38 -0.03 0.76 0l0 0.012q-0.38 -0.02 -0.76 0z" fill="${SNOW}"/>`
  // gable window
  out += windowAt(0, -0.8, 0.12, 0.11, false)
  // chimney
  out += '<rect x="0.17" y="-1.02" width="0.075" height="0.2" fill="#66717c"/>'
  out += '<path d="M0.17 -0.95h0.075M0.17 -0.9h0.075" stroke="#4a545e" stroke-width="0.005"/>'
  out += `<path d="M0.16 -1.02q0.045 -0.04 0.095 0q0 0.02 -0.095 0.01z" fill="${SNOW}"/>`
  // roof: dark fascia under a deep, rounded load of snow
  out += '<path d="M0 -1.02L-0.6 -0.56L-0.6 -0.52L0 -0.975L0.6 -0.52L0.6 -0.56Z" fill="#2e1a0f"/>'
  out += `<path d="M0 -1.11Q-0.3 -0.88 -0.64 -0.58Q-0.66 -0.53 -0.6 -0.535Q-0.56 -0.55 -0.5 -0.585Q-0.45 -0.6 -0.4 -0.635Q-0.3 -0.69 -0.2 -0.78Q-0.1 -0.86 0 -0.94Q0.1 -0.86 0.2 -0.78Q0.3 -0.69 0.4 -0.635Q0.45 -0.6 0.5 -0.585Q0.56 -0.55 0.6 -0.535Q0.66 -0.53 0.64 -0.58Q0.3 -0.88 0 -1.11Z" fill="${SNOW}"/>`
  out += `<path d="M0 -0.99Q0.3 -0.76 0.62 -0.555Q0.5 -0.6 0.4 -0.645Q0.2 -0.77 0 -0.95Z" fill="${SNOW_SHADE}" fill-opacity=".7"/>`
  out += '<path d="M0 -1.11Q-0.3 -0.88 -0.64 -0.58M0 -1.11Q0.3 -0.88 0.64 -0.58" stroke="#fff" stroke-width="0.008" fill="none" stroke-opacity=".9"/>'
  // icicles along the eaves
  let ice = ''
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i += 1) {
      const t = 0.18 + i * 0.09
      const x = side * t * 0.6 * 1.05
      const y = -0.965 + t * 0.44 + 0.035
      ice += `M${n3(x - 0.008)} ${n3(y)}L${n3(x)} ${n3(y + 0.02 + ((i * 7) % 5) * 0.008)}L${n3(x + 0.008)} ${n3(y)}Z`
    }
  }
  out += `<path d="${ice}" fill="#e6f1fb" fill-opacity=".9"/>`
  // snow drifts against the walls
  out += `<path d="M-0.56 0.01Q-0.45 -0.07 -0.32 -0.03Q-0.2 -0.01 -0.12 0.01ZM0.12 0.01Q0.25 -0.05 0.36 -0.035Q0.5 -0.06 0.58 0.01Z" fill="${SNOW}"/>`
  return out
}

/* -------------------------------------------------------------- defs */

const DEFS = `
<radialGradient id="glow"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".85"/><stop offset=".5" stop-color="#ff9b3d" stop-opacity=".35"/><stop offset="1" stop-color="#ff9b3d" stop-opacity="0"/></radialGradient>
<radialGradient id="pane" cx=".5" cy=".55" r=".75"><stop offset="0" stop-color="#fff2c2"/><stop offset=".45" stop-color="#ffc463"/><stop offset="1" stop-color="#e3792a"/></radialGradient>
<radialGradient id="pool"><stop offset="0" stop-color="#ffc56e" stop-opacity=".55"/><stop offset=".6" stop-color="#ffb35c" stop-opacity=".18"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
<linearGradient id="logs" x1="0" x2="1"><stop offset="0" stop-color="#5a361d"/><stop offset=".4" stop-color="#7a4d2a"/><stop offset="1" stop-color="#4a2c17"/></linearGradient>
 <filter id="blur1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="haze" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
`

const svgDoc = (vb, inner, w = vb.split(' ')[2], h = vb.split(' ')[3]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"><defs>${DEFS}</defs>${inner}</svg>`

function place(species, x, y, s, { flip = false, ink = 0.55 } = {}) {
  const tf = `translate(${n1(x)} ${n1(y)}) scale(${n3(flip ? -s : s)} ${n3(s)})`
  return `<g transform="${tf}">${species.wash}</g><g transform="${tf}" fill="none" stroke="${INK}" stroke-opacity="${ink}" stroke-width="${n3(0.8 / s)}">${species.ink}</g>`
}

/* ----------------------------------------------------------- layout */

// Where everything sits for a given canvas; `round` is the scene inside the globe.
export function winterLayout(W, H, round = false) {
  const portrait = W / H < 0.9
  if (round) {
    const D = W
    return { W, H, portrait: true, round, horizon: D * 0.56, ground: D * 0.73, chaletW: D * 0.42, chaletX: D * 0.5 }
  }
  const horizon = H * (portrait ? 0.6 : 0.63)
  const ground = H * (portrait ? 0.8 : 0.87)
  const chaletW = portrait ? Math.min(W * 0.66, H * 0.34) : Math.min(W * 0.26, H * 0.44)
  return { W, H, portrait, round, horizon, ground, chaletW, chaletX: W / 2 }
}

// The point the intro dives toward: the chalet door.
export const chaletDoor = (L) => ({ x: L.chaletX, y: L.ground - L.chaletW * 0.15 })

/* --------------------------------------------------------- painters */

function skyLayer(L, vb) {
  const { W, H, horizon } = L
  const rand = seeded(L.round ? 3 : 7)
  let stars = ''
  const count = Math.round((W * horizon) / (L.round ? 1400 : 2200))
  for (let i = 0; i < count; i += 1) {
    const x = rand() * W
    const y = rand() * horizon * 0.95
    const r = rand() < 0.08 ? 1.3 + rand() : 0.4 + rand() * 0.7
    stars += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="#fff" fill-opacity="${n3(0.35 + rand() * 0.6)}"/>`
  }
  for (let i = 0; i < 6; i += 1) {
    const x = rand() * W
    const y = rand() * horizon * 0.6
    const s = 3 + rand() * 4
    stars += `<path d="M${n1(x)} ${n1(y - s)}L${n1(x + s * 0.18)} ${n1(y - s * 0.18)}L${n1(x + s)} ${n1(y)}L${n1(x + s * 0.18)} ${n1(y + s * 0.18)}L${n1(x)} ${n1(y + s)}L${n1(x - s * 0.18)} ${n1(y + s * 0.18)}L${n1(x - s)} ${n1(y)}L${n1(x - s * 0.18)} ${n1(y - s * 0.18)}Z" fill="#fff6dc"/>`
  }
  const mx = W * (L.portrait ? 0.78 : 0.8)
  const my = horizon * (L.round ? 0.32 : 0.26)
  const mr = Math.min(W, H) * (L.round ? 0.06 : 0.045)
  return svgDoc(
    vb,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#06111f"/><stop offset="${n3((horizon * 0.5) / H)}" stop-color="#0f2a44"/><stop offset="${n3(horizon / H)}" stop-color="#2d5072"/><stop offset="1" stop-color="#3a5d80"/>
    </linearGradient>
    <radialGradient id="moonHalo" cx="${n1(mx)}" cy="${n1(my)}" r="${n1(mr * 9)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#dde7f0" stop-opacity=".42"/><stop offset=".25" stop-color="#9fb8cc" stop-opacity=".18"/><stop offset="1" stop-color="#9fb8cc" stop-opacity="0"/></radialGradient>
    <rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#sky)"/>
    ${stars}
    <rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#moonHalo)"/>
    <circle cx="${n1(mx)}" cy="${n1(my)}" r="${n1(mr)}" fill="#f3f6f2"/>
    <circle cx="${n1(mx - mr * 0.3)}" cy="${n1(my - mr * 0.2)}" r="${n1(mr * 0.22)}" fill="#d9e1e6"/>
    <circle cx="${n1(mx + mr * 0.35)}" cy="${n1(my + mr * 0.3)}" r="${n1(mr * 0.15)}" fill="#d9e1e6"/>
    <g filter="url(#haze)" opacity=".5"><ellipse cx="${n1(W * 0.3)}" cy="${n1(horizon * 0.42)}" rx="${n1(W * 0.35)}" ry="${n1(H * 0.025)}" fill="#5d7f9f"/><ellipse cx="${n1(W * 0.75)}" cy="${n1(horizon * 0.55)}" rx="${n1(W * 0.3)}" ry="${n1(H * 0.02)}" fill="#4f7090"/></g>`,
  )
}

function ridge(L, rand, base, amp, peaks, step) {
  // smooth multi-octave crags instead of per-sample jitter, so the skyline reads as rock, not a saw
  const waves = [7, 13, 29].map((f, i) => ({ f, a: [0.05, 0.03, 0.012][i], p: rand() * Math.PI * 2 }))
  // crag widths follow the picture's size, not its width, so a phone doesn't get a saw blade
  const span = Math.max(L.W, L.H * 1.3)
  const pts = []
  for (let x = -L.W * 0.1; x <= L.W * 1.1; x += step) {
    let y = base
    let lift = 0
    for (const p of peaks) lift += p.h * Math.exp(-(((x - p.x) / p.w) ** 2))
    y -= amp * lift
    for (const w of waves) y -= amp * w.a * Math.min(1, lift + 0.3) * Math.sin((x / span) * w.f * Math.PI * 2 + w.p)
    pts.push([x, y])
  }
  return pts
}

function landLayer(L, vb) {
  const { W, H, horizon, ground } = L
  const rand = seeded(L.round ? 21 : 13)
  const amp = H * (L.round ? 0.22 : L.portrait ? 0.17 : 0.24)
  const step = Math.max(4, W / 160)
  // the Uludağ massif: a broad summit block with sharper shoulders and gullies
  const peaks = [
    { x: W * 0.06, h: 0.55, w: W * 0.09 },
    { x: W * 0.2, h: 0.78, w: W * 0.08 },
    { x: W * 0.33, h: 1, w: W * 0.1 },
    { x: W * 0.43, h: 0.86, w: W * 0.07 },
    { x: W * 0.56, h: 0.9, w: W * 0.09 },
    { x: W * 0.7, h: 0.68, w: W * 0.08 },
    { x: W * 0.84, h: 0.74, w: W * 0.1 },
    { x: W * 0.98, h: 0.5, w: W * 0.09 },
  ]
  const far = ridge(L, rand, horizon, amp, peaks, step)
  const near = ridge(L, rand, horizon + H * 0.03, amp * 0.42, [{ x: W * 0.15, h: 0.9, w: W * 0.25 }, { x: W * 0.78, h: 1, w: W * 0.3 }], step)
  const poly = (pts, bottom) => `M${pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join('L')}L${n1(W * 1.1)} ${n1(bottom)}L${n1(-W * 0.1)} ${n1(bottom)}Z`
  let out = `<linearGradient id="farG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3f8"/><stop offset=".45" stop-color="#b9cde0"/><stop offset="1" stop-color="#6f8eab"/></linearGradient>`
  out += `<clipPath id="farClip"><path d="${poly(far, horizon + H * 0.08)}"/></clipPath>`
  out += `<path d="${poly(far, horizon + H * 0.08)}" fill="url(#farG)"/>`
  const ridgeY = (x) => far[Math.max(0, Math.min(far.length - 1, Math.round((x + W * 0.1) / step)))][1]
  // moonlight from the upper right: every summit is split along a diagonal spine into a lit face
  // and a shadow face; both are gradients that fade out away from the spine (no hard outer edges,
  // so the range never reads as vertical bands), with a few thin gullies down the fall line
  let faces = ''
  let gullies = ''
  const foot = horizon + H * 0.06
  peaks.forEach((p, i) => {
    let sx = p.x
    let sy = Infinity
    for (const [x, y] of far) {
      if (Math.abs(x - p.x) < p.w * 0.5 && y < sy) {
        sx = x
        sy = y
      }
    }
    const drop = foot - sy
    const ex = sx + drop * 0.85
    const spine = `M${n1(sx)} ${n1(sy - 6)}L${n1(sx)} ${n1(sy)}Q${n1(sx + drop * 0.3)} ${n1(sy + drop * 0.55)} ${n1(ex)} ${n1(foot)}`
    const reach = p.w * 1.5
    const top = sy - amp * 0.5
    faces += `<linearGradient id="sh${i}" gradientUnits="userSpaceOnUse" x1="${n1(sx)}" y1="0" x2="${n1(sx - reach)}" y2="0"><stop offset="0" stop-color="#4c6d92" stop-opacity=".42"/><stop offset=".45" stop-color="#4c6d92" stop-opacity=".2"/><stop offset="1" stop-color="#4c6d92" stop-opacity="0"/></linearGradient>`
    faces += `<linearGradient id="li${i}" gradientUnits="userSpaceOnUse" x1="${n1(sx)}" y1="0" x2="${n1(ex + reach)}" y2="0"><stop offset="0" stop-color="#fbfdff" stop-opacity=".38"/><stop offset="1" stop-color="#fbfdff" stop-opacity="0"/></linearGradient>`
    faces += `<path d="${spine}L${n1(sx - reach)} ${n1(foot)}L${n1(sx - reach)} ${n1(top)}L${n1(sx)} ${n1(top)}Z" fill="url(#sh${i})"/>`
    faces += `<path d="${spine}L${n1(ex + reach)} ${n1(foot)}L${n1(ex + reach)} ${n1(top)}L${n1(sx)} ${n1(top)}Z" fill="url(#li${i})"/>`
    // gullies: short, tapering scores falling away from the spine on either face
    for (let k = 0; k < 4; k += 1) {
      const side = k % 2 ? 1 : -1
      const f = 0.2 + Math.floor(k / 2) * 0.3 + rand() * 0.15
      const x0 = sx + side * p.w * f
      const y0 = ridgeY(x0) + drop * 0.04
      const len = (foot - y0) * (0.25 + rand() * 0.2)
      const color = side > 0 ? '#5f7f9f' : '#dde7f0'
      gullies += `<path d="M${n1(x0)} ${n1(y0)}q${n1(side * len * 0.18)} ${n1(len * 0.5)} ${n1(side * len * 0.5)} ${n1(len)}" stroke="${color}" stroke-opacity=".28" stroke-width="1.1" stroke-linecap="round" fill="none"/>`
    }
  })
  out += `<g clip-path="url(#farClip)">${faces}<g filter="url(#blur1)">${gullies}</g></g>`
  // a skirt of forest on the lower slopes, fading into the valley haze
  out += `<path d="${poly(far.map(([x, y]) => [x, Math.max(y, horizon - amp * 0.18)]), horizon + H * 0.08)}" fill="#3f6283" fill-opacity=".5"/>`
  out += treeLine(L, horizon - amp * 0.12, horizon - amp * 0.02, Math.round(W / 4.5), rand, H * 0.012, H * 0.024, '#4a6d8f', '#c9d8e6')
  out += `<path d="${poly(near, horizon + H * 0.12)}" fill="#24425f"/>`
  out += treeLine(L, horizon - H * 0.005, horizon + H * 0.05, Math.round(W / 3.4), rand, H * 0.02, H * 0.045, '#15304a', '#9fb8cc')
  // the snowfield, with blue drift shadows and engraved contour lines
  out += `<linearGradient id="field" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8cde0"/><stop offset=".35" stop-color="#dde7f0"/><stop offset="1" stop-color="#f4f8fc"/></linearGradient>`
  const fieldTop = horizon + H * 0.035
  out += `<path d="M${-W * 0.1} ${n1(fieldTop)}Q${n1(W * 0.3)} ${n1(fieldTop - H * 0.02)} ${n1(W * 0.6)} ${n1(fieldTop + H * 0.005)}T${n1(W * 1.1)} ${n1(fieldTop - H * 0.01)}L${n1(W * 1.1)} ${n1(H * 1.1)}L${-W * 0.1} ${n1(H * 1.1)}Z" fill="url(#field)"/>`
  let contours = ''
  for (let i = 0; i < 9; i += 1) {
    const y = fieldTop + (H - fieldTop) * (i / 9) ** 1.4 + 6
    contours += `M${n1(-W * 0.1)} ${n1(y)}Q${n1(W * (0.25 + rand() * 0.2))} ${n1(y - H * 0.012)} ${n1(W * 0.55)} ${n1(y + H * 0.004)}T${n1(W * 1.1)} ${n1(y)}`
  }
  out += `<path d="${contours}" stroke="#7d9ab5" stroke-opacity=".16" stroke-width=".7" fill="none"/>`
  out += `<g filter="url(#soft)" fill="#9fb8cc" fill-opacity=".45"><ellipse cx="${n1(W * 0.18)}" cy="${n1(ground + H * 0.04)}" rx="${n1(W * 0.3)}" ry="${n1(H * 0.025)}"/><ellipse cx="${n1(W * 0.86)}" cy="${n1(ground + H * 0.08)}" rx="${n1(W * 0.28)}" ry="${n1(H * 0.03)}"/></g>`
  // mid-distance pines on both sides of the clearing
  // (farther ones smaller and sunk into the haze; a few grow in little groves)
  const species = new Map()
  const fir = (v, fog) => {
    const key = `${v}:${fog}`
    if (!species.has(key)) species.set(key, pine([5, 9, 14, 27][v], fog))
    return species.get(key)
  }
  const mids = []
  const n = L.round ? 10 : L.portrait ? 10 : 18
  for (let i = 0; i < n; i += 1) {
    const side = i % 2 ? 1 : -1
    const off = L.chaletW * (0.64 + rand() * (L.portrait || L.round ? 0.9 : 2.4))
    const depth = 0.18 + rand() * 0.62
    const y = horizon + (ground - horizon) * depth
    const s = (y - horizon + H * 0.04) * (L.round ? 1.5 : 1.25) * (0.85 + rand() * 0.3)
    const fog = Math.round((1 - depth) * 4) / 8
    mids.push({ x: L.chaletX + side * off, y, s, v: i % 4, fog })
    if (rand() > 0.55) mids.push({ x: L.chaletX + side * (off + s * 0.22), y: y - s * 0.03, s: s * 0.62, v: (i + 1) % 4, fog: Math.min(0.5, fog + 0.125) })
  }
  mids.sort((a, b) => a.y - b.y).forEach((m) => (out += place(fir(m.v, m.fog), m.x, m.y, m.s, { ink: 0.22 * (1 - m.fog * 1.6) })))
  // the chalet, with its glow, and a lantern-lit path to the door
  const cs = L.chaletW
  out += `<g transform="translate(${n1(L.chaletX)} ${n1(ground)}) scale(${n3(cs)})">${chalet()}</g>`
  let lanterns = ''
  for (let i = 0; i < 4; i += 1) {
    const t = (i + 1) / 4.5
    for (const side of [-1, 1]) {
      const x = L.chaletX + side * cs * (0.14 + t * 0.32)
      const y = ground + (H - ground) * t * 0.9
      const s = cs * (0.03 + t * 0.03)
      lanterns += `<circle cx="${n1(x)}" cy="${n1(y - s * 1.6)}" r="${n1(s * 2.6)}" fill="url(#glow)"/><rect x="${n1(x - s * 0.08)}" y="${n1(y - s * 1.3)}" width="${n1(s * 0.16)}" height="${n1(s * 1.3)}" fill="#1b2633"/><rect x="${n1(x - s * 0.35)}" y="${n1(y - s * 2.2)}" width="${n1(s * 0.7)}" height="${n1(s * 0.9)}" rx="${n1(s * 0.1)}" fill="#ffd27c" stroke="#1b2633" stroke-width="${n1(Math.max(0.6, s * 0.08))}"/>`
    }
  }
  out += lanterns
  out += `<path d="M${n1(L.chaletX - cs * 0.06)} ${n1(ground)}L${n1(L.chaletX - cs * 0.5)} ${n1(H * 1.05)}M${n1(L.chaletX + cs * 0.06)} ${n1(ground)}L${n1(L.chaletX + cs * 0.5)} ${n1(H * 1.05)}" stroke="#8aa6c0" stroke-opacity=".45" stroke-width="1" fill="none"/>`
  return svgDoc(vb, out)
}

// The big firs framing the view, each as its own picture so the hero can sway
// them, plus the drifts in the very front; `front` is everything in one.
function foregroundLayer(L, vb) {
  const { W, H } = L
  const spots = L.round
    ? [[23, W * 0.13, L.ground + W * 0.06, W * 0.42], [31, W * 0.87, L.ground + W * 0.04, W * 0.36]]
    : L.portrait
      ? [[23, -W * 0.02, H * 1.02, H * 0.52], [31, W * 1.03, H * 1.04, H * 0.46]]
      : [[23, W * 0.07, H * 1.04, H * 0.86], [31, W * 0.93, H * 1.05, H * 0.78], [37, W * 0.19, H * 1.0, H * 0.5]]
  // nearest last: the small companion stands behind the big left-hand fir
  if (spots.length === 3) spots.unshift(spots.pop())
  const trees = spots.map(([seed, x, y, s]) => ({ x, y, svg: place(pine(seed), x, y, s, { ink: 0.3 }) }))
  const drift = `<path d="M${-W * 0.1} ${n1(H * 0.96)}Q${n1(W * 0.25)} ${n1(H * 0.9)} ${n1(W * 0.5)} ${n1(H * 0.97)}T${n1(W * 1.1)} ${n1(H * 0.94)}L${n1(W * 1.1)} ${n1(H * 1.1)}L${-W * 0.1} ${n1(H * 1.1)}Z" fill="${SNOW}"/>`
  return {
    front: svgDoc(vb, trees.map((t) => t.svg).join('') + drift),
    trees: trees.map((t) => ({ x: t.x, y: t.y, svg: svgDoc(vb, t.svg) })),
    drift: svgDoc(vb, drift),
  }
}

export function paintWinter(W, H, { round = false } = {}) {
  const L = winterLayout(W, H, round)
  const ox = round ? 0 : W * 0.04
  const oy = round ? 0 : H * 0.04
  const vb = `${n1(-ox)} ${n1(-oy)} ${n1(W + ox * 2)} ${n1(H + oy * 2)}`
  return { L, sky: skyLayer(L, vb), land: landLayer(L, vb), ...foregroundLayer(L, vb) }
}

/* ------------------------------------------------------------- frost */

// Frost creeping in from the edges of the pane: haze plus branching crystals.
export function paintFrost(canvas, W, H, dpr = 1, seed = 5) {
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  const rand = seeded(seed)
  const m = Math.min(W, H)
  const haze = ctx.createRadialGradient(W / 2, H / 2, m * 0.42, W / 2, H / 2, Math.hypot(W, H) * 0.56)
  haze.addColorStop(0, 'rgba(221,231,240,0)')
  haze.addColorStop(0.7, 'rgba(221,231,240,0.22)')
  haze.addColorStop(1, 'rgba(236,243,250,0.62)')
  ctx.fillStyle = haze
  ctx.fillRect(0, 0, W, H)
  ctx.lineCap = 'round'
  const branch = (x, y, angle, len, depth) => {
    if (depth <= 0 || len < 1.5) return
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    ctx.globalAlpha = 0.07 + depth * 0.065
    ctx.lineWidth = 0.35 + depth * 0.22
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    const kids = 2 + Math.floor(rand() * 2)
    for (let k = 1; k <= kids; k += 1) {
      const t = k / (kids + 1)
      const bx = x + (x2 - x) * t
      const by = y + (y2 - y) * t
      const side = k % 2 ? 1 : -1
      branch(bx, by, angle + side * (0.9 + rand() * 0.25), len * (0.32 + rand() * 0.18), depth - 1)
    }
    branch(x2, y2, angle + (rand() - 0.5) * 0.4, len * 0.62, depth - 1)
  }
  ctx.strokeStyle = '#eef5fb'
  const seeds = Math.round((W + H) / 26)
  for (let i = 0; i < seeds; i += 1) {
    const edge = i % 4
    const t = rand()
    const x = edge === 0 ? t * W : edge === 1 ? W : edge === 2 ? t * W : 0
    const y = edge === 0 ? 0 : edge === 1 ? t * H : edge === 2 ? H : t * H
    // corners grow the most frost
    const corner = Math.min(1, Math.min(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y)) / (m * 0.6))
    const len = m * (0.02 + (1 - corner) ** 2 * 0.13) * (0.6 + rand() * 0.6)
    const inward = Math.atan2(H / 2 - y, W / 2 - x) + (rand() - 0.5) * 1.1
    branch(x, y, inward, len, 4)
  }
  ctx.globalAlpha = 1
  // fine sparkle in the frost
  for (let i = 0; i < seeds * 14; i += 1) {
    const a = rand() * Math.PI * 2
    const r = Math.hypot(W, H) * (0.36 + rand() * 0.16)
    const x = W / 2 + Math.cos(a) * r * (W / Math.hypot(W, H)) * 1.3
    const y = H / 2 + Math.sin(a) * r * (H / Math.hypot(W, H)) * 1.3
    ctx.fillStyle = `rgba(255,255,255,${(0.2 + rand() * 0.5).toFixed(2)})`
    ctx.fillRect(x, y, 1, 1)
  }
}

/* -------------------------------------------------------------- snow */

// Canvas snowfall in three depths; no allocations per frame. Every flake's
// position is a pure function of the document clock (plus the wind drift this
// copy has gathered), so the intro's copy of the hero and the page's own fall
// in step while one dissolves into the other.
export function createSnow(canvas, { count = 160 } = {}) {
  const ctx = canvas.getContext('2d')
  const rand = seeded(17)
  const flakes = Array.from({ length: count }, (_, i) => ({ x: rand(), y: rand(), z: i % 3, r: 0, s: 0.5 + rand(), p: rand() * 6 }))
  flakes.forEach((f) => {
    f.r = [0.9, 1.6, 2.8][f.z] * (0.7 + rand() * 0.6) * 2.2
  })
  const sprite = document.createElement('canvas')
  sprite.width = sprite.height = 32
  const sc = sprite.getContext('2d')
  const g = sc.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(240,247,255,0.75)')
  g.addColorStop(1, 'rgba(240,247,255,0)')
  sc.fillStyle = g
  sc.fillRect(0, 0, 32, 32)
  const wrap = (v) => ((((v + 0.05) % 1.1) + 1.1) % 1.1) - 0.05
  let W = 1
  let H = 1
  let dpr = 1
  let drift = 0
  return {
    resize(w, h, ratio) {
      W = w
      H = h
      dpr = ratio
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
    },
    draw(dt, t, { wind = 0 } = {}) {
      const now = performance.now() / 1000
      drift += wind * 0.03 * dt
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < flakes.length; i += 1) {
        const f = flakes[i]
        const speed = [0.035, 0.06, 0.1][f.z] * f.s
        const k = f.z + 1
        // each pass down the screen shifts the flake sideways, so the pattern never visibly repeats
        const fall = f.y + speed * now
        const lap = Math.floor((fall + 0.05) / 1.1)
        const x = wrap(f.x + lap * 0.37 + (Math.sin(now * 0.6 * f.s + f.p) * 0.012 * k) / (0.6 * f.s) + drift * k)
        const y = wrap(fall)
        ctx.globalAlpha = [0.55, 0.75, 0.9][f.z]
        ctx.drawImage(sprite, x * W - f.r, y * H - f.r, f.r * 2, f.r * 2)
      }
      ctx.globalAlpha = 1
    },
  }
}

/* ------------------------------------------------------------- mount */

const CSS = (s) => `
${s}{position:absolute;inset:0;overflow:hidden;background:#0f2a44;contain:strict}
${s} .l{position:absolute;left:-4%;top:-4%;width:108%;height:108%;will-change:transform}
${s} .l img{position:absolute;inset:0;width:100%;height:100%;display:block}
${s} canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none}
${s} .smoke{position:absolute;width:3%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(200,215,230,.38),rgba(200,215,230,0) 70%);filter:blur(2px);animation:${s.slice(1)}-smoke 7s linear infinite;opacity:0}
${s} .flicker{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,190,100,.32),rgba(255,170,80,0) 70%);mix-blend-mode:screen;animation:${s.slice(1)}-flicker 3.4s ease-in-out infinite alternate}
${s} .grain{position:absolute;inset:0;pointer-events:none;opacity:.35;mix-blend-mode:overlay}
${s} .sway{position:absolute;inset:0;animation:${s.slice(1)}-sway 7s ease-in-out infinite alternate}
@keyframes ${s.slice(1)}-smoke{0%{transform:translate(0,0) scale(.6);opacity:0}15%{opacity:.9}100%{transform:translate(-60%,-900%) scale(3.2);opacity:0}}
@keyframes ${s.slice(1)}-sway{from{transform:rotate(-.35deg)}to{transform:rotate(.35deg)}}
@keyframes ${s.slice(1)}-flicker{0%{opacity:.7}40%{opacity:1}55%{opacity:.82}100%{opacity:.95}}
@media (prefers-reduced-motion: reduce){${s} *{animation:none!important}}
`

const blobURL = (svg) => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))

/**
 * Mounts the full winter scene (hero, and the last frame of the intro).
 * returns { root, world, layout(), tick(dt, t, opts), setParallax(x, y), get layoutInfo, ready, dispose() }
 */
export function mountWinter(host, { motion = true, frost = true } = {}) {
  const id = `sgw${Math.random().toString(36).slice(2, 7)}`
  const root = document.createElement('div')
  root.className = id
  root.setAttribute('aria-hidden', 'true')
  const style = document.createElement('style')
  style.textContent = CSS(`.${id}`)
  root.appendChild(style)
  host.appendChild(root)
  const world = document.createElement('div')
  world.style.cssText = 'position:absolute;inset:0;will-change:transform'
  root.appendChild(world)
  const layer = (depth) => {
    const node = document.createElement('div')
    node.className = 'l'
    node.dataset.depth = depth
    world.appendChild(node)
    return node
  }
  const skyL = layer(0.12)
  const snowBack = document.createElement('canvas')
  world.appendChild(snowBack)
  const landL = layer(0.45)
  const fxL = layer(0.45)
  const snowFront = document.createElement('canvas')
  world.appendChild(snowFront)
  const frontL = layer(1)
  const frostC = document.createElement('canvas')
  if (frost) root.appendChild(frostC)
  const grain = document.createElement('div')
  grain.className = 'grain'
  grain.style.backgroundImage = `url(${grainTile(200, 9, 1.4)})`
  root.appendChild(grain)

  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const back = createSnow(snowBack, { count: small ? 90 : 170 })
  const front = createSnow(snowFront, { count: small ? 26 : 48 })

  let urls = []
  let L = null
  let size = { W: 0, H: 0 }
  let ready = Promise.resolve()
  const layout = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    const portrait = W / H < 0.9
    if (size.W === W && Math.abs(size.H - H) / H < 0.18 && size.portrait === portrait) return ready
    size = { W, H, portrait }
    urls.forEach((u) => URL.revokeObjectURL(u))
    urls = []
    const art = paintWinter(W, H)
    L = art.L
    const imgs = []
    const picture = (node, svg) => {
      const url = blobURL(svg)
      urls.push(url)
      const img = new Image()
      img.alt = ''
      img.decoding = 'async'
      img.src = url
      node.appendChild(img)
      imgs.push(img)
    }
    for (const [node, svg] of [[skyL, art.sky], [landL, art.land]]) {
      node.replaceChildren()
      picture(node, svg)
    }
    // the framing firs sway a little from their roots; phases come from the document clock so
    // the intro's copy of the scene and the page hero move in step while they cross-fade
    const ox = W * 0.04
    const oy = H * 0.04
    const now = performance.now() / 1000
    frontL.replaceChildren()
    if (motion) {
      art.trees.forEach((tree, i) => {
        const sway = document.createElement('div')
        sway.className = 'sway'
        const period = 6 + i * 1.3
        Object.assign(sway.style, { transformOrigin: `${tree.x + ox}px ${tree.y + oy}px`, animationDuration: `${period}s`, animationDelay: `${-((now + i * 2.1) % (period * 2))}s` })
        picture(sway, tree.svg)
        frontL.appendChild(sway)
      })
      picture(frontL, art.drift)
    } else picture(frontL, art.front)
    // chimney smoke and the flicker of firelight, in the overscanned layer's coordinates
    fxL.replaceChildren()
    const cs = L.chaletW
    const kx = L.chaletX + cs * 0.21 + ox
    const ky = L.ground - cs * 1.04 + oy
    for (let i = 0; i < 4; i += 1) {
      const puff = document.createElement('div')
      puff.className = 'smoke'
      Object.assign(puff.style, { left: `${kx - cs * 0.04}px`, top: `${ky}px`, width: `${cs * 0.08}px`, animationDelay: `${-((now + i * 1.75) % 7)}s` })
      fxL.appendChild(puff)
    }
    for (const [x, y, r] of [[-0.24, -0.36, 0.16], [0.24, -0.36, 0.16], [0, -0.8, 0.13], [0, -0.16, 0.14]]) {
      const glow = document.createElement('div')
      glow.className = 'flicker'
      Object.assign(glow.style, {
        left: `${L.chaletX + x * cs - r * cs + ox}px`,
        top: `${L.ground + y * cs - r * cs + oy}px`,
        width: `${r * cs * 2}px`,
        height: `${r * cs * 2}px`,
        animationDelay: `${-((now + x * 7 + y * 3) % 6.8)}s`,
      })
      fxL.appendChild(glow)
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    back.resize(W, H, dpr)
    front.resize(W, H, dpr)
    if (frost) paintFrost(frostC, W, H, Math.min(dpr, 1.5))
    ready = Promise.all(imgs.map((img) => img.decode().catch(() => {})))
    return ready
  }

  const par = { x: 0, y: 0, tx: 0, ty: 0 }
  const layers = [skyL, landL, fxL, frontL]
  layout()

  return {
    root,
    world,
    get layoutInfo() {
      return L
    },
    get ready() {
      return ready
    },
    layout,
    tick(dt, t, opts) {
      par.x += (par.tx - par.x) * 0.06
      par.y += (par.ty - par.y) * 0.06
      const W = size.W || 1
      for (let i = 0; i < layers.length; i += 1) {
        const d = Number(layers[i].dataset.depth)
        layers[i].style.transform = `translate3d(${(-par.x * d * W * 0.02).toFixed(2)}px,${(-par.y * d * W * 0.01).toFixed(2)}px,0)`
      }
      if (motion) {
        back.draw(dt, t, { wind: par.x * 0.5, ...opts })
        front.draw(dt, t, { wind: par.x, ...opts })
      }
    },
    setParallax(x, y) {
      par.tx = x
      par.ty = y
    },
    dispose() {
      urls.forEach((u) => URL.revokeObjectURL(u))
      root.remove()
    },
  }
}
