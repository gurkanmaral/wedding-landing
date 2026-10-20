// Autumn Falls — "Catch the leaf". A large 3D maple leaf tumbles over a painted
// gouache backdrop (2D canvas: amber washes, blurred foliage, bokeh). Tapping catches it:
// the leaf turns face-on and comes close, an ember edge sweeps across it and
// burns the couple's names into the surface, then a gust of leaves carries it
// (and the camera) away into the cream page.
import { gsap } from 'gsap'
import { createStage, makeCanvas, canvasTexture, seeded } from '../core.js'

export const fonts = () => [{ family: 'Marcellus', google: 'Marcellus' }]

export const copy = {
  en: { prompt: 'Catch the leaf' },
  tr: { prompt: 'Yaprağı yakala' },
}

/* ------------------------------------------------------------------ outline */
// A palmate, five-lobed maple outline in polar form around the petiole junction
// (origin). Angles are measured from +y, clockwise. [angle, amplitude, width]
const LOBES = [
  [0, 0.44, 0.48],
  [0.95, 0.42, 0.48],
  [-0.95, 0.42, 0.48],
  [1.95, 0.2, 0.42],
  [-1.95, 0.2, 0.42],
]
const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}
const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a))

function leafRadius(th) {
  // solid blade, narrowing into the notch around the stem
  const base = 0.56 - 0.42 * smooth(2.25, Math.PI, Math.abs(th))
  let lobe = 0
  let teeth = 0
  for (const [c, amp, w] of LOBES) {
    const d = Math.abs(wrapAngle(th - c))
    lobe = Math.max(lobe, amp * (0.86 * (1 - smooth(0, w, d)) + 0.14 * Math.exp(-d / 0.045)))
    // the two secondary points on each side of every lobe
    teeth += amp * (0.2 * Math.exp(-Math.abs(d - 0.5 * w) / 0.03) + 0.1 * Math.exp(-Math.abs(d - 0.82 * w) / 0.025))
  }
  const r = base + lobe + teeth
  // fine serration along the outer margin only
  return r + 0.014 * Math.abs(Math.sin(th * 44)) ** 3 * smooth(0.62, 0.8, r)
}

function buildOutline(count) {
  const points = []
  for (let j = 0; j < count; j += 1) {
    const th = Math.PI - (2 * Math.PI * j) / count // counter-clockwise from the stem
    const r = leafRadius(th)
    points.push([r * Math.sin(th), r * Math.cos(th)])
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  points.forEach(([x, y]) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  })
  const box = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY }
  box.S = Math.max(box.w, box.h) * 1.06
  return { points, box }
}

const LEAF_CY = 0.36 // visual centre of the blade, used as the tumbling pivot

/* ----------------------------------------------------------------- textures */
const PALETTES = {
  hero: { stops: ['#f7c63f', '#ef8b2a', '#d3441c', '#9a2213'], edge: '#5e160a', vein: 'rgba(255,226,160,0.6)' },
  crimson: { stops: ['#e8692b', '#cb3a1b', '#a42416', '#6c150c'], edge: '#4a0f07', vein: 'rgba(255,200,150,0.45)' },
  amber: { stops: ['#f5b53a', '#ea8b26', '#cf5a1c', '#8d3112'], edge: '#5a1e0a', vein: 'rgba(255,232,170,0.5)' },
  gold: { stops: ['#f8da5c', '#f0b83a', '#da8c25', '#a65a17'], edge: '#6e3a10', vein: 'rgba(255,244,196,0.55)' },
}

function tracePath(ctx, pts) {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

// Draws one tapering, slightly curved vein in a handful of segments.
function vein(ctx, x0, y0, x1, y1, w0, w1, bend, color) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend
  const my = (y0 + y1) / 2 + (x1 - x0) * bend
  const steps = 10
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  let px = x0
  let py = y0
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps
    const a = (1 - t) * (1 - t)
    const b = 2 * (1 - t) * t
    const c = t * t
    const x = a * x0 + b * mx + c * x1
    const y = a * y0 + b * my + c * y1
    ctx.lineWidth = w0 + (w1 - w0) * t
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(x, y)
    ctx.stroke()
    px = x
    py = y
  }
}

