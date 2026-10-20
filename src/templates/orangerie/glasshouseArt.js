// Orangerie: a Victorian glasshouse at dawn, drawn as a botanical engraving
// with watercolour washes. Everything is generated SVG (rasterised once per
// size into <img> layers) plus a few CSS/canvas layers for light, mist and
// dust. Shared by the page hero and the fogged-glass intro.
//
// The drawing uses a tiny one-point perspective: world metres (X right,
// Y up, Z away from the viewer) projected onto the screen, so the cast-iron
// ribs, glazing bars and encaustic floor converge exactly like the real nave.
import { seeded, foilTile, grainTile } from '../../shared/intro/foil.js'

const R = 6 // half-span of the vault (m)
const SPRING = 4.6 // height where the arches spring from the columns
const CAM_Y = 1.9
const Z_NEAR = 2.2
const Z_FAR = 66
const INK = '#2f4a3a'
const IRON = '#fbfaf3'
const MIST = '#f2efe6'

export const PLAQUE_Z = 4.6

const n2 = (v) => Math.round(v * 10) / 10
const n3 = (v) => Math.round(v * 1000) / 1000

/* ------------------------------------------------------------ camera */

export function makeCamera(W, H) {
  const portrait = W / H < 0.9
  const fov = portrait ? 64 : 48
  const f = H / (2 * Math.tan((fov * Math.PI) / 360))
  return { W, H, f, cx: W / 2, cy: H * 0.6, portrait }
}

const project = (cam, X, Y, Z) => [cam.cx + (cam.f * X) / Z, cam.cy - (cam.f * (Y - CAM_Y)) / Z]
const pt = (cam, X, Y, Z) => {
  const [x, y] = project(cam, X, Y, Z)
  return `${n2(x)} ${n2(y)}`
}

/* ------------------------------------------------- plant drawing kit */
// All plant shapes are built in metres with the root at 0,0 and up = -y.

function lens(ax, ay, dx, dy, len, width) {
  const qx = -dy
  const qy = dx
  const mx = ax + dx * len * 0.5
  const my = ay + dy * len * 0.5
  return `M${n3(ax)} ${n3(ay)}Q${n3(mx + qx * width)} ${n3(my + qy * width)} ${n3(ax + dx * len)} ${n3(ay + dy * len)}Q${n3(mx - qx * width)} ${n3(my - qy * width)} ${n3(ax)} ${n3(ay)}Z`
}

function norm(x, y) {
  const l = Math.hypot(x, y) || 1
  return [x / l, y / l]
}

// A pinnate frond (fern or feather palm) along a quadratic curve.
function frond(rand, { ox = 0, oy = 0, len, angle, droop = 0.3, lift = 0.15, width, pairs = 16, lobes = 0, palm = false }) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  const ex = ox + dx * len
  const ey = oy + dy * len + droop * len
  const cx = ox + dx * len * 0.55
  const cy = oy + dy * len * 0.55 - lift * len
  const rachis = `M${n3(ox)} ${n3(oy)}Q${n3(cx)} ${n3(cy)} ${n3(ex)} ${n3(ey)}`
  let leaves = ''
  for (let i = 0; i < pairs; i += 1) {
    const t = (i + 0.6) / (pairs + 0.4)
    const u = 1 - t
    const px = u * u * ox + 2 * u * t * cx + t * t * ex
    const py = u * u * oy + 2 * u * t * cy + t * t * ey
    const [tx, ty] = norm(2 * u * (cx - ox) + 2 * t * (ex - cx), 2 * u * (cy - oy) + 2 * t * (ey - cy))
    const l = width * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * t)), 0.7) * (1 - 0.5 * t) * (0.85 + rand() * 0.3)
    for (const side of [-1, 1]) {
      const nx = -ty * side
      const ny = tx * side
      const [ddx, ddy] = palm ? norm(nx * 0.7 + tx * 0.55, ny * 0.7 + ty * 0.55 + 0.75) : norm(nx + tx * 0.6, ny + ty * 0.6 + 0.12)
      if (lobes) {
        // fern pinna made of rounded pinnules either side of its rib
        leaves += lens(px, py, ddx, ddy, l, l * 0.05)
        for (let k = 0; k < lobes; k += 1) {
          const s = (k + 0.5) / lobes
          const bx = px + ddx * l * s * 0.92
          const by = py + ddy * l * s * 0.92
          const lobe = l * 0.3 * (1 - s * 0.7)
          for (const s2 of [-1, 1]) {
            const [lx, ly] = norm(ddx + -ddy * s2 * 1.4, ddy + ddx * s2 * 1.4)
            leaves += lens(bx, by, lx, ly, lobe, lobe * 0.42)
          }
        }
      } else {
        leaves += lens(px, py, ddx, ddy, l, l * (palm ? 0.07 : 0.22))
      }
    }
  }
  return { rachis, leaves }
}

// Monstera leaf with its deep slits and holes; base at 0,0 pointing up (-y).
function monsteraLeaf(rand, L) {
  const w = (s) => 0.52 * L * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.94 + 0.06)), 0.55) * (1 - 0.2 * s)
  const y = (s) => -(s * 1.06 - 0.04) * L
  const cuts = [0.16, 0.29, 0.42, 0.55, 0.68, 0.8].map((k) => k + (rand() - 0.5) * 0.03)
  const edge = (side) => {
    const out = []
    let s = 0.985
    while (s > 0.03) {
      const cut = cuts.find((k) => k <= s && k > s - 0.02)
      out.push([side * w(s), y(s)])
      if (cut) {
        // a slit from the margin almost to the midrib, angled toward the tip
        const depth = 0.24 + rand() * 0.14
        out.push([side * w(cut) * depth, y(cut) - 0.07 * L])
        out.push([side * w(cut - 0.035) * (depth + 0.04), y(cut - 0.035) - 0.062 * L])
        out.push([side * w(cut - 0.045), y(cut - 0.045)])
        s = cut - 0.05
      } else {
        s -= 0.02
      }
    }
    out.push([side * w(0.03) * 0.8, y(0.0)])
    return out
  }
  const left = edge(-1)
  const right = edge(1).reverse()
  let d = `M0 ${n3(-1.02 * L)}`
  left.forEach(([x, yy]) => (d += `L${n3(x)} ${n3(yy)}`))
  d += `L0 ${n3(-0.05 * L)}`
  right.forEach(([x, yy]) => (d += `L${n3(x)} ${n3(yy)}`))
  d += 'Z'
  // a row of oval holes beside the midrib
  ;[0.22, 0.35, 0.48, 0.61, 0.74].forEach((s) => {
    for (const side of [-1, 1]) {
      if (rand() < 0.2) continue
      const cx = side * w(s) * 0.15
      const cy = y(s) - 0.03 * L
      const rx = 0.028 * L
      const ry = 0.014 * L
      d += `M${n3(cx - rx)} ${n3(cy)}a${n3(rx)} ${n3(ry)} 0 1 0 ${n3(rx * 2)} 0a${n3(rx)} ${n3(ry)} 0 1 0 ${n3(-rx * 2)} 0Z`
    }
  })
  let veins = `M0 0L0 ${n3(-1.0 * L)}`
  for (let i = 1; i < cuts.length; i += 1) {
    const s = (cuts[i] + cuts[i - 1]) / 2
    for (const side of [-1, 1]) veins += `M0 ${n3(y(s - 0.04))}Q${n3(side * w(s) * 0.45)} ${n3(y(s) - 0.02 * L)} ${n3(side * w(s) * 0.9)} ${n3(y(s) - 0.07 * L)}`
  }
  return { d, veins }
}

