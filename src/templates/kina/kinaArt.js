// Kına gecesi illustration shared by the page hero and the intro: a canvas-painted
// velvet backdrop with gold bindallı embroidery, a brass kına tray in engraved
// line art with candles, a henna bowl and rose petals, flickering flames and
// rising gold dust. Everything is 2D (SVG, canvas, CSS); no WebGL.
import { seeded } from '../../shared/intro/core.js'
import './kinaScene.css'

const f = (n) => Math.round(n * 10) / 10

/* ------------------------------------------------------------ velvet */

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// Deep wine velvet hanging in soft vertical folds; the pile catches the light
// on the fold edges, candlelight warms the lower part.
export function paintVelvet(canvas, width, height, glow = { x: 0.5, y: 0.8 }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const random = seeded(23)
  const shadow = [26, 4, 8]
  const body = [92, 14, 30]
  const sheen = [196, 70, 84]
  const folds = Math.max(3, width / 150)
  const p1 = random() * 6
  const p2 = random() * 6
  const p3 = random() * 6
  const g = ctx.createLinearGradient(0, 0, width, 0)
  const stops = 90
  for (let i = 0; i <= stops; i += 1) {
    const x = (i / stops) * Math.PI * 2
    const s = Math.sin(x * folds + p1) * 0.55 + Math.sin(x * folds * 2.3 + p2) * 0.3 + Math.sin(x * folds * 0.45 + p3) * 0.15
    const d = Math.cos(x * folds + p1) * 0.55 + Math.cos(x * folds * 2.3 + p2) * 0.3 * 2.3
    const lum = Math.min(1, Math.max(0, 0.45 + s * 0.4))
    let c = mix(shadow, body, lum)
    c = mix(c, sheen, Math.min(0.55, (d * d) * 0.08 * lum))
    g.addColorStop(i / stops, `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`)
  }
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  // pile streaks
  ctx.globalAlpha = 0.05
  for (let i = 0; i < width / 2; i += 1) {
    ctx.fillStyle = random() > 0.5 ? '#ff9aa6' : '#000000'
    ctx.fillRect(random() * width, 0, 0.6 + random(), height)
  }
  ctx.globalAlpha = 1

  // dark top, warm candlelit lower half
  const top = ctx.createLinearGradient(0, 0, 0, height)
  top.addColorStop(0, 'rgba(12,1,4,0.72)')
  top.addColorStop(0.45, 'rgba(12,1,4,0.18)')
  top.addColorStop(1, 'rgba(12,1,4,0.35)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, width, height)

  ctx.globalCompositeOperation = 'screen'
  const r = Math.max(width, height) * 0.75
  const warm = ctx.createRadialGradient(glow.x * width, glow.y * height, 0, glow.x * width, glow.y * height, r)
  warm.addColorStop(0, 'rgba(255,150,70,0.42)')
  warm.addColorStop(0.35, 'rgba(200,70,40,0.16)')
  warm.addColorStop(1, 'rgba(120,20,20,0)')
  ctx.fillStyle = warm
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  // fine grain
  const tile = document.createElement('canvas')
  tile.width = 96
  tile.height = 96
  const t2 = tile.getContext('2d')
  const img = t2.createImageData(96, 96)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = random() * 255
    img.data[i] = v
    img.data[i + 1] = v
    img.data[i + 2] = v
    img.data[i + 3] = 22
  }
  t2.putImageData(img, 0, 0)
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  const vignette = ctx.createRadialGradient(width / 2, height * 0.55, Math.min(width, height) * 0.3, width / 2, height * 0.55, Math.max(width, height) * 0.85)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(8,0,2,0.7)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}

/* -------------------------------------------------------- embroidery */