// Palmate venation: primaries to every lobe tip, secondaries to the teeth,
// and a faint tertiary mesh.
function paintVeins(ctx, map, scale, light, dark, random) {
  const { toPx, unit } = map
  const [ox, oy] = toPx(0, 0)
  const primaries = LOBES.map(([c]) => c).concat([2.65, -2.65])
  const lines = []
  primaries.forEach((c, index) => {
    const r = (index > 4 ? 0.42 : leafRadius(c)) * 0.97
    const [tx, ty] = toPx(r * Math.sin(c), r * Math.cos(c))
    const w0 = (index === 0 ? 9 : index < 3 ? 8 : 5.5) * scale
    lines.push([ox, oy, tx, ty, w0, 1.2 * scale, (index % 2 ? 0.03 : -0.03)])
    if (index > 4) return
    for (let k = 1; k <= 6; k += 1) {
      const t = 0.12 + k * 0.125
      const sx = ox + (tx - ox) * t
      const sy = oy + (ty - oy) * t
      ;[-1, 1].forEach((side) => {
        const a = c + side * (0.62 + random() * 0.18)
        const len = unit * r * (0.42 - t * 0.24) * (0.85 + random() * 0.3)
        const ex = sx + Math.sin(a) * len
        const ey = sy - Math.cos(a) * len
        lines.push([sx, sy, ex, ey, w0 * 0.42 * (1 - t * 0.5), 0.6 * scale, side * 0.12])
      })
    }
  })
  if (dark) {
    ctx.save()
    ctx.translate(1.6 * scale, 1.6 * scale)
    lines.forEach((l) => vein(ctx, l[0], l[1], l[2], l[3], l[4] * 1.1, l[5], l[6], dark))
    ctx.restore()
  }
  lines.forEach((l) => vein(ctx, l[0], l[1], l[2], l[3], l[4], l[5], l[6], light))
  // tertiary areoles
  ctx.lineWidth = 0.8 * scale
  ctx.strokeStyle = light
  ctx.globalAlpha = 0.18
  for (let i = 0; i < 520; i += 1) {
    const x = random() * map.size
    const y = random() * map.size
    const a = random() * Math.PI * 2
    const l = (6 + random() * 14) * scale
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function makeMap(size, box) {
  const unit = size / box.S
  const toPx = (x, y) => [((x - box.cx) / box.S + 0.5) * size, (0.5 - (y - box.cy) / box.S) * size]
  return { size, unit, toPx }
}

function grain(ctx, size, amount, random) {
  const image = ctx.getImageData(0, 0, size, size)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * amount
    data[i] += n
    data[i + 1] += n * 0.8
    data[i + 2] += n * 0.6
  }
  ctx.putImageData(image, 0, 0)
}

function paintLeaf(size, outline, box, palette, seed) {
  const random = seeded(seed)
  const map = makeMap(size, box)
  const pts = outline.map(([x, y]) => map.toPx(x, y))
  const s = size / 1024
  const [canvas, ctx] = makeCanvas(size, size)
  ctx.fillStyle = palette.stops[3]
  ctx.fillRect(0, 0, size, size)
  ctx.save()
  tracePath(ctx, pts)
  ctx.clip()

  const [ox, oy] = map.toPx(0, 0.05)
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, map.unit * 1.02)
  g.addColorStop(0, palette.stops[0])
  g.addColorStop(0.34, palette.stops[1])
  g.addColorStop(0.7, palette.stops[2])
  g.addColorStop(1, palette.stops[3])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)

  // mottled pigment: autumn colour never turns evenly
  const blotch = ['rgba(255,200,70,', 'rgba(200,60,25,', 'rgba(150,30,15,', 'rgba(255,150,50,']
  for (let i = 0; i < 280; i += 1) {
    const x = random() * size
    const y = random() * size
    const r = (8 + random() * 70) * s
    const bg = ctx.createRadialGradient(x, y, 0, x, y, r)
    const c = blotch[i % blotch.length]
    bg.addColorStop(0, `${c}${0.05 + random() * 0.12})`)
    bg.addColorStop(1, `${c}0)`)
    ctx.fillStyle = bg
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  // a few tar spots with paler halos
  for (let i = 0; i < 9; i += 1) {
    const x = size * (0.25 + random() * 0.5)
    const y = size * (0.2 + random() * 0.5)
    const r = (3 + random() * 7) * s
    const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6)
    halo.addColorStop(0, 'rgba(60,18,6,0.55)')
    halo.addColorStop(0.38, 'rgba(60,18,6,0.4)')
    halo.addColorStop(0.45, 'rgba(255,214,120,0.25)')
    halo.addColorStop(1, 'rgba(255,214,120,0)')
    ctx.fillStyle = halo
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6)
  }

  paintVeins(ctx, map, s, palette.vein, 'rgba(70,16,4,0.28)', random)

  // dried, browned lobe tips
  LOBES.forEach(([c]) => {
    const r = leafRadius(c)
    const [tx, ty] = map.toPx(r * Math.sin(c), r * Math.cos(c))
    const tip = ctx.createRadialGradient(tx, ty, 0, tx, ty, map.unit * 0.16)
    tip.addColorStop(0, 'rgba(92,34,10,0.5)')
    tip.addColorStop(1, 'rgba(92,34,10,0)')
    ctx.fillStyle = tip
    ctx.fillRect(tx - map.unit * 0.2, ty - map.unit * 0.2, map.unit * 0.4, map.unit * 0.4)
  })
  // darker margin
  ctx.shadowColor = palette.edge
  ctx.shadowBlur = 18 * s
  ctx.lineWidth = 10 * s
  ctx.strokeStyle = palette.edge
  ctx.globalAlpha = 0.55
  tracePath(ctx, pts)
  ctx.stroke()
  ctx.restore()
  grain(ctx, size, 16, random)

  // bump map: raised veins on a soft cellular surface
  const bs = Math.min(size, 512)
  const bumpMap = makeMap(bs, box)
  const [bump, bctx] = makeCanvas(bs, bs)
  bctx.fillStyle = '#808080'
  bctx.fillRect(0, 0, bs, bs)
  paintVeins(bctx, bumpMap, bs / 1024, 'rgba(235,235,235,0.9)', null, seeded(seed + 3))
  grain(bctx, bs, 26, random)
  return { canvas, bump }
}

