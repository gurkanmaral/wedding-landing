// Sakura — "Shoji at dusk". The room is illustration: a pair of shoji screens
// (painted washi, wooden kumiko lattice, warm dusk light behind the paper) with
// the soft shadow of a cherry branch swaying on it, all 2D canvas layers. Only
// the petals are 3D: opening slides the screens apart (GSAP translate), a gust
// of instanced, cupped three.js petals swirls through the gap and settles into
// the couple's names, then a breeze lifts them past the viewer into the page.
import { gsap } from 'gsap'
import { createStage, makeCanvas, seeded } from '../core.js'

export const fonts = () => [{ family: 'Shippori Mincho', weight: 700, google: 'Shippori+Mincho:wght@500;700' }]

export const copy = {
  en: { prompt: 'Slide the screens open' },
  tr: { prompt: 'Paravanı aralayın' },
}

const NAME_FONT = '"Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif'

/* ------------------------------------------------------------ illustration */

// Calls fn at (x, y) and at the wrapped copies that touch the tile, so the
// pattern repeats without seams.
function tiled(size, x, y, reach, fn) {
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      const px = x + dx * size
      const py = y + dy * size
      if (px > -reach && px < size + reach && py > -reach && py < size + reach) fn(px, py)
    }
  }
}

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

// Washi tile: uneven pulp, long kozo fibres and bark specks.
function washiTile(size) {
  const [canvas, ctx] = makeCanvas(size, size)
  const random = seeded(23)
  const k = size / 1024
  ctx.fillStyle = '#f6ecda'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 170; i += 1) {
    const x = random() * size
    const y = random() * size
    const r = (40 + random() * 170) * k
    const light = random() > 0.45
    const a = 0.03 + random() * 0.06
    const rgb = light ? '255,252,244' : '190,163,132'
    tiled(size, x, y, r, (px, py) => {
      const g = ctx.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, `rgba(${rgb},${a})`)
      g.addColorStop(1, `rgba(${rgb},0)`)
      ctx.fillStyle = g
      ctx.fillRect(px - r, py - r, r * 2, r * 2)
    })
  }

  ctx.lineCap = 'round'
  for (let i = 0; i < 1200; i += 1) {
    const x = random() * size
    const y = random() * size
    const len = (30 + random() * 150) * k
    const angle = random() * Math.PI * 2
    const bend = (random() - 0.5) * 0.9
    const dark = random() < 0.32
    ctx.strokeStyle = dark ? `rgba(146,114,82,${0.07 + random() * 0.12})` : `rgba(255,253,246,${0.25 + random() * 0.4})`
    ctx.lineWidth = (0.5 + random() * 1.5) * k
    const ex = Math.cos(angle) * len
    const ey = Math.sin(angle) * len
    const cx = ex / 2 + Math.cos(angle + Math.PI / 2) * len * bend * 0.5
    const cy = ey / 2 + Math.sin(angle + Math.PI / 2) * len * bend * 0.5
    tiled(size, x, y, len + 4, (px, py) => {
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.quadraticCurveTo(px + cx, py + cy, px + ex, py + ey)
      ctx.stroke()
    })
  }

  for (let i = 0; i < 280; i += 1) {
    const x = random() * size
    const y = random() * size
    const r = (0.5 + random() * 1.6) * k
    const stretch = 1 + random()
    const turn = random() * Math.PI
    ctx.fillStyle = `rgba(104,78,56,${0.2 + random() * 0.35})`
    tiled(size, x, y, r * 3, (px, py) => {
      ctx.beginPath()
      ctx.ellipse(px, py, r * stretch, r, turn, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  addGrain(ctx, size, size, 14, random)
  return canvas
}

// Cherry branch silhouette rooted in the top-right corner. `flip` turns it
// round so it roots bottom-left (the far branch).
function branchCanvas(size, color, flip, seed) {
  const [canvas, ctx] = makeCanvas(size, size)
  const random = seeded(seed)
  const k = size / 1024
  if (flip) {
    ctx.translate(size, size)
    ctx.rotate(Math.PI)
  }
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const blossom = (x, y, r) => {
    const turn = random() * Math.PI
    for (let p = 0; p < 5; p += 1) {
      const a = turn + (p * Math.PI * 2) / 5
      ctx.beginPath()
      ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.36, a, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const cluster = (x, y, scale) => {
    const count = 2 + Math.floor(random() * 5)
    for (let i = 0; i < count; i += 1) {
      const a = random() * Math.PI * 2
      const d = random() * 26 * k * scale
      if (random() < 0.25) {
        ctx.beginPath()
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (3 + random() * 3) * k, 0, Math.PI * 2)
        ctx.fill()
      } else {
        blossom(x + Math.cos(a) * d, y + Math.sin(a) * d, (9 + random() * 9) * k * scale)
      }
    }
  }
  const twig = (x, y, angle, len, width, depth) => {
    let cx = x
    let cy = y
    let a = angle
    const steps = 10
    for (let i = 0; i < steps; i += 1) {
      a += (random() - 0.5) * 0.24
      const nx = cx + (Math.cos(a) * len) / steps
      const ny = cy + (Math.sin(a) * len) / steps
      ctx.lineWidth = Math.max(1.2 * k, width * (1 - (i / steps) * 0.45))
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      if (depth <= 2 && random() < 0.32) cluster(nx, ny, 0.8)
      if (depth >= 2 && i === 5 && random() < 0.7) {
        twig(nx, ny, a + (random() < 0.5 ? -1 : 1) * (0.6 + random() * 0.5), len * 0.42, width * 0.5, depth - 2)
      }
      cx = nx
      cy = ny
    }
    if (depth > 0) {
      const kids = depth > 2 ? 2 : 2 + (random() < 0.5 ? 1 : 0)
      for (let i = 0; i < kids; i += 1) {
        const spread = (i - (kids - 1) / 2) * (0.55 + random() * 0.35)
        twig(cx, cy, a + spread + (random() - 0.5) * 0.3, len * (0.58 + random() * 0.2), width * 0.62, depth - 1)
      }
    } else {
      cluster(cx, cy, 1)
    }
  }
  twig(size * 1.02, -size * 0.02, Math.PI * 0.76, size * 0.5, 30 * k, 4)
  twig(size * 1.02, size * 0.08, Math.PI * 0.9, size * 0.32, 16 * k, 2)
  return canvas
}

// The garden behind the screens: dusk sky, low sun, hazy hills and blossom.
function paintDusk(ctx, w, h) {
  const random = seeded(41)
  const k = Math.max(w, h) / 1024
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#e3b9c9')
  sky.addColorStop(0.36, '#f3d2d4')
  sky.addColorStop(0.56, '#fde7d7')
  sky.addColorStop(0.64, '#fbe1d1')
  sky.addColorStop(1, '#f0d0d3')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const sun = ctx.createRadialGradient(w * 0.5, h * 0.58, 0, w * 0.5, h * 0.58, Math.max(w, h) * 0.5)
  sun.addColorStop(0, 'rgba(255,248,232,0.95)')
  sun.addColorStop(0.25, 'rgba(255,236,214,0.5)')
  sun.addColorStop(1, 'rgba(255,236,214,0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, w, h)

  ;[
    [0.66, 'rgba(206,152,174,0.32)', 0.05, 3.1],
    [0.73, 'rgba(188,132,158,0.28)', 0.07, 2.2],
  ].forEach(([base, color, amp, freq], index) => {
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w + 8; x += 8) {
      const u = x / w
      const y = base + Math.sin(u * Math.PI * freq + index * 2) * amp * 0.6 + Math.sin(u * Math.PI * freq * 2.7 + 1) * amp * 0.3
      ctx.lineTo(x, y * h)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  })

  const canopies = [
    [0.06, 0.1, 0.2],
    [0.95, 0.08, 0.22],
    [0.12, 0.66, 0.16],
    [0.88, 0.68, 0.17],
    [0.32, 0.7, 0.08],
    [0.7, 0.71, 0.09],
  ]
  for (let i = 0; i < 360; i += 1) {
    const [cx, cy, spread] = canopies[i % canopies.length]
    const a = random() * Math.PI * 2
    const d = Math.sqrt(random()) * spread
    const x = (cx + Math.cos(a) * d) * w
    const y = (cy + Math.sin(a) * d * 0.7) * h
    const r = (8 + random() * 34) * k
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const rgb = random() < 0.7 ? '240,172,192' : '252,214,224'
    g.addColorStop(0, `rgba(${rgb},${0.12 + random() * 0.16})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
}

// Washi lit from behind: fibre pattern multiplied by the dusk light, which is
// placed in screen space so both panels share one glow.
function paintPaper(ctx, pw, ph, ox, oy, W, H, tile) {
  const pattern = ctx.createPattern(tile, 'repeat')
  const scale = (H * 0.66) / tile.width
  pattern.setTransform(new DOMMatrix([scale, 0, 0, scale, -ox % (tile.width * scale), 0]))
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, pw, ph)

  const gx = W * 0.54 - ox
  const gy = H * 0.5 - oy
  const R = Math.max(W, H) * 0.8
  ctx.globalCompositeOperation = 'multiply'
  const light = ctx.createRadialGradient(gx, gy, 0, gx, gy, R)
  light.addColorStop(0, '#fff8ec')
  light.addColorStop(0.32, '#fde6cf')
  light.addColorStop(0.66, '#eab3a3')
  light.addColorStop(1, '#c896ac')
  ctx.fillStyle = light
  ctx.fillRect(0, 0, pw, ph)
  const tone = ctx.createLinearGradient(0, 0, 0, ph)
  tone.addColorStop(0, 'rgba(214,190,226,1)')
  tone.addColorStop(0.45, 'rgba(255,255,255,1)')
  tone.addColorStop(1, 'rgba(250,214,196,1)')
  ctx.fillStyle = tone
  ctx.fillRect(0, 0, pw, ph)
  ctx.globalCompositeOperation = 'screen'
  const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * 0.4)
  core.addColorStop(0, 'rgba(255,214,160,0.38)')
  core.addColorStop(1, 'rgba(255,214,160,0)')
  ctx.fillStyle = core
  ctx.fillRect(0, 0, pw, ph)
  ctx.globalCompositeOperation = 'source-over'
}

// Kumiko lattice, stiles and rails: dark wood seen against the lit paper,
// with a thin warm rim where the light wraps round the edges.
function paintLattice(ctx, pw, ph, side, H) {
  const random = seeded(side > 0 ? 61 : 67)
  const st = Math.max(8, H * 0.02)
  const rail = Math.max(9, H * 0.024)
  const kt = Math.max(2, H * 0.0048)
  const innerW = pw - st * 2
  const innerH = ph - rail * 2
  const cols = Math.min(20, Math.max(3, Math.round(innerW / (H * 0.124))))
  const cellW = innerW / cols
  const rows = Math.min(20, Math.max(4, Math.round(innerH / (cellW * 1.3))))
  const cellH = innerH / rows

  const bar = (x, y, w, h, vertical, heavy) => {
    const g = vertical ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h)
    g.addColorStop(0, heavy ? '#3a281d' : '#3f2c21')
    g.addColorStop(0.45, heavy ? '#6a4b37' : '#5c4232')
    g.addColorStop(1, '#2e2018')
    // light bleeding round the wood onto the paper
    ctx.fillStyle = 'rgba(255,226,190,0.22)'
    if (vertical) ctx.fillRect(x - 1.5, y, w + 3, h)
    else ctx.fillRect(x, y - 1.5, w, h + 3)
    ctx.fillStyle = g
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(255,200,150,0.3)'
    if (vertical) ctx.fillRect(x, y, Math.max(1, w * 0.12), h)
    else ctx.fillRect(x, y, w, Math.max(1, h * 0.12))
    if (heavy) {
      ctx.strokeStyle = 'rgba(150,108,76,0.35)'
      ctx.lineWidth = 0.8
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath()
        if (vertical) {
          const gx = x + w * (0.2 + random() * 0.6)
          ctx.moveTo(gx, y)
          for (let s = y; s <= y + h; s += 40) ctx.lineTo(gx + Math.sin(s * 0.02 + i) * 1.5, s)
        } else {
          const gy = y + h * (0.2 + random() * 0.6)
          ctx.moveTo(x, gy)
          for (let s = x; s <= x + w; s += 40) ctx.lineTo(s, gy + Math.sin(s * 0.02 + i) * 1.5)
        }
        ctx.stroke()
      }
    }
  }
  for (let r = 1; r < rows; r += 1) bar(st, rail + r * cellH - kt / 2, innerW, kt, false, false)
  for (let c = 1; c < cols; c += 1) bar(st + c * cellW - kt / 2, rail, kt, innerH, true, false)
  bar(0, 0, pw, rail, false, true)
  bar(0, ph - rail, pw, rail, false, true)
  bar(0, 0, st, ph, true, true)
  bar(pw - st, 0, st, ph, true, true)

  // lacquered finger pull in the cell nearest the meeting edge
  const pullRow = Math.floor(rows / 2) - (rows % 2 === 0 ? 1 : 0)
  const px = side < 0 ? st + innerW - cellW / 2 : st + cellW / 2
  const py = rail + (pullRow + 0.5) * cellH
  const pr = Math.min(cellW, cellH) * 0.16
  const lacquer = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.35, 0, px, py, pr)
  lacquer.addColorStop(0, '#8a5a3c')
  lacquer.addColorStop(0.5, '#3a2216')
  lacquer.addColorStop(1, '#1d110b')
  ctx.fillStyle = lacquer
  ctx.beginPath()
  ctx.ellipse(px, py, pr * 0.8, pr, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(214,170,110,0.6)'
  ctx.lineWidth = 1.2
  ctx.stroke()
}


/* --------------------------------------------------------------------- names */

// Rasterise the names (stacked on tall screens) and return shuffled glyph
// points plus the inked area, which decides how big each petal must be.
function sampleNames(couple, stacked) {
  const width = stacked ? 1800 : 2800
  const height = stacked ? 1500 : 480
  const [, ctx] = makeCanvas(width, height)
  const lines = stacked
    ? [
        [couple[0], 330, 300],
        ['&', 760, 190],
        [couple[1], 1180, 300],
      ]
    : [[`${couple[0]} & ${couple[1]}`, 240, 260]]
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach(([text, y, size]) => {
    ctx.font = `700 ${size}px ${NAME_FONT}`
    ctx.fillText(text, width / 2, y, width - 120)
  })
  const { data } = ctx.getImageData(0, 0, width, height)
  const raw = []
  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        raw.push(x, y)
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  const count = raw.length / 2
  const random = seeded(count + 7)
  const order = new Uint32Array(count)
  for (let i = 0; i < count; i += 1) order[i] = i
  for (let i = count - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const points = new Float32Array(count * 2)
  for (let i = 0; i < count; i += 1) {
    const o = order[i]
    points[i * 2] = raw[o * 2] - cx
    points[i * 2 + 1] = cy - raw[o * 2 + 1]
  }
  return {
    points,
    count,
    area: count * 4,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  }
}


/* ------------------------------------------------------------- 3D petals */

const petalVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aTarget;
  attribute vec4 aRand;
  uniform float uTime;
  uniform float uClock;
  uniform float uDur;
  uniform float uScatter;
  uniform float uSize;
  uniform float uSpread;
  varying vec2 vUv;
  varying float vAlpha;
  varying float vFacing;
  varying float vTone;

  mat3 rotation(vec3 a) {
    float sx = sin(a.x); float cx = cos(a.x);
    float sy = sin(a.y); float cy = cos(a.y);
    float sz = sin(a.z); float cz = cos(a.z);
    mat3 rx = mat3(1.0, 0.0, 0.0, 0.0, cx, sx, 0.0, -sx, cx);
    mat3 ry = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
    mat3 rz = mat3(cz, sz, 0.0, -sz, cz, 0.0, 0.0, 0.0, 1.0);
    return rz * ry * rx;
  }

  void main() {
    float delay = aRand.x * 0.7;
    float t = clamp((uTime - delay) / uDur, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 2.6);

    // gust: through the gap toward the viewer, then curl back onto the glyphs
    vec3 p0 = aStart;
    vec3 p1 = aStart + vec3(uSpread * (0.6 + aRand.y * 1.4), (aRand.z - 0.5) * uSpread * 1.6, 3.0 + aRand.w * 2.2);
    vec3 p2 = aTarget + vec3((aRand.z - 0.5) * uSpread * 2.2, (aRand.y - 0.5) * uSpread * 1.6, 1.2 + aRand.x * 1.6);
    float iu = 1.0 - e;
    vec3 p = iu * iu * iu * p0 + 3.0 * iu * iu * e * p1 + 3.0 * iu * e * e * p2 + e * e * e * aTarget;

    // a shrinking vortex as they settle
    float ang = uTime * (2.0 + aRand.y * 2.0) + aRand.z * 6.2832;
    float swirl = iu * iu * (0.35 + aRand.w * 0.8) * uSpread * 0.6;
    p += vec3(cos(ang), sin(ang) * 0.7, sin(ang) * 0.5) * swirl;

    float settled = smoothstep(0.82, 1.0, t);
    p.x += sin(uClock * 1.7 + aRand.x * 30.0) * 0.012 * settled;
    p.y += cos(uClock * 1.3 + aRand.y * 30.0) * 0.012 * settled;

    // breeze: lift and carry past the camera
    float s = uScatter;
    p += vec3(
      (aTarget.x * 0.4 + (aRand.y - 0.5) * 3.0) * s + 2.0 * s * s,
      (0.8 + aRand.z * 2.5) * s * s + sin(s * 6.0 + aRand.x * 20.0) * 0.3 * s,
      (4.0 + aRand.w * 7.0) * s * s
    );

    float tumble = mix(1.0, 0.16, settled) + s * 1.6;
    vec3 a = vec3(
      sin(uClock * (2.0 + aRand.x * 3.0) + aRand.y * 20.0) * 1.4 * tumble + uTime * 3.0 * (aRand.z - 0.5) * (1.0 - settled),
      cos(uClock * (1.6 + aRand.y * 2.5) + aRand.z * 20.0) * 1.2 * tumble,
      aRand.w * 6.2832 + uClock * 0.3 * (aRand.x - 0.5) + iu * 8.0 * (aRand.y - 0.5)
    );
    mat3 r = rotation(a);
    vec3 shape = position;
    shape.z += shape.x * shape.x * 0.45 - shape.y * 0.12; // cupped petal
    vec3 world = p + r * (shape * uSize * (0.75 + aRand.z * 0.5));

    vFacing = abs((r * vec3(0.0, 0.0, 1.0)).z);
    vTone = aRand.w;
    vUv = uv;
    vAlpha = step(delay, uTime) * smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(0.55, 0.95, s));
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`

const petalFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vAlpha;
  varying float vFacing;
  varying float vTone;
  void main() {
    // obovate cherry petal with a notch at the tip
    float x = vUv.x * 2.0 - 1.0;
    float y = vUv.y;
    float cap = sqrt(max(0.0, 1.0 - pow(max(y - 0.6, 0.0) / 0.4, 2.0)));
    float halfW = mix(0.16, 0.95, smoothstep(0.0, 0.6, y)) * cap;
    float notch = 1.0 - 0.17 * (1.0 - smoothstep(0.0, 0.3, abs(x)));
    float m = smoothstep(halfW, halfW - 0.08, abs(x)) * smoothstep(notch, notch - 0.05, y) * smoothstep(0.0, 0.05, y);
    float alpha = m * vAlpha;
    if (alpha < 0.02) discard;
    vec3 deep = mix(vec3(0.76, 0.28, 0.4), vec3(0.88, 0.44, 0.55), vTone);
    vec3 pale = mix(vec3(0.95, 0.66, 0.74), vec3(1.0, 0.9, 0.93), vTone);
    vec3 col = mix(deep, pale, smoothstep(0.0, 0.85, y));
    col *= 1.0 - 0.07 * smoothstep(0.6, 1.0, sin(atan(x, y + 0.25) * 24.0));
    col *= 0.72 + 0.34 * vFacing;
    col += vec3(0.05, 0.025, 0.0) * (1.0 - vFacing); // dusk light through the thin petal
    gl_FragColor = vec4(col, alpha);
  }
`

/* --------------------------------------------------------------------- scene */

export default function create(host, template, { onOpened, setCaption }) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  root.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#f3d6d6;'
  host.appendChild(root)
  const layer = (tag, css, parent = root) => {
    const el = document.createElement(tag)
    el.style.cssText = css
    parent.appendChild(el)
    return el
  }
  const copyOf = (src, css, parent) => {
    const el = layer('canvas', css, parent)
    el.width = src.width
    el.height = src.height
    el.getContext('2d').drawImage(src, 0, 0)
    return el
  }

  /* ---------------------------------------------------------- 2D layers */
  const garden = layer('canvas', 'position:absolute;left:-3%;top:-3%;width:106%;height:106%;will-change:transform;')
  const tile = washiTile(small ? 512 : 1024)
  const nearArt = branchCanvas(small ? 768 : 1024, '#4a3a5e', false, 5)
  const farArt = branchCanvas(small ? 512 : 768, '#5c4668', true, 9)

  const makePanel = (side) => {
    const el = layer('div', 'position:absolute;top:-2%;height:104%;overflow:hidden;will-change:transform;box-shadow:0 0 34px rgba(70,34,40,0.28);')
    const paper = layer('canvas', 'position:absolute;inset:0;width:100%;height:100%;', el)
    const shade = layer('div', 'position:absolute;left:0;top:0;will-change:transform;', el)
    const far = copyOf(farArt, 'position:absolute;filter:blur(7px);opacity:0.2;mix-blend-mode:multiply;transform-origin:0 100%;', shade)
    const near = copyOf(nearArt, 'position:absolute;filter:blur(2.4px);opacity:0.36;mix-blend-mode:multiply;transform-origin:100% 0;', shade)
    const glow = layer('div', 'position:absolute;inset:0;mix-blend-mode:screen;', el)
    const lattice = layer('canvas', 'position:absolute;inset:0;width:100%;height:100%;', el)
    return { side, el, paper, shade, near, far, glow, lattice, x0: 0, travel: 0 }
  }
  const panels = [makePanel(-1), makePanel(1)]
  const shaft = layer(
    'div',
    'position:absolute;top:0;bottom:0;left:35%;width:30%;opacity:0;pointer-events:none;mix-blend-mode:screen;will-change:transform,opacity;' +
      'background:linear-gradient(90deg,rgba(255,236,210,0),rgba(255,246,232,0.95) 50%,rgba(255,236,210,0));',
  )

  const size = { W: 1, H: 1 }
  const paint = () => {
    const W = root.clientWidth || window.innerWidth
    const H = root.clientHeight || window.innerHeight
    size.W = W
    size.H = H

    const gw = W * 1.06
    const gh = H * 1.06
    garden.width = Math.round(gw * dpr)
    garden.height = Math.round(gh * dpr)
    const gctx = garden.getContext('2d')
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintDusk(gctx, gw, gh)

    const pw = Math.round(W * 0.555)
    const ph = Math.round(H * 1.04)
    const oy = -H * 0.02
    panels.forEach((p) => {
      p.x0 = p.side < 0 ? -W * 0.04 : W * 0.485
      p.travel = p.side * (pw + W * 0.06)
      p.el.style.left = `${p.x0}px`
      p.el.style.width = `${pw}px`
      for (const canvas of [p.paper, p.lattice]) {
        canvas.width = Math.round(pw * dpr)
        canvas.height = Math.round(ph * dpr)
      }
      const pctx = p.paper.getContext('2d')
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintPaper(pctx, pw, ph, p.x0, oy, W, H, tile)
      const lctx = p.lattice.getContext('2d')
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paintLattice(lctx, pw, ph, p.side, H)

      // the shadow layer lives in screen space so it stays put while the paper slides
      Object.assign(p.shade.style, { width: `${W}px`, height: `${H}px`, left: `${-p.x0}px`, top: `${H * 0.02}px` })
      const sA = Math.max(H * 0.95, W * 0.7)
      Object.assign(p.near.style, { width: `${sA}px`, height: `${sA}px`, left: `${W + sA * 0.06 - sA}px`, top: `${-sA * 0.06}px` })
      const sB = sA * 0.8
      Object.assign(p.far.style, { width: `${sB}px`, height: `${sB}px`, left: `${-sB * 0.08}px`, top: `${H + sB * 0.12 - sB}px` })
      const gx = W * 0.54 - p.x0
      const gy = H * 0.5 - oy
      p.glow.style.background = `radial-gradient(circle at ${gx}px ${gy}px, rgba(255,222,176,0.42), rgba(255,222,176,0) ${Math.max(W, H) * 0.45}px)`
    })
  }
  let paintTimer = 0
  let painted = false
  const schedulePaint = () => {
    if (!painted) {
      painted = true
      paint()
      return
    }
    clearTimeout(paintTimer)
    paintTimer = setTimeout(paint, 140)
  }

  /* ---------------------------------------------------------- 3D petals */
  const stage = createStage(root, { fov: 40, cameraZ: 10 })
  const { THREE, scene, camera } = stage
  const PETALS = small ? 1300 : 2000
  const petalGeo = new THREE.PlaneGeometry(0.8, 1, 3, 3)
  const start = new Float32Array(PETALS * 3)
  const target = new Float32Array(PETALS * 3)
  const rand = new Float32Array(PETALS * 4)
  const r0 = seeded(9)
  for (let i = 0; i < PETALS * 4; i += 1) rand[i] = r0()
  petalGeo.setAttribute('aStart', new THREE.InstancedBufferAttribute(start, 3))
  petalGeo.setAttribute('aTarget', new THREE.InstancedBufferAttribute(target, 3))
  petalGeo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 4))
  const petalMat = new THREE.ShaderMaterial({
    vertexShader: petalVertex,
    fragmentShader: petalFragment,
    uniforms: {
      uTime: { value: -1 },
      uClock: { value: 0 },
      uDur: { value: 2.0 },
      uScatter: { value: 0 },
      uSize: { value: 0.1 },
      uSpread: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS)
  petals.frustumCulled = false
  petals.visible = false
  scene.add(petals)

  const nameSets = {}
  const names = (stacked) => {
    const key = stacked ? 'stacked' : 'line'
    if (!nameSets[key]) nameSets[key] = sampleNames(template.couple, stacked)
    return nameSets[key]
  }
  const NAME_Z = 0.9

  const layout = () => {
    schedulePaint()
    const { width: W, height: H } = stage.visibleSize(10)
    // names sized for where the camera holds and the petals sit
    const at = stage.visibleSize(10 - NAME_Z)
    const stacked = camera.aspect < 1.1
    const set = names(stacked)
    const boxW = at.width * 0.8
    const boxH = at.height * (stacked ? 0.44 : 0.3)
    const scale = Math.min(boxW / set.width, boxH / set.height)
    const cy = at.height * 0.05
    const r = seeded(13)
    for (let i = 0; i < PETALS; i += 1) {
      const j = set.count ? i % set.count : 0
      const jitter = i >= set.count ? 0.02 : 0
      target[i * 3] = (set.points[j * 2] ?? 0) * scale + (r() - 0.5) * jitter
      target[i * 3 + 1] = (set.points[j * 2 + 1] ?? 0) * scale + cy + (r() - 0.5) * jitter
      target[i * 3 + 2] = NAME_Z + (r() - 0.5) * 0.04
      // deep behind the opening gap, so they appear through it
      start[i * 3] = (r() - 0.5) * W * 0.1
      start[i * 3 + 1] = (r() - 0.5) * H * 0.8
      start[i * 3 + 2] = -2.5 - r() * 2
    }
    const area = set.area * scale * scale
    petalMat.uniforms.uSize.value = THREE.MathUtils.clamp(Math.sqrt(area / PETALS) * 1.8, 0.035, 0.2)
    petalMat.uniforms.uSpread.value = Math.min(W, H) * 0.45
    petalGeo.attributes.aStart.needsUpdate = true
    petalGeo.attributes.aTarget.needsUpdate = true
  }
  stage.onResize(layout)

  /* ---------------------------------------------------------- loop */
  const state = { px: 0, py: 0, slide: 0, gust: 0, dolly: 0, shaft: 0, petalT: -1 }
  const par = { x: 0, y: 0 }
  let screensGone = false
  stage.onFrame((dt, t) => {
    par.x += (state.px - par.x) * 0.05
    par.y += (state.py - par.y) * 0.05

    garden.style.transform = `translate3d(${-par.x * 10}px,${-par.y * 6}px,0) scale(${1 + state.dolly * 0.08})`

    if (!screensGone) {
      const sway = Math.sin(t * 0.6) * 1.6 + Math.sin(t * 1.7 + 1) * 0.5 + state.gust * (4 + Math.sin(t * 5.3) * 2.5)
      const breathe = 0.78 + 0.22 * Math.sin(t * 0.9)
      for (let i = 0; i < panels.length; i += 1) {
        const p = panels[i]
        const dx = p.travel * state.slide
        p.el.style.transform = `translate3d(${dx}px,0,0)`
        p.shade.style.transform = `translate3d(${-dx + par.x * 6}px,${par.y * 4}px,0)`
        p.near.style.transform = `rotate(${-sway}deg)`
        p.far.style.transform = `rotate(${sway * 0.7}deg)`
        p.glow.style.opacity = breathe
      }
      const gap = Math.abs(panels[1].travel - panels[0].travel) * state.slide
      shaft.style.opacity = state.shaft
      shaft.style.transform = `scaleX(${(gap * 1.3 + size.W * 0.04) / (size.W * 0.3)})`
      if (state.slide >= 1) {
        screensGone = true
        panels.forEach((p) => {
          p.el.style.display = 'none'
        })
        shaft.style.display = 'none'
      }
    }

    if (state.petalT >= 0) {
      state.petalT += dt
      petalMat.uniforms.uTime.value = state.petalT
    }
    petalMat.uniforms.uClock.value = t

    camera.position.x += (par.x * 0.35 - camera.position.x) * 0.05
    camera.position.y += (-par.y * 0.22 - camera.position.y) * 0.05
    camera.position.z = 10 - state.dolly * 2.4
    camera.lookAt(0, 0, -6)
  })

  /* ---------------------------------------------------------- open */
  let timeline = null
  const open = () => {
    if (timeline) return
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(state, { slide: 0.025, duration: 0.25, ease: 'power1.out' }, 0)
      .to(state, { slide: 1, duration: 1.75, ease: 'power2.inOut' }, 0.25)
      .to(state, { gust: 1, duration: 0.6, ease: 'power2.out' }, 0.2)
      .to(state, { gust: 0, duration: 2.2, ease: 'sine.inOut' }, 1.2)
      .to(state, { shaft: 0.75, duration: 0.6, ease: 'power1.out' }, 0.35)
      .to(state, { shaft: 0, duration: 1.4, ease: 'power1.in' }, 1.2)
      .call(
        () => {
          petals.visible = true
          state.petalT = 0
        },
        null,
        0.75,
      )
      .call(() => setCaption?.('date'), null, 3.2)
      .call(() => setCaption?.(null), null, 4.7)
      .to(petalMat.uniforms.uScatter, { value: 1, duration: 1.3, ease: 'power2.in' }, 4.7)
      .to(state, { dolly: 1, duration: 1.3, ease: 'power2.in' }, 4.7)
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
      root.remove()
    },
  }
}