// One bindallı "dal" sprig — a stem with tulip, carnation, leaves and a bud.
const SPRIG = `
  <path d="M120 290 C108 240 136 196 120 146 C110 112 126 84 120 56" class="k-st"/>
  <path d="M120 56 C100 48 96 22 106 8 C111 22 115 30 120 33 C125 30 129 22 134 8 C144 22 140 48 120 56 Z" class="k-lf"/>
  <path d="M120 33 C114 22 115 10 120 2 C125 10 126 22 120 33" class="k-st"/>
  <path d="M118 214 C92 204 74 186 66 164 C90 168 108 186 118 214 Z M118 214 C100 196 84 182 66 164" class="k-lf"/>
  <path d="M123 172 C148 162 166 142 172 120 C148 126 132 146 123 172 Z M123 172 C140 154 158 136 172 120" class="k-lf"/>
  <path d="M121 138 C94 128 74 110 66 90" class="k-st"/>
  <path d="M66 90 C46 86 40 68 46 56 L53 65 L57 52 L63 63 L68 50 L73 62 L79 52 L82 66 C86 78 80 88 66 90 Z" class="k-lf"/>
  <path d="M122 104 C150 96 168 80 176 64" class="k-st"/>
  <circle cx="178" cy="60" r="7" class="k-lf"/>
  <circle cx="178" cy="60" r="2.4" class="k-dot"/>
  <circle cx="58" cy="246" r="3" class="k-dot"/><circle cx="184" cy="226" r="3" class="k-dot"/>
  <circle cx="40" cy="140" r="2.4" class="k-dot"/><circle cx="204" cy="160" r="2.4" class="k-dot"/>
  <circle cx="152" cy="30" r="2.4" class="k-dot"/><circle cx="88" cy="30" r="2.4" class="k-dot"/>
`

export function embroiderySvg(uid, scale = 1) {
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="${uid}-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7d5419"/><stop offset="0.3" stop-color="#f3d27e"/>
      <stop offset="0.5" stop-color="#b8862f"/><stop offset="0.72" stop-color="#ffe7a3"/><stop offset="1" stop-color="#8a5d1e"/>
    </linearGradient>
    <pattern id="${uid}-dal" width="520" height="310" patternUnits="userSpaceOnUse" patternTransform="scale(${scale})">
      <g fill="none" stroke="url(#${uid}-gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <style>.k-lf{fill:rgba(212,162,76,0.16)}.k-dot{fill:#d4a24c;stroke:none}</style>
        <g transform="translate(10 6)">${SPRIG}</g>
        <g transform="translate(510 6) scale(-1 1)">${SPRIG}</g>
        <g transform="translate(260 155)">
          <circle r="5" class="k-dot"/><circle cx="-14" r="3" class="k-dot"/><circle cx="14" r="3" class="k-dot"/>
          <circle cy="-14" r="3" class="k-dot"/><circle cy="14" r="3" class="k-dot"/>
        </g>
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#${uid}-dal)"/>
</svg>`
}

/* -------------------------------------------------------------- tray */

const CX = 500
const FCY = 503
const FX = 418
const FY = 146

// unit-disk point on the tray floor → SVG coordinates (the tray is seen from above at an angle)
const E = (u, v) => `${f(CX + u * FX)} ${f(FCY + v * FY)}`

function polyline(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${E(p[0], p[1])}`).join('')
}

// a motif drawn in local (tangent, radial) units, placed on a ring of the floor
function ringMotif(points, angle, radius, size) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  return polyline(points.map(([x, y]) => [dx * (radius + y * size) - dy * x * size, dy * (radius + y * size) + dx * x * size]))
}

const TULIP = [[0, -1], [-0.5, -0.6], [-0.58, 0.25], [-0.25, 0.05], [0, 0.65], [0.25, 0.05], [0.58, 0.25], [0.5, -0.6], [0, -1], [0, -1.7]]
const LEAF = [[0, -0.8], [-0.35, 0], [0, 0.8], [0.35, 0], [0, -0.8]]

function engraving() {
  let d = ''
  ;[0.95, 0.91, 0.74, 0.71, 0.4, 0.37].forEach((s) => {
    d += `M${f(CX - FX * s)} ${FCY}A${f(FX * s)} ${f(FY * s)} 0 1 0 ${f(CX + FX * s)} ${FCY}A${f(FX * s)} ${f(FY * s)} 0 1 0 ${f(CX - FX * s)} ${FCY}`
  })
  for (let i = 0; i < 40; i += 1) {
    const a = (i / 40) * Math.PI * 2
    d += polyline([[Math.cos(a) * 0.74, Math.sin(a) * 0.74], [Math.cos(a) * 0.91, Math.sin(a) * 0.91]])
  }
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    d += ringMotif(TULIP, a, 0.57, 0.085)
    d += ringMotif(LEAF, a + Math.PI / 12, 0.555, 0.07)
  }
  // scallops between the outer rings
  for (let i = 0; i < 48; i += 1) {
    const a0 = (i / 48) * Math.PI * 2
    const a1 = ((i + 1) / 48) * Math.PI * 2
    const am = (a0 + a1) / 2
    d += `M${E(Math.cos(a0) * 0.91, Math.sin(a0) * 0.91)}Q${E(Math.cos(am) * 0.97, Math.sin(am) * 0.97)} ${E(Math.cos(a1) * 0.91, Math.sin(a1) * 0.91)}`
  }
  return d
}

