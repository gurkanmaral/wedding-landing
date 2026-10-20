// Sunny Storybook — "Pull the tab". Illustrated paper, not a 3D world: a
// closed, hand-inked storybook cover fills the screen (canvas-painted ink and
// watercolour). Pulling its red paper tab swings the cover open on the spine
// (CSS 3D), the book tilts down and flat pop-up layers rise on their hinges —
// sky and sea, trulli, a doorway arch, a lemon tree, a Vespa. A paper bird (SVG)
// flies in with a ribbon bearing the names, then we push through the doorway.
import { gsap } from 'gsap'
import { makeCanvas, seeded } from '../core.js'

export const fonts = () => [
  { family: 'Fraunces', style: 'italic', weight: 400, google: 'Fraunces:ital,opsz,wght@1,9..144,400' },
  { family: 'Caveat', weight: 600, google: 'Caveat:wght@600' },
]

export const copy = {
  en: { prompt: 'Pull the tab', kicker: 'The story of', tag: 'a pop-up book', pull: 'pull' },
  tr: { prompt: 'Şeridi çekin', kicker: 'Bir aşk hikâyesi', tag: 'açılır sayfalı bir kitap', pull: 'çek' },
}

const INK = '#28241d'
const TOMATO = '#d84b2a'
const CREAM = '#fdf8ea'
const PAPER = '#fbf4e2'
const OCHRE = '#e9a23b'
const OLIVE = '#7c9a5c'
const LEAF = '#5f7d45'
const SEA = '#78a6b6'
const LEMON = '#f2c53d'
const STONE = '#bab3a5'
const DISPLAY = '"Fraunces", Georgia, serif'
const HAND = '"Caveat", "Fraunces", cursive'

/* ------------------------------------------------------- hand-drawn helpers */

function addGrain(ctx, width, height, amount, random) {
  const image = ctx.getImageData(0, 0, width, height)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (random() - 0.5) * amount
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(image, 0, 0)
}

// Ink line: a firm stroke plus a faint, slightly offset second pass.
function ink(ctx, random, width, draw, color = INK) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let pass = 0; pass < 2; pass += 1) {
    ctx.globalAlpha = pass ? 0.35 : 0.92
    ctx.lineWidth = width * (pass ? 0.55 : 1)
    ctx.save()
    ctx.translate((random() - 0.5) * width * 0.9, (random() - 0.5) * width * 0.9)
    ctx.beginPath()
    draw()
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

// Watercolour fill: an opaque paper base, three misregistered translucent
// layers and a darker pooled edge.
function wash(ctx, random, color, spread, draw, { base = CREAM } = {}) {
  ctx.save()
  if (base) {
    ctx.fillStyle = base
    ctx.beginPath()
    draw()
    ctx.fill()
  }
  ctx.fillStyle = color
  for (let i = 0; i < 3; i += 1) {
    ctx.globalAlpha = 0.4
    ctx.save()
    ctx.translate((random() - 0.5) * spread, (random() - 0.5) * spread)
    ctx.beginPath()
    draw()
    ctx.fill()
    ctx.restore()
  }
  ctx.globalAlpha = 0.28
  ctx.strokeStyle = color
  ctx.lineWidth = spread * 0.9
  ctx.beginPath()
  draw()
  ctx.stroke()
  ctx.restore()
}

// Wobbly ellipse; offsets are fixed up front so repeated draws match.
function blob(ctx, random, x, y, rx, ry, amount = 0.06, steps = 28) {
  const offsets = []
  for (let i = 0; i < steps; i += 1) offsets.push(1 + (random() - 0.5) * amount * 2)
  return () => {
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * Math.PI * 2
      const k = offsets[i % steps]
      const px = x + Math.cos(a) * rx * k
      const py = y + Math.sin(a) * ry * k
      if (i) ctx.lineTo(px, py)
      else ctx.moveTo(px, py)
    }
    ctx.closePath()
  }
}

// Wobbly polyline through the points, subdivided so straight edges waver.
function poly(ctx, random, points, closed, amount) {
  const pts = []
  const list = closed ? [...points, points[0]] : points
  for (let i = 0; i < list.length - 1; i += 1) {
    const [ax, ay] = list[i]
    const [bx, by] = list[i + 1]
    for (let s = 0; s < 4; s += 1) {
      const t = s / 4
      const j = s === 0 ? 0.5 : 1
      pts.push([ax + (bx - ax) * t + (random() - 0.5) * amount * j, ay + (by - ay) * t + (random() - 0.5) * amount * j])
    }
  }
  if (!closed) pts.push(list[list.length - 1])
  return () => {
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    if (closed) ctx.closePath()
  }
}

// Pop-up cut-out: the artwork on a slightly larger silhouette of plain paper.
function cutOut(src, margin) {
  const [canvas, ctx] = makeCanvas(src.width, src.height)
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2
    ctx.drawImage(src, Math.cos(a) * margin, Math.sin(a) * margin)
  }
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, src.width, src.height)
  ctx.globalCompositeOperation = 'source-over'
  ctx.drawImage(src, 0, 0)
  return [canvas, ctx]
}

/* ------------------------------------------------------------ pop-up layers */

