// Paints the Cappadocia valley as a layered gouache illustration onto two
// canvases: `back` sits behind the 3D balloons, `front` in front of them.
// The signature forms: tuff ridges folded like curtains (vertical erosion
// flutes), irregular cones rising out of the crests, Uçhisar castle, green
// orchards and poplars in the valley pockets, a flat plateau on the horizon.
// Light comes from a low dawn sun on the left.
import { seeded } from '../../shared/intro/core.js'

const HAZE = [247, 208, 182]

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgb = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`
const hex = (value) => {
  const n = parseInt(value.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

function noise1(seed) {
  const random = seeded(seed)
  const values = Array.from({ length: 512 }, () => random())
  return (x) => {
    const i = Math.floor(x)
    const f = x - i
    const t = f * f * (3 - 2 * f)
    return values[i & 511] + (values[(i + 1) & 511] - values[i & 511]) * t
  }
}

/* ------------------------------------------------------------ pieces */

// Irregular tuff cone: broad shoulders, slight bulge, leaning softened tip.
function conePath(ctx, { x, base, h, w, lean, bulge }) {
  const tipX = x + lean
  const tipY = base - h
  ctx.beginPath()
  ctx.moveTo(x - w / 2, base)
  ctx.bezierCurveTo(x - w * (0.42 + bulge), base - h * 0.35, tipX - w * 0.2, tipY + h * 0.3, tipX - w * 0.06, tipY + h * 0.06)
  ctx.quadraticCurveTo(tipX, tipY - h * 0.02, tipX + w * 0.07, tipY + h * 0.07)
  ctx.bezierCurveTo(tipX + w * 0.24, tipY + h * 0.34, x + w * (0.4 + bulge * 0.6), base - h * 0.3, x + w / 2, base)
  ctx.closePath()
}

function paintCone(ctx, cone, palette, random) {
  const { x, base, h, w } = cone
  conePath(ctx, cone)
  ctx.fillStyle = rgb(palette.mid)
  ctx.fill()
  ctx.save()
  conePath(ctx, cone)
  ctx.clip()
  const side = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
  side.addColorStop(0, rgb(palette.light, 0.9))
  side.addColorStop(0.45, rgb(palette.light, 0))
  side.addColorStop(0.62, rgb(palette.dark, 0.15))
  side.addColorStop(1, rgb(palette.dark, 0.75))
  ctx.fillStyle = side
  ctx.fillRect(x - w, base - h * 1.1, w * 2, h * 1.2)
  // flutes radiate down from the tip
  const flutes = Math.max(5, Math.round(w / 6))
  for (let i = 0; i < flutes; i += 1) {
    const u = (i + 0.5) / flutes
    const fx = x - w / 2 + u * w
    ctx.strokeStyle = u < 0.45 ? rgb(palette.light, 0.35) : rgb(palette.dark, 0.25)
    ctx.lineWidth = Math.max(0.7, w / flutes / 2.6)
    ctx.beginPath()
    ctx.moveTo(x + cone.lean + (fx - x) * 0.1, base - h * 0.9)
    ctx.quadraticCurveTo(fx + (random() - 0.5) * 3, base - h * 0.4, fx + (random() - 0.5) * 5, base + 2)
    ctx.stroke()
  }
  if (cone.cap) {
    // darker basalt crown on the tip
    ctx.fillStyle = rgb(palette.cap, 0.75)
    ctx.beginPath()
    ctx.ellipse(x + cone.lean, base - h * 0.95, w * 0.16, h * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  if (cone.doors) {
    for (let i = 0; i < cone.doors; i += 1) {
      const dw = Math.max(2.2, w * 0.05)
      const dx = x - w * 0.15 + random() * w * 0.3
      const dy = base - h * (0.2 + random() * 0.4)
      ctx.fillStyle = rgb(palette.hole, 0.8)
      ctx.beginPath()
      ctx.moveTo(dx, dy + dw * 1.5)
      ctx.lineTo(dx, dy + dw / 2)
      ctx.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0)
      ctx.lineTo(dx + dw, dy + dw * 1.5)
      ctx.fill()
    }
  }
  ctx.restore()
}

/**
 * A ridge wall folded like a curtain: a wavy crest, cones growing out of it,
 * and dense vertical flutes with alternating light and shadow.
 */
function curtainRidge(ctx, opts) {
  const { W, H, base, amp, palette, seed, cones = 0, coneH = [0, 0], dip = null, doors = 0 } = opts
  const random = seeded(seed)
  const n = noise1(seed)
  const n2 = noise1(seed + 5)
  const crest = (x) => {
    let y = base - amp * (0.6 * n(x / 140) + 0.4 * n2(x / 46))
    if (dip) y += dip.depth * Math.exp(-(((x - dip.x) / dip.width) ** 2))
    return y
  }

  // cones first, so the ridge body covers their feet
  const list = []
  for (let i = 0; i < cones; i += 1) {
    const x = random() * W
    const h = coneH[0] + random() * (coneH[1] - coneH[0])
    list.push({
      x,
      base: crest(x) + h * 0.25,
      h,
      w: h * (0.6 + random() * 0.8),
      lean: (random() - 0.5) * h * 0.22,
      bulge: random() * 0.14,
      cap: random() < 0.18,
      doors: random() < 0.5 ? Math.floor(random() * doors) : 0,
    })
  }
  list.sort((a, b) => a.h - b.h).forEach((c) => paintCone(ctx, c, palette, random))

  ctx.beginPath()
  ctx.moveTo(-10, H + 10)
  for (let x = -10; x <= W + 10; x += 4) ctx.lineTo(x, crest(x))
  ctx.lineTo(W + 10, H + 10)
  ctx.closePath()
  ctx.fillStyle = rgb(palette.mid)
  ctx.fill()

  ctx.save()
  ctx.clip()
  // curtain folds: each column lit by a slowly varying fold angle
  const fold = noise1(seed + 11)
  const step = Math.max(2, amp / 18)
  for (let x = -10; x <= W + 10; x += step) {
    const f = Math.sin(x / (step * 2.2) + fold(x / 30) * 6)
    const top = crest(x)
    const colour = f > 0 ? palette.light : palette.dark
    const alpha = Math.abs(f) * (f > 0 ? 0.42 : 0.3)
    const g = ctx.createLinearGradient(0, top, 0, top + amp * 2.2)
    g.addColorStop(0, rgb(colour, alpha))
    g.addColorStop(1, rgb(colour, alpha * 0.25))
    ctx.fillStyle = g
    ctx.fillRect(x, top, step + 0.5, amp * 2.4 + H)
  }
  // crest highlight and a warm shadow at the foot
  ctx.strokeStyle = rgb(palette.light, 0.7)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = -10; x <= W + 10; x += 4) {
    const y = crest(x) + 1
    if (x === -10) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  const foot = ctx.createLinearGradient(0, base, 0, base + amp * 2)
  foot.addColorStop(0, rgb(palette.dark, 0))
  foot.addColorStop(1, rgb(palette.dark, 0.35))
  ctx.fillStyle = foot
  ctx.fillRect(0, base, W, H)
  ctx.restore()
  return crest
}

function poplarCluster(ctx, cx, cy, count, scale, random) {
  for (let i = 0; i < count; i += 1) {
    const x = cx + (random() - 0.5) * 60 * scale
    const y = cy + (random() - 0.5) * 10 * scale
    const h = (14 + random() * 20) * scale
    const w = h * 0.24
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
    g.addColorStop(0, '#93a35b')
    g.addColorStop(0.5, '#62733a')
    g.addColorStop(1, '#3a4626')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(x, y - h)
    ctx.bezierCurveTo(x + w * 0.75, y - h * 0.7, x + w * 0.5, y - h * 0.1, x, y)
    ctx.bezierCurveTo(x - w * 0.5, y - h * 0.1, x - w * 0.75, y - h * 0.7, x, y - h)
    ctx.fill()
  }
}

function orchard(ctx, cx, cy, rx, ry, random) {
  ctx.fillStyle = 'rgba(104,122,62,0.55)'
  ctx.beginPath()
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  // tree dots
  for (let i = 0; i < (rx * ry) / 40; i += 1) {
    const a = random() * Math.PI * 2
    const r = Math.sqrt(random())
    ctx.fillStyle = random() > 0.5 ? 'rgba(70,88,44,0.8)' : 'rgba(132,150,84,0.75)'
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r, 1.6 + random() * 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

function uchisar(ctx, x, base, h, w, palette) {
  const random = seeded(71)
  const path = () => {
    ctx.beginPath()
    ctx.moveTo(x - w / 2, base)
    ctx.bezierCurveTo(x - w * 0.46, base - h * 0.42, x - w * 0.34, base - h * 0.74, x - w * 0.18, base - h * 0.84)
    for (let i = 0; i <= 10; i += 1) {
      ctx.lineTo(x - w * 0.18 + (i / 10) * w * 0.36, base - h * (0.86 + (i % 2 ? 0.1 : 0.02) + Math.sin(i * 1.9) * 0.035))
    }
    ctx.bezierCurveTo(x + w * 0.3, base - h * 0.74, x + w * 0.44, base - h * 0.42, x + w / 2, base)
    ctx.closePath()
  }
  path()
  ctx.fillStyle = rgb(palette.mid)
  ctx.fill()
  ctx.save()
  path()
  ctx.clip()
  const side = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0)
  side.addColorStop(0, rgb(palette.light, 0.85))
  side.addColorStop(0.5, rgb(palette.light, 0))
  side.addColorStop(1, rgb(palette.dark, 0.6))
  ctx.fillStyle = side
  ctx.fillRect(x - w, base - h * 1.2, w * 2, h * 1.3)
  for (let i = 0; i < 70; i += 1) {
    const dx = x - w * 0.34 + random() * w * 0.68
    const dy = base - h * (0.08 + random() * 0.74)
    const dw = Math.max(1.8, w * 0.018 + random() * w * 0.012)
    ctx.fillStyle = rgb(palette.hole, 0.55 + random() * 0.3)
    ctx.beginPath()
    ctx.moveTo(dx, dy + dw * 1.4)
    ctx.lineTo(dx, dy + dw / 2)
    ctx.arc(dx + dw / 2, dy + dw / 2, dw / 2, Math.PI, 0)
    ctx.lineTo(dx + dw, dy + dw * 1.4)
    ctx.fill()
  }
  ctx.restore()
}

function grain(ctx, W, H, seed, amount) {
  const random = seeded(seed)
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  for (let i = 0; i < (W * H) / 70; i += 1) {
    ctx.fillStyle = random() > 0.5 ? `rgba(255,248,240,${amount})` : `rgba(70,36,26,${amount})`
    ctx.fillRect(random() * W, random() * H, 1, 1)
  }
  ctx.restore()
}

// Palettes from far (hazy, pale) to near (warm, contrasty).
function palette(depth) {
  const haze = 1 - depth
  const at = (c) => mix(hex(c), HAZE, haze * 0.7)
  return {
    light: at('#fff3e6'),
    mid: at(depth > 0.7 ? '#e5b497' : '#ecc6ad'),
    dark: at('#9a5d47'),
    cap: at('#6d5248'),
    hole: at('#5e3326'),
  }
}

/** Paints both layers; returns the horizon y. */
export function paintLandscape(back, front, { width: W, height: H, dpr = 1 }) {
  const portrait = W / H < 0.9
  const s = Math.min(1.5, Math.max(0.7, Math.min(W, H * 1.6) / 1100))
  for (const canvas of [back, front]) {
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
  }
  const b = back.getContext('2d')
  const f = front.getContext('2d')
  b.setTransform(dpr, 0, 0, dpr, 0, 0)
  f.setTransform(dpr, 0, 0, dpr, 0, 0)
  b.clearRect(0, 0, W, H)
  f.clearRect(0, 0, W, H)
  const random = seeded(3)
  const horizon = H * (portrait ? 0.6 : 0.57)

  // far plateau: a long flat mesa
  b.fillStyle = rgb(mix(hex('#efcdb9'), HAZE, 0.55))
  b.beginPath()
  b.moveTo(0, H)
  for (let x = 0; x <= W; x += 16) b.lineTo(x, horizon - 3 - Math.sin(x * 0.003) * 3)
  b.lineTo(W, H)
  b.fill()

  curtainRidge(b, { W, H, base: horizon + H * 0.035, amp: H * 0.03, palette: palette(0.15), seed: 4, cones: Math.round(26 * s), coneH: [10 * s, 24 * s] })
  uchisar(b, W * (portrait ? 0.18 : 0.14), horizon + H * 0.085, H * (portrait ? 0.15 : 0.19), Math.max(W * 0.16, 150 * s), palette(0.35))
  curtainRidge(b, { W, H, base: horizon + H * 0.09, amp: H * 0.045, palette: palette(0.35), seed: 9, cones: Math.round(18 * s), coneH: [18 * s, 40 * s], doors: 2 })

  // valley pocket: orchards and poplars
  const floorY = horizon + H * 0.15
  b.fillStyle = rgb(mix(hex('#c9b27e'), HAZE, 0.3))
  b.fillRect(0, floorY - 4, W, H)
  for (let i = 0; i < 7; i += 1) orchard(b, random() * W, floorY + 8 + random() * H * 0.05, (40 + random() * 70) * s, (6 + random() * 8) * s, random)
  for (let i = 0; i < 9; i += 1) poplarCluster(b, random() * W, floorY + 6 + random() * H * 0.05, 3 + Math.floor(random() * 6), s * 0.85, random)

  // FRONT: near ridges frame the valley, lower in the middle so the names breathe
  curtainRidge(f, {
    W,
    H,
    base: horizon + H * 0.2,
    amp: H * 0.08,
    palette: palette(0.62),
    seed: 15,
    cones: Math.round(10 * s),
    coneH: [40 * s, 80 * s],
    doors: 3,
    dip: { x: W / 2, width: W * 0.18, depth: H * 0.05 },
  })
  for (let i = 0; i < 5; i += 1) poplarCluster(f, random() * W, horizon + H * 0.3 + random() * H * 0.04, 3 + Math.floor(random() * 5), s * 1.15, random)
  curtainRidge(f, {
    W,
    H,
    base: H * 0.9,
    amp: H * 0.09,
    palette: palette(1),
    seed: 21,
    cones: portrait ? 3 : 5,
    coneH: [110 * s, 190 * s],
    doors: 4,
    dip: { x: W / 2, width: W * 0.24, depth: H * 0.09 },
  })

  grain(b, W, H, 7, 0.05)
  grain(f, W, H, 8, 0.06)
  return horizon
}
