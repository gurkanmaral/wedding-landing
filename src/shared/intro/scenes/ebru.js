// Ebru: a marbling bath fills the screen. Colour is sprinkled onto the water
// drop by drop (battal); the guest drags a finger through it like an awl.
// On release the marbler combs it (gelgit, then tarak), pulls a tulip where
// the guest touched, lays a sheet of paper on the water and lifts it: the
// pattern, unique to this guest, is printed on the paper with the couple's
// names in a resist cartouche. That sheet becomes the page hero.
import { gsap } from 'gsap'
import {
  NOISE,
  PAINT,
  WATER,
  cartoucheLayout,
  composeSheet,
  createGL,
  createProgram,
  createTray,
  drawCartouche,
  drawFullscreen,
  lale,
  paperGrain,
  pixelsToCanvas,
  saveSheet,
  saveSnapshot,
  stroke,
  traySize,
} from '../../../templates/ebru/marbling.js'

export const fonts = () => [
  { family: 'Cormorant', weight: 500, style: 'italic', google: 'Cormorant:ital,wght@1,500' },
  { family: 'Mulish', weight: 600, google: 'Mulish:wght@600' },
]

export const copy = {
  en: { prompt: 'Draw your finger through the colours' },
  tr: { prompt: 'Parmağınızla renkleri tarayın' },
}