function drawBackdrop(ctx, r, w, h) {
  const c = w / 2
  const bumps = []
  for (let x = 0; x < w; ) {
    const rad = 0.3 + r() * 0.45
    bumps.push([x, rad, 0.75 + r() * 0.35])
    x += rad * 2
  }
  const sky = () => {
    ctx.moveTo(0, h)
    ctx.lineTo(0, bumps[0][2])
    bumps.forEach(([x, rad, y]) => ctx.arc(x + rad, y, rad, Math.PI, 0))
    ctx.lineTo(w, h)
    ctx.closePath()
  }
  const g = ctx.createLinearGradient(0, 0.6, 0, 3.6)
  g.addColorStop(0, '#cfe3e0')
  g.addColorStop(1, '#f8e3bb')
  wash(ctx, r, g, 0.05, sky, { base: PAPER })
  ink(ctx, r, 0.03, sky)

  // sun
  const sx = c + 1.1
  const sy = 2.45
  wash(ctx, r, OCHRE, 0.04, blob(ctx, r, sx, sy, 0.6, 0.6, 0.05))
  wash(ctx, r, TOMATO, 0.03, blob(ctx, r, sx, sy, 0.36, 0.36, 0.08), { base: null })
  ink(ctx, r, 0.028, blob(ctx, r, sx, sy, 0.6, 0.6, 0.05))
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2 + 0.1
    const r0 = 0.72
    const r1 = i % 2 ? 0.92 : 1.05
    ink(ctx, r, 0.025, () => {
      ctx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0)
      ctx.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1)
    })
  }

  // clouds
  ;[
    [c - 2.1, 1.75, 0.9],
    [c + 3.2, 1.45, 1.1],
    [c - 4.8, 2.3, 1],
    [c + 5.4, 2.6, 0.8],
    [c - 0.4, 1.2, 0.7],
  ].forEach(([x, y, s]) => {
    const cloud = () => {
      ctx.moveTo(x - 0.55 * s, y + 0.12 * s)
      ctx.arc(x - 0.3 * s, y, 0.22 * s, Math.PI * 0.9, Math.PI * 1.75)
      ctx.arc(x + 0.05 * s, y - 0.12 * s, 0.28 * s, Math.PI * 1.1, Math.PI * 1.95)
      ctx.arc(x + 0.38 * s, y, 0.2 * s, Math.PI * 1.25, Math.PI * 0.15)
      ctx.lineTo(x - 0.55 * s, y + 0.12 * s)
      ctx.closePath()
    }
    wash(ctx, r, '#fffdf6', 0.02, cloud)
    ink(ctx, r, 0.022, cloud)
  })
  // gulls
  for (let i = 0; i < 4; i += 1) {
    const x = c - 1.2 + i * 0.35 + r() * 0.2
    const y = 2.0 + r() * 0.5
    ink(ctx, r, 0.018, () => {
      ctx.moveTo(x - 0.09, y)
      ctx.quadraticCurveTo(x - 0.04, y - 0.06, x, y)
      ctx.quadraticCurveTo(x + 0.04, y - 0.06, x + 0.09, y)
    })
  }

  // sea
  const seaTop = 3.5
  const sea = poly(ctx, r, [[0, seaTop], [w, seaTop], [w, 4.4], [0, 4.4]], true, 0.02)
  wash(ctx, r, SEA, 0.04, sea)
  ink(ctx, r, 0.026, poly(ctx, r, [[0, seaTop], [w, seaTop]], false, 0.02))
  for (let row = 0; row < 3; row += 1) {
    for (let x = 0.2 + row * 0.3; x < w; x += 0.7 + r() * 0.4) {
      const y = seaTop + 0.18 + row * 0.22
      ink(ctx, r, 0.014, () => {
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + 0.08, y - 0.07, x + 0.16, y)
        ctx.quadraticCurveTo(x + 0.24, y - 0.07, x + 0.32, y)
      })
    }
  }
  // sailboat
  const bx = c - 1.7
  const hull = () => {
    ctx.moveTo(bx - 0.22, seaTop + 0.12)
    ctx.lineTo(bx + 0.22, seaTop + 0.12)
    ctx.lineTo(bx + 0.14, seaTop + 0.2)
    ctx.lineTo(bx - 0.14, seaTop + 0.2)
    ctx.closePath()
  }
  const sail = () => {
    ctx.moveTo(bx, seaTop + 0.1)
    ctx.lineTo(bx, seaTop - 0.42)
    ctx.lineTo(bx + 0.24, seaTop + 0.08)
    ctx.closePath()
  }
  wash(ctx, r, INK, 0.01, hull)
  wash(ctx, r, TOMATO, 0.015, sail)
  ink(ctx, r, 0.016, sail)

  // hills with olive trees and white houses
  const hill = (base, amp, freq, phase, color) => {
    const pts = [[0, h]]
    for (let x = 0; x <= w + 0.01; x += 0.25) pts.push([x, base - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.3 + 1) * amp * 0.4])
    pts.push([w, h])
    const shape = () => {
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
    }
    wash(ctx, r, color, 0.04, shape)
    ink(ctx, r, 0.026, () => pts.slice(1, -1).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))))
    return pts
  }
  hill(4.15, 0.22, 0.9, 0.3, '#b7c493')
  const front = hill(4.6, 0.2, 1.3, 2, OLIVE)
  for (let i = 0; i < 18; i += 1) {
    const x = 0.3 + (i / 18) * (w - 0.6) + (r() - 0.5) * 0.3
    const idx = Math.min(front.length - 2, Math.max(1, Math.round(x / 0.25) + 1))
    const y = front[idx][1] + 0.05
    if (i % 4 === 1) {
      const house = poly(ctx, r, [[x - 0.14, y], [x - 0.14, y - 0.18], [x + 0.14, y - 0.18], [x + 0.14, y]], true, 0.01)
      wash(ctx, r, '#fffaf0', 0.01, house)
      ink(ctx, r, 0.014, house)
      continue
    }
    ink(ctx, r, 0.016, () => {
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - 0.16)
    })
    const crown = blob(ctx, r, x, y - 0.24, 0.13, 0.1, 0.12)
    wash(ctx, r, '#93ab6c', 0.02, crown)
    ink(ctx, r, 0.014, crown)
  }
}

function drawTrulli(ctx, r, w, h) {
  const base = h - 0.04
  const trullo = (x, ww, wh, ch, heart) => {
    const top = base - wh
    const wall = poly(ctx, r, [[x - ww / 2, base], [x - ww / 2, top], [x + ww / 2, top], [x + ww / 2, base]], true, 0.02)
    wash(ctx, r, '#f6ecd8', 0.02, wall)
    ink(ctx, r, 0.022, wall)
    const dw = ww * 0.13
    const door = () => {
      ctx.moveTo(x - dw, base)
      ctx.lineTo(x - dw, base - wh * 0.38)
      ctx.arc(x, base - wh * 0.38, dw, Math.PI, 0)
      ctx.lineTo(x + dw, base)
      ctx.closePath()
    }
    wash(ctx, r, TOMATO, 0.015, door)
    ink(ctx, r, 0.018, door)
    const win = blob(ctx, r, x + ww * 0.3, base - wh * 0.6, 0.05, 0.06, 0.1)
    wash(ctx, r, INK, 0.005, win)
    const half = ww * 0.53
    const cone = () => {
      ctx.moveTo(x - half, top)
      ctx.quadraticCurveTo(x - half * 0.55, top - ch * 0.78, x, top - ch)
      ctx.quadraticCurveTo(x + half * 0.55, top - ch * 0.78, x + half, top)
      ctx.closePath()
    }
    wash(ctx, r, STONE, 0.02, cone)
    for (let k = 1; k < 7; k += 1) {
      const f = k / 7
      const y = top - ch * f
      const span = half * Math.pow(1 - f, 0.75) * 0.92
      ink(ctx, r, 0.009, () => {
        ctx.moveTo(x - span, y)
        ctx.lineTo(x + span, y)
      }, '#6d665a')
    }
    ink(ctx, r, 0.022, cone)
    ink(ctx, r, 0.016, () => {
      ctx.moveTo(x, top - ch)
      ctx.lineTo(x, top - ch - 0.05)
    })
    const knob = blob(ctx, r, x, top - ch - 0.1, 0.055, 0.055, 0.05)
    wash(ctx, r, CREAM, 0.01, knob)
    ink(ctx, r, 0.014, knob)
    // the painted symbol on the cone
    const my = top - ch * 0.42
    if (heart) {
      const s = ch * 0.11
      const shape = () => {
        ctx.moveTo(x, my + s)
        ctx.bezierCurveTo(x - s * 1.6, my - s * 0.3, x - s * 0.6, my - s * 1.4, x, my - s * 0.5)
        ctx.bezierCurveTo(x + s * 0.6, my - s * 1.4, x + s * 1.6, my - s * 0.3, x, my + s)
        ctx.closePath()
      }
      wash(ctx, r, TOMATO, 0.01, shape, { base: null })
    } else {
      const s = ch * 0.08
      ink(ctx, r, 0.02, () => {
        ctx.arc(x, my, s, 0, Math.PI * 2)
        ctx.moveTo(x - s * 1.5, my)
        ctx.lineTo(x + s * 1.5, my)
        ctx.moveTo(x, my - s * 1.5)
        ctx.lineTo(x, my + s * 1.5)
      }, '#f6f1e6')
    }
  }
  trullo(0.75, 0.95, 0.72, 0.95, false)
  trullo(3.45, 0.9, 0.68, 0.9, false)
  trullo(2.1, 1.2, 0.92, 1.3, true)
  // dry-stone wall in front
  const wall = poly(ctx, r, [[0.1, h], [0.1, h - 0.22], [w - 0.1, h - 0.24], [w - 0.1, h]], true, 0.02)
  wash(ctx, r, '#d9d1c0', 0.02, wall)
  for (let x = 0.18; x < w - 0.2; x += 0.16 + r() * 0.08) {
    ink(ctx, r, 0.008, blob(ctx, r, x, h - 0.1 - (r() > 0.5 ? 0.06 : 0), 0.07, 0.04, 0.15, 12), '#6d665a')
  }
  ink(ctx, r, 0.02, wall)
}

