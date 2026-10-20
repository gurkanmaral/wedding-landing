// Snow Globe: a glass dome on a gilded base fills the screen, standing on a
// dark table among blurred festive lights; inside, a timber chalet on Uludağ.
// The guest shakes the phone (DeviceMotion; on iOS the first tap asks for
// permission) or swipes: the globe rocks, the snow inside swirls into a vortex
// and slowly settles, the gold base turns to bring the couple's engraved names
// round to the front, then the view dives through the glass toward the chalet
// door until a gust of snow, led by one great crystal flake, sweeps across and
// whites out the screen; it blows clear on the page hero's own opening view
// (the same illustration, same snowfall clock), so the hand-over is seamless.
// DOM, SVG and canvas only.
import { gsap } from 'gsap'
import { paintWinter, winterLayout, chaletDoor, mountWinter } from '../../../templates/snow-globe/winterArt.js'
import { foilTile, loop, seeded } from '../foil.js'

export const fonts = () => [
  { family: 'Cinzel', weight: 500, google: 'Cinzel:wght@500;600' },
  { family: 'Cormorant Garamond', weight: 500, google: 'Cormorant+Garamond:wght@500' },
  { family: 'Italiana', google: 'Italiana' },
]

export const copy = {
  en: { prompt: 'Shake your phone or swipe the globe' },
  tr: { prompt: 'Telefonu sallayın ya da küreyi kaydırın' },
}

const CSS = (s) => `
${s}{position:absolute;inset:0;overflow:hidden;background:#081726;touch-action:none;user-select:none;-webkit-user-select:none}
${s} canvas.room{position:absolute;inset:0;width:100%;height:100%}
${s} .bokeh{position:absolute;border-radius:50%;mix-blend-mode:screen;animation:${s.slice(1)}-tw 4s ease-in-out infinite alternate}
${s} .globe{position:absolute;transform-origin:50% 50%;will-change:transform}
${s} .dome{position:absolute;left:0;top:0;border-radius:50%;overflow:hidden;background:#0f2a44;transform:translateZ(0)}
${s} .dome img,${s} .dome canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
${s} .glass{position:absolute;left:0;top:0;pointer-events:none}
${s} .base{position:absolute;pointer-events:none}
${s} .base canvas{position:absolute}
${s} .hero{position:absolute;inset:0;opacity:0;will-change:transform,opacity}
${s} .veil{position:absolute;inset:0 0 auto;height:55%;background:radial-gradient(70% 60% at 50% 25%,rgb(6 17 31 / .55),rgb(6 17 31 / 0) 75%);pointer-events:none}
${s} canvas.gust{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
@keyframes ${s.slice(1)}-tw{from{opacity:.45;transform:scale(.92)}to{opacity:1;transform:scale(1.05)}}
`

const GOLD = [
  [0, '#5c3f0c'],
  [0.12, '#a77a24'],
  [0.3, '#fff0b6'],
  [0.42, '#d4af37'],
  [0.6, '#8a6418'],
  [0.76, '#f0d27a'],
  [0.9, '#a77a24'],
  [1, '#4f360a'],
]

function goldGradient(ctx, x0, x1) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0)
  GOLD.forEach(([o, c]) => g.addColorStop(o, c))
  return g
}

/* ------------------------------------------------------------- room */