const g = (inner, transform) => `<g transform="${transform}">${inner}</g>`

// Shared leaf geometry: each outline is stored once in <defs> and drawn twice
// (watercolour wash + ink) through <use>, which keeps the SVG small.
let registry = new Map()
const shape = (d) => {
  const id = `s${registry.size}`
  registry.set(id, d)
  return id
}
const defsFor = (inner) => {
  const ids = new Set(Array.from(inner.matchAll(/href="#(s\d+)"/g), (m) => m[1]))
  let out = ''
  ids.forEach((id) => (out += `<path id="${id}" d="${registry.get(id)}"/>`))
  return out
}

// Each species: { wash, ink } SVG fragments in metres.
function fernClump(seed, { size = 1, lobes = 2 } = {}) {
  const rand = seeded(seed)
  let wash = ''
  let ink = ''
  const count = 11
  for (let i = 0; i < count; i += 1) {
    const a = -Math.PI * (0.1 + 0.8 * (i + rand() * 0.6) / count)
    const horizontal = Math.abs(Math.cos(a))
    const fr = frond(rand, { len: size * (0.62 + rand() * 0.4), angle: a, droop: 0.15 + horizontal * 0.45, lift: 0.18, width: size * 0.15, pairs: 15, lobes })
    const tone = ['#8db27f', '#6f9a66', '#a7c4a0', '#5d8a5a'][i % 4]
    const id = shape(fr.leaves)
    wash += `<use href="#${id}" fill="${tone}" fill-opacity=".86"/>`
    ink += `<path d="${fr.rachis}"/><use href="#${id}" stroke-opacity=".55"/>`
  }
  return { wash, ink }
}

function palm(seed, height) {
  const rand = seeded(seed)
  // slender ringed trunk with a gentle lean
  const lean = (rand() - 0.5) * 0.5
  const top = [lean, -height]
  const trunk = `M-0.2 0C-0.18 ${-height * 0.4} ${lean - 0.16} ${-height * 0.7} ${lean - 0.12} ${-height}L${lean + 0.12} ${-height}C${lean + 0.16} ${-height * 0.7} 0.18 ${-height * 0.4} 0.2 0Z`
  let wash = `<path d="${trunk}" fill="#b9ad92"/><path d="${trunk}" fill="url(#trunkShade)"/>`
  let ink = `<path d="${trunk}"/>`
  for (let y = -0.25; y > -height; y -= 0.22) {
    const k = -y / height
    const x = lean * k * k
    const half = 0.2 - 0.08 * k
    ink += `<path d="M${n3(x - half)} ${n3(y)}q${n3(half)} 0.05 ${n3(half * 2)} 0" stroke-opacity=".6"/>`
  }
  const fronds = 14
  for (let i = 0; i < fronds; i += 1) {
    const a = -Math.PI * (0.02 + 0.96 * (i + rand() * 0.5) / fronds)
    const horizontal = Math.abs(Math.cos(a))
    const fr = frond(rand, { ox: top[0], oy: top[1], len: 2.4 + rand() * 0.9, angle: a, droop: 0.35 + horizontal * 0.55, lift: 0.3, width: 0.75, pairs: 22, palm: true })
    const tone = ['#7f9f6c', '#5f8a5a', '#a2bd8c', '#4f7350'][i % 4]
    const id = shape(fr.leaves)
    wash += `<use href="#${id}" fill="${tone}" fill-opacity=".85"/>`
    ink += `<path d="${fr.rachis}"/><use href="#${id}" stroke-opacity=".45"/>`
  }
  return { wash, ink }
}

function treeFern(seed, height) {
  const rand = seeded(seed)
  const trunk = `M-0.26 0C-0.22 ${-height * 0.5} -0.2 ${-height * 0.8} -0.2 ${-height}L0.2 ${-height}C0.2 ${-height * 0.8} 0.22 ${-height * 0.5} 0.26 0Z`
  let wash = `<path d="${trunk}" fill="#8a6f55"/><path d="${trunk}" fill="url(#trunkShade)"/>`
  let ink = `<path d="${trunk}"/>`
  for (let i = 0; i < 26; i += 1) {
    const x = (rand() - 0.5) * 0.4
    const y = -rand() * height
    ink += `<path d="M${n3(x)} ${n3(y)}l${n3((rand() - 0.5) * 0.06)} ${n3(-0.12 - rand() * 0.16)}" stroke-opacity=".7"/>`
  }
  for (let i = 0; i < 13; i += 1) {
    const a = -Math.PI * (0.03 + 0.94 * (i + rand() * 0.5) / 13)
    const horizontal = Math.abs(Math.cos(a))
    const fr = frond(rand, { ox: 0, oy: -height, len: 1.7 + rand() * 0.6, angle: a, droop: 0.25 + horizontal * 0.5, lift: 0.22, width: 0.36, pairs: 18, lobes: 2 })
    const tone = ['#8db27f', '#6f9a66', '#a7c4a0', '#557e55'][i % 4]
    const id = shape(fr.leaves)
    wash += `<use href="#${id}" fill="${tone}" fill-opacity=".85"/>`
    ink += `<path d="${fr.rachis}"/><use href="#${id}" stroke-opacity=".45"/>`
  }
  return { wash, ink }
}

function monsteraClump(seed, size = 1) {
  const rand = seeded(seed)
  let wash = ''
  let ink = ''
  const count = 6
  for (let i = 0; i < count; i += 1) {
    const a = -Math.PI * (0.18 + 0.64 * (i + rand() * 0.7) / count)
    const len = size * (0.55 + rand() * 0.45)
    const ex = Math.cos(a) * len
    const ey = Math.sin(a) * len * 0.9
    ink += `<path d="M0 0Q${n3(ex * 0.3)} ${n3(ey * 0.8)} ${n3(ex)} ${n3(ey)}"/>`
    wash += `<path d="M0 0Q${n3(ex * 0.3)} ${n3(ey * 0.8)} ${n3(ex)} ${n3(ey)}" stroke="#6f8f5a" stroke-width="${n3(size * 0.025)}" fill="none"/>`
    const leaf = monsteraLeaf(rand, size * (0.5 + rand() * 0.25))
    const rot = ((a + Math.PI / 2) * 180) / Math.PI * 0.8 + (rand() - 0.5) * 20
    const sx = 0.75 + rand() * 0.25 // foreshortening
    const tf = `translate(${n3(ex)} ${n3(ey)}) rotate(${n2(rot)}) scale(${n3(sx)} 1)`
    const tone = ['#3e6b4c', '#4f7d55', '#2f5a40'][i % 3]
    const id = shape(leaf.d)
    wash += g(`<use href="#${id}" fill="${tone}" fill-rule="evenodd"/><use href="#${id}" fill="url(#leafSheen)" fill-rule="evenodd"/>`, tf)
    ink += g(`<use href="#${id}"/><path d="${leaf.veins}" stroke="#d7e4c4" stroke-opacity=".55"/>`, tf)
  }
  return { wash, ink }
}