function drawArch(ctx, r, w, h) {
  const c = w / 2
  const ow = 0.55
  const spring = h - 1.15
  const wall = () => {
    ctx.moveTo(0.05, h)
    ctx.lineTo(0.05, 0.62)
    ctx.lineTo(0.28, 0.62)
    ctx.lineTo(0.28, 0.5)
    ctx.lineTo(c - 0.55, 0.5)
    ctx.quadraticCurveTo(c - 0.25, 0.48, c, 0.16)
    ctx.quadraticCurveTo(c + 0.25, 0.48, c + 0.55, 0.5)
    ctx.lineTo(w - 0.28, 0.5)
    ctx.lineTo(w - 0.28, 0.62)
    ctx.lineTo(w - 0.05, 0.62)
    ctx.lineTo(w - 0.05, h)
    ctx.closePath()
  }
  wash(ctx, r, '#f3e7cf', 0.03, wall)
  for (let i = 0; i < 26; i += 1) {
    const x = 0.15 + r() * (w - 0.3)
    const y = 0.75 + r() * (h - 0.9)
    if (Math.abs(x - c) < ow + 0.3 && y > spring - ow - 0.3) continue
    ink(ctx, r, 0.008, () => {
      ctx.rect(x, y, 0.16 + r() * 0.1, 0.08)
    }, '#8c7f6a')
  }
  // voussoirs and jambs
  const ring = () => {
    ctx.moveTo(c - ow - 0.2, h)
    ctx.lineTo(c - ow - 0.2, spring)
    ctx.arc(c, spring, ow + 0.2, Math.PI, 0)
    ctx.lineTo(c + ow + 0.2, h)
    ctx.lineTo(c + ow, h)
    ctx.lineTo(c + ow, spring)
    ctx.arc(c, spring, ow, 0, Math.PI, true)
    ctx.lineTo(c - ow, h)
    ctx.closePath()
  }
  wash(ctx, r, '#e8cfa0', 0.02, ring, { base: null })
  for (let i = 1; i < 9; i += 1) {
    const a = Math.PI + (i / 9) * Math.PI
    ink(ctx, r, 0.012, () => {
      ctx.moveTo(c + Math.cos(a) * ow, spring + Math.sin(a) * ow)
      ctx.lineTo(c + Math.cos(a) * (ow + 0.2), spring + Math.sin(a) * (ow + 0.2))
    })
  }
  for (let y = spring + 0.25; y < h - 0.05; y += 0.25) {
    ink(ctx, r, 0.012, () => {
      ctx.moveTo(c - ow - 0.2, y)
      ctx.lineTo(c - ow, y)
      ctx.moveTo(c + ow, y)
      ctx.lineTo(c + ow + 0.2, y)
    })
  }
  const key = poly(ctx, r, [[c - 0.09, spring - ow - 0.24], [c + 0.09, spring - ow - 0.24], [c + 0.06, spring - ow + 0.02], [c - 0.06, spring - ow + 0.02]], true, 0.01)
  wash(ctx, r, TOMATO, 0.01, key)
  ink(ctx, r, 0.014, key)
  ink(ctx, r, 0.016, ring)
  ink(ctx, r, 0.026, wall)

  // bougainvillea spilling over the top-left
  for (let i = 0; i < 46; i += 1) {
    const t = r()
    const x = 0.12 + t * (c - 0.1) + (r() - 0.5) * 0.25
    const y = 0.55 + Math.pow(1 - t, 2) * 1.3 + r() * 0.25
    const leaf = r() < 0.35
    const bloom = blob(ctx, r, x, y, 0.05 + r() * 0.05, 0.045 + r() * 0.04, 0.2, 10)
    wash(ctx, r, leaf ? OLIVE : r() < 0.5 ? '#e0506e' : '#ef8a9a', 0.01, bloom)
    if (r() < 0.4) ink(ctx, r, 0.008, bloom)
  }
  // potted geranium on the right
  const px = w - 0.42
  const pot = poly(ctx, r, [[px - 0.14, h - 0.3], [px + 0.14, h - 0.3], [px + 0.1, h - 0.02], [px - 0.1, h - 0.02]], true, 0.01)
  wash(ctx, r, TOMATO, 0.01, pot)
  ink(ctx, r, 0.014, pot)
  for (let i = 0; i < 7; i += 1) {
    const g = blob(ctx, r, px + (r() - 0.5) * 0.3, h - 0.38 - r() * 0.22, 0.06, 0.05, 0.2, 10)
    wash(ctx, r, i % 3 ? OLIVE : TOMATO, 0.01, g)
  }

  // the doorway itself is cut through the paper
  const opening = () => {
    ctx.moveTo(c - ow, h + 0.01)
    ctx.lineTo(c - ow, spring)
    ctx.arc(c, spring, ow, Math.PI, 0)
    ctx.lineTo(c + ow, h + 0.01)
    ctx.closePath()
  }
  ink(ctx, r, 0.03, opening)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  opening()
  ctx.fill()
  ctx.restore()
}

function drawLemonTree(ctx, r, w, h) {
  const c = w / 2
  const trunk = () => {
    ctx.moveTo(c - 0.05, h - 0.42)
    ctx.quadraticCurveTo(c - 0.1, h - 0.85, c - 0.02, h - 1.25)
    ctx.lineTo(c + 0.05, h - 1.25)
    ctx.quadraticCurveTo(c - 0.01, h - 0.85, c + 0.06, h - 0.42)
    ctx.closePath()
  }
  wash(ctx, r, '#8a6a4a', 0.01, trunk)
  ink(ctx, r, 0.018, trunk)
  const puffs = [
    [c, 0.95, 0.5],
    [c - 0.42, 1.15, 0.36],
    [c + 0.42, 1.12, 0.38],
    [c - 0.25, 0.62, 0.34],
    [c + 0.26, 0.6, 0.36],
    [c, 1.38, 0.34],
    [c - 0.55, 0.85, 0.28],
    [c + 0.58, 0.82, 0.28],
  ].map(([x, y, s]) => blob(ctx, r, x, y, s, s * 0.9, 0.1))
  puffs.forEach((p) => wash(ctx, r, OLIVE, 0.03, p))
  puffs.forEach((p, i) => i % 2 && wash(ctx, r, LEAF, 0.03, p, { base: null }))
  puffs.forEach((p) => ink(ctx, r, 0.016, p))
  for (let i = 0; i < 26; i += 1) {
    const x = c + (r() - 0.5) * 1.3
    const y = 0.5 + r() * 1.0
    ink(ctx, r, 0.01, () => {
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + 0.04, y - 0.05, x + 0.08, y - 0.02)
    }, '#3e5230')
  }
  for (let i = 0; i < 11; i += 1) {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r()) * 0.6
    const x = c + Math.cos(a) * d
    const y = 0.98 + Math.sin(a) * d * 0.75
    const lemon = blob(ctx, r, x, y, 0.075, 0.058, 0.08, 16)
    wash(ctx, r, LEMON, 0.01, lemon)
    ink(ctx, r, 0.012, lemon)
  }
  const pot = poly(ctx, r, [[c - 0.32, h - 0.44], [c + 0.32, h - 0.44], [c + 0.24, h - 0.02], [c - 0.24, h - 0.02]], true, 0.015)
  wash(ctx, r, TOMATO, 0.02, pot)
  const rim = poly(ctx, r, [[c - 0.37, h - 0.52], [c + 0.37, h - 0.52], [c + 0.37, h - 0.42], [c - 0.37, h - 0.42]], true, 0.01)
  wash(ctx, r, '#c23f22', 0.01, rim)
  ink(ctx, r, 0.016, pot)
  ink(ctx, r, 0.016, rim)
}