function paintRoom(canvas, W, H, dpr, tableY, globe) {
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const bg = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.4, Math.hypot(W, H) * 0.7)
  bg.addColorStop(0, '#1d3a5c')
  bg.addColorStop(0.5, '#0f2a44')
  bg.addColorStop(1, '#050d17')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  // out-of-focus fairy lights and a window far behind
  const rand = seeded(8)
  const colors = ['255,214,140', '212,175,55', '192,57,43', '255,240,214', '159,184,204']
  const count = Math.round((W * H) / 24000) + 10
  for (let i = 0; i < count; i += 1) {
    const x = rand() * W
    const y = rand() * tableY * 0.95
    const r = (0.015 + rand() * 0.05) * Math.max(W, H) * (0.6 + (y / H) * 0.6)
    const c = colors[Math.floor(rand() * colors.length)]
    const a = 0.05 + rand() * 0.15
    const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r)
    g.addColorStop(0, `rgba(${c},${a * 0.75})`)
    g.addColorStop(0.8, `rgba(${c},${a})`)
    g.addColorStop(1, `rgba(${c},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // the table: dark walnut with long grain and the globe's warm reflection
  const wood = ctx.createLinearGradient(0, tableY, 0, H)
  wood.addColorStop(0, '#3b2416')
  wood.addColorStop(0.3, '#24150c')
  wood.addColorStop(1, '#0e0805')
  ctx.fillStyle = wood
  ctx.fillRect(0, tableY, W, H - tableY)
  ctx.strokeStyle = 'rgba(120,80,45,0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i < 26; i += 1) {
    const y = tableY + (H - tableY) * (i / 26) ** 1.3
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(W * 0.3, y + (rand() - 0.5) * 6, W * 0.6, y + (rand() - 0.5) * 6, W, y + (rand() - 0.5) * 4)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(255,214,140,0.22)'
  ctx.fillRect(0, tableY, W, 1.2)
  const refl = ctx.createRadialGradient(globe.x, tableY + 6, 0, globe.x, tableY + 6, globe.r * 1.2)
  refl.addColorStop(0, 'rgba(255,205,120,0.35)')
  refl.addColorStop(1, 'rgba(255,205,120,0)')
  ctx.fillStyle = refl
  ctx.save()
  ctx.translate(0, tableY)
  ctx.scale(1, 0.25)
  ctx.fillRect(globe.x - globe.r * 1.3, -globe.r, globe.r * 2.6, globe.r * 4)
  ctx.restore()
  // holly and berries beside the base
  const holly = (x, y, s, flip) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(flip ? -s : s, s)
    for (const [a, l] of [[-0.5, 1], [0.35, 0.9], [-1.4, 0.8]]) {
      ctx.save()
      ctx.rotate(a)
      ctx.beginPath()
      ctx.moveTo(0, 0)
      for (let k = 1; k <= 4; k += 1) {
        ctx.quadraticCurveTo(k * 9 * l - 4, -8, k * 9 * l, -3 + (k % 2) * -2)
      }
      ctx.quadraticCurveTo(38 * l, 0, 36 * l, 2)
      for (let k = 4; k >= 1; k -= 1) ctx.quadraticCurveTo(k * 9 * l - 4, 9, (k - 1) * 9 * l, 3)
      ctx.closePath()
      ctx.fillStyle = '#173a2c'
      ctx.fill()
      ctx.strokeStyle = 'rgba(160,200,170,0.35)'
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.moveTo(2, 0)
      ctx.lineTo(34 * l, 1)
      ctx.stroke()
      ctx.restore()
    }
    for (const [bx, by] of [[0, -4], [7, -1], [3, 5]]) {
      const g = ctx.createRadialGradient(bx - 1.5, by - 1.5, 0.5, bx, by, 4.5)
      g.addColorStop(0, '#ff8a7a')
      g.addColorStop(0.4, '#c0392b')
      g.addColorStop(1, '#5e1510')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
  const hs = globe.r / 95
  holly(globe.x - globe.r * 1.05, tableY + globe.r * 0.12, hs, false)
  holly(globe.x + globe.r * 1.08, tableY + globe.r * 0.18, hs * 0.85, true)
}

/* ------------------------------------------------------------- glass */

function glassSVG(D, id) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${D}" height="${D}">
  <defs>
    <radialGradient id="${id}t" cx="50" cy="46" r="52" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#cfe2f5" stop-opacity="0"/><stop offset=".72" stop-color="#cfe2f5" stop-opacity=".04"/>
      <stop offset=".9" stop-color="#bcd5ee" stop-opacity=".2"/><stop offset=".97" stop-color="#e8f2fc" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity=".7"/>
    </radialGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".6" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}c" cx="50" cy="94" r="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd58a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
    <filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".8"/></filter>
    <filter id="${id}bb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#${id}t)"/>
  <circle cx="50" cy="50" r="49.3" fill="none" stroke="#0a1a2c" stroke-opacity=".4" stroke-width="1.1"/>
  <circle cx="50" cy="50" r="47.6" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width=".5"/>
  <path d="M17 34C20 22 30 13 43 10C36 15 29 23 25 34C23 40 22 46 22 52C19 47 16 41 17 34Z" fill="url(#${id}w)" filter="url(#${id}b)"/>
  <ellipse cx="31" cy="21" rx="4.2" ry="1.8" transform="rotate(-38 31 21)" fill="#fff" fill-opacity=".85" filter="url(#${id}b)"/>
  <path d="M86 30A42 42 0 0 1 88 70" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round" filter="url(#${id}b)"/>
  <path d="M78 82A42 42 0 0 1 62 90" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.1" stroke-linecap="round" filter="url(#${id}b)"/>
  <ellipse cx="50" cy="93" rx="26" ry="7" fill="url(#${id}c)" filter="url(#${id}bb)"/>
  <circle cx="72" cy="18" r="1.4" fill="#ffe2a6" fill-opacity=".55" filter="url(#${id}b)"/>
  <circle cx="20" cy="66" r="1.1" fill="#ff9f8a" fill-opacity=".4" filter="url(#${id}b)"/>
</svg>`
}

/* -------------------------------------------------------------- base */