const PETAL = 'M0 0C-14 -6 -19 -27 -7 -35C-3 -31 3 -31 7 -35C19 -27 14 -6 0 0Z'

function petal(uid, x, y, rot, s, shade = 1) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s * 10) / 10} ${f(s * 0.6 * 10) / 10})">
    <path d="${PETAL}" fill="url(#${uid}-petal)" opacity="${shade}"/>
    <path d="M0 -3C-6 -12 -6 -22 -3 -30" fill="none" stroke="#ff8a95" stroke-opacity="0.28" stroke-width="1.2"/>
  </g>`
}

function candle(uid, index, x, y, h, w, s, holder) {
  const hw = w / 2
  const ry = w * 0.2
  const cup = holder
    ? `<ellipse cx="0" cy="3" rx="${f(w * 0.95)}" ry="${f(w * 0.34)}" fill="url(#${uid}-cup)"/>
       <path d="M${f(-w * 0.95)} 3 L${f(-w * 0.8)} 13 A${f(w * 0.8)} ${f(w * 0.28)} 0 0 0 ${f(w * 0.8)} 13 L${f(w * 0.95)} 3 Z" fill="url(#${uid}-rimSide)"/>`
    : ''
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * 100) / 100})">
    ${cup}
    <path d="M${-hw} 0L${-hw} ${-h}A${hw} ${f(ry)} 0 0 0 ${hw} ${-h}L${hw} 0A${hw} ${f(ry)} 0 0 1 ${-hw} 0Z" fill="url(#${uid}-wax)"/>
    <path d="M${-hw} 0L${-hw} ${-h}A${hw} ${f(ry)} 0 0 0 ${hw} ${-h}L${hw} 0A${hw} ${f(ry)} 0 0 1 ${-hw} 0Z" fill="url(#${uid}-waxGlow)"/>
    <ellipse cx="0" cy="${-h}" rx="${hw}" ry="${f(ry)}" fill="url(#${uid}-waxTop)"/>
    <path d="M${f(hw * 0.25)} ${-h + 2}C${f(hw * 0.3)} ${-h + 16} ${f(hw * 0.55)} ${-h + 22} ${f(hw * 0.45)} ${-h + 32}C${f(hw * 0.38)} ${-h + 37} ${f(hw * 0.18)} ${-h + 30} ${f(hw * 0.2)} ${-h + 18}Z" fill="#fff4dc" opacity="0.85"/>
    <path d="M0 ${-h}L1 ${-h - 9}" stroke="#2a1606" stroke-width="2.2" stroke-linecap="round"/>
    <g transform="translate(1 ${-h - 6})"><g class="kina-flame" data-i="${index}">
      <ellipse cx="0" cy="-3" rx="4.5" ry="3.4" fill="#7f97ff" opacity="0.55"/>
      <path d="M0 0C-9 -4 -12 -22 -6 -36C-3 -44 0 -52 0 -64C2 -52 5 -44 7 -36C12 -22 9 -4 0 0Z" fill="url(#${uid}-flame)"/>
      <path d="M0 -2C-4 -4 -5 -14 -2 -22C-1 -26 0 -30 0 -35C1 -30 2 -26 3 -22C5 -14 4 -4 0 -2Z" fill="#fffdf2" opacity="0.92"/>
    </g></g>
  </g>`
}

function halo(uid, index, x, y, s) {
  return `<circle class="kina-halo" data-i="${index}" cx="${f(x)}" cy="${f(y)}" r="${f(120 * s)}" fill="url(#${uid}-halo)"/>`
}