// Names in the leaf's own UV space: R = crisp letters, G = blurred halo.
function paintNames(size, box, couple) {
  const map = makeMap(size, box)
  const [canvas, ctx] = makeCanvas(size, size)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, size, size)
  const family = '"Marcellus", "Cormorant Garamond", Georgia, serif'
  let fs = map.unit * 0.17
  ctx.font = `${fs}px ${family}`
  const widest = Math.max(...couple.map((n) => ctx.measureText(n).width), 1)
  fs = Math.min(fs, (fs * map.unit * 0.74) / widest)
  const gap = Math.max(fs * 1.12, map.unit * 0.15)
  const cy = 0.2
  const lines = [
    [couple[0], fs, cy + gap / map.unit],
    ['&', fs * 0.62, cy],
    [couple[1], fs, cy - gap / map.unit],
  ]
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const draw = (color, blur) => {
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    lines.forEach(([text, size_, y]) => {
      ctx.font = `${size_}px ${family}`
      const [x, py] = map.toPx(0, y)
      ctx.fillText(text, x, py)
    })
  }
  draw('#00ff00', fs * 0.22)
  draw('#00ff00', fs * 0.1)
  ctx.globalCompositeOperation = 'lighter'
  draw('#ff0000', 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowBlur = 0
  return canvas
}

/* ---------------------------------------------------- painted 2D backdrop */
// The environment is illustrated, not rendered: a gouache amber wash with
// blurred foliage, painted once into a canvas behind the WebGL leaves.
function softShape(ctx, draw, color, blur) {
  // shadow trick: draw far off-canvas and keep only the blurred shadow
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = 20000
  ctx.fillStyle = color
  ctx.translate(-20000, 0)
  draw()
  ctx.fill()
  ctx.restore()
}

function leafPath(ctx, outline, box, x, y, size, rot) {
  const k = size / box.S
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  ctx.beginPath()
  outline.forEach(([px, py], i) => {
    if (i % 4) return
    const ax = (px - box.cx) * k
    const ay = -(py - box.cy) * k
    const X = x + ax * c - ay * s
    const Y = y + ax * s + ay * c
    if (i === 0) ctx.moveTo(X, Y)
    else ctx.lineTo(X, Y)
  })
  ctx.closePath()
}