function baseSVG(D, id, foil) {
  const w = D * 0.92
  const h = D * 0.36
  const cx = w / 2
  const tier = (y0, y1, half) => {
    const ry = Math.max(2, half * 0.11)
    return `<path d="M${cx - half} ${y0}L${cx - half} ${y1}A${half} ${ry} 0 0 0 ${cx + half} ${y1}L${cx + half} ${y0}A${half} ${ry} 0 0 1 ${cx - half} ${y0}Z" fill="url(#${id}g)"/>
      <path d="M${cx - half} ${y0}L${cx - half} ${y1}A${half} ${ry} 0 0 0 ${cx + half} ${y1}L${cx + half} ${y0}A${half} ${ry} 0 0 1 ${cx - half} ${y0}Z" fill="url(#${id}f)" opacity=".55"/>
      <path d="M${cx - half} ${y0}A${half} ${ry} 0 0 0 ${cx + half} ${y0}" fill="none" stroke="#fff3c4" stroke-opacity=".75" stroke-width="1"/>
      <path d="M${cx - half} ${y1}A${half} ${ry} 0 0 0 ${cx + half} ${y1}" fill="none" stroke="#3a2706" stroke-opacity=".7" stroke-width="1.2"/>`
  }
  const k = D
  return {
    w,
    h,
    // the front face of the band tier: straight sides, top and bottom curving toward the viewer
    band: { x: cx - k * 0.37, y: k * 0.1, w: k * 0.74, h: k * 0.14 + k * 0.37 * 0.11, ry: k * 0.37 * 0.11 },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <linearGradient id="${id}g" x1="0" x2="1">${GOLD.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
      <pattern id="${id}f" width="160" height="160" patternUnits="userSpaceOnUse"><image href="${foil}" width="160" height="160"/></pattern>
      <radialGradient id="${id}s" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="${cx}" cy="${h * 0.95}" rx="${w * 0.52}" ry="${h * 0.08}" fill="url(#${id}s)"/>
    ${tier(k * 0.27, k * 0.325, k * 0.45)}
    ${tier(k * 0.24, k * 0.27, k * 0.405)}
    ${tier(k * 0.1, k * 0.24, k * 0.37)}
    ${tier(k * 0.07, k * 0.1, k * 0.34)}
    ${tier(k * 0.012, k * 0.07, k * 0.3)}
  </svg>`,
  }
}

/* ---------------------------------------------------------- engraving */

// The band around the base is a cylinder: a long engraved strip is projected
// onto it slice by slice, so turning the base turns the lettering for real.
function makeStrip(names, date, bandW, bandH, dpr) {
  const r = bandW / 2
  const C = Math.PI * 2 * r
  const strip = document.createElement('canvas')
  strip.width = Math.round(C * 2 * dpr)
  strip.height = Math.round(bandH * dpr)
  const ctx = strip.getContext('2d')
  ctx.scale(dpr, dpr)
  const engrave = (text, x, y, font) => {
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,244,200,0.75)'
    ctx.fillText(text, x, y + 1.1)
    ctx.fillStyle = 'rgba(58,36,5,0.92)'
    ctx.fillText(text, x, y)
  }
  let size = bandH * 0.44
  ctx.font = `600 ${size}px Cinzel, 'Cormorant Garamond', Georgia, serif`
  const maxW = r * 1.55
  while (ctx.measureText(names).width > maxW && size > 8) {
    size -= 1
    ctx.font = `600 ${size}px Cinzel, 'Cormorant Garamond', Georgia, serif`
  }
  const textW = ctx.measureText(names).width
  const snowflake = (x, y, s) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.lineCap = 'round'
    for (const [color, off] of [['rgba(255,244,200,0.7)', 1], ['rgba(58,36,5,0.9)', 0]]) {
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(1, s * 0.09)
      for (let i = 0; i < 6; i += 1) {
        const a = (i * Math.PI) / 3
        const ex = Math.cos(a) * s
        const ey = Math.sin(a) * s + off
        ctx.beginPath()
        ctx.moveTo(0, off)
        ctx.lineTo(ex, ey)
        ctx.moveTo(ex * 0.55 + Math.cos(a + 0.6) * s * 0.3, ey * 0.55 + Math.sin(a + 0.6) * s * 0.3)
        ctx.lineTo(ex * 0.55, ey * 0.55 + (off ? off * 0.45 : 0))
        ctx.lineTo(ex * 0.55 + Math.cos(a - 0.6) * s * 0.3, ey * 0.55 + Math.sin(a - 0.6) * s * 0.3)
        ctx.stroke()
      }
    }
    ctx.restore()
  }
  for (const base of [0, C]) {
    engrave(names, base + C / 2, bandH * 0.46, `600 ${size}px Cinzel, 'Cormorant Garamond', Georgia, serif`)
    engrave(date.toUpperCase(), base + C / 2, bandH * 0.78, `500 ${Math.max(7, bandH * 0.15)}px Cinzel, Georgia, serif`)
    for (const side of [-1, 1]) {
      const x = base + C / 2 + side * (textW / 2 + bandH * 0.4)
      ctx.fillStyle = 'rgba(58,36,5,0.85)'
      ctx.beginPath()
      ctx.moveTo(x, bandH * 0.3)
      ctx.lineTo(x + bandH * 0.08, bandH * 0.42)
      ctx.lineTo(x, bandH * 0.54)
      ctx.lineTo(x - bandH * 0.08, bandH * 0.42)
      ctx.fill()
    }
    // the back of the base carries a snowflake
    snowflake(base, bandH * 0.48, bandH * 0.3)
  }
  snowflake(C * 2, bandH * 0.48, bandH * 0.3)
  return { strip, C, r }
}

function drawBand(canvas, band, strip, rot, dpr) {
  const ctx = canvas.getContext('2d')
  const { w, h } = band
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = goldGradient(ctx, 0, w)
  ctx.fillRect(0, 0, w, h)
  const { r, C } = strip
  const step = 1.5
  for (let dx = -r + step / 2; dx < r; dx += step) {
    const th = Math.asin(Math.max(-1, Math.min(1, dx / r)))
    let src = (C / 2 + (th + rot) * r) % C
    if (src < 0) src += C
    const sw = step / Math.max(0.06, Math.cos(th))
    ctx.drawImage(strip.strip, src * dpr, 0, sw * dpr, h * dpr, dx + r - step / 2, 0, step + 0.4, h)
  }
  // cylinder shading and a fixed highlight
  const shade = ctx.createLinearGradient(0, 0, w, 0)
  shade.addColorStop(0, 'rgba(40,25,4,0.55)')
  shade.addColorStop(0.18, 'rgba(40,25,4,0)')
  shade.addColorStop(0.3, 'rgba(255,248,215,0.22)')
  shade.addColorStop(0.36, 'rgba(255,248,215,0)')
  shade.addColorStop(0.82, 'rgba(40,25,4,0)')
  shade.addColorStop(1, 'rgba(40,25,4,0.6)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, w, h)
}

/* -------------------------------------------------------------- gust */

// A crystal snowflake sprite: six feathered arms round a hexagonal heart.
function crystal(size, seed) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const rand = seeded(seed)
  const r = size * 0.4
  ctx.translate(size / 2, size / 2)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#fff'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(170,200,232,0.95)'
  ctx.shadowBlur = size * 0.05
  const branches = [0.3 + rand() * 0.08, 0.52 + rand() * 0.08, 0.74 + rand() * 0.06]
  const lens = branches.map((b) => r * (0.16 + rand() * 0.12) * (1.15 - b))
  for (let i = 0; i < 6; i += 1) {
    ctx.save()
    ctx.rotate((i * Math.PI) / 3)
    ctx.lineWidth = size * 0.026
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -r)
    branches.forEach((b, k) => {
      const y = -r * b
      ctx.moveTo(0, y)
      ctx.lineTo(-lens[k] * 0.75, y - lens[k])
      ctx.moveTo(0, y)
      ctx.lineTo(lens[k] * 0.75, y - lens[k])
    })
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, -r * 1.06)
    ctx.lineTo(r * 0.05, -r * 0.96)
    ctx.lineTo(0, -r * 0.87)
    ctx.lineTo(-r * 0.05, -r * 0.96)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  ctx.lineWidth = size * 0.02
  ctx.beginPath()
  for (let k = 0; k <= 6; k += 1) {
    const a = (k * Math.PI) / 3 + Math.PI / 6
    ctx[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 0.15, Math.sin(a) * r * 0.15)
  }
  ctx.stroke()
  return c
}

/**
 * The gust that carries the guest from the globe to the page: a slanted wall
 * of blown snow with billowing fronts, a scatter of crystal flakes in depth
 * and one great flake riding just ahead of the wall. draw(p, dir): p 0…1, the
 * screen is completely white around p = 0.5.
 */
function createGust(canvas) {
  const ctx = canvas.getContext('2d')
  const sprites = [crystal(128, 3), crystal(128, 8), crystal(128, 15)]
  // out-of-focus copies for the flakes nearest the lens (no-op where canvas filters are unsupported)
  const soft = sprites.map((sprite) => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')
    x.filter = 'blur(4px)'
    x.drawImage(sprite, 0, 0)
    return c
  })
  const hero = crystal(320, 21)
  const rand = seeded(61)
  const flakes = Array.from({ length: 64 }, (_, i) => ({ off: rand() * 2 - 1, y: rand(), z: rand(), spin: (rand() - 0.5) * 5, a0: rand() * 6, v: i % 3, wob: rand() * 6 }))
  let W = 1
  let H = 1
  let dpr = 1
  let F = 1
  let core = 1
  let skew = 0
  let cloud = null
  const resize = (w, h, ratio) => {
    W = w
    H = h
    dpr = ratio
    canvas.width = Math.round(w * ratio)
    canvas.height = Math.round(h * ratio)
    skew = H * 0.18
    F = Math.max(W, H) * 0.45
    core = W * 1.3 + skew
    // the wall of snow is soft anyway: paint it once at quarter resolution
    const S = core + F * 2
    const q = 0.25
    cloud = document.createElement('canvas')
    cloud.width = Math.ceil(S * q)
    cloud.height = Math.ceil(H * q)
    const c = cloud.getContext('2d')
    c.scale(q, q)
    const g = c.createLinearGradient(0, 0, S, 0)
    g.addColorStop(0, 'rgba(236,243,250,0)')
    g.addColorStop((F * 0.55) / S, 'rgba(236,243,250,0.4)')
    g.addColorStop(F / S, 'rgba(242,247,252,1)')
    g.addColorStop((F + core) / S, 'rgba(242,247,252,1)')
    g.addColorStop((F * 1.45 + core) / S, 'rgba(236,243,250,0.4)')
    g.addColorStop(1, 'rgba(236,243,250,0)')
    c.fillStyle = g
    c.fillRect(0, 0, S, H)
    const r2 = seeded(9)
    const puff = (x, y, r, color) => {
      const b = c.createRadialGradient(x, y, 0, x, y, r)
      b.addColorStop(0, color)
      b.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'))
      c.fillStyle = b
      c.fillRect(x - r, y - r, r * 2, r * 2)
    }
    // billows along both fronts so the edges are clouds, not gradients
    for (let i = 0; i < 70; i += 1) {
      const lead = i % 2
      const d = (r2() * 0.9 - 0.15) * F
      puff(lead ? F + core + d : F - d, r2() * H, (0.05 + r2() * 0.14) * Math.max(W, H), `rgba(246,250,253,${(0.4 + r2() * 0.3).toFixed(2)})`)
    }
    // cool shading inside the wall, so the white-out has depth
    for (let i = 0; i < 16; i += 1) {
      puff(F + r2() * core, r2() * H, (0.1 + r2() * 0.2) * Math.max(W, H), 'rgba(196,214,232,0.28)')
    }
  }
  const draw = (p, dir) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (p <= 0 || p >= 1 || !cloud) return
    if (dir < 0) ctx.setTransform(-dpr, 0, 0, dpr, W * dpr, 0)
    const S = core + F * 2
    const start = -S - skew / 2
    const mid = -F - skew / 2 - W * 0.15
    const end = W + skew / 2
    const x = p < 0.5 ? start + (mid - start) * p * 2 : mid + (end - mid) * (p - 0.5) * 2
    const u = p * 2 - 1
    const fade = Math.min(1, (1 - Math.abs(u)) * 2.5)
    // flakes behind the wall's leading edge
    const m = Math.min(W, H)
    const flake = (f, near) => {
      const size = m * (0.022 + f.z * f.z * 0.12)
      if (near !== f.z > 0.72) return
      const spd = 0.8 + f.z * 1.5
      const fx = W / 2 + f.off * W * 0.45 + u * (W * 0.7 + size) * spd
      const fy = f.y * H + Math.sin(f.wob + p * 7) * H * 0.04 + u * H * 0.1
      ctx.save()
      ctx.translate(fx, fy)
      ctx.rotate(f.a0 + f.spin * p)
      ctx.globalAlpha = fade * (0.55 + 0.45 * f.z)
      ctx.drawImage(near ? soft[f.v] : sprites[f.v], -size, -size, size * 2, size * 2)
      ctx.restore()
    }
    flakes.forEach((f) => flake(f, false))
    // the wall itself, slanted so its top leads
    ctx.save()
    ctx.transform(1, 0, -skew / H, 1, skew / 2, 0)
    ctx.globalAlpha = 1
    ctx.drawImage(cloud, x, 0, S, H)
    ctx.restore()
    // the great flake rides the leading front, growing as it nears the lens
    const front = x + F + core + F * 0.3
    if (p < 0.5) {
      const size = m * (0.32 + p * 1.1)
      ctx.save()
      ctx.translate(front, H * (0.46 - p * 0.1))
      ctx.rotate(p * 2.4 * dir)
      ctx.globalAlpha = Math.min(1, p * 10)
      ctx.drawImage(hero, -size, -size, size * 2, size * 2)
      ctx.restore()
    }
    flakes.forEach((f) => flake(f, true))
    ctx.globalAlpha = 1
  }
  return { resize, draw }
}

/* -------------------------------------------------------------- scene */

export default function create(host, template, { onOpened, setCaption }) {
  const id = `sgi${Math.random().toString(36).slice(2, 7)}`
  const root = document.createElement('div')
  root.className = id
  root.setAttribute('aria-hidden', 'true')
  const style = document.createElement('style')
  style.textContent = CSS(`.${id}`)
  root.appendChild(style)
  host.appendChild(root)

  const room = document.createElement('canvas')
  room.className = 'room'
  root.appendChild(room)
  const bokehBox = document.createElement('div')
  root.appendChild(bokehBox)
  const heroBox = document.createElement('div')
  heroBox.className = 'hero'
  root.appendChild(heroBox)
  const globe = document.createElement('div')
  globe.className = 'globe'
  root.appendChild(globe)
  const dome = document.createElement('div')
  dome.className = 'dome'
  globe.appendChild(dome)
  const snowC = document.createElement('canvas')
  const glass = document.createElement('div')
  glass.className = 'glass'
  globe.appendChild(glass)
  const baseBox = document.createElement('div')
  baseBox.className = 'base'
  globe.appendChild(baseBox)
  const gustC = document.createElement('canvas')
  gustC.className = 'gust'
  root.appendChild(gustC)
  const gust = createGust(gustC)

  // the page hero's opening view, veil and all; it is only shown once the gust has whited out the screen
  const hero = mountWinter(heroBox, { motion: true, frost: true })
  const veil = document.createElement('div')
  veil.className = 'veil'
  heroBox.appendChild(veil)
  const foil = foilTile(160, 21)
  const names = `${template.couple[0]} & ${template.couple[1]}`.toUpperCase()
  const small = Math.min(window.innerWidth, window.innerHeight) < 640

  const G = { W: 0, H: 0, D: 1, x: 0, y: 0, dpr: 1, door: { x: 0, y: 0 }, band: null, strip: null }
  let urls = []
  const bandCanvas = document.createElement('canvas')
  const rig = { rot: Math.PI, energy: 0, dive: 0, tilt: 0, float: 1, gust: 0, settle: 0 }

  const layout = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    if (W === G.W && H === G.H) return
    const portrait = W / H < 0.9
    const D = Math.round(portrait ? Math.min(W * 0.97, H * 0.53) : Math.min(H * 0.64, W * 0.5))
    const cy = H * (portrait ? 0.41 : 0.4)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    Object.assign(G, { W, H, D, x: W / 2, y: cy, dpr })
    Object.assign(globe.style, { left: `${W / 2 - D / 2}px`, top: `${cy - D / 2}px`, width: `${D}px`, height: `${D}px` })
    Object.assign(dome.style, { width: `${D}px`, height: `${D}px` })
    // the scene inside the glass
    urls.forEach((u) => URL.revokeObjectURL(u))
    urls = []
    dome.replaceChildren()
    const art = paintWinter(D, D, { round: true })
    for (const svg of [art.sky, art.land, art.front]) {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      urls.push(url)
      const img = new Image()
      img.alt = ''
      img.src = url
      dome.appendChild(img)
    }
    dome.appendChild(snowC)
    snowC.width = Math.round(D * dpr)
    snowC.height = Math.round(D * dpr)
    G.door = chaletDoor(winterLayout(D, D, true))
    glass.innerHTML = glassSVG(D, id)
    // the base, its engraved band and the table it stands on
    const base = baseSVG(D, id, foil)
    baseBox.innerHTML = base.svg
    Object.assign(baseBox.style, { left: `${D / 2 - base.w / 2}px`, top: `${D * 0.885}px`, width: `${base.w}px`, height: `${base.h}px` })
    G.band = base.band
    const { x: bx, y: by, w: bw, h: bh, ry } = base.band
    Object.assign(bandCanvas.style, {
      left: `${bx}px`,
      top: `${by}px`,
      width: `${bw}px`,
      height: `${bh}px`,
      clipPath: `path('M0 0A${bw / 2} ${ry} 0 0 0 ${bw} 0L${bw} ${bh - ry}A${bw / 2} ${ry} 0 0 1 0 ${bh - ry}Z')`,
    })
    bandCanvas.width = Math.round(base.band.w * dpr)
    bandCanvas.height = Math.round(base.band.h * dpr)
    baseBox.appendChild(bandCanvas)
    G.strip = makeStrip(names, template.dateLabel || '', base.band.w, base.band.h, dpr)
    drawBand(bandCanvas, G.band, G.strip, rig.rot, dpr)
    const tableY = cy - D / 2 + D * 0.885 + base.h * 0.93
    paintRoom(room, W, H, Math.min(dpr, 1.5), tableY, { x: W / 2, r: D / 2 })
    // a few lights that twinkle
    bokehBox.replaceChildren()
    const rand = seeded(3)
    for (let i = 0; i < (small ? 7 : 12); i += 1) {
      const b = document.createElement('div')
      b.className = 'bokeh'
      const r = (0.02 + rand() * 0.035) * Math.max(W, H)
      const c = ['255,214,140', '212,175,55', '192,57,43', '255,240,214'][i % 4]
      Object.assign(b.style, {
        left: `${rand() * W - r}px`,
        top: `${rand() * tableY * 0.9 - r}px`,
        width: `${r * 2}px`,
        height: `${r * 2}px`,
        background: `radial-gradient(circle,rgba(${c},.12) 50%,rgba(${c},.32) 82%,rgba(${c},0) 100%)`,
        animationDelay: `${-rand() * 4}s`,
        animationDuration: `${3 + rand() * 3}s`,
      })
      bokehBox.appendChild(b)
    }
    hero.layout()
    gust.resize(W, H, Math.min(dpr, 1.5))
  }

  /* -------------------------------------------------- snow in the glass */
  // Normalised to the dome: x, y in −1…1, z depth for size; settled flakes lie on the snowfield.
  const N = small ? 260 : 420
  const P = new Float32Array(N * 6) // x, y, z, vx, vy, settled
  const rand = seeded(44)
  const floor = (x) => 0.48 + 0.1 * x * x
  for (let i = 0; i < N; i += 1) {
    const o = i * 6
    const x = (rand() * 2 - 1) * 0.86
    const drifting = rand() < 0.2
    P[o] = x
    P[o + 1] = drifting ? -0.8 + rand() * 1.2 : floor(x) + rand() * 0.25
    P[o + 2] = rand() * 2 - 1
    P[o + 3] = 0
    P[o + 4] = 0
    P[o + 5] = drifting ? 0 : 1
  }
  const flake = document.createElement('canvas')
  flake.width = flake.height = 24
  {
    const f = flake.getContext('2d')
    const g = f.createRadialGradient(12, 12, 0, 12, 12, 12)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.5, 'rgba(244,248,252,0.8)')
    g.addColorStop(1, 'rgba(244,248,252,0)')
    f.fillStyle = g
    f.fillRect(0, 0, 24, 24)
  }
  const sctx = snowC.getContext('2d')
  let dir = 1
  const stepSnow = (dt, t) => {
    const e = rig.energy
    for (let i = 0; i < N; i += 1) {
      const o = i * 6
      let x = P[o]
      let y = P[o + 1]
      let z = P[o + 2]
      let vx = P[o + 3]
      let vy = P[o + 4]
      if (P[o + 5]) {
        // a shake lifts settled snow back into the water
        if (e > 0.25 && rand() < e * dt * 6) {
          P[o + 5] = 0
          vy = -(0.6 + rand() * 1.4) * e
          vx = (rand() - 0.5) * e
        } else continue
      }
      // vortex around the vertical axis: x swings while depth turns
      const ang = 2.6 * e * dir * dt
      const cos = Math.cos(ang)
      const sin = Math.sin(ang)
      const nx = x * cos - z * sin
      z = x * sin + z * cos
      x = nx
      vx += (Math.sin(t * 1.7 + i) * 0.4 - x * 0.8) * e * dt
      vy += (0.14 - e * 0.5 * Math.max(0, y)) * dt
      vx *= 1 - 2.2 * dt
      vy *= 1 - 2.4 * dt
      x += vx * dt
      y += vy * dt + 0.035 * dt
      // keep inside the glass
      const rr = x * x + y * y
      if (rr > 0.86) {
        const k = 0.927 / Math.sqrt(rr)
        x *= k
        y *= k
        vx *= -0.3
        vy *= -0.3
      }
      if (y > floor(x)) {
        y = floor(x)
        if (e < 0.35) {
          if (rig.float && rand() < 0.5) {
            // keep a few flakes drifting while the globe waits
            y = -0.85 + rand() * 0.4
            x = (rand() * 2 - 1) * 0.6
          } else P[o + 5] = 1
        } else vy = -Math.abs(vy) * 0.5
      }
      P[o] = x
      P[o + 1] = y
      P[o + 2] = z
      P[o + 3] = vx
      P[o + 4] = vy
    }
    const D = G.D
    sctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0)
    sctx.clearRect(0, 0, D, D)
    const half = D / 2
    for (let i = 0; i < N; i += 1) {
      const o = i * 6
      const z = P[o + 2]
      const s = D * (0.0065 + 0.0035 * (z + 1)) * (P[o + 5] ? 0.8 : 1)
      sctx.globalAlpha = P[o + 5] ? 0.75 : 0.55 + 0.4 * (z + 1) * 0.5
      sctx.drawImage(flake, half + P[o] * half - s, half + P[o + 1] * half - s, s * 2, s * 2)
    }
    sctx.globalAlpha = 1
  }

  /* ---------------------------------------------------------- frame */
  let px = 0
  let py = 0
  let bandRot = rig.rot
  const stop = loop((dt, t) => {
    layout()
    if (rig.energy > 0) rig.energy = Math.max(0, rig.energy - dt * 0.42)
    stepSnow(dt, t)
    if (Math.abs(bandRot - rig.rot) > 0.0005) {
      bandRot = rig.rot
      drawBand(bandCanvas, G.band, G.strip, bandRot, G.dpr)
    }
    // the globe breathes and leans away from the pointer
    const k = rig.dive
    const scale = 1 + k * k * k * 9
    const lift = Math.sin(t * 0.9) * G.D * 0.004 * (1 - k)
    globe.style.transformOrigin = `${G.door.x}px ${G.door.y}px`
    globe.style.transform = `translate3d(${(px * 6 * (1 - k)).toFixed(2)}px,${(lift + py * 4 * (1 - k)).toFixed(2)}px,0) rotate(${(rig.tilt || 0).toFixed(3)}deg) scale(${scale.toFixed(4)})`
    glass.style.transform = `translate(${(-px * 2).toFixed(2)}px,${(-py * 2).toFixed(2)}px)`
    glass.style.opacity = Math.max(0, 1 - k * 2.2).toFixed(3)
    baseBox.style.opacity = Math.max(0, 1 - k * 3).toFixed(3)
    room.style.opacity = bokehBox.style.opacity = Math.max(0, 1 - k * 1.8).toFixed(3)
    // behind the white-out the globe gives way to the hero, which settles from a touch of zoom to
    // exactly the page's opening framing before the hand-over
    const swapped = rig.gust >= 0.5
    globe.style.visibility = room.style.visibility = bokehBox.style.visibility = swapped ? 'hidden' : ''
    heroBox.style.opacity = swapped ? '1' : '0'
    heroBox.style.transform = rig.settle < 1 ? `scale(${(1.06 - 0.06 * rig.settle).toFixed(4)})` : ''
    if (swapped) hero.tick(dt, t)
    gust.draw(rig.gust, dir)
  })

  /* ------------------------------------------------------- opening */
  let timeline = null
  const open = () => {
    if (timeline) return
    rig.float = 0
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(rig, { tilt: -5 * dir, duration: 0.12, ease: 'power2.out' }, 0)
      .to(rig, { tilt: 4 * dir, duration: 0.18, ease: 'sine.inOut' }, 0.12)
      .to(rig, { tilt: -2.5 * dir, duration: 0.2, ease: 'sine.inOut' }, 0.3)
      .to(rig, { tilt: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, 0.5)
      .call(() => {
        rig.energy = 1
      }, null, 0.05)
      .to(rig, { rot: 0, duration: 2.3, ease: 'power2.inOut' }, 0.5)
      .call(() => setCaption?.('date', 'top'), null, 2.5)
      .to(rig, { dive: 1, duration: 2.2, ease: 'power2.in' }, 3.0)
      .call(() => setCaption?.(null), null, 4.1)
      // the gust: in fast as the view nears the door, a beat of white, then it blows clear of the hero
      .to(rig, { gust: 0.5, duration: 0.95, ease: 'power2.out' }, 4.25)
      .to(rig, { gust: 1, duration: 0.95, ease: 'power2.in' }, 5.2)
      .to(rig, { settle: 1, duration: 1.4, ease: 'power2.out' }, 5.2)
      .to({}, { duration: 0.15 }, 6.6)
  }

  /* --------------------------------------------- shake, swipe, motion */
  let down = null
  let swiped = false
  const onDown = (event) => {
    down = { x: event.clientX, y: event.clientY }
    swiped = false
  }
  const onMove = (event) => {
    if (!down || swiped || timeline) return
    const dx = event.clientX - down.x
    const dy = event.clientY - down.y
    if (Math.hypot(dx, dy) > 34) {
      swiped = true
      dir = dx < 0 ? -1 : 1
      host.click()
    }
  }
  const onUp = () => {
    down = null
  }
  let lastA = null
  const onMotion = (event) => {
    const a = event.accelerationIncludingGravity || event.acceleration
    if (!a || a.x == null) return
    if (lastA) {
      const jerk = Math.abs(a.x - lastA.x) + Math.abs(a.y - lastA.y) + Math.abs((a.z || 0) - (lastA.z || 0))
      if (jerk > 22 && !timeline) {
        dir = a.x - lastA.x < 0 ? -1 : 1
        host.click()
      } else if (timeline && jerk > 18) {
        rig.energy = Math.min(1, rig.energy + 0.3)
      }
    }
    lastA = { x: a.x, y: a.y, z: a.z }
  }
  const needsPermission = typeof window.DeviceMotionEvent?.requestPermission === 'function'
  let asked = false
  // iOS: the first tap asks for motion access instead of opening, so the guest can then shake
  const onClick = (event) => {
    if (!needsPermission || asked || timeline || swiped) return
    asked = true
    event.stopPropagation()
    window.DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') {
          window.addEventListener('devicemotion', onMotion)
          // a little nudge so the guest sees the globe is ready to be shaken
          rig.energy = 0.3
          gsap.fromTo(rig, { tilt: -2 }, { tilt: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
        } else host.click()
      })
      .catch(() => host.click())
  }
  root.addEventListener('pointerdown', onDown)
  root.addEventListener('pointermove', onMove)
  root.addEventListener('pointerup', onUp)
  root.addEventListener('pointercancel', onUp)
  root.addEventListener('click', onClick)
  if (!needsPermission) window.addEventListener('devicemotion', onMotion)

  layout()

  return {
    open,
    skip: () => {
      if (!timeline) open()
      timeline.progress(1)
    },
    setPointer: (x, y) => {
      // the hero copy stays unparallaxed, as the page hero opens before the pointer moves
      px = x
      py = y
    },
    dispose: () => {
      timeline?.kill()
      gsap.killTweensOf(rig)
      stop()
      window.removeEventListener('devicemotion', onMotion)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointercancel', onUp)
      root.removeEventListener('click', onClick)
      urls.forEach((u) => URL.revokeObjectURL(u))
      hero.dispose()
      root.remove()
    },
  }
}
