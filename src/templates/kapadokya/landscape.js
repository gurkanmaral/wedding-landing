// Paints the Cappadocia valley as a flat, layered vector illustration: a
// turquoise-to-peach dawn sky with wisps of cloud, soft green mountains and
// striped fields, a sandy road winding out of the valley, clusters of
// rounded fairy chimneys with basalt caps, and a carved rock massif with cave
// dwellings in the foreground. Three canvases: `sky` (optional, opaque),
// `back` behind the 3D balloons and `front` in front of them, which only
// holds rock hugging the frame edges.
import { seeded } from '../../shared/intro/core.js'

const HAZE = [226, 236, 226]

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgb = ([r, g, b], a = 1) => `rgba(${r},${g},${b},${a})`
const hex = (value) => {
  const n = parseInt(value.slice(1), 16)
  return [n >> 16, (n >> 8) & 255, n & 255]
}

function prepare(canvas, W, H, dpr) {
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  return ctx
}

/* ---------------------------------------------------------------- sky */

// A flat wisp of cloud: a long rounded bar with a couple of bumps on top.
function wisp(ctx, x, y, w, random) {
  const h = w * 0.07
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.beginPath()
  ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2)
  ctx.fill()
  const bumps = 1 + Math.floor(random() * 3)
  for (let i = 0; i < bumps; i += 1) {
    const r = h * (0.9 + random() * 0.9)
    ctx.beginPath()
    ctx.arc(x - w * 0.25 + random() * w * 0.4, y - h * 0.2, r, Math.PI, 0)
    ctx.fill()
  }
}

