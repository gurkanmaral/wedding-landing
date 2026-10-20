// Ege Zeytin — "Knock twice". A fully illustrated 2D scene (canvas + DOM, no
// WebGL): a whitewashed wall with an arched Aegean-blue door under
// bougainvillea and a blue ceramic house plate. Tapping knocks twice with the
// brass ring, the door swings inward on its hinge (CSS 3D), sunlight floods
// out, and we walk through into the light where the sea glitters and the
// couple's names are painted onto a blue ceramic plaque.
import { gsap } from 'gsap'
import { makeCanvas, seeded } from '../core.js'

export const fonts = () => [
  { family: 'Marcellus', google: 'Marcellus' },
  { family: 'Cormorant Garamond', style: 'italic', weight: 500, google: 'Cormorant+Garamond:ital,wght@1,500' },
]

export const copy = {
  en: { prompt: 'Knock to enter' },
  tr: { prompt: 'Kapıyı çalın' },
}

const DISPLAY = '"Marcellus", "Cormorant Garamond", Georgia, serif'
const SCRIPT = '"Cormorant Garamond", Georgia, serif'
const BRACTS = ['#d81b7f', '#e5399b', '#c2186f', '#f06bb4', '#b3125f', '#e2489f']
const LEAVES = ['#3f6a2a', '#4f7a30', '#5d873a', '#36592a']

/* ------------------------------------------------------------------ helpers */
const el = (tag, css, parent) => {
  const node = document.createElement(tag)
  if (css) node.style.cssText = css
  parent?.appendChild(node)
  return node
}

function sizeCanvas(canvas, w, h, ratio) {
  canvas.width = Math.max(1, Math.round(w * ratio))
  canvas.height = Math.max(1, Math.round(h * ratio))
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  return ctx
}

// Rectangle with a semicircular top (the door, the opening and the plaque).
function archPath(ctx, x, y, w, h) {
  const r = w / 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.arc(x + r, y + r, r, Math.PI, 0)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

function grain(ctx, amount, random) {
  const { width, height } = ctx.canvas
  const image = ctx.getImageData(0, 0, width, height)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * amount
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n
  }
  ctx.putImageData(image, 0, 0)
}

function blob(ctx, x, y, r, random, points = 14) {
  ctx.beginPath()
  for (let i = 0; i <= points; i += 1) {
    const a = (i / points) * Math.PI * 2
    const rr = r * (0.6 + random() * 0.55)
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr * 0.8
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

const gauss = (random) => random() + random() + random() - 1.5

/* -------------------------------------------------------------- bougainvillea */
function bract(ctx, x, y, s, angle, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(0.58 * s, -0.12 * s, 0.64 * s, -0.78 * s, 0, -s)
  ctx.bezierCurveTo(-0.64 * s, -0.78 * s, -0.58 * s, -0.12 * s, 0, 0)
  ctx.fillStyle = color
  ctx.fill()
  // papery highlight and a dark vein, like gouache dry-brush
  ctx.globalAlpha = 0.32
  ctx.beginPath()
  ctx.moveTo(-0.05 * s, -0.2 * s)
  ctx.bezierCurveTo(0.3 * s, -0.25 * s, 0.34 * s, -0.7 * s, -0.04 * s, -0.86 * s)
  ctx.bezierCurveTo(-0.3 * s, -0.66 * s, -0.3 * s, -0.3 * s, -0.05 * s, -0.2 * s)
  ctx.fillStyle = '#ffd3ea'
  ctx.fill()
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = '#6e0a3c'
  ctx.lineWidth = Math.max(0.5, s * 0.05)
  ctx.beginPath()
  ctx.moveTo(0, -0.06 * s)
  ctx.lineTo(0, -0.84 * s)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.restore()
}

function vineLeaf(ctx, x, y, s, angle, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(0.42 * s, -0.25 * s, 0.34 * s, -0.82 * s, 0, -s)
  ctx.bezierCurveTo(-0.34 * s, -0.82 * s, -0.42 * s, -0.25 * s, 0, 0)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(210,230,170,0.45)'
  ctx.lineWidth = Math.max(0.5, s * 0.04)
  ctx.beginPath()
  ctx.moveTo(0, -0.05 * s)
  ctx.lineTo(0, -0.9 * s)
  ctx.stroke()
  ctx.restore()
}

function flower(ctx, x, y, s, random) {
  const a = random() * Math.PI * 2
  const color = BRACTS[Math.floor(random() * BRACTS.length)]
  for (let k = 0; k < 3; k += 1) bract(ctx, x, y, s * (0.85 + random() * 0.3), a + (k * Math.PI * 2) / 3, color)
  ctx.fillStyle = '#fff4cc'
  ctx.beginPath()
  ctx.arc(x, y, s * 0.13, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f2c94c'
  ctx.beginPath()
  ctx.arc(x, y, s * 0.06, 0, Math.PI * 2)
  ctx.fill()
}

// Samples points every `step` px along a polyline.
function along(points, step) {
  const out = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const len = Math.hypot(x1 - x0, y1 - y0)
    const n = Math.max(1, Math.round(len / step))
    for (let k = 0; k < n; k += 1) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n])
  }
  out.push(points[points.length - 1])
  return out
}

function branch(ctx, points, width) {
  ctx.strokeStyle = '#6b4a2e'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = width
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
}

// Paints cascading clusters along each polyline: soft shadow, leaves, bracts.
function paintVines(ctx, lines, s, random, shadow = true) {
  const clusters = []
  lines.forEach(({ points, density = 1 }) => {
    along(points, s * 3.4).forEach(([x, y]) => clusters.push({ x: x + gauss(random) * s, y: y + gauss(random) * s, density }))
  })
  lines.forEach(({ points }) => branch(ctx, points, Math.max(1.2, s * 0.22)))
  if (shadow) {
    clusters.forEach(({ x, y }) => {
      const r = s * 3.2
      const g = ctx.createRadialGradient(x + s * 1.4, y + s * 2, 0, x + s * 1.4, y + s * 2, r)
      g.addColorStop(0, 'rgba(70,55,110,0.16)')
      g.addColorStop(1, 'rgba(70,55,110,0)')
      ctx.fillStyle = g
      ctx.fillRect(x + s * 1.4 - r, y + s * 2 - r, r * 2, r * 2)
    })
  }
  clusters.forEach(({ x, y, density }) => {
    const leaves = Math.round(6 * density)
    for (let i = 0; i < leaves; i += 1) {
      vineLeaf(ctx, x + gauss(random) * s * 3, y + gauss(random) * s * 2.6, s * (1.4 + random() * 0.8), random() * Math.PI * 2, LEAVES[i % LEAVES.length])
    }
  })
  clusters.forEach(({ x, y, density }) => {
    const n = Math.round(12 * density)
    for (let i = 0; i < n; i += 1) {
      // clusters hang: more flowers below the stem than above
      const drop = random() < 0.3 ? random() * s * 4 : 0
      flower(ctx, x + gauss(random) * s * 2.4, y + gauss(random) * s * 1.8 + drop, s * (0.75 + random() * 0.4), random)
    }
  })
}

/* ---------------------------------------------------------------- the wall */
function crack(ctx, x, y, angle, len, random, depth = 0) {
  const pts = [[x, y]]
  let a = angle
  let l = 0
  while (l < len) {
    a += (random() - 0.5) * 0.9
    const step = 3 + random() * 6
    x += Math.cos(a) * step
    y += Math.sin(a) * step
    l += step
    pts.push([x, y])
    if (depth < 2 && random() < 0.07) crack(ctx, x, y, a + (random() < 0.5 ? -0.9 : 0.9), (len - l) * 0.5, random, depth + 1)
  }
  const stroke = (dx, color, width) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px + dx, py + dx) : ctx.moveTo(px + dx, py + dx)))
    ctx.stroke()
  }
  stroke(0.8, 'rgba(255,255,255,0.7)', 1)
  stroke(0, `rgba(105,98,90,${0.5 - depth * 0.12})`, depth ? 0.7 : 1.1)
}