const WATER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uHalf;
uniform float uA;
uniform float uTime;
uniform float uClear;
uniform vec4 uRip[6];
uniform vec3 uWater;
uniform vec3 uPress;
in vec2 vUv;
out vec4 outColor;
${NOISE}
void main() {
  vec2 p = (vUv * 2.0 - 1.0) * uHalf;
  vec2 disp = vec2(0.0);
  float ring = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 r = uRip[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > 3.0) continue;
    vec2 d = p - r.xy;
    float l = length(d) + 1e-4;
    float front = l - age * 0.42;
    float w = sin(front * 80.0) * exp(-front * front * 700.0) * exp(-age * 1.5) * r.w;
    disp += d / l * w * 0.005;
    ring += w;
  }
  vec2 q = p + disp;
  vec3 col = texture(uTex, vec2(q.x / uA * 0.5 + 0.5, q.y * 0.5 + 0.5)).rgb;
  col = mix(col, uWater, uClear);
  // light drifting over the gum-thickened water
  float n = fbm(p * 1.3 + vec2(uTime * 0.025, -uTime * 0.018));
  col += smoothstep(0.58, 0.9, n) * 0.05 + ring * 0.05;
  // the awl's soft shadow under the finger
  float pd = length(p - uPress.xy);
  col *= 1.0 - uPress.z * 0.16 * exp(-pd * pd * 700.0);
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.32;
  outColor = vec4(col, 1.0);
}`

const STYLE = `
.eb-intro { position:absolute; inset:0; overflow:hidden; perspective:1500px; background:#e9eee4; }
.eb-intro canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
.eb-intro__shadow { position:absolute; inset:2%; background:rgb(29 53 87 / .45); filter:blur(28px); opacity:0; }
.eb-intro__sheet { position:absolute; inset:0; transform-style:preserve-3d; opacity:0; }
.eb-intro__side { position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; overflow:hidden; box-shadow:0 0 0 1px rgb(120 100 70 / .25); }
.eb-intro__face { transform:rotateX(180deg); }
.eb-intro__ghost { --soak:0; opacity:.3; filter:blur(1.5px);
  -webkit-mask-image:linear-gradient(to top, #000 calc(var(--soak) * 130% - 30%), transparent calc(var(--soak) * 130%));
  mask-image:linear-gradient(to top, #000 calc(var(--soak) * 130% - 30%), transparent calc(var(--soak) * 130%)); }
`

export default function create(host, template, { onOpened }) {
  const root = document.createElement('div')
  root.className = 'eb-intro'
  root.innerHTML =
    `<style>${STYLE}</style><canvas></canvas><div class="eb-intro__shadow"></div>` +
    '<div class="eb-intro__sheet"><div class="eb-intro__side"><canvas></canvas><canvas class="eb-intro__ghost"></canvas></div>' +
    '<div class="eb-intro__side eb-intro__face"><canvas></canvas></div></div>'
  host.appendChild(root)
  const [waterCanvas, shadow, sheet] = [root.children[1], root.children[2], root.children[3]]
  const [backCanvas, ghostCanvas] = sheet.children[0].children
  const faceCanvas = sheet.children[1].children[0]

  const W = root.clientWidth || window.innerWidth
  const H = root.clientHeight || window.innerHeight
  const A = W / H
  const small = Math.min(W, H) < 640
  const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75)

  let gl
  let tray
  let water
  try {
    gl = createGL(waterCanvas)
    // the bath is composed at 1× (it is redrawn every frame while paint moves);
    // the hero re-renders the same sheet sharply from its operations
    const [tw, th] = traySize(W, H, A, Math.min(window.devicePixelRatio || 1, 1.25), 1600)
    tray = createTray(gl, { A, width: tw, height: th, parallel: true })
    water = createProgram(gl, WATER_FRAG, { parallel: true })
  } catch (error) {
    root.remove()
    throw error
  }

  const view = { w: W, h: H, half: [A, 1] }
  const resize = () => {
    const w = root.clientWidth || window.innerWidth
    const h = root.clientHeight || window.innerHeight
    waterCanvas.width = Math.round(w * dpr)
    waterCanvas.height = Math.round(h * dpr)
    const aspect = w / h
    const halfH = Math.min(1, A / aspect)
    Object.assign(view, { w, h, half: [halfH * aspect, halfH] })
  }
  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(root)

  const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
  const names = template.couple
  // the whole sheet is composed up front, so it is the same at 10 fps or 120
  const zoneLayout = cartoucheLayout(W, H, names)
  const zone = { x: ((zoneLayout.rw + 20) * 2) / H, y: ((zoneLayout.rh + 20) * 2) / H }
  const parts = composeSheet(seed, A, zone)

  const ripples = new Float32Array(24)
  let rippleSlot = 0
  let clock = 0
  const ripple = (x, y, amp) => {
    ripples.set([x, y, clock, amp], rippleSlot * 4)
    rippleSlot = (rippleSlot + 1) % 6
  }

  // ops whose values are still changing; the tray never bakes past them
  const active = new Set()
  const firstActive = () => {
    let min = Infinity
    active.forEach((i) => (min = Math.min(min, i)))
    return min
  }
  const push = (op) => {
    if (tray.full) return -1
    tray.ops.push(op)
    tray.touch()
    return tray.ops.length - 1
  }
  // grows an op from nothing to its final value (index 3 for drops, 4 for
  // vortex angle, 5 for strokes and combs) on the timeline
  const grow = (tl, op, at, duration, ease = 'power3.out', onPush) => {
    const slot = op[0] === 0 ? 3 : op[0] === 3 ? 4 : 5
    const final = op[slot]
    const live = op.slice()
    live[slot] = slot === 3 ? 0.0001 : 0
    const proxy = { k: 0 }
    let index = -1
    tl.to(
      proxy,
      {
        k: 1,
        duration,
        ease,
        onStart: () => {
          index = push(live)
          if (index >= 0) active.add(index)
          onPush?.(live)
        },
        onUpdate: () => {
          live[slot] = slot === 3 ? Math.max(0.0001, final * proxy.k) : final * proxy.k
          tray.touch()
        },
        onComplete: () => {
          live[slot] = final
          active.delete(index)
          tray.touch()
        },
      },
      at,
    )
  }

  // battal: the colour is sprinkled drop after drop, quickly at first
  const battalTime = 3.4
  const idle = gsap.timeline({ delay: 0.25 })
  parts.drops.forEach((op, i) => {
    const at = battalTime * Math.pow(i / parts.drops.length, 1.15)
    grow(idle, op, at, 0.28 + op[3] * 0.8, 'power3.out', (live) => {
      if (i % 3 === 0) ripple(live[1], live[2], 0.8)
    })
  })

  let last = performance.now()
  let opening = false
  const press = [0, 0, 0]
  const fade = { clear: 0 }

  let raf = 0
  let shadersReady = false
  waterCanvas.style.visibility = 'hidden'
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    clock += dt
    // shaders compile in the background; the bath shows once they are ready
    if (!shadersReady) {
      try {
        shadersReady = tray.ready() && water.ready()
      } catch (error) {
        console.warn('[ebru] marbling shaders failed:', error?.message ?? error)
        cancelAnimationFrame(raf)
        return
      }
      if (!shadersReady) return
      waterCanvas.style.visibility = 'visible'
    }
    tray.update(Math.min(firstActive(), tray.ops.length))

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, waterCanvas.width, waterCanvas.height)
    gl.useProgram(water)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tray.texture)
    gl.uniform1i(water.u('uTex'), 0)
    gl.uniform2fv(water.u('uHalf'), view.half)
    gl.uniform1f(water.u('uA'), A)
    gl.uniform1f(water.u('uTime'), clock)
    gl.uniform1f(water.u('uClear'), fade.clear)
    gl.uniform4fv(water.u('uRip'), ripples)
    gl.uniform3fv(water.u('uWater'), WATER)
    press[2] += ((dragging ? 1 : 0) - press[2]) * 0.2
    gl.uniform3fv(water.u('uPress'), press)
    drawFullscreen(gl)
  }

  // the guest's awl
  const toPattern = (event) => {
    const rect = root.getBoundingClientRect()
    return [((event.clientX - rect.left) / rect.width * 2 - 1) * view.half[0], -((event.clientY - rect.top) / rect.height * 2 - 1) * view.half[1]]
  }
  let dragging = false
  let lastPoint = null
  let tapPoint = null
  let strokes = 0
  let sinceRipple = 0
  const onDown = (event) => {
    if (opening) return
    dragging = true
    lastPoint = toPattern(event)
    tapPoint = lastPoint
    press[0] = lastPoint[0]
    press[1] = lastPoint[1]
    ripple(lastPoint[0], lastPoint[1], 0.6)
  }
  const onMove = (event) => {
    if (!dragging || opening) return
    const p = toPattern(event)
    press[0] = p[0]
    press[1] = p[1]
    const d = Math.hypot(p[0] - lastPoint[0], p[1] - lastPoint[1])
    if (d < 0.03 || strokes >= 150) return
    strokes += 1
    tray.ops.push(stroke(lastPoint[0], lastPoint[1], p[0], p[1], Math.min(0.09, d * 0.9), 0.028))
    tray.touch()
    sinceRipple += d
    if (sinceRipple > 0.25) {
      ripple(p[0], p[1], 0.35)
      sinceRipple = 0
    }
    lastPoint = p
  }
  const onUp = () => {
    dragging = false
  }
  root.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  // the printed sheet: the guest's pattern, paper grain, cartouche and names
  const lang = template.lang === 'tr' ? 'tr-TR' : 'en-GB'
  const printSheet = () => {
    idle.progress(1)
    tray.update(tray.ops.length)
    const [tw, th] = tray.size
    const pattern = pixelsToCanvas(tray.read(), tw, th)
    const fdpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = Math.round(view.w * fdpr)
    const ch = Math.round(view.h * fdpr)
    const grain = paperGrain()
    for (const c of [faceCanvas, backCanvas, ghostCanvas]) {
      c.width = cw
      c.height = ch
    }
    // face
    const ctx = faceCanvas.getContext('2d')
    ctx.drawImage(pattern, 0, 0, cw, ch)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = ctx.createPattern(grain, 'repeat')
    ctx.fillRect(0, 0, cw, ch)
    ctx.globalCompositeOperation = 'source-over'
    const L = cartoucheLayout(view.w, view.h, names)
    drawCartouche(ctx, L, seed, fdpr)
    ctx.save()
    ctx.scale(fdpr, fdpr)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#1d3557'
    ctx.font = `italic 500 ${L.name}px "Cormorant", Georgia, serif`
    ctx.fillText(names[0], L.cx, L.y1)
    ctx.fillText(names[1], L.cx, L.y2)
    ctx.fillStyle = '#e63946'
    ctx.font = `italic 500 ${L.name * 0.62}px "Cormorant", Georgia, serif`
    ctx.fillText('&', L.cx, L.yAmp)
    ctx.fillStyle = '#1d3557'
    ctx.font = `600 ${L.meta}px "Mulish", system-ui, sans-serif`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${(L.meta * 0.16).toFixed(1)}px`
    ctx.fillText((template.dateLabel ?? '').toLocaleUpperCase(lang), L.cx, L.yDate)
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    ctx.font = `italic 500 ${L.meta * 1.35}px "Cormorant", Georgia, serif`
    ctx.fillStyle = '#457b9d'
    ctx.fillText(template.place ?? '', L.cx, L.yPlace)
    ctx.restore()
    // back of the sheet, and the colour soaking through it
    const back = backCanvas.getContext('2d')
    back.fillStyle = '#f4f0e4'
    back.fillRect(0, 0, cw, ch)
    back.globalCompositeOperation = 'multiply'
    back.fillStyle = back.createPattern(grain, 'repeat')
    back.fillRect(0, 0, cw, ch)
    ghostCanvas.getContext('2d').drawImage(pattern, 0, 0, cw, ch)
    saveSheet({ A, seed, ops: tray.ops })
    saveSnapshot(pattern)
  }

  let timeline = null
  const build = () => {
    opening = true
    dragging = false

    idle.pause()
    // the rest of the battal falls quickly, then the marbler combs
    const remaining = Math.min(0.75, (1 - idle.progress()) * battalTime * 0.3)
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    if (remaining > 0.02) timeline.to(idle, { progress: 1, duration: remaining, ease: 'power1.in' }, 0)
    const t0 = remaining + 0.05
    grow(timeline, parts.combs[0], t0, 0.7, 'power1.inOut')
    grow(timeline, parts.combs[1], t0 + 0.72, 0.5, 'power1.inOut')
    // motifs: tulips and nightingale's nests, plus a tulip where the guest touched
    const tMotif = t0 + 1.25
    const motifs = parts.motifs.map((m) => m.ops)
    if (tapPoint) {
      const unit = 2 / H
      let [lx, ly] = tapPoint
      if (Math.abs(lx) < (zoneLayout.rw + 30) * unit && Math.abs(ly) < (zoneLayout.rh + 30) * unit) ly = (ly < 0 ? -1 : 1) * Math.min(0.86, zoneLayout.rh * unit + 0.15)
      lx = Math.max(-A + 0.1, Math.min(A - 0.1, lx))
      const far = parts.motifs.every((m) => Math.hypot(m.ops[0][1] - lx, m.ops[0][2] - ly) > parts.rMean * 4)
      if (far) {
        const tulip = []
        lale(tulip, lx, ly, Math.min(0.85, (parts.rMean / 0.085) * 0.75), [PAINT.red, PAINT.cream, PAINT.saffron])
        motifs.push(tulip)
      }
    }
    motifs.forEach((ops, m) => {
      ops.forEach((op, i) => grow(timeline, op, tMotif + m * 0.08 + i * 0.03, 0.4, 'power2.out', i === 0 ? (live) => ripple(live[1], live[2], 0.9) : undefined))
    })
    const tPrint = tMotif + 0.6
    timeline.call(
      () => printSheet(),
      null,
      tPrint,
    )
    // the sheet is laid from its lower edge, soaks, and is lifted and turned
    timeline.fromTo(
      sheet,
      { opacity: 0, yPercent: -16, z: 420, rotationX: -30, transformOrigin: '50% 100%' },
      { opacity: 1, yPercent: 0, z: 0, rotationX: 0, duration: 0.84, ease: 'power2.inOut' },
      tPrint + 0.04,
    )
    timeline.fromTo(shadow, { opacity: 0, y: 70, scale: 1.06 }, { opacity: 0.55, y: 24, scale: 1, duration: 0.64, ease: 'power1.in' }, tPrint + 0.04)
    timeline.to(shadow, { opacity: 0, y: 0, duration: 0.24 }, tPrint + 0.68)
    timeline.fromTo(ghostCanvas, { '--soak': 0 }, { '--soak': 1, duration: 0.48, ease: 'power1.out' }, tPrint + 0.76)
    timeline.set(sheet, { transformOrigin: '50% 50%' }, tPrint + 1.28)
    timeline.to(sheet, { z: 240, rotationX: 90, duration: 0.44, ease: 'power2.in' }, tPrint + 1.28)
    timeline.to(sheet, { z: 0, rotationX: 180, duration: 0.48, ease: 'power2.out' }, tPrint + 1.72)
    timeline.to(fade, { clear: 0.85, duration: 0.48 }, tPrint + 1.32)
    timeline.to({}, { duration: 0.36 }, tPrint + 2.2)
  }

  // open() may arrive at any moment, even while drops are still falling;
  // it always schedules the full sequence and never leaves the guest stuck
  const open = () => {
    if (timeline) return
    try {
      build()
    } catch (error) {
      console.warn('[ebru] intro sequence failed, opening directly:', error?.message ?? error)
      timeline?.kill()
      timeline = gsap.timeline({ onComplete: () => onOpened?.() })
      timeline.to({}, { duration: 0.01 })
    }
  }

  raf = requestAnimationFrame(frame)

  return {
    open,
    skip: () => {
      if (!timeline) open()
      timeline.progress(1)
    },
    setPointer: () => {},
    dispose: () => {
      cancelAnimationFrame(raf)
      timeline?.kill()
      idle.kill()
      observer.disconnect()
      root.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      tray.dispose()
      gl.deleteProgram(water)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      root.remove()
    },
  }
}