function begoniaClump(seed, size = 1) {
  const rand = seeded(seed)
  let wash = ''
  let ink = ''
  for (let i = 0; i < 4; i += 1) {
    const a = -Math.PI * (0.15 + 0.7 * i / 3) + (rand() - 0.5) * 0.3
    const x = Math.cos(a) * 0.16 * size
    const y = Math.sin(a) * 0.1 * size - 0.04 * size
    const rx = 0.13 * size
    const ry = 0.08 * size
    const rot = (a * 180) / Math.PI
    const leaf = `<ellipse cx="${n3(rx * 0.9)}" cy="0" rx="${n3(rx)}" ry="${n3(ry)}"/>`
    wash += g(leaf.replace('/>', ' fill="#5d6b46"/>'), `translate(${n3(x)} ${n3(y)}) rotate(${n2(rot)})`)
    wash += g(`<ellipse cx="${n3(rx * 0.9)}" cy="0" rx="${n3(rx * 0.55)}" ry="${n3(ry * 0.45)}" fill="#c9d3b8" fill-opacity=".45"/>`, `translate(${n3(x)} ${n3(y)}) rotate(${n2(rot)})`)
    ink += g(leaf, `translate(${n3(x)} ${n3(y)}) rotate(${n2(rot)})`)
  }
  for (let i = 0; i < 7; i += 1) {
    const x = (rand() - 0.5) * 0.36 * size
    const y = -(0.12 + rand() * 0.18) * size
    const s = (0.035 + rand() * 0.02) * size
    const tone = ['#e8a0a0', '#f2bcb6', '#d9828a'][i % 3]
    const flower = `<ellipse cx="${n3(-s)}" cy="0" rx="${n3(s)}" ry="${n3(s * 0.8)}"/><ellipse cx="${n3(s)}" cy="0" rx="${n3(s)}" ry="${n3(s * 0.8)}"/><ellipse cx="0" cy="${n3(-s * 0.8)}" rx="${n3(s * 0.5)}" ry="${n3(s * 0.7)}"/><ellipse cx="0" cy="${n3(s * 0.8)}" rx="${n3(s * 0.5)}" ry="${n3(s * 0.7)}"/>`
    ink += `<path d="M${n3(x * 0.4)} ${n3(-0.05 * size)}L${n3(x)} ${n3(y)}" stroke-opacity=".5"/>`
    wash += g(flower, `translate(${n3(x)} ${n3(y)}) rotate(${n2(rand() * 60)})`).replace('<g ', `<g fill="${tone}" `)
    wash += `<circle cx="${n3(x)}" cy="${n3(y)}" r="${n3(s * 0.3)}" fill="#f1cf6d"/>`
    ink += g(flower, `translate(${n3(x)} ${n3(y)}) rotate(${n2(rand() * 60)})`).replace('<g ', '<g stroke-opacity=".55" ')
  }
  return { wash, ink }
}

function hangingBasket(seed, chain) {
  const rand = seeded(seed)
  let wash = `<path d="M-0.34 0Q0 0.5 0.34 0Z" fill="#6c6a4c"/><path d="M-0.36 -0.02Q0 0.08 0.36 -0.02" stroke="#7f8f5c" stroke-width="0.08" fill="none"/>`
  let ink = `<path d="M0 ${n3(-chain)}L0 -0.25M-0.3 0L0 -0.25L0.3 0"/><path d="M-0.34 0Q0 0.5 0.34 0Z"/><path d="M-0.25 0.08Q0 0.3 0.25 0.08M-0.15 0.02L-0.05 0.3M0.15 0.02L0.05 0.3" stroke-opacity=".6"/>`
  for (let i = 0; i < 12; i += 1) {
    const a = Math.PI * (0.08 + 0.84 * (i + rand() * 0.5) / 12)
    const fr = frond(rand, { ox: 0, oy: 0, len: 0.9 + rand() * 0.7, angle: a, droop: 0.45, lift: -0.05, width: 0.12, pairs: 14, lobes: 1 })
    const tone = ['#8db27f', '#a7c4a0', '#6f9a66'][i % 3]
    const id = shape(fr.leaves)
    wash += `<use href="#${id}" fill="${tone}" fill-opacity=".85"/>`
    ink += `<path d="${fr.rachis}"/><use href="#${id}" stroke-opacity=".45"/>`
  }
  return { wash, ink }
}

/* --------------------------------------------------- shared defs */

const DEFS = `
<filter id="wc" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feComposite in="d" in2="d" operator="arithmetic" k1="0" k2="0.94" k3="0" k4="0"/>
</filter>
<filter id="cloud" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="14"/>
</filter>
<linearGradient id="trunkShade" x1="0" x2="1"><stop offset="0" stop-color="#3b3a2a" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#2b2a1e" stop-opacity=".45"/></linearGradient>
<linearGradient id="leafSheen" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#e9f3d8" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
`

