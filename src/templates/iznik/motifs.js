// İznik motif library. Every motif is generated as SVG markup, drawn the way
// 16th-century İznik painters composed tiles: a thin dark outline (the "sir"
// line) filled with cobalt, turquoise, emerald and a raised bole red on a
// white slip ground. Shapes follow the saz style: serrated saz leaves forming
// an ogival lattice, tulips, carnations, hatayi blossoms, 8-fold rosettes,
// rumi scrolls and the cintamani.

export const IZ = {
  cobalt: '#1f4e9c',
  cobaltDeep: '#173c7c',
  turq: '#2ba6a4',
  red: '#c8382e',
  green: '#2e7d4f',
  greenDeep: '#22623d',
  white: '#f7f3ea',
  ink: '#1b2130',
}

const f = (n) => Math.round(n * 10) / 10

function outline(w = 2.4) {
  return `stroke="${IZ.ink}" stroke-width="${f(w)}" stroke-linejoin="round" stroke-linecap="round"`
}

function poly(points, close = true) {
  return `M${points.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}${close ? 'Z' : ''}`
}

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

function bezD(p0, p1, p2, p3, t) {
  const u = 1 - t
  return [
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ]
}

// A filled shape with its outline. Bole red is applied thick in İznik and
// stands slightly proud under the glaze, so it gets a soft cast edge.
function shape(d, fill, w = 2.4) {
  const relief = fill === IZ.red ? `<path d="${d}" fill="#5c1510" opacity=".3" transform="translate(1.4 1.7)"/>` : ''
  return `${relief}<path d="${d}" fill="${fill}" ${outline(w)}/>`
}

function stem(d, w = 4, color = IZ.green) {
  return `<path d="${d}" fill="none" stroke="${IZ.ink}" stroke-width="${f(w + 2.6)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${f(w)}" stroke-linecap="round"/>`
}

const place = (x, y, scale, angle, body) =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${scale})">${body}</g>`

/* ------------------------------------------------------------ motifs */

// The serrated saz leaf: long, curved, pointed, split along its midrib into
// two tones, with saw teeth pointing toward the tip.
export function sazLeaf(p0, p1, p2, p3, w, { fill = IZ.green, half = IZ.greenDeep, rib = IZ.white, teeth = 15, flip = false } = {}) {
  const n = teeth ? teeth * 5 : 36
  const L = []
  const R = []
  const S = []
  for (let i = 0; i <= n; i += 1) {
    const t = i / n
    const p = bez(p0, p1, p2, p3, t)
    const d = bezD(p0, p1, p2, p3, t)
    const len = Math.hypot(d[0], d[1]) || 1
    const nx = -d[1] / len
    const ny = d[0] / len
    const wt = w * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.85) * (0.72 + 0.28 * (1 - t))
    const saw = teeth && t > 0.1 && t < 0.94 ? 1 + 0.17 * ((t * teeth) % 1) : 1
    L.push([p[0] + nx * wt * saw, p[1] + ny * wt * saw])
    R.push([p[0] - nx * wt * saw, p[1] - ny * wt * saw])
    S.push(p)
  }
  const body = poly([...L, ...R.slice(0, -1).reverse()])
  const halfD = poly([...S, ...(flip ? L : R).slice(0, -1).reverse()])
  const rib0 = Math.round(n * 0.06)
  const rib1 = Math.round(n * 0.88)
  const ribD = poly(S.slice(rib0, rib1), false)
  return (
    `<path d="${body}" fill="${fill}"/><path d="${halfD}" fill="${half}"/>` +
    `<path d="${ribD}" fill="none" stroke="${rib}" stroke-width="${f(Math.max(1.2, w * 0.12))}" stroke-linecap="round"/>` +
    `<path d="${body}" fill="none" ${outline()}/>`
  )
}

