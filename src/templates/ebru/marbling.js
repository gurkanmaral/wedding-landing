// Ebru engine. A marbled pattern is a list of operations on the water, the
// way a marbler works: colour drops (each new drop pushes the older paint
// outward into rings), awl and comb strokes (gelgit, tarak), and spirals
// (bülbül yuvası). Every pixel is traced backward through the operations
// (the exact inverse of each displacement), which keeps lines razor sharp
// at any resolution. Rendering happens in a WebGL2 fragment shader, ping-pong
// baked in chunks so the live part stays cheap.

export const EBRU = {
  navy: '#1d3557',
  red: '#e63946',
  saffron: '#f1c453',
  steel: '#457b9d',
  cream: '#f1faee',
}

const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]
export const PAINT = {
  navy: hex(EBRU.navy),
  red: hex(EBRU.red),
  saffron: hex(EBRU.saffron),
  steel: hex(EBRU.steel),
  cream: hex('#f4f1e4'),
  rose: hex('#f2a7a0'),
}
export const WATER = hex('#e9eee4')

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* --------------------------------------------------------- operations */
// Each op is 8 numbers: [type, a1, a2, a3, b0, b1, b2, b3]
export const drop = (x, y, r, color, seed = 0) => [0, x, y, r, color[0], color[1], color[2], seed]
// comb: a family of parallel tines; n = normal of the tine lines, spacing,
// offset, z = how far the paint is dragged, lambda = sharpness, alt = gelgit
export const comb = (nx, ny, spacing, offset, z, lambda, alt = false) => [1, nx, ny, spacing, offset, z, lambda, alt ? 1 : 0]
export const stroke = (ax, ay, bx, by, z, lambda) => [2, ax, ay, bx, by, z, lambda, 0]
export const vortex = (x, y, radius, angle) => [3, x, y, radius, angle, 0, 0, 0]

export const MAX_OPS = 512
const CHUNK = 64

// Lale ebru: concentric drops pulled into a tulip by the awl.
export function lale(ops, x, y, size = 1, palette = [PAINT.red, PAINT.cream, PAINT.red]) {
  ops.push(drop(x, y, 0.085 * size, palette[0]), drop(x, y, 0.055 * size, palette[1]), drop(x, y, 0.03 * size, palette[2]))
  ops.push(stroke(x, y - 0.13 * size, x, y + 0.13 * size, 0.1 * size, 0.012 * size))
  ops.push(stroke(x - 0.08 * size, y - 0.03 * size, x - 0.025 * size, y + 0.07 * size, 0.045 * size, 0.01 * size))
  ops.push(stroke(x + 0.08 * size, y - 0.03 * size, x + 0.025 * size, y + 0.07 * size, 0.045 * size, 0.01 * size))
  for (let k = 1; k <= 3; k += 1) ops.push(drop(x, y - 0.06 * size - k * 0.045 * size, 0.012 * size, PAINT.navy))
  ops.push(stroke(x, y - 0.06 * size, x, y - 0.25 * size, 0.07 * size, 0.008 * size))
}

/**
 * A complete sheet, independent of frame rate and of the guest:
 * - drops: a dense battal of small layered drops (pale ground showing through)
 * - combs: gelgit, then a fine tarak, scaled to the drop size
 * - motifs: bülbül yuvası spirals and lale tulips, kept clear of the cartouche
 * zone = half extents of the cartouche in pattern units ({ x, y }).
 */