const svgDoc = (vb, inner, width = vb.split(' ')[2], height = vb.split(' ')[3]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"><defs>${DEFS}${defsFor(inner)}</defs>${inner}</svg>`


// Places a species at a world position; the ink keeps a fixed hairline weight on screen.
function plant(cam, key, X, Z, { flip = false, filter = true, inkOpacity = 0.85, Y = 0 } = {}) {
  const [x, y] = project(cam, X, Y, Z)
  const s = cam.f / Z
  const tf = `translate(${n2(x)} ${n2(y)}) scale(${n3(flip ? -s : s)} ${n3(s)})`
  const wash = `<use href="#${key}w" transform="${tf}"/>`
  return `${filter ? `<g filter="url(#wc)">${wash}</g>` : wash}<use href="#${key}i" transform="${tf}" stroke-opacity="${inkOpacity}" stroke-width="${n3(0.6 / s)}"/>`
}

/* ------------------------------------------------------- sky layer */

function skySVG(cam, vb) {
  const { W, H, cx, cy } = cam
  const sunX = cx - W * 0.28
  const sunY = cy - H * 0.22
  return svgDoc(
    vb,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d7e2d4"/><stop offset=".45" stop-color="#eef0e6"/><stop offset=".7" stop-color="#f7eadb"/><stop offset="1" stop-color="#e9e6d6"/>
    </linearGradient>
    <radialGradient id="sun" cx="${n2(sunX)}" cy="${n2(sunY)}" r="${n2(Math.max(W, H) * 0.7)}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#fff8e8"/><stop offset=".18" stop-color="#fbe3cf" stop-opacity=".9"/><stop offset=".45" stop-color="#f3cdc4" stop-opacity=".35"/><stop offset="1" stop-color="#f3cdc4" stop-opacity="0"/>
    </radialGradient>
    <rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#sky)"/>
    <rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#sun)"/>
    <g filter="url(#cloud)" opacity=".55">
      <ellipse cx="${n2(W * 0.2)}" cy="${n2(H * 0.18)}" rx="${n2(W * 0.4)}" ry="${n2(H * 0.06)}" fill="#ffffff"/>
      <ellipse cx="${n2(W * 0.85)}" cy="${n2(H * 0.3)}" rx="${n2(W * 0.35)}" ry="${n2(H * 0.05)}" fill="#e3ecdf"/>
      <ellipse cx="${n2(W * 0.5)}" cy="${n2(cy)}" rx="${n2(W * 0.7)}" ry="${n2(H * 0.08)}" fill="#fbf4ea"/>
    </g>
    <g fill="#9fb59a" fill-opacity=".22" filter="url(#cloud)">
      <ellipse cx="${n2(W * 0.08)}" cy="${n2(cy + H * 0.02)}" rx="${n2(W * 0.25)}" ry="${n2(H * 0.09)}"/>
      <ellipse cx="${n2(W * 0.95)}" cy="${n2(cy + H * 0.03)}" rx="${n2(W * 0.3)}" ry="${n2(H * 0.1)}"/>
    </g>`,
  )
}

/* ------------------------------------------- iron, glass and floor */

function ribPath(cam, Z, base = 0) {
  const r = (cam.f * R) / Z
  return `M${pt(cam, -R, base, Z)}L${pt(cam, -R, SPRING, Z)}A${n2(r)} ${n2(r)} 0 0 1 ${pt(cam, R, SPRING, Z)}L${pt(cam, R, base, Z)}`
}

function floorSVG(cam) {
  let out = ''
  // planting beds
  out += `<path d="M${pt(cam, -1.35, 0, Z_NEAR)}L${pt(cam, -1.35, 0, Z_FAR)}L${pt(cam, -R, 0, Z_FAR)}L${pt(cam, -R, 0, Z_NEAR)}Z" fill="#6b6247"/>`
  out += `<path d="M${pt(cam, 1.35, 0, Z_NEAR)}L${pt(cam, 1.35, 0, Z_FAR)}L${pt(cam, R, 0, Z_FAR)}L${pt(cam, R, 0, Z_NEAR)}Z" fill="#6b6247"/>`
  // moss on the beds
  out += `<path d="M${pt(cam, -1.35, 0, Z_NEAR)}L${pt(cam, -1.35, 0, Z_FAR)}L${pt(cam, -R, 0, Z_FAR)}L${pt(cam, -R, 0, Z_NEAR)}Z" fill="#7f9a62" fill-opacity=".5" filter="url(#wc)"/>`
  out += `<path d="M${pt(cam, 1.35, 0, Z_NEAR)}L${pt(cam, 1.35, 0, Z_FAR)}L${pt(cam, R, 0, Z_FAR)}L${pt(cam, R, 0, Z_NEAR)}Z" fill="#7f9a62" fill-opacity=".5" filter="url(#wc)"/>`
  // the path: Victorian encaustic tiles in cream, terracotta and fern green
  out += `<path d="M${pt(cam, -1.2, 0, Z_NEAR)}L${pt(cam, -1.2, 0, Z_FAR)}L${pt(cam, 1.2, 0, Z_FAR)}L${pt(cam, 1.2, 0, Z_NEAR)}Z" fill="#ece3cf"/>`
  let tiles = ''
  let diamonds = ''
  let greens = ''
  const step = 0.6
  for (let z = Z_NEAR, row = 0; z < 34; z += step, row += 1) {
    for (let c = 0; c < 4; c += 1) {
      const x0 = -1.2 + c * step
      const x1 = x0 + step
      const xm = (x0 + x1) / 2
      const zm = z + step / 2
      tiles += `M${pt(cam, x0, 0, z)}L${pt(cam, x1, 0, z)}L${pt(cam, x1, 0, z + step)}L${pt(cam, x0, 0, z + step)}Z`
      const dia = `M${pt(cam, xm, 0, z + 0.04)}L${pt(cam, x1 - 0.04, 0, zm)}L${pt(cam, xm, 0, z + step - 0.04)}L${pt(cam, x0 + 0.04, 0, zm)}Z`
      if ((row + c) % 2 === 0) diamonds += dia
      else greens += `M${pt(cam, xm - 0.09, 0, zm)}L${pt(cam, xm, 0, zm - 0.09)}L${pt(cam, xm + 0.09, 0, zm)}L${pt(cam, xm, 0, zm + 0.09)}Z`
    }
  }
  out += `<path d="${diamonds}" fill="#c07a5c" fill-opacity=".85"/><path d="${greens}" fill="#55735c" fill-opacity=".85"/>`
  out += `<path d="${tiles}" fill="none" stroke="#8b7a62" stroke-opacity=".5" stroke-width=".6"/>`
  // terracotta rope-top edging
  for (const side of [-1, 1]) {
    out += `<path d="M${pt(cam, side * 1.2, 0, Z_NEAR)}L${pt(cam, side * 1.2, 0, Z_FAR)}L${pt(cam, side * 1.35, 0.12, Z_FAR)}L${pt(cam, side * 1.35, 0.12, Z_NEAR)}Z" fill="#b5694b"/>`
    out += `<path d="M${pt(cam, side * 1.2, 0, Z_NEAR)}L${pt(cam, side * 1.2, 0, Z_FAR)}M${pt(cam, side * 1.35, 0.12, Z_NEAR)}L${pt(cam, side * 1.35, 0.12, Z_FAR)}" stroke="${INK}" stroke-opacity=".6" stroke-width=".7" fill="none"/>`
  }
  // engraved furrows across the beds
  let furrows = ''
  for (let z = Z_NEAR + 0.4; z < 40; z += z < 10 ? 0.35 : 0.9) {
    for (const side of [-1, 1]) furrows += `M${pt(cam, side * 1.4, 0, z)}L${pt(cam, side * R, 0, z)}`
  }
  out += `<path d="${furrows}" stroke="${INK}" stroke-opacity=".16" stroke-width=".6" fill="none"/>`
  // light falling across the floor
  out += `<path d="M${pt(cam, -1.2, 0, 7)}L${pt(cam, 1.2, 0, 9)}L${pt(cam, 1.2, 0, 13)}L${pt(cam, -1.2, 0, 11)}Z" fill="#fff6dc" fill-opacity=".35" filter="url(#wc)"/>`
  return out
}

function ironSVG(cam, zMin, zMax) {
  let ribs = ''
  let thin = ''
  let rings = ''
  // main cast-iron ribs every 4 m, finer glazing arches every metre
  for (let z = 6; z < Z_FAR; z += 1) {
    if (z < zMin || z >= zMax) continue
    if (z % 4 === 2) {
      const w = Math.max(0.8, (cam.f * 0.16) / z)
      const d = ribPath(cam, z)
      ribs += `<path d="${d}" stroke="${INK}" stroke-opacity=".55" stroke-width="${n2(w + 1.4)}"/><path d="${d}" stroke="${IRON}" stroke-width="${n2(w)}"/>`
      // spandrel brackets and rings
      for (const side of [-1, 1]) {
        const a = (160 * Math.PI) / 180
        const bx = side * R * -Math.cos(a)
        const by = SPRING + R * Math.sin(a)
        const brace = `M${pt(cam, side * R, SPRING - 1.2, z)}Q${pt(cam, side * (R - 1.2), SPRING - 0.2, z)} ${pt(cam, bx, by, z)}`
        const bw = Math.max(0.5, (cam.f * 0.06) / z)
        rings += `<path d="${brace}" stroke="${INK}" stroke-opacity=".45" stroke-width="${n2(bw + 1)}"/><path d="${brace}" stroke="${IRON}" stroke-width="${n2(bw)}"/>`
        const [rx, ry] = project(cam, side * (R - 0.75), SPRING + 0.35, z)
        const rr = (cam.f * 0.32) / z
        rings += `<circle cx="${n2(rx)}" cy="${n2(ry)}" r="${n2(rr)}" stroke="${INK}" stroke-opacity=".45" stroke-width="${n2(bw + 1)}"/><circle cx="${n2(rx)}" cy="${n2(ry)}" r="${n2(rr)}" stroke="${IRON}" stroke-width="${n2(bw)}"/>`
        // capital
        const [kx, ky] = project(cam, side * R, SPRING, z)
        const kw = (cam.f * 0.34) / z
        rings += `<rect x="${n2(kx - kw / 2)}" y="${n2(ky - kw * 0.2)}" width="${n2(kw)}" height="${n2(kw * 0.35)}" fill="${IRON}" stroke="${INK}" stroke-opacity=".5" stroke-width=".6"/>`
      }
    } else {
      thin += `<path d="${ribPath(cam, z, 0.6)}"/>`
    }
  }
  return `<g fill="none" stroke-linecap="round">${ribs}${rings}<g stroke="${IRON}" stroke-opacity=".95" stroke-width="1">${thin}</g></g>`
}

function barsSVG(cam) {
  // purlins along the vault and rails along the side walls: straight lines in perspective
  let d = ''
  for (let k = 1; k < 16; k += 1) {
    const a = (Math.PI * k) / 16
    const X = Math.cos(a) * R
    const Y = SPRING + Math.sin(a) * R
    d += `M${pt(cam, X, Y, Z_NEAR + 0.5)}L${pt(cam, X, Y, Z_FAR)}`
  }
  for (const Y of [0.6, 2.1, 3.4]) {
    for (const side of [-1, 1]) d += `M${pt(cam, side * R, Y, Z_NEAR + 0.5)}L${pt(cam, side * R, Y, Z_FAR)}`
  }
  return `<g fill="none" stroke-linecap="round"><path d="${d}" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/><path d="${d}" stroke="${IRON}" stroke-width="1.1"/></g>`
}

function endWallSVG(cam) {
  const Z = Z_FAR
  const [cx, cy] = project(cam, 0, SPRING, Z)
  const r = (cam.f * R) / Z
  let d = ribPath(cam, Z)
  // fan lunette
  for (let k = 1; k < 12; k += 1) {
    const a = Math.PI + (Math.PI * k) / 12
    d += `M${n2(cx + Math.cos(a) * r * 0.3)} ${n2(cy + Math.sin(a) * r * 0.3)}L${n2(cx + Math.cos(a) * r)} ${n2(cy + Math.sin(a) * r)}`
  }
  d += `M${n2(cx - r * 0.3)} ${n2(cy)}A${n2(r * 0.3)} ${n2(r * 0.3)} 0 0 1 ${n2(cx + r * 0.3)} ${n2(cy)}`
  d += `M${n2(cx - r * 0.65)} ${n2(cy)}A${n2(r * 0.65)} ${n2(r * 0.65)} 0 0 1 ${n2(cx + r * 0.65)} ${n2(cy)}`
  d += `M${pt(cam, -R, SPRING, Z)}L${pt(cam, R, SPRING, Z)}`
  for (const X of [-4.6, -3.2, -2, 2, 3.2, 4.6]) d += `M${pt(cam, X, 0, Z)}L${pt(cam, X, SPRING, Z)}`
  // the door with its fanlight
  const dr = (cam.f * 1.1) / Z
  d += `M${pt(cam, -1.1, 0, Z)}L${pt(cam, -1.1, 2.6, Z)}A${n2(dr)} ${n2(dr)} 0 0 1 ${pt(cam, 1.1, 2.6, Z)}L${pt(cam, 1.1, 0, Z)}M${pt(cam, 0, 0, Z)}L${pt(cam, 0, 3.7, Z)}`
  const glow = `<radialGradient id="endGlow" cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 1.6)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff9ec"/><stop offset=".6" stop-color="#fbeee0" stop-opacity=".7"/><stop offset="1" stop-color="#fbeee0" stop-opacity="0"/></radialGradient>`
  return `${glow}<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r * 1.6)}" fill="url(#endGlow)"/><path d="${d}" fill="none" stroke="#e9ece2" stroke-width="1.2"/>`
}

function mistBand(cam, opacity) {
  const { W, H, cx, cy } = cam
  return `<radialGradient id="mist${Math.round(opacity * 100)}" cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(Math.max(W, H) * 0.42)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${MIST}" stop-opacity="${opacity}"/><stop offset=".55" stop-color="${MIST}" stop-opacity="${opacity * 0.45}"/><stop offset="1" stop-color="${MIST}" stop-opacity="0"/></radialGradient><rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="url(#mist${Math.round(opacity * 100)})"/>`
}

/* --------------------------------------------------------- planting */

function speciesBank() {
  return {
    fern: [fernClump(3, { lobes: 0 }), fernClump(8, { lobes: 0 }), fernClump(13, { lobes: 0 })],
    fernFine: [fernClump(21, { lobes: 1 }), fernClump(34, { lobes: 1 })],
    palm: [palm(5, 7.4), palm(17, 8.4)],
    treeFern: [treeFern(9, 3.1), treeFern(27, 2.6)],
    monstera: [monsteraClump(11, 1.1), monsteraClump(19, 1.25)],
    begonia: [begoniaClump(7), begoniaClump(15), begoniaClump(23)],
    basket: [hangingBasket(31, 3.6), hangingBasket(41, 3.2)],
  }
}

// Plants sorted far → near so the nearer ones overlap correctly.
function planting(seed) {
  const rand = seeded(seed)
  const items = []
  const add = (type, X, Z, extra = {}) => items.push({ type, X, Z, v: Math.floor(rand() * 3), flip: rand() > 0.5, ...extra })
  add('palm', -4.1, 17)
  add('palm', 4.3, 29)
  add('palm', -3.8, 41)
  add('treeFern', 3.9, 13)
  add('treeFern', -4.3, 25)
  add('treeFern', 4.0, 37)
  add('monstera', -2.4, 9.5)
  add('monstera', 2.6, 21)
  add('monstera', -2.6, 33)
  for (let z = 5.6; z < 60; z += 1.3 + rand() * 1.1) {
    for (const side of [-1, 1]) {
      add(rand() > 0.35 ? 'fern' : 'fernFine', side * (1.9 + rand() * 1.6), z + rand() * 1.2)
      add(rand() > 0.5 ? 'fern' : 'fernFine', side * (3.8 + rand() * 1.9), z + rand() * 1.2)
      if (rand() > 0.3) add('begonia', side * (1.5 + rand() * 0.4), z + rand())
    }
  }
  for (const [X, Z] of [[-5.2, 7.5], [5.1, 9], [-5, 15], [5.3, 22]]) add('monstera', X, Z)
  for (const [X, Z] of [[-2.7, 8], [2.6, 12], [-2.5, 20], [2.7, 28]]) add('basket', X, Z, { Y: SPRING + Math.sqrt(R * R - X * X) - 3.6 })
  return items.sort((a, b) => b.Z - a.Z)
}

function plantsSVG(cam, bank, items, zMin, zMax, filter) {
  let out = ''
  const used = new Map()
  for (const it of items) {
    if (it.Z < zMin || it.Z >= zMax) continue
    const list = bank[it.type]
    const v = it.v % list.length
    const key = `p${it.type}${v}`
    used.set(key, list[v])
    const inkOpacity = Math.max(0.35, Math.min(0.9, 1.2 - it.Z / 50))
    out += plant(cam, key, it.X, it.Z, { flip: it.flip, filter, inkOpacity, Y: it.Y ?? 0 })
  }
  let defs = ''
  used.forEach((species, key) => {
    defs += `<g id="${key}w">${species.wash}</g><g id="${key}i" fill="none" stroke="${INK}">${species.ink}</g>`
  })
  return `<defs>${defs}</defs>${out}`
}

function pedestalSVG(cam) {
  const Z = PLAQUE_Z + 0.05
  const col = (x0, x1, y0, y1) => `M${pt(cam, x0, y0, Z)}L${pt(cam, x1, y0, Z)}L${pt(cam, x1, y1, Z)}L${pt(cam, x0, y1, Z)}Z`
  let d = col(-0.32, 0.32, 0, 0.12) + col(-0.24, 0.24, 0.12, 0.2) + col(-0.11, 0.11, 0.2, 0.86) + col(-0.2, 0.2, 0.86, 0.94)
  let flutes = ''
  for (const x of [-0.06, 0, 0.06]) flutes += `M${pt(cam, x, 0.24, Z)}L${pt(cam, x, 0.82, Z)}`
  // shadow pool on the tiles
  const [sx, sy] = project(cam, 0, 0, Z + 0.25)
  const sr = (cam.f * 0.9) / Z
  d = `<ellipse cx="${n2(sx)}" cy="${n2(sy)}" rx="${n2(sr)}" ry="${n2(sr * 0.18)}" fill="#3b4a3a" fill-opacity=".22" filter="url(#wc)"/><path d="${d}" fill="#34463a" stroke="${INK}" stroke-width=".8"/><path d="${flutes}" stroke="#7f9483" stroke-width=".8" fill="none"/>`
  return d
}

/* ------------------------------------------------- foreground items */

// Drawn in pixels (so the watercolour filter and hairlines behave) at the box's on-screen size.
function foregroundSVG(species, box, transform, pxW) {
  const [x, y, w, h] = box
  const k = pxW / w
  const pxH = h * k
  const tf = `scale(${n3(k)}) translate(${n3(-x)} ${n3(-y)}) ${transform}`
  return svgDoc(
    `0 0 ${n2(pxW)} ${n2(pxH)}`,
    `<g filter="url(#wc)"><g transform="${tf}">${species.wash}</g></g><g transform="${tf}" fill="none" stroke="${INK}" stroke-opacity=".9" stroke-width="${n3(0.8 / k)}">${species.ink}</g>`,
  )
}

/* ------------------------------------------------------------- art */

// Builds the SVG strings for every layer at the given viewport size.
export function paintGlasshouse(W, H) {
  registry = new Map()
  const cam = makeCamera(W, H)
  const ox = W * 0.04
  const oy = H * 0.04
  const vb = `${n2(-ox)} ${n2(-oy)} ${n2(W + ox * 2)} ${n2(H + oy * 2)}`
  const bank = speciesBank()
  const items = planting(cam.portrait ? 5 : 6)

  const back = svgDoc(
    vb,
    endWallSVG(cam) +
      mistBand(cam, 0.65) +
      floorSVG(cam) +
      barsSVG(cam) +
      ironSVG(cam, 36, Z_FAR) +
      plantsSVG(cam, bank, items, 36, Z_FAR, false) +
      mistBand(cam, 0.55) +
      ironSVG(cam, 18, 36) +
      plantsSVG(cam, bank, items, 24, 36, false) +
      mistBand(cam, 0.3) +
      ironSVG(cam, 6, 18),
  )
  const mid = svgDoc(vb, plantsSVG(cam, bank, items, 11, 24, true))
  const near = svgDoc(vb, plantsSVG(cam, bank, items, PLAQUE_Z + 0.4, 11, true) + pedestalSVG(cam))

  // big framing plants, each its own layer so it can sway
  const fgSize = cam.portrait ? W * 0.62 : Math.min(W * 0.3, H * 0.62)
  const fg = [
    {
      key: 'monstera',
      svg: foregroundSVG(bank.monstera[1], [-1.5, -2.1, 3, 2.15], '', fgSize),
      style: { left: -fgSize * 0.36, bottom: -fgSize * 0.1, width: fgSize, height: fgSize * (2.15 / 3) },
      origin: '45% 100%',
    },
    {
      key: 'fern',
      svg: foregroundSVG(fernClump(55, { size: 1, lobes: 3 }), [-1.25, -1.2, 2.5, 1.25], '', fgSize * 0.95),
      style: { right: -fgSize * 0.32, bottom: -fgSize * 0.06, width: fgSize * 0.95, height: fgSize * 0.95 * (1.25 / 2.5) },
      origin: '50% 100%',
    },
    {
      key: 'hanging',
      svg: foregroundSVG(hangingBasket(61, 1.2), [-1.6, -1.2, 3.2, 2.9], '', fgSize * 0.85),
      style: { left: -fgSize * 0.42, top: -fgSize * 0.12, width: fgSize * 0.85, height: fgSize * 0.85 * (2.9 / 3.2) },
      origin: '50% 0%',
    },
  ]
  if (!cam.portrait) {
    fg.push({
      key: 'palmfrond',
      svg: foregroundSVG(hangingBasket(73, 1.2), [-1.6, -1.2, 3.2, 2.9], 'scale(-1 1)', fgSize * 0.8),
      style: { right: -fgSize * 0.4, top: -fgSize * 0.16, width: fgSize * 0.8, height: fgSize * 0.8 * (2.9 / 3.2) },
      origin: '50% 0%',
    })
  }

  // plaque placement in screen pixels
  const [px, py] = project(cam, 0, 1.08, PLAQUE_Z)
  const plaque = { x: px, y: py, width: (cam.f * 1.7) / PLAQUE_Z }

  // god rays from the glass on the upper left down across the nave
  const rays = []
  const rand = seeded(12)
  for (let i = 0; i < 6; i += 1) {
    const z = 8 + i * 4.5 + rand() * 2
    const [x0, y0] = project(cam, -R + 0.4, SPRING + 3.4, z)
    const [x1, y1] = project(cam, 1.6 + rand() * 2, 0, z - 3)
    const w0 = (cam.f * (0.5 + rand() * 0.6)) / z
    const w1 = w0 * 2.4
    rays.push({ x0, y0, x1, y1, w0, w1, delay: rand() * 6 })
  }
  return { cam, sky: skySVG(cam, vb), back, mid, near, fg, plaque, rays }
}

/* ------------------------------------------------------------ mount */

const CSS = (s) => `
${s}{position:absolute;inset:0;overflow:hidden;background:${MIST};contain:strict}
${s} .l{position:absolute;left:-4%;top:-4%;width:108%;height:108%;will-change:transform}
${s} .l img{position:absolute;inset:0;width:100%;height:100%;display:block}
${s} .fg{position:absolute;will-change:transform}
${s} .fg img{width:100%;height:100%;display:block}
${s} .sway img{animation:${s.slice(1)}-sway 7s ease-in-out infinite alternate}
${s} .rays{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen}
${s} .rays polygon{animation:${s.slice(1)}-ray 9s ease-in-out infinite alternate}
${s} .mist{position:absolute;left:-30%;width:160%;pointer-events:none}
${s} .mist.a{bottom:-6%;height:42%;background:radial-gradient(50% 60% at 30% 70%,rgba(249,248,242,.85),transparent 70%),radial-gradient(40% 50% at 75% 60%,rgba(243,246,238,.75),transparent 70%);animation:${s.slice(1)}-drift 38s ease-in-out infinite alternate}
${s} .mist.b{top:34%;height:30%;background:radial-gradient(45% 50% at 60% 50%,rgba(250,248,240,.55),transparent 70%);animation:${s.slice(1)}-drift 52s ease-in-out -12s infinite alternate-reverse}
${s} canvas.motes{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
${s} .grain{position:absolute;inset:0;pointer-events:none;opacity:.55;mix-blend-mode:multiply}
${s} .plaque{position:absolute;transform:translate(-50%,-50%) perspective(600px) rotateX(24deg);transform-origin:50% 100%}
${s} .plaque .face{position:relative;display:grid;justify-items:center;align-content:center;gap:.18em;padding:.55em .8em .6em;border-radius:.42em;
  background:linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,247,214,.85) 46%,rgba(255,255,255,0) 60%) var(--sheen,140%) 0/300% 100% no-repeat,
  var(--foil),linear-gradient(180deg,#f1d58c 0%,#c99a3b 34%,#a77a24 55%,#e2bd6a 78%,#8f6618 100%);
  background-size:300% 100%,160px 160px,100% 100%;
  box-shadow:inset 0 0 0 .09em #7a5714,inset 0 0 0 .2em #e7c878,inset 0 0 0 .26em #8a6419,inset 0 .3em .5em rgba(255,240,200,.4),0 .5em 1.2em rgba(40,50,30,.35),0 .12em .2em rgba(40,50,30,.4);
  color:#4a360f;text-align:center;line-height:1;white-space:nowrap}
${s} .plaque .face::before,${s} .plaque .face::after{content:'';position:absolute;top:.34em;width:.32em;height:.32em;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3c4,#b88a2c 55%,#5f430e)}
${s} .plaque .face::before{left:.36em}
${s} .plaque .face::after{right:.36em}
${s} .plaque .names{font-family:Gloock,'Playfair Display',Georgia,serif;font-size:1em;letter-spacing:.01em;text-shadow:0 .03em 0 rgba(255,238,190,.75),0 -.02em 0 rgba(70,48,8,.45)}
${s} .plaque .names i{font-family:'Pinyon Script',cursive;font-style:normal;font-size:.9em;margin:0 .12em}
${s} .plaque .date{font-family:'EB Garamond',Georgia,serif;font-size:.3em;letter-spacing:.32em;text-transform:uppercase;text-shadow:0 .05em 0 rgba(255,238,190,.7)}
${s} .plaque .rule{width:56%;height:.05em;background:linear-gradient(90deg,transparent,#6b4d12,transparent);margin:.18em 0 .1em}
@keyframes ${s.slice(1)}-sway{from{transform:rotate(-1.1deg)}to{transform:rotate(1.3deg)}}
@keyframes ${s.slice(1)}-ray{from{opacity:.35}to{opacity:1}}
@keyframes ${s.slice(1)}-drift{from{transform:translateX(-6%)}to{transform:translateX(6%)}}
@media (prefers-reduced-motion: reduce){${s} *{animation:none!important}}
`

const svgBlob = (svg) => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))

