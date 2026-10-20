// The İznik tile wall, built as DOM: every tile is a small card with a glazed
// face (painted SVG under a canvas glaze texture) and a moving specular
// highlight. Shared by the page hero and the intro, so the intro's last frame
// is exactly the hero's first.
//
// The faces are painted once and never again: the light moves only
// compositor layers (each tile's highlight by transform) and redraws one small
// canvas for the raking light, so a light move never repaints the SVG art.
import { izArt } from './motifs.js'
import './wall.css'

function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

// Tile size, the 4 × 4 medallion block and the inscription band beneath it.
export function wallLayout(width, height) {
  const s = Math.max(56, Math.min(width / 4, height / 6.2, 170))
  const mx = width / 2 - 2 * s
  const my = Math.max(s * 0.35, (height - 5 * s) * 0.46)
  return {
    width,
    height,
    s,
    mx,
    my,
    c0: Math.floor(-mx / s),
    c1: Math.ceil((width - mx) / s) - 1,
    r0: Math.floor(-my / s),
    r1: Math.ceil((height - my) / s) - 1,
    cx: mx + 2 * s,
    cy: my + 2 * s,
    bandY: my + 4 * s,
  }
}

export function layoutVars(l) {
  return { '--s': `${l.s}px`, '--cx': `${l.cx}px`, '--cy': `${l.cy}px`, '--band-y': `${l.bandY}px` }
}

