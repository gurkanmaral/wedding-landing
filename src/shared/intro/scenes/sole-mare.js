// Sole & Mare — "Paint the coast": a full-screen sheet of cold-pressed watercolour
// paper with one wet brush mark glistening on it. Touch it and pigment blooms out
// of the tap: the sea is washed in along the bottom, then the cliff village, then
// the sky. The edges dry, a gold sun drop blooms, and the couple's names are
// lettered in paint before the page's own hero painting takes over.
import { gsap } from 'gsap'
import { createStage, makeCanvas, canvasTexture, seeded } from '../core.js'
import heroUrl from '../../../templates/sole-mare/assets/hero-generic.jpg'

const FONT_FAMILY = 'Cormorant Garamond'
const FONT_WEIGHT = 500

export const fonts = () => [
  { family: FONT_FAMILY, style: 'italic', weight: FONT_WEIGHT, google: 'Cormorant+Garamond:ital,wght@1,500' },
]

export const copy = {
  en: { prompt: 'Touch the paper' },
  tr: { prompt: 'Kâğıda dokunun' },
}

const IMAGE_ASPECT = 1080 / 1920
// where the gold sun drop lands, in hero-image uv (y up): low in the sunset sky, left
const SUN_UV = [0.27, 0.71]
// faint graphite under-drawing of the hero's ink lines on the blank paper (0 = truly blank)
const SKETCH = 0.16

/* ---------------------------------------------------------------- textures */

// Tileable value-noise lattice sampler.
function lattice(random, cells) {
  const grid = new Float32Array(cells * cells)
  for (let i = 0; i < grid.length; i += 1) grid[i] = random()
  return (x, y) => {
    const fx = x * cells
    const fy = y * cells
    const ix = Math.floor(fx)
    const iy = Math.floor(fy)
    let tx = fx - ix
    let ty = fy - iy
    tx = tx * tx * (3 - 2 * tx)
    ty = ty * ty * (3 - 2 * ty)
    const x0 = ix % cells
    const x1 = (ix + 1) % cells
    const y0 = (iy % cells) * cells
    const y1 = ((iy + 1) % cells) * cells
    const a = grid[y0 + x0]
    const b = grid[y0 + x1]
    const c = grid[y1 + x0]
    const d = grid[y1 + x1]
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty
  }
}

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

// R = paper height (cold-press tooth + felt unevenness), G = granulation pockets,
// B = slow tone mottling. Tiles seamlessly.
function paperTexture(stage, size = 512) {
  const { THREE } = stage
  const random = seeded(29)
  const tooth = lattice(random, 56)
  const fine = lattice(random, 112)
  const finer = lattice(random, 224)
  const felt = lattice(random, 12)
  const granA = lattice(random, 150)
  const granB = lattice(random, 300)
  const mottleA = lattice(random, 8)
  const mottleB = lattice(random, 20)
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    const v = y / size
    for (let x = 0; x < size; x += 1) {
      const u = x / size
      const bump = smooth(0.32, 0.78, tooth(u, v))
      const h = 0.5 * bump + 0.24 * fine(u, v) + 0.14 * finer(u, v) + 0.12 * felt(u, v)
      // pigment settles in the valleys of the tooth, in little clumps
      const g = 0.6 * smooth(0.42, 0.86, granA(u, v) * 0.6 + granB(u, v) * 0.4) + 0.4 * (1 - h)
      const m = mottleA(u, v) * 0.6 + mottleB(u, v) * 0.4
      const i = (y * size + x) * 4
      data[i] = h * 255
      data[i + 1] = g * 255
      data[i + 2] = m * 255
      data[i + 3] = 255
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return stage.track(texture)
}

// Plain random texels; the shader turns them into smooth value noise / fbm.
function noiseTexture(stage) {
  const { THREE } = stage
  const random = seeded(101)
  const data = new Uint8Array(256 * 256 * 4)
  for (let i = 0; i < data.length; i += 1) data[i] = random() * 255
  const texture = new THREE.DataTexture(data, 256, 256, THREE.RGBAFormat)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.LinearFilter
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return stage.track(texture)
}

// The names, lettered on two staggered lines with a little hand jitter.
// White on black so mipmaps (used for the wet halo) blend correctly.
function namesCanvas(couple) {
  const F = 180
  const font = `italic ${FONT_WEIGHT} ${F}px "${FONT_FAMILY}", Georgia, serif`
  const lines = [couple[0], `& ${couple[1]}`]
  const [, probe] = makeCanvas(8, 8)
  probe.font = font
  const widths = lines.map((line) => probe.measureText(line).width)
  const shifts = [-0.22 * F, 0.38 * F]
  const pad = 0.45 * F
  const half = Math.max(widths[0] / 2 + Math.abs(shifts[0]), widths[1] / 2 + Math.abs(shifts[1]))
  const cw = Math.ceil(half * 2 + pad * 2)
  const ch = Math.ceil(F * 2.55)
  const baselines = [F * 1.12, F * 2.18]
  const [canvas, ctx] = makeCanvas(cw, ch)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, cw, ch)
  ctx.fillStyle = '#fff'
  ctx.font = font
  ctx.textBaseline = 'alphabetic'
  const random = seeded(couple.join('').length * 31 + 7)
  const spans = []
  lines.forEach((line, li) => {
    const startX = cw / 2 + shifts[li] - widths[li] / 2
    const chars = Array.from(line)
    let prefix = ''
    chars.forEach((char) => {
      const x = startX + ctx.measureText(prefix).width
      prefix += char
      ctx.save()
      ctx.translate(x, baselines[li] + (random() - 0.5) * F * 0.035)
      ctx.rotate((random() - 0.5) * 0.06)
      const s = 1 + (random() - 0.5) * 0.05
      ctx.scale(s, s)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    })
    spans.push([startX / cw, (startX + widths[li]) / cw])
  })
  return {
    canvas,
    aspect: cw / ch,
    // x ranges of each line in texture uv, and the uv y (flipped) splitting the lines
    lines: [spans[0][0], spans[0][1], spans[1][0], spans[1][1]],
    split: 1 - (F * 1.36) / ch,
  }
}