// Tulip (lale): slender almond petals with dagger tips, the side petals
// flaring outward, white lines painted inside each petal.
export function tulip(x, y, size, angle, { petal = IZ.red, inner = IZ.cobalt, line = IZ.white } = {}) {
  const s = size / 100
  const w = 2.4 / s
  const left = 'M0 0C-30 -6 -40 -50 -34 -78C-33 -88 -38 -98 -42 -106C-26 -98 -14 -84 -10 -62C-7 -42 -4 -20 0 -12Z'
  const right = 'M0 0C30 -6 40 -50 34 -78C33 -88 38 -98 42 -106C26 -98 14 -84 10 -62C7 -42 4 -20 0 -12Z'
  const center = 'M0 -4C-17 -30 -18 -74 0 -114C18 -74 17 -30 0 -4Z'
  const body =
    shape(center, inner, w) +
    `<path d="M0 -24C-4 -50 -4 -78 0 -100" fill="none" stroke="${line}" stroke-width="${f(3.4)}" stroke-linecap="round" opacity=".9"/>` +
    shape(left, petal, w) +
    shape(right, petal, w) +
    `<path d="M-7 -16C-16 -40 -24 -66 -31 -94M7 -16C16 -40 24 -66 31 -94" fill="none" stroke="${line}" stroke-width="3" stroke-linecap="round" opacity=".85"/>` +
    shape('M-17 3Q0 15 17 3Q8 -3 0 -1Q-8 -3 -17 3Z', IZ.green, w)
  return place(x, y, s, angle, body)
}

// Carnation (karanfil) in profile: a green calyx and a fan of serrated petals,
// cobalt at the heart and red at the rim, combed with white lines.
export function carnation(x, y, size, angle, { petal = IZ.red, heart = IZ.cobalt } = {}) {
  const s = size / 100
  const w = 2.4 / s
  const fan = (radius, lobeDepth, toothDepth) => {
    const pts = [[-15, 0]]
    for (let i = 0; i <= 90; i += 1) {
      const a = -80 + (160 * i) / 90
      const lobe = Math.abs(Math.sin(((a + 80) / 32) * Math.PI))
      const tooth = toothDepth * ((i * 1.0) % 3) / 3
      const r = radius * (1 - lobeDepth) + radius * lobeDepth * lobe + tooth
      const rad = (a * Math.PI) / 180
      pts.push([Math.sin(rad) * r, -6 - Math.cos(rad) * r * 0.88])
    }
    pts.push([15, 0])
    return poly(pts)
  }
  let lines = ''
  for (let k = 0; k < 5; k += 1) {
    const a = ((-64 + k * 32) * Math.PI) / 180
    lines += `M${f(Math.sin(a) * 34)} ${f(-6 - Math.cos(a) * 30)}L${f(Math.sin(a) * 52)} ${f(-6 - Math.cos(a) * 46)}`
  }
  const body =
    shape(fan(62, 0.16, 5), petal, w) +
    `<path d="${lines}" fill="none" stroke="${IZ.white}" stroke-width="3" stroke-linecap="round" opacity=".9"/>` +
    shape(fan(31, 0.2, 0), heart, w) +
    shape('M-15 0C-18 16 -10 30 -6 42L6 42C10 30 18 16 15 0Z', IZ.green, w) +
    shape('M-15 1L-26 -7L-8 -3ZM15 1L26 -7L8 -3Z', IZ.green, w)
  return place(x, y, s, angle, body)
}