function paintWall(canvas, G, ratio) {
  const { W, H, Dw, cx, doorTop, doorBottom, groundY } = G
  const ctx = sizeCanvas(canvas, W, H, ratio)
  const random = seeded(101)
  const big = Math.max(W, H)

  let g = ctx.createLinearGradient(0, 0, W * 0.6, groundY)
  g.addColorStop(0, '#fbf9f3')
  g.addColorStop(0.55, '#f4f1e9')
  g.addColorStop(1, '#e9e5dc')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, groundY)

  // successive limewash coats
  const coats = ['rgba(255,255,255,', 'rgba(226,221,210,', 'rgba(214,221,228,', 'rgba(236,228,214,']
  for (let i = 0; i < 70; i += 1) {
    const x = random() * W
    const y = random() * groundY
    const r = big * (0.04 + random() * 0.2)
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, `${coats[i % 4]}${0.05 + random() * 0.12})`)
    rg.addColorStop(1, `${coats[i % 4]}0)`)
    ctx.fillStyle = rg
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // brush marks
  ctx.lineCap = 'round'
  for (let i = 0; i < 240; i += 1) {
    const x = random() * W
    const y = random() * groundY
    const len = 40 + random() * 140
    const a = (random() - 0.5) * 0.8 + (random() < 0.5 ? 0 : Math.PI / 2)
    ctx.strokeStyle = random() < 0.6 ? 'rgba(255,255,255,0.06)' : 'rgba(150,145,135,0.035)'
    ctx.lineWidth = 6 + random() * 14
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + 10, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len)
    ctx.stroke()
  }
  // flaked limewash showing the stone beneath, mostly low on the wall
  for (let i = 0; i < 5; i += 1) {
    const x = random() < 0.5 ? random() * (cx - Dw * 0.8) : cx + Dw * 0.8 + random() * (W - cx - Dw * 0.8)
    const y = groundY - random() * groundY * 0.45
    const r = Dw * (0.05 + random() * 0.08)
    ctx.save()
    blob(ctx, x, y, r, random, 18)
    ctx.fillStyle = 'rgba(205,196,180,0.6)'
    ctx.fill()
    ctx.clip()
    for (let k = 0; k < 30; k += 1) {
      ctx.fillStyle = `rgba(${150 + random() * 40},${140 + random() * 40},${120 + random() * 40},0.35)`
      ctx.fillRect(x + gauss(random) * r, y + gauss(random) * r, 1 + random() * 3, 1 + random() * 2)
    }
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 1
    blob(ctx, x - 0.6, y - 0.6, r * 1.02, seeded(i + 9), 18)
    ctx.stroke()
  }
  // hairline cracks from the stressed corners
  crack(ctx, cx + Dw * 0.56, doorTop + Dw * 0.42, -0.6, Dw * 0.5, random)
  crack(ctx, cx - Dw * 0.56, doorTop + Dw * 0.5, Math.PI + 0.5, Dw * 0.4, random)
  crack(ctx, cx + Dw * 0.62, groundY - 3, -1.2, Dw * 0.35, random)
  crack(ctx, cx - Dw * 1.3, groundY * 0.3, 1.2, Dw * 0.6, random)
  crack(ctx, cx + Dw * 1.2, groundY * 0.18, 2.0, Dw * 0.45, random)
  // grime rising from the ground
  g = ctx.createLinearGradient(0, groundY - groundY * 0.12, 0, groundY)
  g.addColorStop(0, 'rgba(150,140,120,0)')
  g.addColorStop(1, 'rgba(150,140,120,0.16)')
  ctx.fillStyle = g
  ctx.fillRect(0, groundY - groundY * 0.12, W, groundY * 0.12)

  // raised limewashed surround around the arch, casting a soft shadow
  const band = Dw * 0.075
  ctx.save()
  ctx.shadowColor = 'rgba(55,70,95,0.22)'
  ctx.shadowBlur = Dw * 0.05
  ctx.shadowOffsetX = Dw * 0.02
  ctx.shadowOffsetY = Dw * 0.03
  archPath(ctx, cx - Dw / 2 - band, doorTop - band, Dw + band * 2, doorBottom - doorTop + band)
  ctx.fillStyle = '#f9f7f1'
  ctx.fill()
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.2
  archPath(ctx, cx - Dw / 2 - band, doorTop - band, Dw + band * 2, doorBottom - doorTop + band)
  ctx.stroke()

  // Cycladic paving: grey flagstones with thick white lime joints, in perspective
  const vy = H * 0.42
  ctx.fillStyle = '#f2efe7'
  ctx.fillRect(0, groundY, W, H - groundY)
  const stones = ['#d8d0c1', '#cfc6b5', '#ddd5c7', '#c9c0ae', '#d3cbbb']
  const rows = 7
  let prev = groundY
  for (let r = 1; r <= rows; r += 1) {
    const y1 = groundY + (H - groundY) * (r / rows) ** 1.45 + 2
    const y0 = prev
    prev = y1
    const k0 = (y0 - vy) / (groundY - vy)
    const k1 = (y1 - vy) / (groundY - vy)
    const gap = 1.5 * k1
    let u = -14 + random() * 0.8
    while (u < 14) {
      const du = 0.7 + random() * 0.9
      const x00 = cx + u * Dw * 0.42 * k0
      const x10 = cx + (u + du) * Dw * 0.42 * k0
      const x01 = cx + u * Dw * 0.42 * k1
      const x11 = cx + (u + du) * Dw * 0.42 * k1
      if (Math.max(x10, x11) > -20 && Math.min(x00, x01) < W + 20) {
        ctx.fillStyle = stones[Math.floor(random() * stones.length)]
        ctx.beginPath()
        ctx.moveTo(x00 + gap * 1.5, y0 + gap)
        ctx.lineTo(x10 - gap * 1.5, y0 + gap)
        ctx.lineTo(x11 - gap * 1.5, y1 - gap)
        ctx.lineTo(x01 + gap * 1.5, y1 - gap)
        ctx.closePath()
        ctx.fill()
      }
      u += du
    }
  }
  // contact shadow along the foot of the wall
  g = ctx.createLinearGradient(0, groundY, 0, groundY + Dw * 0.12)
  g.addColorStop(0, 'rgba(70,75,90,0.22)')
  g.addColorStop(1, 'rgba(70,75,90,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, groundY, W, Dw * 0.12)

  // marble threshold step
  const tx = cx - Dw * 0.6
  ctx.fillStyle = 'rgba(60,65,80,0.18)'
  ctx.fillRect(tx + 3, groundY, Dw * 1.2, Dw * 0.05)
  ctx.fillStyle = '#e1dbcf'
  ctx.fillRect(tx, doorBottom, Dw * 1.2, groundY - doorBottom)
  ctx.fillStyle = '#f7f4ec'
  ctx.fillRect(tx, doorBottom, Dw * 1.2, 2)

  grain(ctx, 12, random)

  // the opening itself
  ctx.globalCompositeOperation = 'destination-out'
  archPath(ctx, cx - Dw / 2, doorTop, Dw, doorBottom - doorTop)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

/* ---------------------------------------------------------------- the door */
function paintDoor(canvas, w, h, ratio, knockerY) {
  const ctx = sizeCanvas(canvas, w, h, ratio)
  const random = seeded(7)
  ctx.save()
  archPath(ctx, 0, 0, w, h)
  ctx.clip()
  const planks = 6
  const pw = w / planks
  for (let i = 0; i < planks; i += 1) {
    const x0 = i * pw
    ctx.fillStyle = `hsl(${211 + random() * 6} ${56 + random() * 12}% ${36 + random() * 7}%)`
    ctx.fillRect(x0, 0, pw + 1, h)
    // vertical brushwork
    for (let k = 0; k < 46; k += 1) {
      const x = x0 + random() * pw
      const y = random() * h
      ctx.fillStyle = random() < 0.5 ? `rgba(255,255,255,${0.04 + random() * 0.06})` : `rgba(10,30,60,${0.05 + random() * 0.07})`
      ctx.fillRect(x, y, 0.6 + random() * 1.8, 20 + random() * h * 0.4)
    }
    // the grain of the wood telegraphing through the paint
    ctx.strokeStyle = 'rgba(8,24,48,0.12)'
    ctx.lineWidth = 0.7
    for (let k = 0; k < 4; k += 1) {
      const gx = x0 + pw * (0.15 + random() * 0.7)
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      for (let y = 0; y <= h; y += h / 20) ctx.lineTo(gx + Math.sin(y * 0.04 + k) * 2.4, y)
      ctx.stroke()
    }
  }
  for (let i = 1; i < planks; i += 1) {
    ctx.fillStyle = 'rgba(10,24,46,0.85)'
    ctx.fillRect(i * pw - 1.2, 0, 2.4, h)
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillRect(i * pw + 1.2, 0, 1, h)
  }
  // a painted inner panel line echoing the arch
  const inset = w * 0.08
  ctx.strokeStyle = 'rgba(160,200,240,0.35)'
  ctx.lineWidth = 2
  archPath(ctx, inset, inset, w - inset * 2, h - inset * 2.2)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(8,22,44,0.4)'
  ctx.lineWidth = 1.5
  archPath(ctx, inset + 2, inset + 2, w - inset * 2, h - inset * 2.2)
  ctx.stroke()

  // peeling paint: older turquoise coat, then bare silvered wood
  for (let i = 0; i < 26; i += 1) {
    const x = random() * w
    const y = h * (0.25 + 0.75 * random() ** 0.6)
    const r = w * (0.02 + random() * 0.05)
    blob(ctx, x, y, r * 1.25, random)
    ctx.fillStyle = '#4aa7b8'
    ctx.fill()
    ctx.save()
    blob(ctx, x, y, r, random)
    ctx.fillStyle = '#a39279'
    ctx.fill()
    ctx.clip()
    ctx.strokeStyle = 'rgba(80,65,45,0.4)'
    ctx.lineWidth = 0.6
    for (let k = 0; k < 6; k += 1) {
      const gx = x - r + random() * r * 2
      ctx.beginPath()
      ctx.moveTo(gx, y - r)
      ctx.lineTo(gx + 1, y + r)
      ctx.stroke()
    }
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'
    ctx.lineWidth = 0.8
    blob(ctx, x, y, r * 1.25, seeded(i + 40))
    ctx.stroke()
  }
  // weathering: bleached top, grimy foot
  let g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(255,255,255,0.1)')
  g.addColorStop(0.8, 'rgba(255,255,255,0)')
  g.addColorStop(0.88, 'rgba(50,40,30,0)')
  g.addColorStop(1, 'rgba(50,40,30,0.32)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // iron studs in three rows and around the arch
  const stud = (x, y) => {
    const r = w * 0.017
    ctx.fillStyle = 'rgba(0,10,25,0.35)'
    ctx.beginPath()
    ctx.arc(x + r * 0.35, y + r * 0.5, r, 0, Math.PI * 2)
    ctx.fill()
    const sg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r)
    sg.addColorStop(0, '#a29d96')
    sg.addColorStop(0.45, '#4a4642')
    sg.addColorStop(1, '#1f1d1b')
    ctx.fillStyle = sg
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ;[0.36, 0.64, 0.9].forEach((fy) => {
    for (let i = 0; i < planks; i += 1) stud((i + 0.5) * pw, h * fy)
  })
  for (let i = 1; i < 8; i += 1) {
    const a = Math.PI + (i / 8) * Math.PI
    stud(w / 2 + Math.cos(a) * (w / 2 - inset * 0.55), w / 2 + Math.sin(a) * (w / 2 - inset * 0.55))
  }
  // brass escutcheon with keyhole
  const ex = w * 0.84
  const ey = knockerY + w * 0.2
  g = ctx.createLinearGradient(ex - 6, ey - 12, ex + 6, ey + 12)
  g.addColorStop(0, '#f6e3a1')
  g.addColorStop(0.5, '#c79a42')
  g.addColorStop(1, '#7d5a20')
  ctx.fillStyle = 'rgba(0,10,25,0.3)'
  ctx.fillRect(ex - w * 0.03 + 1.5, ey - w * 0.06 + 2, w * 0.06, w * 0.12)
  ctx.fillStyle = g
  ctx.fillRect(ex - w * 0.03, ey - w * 0.06, w * 0.06, w * 0.12)
  ctx.fillStyle = '#1b1406'
  ctx.beginPath()
  ctx.arc(ex, ey - w * 0.012, w * 0.009, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(ex - w * 0.004, ey - w * 0.012, w * 0.008, w * 0.03)
  ctx.restore()
  grain(ctx, 14, random)
  // edge darkening where the paint is worn
  ctx.save()
  archPath(ctx, 0, 0, w, h)
  ctx.clip()
  ctx.strokeStyle = 'rgba(8,22,44,0.4)'
  ctx.lineWidth = w * 0.035
  archPath(ctx, 0, 0, w, h)
  ctx.stroke()
  ctx.restore()
}

function knockerSvg(id) {
  const brass = `url(#${id}b)`
  return {
    plate: `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style="position:absolute;inset:0;overflow:visible;filter:drop-shadow(1px 2px 1.5px rgba(10,20,40,.45))">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b8"/><stop offset=".35" stop-color="#d9ac4c"/><stop offset=".7" stop-color="#8a6224"/><stop offset="1" stop-color="#e6c26a"/></linearGradient>
        <radialGradient id="${id}r" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff6cf"/><stop offset=".4" stop-color="#d6a748"/><stop offset="1" stop-color="#6e4c18"/></radialGradient>
      </defs>
      <g fill="${brass}">${Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return `<circle cx="${(50 + Math.cos(a) * 11).toFixed(2)}" cy="${(22 + Math.sin(a) * 11).toFixed(2)}" r="6.4"/>`
      }).join('')}</g>
      <circle cx="50" cy="22" r="11" fill="url(#${id}r)"/>
      <circle cx="50" cy="22" r="4.2" fill="${brass}" stroke="#6e4c18" stroke-width=".8"/>
      <circle cx="50" cy="88" r="5.2" fill="url(#${id}r)"/>
    </svg>`,
    ring: `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style="position:absolute;inset:0;overflow:visible">
      <circle cx="50" cy="40" r="31" fill="none" stroke="#5c3f12" stroke-width="9"/>
      <circle cx="50" cy="40" r="31" fill="none" stroke="${brass}" stroke-width="7"/>
      <path d="M27 22 A31 31 0 0 1 64 12" fill="none" stroke="#fff6d2" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>
      <rect x="45" y="5" width="10" height="7" rx="3" fill="${brass}"/>
    </svg>`,
  }
}

/* ---------------------------------------------------------- ceramic pieces */
function glazeBase(ctx, w, h, path) {
  const g = ctx.createRadialGradient(w * 0.42, h * 0.38, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.72)
  g.addColorStop(0, '#2f6bb8')
  g.addColorStop(0.6, '#1f4f98')
  g.addColorStop(1, '#143a75')
  path()
  ctx.fillStyle = g
  ctx.fill()
  // glaze pooling darker toward the rim
  ctx.save()
  path()
  ctx.clip()
  ctx.shadowColor = 'rgba(8,24,60,0.7)'
  ctx.shadowBlur = Math.min(w, h) * 0.08
  ctx.lineWidth = Math.min(w, h) * 0.05
  ctx.strokeStyle = 'rgba(8,24,60,0.5)'
  path()
  ctx.stroke()
  ctx.restore()
}

function glazeShine(ctx, w, h, path) {
  ctx.save()
  path()
  ctx.clip()
  const g = ctx.createLinearGradient(0, 0, w, h)
  g.addColorStop(0.08, 'rgba(255,255,255,0)')
  g.addColorStop(0.16, 'rgba(255,255,255,0.32)')
  g.addColorStop(0.22, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  // fine crazing in the glaze
  const random = seeded(Math.round(w))
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 0.6
  for (let i = 0; i < 26; i += 1) {
    let x = random() * w
    let y = random() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let k = 0; k < 5; k += 1) {
      x += (random() - 0.5) * w * 0.12
      y += (random() - 0.5) * h * 0.12
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function paintPlate(canvas, w, h, ratio, number) {
  const ctx = sizeCanvas(canvas, w, h, ratio)
  const path = () => roundRect(ctx, 1, 1, w - 2, h - 2, Math.min(w, h) * 0.16)
  glazeBase(ctx, w, h, path)
  ctx.strokeStyle = '#f7f3ea'
  ctx.lineWidth = Math.max(1.2, w * 0.035)
  roundRect(ctx, w * 0.09, h * 0.11, w * 0.82, h * 0.78, Math.min(w, h) * 0.1)
  ctx.stroke()
  ctx.fillStyle = '#f7f3ea'
  ;[[0.17, 0.2], [0.83, 0.2], [0.17, 0.8], [0.83, 0.8]].forEach(([fx, fy]) => {
    ctx.beginPath()
    ctx.arc(w * fx, h * fy, Math.max(1, w * 0.022), 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.font = `${h * 0.5}px ${DISPLAY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(number, w / 2, h * 0.53)
  glazeShine(ctx, w, h, path)
}

/* --------------------------------------------------------- beyond the door */
function paintSea(canvas, G, ratio) {
  const { W, H, horizon, s } = G
  const ctx = sizeCanvas(canvas, W, H, ratio)
  const random = seeded(55)
  let g = ctx.createLinearGradient(0, 0, 0, horizon)
  g.addColorStop(0, '#9fc6e2')
  g.addColorStop(0.55, '#cfe2ee')
  g.addColorStop(1, '#f5f1e6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, horizon)
  // the sun, high and soft
  const sx = W * 0.62
  const sy = horizon - H * 0.26
  g = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(W, H) * 0.5)
  g.addColorStop(0, 'rgba(255,253,240,0.95)')
  g.addColorStop(0.08, 'rgba(255,248,224,0.55)')
  g.addColorStop(1, 'rgba(255,248,224,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, horizon)
  // distant islands in haze
  const island = (x0, x1, peak, color) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x0, horizon)
    for (let x = x0; x <= x1; x += 6) {
      const t = (x - x0) / (x1 - x0)
      ctx.lineTo(x, horizon - Math.sin(t * Math.PI) ** 1.4 * peak * (0.85 + 0.15 * Math.sin(t * 17)))
    }
    ctx.lineTo(x1, horizon)
    ctx.fill()
  }
  island(-W * 0.05, W * 0.38, H * 0.035, 'rgba(150,170,196,0.55)')
  island(W * 0.22, W * 0.5, H * 0.018, 'rgba(170,186,206,0.5)')
  island(W * 0.82, W * 1.08, H * 0.022, 'rgba(160,178,200,0.45)')
  // sea, deepening toward us
  g = ctx.createLinearGradient(0, horizon, 0, H)
  g.addColorStop(0, '#7cc0d6')
  g.addColorStop(0.25, '#3f98c3')
  g.addColorStop(0.7, '#1f6fae')
  g.addColorStop(1, '#165593')
  ctx.fillStyle = g
  ctx.fillRect(0, horizon, W, H - horizon)
  // gouache wave strokes, wider as they come closer
  for (let i = 0; i < 420; i += 1) {
    const t = random() ** 1.7
    const y = horizon + 2 + t * (H - horizon)
    const len = 6 + t * W * 0.12 * random()
    const x = random() * W
    ctx.strokeStyle = random() < 0.55 ? `rgba(255,255,255,${0.06 + random() * 0.12})` : `rgba(10,50,100,${0.06 + random() * 0.1})`
    ctx.lineWidth = 0.6 + t * 3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + len / 2, y - 1 - t * 3, x + len, y)
    ctx.stroke()
  }
  // sun path
  g = ctx.createLinearGradient(sx - W * 0.12, 0, sx + W * 0.12, 0)
  g.addColorStop(0, 'rgba(255,250,230,0)')
  g.addColorStop(0.5, 'rgba(255,250,230,0.35)')
  g.addColorStop(1, 'rgba(255,250,230,0)')
  ctx.fillStyle = g
  ctx.fillRect(sx - W * 0.12, horizon, W * 0.24, H - horizon)

  // whitewashed parapet across the foreground
  const top = G.parapet
  g = ctx.createLinearGradient(0, top, 0, H)
  g.addColorStop(0, '#fbfaf5')
  g.addColorStop(0.08, '#f1eee6')
  g.addColorStop(1, '#e4e0d6')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, top + 6)
  ctx.quadraticCurveTo(0, top, 8, top)
  ctx.lineTo(W - 8, top)
  ctx.quadraticCurveTo(W, top, W, top + 6)
  ctx.lineTo(W, H)
  ctx.lineTo(0, H)
  ctx.fill()
  ctx.fillStyle = 'rgba(60,80,110,0.12)'
  ctx.fillRect(0, top + H * 0.012, W, 2)

  // weathered pergola beam with bougainvillea hanging from it
  g = ctx.createLinearGradient(0, 0, 0, G.beam)
  g.addColorStop(0, '#7d6f5e')
  g.addColorStop(1, '#5d5245')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, G.beam)
  ctx.strokeStyle = 'rgba(230,220,200,0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i < 18; i += 1) {
    const y = random() * G.beam
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.bezierCurveTo(W * 0.3, y + 2, W * 0.6, y - 2, W, y + 1)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(40,50,70,0.2)'
  ctx.fillRect(0, G.beam, W, 3)
  paintVines(
    ctx,
    [
      { points: [[-s * 4, G.beam * 0.6], [W * 0.18, G.beam + s * 3], [W * 0.32, G.beam + s * 1.5]], density: 1.1 },
      { points: [[W * 0.7, G.beam + s], [W * 0.86, G.beam + s * 4], [W + s * 4, G.beam * 0.5]], density: 1.1 },
      { points: [[-s * 3, top - s * 0.5], [W * 0.14, top + s * 1.2]], density: 0.9 },
      { points: [[W * 0.88, top + s * 1.5], [W + s * 3, top - s]], density: 0.9 },
    ],
    s,
    random,
    false,
  )
  grain(ctx, 10, random)
}

function plaquePath(ctx, x, y, w, h) {
  archPath(ctx, x, y, w, h)
}

/* -------------------------------------------------------------------- scene */
export default function create(host, template, { onOpened, setCaption }) {
  const couple = [String(template.couple?.[0] ?? ''), String(template.couple?.[1] ?? '')]
  const amp = template.lang === 'tr' ? 've' : '&'
  const dayMatch = String(template.dateLabel ?? '').match(/\d{1,2}/)
  const houseNumber = dayMatch ? String(Number(dayMatch[0])) : String(Number(String(template.date ?? '').slice(8, 10)) || '')
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  const id = `ag${Math.random().toString(36).slice(2, 8)}`

  /* ------------------------------------------------------------ DOM */
  const root = el('div', 'position:absolute;inset:0;overflow:hidden;background:#fbfaf6;contain:strict;', host)
  root.setAttribute('aria-hidden', 'true')
  const beyond = el('div', 'position:absolute;inset:0;transform-origin:50% 50%;will-change:transform;', root)
  const seaCanvas = el('canvas', 'position:absolute;left:0;top:0;display:block;', beyond)
  const glitter = el('canvas', 'position:absolute;inset:0;width:100%;height:100%;display:block;', beyond)
  const plaqueWrap = el('div', 'position:absolute;opacity:0;will-change:transform,opacity;filter:drop-shadow(0 18px 24px rgba(20,40,80,.28));', beyond)
  const plaque = el('canvas', 'position:absolute;left:0;top:0;display:block;', plaqueWrap)
  const exposure = el('div', 'position:absolute;inset:0;', beyond)

  const world = el('div', 'position:absolute;inset:0;will-change:transform,opacity;', root)
  const doorway = el('div', 'position:absolute;', world)
  const door = el('div', 'position:absolute;inset:0;transform-origin:0 50%;transform-style:preserve-3d;will-change:transform;', doorway)
  const doorCanvas = el('canvas', 'position:absolute;left:0;top:0;display:block;', door)
  const knocker = el('div', 'position:absolute;transform-style:preserve-3d;', door)
  const svg = knockerSvg(id)
  knocker.innerHTML = svg.plate
  const ring = el('div', 'position:absolute;left:0;width:100%;height:100%;transform-origin:50% 8%;', knocker)
  ring.innerHTML = svg.ring
  const doorShade = el('div', 'position:absolute;inset:0;background:#0c1a2e;opacity:0;pointer-events:none;', door)
  const recess = el('div', 'position:absolute;inset:0;pointer-events:none;', doorway)
  const wallCanvas = el('canvas', 'position:absolute;left:0;top:0;display:block;', world)
  const glow = el('div', 'position:absolute;opacity:0;mix-blend-mode:screen;pointer-events:none;', world)
  const rays = el('div', 'position:absolute;opacity:0;mix-blend-mode:screen;pointer-events:none;', world)
  const poolHost = el('div', 'position:absolute;left:0;opacity:0;mix-blend-mode:screen;pointer-events:none;', world)
  const pool = el('div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,247,222,.95),rgba(255,240,205,.18));', poolHost)
  const plate = el('canvas', 'position:absolute;display:block;filter:drop-shadow(2px 4px 3px rgba(40,55,80,.3));', world)
  const vineCanvas = el('canvas', 'position:absolute;left:0;top:0;display:block;transform-origin:100% 0;will-change:transform;', world)
  const fx = el('canvas', 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;', root)
  const flash = el('div', 'position:absolute;inset:0;background:#fffaf0;opacity:0;pointer-events:none;', root)
  // The page's whitewashed wall (its ground gradient and dot grain): the light
  // settles into it at the end, and the page brings its vines, shore and arch in.
  const backdrop = el(
    'div',
    'position:absolute;left:0;top:0;bottom:0;width:100%;opacity:0;pointer-events:none;background:' +
      'radial-gradient(120% 80% at 12% 6%,oklch(0.99 0.005 90) 0%,transparent 55%),' +
      'radial-gradient(150% 90% at 90% 104%,oklch(0.9 0.045 240 / .5) 0%,transparent 62%),' +
      'linear-gradient(180deg,oklch(0.977 0.008 85) 0%,oklch(0.977 0.008 85) 58%,oklch(0.947 0.016 80) 100%);',
    root,
  )
  el(
    'div',
    'position:absolute;inset:0;opacity:.45;background-image:radial-gradient(oklch(0.55 0.03 250 / .05) 1px,transparent 1px);background-size:4px 4px;',
    backdrop,
  )
  const fxCtx = fx.getContext('2d')
  const glitterCtx = glitter.getContext('2d')
  const plaqueCtx = plaque.getContext('2d')

  // falling bracts, pre-rendered
  const petalSprites = BRACTS.slice(0, 4).map((color) => {
    const [canvas, ctx] = makeCanvas(48, 48)
    bract(ctx, 24, 40, 32, 0, color)
    return canvas
  })
  const pr = seeded(12)
  const petals = Array.from({ length: small ? 10 : 16 }, (_, i) => ({
    sprite: petalSprites[i % petalSprites.length],
    x0: pr(),
    y0: pr(),
    speed: 0.035 + pr() * 0.04,
    sway: 10 + pr() * 26,
    spin: (pr() - 0.5) * 3,
    flip: 1.5 + pr() * 2.5,
    phase: pr() * 6.283,
    size: 0.7 + pr() * 0.6,
  }))
  const motes = Array.from({ length: small ? 26 : 44 }, () => ({ x: pr(), y: pr(), r: 0.6 + pr() * 1.6, speed: 0.01 + pr() * 0.03, phase: pr() * 6.283 }))
  const sparkles = Array.from({ length: small ? 90 : 150 }, () => ({ u: pr(), v: pr() ** 1.6, rate: 1.5 + pr() * 3.5, phase: pr() * 40, size: 0.6 + pr() * 1.4 }))

  /* --------------------------------------------------------- layout */
  const G = {}
  const namesCanvas = document.createElement('canvas')
  const plaqueBase = document.createElement('canvas')
  const nameLines = []

  const measure = () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    const Dw = Math.round(Math.min(W * 0.58, H * 0.3))
    const groundY = Math.round(H * 0.76)
    const doorBottom = groundY - Math.round(Dw * 0.04)
    const Dh = Math.round(Dw * 1.69)
    const doorTop = doorBottom - Dh
    const cx = W / 2
    const oy = doorTop + Dh * 0.56
    const S = 1.3 * Math.max(cx / (Dw / 2), oy / Math.max(oy - doorTop - Dw * 0.3, 1), (H - oy) / Math.max(doorBottom - oy, 1))
    const pw = Math.max(40, Math.min(Dw * 0.26, (W - Dw) / 2 - 22))
    const ph = pw * 0.76
    const rightRoom = W - (cx + Dw / 2 + Dw * 0.075)
    const plateX = cx + Dw / 2 + Dw * 0.075 + Math.max(8, (rightRoom - pw) * 0.35)
    const Pw = Math.round(Math.min(W * 0.68, (H * 0.42) / 1.25))
    const Ph = Math.round(Pw * 1.25)
    Object.assign(G, {
      W,
      H,
      Dw,
      Dh,
      cx,
      oy,
      S,
      doorTop,
      doorBottom,
      groundY,
      pw,
      ph,
      plateX: Math.min(plateX, W - pw - 6),
      plateY: doorTop + Dh * 0.46,
      horizon: H * 0.6,
      parapet: H * 0.79,
      beam: Math.max(14, H * 0.045),
      s: Math.max(4, Math.min(W, H) * 0.012),
      Pw,
      Ph,
      Px: cx - Pw / 2,
      Py: H * 0.44 - Ph / 2,
    })
  }

  const place = () => {
    const { W, H, Dw, Dh, cx, doorTop, groundY, oy } = G
    world.style.transformOrigin = `${cx}px ${oy}px`
    beyond.style.transformOrigin = `${cx}px ${oy}px`
    Object.assign(doorway.style, { left: `${cx - Dw / 2}px`, top: `${doorTop}px`, width: `${Dw}px`, height: `${Dh}px`, perspective: `${Dw * 3.2}px` })
    door.style.borderRadius = `${Dw / 2}px ${Dw / 2}px 0 0`
    doorShade.style.borderRadius = door.style.borderRadius
    recess.style.borderRadius = door.style.borderRadius
    recess.style.boxShadow = `inset ${Dw * 0.07}px ${Dw * 0.08}px ${Dw * 0.08}px rgba(30,45,70,.42), inset 0 0 ${Dw * 0.03}px rgba(30,45,70,.3)`
    const kn = Dw * 0.24
    Object.assign(knocker.style, { left: `${Dw / 2 - kn / 2}px`, top: `${Dh * 0.43}px`, width: `${kn}px`, height: `${kn}px` })
    ring.style.top = `${kn * 0.14}px`
    Object.assign(glow.style, {
      left: `${cx - Dw * 1.8}px`,
      top: `${oy - Dh * 0.9}px`,
      width: `${Dw * 3.6}px`,
      height: `${Dh * 1.8}px`,
      background: 'radial-gradient(closest-side, rgba(255,248,226,.95) 0%, rgba(255,236,192,.5) 38%, rgba(255,236,192,0) 100%)',
    })
    const rs = Dh * 2.6
    Object.assign(rays.style, {
      left: `${cx - rs / 2}px`,
      top: `${oy - rs / 2}px`,
      width: `${rs}px`,
      height: `${rs}px`,
      background:
        'repeating-conic-gradient(from 0deg, rgba(255,240,200,0) 0deg 6deg, rgba(255,240,200,.38) 8deg 10deg, rgba(255,240,200,0) 12deg 19deg)',
      maskImage: 'radial-gradient(closest-side, #000 18%, transparent 70%)',
      webkitMaskImage: 'radial-gradient(closest-side, #000 18%, transparent 70%)',
    })
    Object.assign(poolHost.style, { top: `${groundY - 2}px`, width: `${W}px`, height: `${H - groundY + 2}px`, filter: `blur(${Math.max(3, Dw * 0.04)}px)` })
    pool.style.clipPath = `polygon(${cx - Dw * 0.5}px 0, ${cx + Dw * 0.5}px 0, ${cx + Dw * 1.05}px 100%, ${cx - Dw * 1.05}px 100%)`
    Object.assign(plate.style, { left: `${G.plateX}px`, top: `${G.plateY}px` })
    exposure.style.background = `radial-gradient(ellipse at ${cx}px ${oy}px, #fffef8 0%, #fff7e4 45%, #fde9c4 100%)`
    fx.width = Math.round(W * ratio)
    fx.height = Math.round(H * ratio)
    glitter.width = Math.round(W * Math.min(ratio, 1.5))
    glitter.height = Math.round(H * Math.min(ratio, 1.5))
    const cordTop = G.beam
    Object.assign(plaqueWrap.style, {
      left: `${G.Px}px`,
      top: `${cordTop}px`,
      width: `${G.Pw}px`,
      height: `${G.Py + G.Ph - cordTop}px`,
      transformOrigin: '50% 0',
    })
  }

  const paintAll = () => {
    const { W, H, Dw, Dh, cx, doorTop } = G
    paintWall(wallCanvas, G, ratio)
    paintDoor(doorCanvas, Dw, Dh, ratio, Dh * 0.43)
    paintPlate(plate, G.pw, G.ph, ratio, houseNumber)
    paintSea(seaCanvas, G, Math.min(ratio, 1.5))

    // bougainvillea spilling over the top and the arch
    const vctx = sizeCanvas(vineCanvas, W, H, ratio)
    const vs = Math.max(3.2, Dw * 0.032)
    const lines = [
      {
        points: [
          [W + vs * 3, -vs * 3],
          [cx + Dw * 0.95, doorTop - Dw * 0.4],
          [cx + Dw * 0.45, doorTop - Dw * 0.06],
          [cx, doorTop - Dw * 0.1],
          [cx - Dw * 0.38, doorTop + Dw * 0.02],
          [cx - Dw * 0.62, doorTop + Dw * 0.26],
        ],
        density: 1.15,
      },
      { points: [[cx + Dw * 0.52, doorTop + Dw * 0.06], [cx + Dw * 0.62, doorTop + Dw * 0.32], [cx + Dw * 0.6, doorTop + Dw * 0.52]], density: 0.8 },
    ]
    if (doorTop > Dw * 0.8) {
      lines.push({ points: [[-vs * 3, H * 0.015], [W * 0.28, H * 0.05 + vs * 3], [W * 0.62, H * 0.03], [W + vs * 3, -vs]], density: 0.9 })
    } else {
      lines.push({ points: [[-vs * 3, -vs], [cx - Dw * 0.9, doorTop - Dw * 0.25]], density: 0.9 })
    }
    paintVines(vctx, lines, vs, seeded(303))

    // the ceramic plaque, its cords, and the names on a separate layer
    const { Pw, Ph } = G
    const top = G.Py - G.beam
    const ch = top + Ph
    const pctx = sizeCanvas(plaqueBase, Pw, ch, ratio)
    sizeCanvas(plaque, Pw, ch, ratio)
    const path = () => plaquePath(pctx, 2, top, Pw - 4, Ph - 2)
    const r = (Pw - 4) / 2
    const ring1 = [2 + r - r * 0.72, top + r - r * 0.68]
    const ring2 = [2 + r + r * 0.72, top + r - r * 0.68]
    pctx.strokeStyle = '#cdb88f'
    pctx.lineWidth = Math.max(1.5, Pw * 0.008)
    pctx.beginPath()
    pctx.moveTo(Pw * 0.3, 0)
    pctx.lineTo(ring1[0], ring1[1])
    pctx.moveTo(Pw * 0.7, 0)
    pctx.lineTo(ring2[0], ring2[1])
    pctx.stroke()
    glazeBase(pctx, Pw, ch, path)
    // painted white borders
    const inset1 = Pw * 0.055
    const inset2 = Pw * 0.085
    pctx.strokeStyle = '#f7f3ea'
    pctx.lineWidth = Math.max(1.5, Pw * 0.016)
    plaquePath(pctx, 2 + inset1, top + inset1, Pw - 4 - inset1 * 2, Ph - 2 - inset1 * 2)
    pctx.stroke()
    pctx.lineWidth = Math.max(0.8, Pw * 0.005)
    plaquePath(pctx, 2 + inset2, top + inset2, Pw - 4 - inset2 * 2, Ph - 2 - inset2 * 2)
    pctx.stroke()
    // a small painted sun-and-sprig ornament in the arch
    const ox = Pw / 2
    const oyy = top + Ph * 0.2
    pctx.fillStyle = '#f7f3ea'
    pctx.beginPath()
    pctx.arc(ox, oyy, Pw * 0.03, 0, Math.PI * 2)
    pctx.fill()
    pctx.strokeStyle = '#f7f3ea'
    pctx.lineWidth = Math.max(1, Pw * 0.006)
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2
      pctx.beginPath()
      pctx.moveTo(ox + Math.cos(a) * Pw * 0.045, oyy + Math.sin(a) * Pw * 0.045)
      pctx.lineTo(ox + Math.cos(a) * Pw * (i % 2 ? 0.06 : 0.075), oyy + Math.sin(a) * Pw * (i % 2 ? 0.06 : 0.075))
      pctx.stroke()
    }
    const sprig = (dir) => {
      for (let i = 0; i < 4; i += 1) {
        const lx = ox + dir * Pw * (0.11 + i * 0.045)
        const ly = oyy + Pw * 0.01 - i * Pw * 0.006
        vineLeaf(pctx, lx, ly, Pw * 0.035, dir * (1.2 + i * 0.1), '#f7f3ea')
      }
    }
    sprig(1)
    sprig(-1)
    // running-wave border along the foot
    pctx.lineWidth = Math.max(1, Pw * 0.007)
    pctx.beginPath()
    const wy = top + Ph * 0.86
    const ww = Pw * 0.58
    const waves = 6
    for (let i = 0; i < waves; i += 1) {
      const x = ox - ww / 2 + (ww / waves) * i
      const k = ww / waves
      pctx.moveTo(x, wy)
      pctx.bezierCurveTo(x + k * 0.2, wy - k * 0.5, x + k * 0.75, wy - k * 0.45, x + k * 0.55, wy - k * 0.15)
      pctx.bezierCurveTo(x + k * 0.45, wy - k * 0.02, x + k * 0.7, wy + k * 0.05, x + k, wy)
    }
    pctx.stroke()
    glazeShine(pctx, Pw, ch, path)
    // brass rings at the shoulders
    pctx.strokeStyle = '#c99a42'
    pctx.lineWidth = Math.max(1.2, Pw * 0.008)
    ;[ring1, ring2].forEach(([x, y]) => {
      pctx.beginPath()
      pctx.arc(x, y, Pw * 0.016, 0, Math.PI * 2)
      pctx.stroke()
    })

    // names, laid out line by line for the hand-painted reveal
    const nctx = sizeCanvas(namesCanvas, Pw, ch, ratio)
    let fs = Pw * 0.13
    nctx.font = `${fs}px ${DISPLAY}`
    const widest = Math.max(...couple.map((name) => nctx.measureText(name).width), 1)
    fs = Math.min(fs, (fs * Pw * 0.66) / widest)
    nctx.fillStyle = '#fbf7ee'
    nctx.textAlign = 'center'
    nctx.textBaseline = 'middle'
    nameLines.length = 0
    const rows = [
      [couple[0], `${fs}px ${DISPLAY}`, top + Ph * 0.46],
      [amp, `italic 500 ${fs * 0.72}px ${SCRIPT}`, top + Ph * 0.585],
      [couple[1], `${fs}px ${DISPLAY}`, top + Ph * 0.71],
    ]
    rows.forEach(([text, font, y]) => {
      nctx.font = font
      nctx.fillText(text, Pw / 2, y)
      const width = nctx.measureText(text).width
      nameLines.push({ x: Pw / 2 - width / 2 - 4, y: y - fs * 0.75, w: width + 8, h: fs * 1.5 })
    })
    G.plaqueTop = top
    plaqueDirty = true
  }

  let paintTimer = 0
  let plaqueDirty = true
  let laidOut = ''
  const layout = (first) => {
    // the page's fixed wall stops at its scrollbar gutter
    backdrop.style.width = `${Math.min(root.clientWidth || window.innerWidth, document.documentElement.clientWidth || window.innerWidth)}px`
    const key = `${host.clientWidth}x${host.clientHeight}`
    if (!first && key === laidOut) return
    laidOut = key
    measure()
    place()
    clearTimeout(paintTimer)
    if (first) paintAll()
    else paintTimer = setTimeout(paintAll, 160)
  }
  layout(true)
  const observer = new ResizeObserver(() => layout(false))
  observer.observe(host)

  /* ---------------------------------------------------------- render */
  const state = {
    px: 0,
    py: 0,
    sx: 0,
    sy: 0,
    knock: 0,
    shudder: 0,
    door: 0,
    light: 0,
    dolly: 0,
    exposure: 1,
    flash: 0,
    plaqueIn: 0,
    reveal: 0,
    glint: -0.4,
  }
  let lastReveal = -1
  let lastGlint = -1

  const drawPlaque = () => {
    const { Pw, Ph, plaqueTop: top } = G
    const ch = top + Ph
    plaqueCtx.setTransform(1, 0, 0, 1, 0, 0)
    plaqueCtx.clearRect(0, 0, plaque.width, plaque.height)
    plaqueCtx.drawImage(plaqueBase, 0, 0)
    plaqueCtx.setTransform(ratio, 0, 0, ratio, 0, 0)
    // each line is painted in from left to right, one after another
    nameLines.forEach((line, i) => {
      const p = Math.min(Math.max((state.reveal - i * 0.27) / 0.46, 0), 1)
      if (p <= 0) return
      const edge = line.w * 0.18
      const reach = (line.w + edge) * p
      plaqueCtx.save()
      plaqueCtx.beginPath()
      plaqueCtx.rect(line.x, line.y, Math.max(reach - edge, 0), line.h)
      plaqueCtx.clip()
      plaqueCtx.drawImage(namesCanvas, 0, 0, Pw, ch)
      plaqueCtx.restore()
      // soft wet edge of the brush
      plaqueCtx.save()
      plaqueCtx.globalAlpha = 0.45
      plaqueCtx.beginPath()
      plaqueCtx.rect(line.x + Math.max(reach - edge, 0), line.y, Math.min(edge, reach), line.h)
      plaqueCtx.clip()
      plaqueCtx.drawImage(namesCanvas, 0, 0, Pw, ch)
      plaqueCtx.restore()
    })
    if (state.glint > -0.3 && state.glint < 1.3) {
      plaqueCtx.save()
      plaquePath(plaqueCtx, 2, top, Pw - 4, Ph - 2)
      plaqueCtx.clip()
      const gx = state.glint * (Pw + Ph) - Ph * 0.5
      const g = plaqueCtx.createLinearGradient(gx, top, gx + Ph * 0.5, top + Ph)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.45, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, 'rgba(255,255,255,0.55)')
      g.addColorStop(0.55, 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      plaqueCtx.globalCompositeOperation = 'lighter'
      plaqueCtx.fillStyle = g
      plaqueCtx.fillRect(0, top, Pw, Ph)
      plaqueCtx.restore()
    }
  }

  let raf = 0
  let last = performance.now()
  let time = 0
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    time += dt
    const t = time
    const { W, H, Dw, cx, oy, S } = G
    state.sx += (state.px - state.sx) * Math.min(dt * 3, 1)
    state.sy += (state.py - state.sy) * Math.min(dt * 3, 1)
    const d = state.dolly

    /* world: parallax, knock shake, then the walk through the door */
    const shake = state.shudder * Math.sin(t * 90) * 1.6
    const scale = Math.exp(Math.log(S) * d)
    world.style.transform = `translate3d(${(-state.sx * 7 * (1 - d) + shake).toFixed(2)}px, ${(-state.sy * 5 * (1 - d)).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
    world.style.opacity = d > 0.72 ? Math.max(0, (1 - d) / 0.28).toFixed(3) : '1'
    world.style.visibility = d >= 0.999 ? 'hidden' : 'visible'
    beyond.style.transform = `translate3d(${(-state.sx * 3).toFixed(2)}px, ${(-state.sy * 2).toFixed(2)}px, 0) scale(${(1.1 - 0.1 * d).toFixed(4)})`
    vineCanvas.style.transform = `translate3d(${(-state.sx * 4).toFixed(2)}px, ${(-state.sy * 2).toFixed(2)}px, 0) rotate(${(Math.sin(t * 0.7) * 0.22 + Math.sin(t * 1.9) * 0.05).toFixed(3)}deg)`

    /* door and knocker */
    door.style.transform = `rotateY(${(state.door + state.shudder * Math.sin(t * 70) * 0.7).toFixed(3)}deg)`
    doorShade.style.opacity = Math.min(0.55, (state.door / 82) * 0.55).toFixed(3)
    recess.style.opacity = Math.max(0, 1 - state.door / 30).toFixed(3)
    const k = state.knock + Math.sin(t * 1.3) * 1.2
    ring.style.transform = `rotateX(${k.toFixed(2)}deg)`
    ring.style.filter = `drop-shadow(${(1 + k * 0.06).toFixed(2)}px ${(2 + k * 0.1).toFixed(2)}px ${(1.5 + k * 0.06).toFixed(2)}px rgba(10,20,40,${Math.max(0.15, 0.45 - k * 0.006).toFixed(3)}))`

    /* sunlight flooding out */
    const light = state.light * (1 - d * 0.6)
    glow.style.opacity = light.toFixed(3)
    rays.style.opacity = (light * 0.8).toFixed(3)
    rays.style.transform = `rotate(${(t * 2.5).toFixed(2)}deg)`
    poolHost.style.opacity = (light * 0.9).toFixed(3)
    exposure.style.opacity = state.exposure.toFixed(3)
    flash.style.opacity = state.flash.toFixed(3)
    plaqueWrap.style.opacity = state.plaqueIn.toFixed(3)
    plaqueWrap.style.transform = `translate3d(0, ${((1 - state.plaqueIn) * 18).toFixed(2)}px, 0) rotate(${(Math.sin(t * 0.8) * 0.5).toFixed(3)}deg)`

    /* foreground particles: falling bracts, motes in the light */
    fxCtx.setTransform(1, 0, 0, 1, 0, 0)
    fxCtx.clearRect(0, 0, fx.width, fx.height)
    const fade = 1 - Math.min(d * 3, 1)
    if (fade > 0) {
      const ps = Math.max(10, Dw * 0.07)
      fxCtx.globalAlpha = fade
      for (let i = 0; i < petals.length; i += 1) {
        const p = petals[i]
        const fy = (((p.y0 + t * p.speed) % 1) + 1) % 1
        const x = (p.x0 * W + Math.sin(t * 0.9 + p.phase) * p.sway - state.sx * 9) * ratio
        const y = (fy * (H + ps * 2) - ps) * ratio
        const r = t * p.spin + p.phase
        const flip = Math.cos(t * p.flip + p.phase)
        const sz = ps * p.size * ratio
        const co = Math.cos(r)
        const si = Math.sin(r)
        fxCtx.setTransform(co * flip, si * flip, -si, co, x, y)
        fxCtx.drawImage(p.sprite, -sz / 2, -sz / 2, sz, sz)
      }
      if (light > 0.01) {
        fxCtx.setTransform(1, 0, 0, 1, 0, 0)
        fxCtx.fillStyle = '#fff6dc'
        for (let i = 0; i < motes.length; i += 1) {
          const m = motes[i]
          const fy = (((m.y - t * m.speed) % 1) + 1) % 1
          const x = (cx + (m.x - 0.5) * Dw * 1.6 + Math.sin(t * 0.6 + m.phase) * 8) * ratio
          const y = (oy - G.Dh * 0.3 + fy * (H - oy + G.Dh * 0.3)) * ratio
          fxCtx.globalAlpha = fade * light * (0.35 + 0.35 * Math.sin(t * 2 + m.phase))
          fxCtx.beginPath()
          fxCtx.arc(x, y, m.r * ratio, 0, Math.PI * 2)
          fxCtx.fill()
        }
      }
      fxCtx.globalAlpha = 1
    }

    /* sea glitter, only once there is a way through */
    if (state.door > 1) {
      const gr = glitter.width / W
      glitterCtx.setTransform(1, 0, 0, 1, 0, 0)
      glitterCtx.clearRect(0, 0, glitter.width, glitter.height)
      glitterCtx.globalCompositeOperation = 'lighter'
      glitterCtx.fillStyle = '#fffdf2'
      const sunX = W * 0.62
      for (let i = 0; i < sparkles.length; i += 1) {
        const sp = sparkles[i]
        const depth = sp.v
        const y = G.horizon + 3 + depth * (G.parapet - G.horizon - 6)
        const spread = W * (0.06 + depth * 0.32)
        const x = sunX + (sp.u - 0.5) * 2 * spread
        const tw = Math.max(0, Math.sin(t * sp.rate + sp.phase)) ** 10
        if (tw < 0.02) continue
        const len = (2 + depth * 7) * sp.size * tw
        glitterCtx.globalAlpha = tw
        glitterCtx.fillRect((x - len) * gr, (y - 0.5) * gr, len * 2 * gr, Math.max(1, gr))
        glitterCtx.fillRect((x - 0.5) * gr, (y - len * 0.45) * gr, Math.max(1, gr), len * 0.9 * gr)
      }
      glitterCtx.globalAlpha = 1
      glitterCtx.globalCompositeOperation = 'source-over'
    }

    if (plaqueDirty || state.reveal !== lastReveal || state.glint !== lastGlint) {
      if (state.plaqueIn > 0) {
        drawPlaque()
        plaqueDirty = false
        lastReveal = state.reveal
        lastGlint = state.glint
      }
    }
  }
  raf = requestAnimationFrame(frame)

  /* ------------------------------------------------------------ open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      // knock, knock
      .to(state, { knock: 38, duration: 0.24, ease: 'power2.out' }, 0)
      .to(state, { knock: 0, duration: 0.12, ease: 'power3.in' }, 0.24)
      .fromTo(state, { shudder: 1 }, { shudder: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, 0.36)
      .to(state, { knock: 8, duration: 0.08, ease: 'power1.out' }, 0.36)
      .to(state, { knock: 0, duration: 0.08, ease: 'power1.in' }, 0.44)
      .to(state, { knock: 34, duration: 0.2, ease: 'power2.out' }, 0.62)
      .to(state, { knock: 0, duration: 0.11, ease: 'power3.in' }, 0.82)
      .fromTo(state, { shudder: 1 }, { shudder: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, 0.93)
      .to(state, { knock: 6, duration: 0.07, ease: 'power1.out' }, 0.93)
      .to(state, { knock: 0, duration: 0.08, ease: 'power1.in' }, 1.0)
      // the latch gives, light leaks, the door swings inward
      .to(state, { door: 7, duration: 0.28, ease: 'power2.out' }, 1.25)
      .to(state, { light: 0.35, duration: 0.3 }, 1.25)
      .to(state, { door: 82, duration: 1.25, ease: 'power2.inOut' }, 1.6)
      .to(state, { light: 1, duration: 1.0, ease: 'sine.inOut' }, 1.6)
      // walk through into the light
      .to(state, { dolly: 1, duration: 1.6, ease: 'power2.in' }, 2.3)
      .to(state, { flash: 0.85, duration: 0.35, ease: 'power1.in' }, 3.45)
      .to(state, { exposure: 0, duration: 1.0, ease: 'sine.inOut' }, 3.4)
      .to(state, { flash: 0, duration: 0.7, ease: 'power2.out' }, 3.8)
      .to(state, { plaqueIn: 1, duration: 0.8, ease: 'power3.out' }, 3.7)
      // the names are painted onto the plaque, then the glaze catches the sun
      .to(state, { reveal: 1, duration: 1.2, ease: 'power1.inOut' }, 3.95)
      .call(() => setCaption?.('date'), null, 4.5)
      .fromTo(state, { glint: -0.4 }, { glint: 1.4, duration: 0.9, ease: 'sine.inOut', immediateRender: false }, 4.9)
      // the sunlight settles into the page's whitewashed wall
      .call(() => setCaption?.(null), null, 5.75)
      .to(backdrop, { opacity: 1, duration: 0.9, ease: 'power1.inOut' }, 5.8)
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