/** Opaque sky: a soft turquoise-to-peach dawn with flat wisps of cloud. */
export function paintSky(canvas, { width: W, height: H, dpr = 1, horizon = H * 0.6 }) {
  const ctx = prepare(canvas, W, H, dpr)
  const g = ctx.createLinearGradient(0, 0, 0, horizon)
  g.addColorStop(0, '#62cfe6')
  g.addColorStop(0.5, '#a9e2e4')
  g.addColorStop(0.85, '#f1e6cc')
  g.addColorStop(1, '#f8dfc0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  const s = Math.min(W, H * 1.4) / 1000
  const random = seeded(12)
  // wisps sit low in the sky and leave the column behind the names open
  for (let i = 0; i < 9; i += 1) {
    const x = random() * W
    if (Math.abs(x / W - 0.5) < 0.14) continue
    wisp(ctx, x, horizon * (0.45 + random() * 0.45), (90 + random() * 120) * s, random)
  }
}

/* ----------------------------------------------------------- terrain */

// Flat illustration palette: pale tuff in three tones, valley greens and the
// sandy road. Distant pieces are pulled towards the sky haze.
const ROCK = { lit: hex('#ece3d8'), mid: hex('#d6c9bb'), shade: hex('#b3a396'), cave: hex('#7f6e65'), cap: hex('#9c8576') }
const GREENS = [hex('#a8cf9c'), hex('#86bb7e'), hex('#6fa86b'), hex('#5b955d'), hex('#4c8752')]
const ROAD = hex('#ecd8ad')
const ROAD_EDGE = hex('#d2b787')

const tone = (c, haze) => rgb(mix(c, HAZE, haze))

// A wobbly line between two points, for hand-drawn edges.
function wobble(points, amount, random) {
  return points.map(([x, y], i) => (i === 0 || i === points.length - 1 ? [x, y] : [x + (random() - 0.5) * amount, y + (random() - 0.5) * amount * 0.5]))
}

function poly(ctx, points) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

/**
 * One fairy chimney: a broad cone with a rounded tip, its right flank in a
 * flat shadow with a jagged edge, faint vertical grooves, sometimes a darker
 * basalt cap and a few carved windows.
 */
function chimney(ctx, { x, base, h, w, lean = 0, cap = false, caves = 0, haze = 0 }, random) {
  const tipX = x + lean
  const tipY = base - h
  const steps = 18
  const left = []
  const right = []
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    // broad body that tapers into a blunt, rounded tip
    const half = (w / 2) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 1.8))) * (1 - 0.5 * t)
    const y = base - h * t
    const cx = x + lean * t
    left.push([cx - half, y])
    right.unshift([cx + half, y])
  }
  // cast shadow: the sun is up and to the left, so it falls to the right
  // across the ground as a long, soft, flattened shape
  ctx.save()
  ctx.translate(x + w * 0.25 + h * 0.28, base - h * 0.01)
  ctx.rotate(0.06)
  const shade = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.5 + h * 0.42)
  shade.addColorStop(0, `rgba(38,66,44,${0.42 * (1 - haze)})`)
  shade.addColorStop(1, 'rgba(38,66,44,0)')
  ctx.fillStyle = shade
  ctx.scale(1, 0.16)
  ctx.beginPath()
  ctx.arc(0, 0, w * 0.5 + h * 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // keep the rounded tip clean: wobble only the flanks
  const outline = [...left, ...right].map(([px, py], i, all) => {
    const t = (base - py) / h
    return i === 0 || i === all.length - 1 || t > 0.8 ? [px, py] : [px + (random() - 0.5) * w * 0.04, py]
  })
  poly(ctx, outline)
  ctx.fillStyle = tone(ROCK.lit, haze)
  ctx.fill()

  // flat shadow on the right flank
  ctx.save()
  poly(ctx, outline)
  ctx.clip()
  const shadow = [[tipX + w * 0.02, tipY]]
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 5
    shadow.push([x + lean * (1 - t) + w * (0.08 + random() * 0.08) * t, tipY + h * t])
  }
  shadow.push([x + w, base + 2], [x + w, tipY])
  poly(ctx, shadow)
  ctx.fillStyle = tone(ROCK.shade, haze)
  ctx.fill()
  // a mid tone band between light and shadow
  ctx.fillStyle = tone(ROCK.mid, haze)
  ctx.globalAlpha = 0.8
  poly(ctx, [[tipX - w * 0.04, tipY + h * 0.1], ...shadow.slice(1, 6).map(([sx, sy]) => [sx - w * 0.1, sy]), ...shadow.slice(1, 6).reverse()])
  ctx.fill()
  ctx.globalAlpha = 1
  // grooves
  ctx.strokeStyle = tone(ROCK.shade, haze)
  ctx.lineWidth = Math.max(1, w * 0.012)
  for (let i = 0; i < 3; i += 1) {
    const gx = x - w * (0.1 + random() * 0.25)
    ctx.beginPath()
    ctx.moveTo(gx + lean * 0.4, base - h * (0.35 + random() * 0.3))
    ctx.lineTo(gx - w * 0.03, base - h * 0.05)
    ctx.stroke()
  }
  for (let i = 0; i < caves; i += 1) {
    const cw = Math.max(3, w * (0.09 + random() * 0.05))
    const ch = cw * (1.2 + random() * 0.5)
    const cx = x - w * 0.15 + random() * w * 0.25
    const cy = base - h * (0.18 + random() * 0.4)
    ctx.fillStyle = tone(ROCK.cave, haze)
    ctx.beginPath()
    ctx.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, cw * 0.4)
    ctx.fill()
  }
  ctx.restore()

  if (cap) {
    // the darker hard-rock cap the chimney was eroded under
    const cw = w * 0.42
    const ch = h * 0.07
    const cy = tipY + h * 0.02
    ctx.fillStyle = tone(ROCK.cap, haze)
    poly(ctx, wobble([[tipX - cw / 2, cy + ch * 0.4], [tipX - cw * 0.35, cy - ch * 0.5], [tipX + cw * 0.3, cy - ch * 0.6], [tipX + cw / 2, cy + ch * 0.2], [tipX + cw * 0.1, cy + ch * 0.7]], cw * 0.08, random))
    ctx.fill()
  }
}

// A cluster of chimneys, tallest in the middle, drawn back to front.
function cluster(ctx, { x, base, h, count, spread, haze = 0, caps = 0.3, caves = 0 }, random) {
  const items = []
  for (let i = 0; i < count; i += 1) {
    const u = count === 1 ? 0.5 : i / (count - 1)
    const hh = h * (0.45 + 0.55 * Math.sin(u * Math.PI) ** 0.7) * (0.8 + random() * 0.35)
    items.push({
      x: x + (u - 0.5) * spread + (random() - 0.5) * spread * 0.15,
      base: base + random() * h * 0.06,
      h: hh,
      w: hh * (0.58 + random() * 0.2),
      lean: (random() - 0.5) * hh * 0.08,
      cap: random() < caps,
      caves: caves ? Math.floor(random() * (caves + 1)) : 0,
      haze,
    })
  }
  items.sort((a, b) => a.base - b.base).forEach((c) => chimney(ctx, c, random))
}

/**
 * A big carved rock massif rising from a frame edge: several merged rounded
 * peaks with flat shadow facets, horizontal strata and cave dwellings with
 * windows and arched doors.
 */