export function composeSheet(seed, A, zone = { x: 0.6, y: 0.5 }) {
  const random = rng(seed)
  const area = 4 * A
  const count = Math.min(190, 96 + Math.round(42 * A))
  const rMean = Math.sqrt((1.3 * area) / (count * Math.PI))
  const palettes = [
    [PAINT.navy, PAINT.steel, PAINT.red, PAINT.saffron, PAINT.steel, PAINT.navy, PAINT.cream, PAINT.red, PAINT.steel],
    [PAINT.red, PAINT.navy, PAINT.saffron, PAINT.steel, PAINT.red, PAINT.cream, PAINT.navy, PAINT.steel],
    [PAINT.steel, PAINT.saffron, PAINT.navy, PAINT.cream, PAINT.rose, PAINT.steel, PAINT.navy, PAINT.red],
  ]
  const palette = palettes[Math.floor(random() * palettes.length)]
  const drops = []
  // stratified positions so the whole sheet is covered evenly
  const cols = Math.max(3, Math.round(Math.sqrt(count * A)))
  const rows = Math.ceil(count / cols)
  const cells = []
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) cells.push([c, r])
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  for (let i = 0; i < count; i += 1) {
    const [c, r] = cells[i % cells.length]
    const x = -A - 0.05 + ((c + random()) / cols) * (2 * A + 0.1)
    const y = -1.05 + ((r + random()) / rows) * 2.1
    const radius = rMean * (0.55 + random() * 0.8)
    drops.push(drop(x, y, radius, palette[i % palette.length], random() * 100))
  }
  const vertical = random() > 0.3
  const combs = [
    comb(vertical ? 1 : 0, vertical ? 0 : 1, rMean * 1.7, random() * rMean, rMean * 2.1, 0.022, true),
    comb(vertical ? 0 : 1, vertical ? 1 : 0, rMean * 0.42, random() * rMean * 0.4, rMean * 0.55, 0.0065, false),
  ]
  // motif spots around the cartouche
  const spots = []
  const margin = rMean * 2.2
  for (let k = 0; k < 40 && spots.length < 4; k += 1) {
    const x = (random() * 2 - 1) * (A - margin)
    const y = (random() * 2 - 1) * (1 - margin)
    if (Math.abs(x) < zone.x + margin && Math.abs(y) < zone.y + margin) continue
    if (spots.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < margin * 2.6)) continue
    spots.push([x, y])
  }
  const motifs = spots.map(([x, y], i) => {
    const ops = []
    if (i % 2 === 0) {
      lale(ops, x, y, Math.min(0.85, (rMean / 0.085) * 0.75), [PAINT.red, PAINT.cream, i % 4 ? PAINT.saffron : PAINT.red])
      return { kind: 'lale', ops }
    }
    // bülbül yuvası: the awl spirals in from the side
    ops.push(vortex(x, y, rMean * 1.5, (random() > 0.5 ? 1 : -1) * (7 + random() * 3)))
    return { kind: 'nest', ops }
  })
  return { A, seed, rMean, drops, combs, motifs }
}

export function flattenSheet(parts, extra = []) {
  return [...parts.drops, ...extra, ...parts.combs, ...parts.motifs.flatMap((m) => m.ops)]
}

export function generatePattern(seed, A, zone) {
  return flattenSheet(composeSheet(seed, A, zone))
}

// A stored sheet is only trusted when the intro completed it.
export const MIN_SHEET_OPS = 60

/* ------------------------------------------------------------ storage */
const KEY = 'wedfolio:ebru:sheet'

export function saveSheet(sheet) {
  try {
    const flat = sheet.ops.flat().map((v) => Math.round(v * 10000) / 10000)
    sessionStorage.setItem(KEY, JSON.stringify({ v: 2, A: sheet.A, seed: sheet.seed, ops: flat }))
  } catch {
    // private mode or full storage: the hero regenerates
  }
}

export function loadSheet() {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) || 'null')
    if (!data || data.v !== 2 || !Array.isArray(data.ops) || data.ops.length % 8 || data.ops.length / 8 < MIN_SHEET_OPS) return null
    const ops = []
    for (let i = 0; i < data.ops.length && ops.length < MAX_OPS; i += 8) ops.push(data.ops.slice(i, i + 8))
    return { A: data.A, seed: data.seed, ops }
  } catch {
    return null
  }
}

// A still JPEG of the printed sheet, for browsers where the hero cannot run WebGL2.
const STILL = 'wedfolio:ebru:still'
export function saveSnapshot(canvas, maxSide = 1400) {
  try {
    const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height))
    const small = document.createElement('canvas')
    small.width = Math.round(canvas.width * scale)
    small.height = Math.round(canvas.height * scale)
    small.getContext('2d').drawImage(canvas, 0, 0, small.width, small.height)
    sessionStorage.setItem(STILL, small.toDataURL('image/jpeg', 0.85))
  } catch {
    // storage full or unavailable
  }
}