/* ----------------------------------------------------------------- shaders */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uImage;
  uniform sampler2D uNoise;
  uniform sampler2D uPaper;
  uniform sampler2D uText;
  uniform vec2 uCss;
  uniform float uImgAspect;
  uniform float uTime;
  uniform float uReady;
  uniform float uSketch;
  uniform vec2 uLight;
  uniform float uMark;
  uniform vec2 uTap;
  uniform float uP;
  uniform float uWet;
  uniform vec2 uSunPos;
  uniform float uSunR;
  uniform float uSunWet;
  uniform vec4 uTextRect;
  uniform vec4 uLines;
  uniform float uSplit;
  uniform float uTP;
  uniform float uTextWet;
  uniform float uLift;
  varying vec2 vUv;

  // tone of the hero painting's own paper, so painted == the page's image
  const vec3 PAPER = vec3(0.988, 0.961, 0.890);
  const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

  float vn(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return texture2D(uNoise, (i + f + 0.5) / 256.0).r;
  }

  float fbm(vec2 x) {
    float s = 0.5 * vn(x);
    x = ROT * x + 5.2;
    s += 0.25 * vn(x);
    x = ROT * x + 1.3;
    s += 0.125 * vn(x);
    return s / 0.875;
  }

  float cockle(vec2 q) {
    return vn(q * 1.4 + 11.0) * 0.65 + vn(q * 3.1 - 4.0) * 0.35;
  }

  vec2 coverUv(vec2 s) {
    float va = uCss.x / uCss.y;
    vec2 uv = s;
    if (va < uImgAspect) uv.x = 0.5 + (s.x - 0.5) * va / uImgAspect;
    else uv.y = 0.5 + (s.y - 0.5) * uImgAspect / va;
    return uv;
  }

  // the loaded brush stroke: a short tilted arc, heavy where the brush landed
  float markSd(vec2 q) {
    vec2 p = q - vec2(-0.01, 0.0);
    float c = cos(0.2);
    float s = sin(0.2);
    p = mat2(c, -s, s, c) * p;
    p.y += 1.3 * p.x * p.x - 0.01;
    float L = 0.12;
    float h = clamp(p.x, -L, L);
    float t = (h + L) / (2.0 * L);
    float w = 0.032 * (1.0 - 0.72 * t * t) * (0.75 + 0.25 * smoothstep(0.0, 0.12, t));
    return length(p - vec2(h, 0.0)) - w;
  }

  void main() {
    vec2 s = vUv;
    float aspect = uCss.x / uCss.y;
    vec2 q = (s - 0.5) * vec2(aspect, 1.0);
    vec2 px = s * uCss;
    vec2 uv = coverUv(s);

    /* paper: tooth + cockling, raking light that follows the pointer */
    vec2 pu = px / 470.0;
    float e = 1.0 / 512.0;
    vec4 P = texture2D(uPaper, pu);
    float hx = texture2D(uPaper, pu + vec2(e, 0.0)).r;
    float hy = texture2D(uPaper, pu + vec2(0.0, e)).r;
    float c0 = cockle(q);
    vec2 cs = vec2(c0 - cockle(q + vec2(0.01, 0.0)), c0 - cockle(q + vec2(0.0, 0.01))) * 6.0;
    vec3 n = normalize(vec3(vec2(P.r - hx, P.r - hy) * 2.4 + cs, 1.0));
    vec3 nc = normalize(vec3(cs * 2.5, 1.0));
    vec3 L = normalize(vec3(-0.5 + uLight.x * 0.35 + sin(uTime * 0.23) * 0.06, 0.6 - uLight.y * 0.35, 0.8));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float shade = 1.0 + (dot(n, L) - L.z) * 1.7;
    vec2 vg = s - 0.5;
    vec3 tone = PAPER * (1.0 + (P.b - 0.5) * 0.035) * shade * (1.0 - dot(vg, vg) * 0.08);

    vec3 T = vec3(1.0);
    float bare = 1.0;
    float wet = 0.0;
    float spec = 0.0;
    float sparkle = 0.0;

    /* the bloom: every pixel gets an arrival time; pigment lands when uP passes it */
    if (uP > 0.0) {
      float wb = fbm(q * 2.0 + 7.3);
      float wb2 = fbm(q * 2.0 - 4.7);
      float wm = fbm(q * 6.0 - 2.1);
      float wf = fbm(q * 23.0 + 1.7);
      float dTap = length(q - uTap + (vec2(wb, wb2) - 0.5) * 0.22);

      // which wash a pixel belongs to, read from the blurred painting
      vec3 cb = texture2D(uImage, uv, 4.0).rgb;
      float sea = smoothstep(0.04, 0.16, cb.b - cb.r);
      float sky = smoothstep(0.6, 0.7, uv.y) * smoothstep(0.05, 0.16, cb.r - cb.b) * (1.0 - sea);
      float cliff = max(0.0, 1.0 - sea - sky);
      float dB = q.y + 0.5 + (wm - 0.5) * 0.2;
      float dT = 0.5 - q.y + (wm - 0.5) * 0.2;
      float arrival = sea * min(0.05 + dTap * 1.1, 0.2 + dB * 0.95)
                    + cliff * (0.7 + dTap * 0.8)
                    + sky * (1.25 + dT * 1.1 + abs(q.x) * 0.12);
      // the first burst straight out of the brush mark
      arrival = min(arrival, dTap * 2.4 + smoothstep(0.1, 0.22, dTap) * 9.0);
      arrival += (wf - 0.5) * 0.11 + (P.r - 0.5) * 0.035;
      float f = uP - arrival;
      float cov = smoothstep(0.0, 0.03, f);

      // colour bleeds and blurs at the wet front, then sharpens as it settles
      float front = exp(-max(f, 0.0) / 0.2) * uWet;
      vec2 off = (vec2(wm, wb) - 0.5) * 0.035 * front;
      vec3 Ti = clamp(texture2D(uImage, uv + off, front * 2.5).rgb / PAPER, 0.0, 1.0);
      // pigment pools at the drying edge (darker, more saturated), granulates in the tooth
      float pool = exp(-max(f, 0.0) / 0.08) * uWet;
      float ring = (1.0 - smoothstep(0.0, 0.045, f)) * uWet;
      float gran = (P.g - 0.5) * (0.25 + sea * 0.45);
      vec3 Tp = pow(Ti, vec3(1.0 + pool * 0.9 + ring * 0.7 + gran));
      // water runs ahead of the pigment carrying a faint diluted tint
      float halo = smoothstep(-0.16, 0.0, f) * (1.0 - cov) * uWet;
      vec3 Th = clamp(texture2D(uImage, uv, 5.0).rgb / PAPER, 0.0, 1.0);
      T = mix(vec3(1.0), Tp, cov) * mix(vec3(1.0), Th, halo * 0.3);
      bare = 1.0 - cov;
      wet = cov * exp(-max(f, 0.0) / 0.5) * uWet + halo * 0.5;
    }

    /* graphite under-drawing, painted over as the washes arrive */
    float lum = dot(texture2D(uImage, uv).rgb, vec3(0.3, 0.59, 0.11));
    float lumB = dot(texture2D(uImage, uv, 2.5).rgb, vec3(0.3, 0.59, 0.11));
    float line = smoothstep(0.05, 0.2, lumB - lum) * smoothstep(0.25, 0.65, P.r + 0.15);
    T *= mix(vec3(1.0), vec3(0.56, 0.56, 0.6), line * uSketch * uReady * bare);

    /* the wet brush mark: ultramarine, dark rim, glossy meniscus */
    if (uMark > 0.001) {
      float ms = markSd(q);
      vec2 g = vec2(markSd(q + vec2(0.002, 0.0)) - ms, markSd(q + vec2(0.0, 0.002)) - ms) / 0.002;
      float sd = ms + (fbm(q * 30.0 + 3.0) - 0.5) * 0.012 + (vn(q * 9.0) - 0.5) * 0.01;
      float mc = (1.0 - smoothstep(-0.002, 0.003, sd)) * uMark;
      float inside = -sd;
      float rim = exp(-max(inside, 0.0) / 0.007);
      float swirl = fbm(q * 9.0 + vec2(uTime * 0.05, -uTime * 0.03));
      vec3 Tm = pow(vec3(0.30, 0.40, 0.70), vec3(max(0.45 + rim * 0.9 + (swirl - 0.5) * 0.7 + (P.g - 0.5) * 0.4, 0.2)));
      T *= mix(vec3(1.0), Tm, mc);
      float bead = smoothstep(0.0, 0.02, inside);
      vec2 ripple = vec2(vn(q * 60.0 + uTime * 0.6), vn(q * 60.0 - uTime * 0.5 + 17.0)) - 0.5;
      vec3 nw = normalize(vec3(g * (1.0 - bead) * 0.9 + ripple * 0.05 + cs * 0.3, 1.0));
      float hd = max(dot(nw, H), 0.0);
      spec += (pow(hd, 90.0) * 1.1 + pow(hd, 12.0) * 0.06) * mc;
      wet = max(wet, mc);
    }

    /* gold sun drop: a bloom with a cauliflower edge and a little mica */
    if (uSunR > 0.0005) {
      vec2 sp = q - uSunPos;
      float r = length(sp);
      vec2 dir = sp / max(r, 1e-4);
      float eN = fbm(dir * 2.5 + r * 8.0 + 9.0);
      float R = uSunR * (0.85 + eN * 0.35);
      float sd = r - R;
      float sc = 1.0 - smoothstep(-0.003, 0.003, sd);
      float rim = exp(-max(-sd, 0.0) / 0.012) * (0.4 + 0.6 * uSunWet);
      float core = 1.0 - smoothstep(0.0, R, r);
      vec3 Ts = pow(vec3(0.99, 0.80, 0.42), vec3(0.75 + rim - core * 0.3 + (P.g - 0.5) * 0.4));
      float glow = exp(-max(sd, 0.0) / 0.045) * (1.0 - sc) * 0.35;
      T *= mix(vec3(1.0), Ts, sc) * mix(vec3(1.0), vec3(1.0, 0.86, 0.6), glow);
      float hash = texture2D(uNoise, floor(px * 0.8) / 256.0 + 0.37).g;
      float mica = smoothstep(0.86, 0.99, hash);
      sparkle += mica * sc * pow(0.5 + 0.5 * sin(hash * 60.0 + uTime * 2.6 + (uLight.x - uLight.y) * 7.0), 6.0);
      wet = max(wet, sc * uSunWet * 0.8);
    }

    /* the names, lettered in paint with the same wet-front treatment */
    vec2 tuv = (s - uTextRect.xy) / uTextRect.zw;
    if (uTP > 0.0 && tuv.x > 0.0 && tuv.x < 1.0 && tuv.y > 0.0 && tuv.y < 1.0) {
      float a = texture2D(uText, tuv).r;
      float ab = texture2D(uText, tuv, 2.5).r;
      float ta = tuv.y > uSplit
        ? 0.5 * clamp((tuv.x - uLines.x) / (uLines.y - uLines.x), 0.0, 1.0)
        : 0.5 + 0.5 * clamp((tuv.x - uLines.z) / (uLines.w - uLines.z), 0.0, 1.0);
      ta += (fbm(tuv * vec2(40.0, 12.0)) - 0.5) * 0.06;
      float tf = uTP - ta;
      float reach = smoothstep(0.0, 0.035, tf);
      // a soft lift of clean water just ahead of the brush keeps the letters legible on dark washes
      float room = smoothstep(0.0, 0.35, texture2D(uText, tuv, 5.5).r) * smoothstep(-0.15, 0.1, tf);
      T = mix(T, vec3(1.0), room * 0.55);
      // the tooth breaks the stroke edges like a dry-ish brush
      float tooth = (P.r - 0.5) * 0.35 + (vn(px * 0.35) - 0.5) * 0.2;
      float tc = smoothstep(0.42, 0.6, a + tooth * (1.0 - a)) * reach;
      float tfront = exp(-max(tf, 0.0) / 0.1) * uTextWet;
      float edge = 1.0 - smoothstep(0.5, 0.95, ab);
      vec3 ink = mix(vec3(0.40, 0.20, 0.14), vec3(0.62, 0.27, 0.17), fbm(tuv * vec2(6.0, 2.0) + 2.0));
      vec3 Tt = pow(ink, vec3(0.85 + edge * 0.45 + tfront * 0.5 + (P.g - 0.5) * 0.35));
      float tHalo = smoothstep(0.08, 0.5, ab) * (1.0 - tc) * reach * uTextWet * 0.18;
      T *= mix(vec3(1.0), Tt, tc) * mix(vec3(1.0), pow(ink, vec3(0.25)), tHalo);
      wet = max(wet, tc * tfront * 0.6);
    }

    /* hand-off: clean water lifts the lower paint, like the page's own hero wash */
    if (uLift > 0.0) {
      float lift = (1.0 - smoothstep(0.08, 0.46, s.y + (fbm(q * 4.0 + 1.0) - 0.5) * 0.1)) * uLift;
      T = mix(T, vec3(1.0), lift * 0.8);
    }

    vec3 col = tone * T * (1.0 - wet * 0.035);
    col += spec;
    col += wet * pow(max(dot(nc, H), 0.0), 24.0) * 0.07;
    col += sparkle * vec3(1.0, 0.88, 0.55) * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`

/* ------------------------------------------------------------------- scene */

export default function create(host, template, { onOpened, setCaption }) {
  const stage = createStage(host, { antialias: false })
  const { THREE, scene, renderer } = stage
  // the shader is full-screen and soft by nature; cap fill-rate on dense phones
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

  const couple = template.couple
  let names = namesCanvas(couple)
  let textTexture = canvasTexture(names.canvas, renderer, { srgb: false })

  const uniforms = {
    uImage: { value: null },
    uNoise: { value: noiseTexture(stage) },
    uPaper: { value: paperTexture(stage) },
    uText: { value: textTexture },
    uCss: { value: new THREE.Vector2(1, 1) },
    uImgAspect: { value: IMAGE_ASPECT },
    uTime: { value: 0 },
    uReady: { value: 0 },
    uSketch: { value: SKETCH },
    uLight: { value: new THREE.Vector2(0, 0) },
    uMark: { value: 1 },
    uTap: { value: new THREE.Vector2(-0.03, 0) },
    uP: { value: 0 },
    uWet: { value: 1 },
    uSunPos: { value: new THREE.Vector2() },
    uSunR: { value: 0 },
    uSunWet: { value: 1 },
    uTextRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uLines: { value: new THREE.Vector4(...names.lines) },
    uSplit: { value: names.split },
    uTP: { value: 0 },
    uTextWet: { value: 1 },
    uLift: { value: 0 },
  }

  // a 1×1 paper-coloured stand-in until the painting arrives
  const placeholder = stage.track(new THREE.DataTexture(new Uint8Array([252, 245, 227, 255]), 1, 1, THREE.RGBAFormat))
  placeholder.needsUpdate = true
  uniforms.uImage.value = placeholder

  let disposed = false
  const imageReady = new Promise((resolve) => {
    new THREE.TextureLoader().load(
      heroUrl,
      (texture) => {
        if (disposed) {
          texture.dispose()
          return resolve()
        }
        stage.track(texture)
        uniforms.uImage.value = texture
        gsap.to(uniforms.uReady, { value: 1, duration: 1.2, ease: 'sine.out' })
        resolve()
      },
      undefined,
      () => resolve(),
    )
  })

  const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
  quad.frustumCulled = false
  scene.add(quad)

  /* ---------------------------------------------------------------- layout */
  const toQ = (sx, sy, view) => [(sx - 0.5) * view.aspect, sy - 0.5]

  const layout = (view) => {
    uniforms.uCss.value.set(view.width, view.height)
    // names: centred in the upper sky, as large as the screen allows
    const limitH = view.aspect > 1 ? 0.3 : 0.2
    const h = Math.min(view.height * limitH, (view.width * 0.84) / names.aspect)
    const w = h * names.aspect
    const tw = w / view.width
    const th = h / view.height
    uniforms.uTextRect.value.set(0.5 - tw / 2, 0.79 - th / 2, tw, th)
    // sun: the same spot in the painting, wherever the cover crop puts it
    const [u, v] = SUN_UV
    let sx = u
    let sy = v
    if (view.aspect < IMAGE_ASPECT) sx = 0.5 + ((u - 0.5) * IMAGE_ASPECT) / view.aspect
    else sy = 0.5 + ((v - 0.5) * view.aspect) / IMAGE_ASPECT
    sx = THREE.MathUtils.clamp(sx, 0.12, 0.88)
    sy = THREE.MathUtils.clamp(sy, 0.5, 0.9)
    uniforms.uSunPos.value.set(...toQ(sx, sy, view))
  }
  stage.onResize(layout)

  // Turkish glyphs live in the font's latin-ext subset, which the browser only
  // fetches once those characters are asked for: re-letter when it lands.
  const fontSpec = `italic ${FONT_WEIGHT} 80px "${FONT_FAMILY}"`
  document.fonts
    ?.load(fontSpec, `${couple[0]} & ${couple[1]}`)
    .then(() => {
      if (disposed) return
      names = namesCanvas(couple)
      const next = canvasTexture(names.canvas, renderer, { srgb: false })
      textTexture.dispose()
      textTexture = next
      uniforms.uText.value = next
      uniforms.uLines.value.set(...names.lines)
      uniforms.uSplit.value = names.split
      layout(stage.view)
    })
    .catch(() => {})

  /* ----------------------------------------------------------------- input */
  let lastDown = null
  const onDown = (event) => {
    const rect = host.getBoundingClientRect()
    lastDown = {
      x: (event.clientX - rect.left) / rect.width,
      y: 1 - (event.clientY - rect.top) / rect.height,
      at: performance.now(),
    }
  }
  host.addEventListener('pointerdown', onDown)

  const pointer = { x: 0, y: 0 }
  stage.onFrame((dt, t) => {
    uniforms.uTime.value = t
    const k = 1 - Math.exp(-dt * 3)
    uniforms.uLight.value.x += (pointer.x - uniforms.uLight.value.x) * k
    uniforms.uLight.value.y += (pointer.y - uniforms.uLight.value.y) * k
  })

  /* ------------------------------------------------------------- sequence */
  let timeline = null
  let started = false

  const build = () => {
    if (timeline) return timeline
    if (lastDown && performance.now() - lastDown.at < 1000) {
      uniforms.uTap.value.set(...toQ(lastDown.x, lastDown.y, stage.view))
    }
    const u = uniforms
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      // the brush mark bursts and the washes go in: sea, cliff village, sky
      .to(u.uMark, { value: 0, duration: 0.7, ease: 'power2.out' }, 0)
      .to(u.uP, { value: 3, duration: 2.8, ease: 'none' }, 0)
      // ~80% covered: the edges dry
      .to(u.uWet, { value: 0, duration: 1.2, ease: 'sine.inOut' }, 1.6)
      .to(u.uSunR, { value: 0.062, duration: 1.0, ease: 'power2.out' }, 1.8)
      .to(u.uSunWet, { value: 0, duration: 1.0, ease: 'sine.inOut' }, 2.4)
      // the names are lettered in, then dry
      .to(u.uTP, { value: 1.12, duration: 1.6, ease: 'power1.inOut' }, 2.1)
      .to(u.uTextWet, { value: 0, duration: 1.0, ease: 'sine.inOut' }, 3.3)
      // clean water lifts the lower half toward the page hero; the date lands there
      .to(u.uLift, { value: 1, duration: 1.0, ease: 'power2.inOut' }, 3.4)
      .call(() => setCaption?.('date'), null, 3.6)
      .to({}, { duration: 0.01 }, 4.6)
    return timeline
  }

  const open = () => {
    if (started) return
    started = true
    imageReady.then(() => {
      if (!disposed) build()
    })
  }

  const skip = () => {
    started = true
    build().progress(1)
  }

  return {
    open,
    skip,
    setPointer: (x, y) => {
      pointer.x = x
      pointer.y = y
    },
    dispose: () => {
      disposed = true
      timeline?.kill()
      gsap.killTweensOf(uniforms.uReady)
      host.removeEventListener('pointerdown', onDown)
      textTexture.dispose()
      stage.dispose()
    },
  }
}