// Eight-fold rosette: cobalt petals, turquoise petals between, a raised red
// heart ringed with white dots.
export function rosette(x, y, r, { outer = IZ.cobalt, mid = IZ.turq, heart = IZ.red } = {}) {
  const s = r / 100
  const w = 2.4 / s
  let body = ''
  for (let k = 0; k < 8; k += 1) {
    body += `<g transform="rotate(${22.5 + k * 45})">${shape('M0 -20C16 -32 19 -58 0 -72C-19 -58 -16 -32 0 -20Z', mid, w)}</g>`
  }
  for (let k = 0; k < 8; k += 1) {
    body += `<g transform="rotate(${k * 45})">${shape('M0 -24C27 -42 30 -82 0 -100C-30 -82 -27 -42 0 -24Z', outer, w)}<path d="M0 -38L0 -84" stroke="${IZ.white}" stroke-width="4" stroke-linecap="round"/></g>`
  }
  body += shape('M0 -31A31 31 0 1 1 0 31A31 31 0 1 1 0 -31Z', heart, w)
  for (let k = 0; k < 8; k += 1) {
    const a = (k * Math.PI) / 4
    body += `<circle cx="${f(Math.sin(a) * 19)}" cy="${f(-Math.cos(a) * 19)}" r="3.6" fill="${IZ.white}"/>`
  }
  body += `<circle r="8" fill="${IZ.cobalt}" ${outline(w)}/>`
  return place(x, y, s, 0, body)
}

// Penç: the small frontal five-to-six petal blossom used at lattice joints.
export function pench(x, y, r, { petal = IZ.red, heart = IZ.white } = {}) {
  const s = r / 100
  const w = 2.4 / s
  let body = ''
  for (let k = 0; k < 6; k += 1) {
    body += `<g transform="rotate(${k * 60})">${shape('M0 -14C34 -24 44 -76 0 -98C-44 -76 -34 -24 0 -14Z', petal, w)}</g>`
  }
  body += `<circle r="26" fill="${heart}" ${outline(w)}/><circle r="10" fill="${IZ.cobalt}" ${outline(w)}/>`
  return place(x, y, s, 0, body)
}

// Hatayi: the composite palmette blossom, a scalloped cobalt shell around a
// red inner shell and a turquoise heart.
export function hatayi(x, y, size, angle, { shell = IZ.cobalt, inner = IZ.red, heart = IZ.turq } = {}) {
  const s = size / 100
  const w = 2.4 / s
  const shellPath = (scale) => {
    const pts = []
    for (let i = 0; i <= 84; i += 1) {
      const a = -118 + (236 * i) / 84
      const lobe = Math.pow(Math.abs(Math.sin(((a + 118) / 33.7) * Math.PI)), 0.7)
      const r = (62 + 18 * lobe) * scale
      const rad = (a * Math.PI) / 180
      pts.push([Math.sin(rad) * r, -Math.cos(rad) * r])
    }
    pts.push([20 * scale, 60], [-20 * scale, 60])
    return poly(pts)
  }
  const body =
    shape(shellPath(1), shell, w) +
    shape(shellPath(0.66), inner, w) +
    shape('M0 -50C24 -28 24 12 0 34C-24 12 -24 -28 0 -50Z', heart, w) +
    `<circle cy="-24" r="5" fill="${IZ.white}"/><circle cy="-6" r="6" fill="${IZ.white}"/><circle cy="13" r="5" fill="${IZ.white}"/>` +
    shape('M-24 58Q0 80 24 58Q0 68 -24 58Z', IZ.green, w)
  return place(x, y, s, angle, body)
}

// Cintamani: three balls over two wavy "tiger stripe" lines.
export function cintamani(x, y, size, angle = 0) {
  const s = size / 100
  const w = 2.4 / s
  let body = ''
  for (const [bx, by] of [
    [0, -26],
    [-25, 16],
    [25, 16],
  ]) {
    body += shape(`M${bx} ${by - 18}A18 18 0 1 1 ${bx} ${by + 18}A18 18 0 1 1 ${bx} ${by - 18}Z`, IZ.red, w)
    body += `<path d="M${bx - 9} ${by - 6}A11 11 0 0 1 ${bx + 7} ${by - 10}" fill="none" stroke="${IZ.white}" stroke-width="4" stroke-linecap="round"/>`
  }
  const wave = (yy) => `M-48 ${yy}C-32 ${yy - 12} -16 ${yy + 12} 0 ${yy}C16 ${yy - 12} 32 ${yy + 12} 48 ${yy}`
  body += stem(wave(50), 7, IZ.cobalt) + stem(wave(66), 7, IZ.cobalt)
  return place(x, y, s, angle, body)
}