export function loadSnapshot() {
  try {
    const value = sessionStorage.getItem(STILL)
    return value && value.startsWith('data:image/') ? value : null
  } catch {
    return null
  }
}

// CPU version of the compose shader, for a small still when WebGL2 is missing.
export function renderOpsToCanvas(ops, A, width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(width, height)
  const out = image.data
  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      let x = (((px + 0.5) / width) * 2 - 1) * A
      let y = 1 - ((py + 0.5) / height) * 2
      let col = WATER
      for (let i = ops.length - 1; i >= 0; i -= 1) {
        const o = ops[i]
        if (o[0] === 0) {
          const dx = x - o[1]
          const dy = y - o[2]
          const l2 = dx * dx + dy * dy
          const r2 = o[3] * o[3]
          if (l2 < r2) {
            col = [o[4], o[5], o[6]]
            break
          }
          const k = Math.sqrt(1 - r2 / l2)
          x = o[1] + dx * k
          y = o[2] + dy * k
        } else if (o[0] === 1) {
          const s = x * o[1] + y * o[2] - o[4]
          const cell = Math.floor(s / o[3] + 0.5)
          const dist = Math.abs(s - cell * o[3])
          const sgn = o[7] > 0.5 && ((cell % 2) + 2) % 2 === 1 ? -1 : 1
          const d = (sgn * o[5] * o[6]) / (dist + o[6])
          x += o[2] * d
          y -= o[1] * d
        } else if (o[0] === 2) {
          const ax = o[1]
          const ay = o[2]
          const len = Math.max(Math.hypot(o[3] - ax, o[4] - ay), 1e-5)
          const mx = (o[3] - ax) / len
          const my = (o[4] - ay) / len
          let qx = x
          let qy = y
          for (let j = 0; j < 3; j += 1) {
            const t = ((qx - ax) * mx + (qy - ay) * my) / len
            const dist = Math.abs(-(qx - ax) * my + (qy - ay) * mx)
            const sm = (e0, e1, v) => {
              const u = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)))
              return u * u * (3 - 2 * u)
            }
            const w = sm(-0.3, 0.2, t) * (1 - sm(0.8, 1.4, t))
            const k = ((o[5] * o[6]) / (dist + o[6])) * w
            qx = x - mx * k
            qy = y - my * k
          }
          x = qx
          y = qy
        } else {
          const dx = x - o[1]
          const dy = y - o[2]
          const th = -o[4] * Math.exp(-(dx * dx + dy * dy) / (o[3] * o[3]))
          const cs = Math.cos(th)
          const sn = Math.sin(th)
          x = o[1] + cs * dx - sn * dy
          y = o[2] + sn * dx + cs * dy
        }
      }
      const p = (py * width + px) * 4
      out[p] = col[0] * 255
      out[p + 1] = col[1] * 255
      out[p + 2] = col[2] * 255
      out[p + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

/* ---------------------------------------------------------------- GL */
const VERT = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

export const NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
`

const COMPOSE = `#version 300 es
precision highp float;
precision highp sampler2D;
uniform sampler2D uOps;
uniform sampler2D uBase;
uniform int uStart;
uniform int uEnd;
uniform bool uHasBase;
uniform float uA;
uniform vec3 uWater;
in vec2 vUv;
out vec4 outColor;
${NOISE}
void main() {
  vec2 p = vec2((vUv.x * 2.0 - 1.0) * uA, vUv.y * 2.0 - 1.0);
  vec3 col = uWater;
  bool hit = false;
  for (int k = 0; k < ${CHUNK}; k++) {
    int i = uEnd - 1 - k;
    if (i < uStart) break;
    vec4 a = texelFetch(uOps, ivec2(i, 0), 0);
    vec4 b = texelFetch(uOps, ivec2(i, 1), 0);
    int kind = int(a.x + 0.5);
    if (kind == 0) {
      vec2 c = a.yz;
      float r = a.w;
      vec2 d = p - c;
      float l2 = dot(d, d);
      float r2 = r * r;
      if (l2 < r2) {
        float q = sqrt(l2) / max(r, 1e-5);
        // pigment gathers at the rim of each drop; ox gall leaves a fine grain
        float rim = smoothstep(0.8, 1.0, q);
        float grain = noise(p * 46.0 + b.w) * 0.6 + noise(p * 140.0 - b.w) * 0.4;
        col = b.rgb * (1.0 - 0.1 * rim) * (0.94 + 0.1 * grain);
        hit = true;
        break;
      }
      p = c + d * sqrt(1.0 - r2 / l2);
    } else if (kind == 1) {
      vec2 n = a.yz;
      float sp = a.w;
      float s = dot(p, n) - b.x;
      float cell = floor(s / sp + 0.5);
      float dist = abs(s - cell * sp);
      float sgn = b.w > 0.5 ? (mod(cell, 2.0) < 0.5 ? 1.0 : -1.0) : 1.0;
      p -= vec2(-n.y, n.x) * sgn * b.y * b.z / (dist + b.z);
    } else if (kind == 2) {
      vec2 a0 = a.yz;
      vec2 b0 = vec2(a.w, b.x);
      vec2 ab = b0 - a0;
      float len = max(length(ab), 1e-5);
      vec2 m = ab / len;
      vec2 q = p;
      for (int j = 0; j < 3; j++) {
        float t = dot(q - a0, m) / len;
        float dist = abs(dot(q - a0, vec2(-m.y, m.x)));
        float w = smoothstep(-0.3, 0.2, t) * (1.0 - smoothstep(0.8, 1.4, t));
        q = p - m * b.y * b.z / (dist + b.z) * w;
      }
      p = q;
    } else {
      vec2 c = a.yz;
      vec2 d = p - c;
      float th = -b.x * exp(-dot(d, d) / (a.w * a.w));
      float cs = cos(th);
      float sn = sin(th);
      p = c + vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y);
    }
  }
  if (!hit && uHasBase) col = texture(uBase, vec2(p.x / uA * 0.5 + 0.5, p.y * 0.5 + 0.5)).rgb;
  outColor = vec4(col, 1.0);
}`

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

/**
 * parallel: compile in the background (KHR_parallel_shader_compile) so the
 * caller is not blocked; poll program.ready() before drawing. ready() throws
 * with the compiler log if the program failed.
 */
export function createProgram(gl, fragment, { parallel = false } = {}) {
  const program = gl.createProgram()
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  const ext = parallel ? gl.getExtension('KHR_parallel_shader_compile') : null
  let state = 'pending'
  const finish = () => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getShaderInfoLog(fs) || gl.getShaderInfoLog(vs) || gl.getProgramInfoLog(program)
      state = 'failed'
      throw new Error(log || 'shader link failed')
    }
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    state = 'ready'
  }
  program.ready = () => {
    if (state === 'ready') return true
    if (state === 'failed') throw new Error('shader failed')
    if (ext && !gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR)) return false
    finish()
    return true
  }
  if (!ext) program.ready()
  const cache = {}
  program.u = (name) => {
    if (!(name in cache)) cache[name] = gl.getUniformLocation(program, name)
    return cache[name]
  }
  return program
}

export function createGL(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance' })
  if (!gl) throw new Error('WebGL2 unavailable')
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  return gl
}

export function drawFullscreen(gl) {
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function makeTarget(gl, w, h) {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const fbo = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return { tex, fbo, w, h }
}

/**
 * The marbling tray: ops in, a composed texture out.
 * - ops: array of op arrays (mutate an op in place, then call touch())
 * - update(firstAnimating): bakes settled ops, recomposes the live part
 * - texture: the current pattern (sample in pattern space, aspect A)
 */
export function createTray(gl, { A, width, height, parallel = false }) {
  const program = createProgram(gl, COMPOSE, { parallel })
  const data = new Float32Array(MAX_OPS * 2 * 4)
  const opsTex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, opsTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_OPS, 2, 0, gl.RGBA, gl.FLOAT, data)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  let base = makeTarget(gl, width, height)
  let spare = makeTarget(gl, width, height)
  const live = makeTarget(gl, width, height)
  let baked = 0
  let hasBase = false
  let uploaded = 0
  let dirty = true
  const ops = []

  const upload = () => {
    const n = Math.min(ops.length, MAX_OPS)
    for (let i = Math.min(uploaded, baked); i < n; i += 1) {
      const op = ops[i]
      data.set(op.slice(0, 4), i * 4)
      data.set(op.slice(4, 8), (MAX_OPS + i) * 4)
    }
    uploaded = n
    gl.bindTexture(gl.TEXTURE_2D, opsTex)
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_OPS, 2, gl.RGBA, gl.FLOAT, data)
  }

  const compose = (start, end, target, withBase) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
    gl.viewport(0, 0, target.w, target.h)
    gl.useProgram(program)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, opsTex)
    gl.uniform1i(program.u('uOps'), 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, withBase ? base.tex : null)
    gl.uniform1i(program.u('uBase'), 1)
    gl.uniform1i(program.u('uStart'), start)
    gl.uniform1i(program.u('uEnd'), end)
    gl.uniform1i(program.u('uHasBase'), withBase ? 1 : 0)
    gl.uniform1f(program.u('uA'), A)
    gl.uniform3fv(program.u('uWater'), WATER)
    drawFullscreen(gl)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  const bake = (upTo) => {
    upTo = Math.min(upTo, ops.length, MAX_OPS)
    while (baked < upTo) {
      const end = Math.min(upTo, baked + CHUNK)
      compose(baked, end, spare, hasBase)
      ;[base, spare] = [spare, base]
      hasBase = true
      baked = end
    }
    dirty = true
  }

  return {
    ops,
    A,
    ready: () => program.ready(),
    get texture() {
      return live.tex
    },
    get size() {
      return [width, height]
    },
    get full() {
      return ops.length >= MAX_OPS - 8
    },
    touch() {
      dirty = true
    },
    // firstAnimating: index of the oldest op still changing (ops.length if none)
    update(firstAnimating = ops.length) {
      const n = Math.min(ops.length, MAX_OPS)
      const settled = Math.min(firstAnimating, n)
      if (!dirty && uploaded === n) return
      // ops must be on the GPU before any of them is baked
      upload()
      if (settled - baked >= 32 || n - baked > CHUNK - 8) bake(settled)
      compose(baked, n, live, hasBase)
      dirty = false
    },
    // finished pattern as RGBA rows (bottom-up)
    read() {
      const pixels = new Uint8Array(width * height * 4)
      gl.bindFramebuffer(gl.FRAMEBUFFER, live.fbo)
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      return pixels
    },
    dispose() {
      for (const t of [base, spare, live]) {
        gl.deleteTexture(t.tex)
        gl.deleteFramebuffer(t.fbo)
      }
      gl.deleteTexture(opsTex)
      gl.deleteProgram(program)
    },
  }
}

// Pixels from tray.read() into a 2D canvas (flipped upright), optionally downscaled.
export function pixelsToCanvas(pixels, width, height, maxSide = Infinity) {
  const full = document.createElement('canvas')
  full.width = width
  full.height = height
  const ctx = full.getContext('2d')
  const image = ctx.createImageData(width, height)
  const row = width * 4
  for (let y = 0; y < height; y += 1) image.data.set(pixels.subarray((height - 1 - y) * row, (height - y) * row), y * row)
  ctx.putImageData(image, 0, 0)
  const scale = Math.min(1, maxSide / Math.max(width, height))
  if (scale >= 1) return full
  const small = document.createElement('canvas')
  small.width = Math.round(width * scale)
  small.height = Math.round(height * scale)
  small.getContext('2d').drawImage(full, 0, 0, small.width, small.height)
  return small
}

// Render size for a pattern of aspect A seen cover-fit in a viewport.
export function traySize(viewW, viewH, A, dpr, cap = 2048) {
  const h = Math.max(viewH, viewW / A) * dpr
  const scale = Math.min(1, cap / Math.max(h, h * A))
  return [Math.max(2, Math.round(h * A * scale)), Math.max(2, Math.round(h * scale))]
}

/* ---------------------------------------------------------- cartouche */
// The resist cartouche (yazılı ebru): an area masked before marbling, so the
// paper stays bare there and the names are written into it.
export function cartoucheLayout(w, h, names = ['', '']) {
  const rw = Math.min(w * 0.41, 270)
  const rh = Math.min(h * 0.29, 250)
  const len = Math.max(4, names[0].length, names[1].length)
  const name = Math.min(rw * 0.36, rh * 0.25, 76, (rw * 1.62) / (len * 0.46))
  const meta = Math.max(11, Math.min(rw * 0.07, 15))
  const shift = meta * 1.7
  const cy = h / 2
  return {
    cx: w / 2,
    cy,
    rw,
    rh,
    name,
    meta,
    y1: cy - name * 0.98 - shift,
    yAmp: cy - shift,
    y2: cy + name * 0.98 - shift,
    yDate: cy + name * 1.98 - shift + meta * 0.8,
    yPlace: cy + name * 1.98 - shift + meta * 2.6,
    yTag: cy - name * 2.0 - shift,
  }
}

function cartouchePath(ctx, L, seed, grow = 0) {
  const random = rng(seed)
  const waves = [random() * 6, random() * 6, random() * 6]
  ctx.beginPath()
  for (let i = 0; i <= 240; i += 1) {
    const a = (i / 240) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    // squircle with a slightly wandering, hand-cut edge
    const k = Math.pow(Math.pow(Math.abs(c), 3.2) + Math.pow(Math.abs(s), 3.2), -1 / 3.2)
    const wobble = 1 + 0.012 * Math.sin(a * 7 + waves[0]) + 0.008 * Math.sin(a * 13 + waves[1]) + 0.005 * Math.sin(a * 23 + waves[2])
    const x = L.cx + c * k * (L.rw + grow) * wobble
    const y = L.cy + s * k * (L.rh + grow) * wobble
    if (i) ctx.lineTo(x, y)
    else ctx.moveTo(x, y)
  }
  ctx.closePath()
}

export function drawCartouche(ctx, L, seed, scale = 1) {
  ctx.save()
  ctx.scale(scale, scale)
  // paint crept against the resist: a soft darker halo
  cartouchePath(ctx, L, seed, 3)
  ctx.lineWidth = 7
  ctx.strokeStyle = 'rgba(29,53,87,0.16)'
  ctx.stroke()
  cartouchePath(ctx, L, seed)
  const g = ctx.createRadialGradient(L.cx, L.cy - L.rh * 0.3, 0, L.cx, L.cy, Math.max(L.rw, L.rh) * 1.2)
  g.addColorStop(0, '#fbfaf2')
  g.addColorStop(1, '#f1ede0')
  ctx.fillStyle = g
  ctx.fill()
  ctx.lineWidth = 1.3
  ctx.strokeStyle = 'rgba(29,53,87,0.55)'
  ctx.stroke()
  // inner hairline frame
  ctx.save()
  ctx.translate(L.cx, L.cy)
  ctx.scale(0.93, 0.95)
  ctx.translate(-L.cx, -L.cy)
  cartouchePath(ctx, L, seed)
  ctx.restore()
  ctx.lineWidth = 0.8
  ctx.strokeStyle = 'rgba(230,57,70,0.55)'
  ctx.stroke()
  ctx.restore()
}

// Paper fibre and a little cockle, laid over the print.
let grainCanvas = null
export function paperGrain() {
  if (grainCanvas) return grainCanvas
  grainCanvas = document.createElement('canvas')
  grainCanvas.width = 256
  grainCanvas.height = 256
  const ctx = grainCanvas.getContext('2d')
  const image = ctx.createImageData(256, 256)
  const random = rng(5)
  for (let i = 0; i < 256 * 256; i += 1) {
    const v = 236 + random() * 19
    image.data[i * 4] = v
    image.data[i * 4 + 1] = v
    image.data[i * 4 + 2] = v - 4
    image.data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  ctx.strokeStyle = 'rgba(120,105,80,0.08)'
  ctx.lineWidth = 0.6
  for (let i = 0; i < 140; i += 1) {
    const x = random() * 256
    const y = random() * 256
    const a = random() * Math.PI
    const l = 6 + random() * 16
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + random() * 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }
  return grainCanvas
}