function drawVespa(ctx, r, w, h) {
  const b = h - 0.02
  const wheel = (x) => {
    const tyre = blob(ctx, r, x, b - 0.21, 0.21, 0.21, 0.02)
    wash(ctx, r, INK, 0.005, tyre)
    const hub = blob(ctx, r, x, b - 0.21, 0.09, 0.09, 0.03)
    wash(ctx, r, CREAM, 0.005, hub)
    ink(ctx, r, 0.012, hub)
  }
  wheel(0.42)
  wheel(1.48)
  const cowl = () => {
    ctx.moveTo(0.12, b - 0.3)
    ctx.bezierCurveTo(0.08, b - 0.72, 0.58, b - 0.82, 0.96, b - 0.6)
    ctx.lineTo(1.04, b - 0.34)
    ctx.closePath()
  }
  wash(ctx, r, TOMATO, 0.02, cowl)
  ink(ctx, r, 0.02, cowl)
  const shield = () => {
    ctx.moveTo(1.24, b - 0.34)
    ctx.quadraticCurveTo(1.34, b - 0.7, 1.38, b - 0.98)
    ctx.lineTo(1.5, b - 0.98)
    ctx.quadraticCurveTo(1.47, b - 0.62, 1.62, b - 0.4)
    ctx.closePath()
  }
  wash(ctx, r, TOMATO, 0.02, shield)
  ink(ctx, r, 0.02, shield)
  const fender = () => {
    ctx.arc(1.48, b - 0.21, 0.27, Math.PI * 1.05, Math.PI * 1.85)
    ctx.lineTo(1.48 + Math.cos(Math.PI * 1.85) * 0.2, b - 0.21 + Math.sin(Math.PI * 1.85) * 0.2)
    ctx.arc(1.48, b - 0.21, 0.2, Math.PI * 1.85, Math.PI * 1.05, true)
    ctx.closePath()
  }
  wash(ctx, r, TOMATO, 0.01, fender)
  ink(ctx, r, 0.016, fender)
  ink(ctx, r, 0.024, () => {
    ctx.moveTo(1.0, b - 0.34)
    ctx.lineTo(1.26, b - 0.34)
  })
  const seat = () => {
    ctx.moveTo(0.34, b - 0.76)
    ctx.quadraticCurveTo(0.6, b - 0.92, 0.9, b - 0.78)
    ctx.lineTo(0.88, b - 0.7)
    ctx.lineTo(0.36, b - 0.68)
    ctx.closePath()
  }
  wash(ctx, r, '#7a4a2e', 0.01, seat)
  ink(ctx, r, 0.016, seat)
  ink(ctx, r, 0.022, () => {
    ctx.moveTo(1.3, b - 1.02)
    ctx.lineTo(1.66, b - 1.04)
  })
  const lamp = blob(ctx, r, 1.46, b - 0.98, 0.07, 0.065, 0.05, 14)
  wash(ctx, r, '#fff6d6', 0.005, lamp)
  ink(ctx, r, 0.014, lamp)
  // basket of lemons on the rear rack
  const basket = poly(ctx, r, [[0.08, b - 0.72], [0.36, b - 0.72], [0.32, b - 0.56], [0.12, b - 0.56]], true, 0.01)
  for (let i = 0; i < 4; i += 1) {
    const l = blob(ctx, r, 0.14 + i * 0.065, b - 0.75, 0.045, 0.036, 0.1, 12)
    wash(ctx, r, LEMON, 0.005, l)
    ink(ctx, r, 0.009, l)
  }
  wash(ctx, r, '#c9a26a', 0.01, basket)
  ink(ctx, r, 0.014, basket)
}

function drawFloor(ctx, r) {
  ctx.fillStyle = PAPER
  ctx.fillRect(-8, -8, 16, 16)
  wash(ctx, r, '#efd9a2', 0.2, blob(ctx, r, 0, 0.6, 5.6, 3.4, 0.14), { base: null })
  wash(ctx, r, '#c9d3a0', 0.14, blob(ctx, r, -1.6, -0.4, 2.2, 1.3, 0.2), { base: null })
  wash(ctx, r, '#c9d3a0', 0.14, blob(ctx, r, 2.3, -0.2, 2.0, 1.2, 0.2), { base: null })
  const path = poly(ctx, r, [[-0.5, 0.15], [0.5, 0.15], [1.2, -6.5], [-1.2, -6.5]], true, 0.06)
  wash(ctx, r, '#ecc79a', 0.05, path, { base: null })
  for (let y = 0; y > -6.4; y -= 0.24) {
    const half = 0.5 + (-y / 6.5) * 0.7
    for (let x = -half + 0.12; x < half - 0.1; x += 0.24 + r() * 0.1) {
      ink(ctx, r, 0.012, blob(ctx, r, x, y - 0.1, 0.1, 0.07, 0.2, 10), '#7d6a52')
    }
  }
  for (let i = 0; i < 220; i += 1) {
    const x = (r() - 0.5) * 11
    const y = -5.5 + r() * 8
    if (Math.abs(x) < 0.7 + (-y / 6.5) * 0.7) continue
    ink(ctx, r, 0.014, () => {
      ctx.moveTo(x - 0.05, y)
      ctx.lineTo(x - 0.07, y + 0.1)
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + 0.13)
      ctx.moveTo(x + 0.05, y)
      ctx.lineTo(x + 0.08, y + 0.09)
    }, i % 3 ? '#4d6138' : INK)
    if (i % 9 === 0) wash(ctx, r, i % 2 ? TOMATO : OCHRE, 0.01, blob(ctx, r, x + 0.12, y + 0.08, 0.04, 0.04, 0.2, 10), { base: null })
  }
}

/* ------------------------------------------------------------ cover artwork */