function makeImg(parent, url) {
  const img = document.createElement('img')
  img.alt = ''
  img.decoding = 'async'
  img.draggable = false
  img.src = url
  parent.appendChild(img)
  return img
}

/**
 * Mounts the illustrated glasshouse in `host`.
 * options: { names: [a, b], date, motion }
 * returns { root, ready, layout(), setParallax(x, y), setPush(k), setSheen(v), snapshot(ctx, w, h, scale), dispose() }
 */
export function mountGlasshouse(host, { names = ['', ''], date = '', motion = true } = {}) {
  const id = `ogh${Math.random().toString(36).slice(2, 7)}`
  const root = document.createElement('div')
  root.className = id
  root.setAttribute('aria-hidden', 'true')
  const style = document.createElement('style')
  style.textContent = CSS(`.${id}`)
  root.appendChild(style)
  host.appendChild(root)

  const world = document.createElement('div')
  world.style.cssText = 'position:absolute;inset:0;transform-origin:50% 60%;will-change:transform'
  root.appendChild(world)
  const layer = (depth) => {
    const node = document.createElement('div')
    node.className = 'l'
    node.dataset.depth = depth
    world.appendChild(node)
    return node
  }
  const skyL = layer(0.15)
  const backL = layer(0.35)
  const raysL = layer(0.35)
  const raysSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  raysSvg.setAttribute('class', 'rays')
  raysL.appendChild(raysSvg)
  const midL = layer(0.6)
  const mistB = document.createElement('div')
  mistB.className = 'mist b'
  world.appendChild(mistB)
  const nearL = layer(0.85)
  const plaque = document.createElement('div')
  plaque.className = 'plaque'
  plaque.innerHTML = '<div class="face"><span class="names"></span><span class="rule"></span><span class="date"></span></div>'
  nearL.appendChild(plaque)
  const face = plaque.firstChild
  face.style.setProperty('--foil', `url(${foilTile(160, 11)})`)
  const namesEl = face.querySelector('.names')
  namesEl.append(names[0] || '', Object.assign(document.createElement('i'), { textContent: '&' }), names[1] || '')
  face.querySelector('.date').textContent = date
  const mistA = document.createElement('div')
  mistA.className = 'mist a'
  world.appendChild(mistA)
  const fgWrap = document.createElement('div')
  fgWrap.className = 'l'
  fgWrap.dataset.depth = 1.3
  world.appendChild(fgWrap)
  const motes = document.createElement('canvas')
  motes.className = 'motes'
  root.appendChild(motes)
  const grain = document.createElement('div')
  grain.className = 'grain'
  grain.style.backgroundImage = `url(${grainTile(200, 5, 1.2)})`
  root.appendChild(grain)

  let urls = []
  let imgs = []
  let art = null
  let size = { W: 0, H: 0 }
  let ready = Promise.resolve()

  const layout = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    const portrait = W / H < 0.9
    const same = size.W === W && Math.abs(size.H - H) / H < 0.18 && size.portrait === portrait
    if (same) return ready
    size = { W, H, portrait }
    urls.forEach((u) => URL.revokeObjectURL(u))
    urls = []
    imgs.forEach((img) => img.remove())
    imgs = []
    fgWrap.replaceChildren()
    art = paintGlasshouse(W, H)
    const add = (parent, svg) => {
      const url = svgBlob(svg)
      urls.push(url)
      const img = makeImg(parent, url)
      imgs.push(img)
      return img
    }
    add(skyL, art.sky)
    add(backL, art.back)
    add(midL, art.mid)
    nearL.insertBefore(add(nearL, art.near), plaque)
    // foreground: positioned in the overscanned layer's coordinates
    const ox = W * 0.04
    const oy = H * 0.04
    art.fg.forEach((item) => {
      const box = document.createElement('div')
      box.className = motion ? 'fg sway' : 'fg'
      const st = item.style
      Object.assign(box.style, {
        width: `${st.width}px`,
        height: `${st.height}px`,
        ...(st.left != null ? { left: `${st.left + ox}px` } : { right: `${st.right + ox}px` }),
        ...(st.top != null ? { top: `${st.top + oy}px` } : { bottom: `${st.bottom + oy}px` }),
      })
      fgWrap.appendChild(box)
      const img = add(box, item.svg)
      img.style.transformOrigin = item.origin
      img.style.animationDelay = `${-Math.random() * 6}s`
    })
    // plaque
    const p = art.plaque
    Object.assign(plaque.style, { left: `${p.x + ox}px`, top: `${p.y + oy}px`, fontSize: `${p.width * 0.15}px` })
    face.style.width = `${p.width}px`
    // rays
    raysSvg.setAttribute('viewBox', `${n2(-ox)} ${n2(-oy)} ${n2(W + ox * 2)} ${n2(H + oy * 2)}`)
    raysSvg.innerHTML =
      '<defs><linearGradient id="' + id + 'ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffbe9" stop-opacity=".75"/><stop offset=".55" stop-color="#fff4d6" stop-opacity=".28"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient><filter id="' + id + 'rb"><feGaussianBlur stdDeviation="' + Math.round(W / 140 + 2) + '"/></filter></defs>' +
      art.rays
        .map((r) => {
          const [dx, dy] = norm(r.x1 - r.x0, r.y1 - r.y0)
          const qx = -dy
          const qy = dx
          return `<polygon filter="url(#${id}rb)" style="animation-delay:${-r.delay}s" fill="url(#${id}ray)" points="${n2(r.x0 - (qx * r.w0) / 2)},${n2(r.y0 - (qy * r.w0) / 2)} ${n2(r.x0 + (qx * r.w0) / 2)},${n2(r.y0 + (qy * r.w0) / 2)} ${n2(r.x1 + (qx * r.w1) / 2)},${n2(r.y1 + (qy * r.w1) / 2)} ${n2(r.x1 - (qx * r.w1) / 2)},${n2(r.y1 - (qy * r.w1) / 2)}"/>`
        })
        .join('')
    world.style.transformOrigin = `50% ${n2((art.cam.cy / H) * 100)}%`
    // motes canvas
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    motes.width = Math.round(W * dpr)
    motes.height = Math.round(H * dpr)
    ready = Promise.all(imgs.map((img) => img.decode().catch(() => {})))
    return ready
  }

  /* dust motes drifting through the light */
  const rand = seeded(77)
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const motesList = Array.from({ length: small ? 34 : 60 }, () => ({ x: rand(), y: rand(), r: 0.6 + rand() * 1.8, s: 0.2 + rand() * 0.8, p: rand() * 6 }))
  const mctx = motes.getContext('2d')
  const drawMotes = (t) => {
    const w = motes.width
    const h = motes.height
    mctx.clearRect(0, 0, w, h)
    const k = w / (size.W || 1)
    for (let i = 0; i < motesList.length; i += 1) {
      const m = motesList[i]
      const x = ((m.x + Math.sin(t * 0.05 * m.s + m.p) * 0.03 + t * 0.004 * m.s) % 1) * w
      const y = ((m.y + Math.sin(t * 0.07 + m.p) * 0.02 - t * 0.003 * m.s + 10) % 1) * h
      const a = 0.25 + 0.35 * Math.sin(t * 0.8 * m.s + m.p) ** 2
      mctx.fillStyle = `rgba(255,248,226,${a.toFixed(3)})`
      mctx.beginPath()
      mctx.arc(x, y, m.r * k, 0, Math.PI * 2)
      mctx.fill()
    }
  }

  // parallax (pointer or tilt), eased toward the target each frame
  const par = { x: 0, y: 0, tx: 0, ty: 0 }
  const layers = [skyL, backL, raysL, midL, nearL, fgWrap]
  const applyParallax = () => {
    par.x += (par.tx - par.x) * 0.06
    par.y += (par.ty - par.y) * 0.06
    const W = size.W || 1
    for (let i = 0; i < layers.length; i += 1) {
      const d = Number(layers[i].dataset.depth)
      layers[i].style.transform = `translate3d(${(-par.x * d * W * 0.018).toFixed(2)}px,${(-par.y * d * W * 0.012).toFixed(2)}px,0)`
    }
    mistA.style.marginLeft = `${(-par.x * W * 0.02).toFixed(2)}px`
  }

  layout()

  return {
    root,
    world,
    plaque,
    get ready() {
      return ready
    },
    get art() {
      return art
    },
    layout,
    tick(t) {
      applyParallax()
      if (motion) drawMotes(t)
    },
    setParallax(x, y) {
      par.tx = x
      par.ty = y
    },
    setSheen(v) {
      face.style.setProperty('--sheen', `${v}%`)
    },
    // Paints a flat copy of the scene (for the blurred view behind the fogged glass).
    async snapshot(ctx, scale = 1) {
      await ready
      const W = size.W
      const H = size.H
      const ox = W * 0.04
      const oy = H * 0.04
      ctx.save()
      ctx.translate(W / 2, art.cam.cy)
      ctx.scale(scale, scale)
      ctx.translate(-W / 2, -art.cam.cy)
      const full = (img) => ctx.drawImage(img, -ox, -oy, W + ox * 2, H + oy * 2)
      full(imgs[0])
      full(imgs[1])
      full(imgs[2])
      full(imgs[3])
      // a brass smudge where the plaque sits
      const p = art.plaque
      ctx.fillStyle = '#c9a04a'
      ctx.fillRect(p.x - p.width / 2, p.y - p.width * 0.28, p.width, p.width * 0.5)
      fgWrap.querySelectorAll('.fg').forEach((box, i) => {
        const img = imgs[4 + i]
        if (!img) return
        const rect = box.getBoundingClientRect()
        const hostRect = root.getBoundingClientRect()
        ctx.drawImage(img, rect.left - hostRect.left, rect.top - hostRect.top, rect.width, rect.height)
      })
      ctx.restore()
    },
    dispose() {
      urls.forEach((u) => URL.revokeObjectURL(u))
      root.remove()
    },
  }
}