// The tray, viewBox 0 0 1000 720. Returns markup plus the flame count.
export function traySvg(uid) {
  const random = seeded(7)
  const candles = []
  const ringHeights = [150, 128, 168, 138, 120, 158]
  for (let k = 0; k < 6; k += 1) {
    const a = -Math.PI / 2 + Math.PI / 6 + (k * Math.PI) / 3
    const u = Math.cos(a) * 0.68
    const v = Math.sin(a) * 0.68
    candles.push({ x: CX + u * FX, y: FCY + v * FY, h: ringHeights[k], w: 34, s: 0.9 + 0.12 * ((v + 1) / 2), holder: true, back: v < 0 })
  }
  const bowl = [
    { x: 452, y: 458, h: 122, w: 28, s: 1 },
    { x: 502, y: 448, h: 178, w: 30, s: 1 },
    { x: 550, y: 460, h: 136, w: 28, s: 1 },
  ]
  let index = 0
  const draw = (c) => {
    const markup = candle(uid, index, c.x, c.y, c.h, c.w, c.s, c.holder)
    c.index = index
    index += 1
    return markup
  }
  const back = candles.filter((c) => c.back).map(draw).join('')
  const inBowl = bowl.map(draw).join('')
  const front = candles.filter((c) => !c.back).map(draw).join('')
  const halos = [...candles, ...bowl].map((c) => halo(uid, c.index, c.x, c.y - (c.h + 36) * c.s, c.s)).join('')

  const trayPetals = [
    [300, 566, 20, 1.1], [672, 586, 140, 1.05], [410, 612, -40, 1], [610, 540, 70, 0.9],
    [250, 500, -70, 0.9], [760, 506, 110, 0.95], [520, 628, 10, 1.05],
  ]
    .map(([x, y, r, s]) => petal(uid, x, y, r, s, 0.95))
    .join('')
  const clothPetals = Array.from({ length: 9 }, (_, i) => {
    const side = i % 2 ? 1 : -1
    return petal(uid, CX + side * (470 + random() * 70), 560 + random() * 150, random() * 360, 1.2 + random() * 0.4, 0.85)
  }).join('')

  const henna = Array.from({ length: 7 }, () => {
    const x = 410 + random() * 180
    const y = 452 + random() * 14
    return `<path d="M${f(x)} ${f(y)}q8 -4 16 0t16 0" fill="none" stroke="#2e1206" stroke-opacity="0.45" stroke-width="1.6" stroke-linecap="round"/>`
  }).join('')

  return `<svg viewBox="0 0 1000 720" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" overflow="visible">
  <defs>
    <filter id="${uid}-soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="18"/></filter>
    <linearGradient id="${uid}-rimTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8df95"/><stop offset="0.28" stop-color="#c3923e"/><stop offset="0.62" stop-color="#8d5f1f"/><stop offset="0.86" stop-color="#e2b45c"/><stop offset="1" stop-color="#6b4314"/>
    </linearGradient>
    <linearGradient id="${uid}-rimSide" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3a2408"/><stop offset="0.25" stop-color="#9c6c27"/><stop offset="0.48" stop-color="#f1cd7d"/><stop offset="0.7" stop-color="#8a5c1d"/><stop offset="1" stop-color="#2f1c06"/>
    </linearGradient>
    <radialGradient id="${uid}-floor" cx="0.5" cy="0.3" r="0.75">
      <stop offset="0" stop-color="#f6d88e"/><stop offset="0.35" stop-color="#d1a14c"/><stop offset="0.75" stop-color="#9a6a26"/><stop offset="1" stop-color="#5e3a10"/>
    </radialGradient>
    <radialGradient id="${uid}-cup" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#f3d17f"/><stop offset="0.6" stop-color="#a87526"/><stop offset="1" stop-color="#5b3a0f"/>
    </radialGradient>
    <linearGradient id="${uid}-wax" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a98457"/><stop offset="0.3" stop-color="#f0dfc0"/><stop offset="0.5" stop-color="#fff6e4"/><stop offset="0.8" stop-color="#ddc499"/><stop offset="1" stop-color="#8f6d42"/>
    </linearGradient>
    <linearGradient id="${uid}-waxGlow" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0.55" stop-color="#ff9a3c" stop-opacity="0"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0.55"/>
    </linearGradient>
    <radialGradient id="${uid}-waxTop" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#fff4d6"/><stop offset="1" stop-color="#e9c98e"/>
    </radialGradient>
    <linearGradient id="${uid}-flame" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#fff3cf"/><stop offset="0.3" stop-color="#ffd56e"/><stop offset="0.66" stop-color="#ff9a2e"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${uid}-halo">
      <stop offset="0" stop-color="#ffcf7a" stop-opacity="0.55"/><stop offset="0.3" stop-color="#ff9c45" stop-opacity="0.2"/><stop offset="1" stop-color="#ff7a30" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${uid}-copper" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3d1606"/><stop offset="0.22" stop-color="#9c4720"/><stop offset="0.45" stop-color="#f0a46a"/><stop offset="0.62" stop-color="#b25a28"/><stop offset="1" stop-color="#341204"/>
    </linearGradient>
    <linearGradient id="${uid}-copperRim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc58f"/><stop offset="0.5" stop-color="#b8602c"/><stop offset="1" stop-color="#5a2208"/>
    </linearGradient>
    <radialGradient id="${uid}-henna" cx="0.45" cy="0.4" r="0.7">
      <stop offset="0" stop-color="#9a5426"/><stop offset="0.55" stop-color="#6e3415"/><stop offset="1" stop-color="#3b1a08"/>
    </radialGradient>
    <radialGradient id="${uid}-petal" cx="0.5" cy="0.75" r="0.8">
      <stop offset="0" stop-color="#d83a52"/><stop offset="0.55" stop-color="#9e1b32"/><stop offset="1" stop-color="#560817"/>
    </radialGradient>
    <radialGradient id="${uid}-coin" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#fff2b8"/><stop offset="0.5" stop-color="#d9a84a"/><stop offset="1" stop-color="#7a5216"/>
    </radialGradient>
  </defs>
  <ellipse cx="500" cy="548" rx="490" ry="160" fill="#0a0103" opacity="0.6" filter="url(#${uid}-soft)"/>
  ${clothPetals}
  <path d="M40 500A460 165 0 0 0 960 500L960 528A460 165 0 0 1 40 528Z" fill="url(#${uid}-rimSide)"/>
  <ellipse cx="500" cy="500" rx="460" ry="165" fill="url(#${uid}-rimTop)"/>
  <ellipse cx="500" cy="500" rx="459" ry="164" fill="none" stroke="#fff1c4" stroke-opacity="0.55" stroke-width="1.5"/>
  <ellipse cx="${CX}" cy="${FCY}" rx="${FX}" ry="${FY}" fill="url(#${uid}-floor)"/>
  <ellipse cx="${CX}" cy="${FCY - 3}" rx="${FX}" ry="${FY}" fill="none" stroke="#4a2c0c" stroke-opacity="0.6" stroke-width="5"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path id="${uid}-engrave" d="${engraving()}" stroke="#4a2a0a" stroke-opacity="0.5" stroke-width="1.5"/>
    <use href="#${uid}-engrave" transform="translate(0 1.4)" stroke="#fff0c2" stroke-opacity="0.32" stroke-width="1"/>
  </g>
  <g transform="translate(330 610)"><ellipse rx="26" ry="11" fill="url(#${uid}-coin)"/><ellipse rx="19" ry="7.5" fill="none" stroke="#7a5216" stroke-opacity="0.6"/></g>
  <g transform="translate(366 622)"><ellipse rx="22" ry="9.5" fill="url(#${uid}-coin)"/><ellipse rx="16" ry="6.4" fill="none" stroke="#7a5216" stroke-opacity="0.6"/></g>
  ${trayPetals}
  ${back}
  <ellipse cx="500" cy="530" rx="150" ry="36" fill="#1a0602" opacity="0.5" filter="url(#${uid}-soft)"/>
  <ellipse cx="500" cy="512" rx="70" ry="16" fill="#5a2208"/>
  <path d="M372 452C376 532 448 550 500 550C552 550 624 532 628 452Z" fill="url(#${uid}-copper)"/>
  <path d="M388 482Q500 528 612 482" fill="none" stroke="#ffd2a0" stroke-opacity="0.45" stroke-width="2"/>
  <path d="M396 496Q500 538 604 496" fill="none" stroke="#3d1606" stroke-opacity="0.5" stroke-width="1.5" stroke-dasharray="2 7"/>
  <ellipse cx="500" cy="452" rx="128" ry="30" fill="url(#${uid}-copperRim)"/>
  <ellipse cx="500" cy="453" rx="117" ry="24" fill="#2a0f04"/>
  <ellipse cx="500" cy="457" rx="112" ry="21" fill="url(#${uid}-henna)"/>
  ${henna}
  ${inBowl}
  ${front}
  <g class="kina-halos" style="mix-blend-mode:screen">${halos}</g>
</svg>`
}