function drawCover(cw, ch, couple, words) {
  const [canvas, ctx] = makeCanvas(cw, ch)
  const r = seeded(77)
  const u = Math.min(cw, ch) / 10
  const portrait = ch >= cw

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, cw, ch)
  const vignette = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.25, cw / 2, ch / 2, Math.max(cw, ch) * 0.75)
  vignette.addColorStop(0, 'rgba(214,186,140,0)')
  vignette.addColorStop(1, 'rgba(206,174,124,0.38)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, cw, ch)
  ctx.lineCap = 'round'
  for (let i = 0; i < 900; i += 1) {
    const x = r() * cw
    const y = r() * ch
    const a = r() * Math.PI
    const l = (0.05 + r() * 0.2) * u
    ctx.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(150,120,80,0.12)'
    ctx.lineWidth = 0.6 + r()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }

  // cloth spine
  const band = 0.95 * u
  ctx.fillStyle = TOMATO
  ctx.fillRect(0, 0, band, ch)
  ctx.strokeStyle = 'rgba(40,20,10,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let s = 0; s < ch; s += 3) {
    ctx.moveTo(0, s)
    ctx.lineTo(band, s)
  }
  ctx.stroke()
  ctx.save()
  ctx.setLineDash([0.16 * u, 0.12 * u])
  ink(ctx, r, 0.035 * u, () => {
    ctx.moveTo(band - 0.2 * u, 0)
    ctx.lineTo(band - 0.2 * u, ch)
  }, '#fde9d9')
  ctx.restore()
  ink(ctx, r, 0.05 * u, () => {
    ctx.moveTo(band, 0)
    ctx.lineTo(band, ch)
  })

  // frames
  const box = { x0: band + 0.45 * u, y0: 0.45 * u, x1: cw - 0.45 * u, y1: ch - 0.45 * u }
  const frame = (inset, jitter) => {
    const { x0, y0, x1, y1 } = box
    return poly(ctx, r, [[x0 + inset, y0 + inset], [x1 - inset, y0 + inset], [x1 - inset, y1 - inset], [x0 + inset, y1 - inset]], true, jitter)
  }
  ink(ctx, r, 0.075 * u, frame(0, 0.04 * u))
  ink(ctx, r, 0.025 * u, frame(0.17 * u, 0.03 * u))
  ink(ctx, r, 0.03 * u, frame(0.3 * u, 0.03 * u), TOMATO)
  ;[
    [box.x0, box.y0],
    [box.x1, box.y0],
    [box.x1, box.y1],
    [box.x0, box.y1],
  ].forEach(([x, y]) => {
    const s = 0.22 * u
    const star = () => {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2
        const rr = i % 2 ? s * 0.35 : s
        const px = x + Math.cos(a) * rr
        const py = y + Math.sin(a) * rr
        if (i) ctx.lineTo(px, py)
        else ctx.moveTo(px, py)
      }
      ctx.closePath()
    }
    wash(ctx, r, TOMATO, 0.02 * u, star)
    ink(ctx, r, 0.025 * u, star)
  })

  const bw = box.x1 - box.x0
  const bh = box.y1 - box.y0
  const sun = portrait
    ? { x: (box.x0 + box.x1) / 2, y: box.y0 + bh * 0.24, r: Math.min(1.25 * u, bh * 0.1) }
    : { x: box.x0 + bw * 0.22, y: box.y0 + bh * 0.46, r: Math.min(1.5 * u, bh * 0.2) }
  const text = portrait ? { x: sun.x, kicker: box.y0 + bh * 0.45, names: box.y0 + bh * 0.53, max: bw * 0.84, tag: box.y0 + bh * 0.7 } : { x: box.x0 + bw * 0.62, kicker: box.y0 + bh * 0.28, names: box.y0 + bh * 0.4, max: bw * 0.56, tag: box.y0 + bh * 0.13 }

  // the sun with a sleepy smile (its rays are a separate, turning layer)
  wash(ctx, r, OCHRE, 0.05 * sun.r, blob(ctx, r, sun.x, sun.y, sun.r, sun.r, 0.04), { base: null })
  wash(ctx, r, TOMATO, 0.04 * sun.r, blob(ctx, r, sun.x, sun.y, sun.r * 0.6, sun.r * 0.6, 0.08), { base: null })
  ink(ctx, r, 0.05 * u, blob(ctx, r, sun.x, sun.y, sun.r, sun.r, 0.04))
  ink(ctx, r, 0.04 * u, () => {
    ctx.moveTo(sun.x - sun.r * 0.5, sun.y - sun.r * 0.12)
    ctx.quadraticCurveTo(sun.x - sun.r * 0.35, sun.y - sun.r * 0.24, sun.x - sun.r * 0.2, sun.y - sun.r * 0.12)
    ctx.moveTo(sun.x + sun.r * 0.2, sun.y - sun.r * 0.12)
    ctx.quadraticCurveTo(sun.x + sun.r * 0.35, sun.y - sun.r * 0.24, sun.x + sun.r * 0.5, sun.y - sun.r * 0.12)
    ctx.moveTo(sun.x - sun.r * 0.3, sun.y + sun.r * 0.22)
    ctx.quadraticCurveTo(sun.x, sun.y + sun.r * 0.48, sun.x + sun.r * 0.3, sun.y + sun.r * 0.22)
  })

  // title
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.translate(text.x, text.kicker)
  ctx.rotate(-0.04)
  ctx.fillStyle = TOMATO
  ctx.font = `600 ${0.72 * u}px ${HAND}`
  ctx.fillText(words.kicker, 0, 0, text.max)
  ctx.restore()
  const line1 = couple[0]
  const line2 = `& ${couple[1]}`
  ctx.font = `italic 400 100px ${DISPLAY}`
  const widest = Math.max(ctx.measureText(line1).width, ctx.measureText(line2).width, 1)
  const size = Math.min(1.8 * u, (text.max / widest) * 100)
  ctx.font = `italic 400 ${size}px ${DISPLAY}`
  ctx.fillStyle = INK
  ctx.fillText(line1, text.x, text.names + size * 0.5)
  ctx.fillStyle = TOMATO
  ctx.fillText(line2, text.x, text.names + size * 1.5)
  ctx.font = `400 ${0.3 * u}px ${DISPLAY}`
  ctx.fillStyle = INK
  const tag = words.tag.toLocaleUpperCase(words.locale).split('').join(' ')
  ctx.fillText(tag, text.x, text.tag, text.max)
  const tw = Math.min(text.max, ctx.measureText(tag).width) / 2
  ink(ctx, r, 0.02 * u, () => {
    ctx.moveTo(text.x - tw - 0.8 * u, text.tag)
    ctx.lineTo(text.x - tw - 0.2 * u, text.tag)
    ctx.moveTo(text.x + tw + 0.2 * u, text.tag)
    ctx.lineTo(text.x + tw + 0.8 * u, text.tag)
  })

  // ink landscape along the bottom
  const base = box.y1 - 0.55 * u
  const hillTop = base - 1.1 * u
  const hills = []
  for (let x = box.x0 + 0.4 * u; x <= box.x1 - 0.4 * u; x += 0.2 * u) {
    hills.push([x, hillTop + 0.5 * u - Math.sin((x / u) * 0.9) * 0.35 * u - Math.sin((x / u) * 2.1 + 1) * 0.12 * u])
  }
  const hillShape = () => {
    hills.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.lineTo(hills[hills.length - 1][0], base)
    ctx.lineTo(hills[0][0], base)
    ctx.closePath()
  }
  wash(ctx, r, '#c9d3a0', 0.05 * u, hillShape, { base: null })
  ink(ctx, r, 0.03 * u, () => hills.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))))
  for (let x = box.x0 + 0.6 * u; x < box.x1 - 0.6 * u; x += 0.55 * u) {
    ink(ctx, r, 0.022 * u, () => {
      ctx.moveTo(x, base)
      ctx.quadraticCurveTo(x + 0.14 * u, base - 0.12 * u, x + 0.28 * u, base)
    }, '#3d6f80')
  }
  const trulli = portrait ? [0.3, 0.42, 0.7] : [0.55, 0.62, 0.8]
  trulli.forEach((f, i) => {
    const x = box.x0 + bw * f
    const idx = Math.max(0, Math.min(hills.length - 1, Math.round((x - hills[0][0]) / (0.2 * u))))
    const y = hills[idx][1] + 0.15 * u
    const s = (i === 1 ? 0.42 : 0.32) * u
    const house = () => {
      ctx.rect(x - s * 0.5, y - s * 0.55, s, s * 0.55)
      ctx.moveTo(x - s * 0.55, y - s * 0.55)
      ctx.quadraticCurveTo(x - s * 0.25, y - s * 1.2, x, y - s * 1.35)
      ctx.quadraticCurveTo(x + s * 0.25, y - s * 1.2, x + s * 0.55, y - s * 0.55)
    }
    wash(ctx, r, '#fffaf0', 0.02 * u, house)
    ink(ctx, r, 0.028 * u, house)
  })
  addGrain(ctx, cw, ch, 10, r)
  return { canvas, sun }
}