function massif(ctx, { x0, x1, base, top, side, haze = 0 }, random) {
  const w = x1 - x0
  const peaks = 3
  for (let p = 0; p < peaks; p += 1) {
    // outer peak is tallest, the others step down towards the valley
    const k = side === 'left' ? p : peaks - 1 - p
    const cx = x0 + w * (0.2 + (p / (peaks - 1)) * 0.6)
    const ph = (base - top) * (1 - k * 0.24) * (0.9 + random() * 0.15)
    const pw = w * (0.55 - k * 0.06)
    chimney(ctx, { x: cx, base: base + 4, h: ph, w: pw, lean: (side === 'left' ? 1 : -1) * pw * 0.05, caves: 0, haze }, random)
    // carved dwellings on the lit face
    ctx.fillStyle = tone(ROCK.cave, haze)
    const rows = 2 + Math.floor(random() * 2)
    for (let r = 0; r < rows; r += 1) {
      const y = base - ph * (0.18 + r * 0.2)
      const n = 1 + Math.floor(random() * 3)
      for (let i = 0; i < n; i += 1) {
        const ww = pw * (0.06 + random() * 0.04)
        const wh = ww * (1.1 + random() * 0.5)
        const wx = cx - pw * 0.28 + i * pw * 0.14 + (random() - 0.5) * pw * 0.04
        ctx.beginPath()
        ctx.roundRect(wx, y - wh, ww, wh, ww * 0.35)
        ctx.fill()
      }
    }
    // an arched door at the foot
    const dw = pw * 0.09
    const dx = cx - pw * 0.12
    ctx.beginPath()
    ctx.moveTo(dx, base)
    ctx.lineTo(dx, base - dw * 1.2)
    ctx.arc(dx + dw / 2, base - dw * 1.2, dw / 2, Math.PI, 0)
    ctx.lineTo(dx + dw, base)
    ctx.fill()
  }
}