// Rumi: the split-palmette "wing" leaf of Ottoman arabesque scrolls.
export function rumi(x, y, size, angle, fill = IZ.white) {
  const s = size / 100
  const w = 2.2 / s
  const d = 'M0 0C20 -6 46 -26 54 -58C58 -74 50 -90 38 -98C44 -80 41 -64 30 -54C37 -45 34 -33 24 -25C16 -17 8 -8 0 0Z'
  return place(x, y, s, angle, `<path d="${d}" fill="${fill}" ${outline(w)}/><path d="M8 -6C22 -16 34 -32 40 -50" fill="none" stroke="${IZ.turq}" stroke-width="${f(3)}" stroke-linecap="round"/>`)
}

function floret(x, y, r, petal = IZ.white, heart = IZ.red) {
  let d = ''
  for (let k = 0; k < 4; k += 1) {
    const a = (k * Math.PI) / 2 + Math.PI / 4
    d += `<circle cx="${f(x + Math.cos(a) * r * 0.55)}" cy="${f(y + Math.sin(a) * r * 0.55)}" r="${f(r * 0.48)}" fill="${petal}" ${outline(1.6)}/>`
  }
  return `${d}<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.32)}" fill="${heart}" ${outline(1.4)}/>`
}

/* ------------------------------------------------------- compositions */

const PAINT_FILTER =
  '<filter id="paint" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>'

// One 512-unit field tile. The four saz leaves are S-curves between the edge
// midpoints, so repeated tiles build the classic ogival lattice: a bouquet of
// carnation and tulips in each almond, a hatayi where four tiles meet.
export function fieldContent() {
  const leaf = (p0, p1, p2, p3, flip) => sazLeaf(p0, p1, p2, p3, 23, { flip })
  const mx = (p) => [512 - p[0], p[1]]
  const my = (p) => [p[0], 512 - p[1]]
  const nw = [[256, 0], [236, 112], [30, 150], [0, 256]]
  const sw = nw.map(my)
  const ne = nw.map(mx)
  const se = sw.map(mx)
  let out = ''
  // hatayi where four tiles meet, drawn on every corner so the tile repeats
  for (const [cx, cy] of [
    [0, 0],
    [512, 0],
    [0, 512],
    [512, 512],
  ]) {
    out += sazLeaf([cx - 10, cy + 40], [cx - 40, cy + 70], [cx - 80, cy + 60], [cx - 104, cy + 30], 9, { teeth: 0, fill: IZ.turq, half: IZ.turq })
    out += sazLeaf([cx + 10, cy + 40], [cx + 40, cy + 70], [cx + 80, cy + 60], [cx + 104, cy + 30], 9, { teeth: 0, fill: IZ.turq, half: IZ.turq })
    out += hatayi(cx, cy, 64, 0)
  }
  out += leaf(...nw, false) + leaf(...sw, true) + leaf(...ne, true) + leaf(...se, false)
  // bouquet
  out += stem('M256 446C250 384 262 300 256 214', 4.5)
  out += stem('M256 362C232 334 206 304 197 270', 3.6) + stem('M256 362C280 334 306 304 315 270', 3.6)
  out += sazLeaf([254, 430], [236, 402], [214, 396], [194, 380], 10, { teeth: 0 })
  out += sazLeaf([258, 430], [276, 402], [298, 396], [318, 380], 10, { teeth: 0, flip: true })
  out += stem('M246 318C234 312 226 300 224 290', 2.6) + stem('M266 318C278 312 286 300 288 290', 2.6)
  out += `<circle cx="224" cy="286" r="7" fill="${IZ.cobalt}" ${outline(2)}/><circle cx="288" cy="286" r="7" fill="${IZ.cobalt}" ${outline(2)}/>`
  out += tulip(197, 272, 64, -30) + tulip(315, 272, 64, 30)
  out += carnation(256, 214, 80, 0)
  // joints of the lattice
  for (const [x, y] of [
    [256, 0],
    [256, 512],
  ])
    out += rosette(x, y, 46)
  for (const [x, y] of [
    [0, 256],
    [512, 256],
  ])
    out += pench(x, y, 30)
  return out
}