function raysCanvas() {
  const S = 512
  const [canvas, ctx] = makeCanvas(S, S)
  const r = seeded(19)
  const c = S / 2
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2
    const r0 = c * 0.6
    const r1 = c * (i % 2 ? 0.78 : 0.95)
    const spread = 0.085
    const ray = () => {
      ctx.moveTo(c + Math.cos(a - spread) * r0, c + Math.sin(a - spread) * r0)
      ctx.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1)
      ctx.lineTo(c + Math.cos(a + spread) * r0, c + Math.sin(a + spread) * r0)
      ctx.closePath()
    }
    wash(ctx, r, i % 2 ? TOMATO : OCHRE, 3, ray, { base: PAPER })
    ink(ctx, r, 4, ray)
  }
  return canvas
}

function tabCanvas(label) {
  const [canvas, ctx] = makeCanvas(512, 184)
  const r = seeded(3)
  ctx.fillStyle = TOMATO
  ctx.fillRect(0, 0, 512, 184)
  for (let i = 0; i < 300; i += 1) {
    ctx.strokeStyle = r() < 0.5 ? 'rgba(255,220,200,0.12)' : 'rgba(90,20,5,0.12)'
    ctx.lineWidth = 1
    const x = r() * 512
    const y = r() * 184
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 10 + r() * 20, y + (r() - 0.5) * 4)
    ctx.stroke()
  }
  ink(ctx, r, 6, () => ctx.rect(8, 8, 496, 168))
  ctx.fillStyle = '#fdf1e4'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 104px ${HAND}`
  ctx.fillText(`${label} →`, 256, 96, 460)
  return canvas
}

/* -------------------------------------------------------------------- scene */

// Pop-up layers in book units (u): x across the page, y from the page centre
// toward the far edge, w/h of the paper, angle the hinge opens to (degrees).
const LAYERS = [
  { w: 16, h: 5.4, x: 0, y: 2.2, angle: 84, draw: drawBackdrop },
  { w: 4.2, h: 2.6, x: 0.1, y: 1.2, angle: 90, draw: drawTrulli },
  { w: 2.3, h: 2.5, x: 0, y: 0.1, angle: 90, draw: drawArch, doorway: 0.85 },
  { w: 1.9, h: 2.3, x: -1.3, y: -0.45, angle: 90, draw: drawLemonTree },
  { w: 1.85, h: 1.15, x: 1.2, y: -0.7, angle: 90, draw: drawVespa },
]
const SVG = 'http://www.w3.org/2000/svg'

export default function create(host, template, { onOpened, setCaption }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const words = { ...(copy[template.lang] ?? copy.en), locale: template.lang === 'tr' ? 'tr-TR' : 'en-GB' }
  const uid = Math.random().toString(36).slice(2, 8)

  const el = (tag, css, parent) => {
    const node = document.createElement(tag)
    if (css) node.style.cssText = css
    parent?.appendChild(node)
    return node
  }
  const svgEl = (tag, attrs, parent) => {
    const node = document.createElementNS(SVG, tag)
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v))
    parent?.appendChild(node)
    return node
  }

  /* ---------------------------------------------------------- DOM */
  const root = el('div', 'position:absolute;inset:0;overflow:hidden;', host)
  root.setAttribute('aria-hidden', 'true')
  const zoom = el('div', 'position:absolute;inset:0;will-change:transform;', root)
  // the page's cream paper, laid over everything at the very end of the zoom
  const backdrop = el('div', 'position:absolute;inset:0;opacity:0;pointer-events:none;background:oklch(0.978 0.012 80);z-index:5;', root)
  const view = el('div', 'position:absolute;inset:0;perspective-origin:50% 50%;', zoom)
  const world = el('div', 'position:absolute;transform-style:preserve-3d;will-change:transform;', view)
  const floorHost = el('div', 'position:absolute;inset:0;transform:translateZ(0);', world)

  const layers = LAYERS.map((spec, i) => {
    const shadow = el(
      'div',
      'position:absolute;opacity:0;filter:blur(6px);transform-origin:50% 100%;' +
        'background:linear-gradient(to top, rgba(74,48,26,0.3), rgba(74,48,26,0));',
      world,
    )
    const node = el('div', 'position:absolute;transform-origin:50% 100%;will-change:transform;', world)
    let anchor = null
    if (spec.doorway) anchor = el('div', `position:absolute;left:50%;top:${((spec.h - spec.doorway) / spec.h) * 100}%;width:1px;height:1px;`, node)
    return { spec, node, shadow, anchor, rise: 0, z: 1 + i * 0.6, canvas: null }
  })
  const doorway = layers.find((l) => l.anchor).anchor

  const cover = el('div', 'position:absolute;left:0;top:0;transform-origin:0 50%;transform-style:preserve-3d;will-change:transform;', world)
  const front = el('div', 'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;box-shadow:0 2px 0 #c8432a;', cover)
  const back = el(
    'div',
    'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);' +
      `background:repeating-linear-gradient(90deg, rgba(216,75,42,0.85) 0 14px, ${CREAM} 14px 34px);`,
    cover,
  )
  back.style.boxShadow = 'inset 0 0 60px rgba(90,50,20,0.25)'
  const coverArt = el('div', 'position:absolute;inset:0;', front)
  const rays = raysCanvas()
  rays.style.cssText = 'position:absolute;will-change:transform;'
  front.appendChild(rays)
  const sheen = el('div', 'position:absolute;inset:0;mix-blend-mode:soft-light;pointer-events:none;', front)
  const slot = el('div', 'position:absolute;width:3px;border-radius:2px;background:rgba(40,36,29,0.8);box-shadow:1px 0 2px rgba(0,0,0,0.25);', front)
  const tab = tabCanvas(words.pull)
  tab.style.cssText = 'position:absolute;box-shadow:1px 2px 4px rgba(60,20,10,0.3);will-change:transform;'
  front.appendChild(tab)

  // bird and ribbon: flat SVG over the book
  const svg = svgEl('svg', { width: '100%', height: '100%', style: 'position:absolute;inset:0;overflow:visible;pointer-events:none;visibility:hidden;' }, root)
  const ribbonGroup = svgEl('g', {}, svg)
  const cord = svgEl('path', { fill: 'none', stroke: INK, 'stroke-width': 1.5, 'stroke-linecap': 'round' }, ribbonGroup)
  const tail = svgEl('polygon', { fill: CREAM, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, ribbonGroup)
  const bandInk = svgEl('path', { fill: 'none', stroke: INK }, ribbonGroup)
  const band = svgEl('path', { id: `sb-ribbon-${uid}`, fill: 'none', stroke: CREAM }, ribbonGroup)
  const stripeA = svgEl('path', { fill: 'none', stroke: TOMATO }, ribbonGroup)
  const stripeB = svgEl('path', { fill: 'none', stroke: TOMATO }, ribbonGroup)
  const label = svgEl('text', { fill: INK, 'font-family': DISPLAY, 'font-style': 'italic', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, ribbonGroup)
  const textPath = svgEl('textPath', { href: `#sb-ribbon-${uid}`, startOffset: '50%' }, label)
  svgEl('tspan', {}, textPath).textContent = `${template.couple[0]} `
  svgEl('tspan', { fill: TOMATO }, textPath).textContent = '&'
  svgEl('tspan', {}, textPath).textContent = ` ${template.couple[1]}`

  const bird = svgEl('g', {}, svg)
  const wingBack = svgEl('g', {}, bird)
  svgEl('polygon', { points: '-8,-10 20,-10 4,-58', fill: '#eadcc0', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, wingBack)
  svgEl('polygon', { points: '-46,-9 -62,-24 -54,-5 -64,6 -40,2', fill: '#b83a1f', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bird)
  svgEl('polygon', { points: '-46,-9 0,-14 40,-5 54,-1 40,5 0,11 -22,6', fill: TOMATO, stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bird)
  svgEl('path', { d: 'M-30,-2 L36,-2', stroke: '#9e3018', 'stroke-width': 1.2, fill: 'none' }, bird)
  svgEl('circle', { cx: 33, cy: -4, r: 2.2, fill: INK }, bird)
  const wingFront = svgEl('g', {}, bird)
  svgEl('polygon', { points: '-16,-10 18,-10 -8,-64', fill: '#fbf1dc', stroke: INK, 'stroke-width': 2, 'stroke-linejoin': 'round' }, wingFront)
  svgEl('path', { d: 'M2,-10 L-8,-64', stroke: '#b9a98a', 'stroke-width': 1.2, fill: 'none' }, wingFront)

  /* ---------------------------------------------------------- paint + layout */
  const size = { W: 1, H: 1, PW: 1, PH: 1, u: 1 }
  const fly = { L: 1, hR: 1, bs: 1, hover: [0, 0], enter: [0, 0], exit: [0, 0] }
  const measure = makeCanvas(8, 8)[1]

  const paint = () => {
    const { PW, PH, u, W, H } = size
    // spread: painted ground that fades out into the paper of the page
    const long = Math.min(2048, Math.max(PW, PH) * dpr)
    const fs = long / Math.max(PW, PH)
    const [floor, fctx] = makeCanvas(Math.round(PW * fs), Math.round(PH * fs))
    fctx.setTransform(u * fs, 0, 0, -u * fs, floor.width / 2, floor.height / 2)
    drawFloor(fctx, seeded(51))
    fctx.setTransform(1, 0, 0, 1, 0, 0)
    addGrain(fctx, floor.width, floor.height, 9, seeded(52))
    fctx.globalCompositeOperation = 'destination-in'
    const m = Math.max(floor.width, floor.height)
    const fade = fctx.createRadialGradient(floor.width / 2, floor.height * 0.45, m * 0.3, floor.width / 2, floor.height * 0.45, m * 0.62)
    fade.addColorStop(0, 'rgba(0,0,0,1)')
    fade.addColorStop(1, 'rgba(0,0,0,0)')
    fctx.fillStyle = fade
    fctx.fillRect(0, 0, floor.width, floor.height)
    floor.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
    floorHost.replaceChildren(floor)

    layers.forEach((layer, i) => {
      const { w, h, draw } = layer.spec
      const ppu = Math.min(u * dpr, 2048 / Math.max(w, h))
      const [art, ctx] = makeCanvas(Math.round(w * ppu), Math.round(h * ppu))
      ctx.setTransform(ppu, 0, 0, ppu, 0, 0)
      draw(ctx, seeded(100 + i), w, h)
      const [canvas, out] = cutOut(art, Math.max(2, ppu * 0.04))
      addGrain(out, canvas.width, canvas.height, 9, seeded(200 + i))
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
      if (layer.canvas) layer.canvas.replaceWith(canvas)
      else layer.node.prepend(canvas)
      layer.canvas = canvas
    })

    // the cover is sized to the page, so it fills the screen on any aspect
    const cl = Math.min(2048, Math.max(PW, PH) * dpr) / Math.max(PW, PH)
    const { canvas: art, sun } = drawCover(Math.round(PW * cl), Math.round(PH * cl), template.couple, words)
    art.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
    coverArt.replaceChildren(art)
    const sr = (sun.r / cl) * 3.9
    Object.assign(rays.style, { width: `${sr}px`, height: `${sr}px`, left: `${sun.x / cl - sr / 2}px`, top: `${sun.y / cl - sr / 2}px` })

    // tab at the free edge, low on the page
    const len = Math.min(W, H) * 0.2
    const wid = len * 0.36
    const tx = PW - (PW - W) / 2 - len - W * 0.02
    const ty = PH * 0.86
    Object.assign(tab.style, { left: `${tx}px`, top: `${ty - wid / 2}px`, width: `${len}px`, height: `${wid}px` })
    Object.assign(slot.style, { left: `${tx - 2}px`, top: `${ty - wid * 0.65}px`, height: `${wid * 1.3}px` })
    fly.tab = len
  }

  const layout = () => {
    const W = root.clientWidth || window.innerWidth
    const H = root.clientHeight || window.innerHeight
    const PW = W * 1.04
    const PH = H * 1.04
    const u = Math.max(W / 12.5, Math.min(W / 4, H / 6.5))
    const changed = Math.abs(u - size.u) / size.u > 0.04 || Math.abs(W / H - size.W / size.H) > 0.03
    Object.assign(size, { W, H, PW, PH, u })

    view.style.perspective = `${Math.max(1.5 * Math.max(W, H), 1200)}px`
    Object.assign(world.style, { left: `${(W - PW) / 2}px`, top: `${(H - PH) / 2}px`, width: `${PW}px`, height: `${PH}px` })
    Object.assign(cover.style, { width: `${PW}px`, height: `${PH}px` })
    layers.forEach((layer) => {
      const { w, h, x, y } = layer.spec
      const base = PH / 2 - y * u
      Object.assign(layer.node.style, { left: `${PW / 2 + (x - w / 2) * u}px`, top: `${base - h * u}px`, width: `${w * u}px`, height: `${h * u}px` })
      Object.assign(layer.shadow.style, { left: `${PW / 2 + (x - w / 2 * 0.95) * u}px`, top: `${base - h * u * 0.35}px`, width: `${w * u * 0.95}px`, height: `${h * u * 0.35}px` })
    })

    // ribbon sized to the names, bird to the screen
    measure.font = `italic 400 100px ${DISPLAY}`
    const textW = measure.measureText(`${template.couple[0]} & ${template.couple[1]}`).width / 100
    const hR = Math.min(H * 0.075, W * 0.13)
    const L = Math.min(W * 0.86, Math.max(W * 0.45, textW * hR * 0.6 * 1.25 + hR * 2))
    const fontSize = Math.min(hR * 0.6, (L * 0.82) / Math.max(textW, 0.01))
    fly.L = L
    fly.hR = hR
    fly.bs = Math.min(W * 0.16, H * 0.1)
    fly.hover = [W / 2 + L / 2, H * 0.24]
    fly.enter = [-fly.bs * 1.5, H * 0.42]
    fly.exit = [W + L + fly.bs * 2, -H * 0.2]
    label.setAttribute('font-size', fontSize)
    bandInk.setAttribute('stroke-width', hR + 4)
    band.setAttribute('stroke-width', hR)
    stripeA.setAttribute('stroke-width', Math.max(1.5, hR * 0.07))
    stripeB.setAttribute('stroke-width', Math.max(1.5, hR * 0.07))

    if (changed || !layers[0].canvas) {
      clearTimeout(paintTimer)
      if (!layers[0].canvas) paint()
      else paintTimer = setTimeout(paint, 200)
    }
  }
  let paintTimer = 0
  const observer = new ResizeObserver(layout)
  observer.observe(host)
  layout()

  /* ---------------------------------------------------------- loop */
  const state = { px: 0, py: 0, tab: 0, cover: 0, tilt: 0, ty: 0, fly: 0, exit: 0, zoom: 0 }
  const par = { x: 0, y: 0 }
  const ribbonPts = new Float32Array(26 * 2)

  const pathFrom = (offset) => {
    let d = ''
    for (let i = 0; i < 26; i += 1) d += `${i ? 'L' : 'M'}${ribbonPts[i * 2].toFixed(1)},${(ribbonPts[i * 2 + 1] + offset).toFixed(1)}`
    return d
  }

  const frame = (t) => {
    par.x += (state.px - par.x) * 0.05
    par.y += (state.py - par.y) * 0.05
    const calm = 1 - state.exit
    world.style.transform = `translate3d(0,${state.ty}px,0) rotateX(${state.tilt + par.y * 1.6 * calm}deg) rotateY(${-par.x * 2.4 * calm}deg)`
    zoom.style.transform = state.zoom ? `scale(${1 + state.zoom * state.zoom * 6})` : ''

    if (cover.style.visibility !== 'hidden') {
      cover.style.transform = `translateZ(6px) rotateY(${-177 * state.cover}deg)`
      const nudge = Math.pow(Math.max(0, Math.sin(t * 2.4)), 6) * 0.06 * (1 - state.tab)
      tab.style.transform = `translateX(${(fly.tab || 0) * (state.tab * 0.6 + nudge)}px)`
      rays.style.transform = `rotate(${t * 7}deg)`
      sheen.style.background = `radial-gradient(circle at ${50 + par.x * 30}% ${40 + par.y * 25}%, rgba(255,255,255,0.55), rgba(255,255,255,0) 55%)`
    }
    for (let i = 0; i < layers.length; i += 1) {
      const layer = layers[i]
      layer.node.style.transform = `translateZ(${layer.z}px) rotateX(${-layer.spec.angle * layer.rise}deg)`
      layer.shadow.style.opacity = Math.min(1, layer.rise)
      layer.shadow.style.transform = `translateZ(0.5px) skewX(-18deg) scaleY(${Math.min(1, layer.rise)})`
    }

    if (svg.style.visibility === 'visible') {
      const { hover, enter, exit, L, hR, bs } = fly
      let x
      let y
      if (state.exit > 0) {
        x = hover[0] + (exit[0] - hover[0]) * state.exit
        y = hover[1] + (exit[1] - hover[1]) * state.exit
      } else {
        x = enter[0] + (hover[0] - enter[0]) * state.fly
        y = enter[1] + (hover[1] - enter[1]) * state.fly - Math.sin(state.fly * Math.PI) * size.H * 0.06
      }
      y += Math.sin(t * 2.3) * bs * 0.06
      const moving = Math.min(1, (1 - state.fly) * 1.5 + state.exit)
      const amp = hR * (0.16 + moving * 0.6)
      for (let i = 0; i < 26; i += 1) {
        const d = 1 - i / 25 // 1 at the tail, 0 at the bird
        const w = d * 9 - t * 5
        ribbonPts[i * 2] = x - L * d
        ribbonPts[i * 2 + 1] = y + Math.sin(w) * amp * d + d * d * hR * 0.3
      }
      const mid = pathFrom(0)
      bandInk.setAttribute('d', mid)
      band.setAttribute('d', mid)
      stripeA.setAttribute('d', pathFrom(-hR * 0.33))
      stripeB.setAttribute('d', pathFrom(hR * 0.33))
      const tx = ribbonPts[0]
      const tyy = ribbonPts[1]
      tail.setAttribute(
        'points',
        `${tx + 1},${tyy - hR / 2} ${tx - hR * 0.6},${tyy - hR / 2} ${tx - hR * 0.28},${tyy} ${tx - hR * 0.6},${tyy + hR / 2} ${tx + 1},${tyy + hR / 2}`,
      )
      const bx = x + bs * 0.25
      const by = y - bs * 0.3
      cord.setAttribute('d', `M${x},${y} L${bx},${by + bs * 0.05}`)
      const flap = Math.sin(t * (9 + moving * 7))
      wingFront.setAttribute('transform', `translate(0,-10) scale(1,${flap.toFixed(3)}) translate(0,10)`)
      wingBack.setAttribute('transform', `translate(0,-10) scale(1,${(Math.sin(t * (9 + moving * 7) - 0.5) * 0.85).toFixed(3)}) translate(0,10)`)
      const tilt = -(state.exit * 25) + (1 - state.fly) * -8 + Math.sin(t * 2.3) * 3
      bird.setAttribute('transform', `translate(${bx},${by}) scale(${bs / 100}) rotate(${tilt})`)
    }
  }

  let raf = 0
  let last = performance.now()
  let elapsed = 0
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (document.visibilityState !== 'visible') {
      last = now
      return
    }
    elapsed += Math.min((now - last) / 1000, 0.05)
    last = now
    frame(elapsed)
  }
  raf = requestAnimationFrame(loop)

  /* ---------------------------------------------------------- open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(state, { tab: 1, duration: 0.45, ease: 'power2.in' }, 0)
      .to(state, { cover: 1, duration: 1.35, ease: 'power2.inOut' }, 0.3)
      .to(state, { tilt: 60, ty: () => size.H * 0.2, duration: 1.8, ease: 'power2.inOut' }, 0.6)
    layers.forEach((layer, i) => {
      timeline.to(layer, { rise: 1, duration: 0.85, ease: 'back.out(1.6)' }, 0.85 + i * 0.17)
    })
    timeline
      .call(
        () => {
          cover.style.visibility = 'hidden'
        },
        null,
        1.75,
      )
      .call(
        () => {
          svg.style.visibility = 'visible'
        },
        null,
        2.0,
      )
      .to(state, { fly: 1, duration: 1.25, ease: 'power2.out' }, 2.0)
      .call(() => setCaption?.('date'), null, 3.0)
      .to(state, { exit: 1, duration: 1.0, ease: 'power2.in' }, 4.55)
      .call(() => setCaption?.(null), null, 4.6)
      .call(
        () => {
          // push in through the doorway: zoom around wherever it sits on screen
          const a = doorway.getBoundingClientRect()
          const b = root.getBoundingClientRect()
          zoom.style.transformOrigin = `${a.left - b.left}px ${a.top - b.top}px`
        },
        null,
        4.6,
      )
      .to(state, { zoom: 1, duration: 1.35, ease: 'power1.in' }, 4.6)
      // through the doorway onto the page's own paper
      .to(backdrop, { opacity: 1, duration: 0.6, ease: 'power1.in' }, 5.35)
  }

  return {
    open,
    skip: () => (timeline ? timeline.progress(1) : onOpened?.()),
    setPointer: (x, y) => {
      state.px = x
      state.py = y
    },
    dispose: () => {
      timeline?.kill()
      cancelAnimationFrame(raf)
      clearTimeout(paintTimer)
      observer.disconnect()
      root.remove()
    },
  }
}