// Rolling green fields in bands, each with faint furrow lines.
function fields(ctx, W, H, top, random) {
  const bands = 7
  for (let i = 0; i < bands; i += 1) {
    const t = i / bands
    const y = top + (H - top) * t * t * 1.1
    const amp = (H - top) * 0.03 * (0.4 + t)
    const color = GREENS[Math.min(GREENS.length - 1, Math.floor(t * GREENS.length + (i % 2) * 0.6))]
    const pts = [[-10, H + 10]]
    const phase = random() * 6
    for (let x = -10; x <= W + 10; x += 24) pts.push([x, y - amp * Math.sin(x / (W * 0.18) + phase) - amp * 0.5 * Math.sin(x / (W * 0.07) + phase * 2)])
    pts.push([W + 10, H + 10])
    poly(ctx, pts)
    ctx.fillStyle = tone(color, Math.max(0, 0.35 - t * 0.5))
    ctx.fill()
    // furrows follow the band's top edge
    ctx.save()
    poly(ctx, pts)
    ctx.clip()
    ctx.strokeStyle = rgb(mix(color, [255, 255, 255], 0.22), 0.5)
    ctx.lineWidth = 1 + t
    for (let k = 1; k < 4; k += 1) {
      ctx.beginPath()
      for (let x = -10; x <= W + 10; x += 24) {
        const yy = y + k * (6 + t * 14) - amp * Math.sin(x / (W * 0.18) + phase) - amp * 0.5 * Math.sin(x / (W * 0.07) + phase * 2)
        if (x === -10) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
    ctx.restore()
  }
}

// The sandy road winding from the horizon to the bottom of the frame.
function road(ctx, W, H, top, portrait) {
  const x0 = W * (portrait ? 0.56 : 0.54)
  const path = (widen) => {
    ctx.beginPath()
    ctx.moveTo(x0 - 3 - widen, top)
    ctx.bezierCurveTo(W * 0.3 - widen * 3, top + (H - top) * 0.35, W * 0.62 - widen * 6, top + (H - top) * 0.6, W * (portrait ? 0.2 : 0.38) - widen * 20, H + 2)
    ctx.lineTo(W * (portrait ? 0.46 : 0.5) + widen * 20, H + 2)
    ctx.bezierCurveTo(W * 0.7 + widen * 6, top + (H - top) * 0.6, W * 0.33 + widen * 3, top + (H - top) * 0.35, x0 + 3 + widen, top)
    ctx.closePath()
  }
  path(1.5)
  ctx.fillStyle = rgb(ROAD_EDGE)
  ctx.fill()
  path(0)
  ctx.fillStyle = rgb(ROAD)
  ctx.fill()
}

function poplar(ctx, x, y, h) {
  const w = h * 0.24
  ctx.fillStyle = rgb(GREENS[4])
  ctx.beginPath()
  ctx.moveTo(x, y - h)
  ctx.bezierCurveTo(x + w * 0.8, y - h * 0.7, x + w * 0.5, y - h * 0.05, x, y)
  ctx.bezierCurveTo(x - w * 0.5, y - h * 0.05, x - w * 0.8, y - h * 0.7, x, y - h)
  ctx.fill()
  ctx.fillStyle = rgb(GREENS[1], 0.7)
  ctx.beginPath()
  ctx.moveTo(x, y - h)
  ctx.bezierCurveTo(x - w * 0.8, y - h * 0.7, x - w * 0.5, y - h * 0.05, x, y)
  ctx.closePath()
  ctx.fill()
}

/** Paints the terrain layers (and the sky when a canvas is given); returns the horizon y. */
export function paintLandscape(back, front, { width: W, height: H, dpr = 1, sky = null }) {
  const portrait = W / H < 0.9
  const s = Math.min(1.5, Math.max(0.55, Math.min(W, H * 1.6) / 1100))
  const horizon = H * (portrait ? 0.62 : 0.6)
  if (sky) paintSky(sky, { width: W, height: H, dpr, horizon })
  const random = seeded(3)

  // BACK: distant mountains, the valley, the road and the chimney clusters
  const b = prepare(back, W, H, dpr)
  ;[
    { y: horizon - H * 0.07, c: hex('#9fb8c9'), haze: 0.2, f: 0.0045 },
    { y: horizon - H * 0.035, c: hex('#8dbf92'), haze: 0.35, f: 0.008 },
  ].forEach((m, i) => {
    const pts = [[-10, horizon + 4]]
    for (let x = -10; x <= W + 10; x += 16) {
      const ridge = Math.abs(Math.sin(x * m.f + i * 2)) * 0.6 + Math.abs(Math.sin(x * m.f * 2.3 + i)) * 0.4
      pts.push([x, m.y + (1 - ridge) * H * 0.035])
    }
    pts.push([W + 10, horizon + 4])
    poly(b, pts)
    b.fillStyle = tone(m.c, m.haze)
    b.fill()
  })
  fields(b, W, H, horizon, random)
  road(b, W, H, horizon + H * 0.01, portrait)

  // chimney clusters walking towards us, kept clear of the column behind the names
  const clusters = portrait
    ? [
        { x: 0.12, at: 0.05, h: 0.08, n: 4 },
        { x: 0.86, at: 0.06, h: 0.09, n: 5 },
        { x: 0.28, at: 0.12, h: 0.12, n: 3 },
        { x: 0.82, at: 0.2, h: 0.17, n: 4, caves: 2 },
      ]
    : [
        { x: 0.1, at: 0.04, h: 0.07, n: 5 },
        { x: 0.33, at: 0.05, h: 0.08, n: 4 },
        { x: 0.68, at: 0.045, h: 0.075, n: 6 },
        { x: 0.88, at: 0.06, h: 0.09, n: 4 },
        { x: 0.38, at: 0.13, h: 0.13, n: 3 },
        { x: 0.75, at: 0.18, h: 0.19, n: 5, caves: 2 },
      ]
  clusters.forEach((c) =>
    cluster(b, { x: W * c.x, base: horizon + H * c.at, h: H * c.h, count: c.n, spread: H * c.h * (0.45 + c.n * 0.12), haze: Math.max(0, 0.3 - c.at * 1.5), caves: c.caves ?? 0 }, random),
  )
  for (let i = 0; i < 14; i += 1) {
    const x = random() * W
    if (Math.abs(x / W - 0.5) < 0.12) continue
    poplar(b, x, horizon + H * (0.08 + random() * 0.14), (10 + random() * 12) * s)
  }

  // FRONT (in front of the balloons): carved massifs hugging both frame edges
  const f = prepare(front, W, H, dpr)
  massif(f, { x0: -W * 0.04, x1: W * (portrait ? 0.34 : 0.22), base: H + 4, top: horizon + H * (portrait ? 0.14 : -0.1), side: 'left' }, random)
  massif(f, { x0: W * (portrait ? 0.72 : 0.8), x1: W * 1.04, base: H + 4, top: horizon + H * (portrait ? 0.2 : 0.06), side: 'right' }, random)
  return horizon
}