/* ------------------------------------------------------------- mount */

function glowSprite() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,240,200,1)')
  g.addColorStop(0.25, 'rgba(255,200,110,0.6)')
  g.addColorStop(1, 'rgba(212,162,76,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return c
}

let counter = 0
// The pointer parallax, shared by every scene on the page: the hero mounted
// under the intro starts from the intro's offset, so nothing slides at the
// hand-off.
const sway = { px: 0, py: 0, sx: 0, sy: 0 }

/**
 * Builds the illustrated candle scene inside host.
 * Returns { root, setPointer(x, y), setGlow(v), setPaused(bool), dispose }.
 */
export function mountKinaScene(host, { reduce = false } = {}) {
  counter += 1
  const uid = `kina${counter}`
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const root = document.createElement('div')
  root.className = 'kina-stage'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = `
    <canvas class="kina-velvet"></canvas>
    <div class="kina-embroidery">${embroiderySvg(uid, small ? 0.62 : 0.85)}</div>
    <div class="kina-glow"></div>
    <div class="kina-tray">${traySvg(uid)}</div>
    <canvas class="kina-motes"></canvas>
    <div class="kina-vignette"></div>`
  host.appendChild(root)

  const velvet = root.querySelector('.kina-velvet')
  const embroidery = root.querySelector('.kina-embroidery')
  const glowEl = root.querySelector('.kina-glow')
  const tray = root.querySelector('.kina-tray')
  const motes = root.querySelector('.kina-motes')
  const mctx = motes.getContext('2d')
  const byIndex = (a, b) => Number(a.dataset.i) - Number(b.dataset.i)
  const flames = [...root.querySelectorAll('.kina-flame')].sort(byIndex)
  const halos = [...root.querySelectorAll('.kina-halo')].sort(byIndex)
  const phases = flames.map((_, i) => i * 1.7 + 0.3)
  const sprite = glowSprite()

  const view = { w: 1, h: 1, dpr: 1, tx: 0.5, ty: 0.8, tw: 0.5, top: 0.6 }
  const random = seeded(41)
  // a stable pseudo-random value per particle and per lap
  const hash = (a, b) => {
    const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return v - Math.floor(v)
  }
  const DUST = small ? 26 : 46
  const dust = Array.from({ length: DUST }, () => ({ x: 0, y: 0, life: random(), speed: 0.4 + random() * 0.6, size: 1 + random() * 2.2, sway: random() * 6 }))
  const PETALS = small ? 4 : 7
  const falling = Array.from({ length: PETALS }, () => ({ x: random(), y: random(), rot: random() * 6, spin: (random() - 0.5) * 2, speed: 0.03 + random() * 0.03, size: 7 + random() * 6 }))

  const layout = () => {
    const rect = root.getBoundingClientRect()
    const t = tray.getBoundingClientRect()
    view.w = rect.width || window.innerWidth
    view.h = rect.height || window.innerHeight
    view.tx = (t.left + t.width / 2 - rect.left) / view.w
    view.ty = (t.top + t.height * 0.68 - rect.top) / view.h
    view.tw = t.width / view.w
    view.top = (t.top + t.height * 0.32 - rect.top) / view.h
    view.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    motes.width = Math.round(view.w * view.dpr)
    motes.height = Math.round(view.h * view.dpr)
    paintVelvet(velvet, view.w, view.h, { x: view.tx, y: view.ty })
    glowEl.style.setProperty('--gx', `${(view.tx * 100).toFixed(1)}%`)
    glowEl.style.setProperty('--gy', `${(view.top * 100 + 6).toFixed(1)}%`)
  }
  const observer = new ResizeObserver(layout)
  observer.observe(root)
  layout()

  let glow = 1
  let paused = false
  let { px, py, sx, sy } = sway
  let raf = 0
  // Flames, dust and petals are a pure function of the wall clock, so the
  // intro and the hero mounted under it flicker and drift in step through
  // the cross-fade (no doubled petals).
  let time = 0

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    if (paused || document.visibilityState !== 'visible') return
    time = reduce ? 0 : now / 1000
    sx += (px - sx) * 0.05
    sy += (py - sy) * 0.05
    Object.assign(sway, { px, py, sx, sy })
    embroidery.style.transform = `translate3d(${(sx * -8).toFixed(2)}px, ${(sy * -6).toFixed(2)}px, 0)`
    tray.style.transform = `translate3d(${(sx * 12).toFixed(2)}px, ${(sy * 6).toFixed(2)}px, 0)`

    let total = 0
    for (let i = 0; i < flames.length; i += 1) {
      const p = phases[i]
      const n = reduce ? 0 : Math.sin(time * 11 + p) * 0.5 + Math.sin(time * 23.7 + p * 2) * 0.3 + Math.sin(time * 3.1 + p) * 0.2
      const k = reduce ? 0 : Math.sin(time * 2.3 + p) * 6 + Math.sin(time * 7.9 + p) * 2.5
      const sxF = 1 - n * 0.06
      const syF = 1 + n * 0.12
      flames[i].setAttribute('transform', `skewX(${k.toFixed(2)}) scale(${sxF.toFixed(3)} ${syF.toFixed(3)})`)
      const h = glow * (0.82 + n * 0.12)
      halos[i].setAttribute('opacity', h.toFixed(3))
      total += n
    }
    const avg = total / flames.length
    glowEl.style.opacity = (glow * (0.85 + avg * 0.15)).toFixed(3)
    embroidery.style.opacity = (0.5 + glow * 0.12 + avg * 0.04).toFixed(3)

    // gold dust rising from the candles, a few petals drifting down
    const { w, h, dpr } = view
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    mctx.clearRect(0, 0, w, h)
    if (reduce) return
    mctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < DUST; i += 1) {
      const d = dust[i]
      const run = d.life + time * d.speed * 0.22
      const lap = Math.floor(run)
      const life = run - lap
      const dx = view.tx + (hash(i, lap) - 0.5) * view.tw * 0.6
      const dy = view.top + hash(i + 97, lap) * 0.05
      const y = (dy - life * 0.45) * h + sy * 10
      const x = dx * w + Math.sin(time * 0.8 + d.sway) * 14 * life + sx * 16
      const a = Math.sin(life * Math.PI) * glow * 0.8
      if (a <= 0.01) continue
      const s = d.size * 6
      mctx.globalAlpha = a
      mctx.drawImage(sprite, x - s / 2, y - s / 2, s, s)
    }
    mctx.globalCompositeOperation = 'source-over'
    for (let i = 0; i < PETALS; i += 1) {
      const p = falling[i]
      // top (-0.08) to bottom (1.08) and round again, a new column each lap
      const run = p.y + 0.08 + time * p.speed
      const lap = Math.floor(run / 1.16)
      const x = hash(i + 31, lap) * w + Math.sin(time * 0.6 + i) * 30 + sx * 20
      const y = (run - lap * 1.16 - 0.08) * h
      mctx.globalAlpha = 0.85
      mctx.save()
      mctx.translate(x, y)
      mctx.rotate(p.rot + time * p.spin)
      mctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(time * 1.3 + i)))
      mctx.fillStyle = i % 2 ? '#9e1b32' : '#b8243c'
      mctx.beginPath()
      mctx.moveTo(0, p.size)
      mctx.bezierCurveTo(-p.size * 1.3, p.size * 0.2, -p.size * 0.8, -p.size, 0, -p.size * 0.7)
      mctx.bezierCurveTo(p.size * 0.8, -p.size, p.size * 1.3, p.size * 0.2, 0, p.size)
      mctx.fill()
      mctx.restore()
    }
    mctx.globalAlpha = 1
  }
  raf = requestAnimationFrame(frame)

  return {
    root,
    view,
    setPointer(x, y) {
      px = x
      py = y
    },
    setGlow(v) {
      glow = v
    },
    getGlow: () => glow,
    setPaused(v) {
      paused = v
    },
    dispose() {
      cancelAnimationFrame(raf)
      observer.disconnect()
      root.remove()
    },
  }
}