function svgDoc(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${PAINT_FILTER}${defs}</defs>${body}</svg>`
}

export function fieldSVG() {
  return svgDoc(512, 512, '', `<rect width="512" height="512" fill="${IZ.white}"/><g filter="url(#paint)">${fieldContent()}</g>`)
}

// A cobalt border strip, 512 × 128, with a white rumi scroll on a sine stem.
// Period 256 so it also tiles at half length.
export function stripContent() {
  let out = `<rect width="512" height="128" fill="${IZ.cobalt}"/>`
  out += `<rect width="512" height="15" fill="${IZ.turq}"/><rect y="113" width="512" height="15" fill="${IZ.turq}"/>`
  out += `<rect y="15" width="512" height="5" fill="${IZ.red}"/><rect y="108" width="512" height="5" fill="${IZ.red}"/>`
  out += `<path d="M0 15H512M0 20H512M0 108H512M0 113H512" stroke="${IZ.ink}" stroke-width="1.6"/>`
  for (let x = 0; x < 512; x += 32) out += `<circle cx="${x + 16}" cy="7.5" r="3" fill="${IZ.white}"/><circle cx="${x + 16}" cy="120.5" r="3" fill="${IZ.white}"/>`
  let scroll = ''
  for (const ox of [-512, 0, 512]) {
    let d = ''
    for (let i = 0; i <= 64; i += 1) {
      const x = ox + (i / 64) * 512
      d += `${i ? 'L' : 'M'}${f(x)} ${f(64 + 22 * Math.sin((2 * Math.PI * x) / 256))}`
    }
    scroll += `<path d="${d}" fill="none" stroke="${IZ.white}" stroke-width="4.5"/>`
    for (let k = 0; k < 8; k += 1) {
      const x = ox + 32 + k * 64
      const y = 64 + 22 * Math.sin((2 * Math.PI * x) / 256)
      const up = Math.sin((2 * Math.PI * x) / 256) < 0
      scroll += rumi(x, y, 40, up ? 62 : 242)
      scroll += floret(ox + k * 64, 64, 11)
    }
  }
  return out + scroll
}

export function stripSVG() {
  return svgDoc(512, 128, '', `<g filter="url(#paint)">${stripContent()}</g>`)
}

// A 384 tile with a 96-wide decorated border, for CSS border-image framing.
export function frameSVG() {
  const defs = `<pattern id="st" width="512" height="128" patternUnits="userSpaceOnUse" patternTransform="scale(.75)">${stripContent()}</pattern>`
  let body = `<rect width="384" height="384" fill="${IZ.white}"/>`
  for (let k = 0; k < 4; k += 1) body += `<g transform="rotate(${k * 90} 192 192)"><rect width="384" height="96" fill="url(#st)"/></g>`
  for (const [x, y] of [
    [0, 0],
    [288, 0],
    [0, 288],
    [288, 288],
  ]) {
    body += `<rect x="${x}" y="${y}" width="96" height="96" fill="${IZ.cobalt}" ${outline(2)}/>`
    body += rosette(x + 48, y + 48, 40, { outer: IZ.red, mid: IZ.turq, heart: IZ.cobalt })
  }
  body += `<rect x="102" y="102" width="180" height="180" fill="none" stroke="${IZ.red}" stroke-width="3"/>`
  return svgDoc(384, 384, defs, `<g filter="url(#paint)">${body}</g>`)
}

// Small square tile with quarter rosettes in each corner (countdown cells).
export function cornerTileSVG() {
  let body = `<rect width="256" height="256" fill="${IZ.white}"/>`
  for (const [x, y] of [
    [0, 0],
    [256, 0],
    [0, 256],
    [256, 256],
  ])
    body += rosette(x, y, 62)
  body += `<rect x="10" y="10" width="236" height="236" fill="none" stroke="${IZ.cobalt}" stroke-width="2.5" opacity=".7"/>`
  return svgDoc(256, 256, '', `<g filter="url(#paint)">${body}</g>`)
}

export function rosetteSVG() {
  return svgDoc(220, 220, '', `<g filter="url(#paint)">${rosette(110, 110, 100)}</g>`)
}

// Kitabe tile: the cobalt inscription band, white text runs across it.
export function kitabeSVG() {
  let body = `<rect width="512" height="512" fill="${IZ.cobalt}"/>`
  body += `<ellipse cx="160" cy="250" rx="220" ry="160" fill="${IZ.cobaltDeep}" opacity=".35"/><ellipse cx="420" cy="300" rx="160" ry="120" fill="#2a5db0" opacity=".25"/>`
  for (const top of [true, false]) {
    const y = (v) => (top ? v : 512 - v)
    const r = (a, b, fill) => `<rect y="${Math.min(y(a), y(b))}" width="512" height="${Math.abs(b - a)}" fill="${fill}"/>`
    body += r(0, 8, IZ.white) + r(8, 40, IZ.turq) + r(40, 48, IZ.red)
    body += `<path d="M0 ${y(8)}H512M0 ${y(40)}H512M0 ${y(48)}H512" stroke="${IZ.ink}" stroke-width="2"/>`
    for (let x = 16; x < 512; x += 32) body += `<circle cx="${x}" cy="${y(24)}" r="5" fill="${IZ.white}" ${outline(1.4)}/>`
  }
  return svgDoc(512, 512, '', `<g filter="url(#paint)">${body}</g>`)
}

// The 4 × 4 medallion panel (2048 units, 512 per tile): a framed panel whose
// lobed şemse medallion holds a white roundel for the couple's names.
export function medallionSVG() {
  const C = 1024
  const defs =
    `<pattern id="st" width="512" height="128" patternUnits="userSpaceOnUse" patternTransform="scale(.625)">${stripContent()}</pattern>`
  let body = `<rect width="2048" height="2048" fill="${IZ.white}"/>`
  // frame
  for (let k = 0; k < 4; k += 1) body += `<g transform="rotate(${k * 90} ${C} ${C})"><rect width="2048" height="80" fill="url(#st)"/></g>`
  for (const [x, y] of [
    [0, 0],
    [1968, 0],
    [0, 1968],
    [1968, 1968],
  ]) {
    body += `<rect x="${x}" y="${y}" width="80" height="80" fill="${IZ.cobalt}" ${outline()}/>`
    body += rosette(x + 40, y + 40, 34, { outer: IZ.red, mid: IZ.turq, heart: IZ.cobalt })
  }
  body += `<rect x="92" y="92" width="1864" height="1864" fill="none" stroke="${IZ.red}" stroke-width="5"/>`
  // spandrels, one per corner
  let spandrel = ''
  spandrel += sazLeaf([250, 178], [380, 108], [560, 106], [756, 134], 26, { fill: IZ.green, half: IZ.greenDeep })
  spandrel += sazLeaf([178, 250], [108, 380], [106, 560], [134, 756], 26, { fill: IZ.green, half: IZ.greenDeep, flip: true })
  spandrel += tulip(560, 240, 92, 0, { petal: IZ.red, inner: IZ.cobalt })
  spandrel += tulip(240, 560, 92, -90, { petal: IZ.red, inner: IZ.cobalt })
  spandrel += hatayi(212, 212, 118, -45)
  spandrel += rosette(352, 352, 34, { outer: IZ.turq, mid: IZ.cobalt, heart: IZ.red })
  spandrel += carnation(440, 262, 80, 22) + carnation(262, 440, 80, -112)
  spandrel += sazLeaf([440, 300], [470, 330], [520, 330], [560, 300], 11, { teeth: 0, fill: IZ.turq, half: IZ.turq })
  spandrel += sazLeaf([300, 440], [330, 470], [330, 520], [300, 560], 11, { teeth: 0, fill: IZ.turq, half: IZ.turq, flip: true })
  spandrel += cintamani(345, 192, 50, 0) + cintamani(192, 345, 50, -90)
  spandrel += rosette(700, 186, 22, { outer: IZ.turq, mid: IZ.cobalt, heart: IZ.red }) + rosette(186, 700, 22, { outer: IZ.turq, mid: IZ.cobalt, heart: IZ.red })
  for (let k = 0; k < 4; k += 1) body += `<g transform="rotate(${k * 90} ${C} ${C})">${spandrel}</g>`
  // lobed şemse: sixteen pointed lobes
  const lobe = []
  for (let i = 0; i < 384; i += 1) {
    const a = (i / 384) * Math.PI * 2
    const c = Math.abs(Math.cos(8 * a))
    const r = 842 + 46 * Math.sqrt(c) + 16 * Math.pow(c, 36)
    lobe.push([C + Math.sin(a) * r, C - Math.cos(a) * r])
  }
  const lobeD = poly(lobe)
  body += `<path d="${lobeD}" fill="none" stroke="${IZ.red}" stroke-width="10" transform="translate(${C} ${C}) scale(1.018) translate(${-C} ${-C})"/>`
  body += shape(lobeD, IZ.cobalt, 3)
  for (let k = 0; k < 16; k += 1) {
    const a = k * 22.5
    const rad = (a * Math.PI) / 180
    body += tulip(C + Math.sin(rad) * 772, C - Math.cos(rad) * 772, 92, a, { petal: IZ.white, inner: IZ.turq, line: IZ.cobalt })
    const b = ((a + 11.25) * Math.PI) / 180
    body += floret(C + Math.sin(b) * 808, C - Math.cos(b) * 808, 17)
  }
  body += `<circle cx="${C}" cy="${C}" r="752" fill="none" stroke="${IZ.red}" stroke-width="13"/>`
  body += `<circle cx="${C}" cy="${C}" r="732" fill="none" stroke="${IZ.turq}" stroke-width="22"/>`
  for (let k = 0; k < 64; k += 1) {
    const a = (k / 64) * Math.PI * 2
    body += `<circle cx="${f(C + Math.sin(a) * 732)}" cy="${f(C - Math.cos(a) * 732)}" r="5" fill="${IZ.white}"/>`
  }
  body += `<circle cx="${C}" cy="${C}" r="720" fill="${IZ.white}" ${outline(3)}/>`
  body += `<circle cx="${C}" cy="${C}" r="702" fill="none" stroke="${IZ.cobalt}" stroke-width="5"/>`
  // pendants (salbek) hanging inward
  for (let k = 0; k < 8; k += 1) {
    const a = k * 45
    body += `<g transform="rotate(${a} ${C} ${C})"><path d="M${C} ${C - 702}C${C + 20} ${C - 680} ${C + 16} ${C - 658} ${C} ${C - 640}C${C - 16} ${C - 658} ${C - 20} ${C - 680} ${C} ${C - 702}Z" fill="${IZ.cobalt}" ${outline(2)}/><circle cx="${C}" cy="${C - 672}" r="6" fill="${IZ.red}"/></g>`
    body += `<g transform="rotate(${a + 22.5} ${C} ${C})"><circle cx="${C}" cy="${C - 690}" r="7" fill="${IZ.turq}" ${outline(1.6)}/></g>`
  }
  return svgDoc(2048, 2048, defs, `<g filter="url(#paint)">${body}</g>`)
}

export function svgUrl(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

let cache = null
// All tile images as CSS url() values, generated once per page load.
export function izArt() {
  if (!cache) {
    cache = {
      field: svgUrl(fieldSVG()),
      medallion: svgUrl(medallionSVG()),
      kitabe: svgUrl(kitabeSVG()),
      strip: svgUrl(stripSVG()),
      frame: svgUrl(frameSVG()),
      corner: svgUrl(cornerTileSVG()),
      rosette: svgUrl(rosetteSVG()),
    }
  }
  return cache
}