let glazeUrl = null
// Glaze: soft pooling, a few pinholes and a faint crackle network.
function glazeTexture() {
  if (glazeUrl) return glazeUrl
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const random = rng(31)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 26; i += 1) {
    const x = random() * size
    const y = random() * size
    const r = 20 + random() * 70
    for (const [ox, oy] of [
      [0, 0],
      [size, 0],
      [-size, 0],
      [0, size],
      [0, -size],
    ]) {
      const g = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r)
      const tone = random() > 0.5 ? '150,128,90' : '110,120,140'
      g.addColorStop(0, `rgba(${tone},0.07)`)
      g.addColorStop(1, `rgba(${tone},0)`)
      ctx.fillStyle = g
      ctx.fillRect(x + ox - r, y + oy - r, r * 2, r * 2)
    }
  }
  ctx.strokeStyle = 'rgba(90,75,50,0.13)'
  ctx.lineWidth = 0.6
  for (let i = 0; i < 34; i += 1) {
    let x = random() * size
    let y = random() * size
    let a = random() * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let k = 0; k < 5; k += 1) {
      a += (random() - 0.5) * 1.4
      x += Math.cos(a) * (8 + random() * 18)
      y += Math.sin(a) * (8 + random() * 18)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  for (let i = 0; i < 60; i += 1) {
    ctx.fillStyle = `rgba(80,70,50,${0.08 + random() * 0.12})`
    ctx.beginPath()
    ctx.arc(random() * size, random() * size, 0.4 + random() * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  glazeUrl = `url(${canvas.toDataURL('image/png')})`
  return glazeUrl
}

/**
 * mode 'painted': painted faces only (hero).
 * mode 'blank': each card has a blank glazed front and the painted face on its back (intro).
 */
export function buildWall(host, { mode = 'painted', onLayout } = {}) {
  const art = izArt()
  const el = document.createElement('div')
  el.className = 'izw'
  el.style.setProperty('--iz-glaze', glazeTexture())
  el.style.setProperty('--iz-field', art.field)
  el.style.setProperty('--iz-med', art.medallion)
  el.style.setProperty('--iz-band', art.kitabe)
  const tileLayer = document.createElement('div')
  tileLayer.className = 'izw-tiles'
  // raking light and warm glow over the whole wall, drawn at quarter
  // resolution: both are soft gradients, the upscale is invisible
  const shade = document.createElement('canvas')
  shade.className = 'izw-shade'
  const shadeCtx = shade.getContext('2d')
  const SHADE_RES = 0.25
  el.append(tileLayer, shade)
  host.appendChild(el)

  const tiles = []
  let layout = null
  let gap = 0
  let lit = []
  const light = { x: 0, y: 0, drawn: false }

  const build = () => {
    const width = host.clientWidth || window.innerWidth
    const height = host.clientHeight || window.innerHeight
    if (layout && Math.abs(layout.width - width) < 1 && Math.abs(layout.height - height) < 1) return
    layout = wallLayout(width, height)
    const { s, mx, my } = layout
    gap = Math.max(2, s * 0.028)
    Object.entries(layoutVars(layout)).forEach(([k, v]) => el.style.setProperty(k, v))
    el.style.setProperty('--gap', `${gap}px`)
    tileLayer.textContent = ''
    tiles.length = 0
    const random = rng(7)
    const frag = document.createDocumentFragment()
    for (let row = layout.r0; row <= layout.r1; row += 1) {
      for (let col = layout.c0; col <= layout.c1; col += 1) {
        const kind = row === 4 ? 'band' : col >= 0 && col < 4 && row >= 0 && row < 4 ? 'med' : 'field'
        const x = mx + col * s
        const y = my + row * s
        const tile = document.createElement('div')
        tile.className = `izw-tile izw-tile--${kind}`
        // each handmade tile sits at a slightly different angle, so the
        // highlight breaks from tile to tile: (tx, ty) is where the light's
        // reflection is centred, relative to the light, in face coordinates
        const tx = (random() - 0.5) * s * 0.3 - gap / 2
        const ty = (random() - 0.5) * s * 0.3 - gap / 2
        tile.style.cssText =
          `left:${(x + gap / 2).toFixed(1)}px;top:${(y + gap / 2).toFixed(1)}px;` +
          `--gx:${Math.floor(random() * 256)}px;--gy:${Math.floor(random() * 256)}px`
        const card = document.createElement('div')
        card.className = 'izw-card'
        const face = document.createElement('div')
        face.className = 'izw-face izw-art'
        face.innerHTML = '<i class="izw-sheen"></i>'
        if (kind === 'med') face.style.backgroundPosition = `${-(col * s + gap / 2)}px ${-(row * s + gap / 2)}px`
        card.appendChild(face)
        let blank = null
        if (mode === 'blank') {
          face.style.transform = 'rotateY(180deg)'
          blank = document.createElement('div')
          blank.className = 'izw-face izw-blank'
          blank.innerHTML = '<i class="izw-sheen"></i>'
          card.appendChild(blank)
        }
        tile.appendChild(card)
        frag.appendChild(tile)
        const sheens = [...card.querySelectorAll('.izw-sheen')]
        tiles.push({ el: tile, card, art: face, blank, sheens, col, row, kind, x, y, tx, ty })
      }
    }
    tileLayer.appendChild(frag)
    shade.width = Math.ceil(width * SHADE_RES)
    shade.height = Math.ceil(height * SHADE_RES)
    lit = []
    if (light.drawn) setLight(light.x, light.y, true)
    onLayout?.(layout)
  }

  const drawShade = () => {
    const { width, height, s } = layout
    const { x, y } = light
    const ctx = shadeCtx
    ctx.setTransform(SHADE_RES, 0, 0, SHADE_RES, 0, 0)
    ctx.clearRect(0, 0, width, height)
    // warm bloom of the light on the glaze
    const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.8)
    glow.addColorStop(0, 'rgba(255,246,228,0.24)')
    glow.addColorStop(1, 'rgba(255,246,228,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
    // the wall darkens toward the far corners
    const far = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 0.95
    const dark = ctx.createRadialGradient(x, y, 0, x, y, far)
    dark.addColorStop(0, 'rgba(70,55,35,0)')
    dark.addColorStop(0.19, 'rgba(70,55,35,0)')
    dark.addColorStop(1, 'rgba(70,55,35,0.2)')
    ctx.fillStyle = dark
    ctx.fillRect(0, 0, width, height)
  }

  // Moves each tile's specular highlight by transform; only tiles the
  // highlight actually reaches are shown, the rest stay hidden.
  const setLight = (x, y, force = false) => {
    if (!force && light.drawn && Math.abs(x - light.x) < 0.3 && Math.abs(y - light.y) < 0.3) return
    light.x = x
    light.y = y
    light.drawn = true
    drawShade()
    const { s, mx, my } = layout
    const r = s * 0.42
    const w = s - gap
    const next = []
    for (const tile of tiles) {
      const hx = x - mx - tile.col * s - tile.tx
      const hy = y - my - tile.row * s - tile.ty
      const dx = hx - Math.max(0, Math.min(w, hx))
      const dy = hy - Math.max(0, Math.min(w, hy))
      if (dx * dx + dy * dy >= r * r) continue
      const transform = `translate3d(${(hx - r).toFixed(1)}px,${(hy - r).toFixed(1)}px,0)`
      for (const sheen of tile.sheens) sheen.style.transform = transform
      next.push(tile)
    }
    for (const tile of next) if (!tile.lit) tile.sheens.forEach((sheen) => (sheen.style.visibility = 'visible'))
    for (const tile of lit) tile.lit = false
    for (const tile of next) tile.lit = true
    for (const tile of lit) if (!tile.lit) tile.sheens.forEach((sheen) => (sheen.style.visibility = ''))
    lit = next
  }
  build()
  const observer = new ResizeObserver(build)
  observer.observe(host)

  return {
    el,
    tiles,
    get layout() {
      return layout
    },
    tileAt(px, py) {
      return { col: Math.floor((px - layout.mx) / layout.s), row: Math.floor((py - layout.my) / layout.s) }
    },
    setLight,
    dispose() {
      observer.disconnect()
      el.remove()
    },
  }
}