function paintBackdrop(canvas, w, h, outline, box) {
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const random = seeded(19)
  const diag = Math.hypot(w, h)
  const base = ctx.createRadialGradient(w * 0.42, h * 0.36, 0, w * 0.5, h * 0.45, diag * 0.62)
  base.addColorStop(0, '#fcebcb')
  base.addColorStop(0.32, '#f5cf92')
  base.addColorStop(0.62, '#e9a35c')
  base.addColorStop(0.86, '#cf7737')
  base.addColorStop(1, '#a9502a')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // layered gouache washes
  const washes = ['rgba(214,98,40,', 'rgba(246,178,86,', 'rgba(176,64,34,', 'rgba(255,226,170,', 'rgba(196,120,60,']
  for (let i = 0; i < 40; i += 1) {
    const x = random() * w
    const y = random() * h
    const r = diag * (0.06 + random() * 0.2)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const c = washes[i % washes.length]
    g.addColorStop(0, `${c}${0.05 + random() * 0.1})`)
    g.addColorStop(0.7, `${c}${0.03 + random() * 0.04})`)
    g.addColorStop(1, `${c}0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  // out-of-focus foliage framing the edges, kept clear of the centre
  const foliage = ['rgba(150,52,24,0.6)', 'rgba(192,72,30,0.55)', 'rgba(214,122,46,0.5)', 'rgba(118,38,18,0.55)', 'rgba(232,160,64,0.45)']
  for (let i = 0; i < 26; i += 1) {
    const side = i % 4
    const t = random()
    const inset = random() * 0.12
    const x = side === 0 ? w * inset : side === 1 ? w * (1 - inset) : w * t
    const y = side === 2 ? h * inset : side === 3 ? h * (1 - inset) : h * t
    const size = diag * (0.1 + random() * 0.16)
    const rot = random() * Math.PI * 2
    softShape(ctx, () => leafPath(ctx, outline, box, x, y, size, rot), foliage[i % foliage.length], size * (0.12 + random() * 0.2))
  }
  // a few soft light discs
  for (let i = 0; i < 14; i += 1) {
    const x = random() * w
    const y = random() * h * 0.7
    const r = diag * (0.015 + random() * 0.035)
    softShape(
      ctx,
      () => {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
      },
      `rgba(255,240,205,${0.25 + random() * 0.25})`,
      r * 0.5,
    )
  }
  // low sun from the upper left
  const sun = ctx.createRadialGradient(w * 0.16, -h * 0.04, 0, w * 0.16, -h * 0.04, diag * 0.55)
  sun.addColorStop(0, 'rgba(255,246,220,0.75)')
  sun.addColorStop(0.4, 'rgba(255,230,180,0.25)')
  sun.addColorStop(1, 'rgba(255,230,180,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, w, h)

  // paper tooth and fibres
  const image = ctx.getImageData(0, 0, w, h)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 14
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n * 0.9
  }
  ctx.putImageData(image, 0, 0)
  ctx.globalAlpha = 0.06
  ctx.strokeStyle = '#6b3a17'
  ctx.lineWidth = 1
  for (let i = 0; i < 160; i += 1) {
    const x = random() * w
    const y = random() * h
    const a = random() * Math.PI
    const l = 8 + random() * 30
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// One blurred sprite per colour, drawn every frame as drifting bokeh.
function bokehSprite(outline, box, kind, color) {
  const size = 128
  const [canvas, ctx] = makeCanvas(size, size)
  softShape(
    ctx,
    () => {
      if (kind === 'disc') {
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2)
      } else leafPath(ctx, outline, box, size / 2, size / 2, size * 0.7, 0)
    },
    color,
    size * 0.08,
  )
  return canvas
}

/* ------------------------------------------------------------------ shaders */
const sparkVertex = /* glsl */ `
  attribute vec3 aRand;
  uniform float uSweep;
  uniform float uSweepMin;
  uniform float uSweepRange;
  uniform vec2 uSweepDir;
  uniform float uPixelRatio;
  uniform float uSize;
  varying float vAlpha;
  varying float vAge;
  void main() {
    float sw = (dot(position.xy, uSweepDir) - uSweepMin) / uSweepRange;
    float age = (uSweep - sw) / (0.22 + aRand.y * 0.3);
    float live = step(0.0, age) * step(age, 1.0);
    float a = clamp(age, 0.0, 1.0);
    vec3 p = position;
    p.x += (aRand.x - 0.5) * 0.3 * a + sin(a * 7.0 + aRand.z * 20.0) * 0.03 * a;
    p.y += a * (0.18 + aRand.y * 0.4);
    p.z += 0.05 + a * (0.25 + aRand.z * 0.45);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = live * (1.0 - a) * smoothstep(0.0, 0.06, a);
    vAge = a;
    gl_PointSize = live * (1.5 + aRand.z * 3.5) * uPixelRatio * uSize / -mv.z * (1.0 - a * 0.5);
  }
`

const sparkFragment = /* glsl */ `
  varying float vAlpha;
  varying float vAge;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 hot = vec3(1.0, 0.93, 0.66);
    vec3 cool = vec3(1.0, 0.42, 0.1);
    gl_FragColor = vec4(mix(hot, cool, vAge), a * a * vAlpha);
  }
`

// Injected into the hero leaf's MeshPhysicalMaterial.
const leafVertexHead = /* glsl */ `
  uniform float uTime;
  uniform float uFlutter;
  uniform float uCup;
  varying vec2 vLeafUv;
  varying vec2 vLeafPos;
  float leafDisp(vec2 p) {
    float r = length(p);
    // folded along the midrib, lobes cupping forward, rippling in the air
    float z = -0.11 * sqrt(p.x * p.x + 0.003) * (1.0 - 0.25 * p.y);
    z += 0.17 * r * r * uCup;
    z += uFlutter * 0.065 * sin(p.y * 3.4 - uTime * 7.0 + p.x * 1.8) * r;
    z += uFlutter * 0.04 * sin(p.x * 4.2 + uTime * 5.1) * r * r;
    return z;
  }
`

const leafFragmentHead = /* glsl */ `
  uniform sampler2D uNames;
  uniform float uLeafTime;
  uniform float uSweep;
  uniform float uBurn;
  uniform float uEmber;
  uniform float uSmoulder;
  uniform vec2 uSweepDir;
  uniform float uSweepMin;
  uniform float uSweepRange;
  varying vec2 vLeafUv;
  varying vec2 vLeafPos;
  float lhash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float lnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(lhash(i), lhash(i + vec2(1.0, 0.0)), f.x), mix(lhash(i + vec2(0.0, 1.0)), lhash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
`

const leafFragmentDiffuse = /* glsl */ `
  float sw = (dot(vLeafPos, uSweepDir) - uSweepMin) / uSweepRange;
  float ln = lnoise(vLeafPos * 7.0) * 0.6 + lnoise(vLeafPos * 21.0) * 0.4;
  float front = uSweep - sw + (ln - 0.5) * 0.14;
  float band = exp(-front * front / 0.0018);
  float toasted = smoothstep(0.0, 0.15, front);
  vec2 nm = texture2D(uNames, vLeafUv).rg;
  float nb = uBurn - sw + (ln - 0.5) * 0.1;
  float letters = smoothstep(0.32, 0.68, nm.r + (ln - 0.5) * 0.22);
  float burnt = letters * smoothstep(0.0, 0.05, nb);
  diffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.85, 0.68), toasted * 0.28);
  vec3 charColor = mix(vec3(0.15, 0.045, 0.015), vec3(0.06, 0.018, 0.008), ln);
  diffuseColor.rgb = mix(diffuseColor.rgb, charColor, burnt * 0.94);
`

const leafFragmentEmissive = /* glsl */ `
  float emberBand = band * uEmber;
  float nameFront = nm.g * exp(-nb * nb / 0.005) * uEmber;
  float halo = clamp(nm.g - letters, 0.0, 1.0) * smoothstep(0.0, 0.1, nb);
  float flicker = 0.6 + 0.25 * sin(uLeafTime * 3.1 + ln * 9.0) + 0.15 * sin(uLeafTime * 7.3 + ln * 4.0);
  totalEmissiveRadiance += vec3(1.0, 0.4, 0.05) * emberBand * 2.0;
  totalEmissiveRadiance += vec3(1.0, 0.75, 0.3) * emberBand * band * 1.6;
  totalEmissiveRadiance += vec3(1.0, 0.45, 0.08) * nameFront * 2.6;
  totalEmissiveRadiance += vec3(1.0, 0.42, 0.06) * halo * uSmoulder * flicker * 0.75;
`

/* -------------------------------------------------------------------- scene */
export default function create(host, template, { onOpened, setCaption }) {
  const stage = createStage(host, { fov: 40, cameraZ: 10 })
  const { THREE, scene, camera, renderer } = stage
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  const pixelRatio = renderer.getPixelRatio()
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  scene.add(camera)

  const { points: outline, box } = buildOutline(small ? 360 : 480)
  const texSize = small ? 1024 : 2048
  const couple = [String(template.couple?.[0] ?? ''), String(template.couple?.[1] ?? '')]

  /* --------------------------------------------------------- lights */
  scene.add(new THREE.HemisphereLight('#fff0d6', '#7a3510', 1.15))
  const key = new THREE.DirectionalLight('#ffe2b0', 2.5)
  key.position.set(-3, 5, 6)
  scene.add(key)
  const rim = new THREE.DirectionalLight('#ff9a4a', 1.7)
  rim.position.set(4, -1, -5)
  scene.add(rim)

  /* --------------------------------------------- illustrated backdrop */
  const bg = document.createElement('div')
  bg.setAttribute('aria-hidden', 'true')
  bg.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;'
  const paint = document.createElement('canvas')
  paint.style.cssText = 'position:absolute;left:-4%;top:-4%;width:108%;height:108%;display:block;will-change:transform;'
  const drift = document.createElement('canvas')
  drift.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;'
  const lift = document.createElement('div')
  lift.style.cssText = 'position:absolute;inset:0;background:#f6eddc;opacity:0;'
  bg.append(paint, drift, lift)
  host.insertBefore(bg, renderer.domElement)
  const driftCtx = drift.getContext('2d')
  const paintRatio = Math.min(window.devicePixelRatio || 1, 1.5)
  let paintTimer = 0
  let paintedSize = ''
  const repaint = () => {
    const w = Math.round(stage.view.width * 1.08 * paintRatio)
    const h = Math.round(stage.view.height * 1.08 * paintRatio)
    const key = `${w}x${h}`
    if (key === paintedSize) return
    paintedSize = key
    paintBackdrop(paint, w, h, outline, box)
  }
  const sprites = [
    ['leaf', 'rgba(184,64,26,0.9)'],
    ['leaf', 'rgba(217,83,30,0.9)'],
    ['leaf', 'rgba(232,118,60,0.9)'],
    ['leaf', 'rgba(142,47,23,0.9)'],
    ['leaf', 'rgba(246,166,35,0.9)'],
    ['disc', 'rgba(255,243,214,1)'],
    ['disc', 'rgba(255,215,150,1)'],
  ].map(([kind, color]) => ({ kind, canvas: bokehSprite(outline, box, kind, color) }))
  const br = seeded(31)
  const bokeh = Array.from({ length: small ? 26 : 40 }, (_, i) => {
    const sprite = sprites[i % sprites.length]
    return {
      sprite: sprite.canvas,
      light: sprite.kind === 'disc',
      x0: br(),
      y0: br(),
      depth: 0.3 + br() * 0.7,
      size: 0.06 + br() * 0.16,
      rise: 0.006 + br() * 0.018,
      spin: (br() - 0.5) * 0.5,
      phase: br() * 6.283,
      alpha: sprite.kind === 'disc' ? 0.25 + br() * 0.3 : 0.3 + br() * 0.35,
    }
  })

  /* -------------------------------------------------------- textures */
  const heroPaint = paintLeaf(texSize, outline, box, PALETTES.hero, 5)
  const heroMap = stage.track(canvasTexture(heroPaint.canvas, renderer))
  const heroBump = stage.track(canvasTexture(heroPaint.bump, renderer, { srgb: false }))
  const namesTex = stage.track(canvasTexture(paintNames(texSize, box, couple), renderer, { srgb: false }))

  /* ------------------------------------------------------- hero leaf */
  const rings = small ? 14 : 18
  const n = outline.length
  const vCount = 1 + rings * n
  const bladePos = new Float32Array(vCount * 3)
  const bladeUv = new Float32Array(vCount * 2)
  const bladeNormal = new Float32Array(vCount * 3)
  const toUv = (x, y, i) => {
    bladeUv[i * 2] = (x - box.cx) / box.S + 0.5
    bladeUv[i * 2 + 1] = (y - box.cy) / box.S + 0.5
  }
  toUv(0, 0, 0)
  for (let k = 1; k <= rings; k += 1) {
    const f = k / rings
    for (let j = 0; j < n; j += 1) {
      const i = 1 + (k - 1) * n + j
      const x = outline[j][0] * f
      const y = outline[j][1] * f
      bladePos[i * 3] = x
      bladePos[i * 3 + 1] = y
      toUv(x, y, i)
    }
  }
  for (let i = 0; i < vCount; i += 1) bladeNormal[i * 3 + 2] = 1
  const index = []
  const vid = (k, j) => 1 + (k - 1) * n + (j % n)
  for (let j = 0; j < n; j += 1) index.push(0, vid(1, j), vid(1, j + 1))
  for (let k = 1; k < rings; k += 1) {
    for (let j = 0; j < n; j += 1) {
      const a = vid(k, j)
      const b = vid(k, j + 1)
      const c = vid(k + 1, j + 1)
      const d = vid(k + 1, j)
      index.push(a, d, c, a, c, b)
    }
  }
  const bladeGeo = new THREE.BufferGeometry()
  bladeGeo.setAttribute('position', new THREE.BufferAttribute(bladePos, 3))
  bladeGeo.setAttribute('normal', new THREE.BufferAttribute(bladeNormal, 3))
  bladeGeo.setAttribute('uv', new THREE.BufferAttribute(bladeUv, 2))
  bladeGeo.setIndex(index)
  bladeGeo.computeBoundingSphere()
  bladeGeo.boundingSphere.radius += 0.4

  // sweep axis: lower left to upper right across the blade
  const sweepDir = new THREE.Vector2(0.8, 0.6).normalize()
  let sMin = Infinity
  let sMax = -Infinity
  outline.forEach(([x, y]) => {
    const d = x * sweepDir.x + y * sweepDir.y
    sMin = Math.min(sMin, d)
    sMax = Math.max(sMax, d)
  })
  const leafU = {
    uTime: { value: 0 },
    uLeafTime: { value: 0 },
    uFlutter: { value: 1 },
    uCup: { value: 1 },
    uNames: { value: namesTex },
    uSweep: { value: -0.25 },
    uBurn: { value: -0.25 },
    uEmber: { value: 1 },
    uSmoulder: { value: 0 },
    uSweepDir: { value: sweepDir },
    uSweepMin: { value: sMin },
    uSweepRange: { value: sMax - sMin },
  }
  const leafMat = new THREE.MeshPhysicalMaterial({
    map: heroMap,
    bumpMap: heroBump,
    bumpScale: 1.6,
    roughness: 0.6,
    metalness: 0,
    sheen: 0.65,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color('#ffd28a'),
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    side: THREE.DoubleSide,
  })
  leafMat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, leafU)
    shader.vertexShader = `${leafVertexHead}\n${shader.vertexShader}`
      .replace(
        '#include <beginnormal_vertex>',
        `float hE = 0.012;
        float h0 = leafDisp(position.xy);
        float hX = leafDisp(position.xy + vec2(hE, 0.0));
        float hY = leafDisp(position.xy + vec2(0.0, hE));
        vec3 objectNormal = normalize(vec3(-(hX - h0) / hE, -(hY - h0) / hE, 1.0));`,
      )
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = vec3(position.xy, position.z + h0);
        vLeafUv = uv;
        vLeafPos = position.xy;`,
      )
    shader.fragmentShader = `${leafFragmentHead}\n${shader.fragmentShader}`
      .replace('#include <map_fragment>', `#include <map_fragment>\n${leafFragmentDiffuse}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${leafFragmentEmissive}`)
  }
  leafMat.customProgramCacheKey = () => 'autumn-hero-leaf'

  const leafRoot = new THREE.Group()
  scene.add(leafRoot)
  const blade = new THREE.Mesh(bladeGeo, leafMat)
  blade.position.y = -LEAF_CY
  leafRoot.add(blade)

  // petiole, curving slightly out of the blade's plane
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.06, -0.01),
    new THREE.Vector3(0.01, -0.12, 0.0),
    new THREE.Vector3(0.04, -0.3, 0.04),
    new THREE.Vector3(0.09, -0.44, 0.09),
  ])
  const stem = new THREE.Mesh(
    new THREE.TubeGeometry(stemCurve, 24, 0.016, 8, false),
    new THREE.MeshStandardMaterial({ color: '#8a3414', roughness: 0.65 }),
  )
  blade.add(stem)

  // ember sparks shed by the sweeping edge
  const sparkCount = small ? 110 : 190
  const sparkPos = new Float32Array(sparkCount * 3)
  const sparkRand = new Float32Array(sparkCount * 3)
  const sr = seeded(41)
  for (let i = 0; i < sparkCount; i += 1) {
    const th = (sr() * 2 - 1) * 2.4
    const r = Math.sqrt(sr()) * leafRadius(th) * 0.95
    sparkPos.set([r * Math.sin(th), r * Math.cos(th), 0.02], i * 3)
    sparkRand.set([sr(), sr(), sr()], i * 3)
  }
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
  sparkGeo.setAttribute('aRand', new THREE.BufferAttribute(sparkRand, 3))
  const sparkMat = new THREE.ShaderMaterial({
    vertexShader: sparkVertex,
    fragmentShader: sparkFragment,
    uniforms: {
      uSweep: leafU.uSweep,
      uSweepMin: leafU.uSweepMin,
      uSweepRange: leafU.uSweepRange,
      uSweepDir: leafU.uSweepDir,
      uPixelRatio: { value: pixelRatio },
      uSize: { value: 16 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sparks = new THREE.Points(sparkGeo, sparkMat)
  sparks.frustumCulled = false
  blade.add(sparks)

  /* --------------------------------------------- drifting / gust leaves */
  const shape = new THREE.Shape()
  outline.forEach(([x, y], i) => {
    if (i % 3) return
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  })
  const smallGeo = new THREE.ShapeGeometry(shape)
  {
    const p = smallGeo.attributes.position
    const uv = smallGeo.attributes.uv
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i)
      const y = p.getY(i)
      uv.setXY(i, (x - box.cx) / box.S + 0.5, (y - box.cy) / box.S + 0.5)
      p.setXYZ(i, x, y - LEAF_CY, 0.16 * (x * x + y * y) - 0.1 * Math.abs(x))
    }
    smallGeo.computeVertexNormals()
  }
  const perMesh = small ? 20 : 30
  const DRIFTERS = small ? 3 : 4 // per mesh, alive before the gust
  const gustMeshes = ['crimson', 'amber', 'gold'].map((name, m) => {
    const paint = paintLeaf(512, outline, box, PALETTES[name], 60 + m)
    const mat = new THREE.MeshStandardMaterial({
      map: stage.track(canvasTexture(paint.canvas, renderer)),
      bumpMap: stage.track(canvasTexture(paint.bump, renderer, { srgb: false })),
      bumpScale: 1.2,
      roughness: 0.62,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.InstancedMesh(smallGeo, mat, perMesh)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    mesh.frustumCulled = false
    scene.add(mesh)
    return mesh
  })
  const gr = seeded(77)
  const leaves = []
  gustMeshes.forEach((mesh, m) => {
    for (let i = 0; i < perMesh; i += 1) {
      const drifter = i < DRIFTERS
      leaves.push({
        mesh,
        i,
        drifter,
        // drifters stay behind the hero leaf, apart from the odd close one
        z: drifter ? (i === 0 && m === 1 ? 4.2 : -9 + gr() * 7) : -12 + gr() * 18,
        x0: gr(),
        y0: gr(),
        phase: gr() * 10,
        speed: 0.035 + gr() * 0.03,
        sx: 0.6 + gr() * 1.4,
        sy: 0.4 + gr() * 1.2,
        sz: (gr() - 0.5) * 1.6,
        scale: 0.26 + gr() * 0.34,
        delay: gr() * 1.25,
        dur: 0.85 + gr() * 0.75,
        yBase: (gr() - 0.5) * 0.9,
        arc: (gr() - 0.3) * 0.35,
      })
    }
  })
  const dummy = new THREE.Object3D()

  /* ---------------------------------------------------------- layout */
  const L = { idleScale: 1, caughtScale: 1, idleY: 0, swayX: 0, caughtY: 0, caughtZ: 2, flyX: 4, flyY: 3 }
  const leafH = box.h + 0.4
  stage.onResize((view) => {
    const near = stage.visibleSize(10)
    L.idleScale = Math.min((near.width * 0.52) / box.w, (near.height * 0.34) / leafH)
    L.idleY = near.height * 0.07
    L.swayX = Math.min(near.width * 0.12, near.height * 0.08)
    const close = stage.visibleSize(10 - L.caughtZ)
    L.caughtScale = Math.min((close.width * 0.88) / box.w, (close.height * 0.6) / leafH)
    L.caughtY = close.height * 0.07
    L.flyX = near.width * 0.85
    L.flyY = near.height * 0.55
    drift.width = Math.round(view.width)
    drift.height = Math.round(view.height)
    // repaint the illustration once the size settles (address bars resize a lot)
    clearTimeout(paintTimer)
    if (!paintedSize) repaint()
    else paintTimer = setTimeout(repaint, 180)
  })

  /* ------------------------------------------------------------ loop */
  const state = { px: 0, py: 0, sx: 0, sy: 0, c: 0, g: 0, wind: 0, windAcc: 0, gust: -1, lift: 0, fade: 1 }
  const look = new THREE.Vector3()
  stage.onFrame((dt, t) => {
    state.sx += (state.px - state.sx) * Math.min(dt * 3, 1)
    state.sy += (state.py - state.sy) * Math.min(dt * 3, 1)
    const { c, g } = state
    leafU.uTime.value = t
    leafU.uLeafTime.value = t
    state.windAcc += state.wind * dt * 0.22

    /* hero leaf: pendulum flutter → caught face-on → carried off */
    const w = t * 1.05
    const ix = Math.sin(w) * L.swayX
    const iy = L.idleY + Math.cos(2 * w) * 0.1 * L.idleScale
    const irx = 0.6 + 0.22 * Math.sin(2 * w + 0.6) + state.sy * 0.2
    const iry = 0.38 * Math.sin(w * 0.53) + Math.sin(t * 0.31) * 0.25 + state.sx * 0.35
    const irz = 0.42 * Math.cos(w) + 0.12
    const breathe = Math.sin(t * 1.4) * 0.025
    const crx = -0.06 + state.sy * 0.08 + breathe
    const cry = state.sx * 0.12 + Math.sin(t * 0.9) * 0.03
    const crz = 0.05
    const g2 = g * g
    leafRoot.position.set(
      ix * (1 - c) + g2 * L.flyX,
      iy + (L.caughtY - iy) * c + g ** 1.6 * L.flyY,
      L.caughtZ * c - g * 3.5,
    )
    leafRoot.rotation.set(
      irx + (crx - irx) * c + g * 2.3 + g2 * Math.sin(t * 6) * 0.3,
      iry + (cry - iry) * c + g * 1.7,
      irz + (crz - irz) * c - g * 2.4,
    )
    leafRoot.scale.setScalar(L.idleScale + (L.caughtScale - L.idleScale) * c)

    /* camera: soft parallax, then follows the leaf into the wind */
    const follow = g ** 1.4
    camera.position.set(
      state.sx * 0.35 * (1 - c * 0.6) + leafRoot.position.x * follow * 0.7,
      -state.sy * 0.25 * (1 - c * 0.6) + leafRoot.position.y * follow * 0.7,
      10 - g * 1.6,
    )
    look.set(leafRoot.position.x * follow * 0.85, leafRoot.position.y * follow * 0.85, 0)
    camera.lookAt(look)

    /* painted backdrop: parallax, then a pan with the wind */
    paint.style.transform = `translate3d(${(-state.sx * 1.2 - g2 * 3).toFixed(2)}%, ${(-state.sy + g2 * 2.5).toFixed(2)}%, 0)`
    lift.style.opacity = state.lift.toFixed(3)
    const W = drift.width
    const H = drift.height
    const unit = Math.min(W, H)
    driftCtx.setTransform(1, 0, 0, 1, 0, 0)
    driftCtx.clearRect(0, 0, W, H)
    for (let k = 0; k < bokeh.length; k += 1) {
      const b = bokeh[k]
      const size = b.size * unit * (0.8 + b.depth)
      const fx = (((b.x0 + state.windAcc * (0.6 + b.depth * 1.6) + Math.sin(t * 0.2 + b.phase) * 0.01) % 1) + 1) % 1
      const fy = (((b.y0 - t * b.rise) % 1) + 1) % 1
      const x = fx * (W + size * 2) - size - state.sx * 14 * b.depth
      const y = fy * (H + size * 2) - size - state.sy * 10 * b.depth
      const r = t * b.spin + b.phase
      const co = Math.cos(r)
      const si = Math.sin(r)
      driftCtx.setTransform(co, si, -si, co, x, y)
      driftCtx.globalAlpha = b.alpha * state.fade
      driftCtx.globalCompositeOperation = b.light ? 'lighter' : 'source-over'
      driftCtx.drawImage(b.sprite, -size / 2, -size / 2, size, size)
    }
    driftCtx.globalAlpha = 1
    driftCtx.globalCompositeOperation = 'source-over'

    /* small leaves: a few drift down while idle, all of them ride the gust */
    const gt = state.gust
    for (let k = 0; k < leaves.length; k += 1) {
      const leaf = leaves[k]
      const dist = camera.position.z - leaf.z
      const h = 2 * tanHalf * dist
      const wv = h * stage.view.aspect
      let scale = leaf.scale
      if (leaf.drifter) {
        const fy = (leaf.y0 - t * leaf.speed) % 1
        const yy = (((fy + 1) % 1) - 0.5) * (h + 2)
        const fx = (leaf.x0 + state.windAcc * (1.2 + leaf.speed * 8) + 1) % 1
        dummy.position.set(
          camera.position.x + (fx - 0.5) * (wv + 1.5) + Math.sin(t * 0.9 + leaf.phase) * 0.35,
          camera.position.y + yy,
          leaf.z,
        )
        dummy.rotation.set(t * leaf.sx * 0.6 + leaf.phase, t * leaf.sy * 0.5, Math.sin(t * 1.2 + leaf.phase) * 0.9)
      } else {
        const u = gt < 0 ? -1 : (gt - leaf.delay) / leaf.dur
        if (u < 0 || u > 1) {
          scale = 0
          dummy.position.set(0, -100, 0)
        } else {
          const e = u * (0.8 + 0.2 * u)
          dummy.position.set(
            camera.position.x + (e - 0.5) * (wv + 3),
            camera.position.y + leaf.yBase * h + Math.sin(u * Math.PI) * leaf.arc * h + Math.sin(u * 9 + leaf.phase) * 0.12,
            leaf.z,
          )
          dummy.rotation.set(u * leaf.sx * 9 + leaf.phase, u * leaf.sy * 7, u * leaf.sz * 6 + leaf.phase)
        }
      }
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      leaf.mesh.setMatrixAt(leaf.i, dummy.matrix)
    }
    for (let m = 0; m < gustMeshes.length; m += 1) gustMeshes[m].instanceMatrix.needsUpdate = true
  })

  /* ------------------------------------------------------------ open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      // caught: turns face-on and comes close, flutter calms
      .to(state, { c: 1, duration: 1.1, ease: 'back.out(1.3)' }, 0)
      .to(leafU.uFlutter, { value: 0.14, duration: 1.0, ease: 'power2.out' }, 0)
      .to(leafU.uCup, { value: 0.5, duration: 1.0, ease: 'power2.out' }, 0)
      // ember edge sweeps across, names burn in just behind it
      .to(leafU.uSweep, { value: 1.55, duration: 1.7, ease: 'sine.inOut' }, 0.75)
      .to(leafU.uBurn, { value: 1.25, duration: 1.55, ease: 'sine.inOut' }, 0.9)
      .to(leafU.uSmoulder, { value: 1, duration: 0.7 }, 1.5)
      .call(() => setCaption?.('date'), null, 2.2)
      // the gust: leaves first, then the hero leaf is lifted away
      .fromTo(state, { gust: 0 }, { gust: 2.3, duration: 2.3, ease: 'none' }, 3.2)
      .to(state, { wind: 1.5, duration: 1.0, ease: 'power2.in' }, 3.2)
      .to(state, { g: 1, duration: 1.9, ease: 'power2.in' }, 3.55)
      .to(leafU.uFlutter, { value: 1.5, duration: 0.6 }, 3.55)
      .to(leafU.uSmoulder, { value: 0.35, duration: 1.0 }, 3.6)
      .call(() => setCaption?.(null), null, 4.15)
      .to(state, { lift: 1, duration: 1.3, ease: 'sine.in' }, 4.15)
      .to(state, { fade: 0.3, duration: 1.2 }, 4.2)
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
      clearTimeout(paintTimer)
      stage.dispose()
      bg.remove()
    },
  }
}
