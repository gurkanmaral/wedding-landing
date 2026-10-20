// The İznik tile wall, built as DOM: every tile is a small card with a glazed
// face (painted SVG under a canvas glaze texture) and a moving specular
// highlight. Shared by the page hero and the intro, so the intro's last frame
// is exactly the hero's first.
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
  const shade = document.createElement('div')
  shade.className = 'izw-shade'
  el.append(tileLayer, shade)
  host.appendChild(el)

  const tiles = []
  let layout = null

  const build = () => {
    const width = host.clientWidth || window.innerWidth
    const height = host.clientHeight || window.innerHeight
    if (layout && Math.abs(layout.width - width) < 1 && Math.abs(layout.height - height) < 1) return
    layout = wallLayout(width, height)
    const { s, mx, my } = layout
    const gap = Math.max(2, s * 0.028)
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
        // highlight breaks from tile to tile
        tile.style.cssText =
          `left:${(x + gap / 2).toFixed(1)}px;top:${(y + gap / 2).toFixed(1)}px;` +
          `--tx:${(x + (random() - 0.5) * s * 0.3).toFixed(1)}px;--ty:${(y + (random() - 0.5) * s * 0.3).toFixed(1)}px;` +
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
        tiles.push({ el: tile, card, art: face, blank, col, row, kind, x, y })
      }
    }
    tileLayer.appendChild(frag)
    onLayout?.(layout)
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
    setLight(x, y) {
      el.style.setProperty('--lx', `${x.toFixed(1)}px`)
      el.style.setProperty('--ly', `${y.toFixed(1)}px`)
    },
    dispose() {
      observer.disconnect()
      el.remove()
    },
  }
}