/* ------------------------------------------- sprites for the page */

// Small standalone botanical engravings used by the page sections (CSS backgrounds).
export function spriteSVG(kind, px = 240) {
  registry = new Map()
  const rand = seeded(91)
  const one = (opts) => {
    const fr = frond(rand, opts)
    const id = shape(fr.leaves)
    return { wash: `<use href="#${id}" fill="#8db27f" fill-opacity=".8"/>`, ink: `<path d="${fr.rachis}"/><use href="#${id}" stroke-opacity=".6"/>` }
  }
  if (kind === 'frond') return foregroundSVG(one({ len: 1, angle: -Math.PI / 2 + 0.14, droop: 0.12, lift: 0.08, width: 0.22, pairs: 18, lobes: 3 }), [-0.32, -1.05, 0.72, 1.1], '', px)
  if (kind === 'begonia') return foregroundSVG(begoniaClump(5, 2.2), [-0.6, -0.8, 1.2, 0.9], '', px)
  if (kind === 'monstera') return foregroundSVG(monsteraClump(19, 1), [-1.3, -1.75, 2.6, 1.8], '', px)
  // a horizontal sprig: two fronds and a begonia at the centre
  const left = one({ len: 1, angle: Math.PI + 0.06, droop: 0.08, lift: 0.1, width: 0.13, pairs: 16, lobes: 2 })
  const right = one({ len: 1, angle: -0.06, droop: 0.08, lift: 0.1, width: 0.13, pairs: 16, lobes: 2 })
  const flower = begoniaClump(3, 0.9)
  return foregroundSVG(
    { wash: left.wash + right.wash + g(flower.wash, 'translate(0 0.06)'), ink: left.ink + right.ink + g(flower.ink, 'translate(0 0.06)') },
    [-1.05, -0.3, 2.1, 0.42],
    '',
    px,
  )
}

export const spriteURL = (kind, px) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(spriteSVG(kind, px))}")`
