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
  uniform float uMarkLen;
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
  uniform float uHand;
  uniform vec2 uPage;
  uniform vec2 uWash;
  varying vec2 vUv;

  // tone of the hero painting's own paper, so painted == the page's image
  const vec3 PAPER = vec3(0.988, 0.961, 0.890);
  // the page's --background, which its hero washes are made of
  const vec3 PAGE_BG = vec3(252.0, 246.0, 238.0) / 255.0;
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

  // Cockling as a few long, irrational sine swells: perfectly smooth, so its
  // finite-difference lighting can't pick up the hardware-filtered noise lattice
  // (which drew a hairline along q.y = 0).
  float cockle(vec2 q) {
    return 0.5
      + 0.24 * sin(dot(q, vec2(2.13, 1.37)) + 1.7)
      + 0.16 * sin(dot(q, vec2(-1.41, 3.29)) + 0.4)
      + 0.10 * sin(dot(q, vec2(4.71, -2.23)) + 2.9);
  }

  vec2 coverUv(vec2 s) {
    float va = uCss.x / uCss.y;
    vec2 uv = s;
    if (va < uImgAspect) uv.x = 0.5 + (s.x - 0.5) * va / uImgAspect;
    else uv.y = 0.5 + (s.y - 0.5) * uImgAspect / va;
    return uv;
  }

  // the loaded brush stroke: a shallow tilted arc uMarkLen long, heavy where the
  // brush landed (t = 0) and tapering to a dry tail (t = 1); across = -1..1 over its width
  float markSd(vec2 q, out float t, out float across) {
    vec2 p = (q - vec2(0.0, 0.01)) / uMarkLen;
    float c = cos(0.22);
    float s = sin(0.22);
    p = mat2(c, -s, s, c) * p;
    p.y += 0.55 * p.x * p.x - 0.04;
    float h = clamp(p.x, -0.5, 0.5);
    t = h + 0.5;
    float w = 0.1 * (1.0 - 0.82 * t * t) * (0.72 + 0.28 * smoothstep(0.0, 0.1, t));
    across = p.y / max(w, 1e-3);
    return (length(p - vec2(h, 0.0)) - w) * uMarkLen;
  }

  void main() {
    vec2 s = vUv;
    float aspect = uCss.x / uCss.y;
    vec2 q = (s - 0.5) * vec2(aspect, 1.0);
    vec2 px = s * uCss;
    vec2 uv = coverUv(s);

    /* paper: tooth + cockling, raking light that follows the pointer */
    vec2 pu = px / 470.0 + vec2(0.371, 0.613);
    float e = 1.0 / 512.0;
    vec4 P = texture2D(uPaper, pu);
    float hx = texture2D(uPaper, pu + vec2(e, 0.0)).r;
    float hy = texture2D(uPaper, pu + vec2(0.0, e)).r;
    float c0 = cockle(q);
    vec2 cs = vec2(c0 - cockle(q + vec2(0.01, 0.0)), c0 - cockle(q + vec2(0.0, 0.01))) * 4.0;
    vec3 n = normalize(vec3(vec2(P.r - hx, P.r - hy) * 0.6 + cs, 1.0));
    vec3 nc = normalize(vec3(cs * 3.5, 1.0));
    vec3 L = normalize(vec3(-0.5 + uLight.x * 0.35 + sin(uTime * 0.23) * 0.06, 0.6 - uLight.y * 0.35, 1.6));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float shade = 1.0 + (dot(n, L) - L.z) * 1.0;
    vec2 vg = s - 0.5;

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
      float gran = (P.g - 0.5) * (0.12 + sea * 0.25) * (0.3 + 0.7 * uWet);
      vec3 Tp = pow(Ti, vec3(1.0 + pool * 0.9 + ring * 0.7 + gran));
      // water runs ahead of the pigment carrying a faint diluted tint
      float halo = smoothstep(-0.16, 0.0, f) * (1.0 - cov) * uWet;
      vec3 Th = clamp(texture2D(uImage, uv, 5.0).rgb / PAPER, 0.0, 1.0);
      T = mix(vec3(1.0), Tp, cov) * mix(vec3(1.0), Th, halo * 0.3);
      bare = 1.0 - cov;
      wet = cov * exp(-max(f, 0.0) / 0.5) * uWet + halo * 0.5;
    }

    /* the wet brush mark: ultramarine, dark rim, glossy meniscus */
    if (uMark > 0.001) {
      float mt;
      float across;
      float dummyT;
      float dummyA;
      float ms = markSd(q, mt, across);
      vec2 g = vec2(markSd(q + vec2(0.0015, 0.0), dummyT, dummyA) - ms, markSd(q + vec2(0.0, 0.0015), dummyT, dummyA) - ms) / 0.0015;
      float sd = ms + (fbm(q * 40.0 + 3.0) - 0.5) * 0.004 + (vn(q * 12.0) - 0.5) * 0.004;
      // bristle streaks along the stroke, breaking up into dry-brush toward the tail
      float streak = vn(vec2(across * 6.0 + 3.0, mt * 2.5));
      float dry = smoothstep(0.45, 0.95, mt) * (1.0 - smoothstep(0.3, 0.6, streak + (P.r - 0.5) * 0.4));
      float mc = (1.0 - smoothstep(-0.0015, 0.002, sd)) * (1.0 - dry) * uMark;
      float inside = -sd;
      float rim = exp(-max(inside, 0.0) / 0.0035);
      float swirl = fbm(q * 14.0 + vec2(uTime * 0.05, -uTime * 0.03));
      float k = 0.55 + rim * 0.8 + (1.0 - mt) * 0.35 + (swirl - 0.5) * 0.5 + (streak - 0.5) * 0.45 + (P.g - 0.5) * 0.15;
      T *= mix(vec3(1.0), pow(vec3(0.28, 0.38, 0.70), vec3(max(k, 0.2))), mc);
      // glossy meniscus: steep at the edge, a flat wet pool inside with a slow ripple
      float bead = smoothstep(0.0, 0.006, inside);
      vec2 ripple = vec2(vn(q * 50.0 + uTime * 0.6), vn(q * 50.0 - uTime * 0.5 + 17.0)) - 0.5;
      float wetness = mc * (1.0 - smoothstep(0.55, 1.0, mt) * 0.7);
      vec3 nw = normalize(vec3(g * (1.0 - bead) * 0.8 + ripple * 0.06 + cs * 0.4, 1.0));
      float hd = max(dot(nw, H), 0.0);
      spec += (pow(hd, 80.0) * 1.3 + pow(hd, 18.0) * 0.12) * wetness;
      wet = max(wet, wetness);
    }

    /* gold sun drop: a bloom with a cauliflower edge and a little mica */
    if (uSunR > 0.0005) {
      vec2 sp = q - uSunPos;
      float r = length(sp);
      vec2 dir = sp / max(r, 1e-4);
      float eN = fbm(dir * 2.5 + r * 8.0 + 9.0);
      float R = uSunR * (0.85 + eN * 0.35);
      float sd = r - R;
      float sc = 1.0 - smoothstep(-0.01, 0.006, sd);
      float rim = smoothstep(-0.03, -0.006, sd) * (1.0 - smoothstep(-0.006, 0.004, sd)) * (0.6 + 0.4 * uSunWet);
      float core = 1.0 - smoothstep(0.0, R * 0.75, r);
      vec3 Ts = pow(vec3(0.98, 0.76, 0.34), vec3(1.05 + rim * 0.45 - core * 0.45 + (P.g - 0.5) * 0.2));
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
      T = mix(T, vec3(1.0), room * 0.7);
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
      float lift = (1.0 - smoothstep(0.3, 0.62, s.y + (fbm(q * 4.0 + 1.37) - 0.5) * 0.1)) * uLift;
      T = mix(T, vec3(1.0), lift * 0.86);
    }

    // the paper's relief shows on bare paper and through wet paint, almost not at all once dry
    float grain = mix(1.0, mix(0.06, 0.35, uWet), 1.0 - bare);
    vec3 tone = PAPER * (1.0 + (P.b - 0.5) * 0.035 * grain) * mix(1.0, shade, grain) * (1.0 - dot(vg, vg) * 0.08 * grain);
    vec3 col = tone * T * (1.0 - wet * 0.035);
    col += spec;
    col += wet * pow(max(dot(nc, H), 0.0), 24.0) * 0.07;
    col += sparkle * vec3(1.0, 0.88, 0.55) * 0.55;

    /* the page's opening view, exactly: its photo cropped to the hero (which stops
       at the scrollbar gutter) under its two cream washes, with no names or sun */
    if (uHand > 0.0) {
      vec2 ps = vec2(px.x, uCss.y - px.y) / uPage;
      float pa = uPage.x / uPage.y;
      vec2 iuv = vec2(min(ps.x, 1.0), 1.0 - ps.y);
      if (pa < uImgAspect) iuv.x = 0.5 + (iuv.x - 0.5) * pa / uImgAspect;
      else iuv.y = 0.5 + (iuv.y - 0.5) * uImgAspect / pa;
      vec3 page = texture2D(uImage, iuv).rgb;
      // from-background/40 via-background/5 to-background, top to bottom
      float a1 = ps.y < 0.5 ? mix(0.4, 0.05, ps.y * 2.0) : mix(0.05, 1.0, (ps.y - 0.5) * 2.0);
      page = mix(page, PAGE_BG, a1);
      // the extra wash behind the text, rising from the bottom
      float u = (1.0 - ps.y) / uWash.x;
      float a2 = u >= 1.0 ? 0.0 : u < 0.5 ? mix(1.0, uWash.y, u * 2.0) : mix(uWash.y, 0.0, (u - 0.5) * 2.0);
      page = mix(page, PAGE_BG, a2);
      col = mix(col, page, uHand);
    }
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
    uMarkLen: { value: 0.12 },
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
    uHand: { value: 0 },
    uPage: { value: new THREE.Vector2(1, 1) },
    uWash: { value: new THREE.Vector2(0.6, 0.75) },
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
    // the page hero: viewport minus the scrollbar gutter; its text wash is
    // taller and stronger below the md breakpoint
    uniforms.uPage.value.set(Math.min(view.width, document.documentElement.clientWidth || view.width), view.height)
    uniforms.uWash.value.set(...(window.innerWidth >= 768 ? [0.6, 0.75] : [0.88, 0.85]))
    // the brush stroke spans ~27% of the screen width
    uniforms.uMarkLen.value = THREE.MathUtils.clamp(0.27 * view.aspect, 0.12, 0.42)
    // names: in the lower cream wash where the page hero sets its own title,
    // as large as the screen allows, above the date caption
    const limitH = view.aspect > 1 ? 0.3 : 0.2
    const h = Math.min(view.height * limitH, (view.width * 0.84) / names.aspect)
    const w = h * names.aspect
    const tw = w / view.width
    const th = h / view.height
    uniforms.uTextRect.value.set(0.5 - tw / 2, 0.36 - th / 2, tw, th)
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
      // clean water lifts the lower half toward the page hero's cream wash…
      .to(u.uLift, { value: 1, duration: 1.0, ease: 'power2.inOut' }, 1.9)
      // …and the names are lettered into it, then dry; the date lands below them
      .to(u.uTP, { value: 1.12, duration: 1.6, ease: 'power1.inOut' }, 2.4)
      .to(u.uTextWet, { value: 0, duration: 1.0, ease: 'sine.inOut' }, 3.6)
      .call(() => setCaption?.('date'), null, 3.8)
      // hand over: the painting settles into the page's own hero, where the
      // names and date are set again (the sun and lettering wash away)
      .call(() => setCaption?.(null), null, 4.7)
      .to(u.uHand, { value: 1, duration: 1.0, ease: 'sine.inOut' }, 4.8)
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
