// Kına: a sheer red al duvak hangs over the whole screen, breathing in a soft
// draught, the candlelit kına tray glowing through it. Drag it up (or tap) and
// the veil is lifted by its gold-beaded hem, billows and slides away; the
// candles brighten and a henna mandala draws itself around the couple's names.
// The veil is a 2D verlet cloth drawn on canvas; the scene behind is the same
// illustration as the page hero, so the hand-off is seamless.
import { gsap } from 'gsap'
import { seeded } from '../core.js'
import { mountKinaScene } from '../../../templates/kina/kinaArt.js'
import { buildMandala, setMandalaProgress } from '../../../templates/kina/mandala.js'

export const fonts = () => [
  { family: 'Yeseva One', google: 'Yeseva+One' },
  { family: 'Great Vibes', google: 'Great+Vibes' },
]

export const copy = {
  en: { prompt: 'Lift the veil — drag up or tap' },
  tr: { prompt: 'Duvağı kaldırın — yukarı kaydırın ya da dokunun' },
}

// 64 shades of tulle, from the fold shadows to the silk highlights
function tulleShades() {
  const stops = [
    [0, [52, 4, 12]],
    [0.35, [128, 16, 38]],
    [0.62, [182, 30, 54]],
    [0.85, [226, 86, 104]],
    [1, [255, 168, 172]],
  ]
  const out = []
  for (let i = 0; i < 64; i += 1) {
    const t = i / 63
    let k = 0
    while (k < stops.length - 2 && t > stops[k + 1][0]) k += 1
    const [t0, a] = stops[k]
    const [t1, b] = stops[k + 1]
    const u = (t - t0) / (t1 - t0)
    out.push(`rgb(${Math.round(a[0] + (b[0] - a[0]) * u)},${Math.round(a[1] + (b[1] - a[1]) * u)},${Math.round(a[2] + (b[2] - a[2]) * u)})`)
  }
  return out
}

function netPattern(ctx) {
  const tile = document.createElement('canvas')
  tile.width = 6
  tile.height = 6
  const t = tile.getContext('2d')
  t.fillStyle = '#000'
  t.beginPath()
  t.arc(1.5, 1.5, 1.25, 0, Math.PI * 2)
  t.arc(4.5, 4.5, 1.25, 0, Math.PI * 2)
  t.fill()
  return ctx.createPattern(tile, 'repeat')
}

export default function create(host, template, { onOpened, setCaption }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const scene = mountKinaScene(host, { reduce })
  scene.setGlow(0.55)

  // names inside the henna medallion (hidden under the veil until it lifts)
  const [name1, name2] = template.couple
  const medallion = document.createElement('div')
  medallion.className = 'kina-medallion'
  medallion.style.opacity = '0'
  const mandala = buildMandala()
  medallion.appendChild(mandala.svg)
  const names = document.createElement('p')
  names.className = 'kina-names'
  const longest = Math.max(name1.length, name2.length, 4)
  names.style.setProperty('--kina-name-size', `${Math.min(10, 46 / (0.62 * longest)).toFixed(2)}cqi`)
  ;[name1, '&', name2].forEach((text, i) => {
    const span = document.createElement('span')
    span.textContent = text
    if (i === 1) span.className = 'kina-amp'
    names.appendChild(span)
  })
  medallion.appendChild(names)
  host.appendChild(medallion)
  const drawing = { p: 0 }
  setMandalaProgress(mandala, 0)

  // the veil canvas, plus an offscreen canvas the opaque cloth is drawn into
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;'
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const off = document.createElement('canvas')
  const octx = off.getContext('2d')
  const net = netPattern(octx)
  const shades = tulleShades()
  const hemDash = [2, 5]
  const noDash = []

  const cols = small ? 20 : 28
  const rows = small ? 28 : 34
  const n = cols * rows
  const pos = new Float32Array(n * 3)
  const prev = new Float32Array(n * 3)
  const scr = new Float32Array(n * 2)
  const shade = new Float32Array(n)
  const pinX = new Float32Array(cols)
  const random = seeded(77)
  const sequins = []
  for (let i = 0; i < n; i += 1) {
    const r = Math.floor(i / cols)
    if (r > 1 && r < rows - 3 && random() < 0.16) sequins.push(i, random() * 6.28)
  }

  const v = { W: 1, H: 1, dpr: 1, dx: 1, dy: 1, top: 0, F: 1, hem0: 1 }
  let timeline = null
  const rig = { lift: 0, slide: 0, gust: 0, glow: 0.55, veil: 1 }
  const grab = { on: false, col: 0, x: 0, y: 0, offset: 0, startY: 0, moved: 0 }

  const build = () => {
    const rect = host.getBoundingClientRect()
    v.W = rect.width || window.innerWidth
    v.H = rect.height || window.innerHeight
    v.dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = off.width = Math.round(v.W * v.dpr)
    canvas.height = off.height = Math.round(v.H * v.dpr)
    const width = v.W * 1.3
    const height = v.H * 1.16
    v.dx = width / (cols - 1)
    v.dy = height / (rows - 1)
    v.top = -0.05 * v.H
    v.F = 1.6 * Math.max(v.W, v.H)
    v.hem0 = v.top + height
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const i = (r * cols + c) * 3
        // gathered at the top so the tulle falls in soft folds
        const x = v.W / 2 + (c / (cols - 1) - 0.5) * width * 0.9
        pos[i] = x
        pos[i + 1] = v.top + r * v.dy * 0.98
        pos[i + 2] = Math.sin(c * 1.15) * v.dx * 0.45 * Math.min(1, r / 4)
        prev[i] = pos[i]
        prev[i + 1] = pos[i + 1]
        prev[i + 2] = pos[i + 2]
        if (r === 0) pinX[c] = x
      }
    }
  }
  build()
  const observer = new ResizeObserver(() => {
    if (Math.abs((host.clientWidth || 0) - v.W) > 2 || Math.abs((host.clientHeight || 0) - v.H) > 2) build()
  })
  observer.observe(host)

  const satisfy = (a, b, rest, pinnedA) => {
    const ia = a * 3
    const ib = b * 3
    const ddx = pos[ib] - pos[ia]
    const ddy = pos[ib + 1] - pos[ia + 1]
    const ddz = pos[ib + 2] - pos[ia + 2]
    const len = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz) || 1e-6
    const diff = (len - rest) / len
    if (pinnedA) {
      pos[ib] -= ddx * diff
      pos[ib + 1] -= ddy * diff
      pos[ib + 2] -= ddz * diff
      return
    }
    const h = diff * 0.5
    pos[ia] += ddx * h
    pos[ia + 1] += ddy * h
    pos[ia + 2] += ddz * h
    pos[ib] -= ddx * h
    pos[ib + 1] -= ddy * h
    pos[ib + 2] -= ddz * h
  }

  let wx = 0
  let wy = 0
  const step = (h, t) => {
    const { H, F } = v
    const g = 2.6 * H
    const pinY = v.top - rig.slide * 1.6 * H
    const breeze = reduce ? 0.2 : 1
    for (let r = 0; r < rows; r += 1) {
      const depth = r / (rows - 1)
      for (let c = 0; c < cols; c += 1) {
        const i = (r * cols + c) * 3
        if (r === 0) {
          pos[i] = pinX[c] + Math.sin(t * 0.6 + c * 0.3) * 1.5
          pos[i + 1] = pinY
          pos[i + 2] = 0
          prev[i] = pos[i]
          prev[i + 1] = pos[i + 1]
          prev[i + 2] = pos[i + 2]
          continue
        }
        const vx = (pos[i] - prev[i]) * 0.975
        const vy = (pos[i + 1] - prev[i + 1]) * 0.975
        const vz = (pos[i + 2] - prev[i + 2]) * 0.975
        prev[i] = pos[i]
        prev[i + 1] = pos[i + 1]
        prev[i + 2] = pos[i + 2]
        const wave = Math.sin(t * 0.9 + c * 0.42 + r * 0.13) * 0.5 + Math.sin(t * 2.1 + c * 0.9 - r * 0.2) * 0.3
        const az = H * wave * (0.12 + rig.gust * 1.6) * depth * breeze + wy * H * 0.2 * depth
        const ax = H * 0.06 * Math.sin(t * 0.7 + r * 0.2) * depth * breeze + wx * H * 0.25 * depth
        const ay = g * (1 - rig.gust * 0.55)
        pos[i] += vx + ax * h * h
        pos[i + 1] += vy + ay * h * h
        pos[i + 2] += vz + az * h * h
      }
    }

    // lifting by the hem: the last rows rise past the top and billow toward us
    if (rig.lift > 0 || grab.on) {
      for (let r = rows - 2; r < rows; r += 1) {
        const weight = r === rows - 1 ? 1 : 0.45
        for (let c = 0; c < cols; c += 1) {
          const i = (r * cols + c) * 3
          if (rig.lift > 0) {
            const k = 0.2 * Math.min(1, rig.lift * 5) * weight
            const ty = v.hem0 + (pinY - 0.5 * H - v.hem0) * rig.lift
            const tz = Math.sin(rig.lift * Math.PI) * 0.32 * F
            pos[i + 1] += (ty - pos[i + 1]) * k
            pos[i + 2] += (tz - pos[i + 2]) * k
          } else if (grab.on) {
            const dc = Math.abs(c - grab.col)
            if (dc > 4) continue
            const k = 0.28 * (1 - dc / 5) * weight
            pos[i] += (grab.x + (c - grab.col) * v.dx * 0.8 - pos[i]) * k
            pos[i + 1] += (grab.y - pos[i + 1]) * k
            pos[i + 2] += (0.12 * F - pos[i + 2]) * k
          }
        }
      }
    }

    const iterations = small ? 4 : 6
    for (let k = 0; k < iterations; k += 1) {
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const a = r * cols + c
          if (c < cols - 1) satisfy(a, a + 1, v.dx, r === 0)
          if (r < rows - 1) satisfy(a, a + cols, v.dy, r === 0)
        }
      }
    }
    for (let i = 0; i < n; i += 1) {
      const z = pos[i * 3 + 2]
      if (z > 0.55 * F) pos[i * 3 + 2] = 0.55 * F
      else if (z < -0.3 * F) pos[i * 3 + 2] = -0.3 * F
    }
  }

  const project = () => {
    const { W, H, F } = v
    const cx = W / 2
    const cy = H / 2
    const lx = scene.view.tx * W
    const ly = scene.view.top * H
    const reach = 1 / (0.12 * (W * W + H * H))
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const i = r * cols + c
        const p = i * 3
        const z = pos[p + 2]
        const s = F / (F - z)
        const X = cx + (pos[p] - cx) * s
        const Y = cy + (pos[p + 1] - cy) * s
        scr[i * 2] = X
        scr[i * 2 + 1] = Y
        const zl = pos[(r * cols + Math.max(0, c - 1)) * 3 + 2]
        const zr = pos[(r * cols + Math.min(cols - 1, c + 1)) * 3 + 2]
        const zu = pos[(Math.max(0, r - 1) * cols + c) * 3 + 2]
        const zd = pos[(Math.min(rows - 1, r + 1) * cols + c) * 3 + 2]
        const sx = (zr - zl) / (2 * v.dx)
        const sy = (zd - zu) / (2 * v.dy)
        const ddx = X - lx
        const ddy = Y - ly
        const through = Math.exp(-(ddx * ddx + ddy * ddy) * reach) * 0.3 * (0.6 + rig.glow * 0.6)
        const value = 0.52 + sx * 0.5 - sy * 0.22 + (z / F) * 1.1 + through
        shade[i] = value < 0 ? 0 : value > 1 ? 1 : value
      }
    }
  }

  const drawVeil = (t) => {
    const { W, H, dpr } = v
    octx.setTransform(dpr, 0, 0, dpr, 0, 0)
    octx.globalCompositeOperation = 'source-over'
    octx.globalAlpha = 1
    octx.clearRect(0, 0, W, H)
    octx.lineWidth = 1.2
    octx.lineJoin = 'round'
    for (let r = 0; r < rows - 1; r += 1) {
      const a = r * cols
      const b = a + cols
      const minX = scr[a * 2]
      const maxX = scr[(a + cols - 1) * 2]
      const span = maxX - minX
      let fill
      if (span > 2) {
        fill = octx.createLinearGradient(minX, 0, maxX, 0)
        let last = 0
        for (let c = 0; c < cols; c += 1) {
          let o = (scr[(a + c) * 2] - minX) / span
          o = o < last ? last : o > 1 ? 1 : o
          last = o
          fill.addColorStop(o, shades[Math.round(((shade[a + c] + shade[b + c]) / 2) * 63)])
        }
      } else {
        fill = shades[Math.round(shade[a] * 63)]
      }
      octx.fillStyle = fill
      octx.strokeStyle = fill
      octx.beginPath()
      octx.moveTo(scr[a * 2], scr[a * 2 + 1])
      for (let c = 1; c < cols; c += 1) octx.lineTo(scr[(a + c) * 2], scr[(a + c) * 2 + 1])
      for (let c = cols - 1; c >= 0; c -= 1) octx.lineTo(scr[(b + c) * 2], scr[(b + c) * 2 + 1])
      octx.closePath()
      octx.fill()
      octx.stroke()
    }
    // the tulle net
    octx.globalCompositeOperation = 'destination-out'
    octx.globalAlpha = 0.42
    octx.fillStyle = net
    octx.fillRect(0, 0, W, H)
    octx.globalCompositeOperation = 'source-over'
    octx.globalAlpha = 1

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0.86 * rig.veil
    ctx.drawImage(off, 0, 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // scattered sequins (pul) catching the candlelight
    ctx.fillStyle = '#ffd98a'
    for (let k = 0; k < sequins.length; k += 2) {
      const i = sequins[k]
      const tw = 0.5 + 0.5 * Math.sin(t * 2.2 + sequins[k + 1])
      const a = Math.min(1, 0.18 + Math.max(0, shade[i] - 0.5) * 1.6 + tw * 0.25) * rig.veil
      ctx.globalAlpha = a
      ctx.beginPath()
      ctx.arc(scr[i * 2], scr[i * 2 + 1], 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // gold-embroidered hem: a dotted band, the hem line, scallops and bead drops
    ctx.globalAlpha = rig.veil
    ctx.lineCap = 'round'
    const band = (rows - 3) * cols
    ctx.setLineDash(hemDash)
    ctx.strokeStyle = 'rgba(232,190,104,0.85)'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    for (let c = 0; c < cols; c += 1) {
      const i = band + c
      if (c) ctx.lineTo(scr[i * 2], scr[i * 2 + 1])
      else ctx.moveTo(scr[i * 2], scr[i * 2 + 1])
    }
    ctx.stroke()
    ctx.setLineDash(noDash)
    const hem = (rows - 1) * cols
    ctx.strokeStyle = '#d4a24c'
    ctx.lineWidth = 2.6
    ctx.beginPath()
    for (let c = 0; c < cols; c += 1) {
      const i = hem + c
      if (c) ctx.lineTo(scr[i * 2], scr[i * 2 + 1])
      else ctx.moveTo(scr[i * 2], scr[i * 2 + 1])
    }
    ctx.stroke()
    ctx.lineWidth = 1.3
    ctx.strokeStyle = '#e8c070'
    ctx.beginPath()
    for (let c = 0; c < cols - 1; c += 1) {
      const i = hem + c
      const x0 = scr[i * 2]
      const y0 = scr[i * 2 + 1]
      const x1 = scr[(i + 1) * 2]
      const y1 = scr[(i + 1) * 2 + 1]
      ctx.moveTo(x0, y0)
      ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + Math.abs(x1 - x0) * 0.45, x1, y1)
    }
    ctx.stroke()
    ctx.fillStyle = '#f0cf86'
    for (let c = 0; c < cols - 1; c += 1) {
      const i = hem + c
      const x = (scr[i * 2] + scr[(i + 1) * 2]) / 2
      const y = (scr[i * 2 + 1] + scr[(i + 1) * 2 + 1]) / 2
      const drop = Math.abs(scr[(i + 1) * 2] - scr[i * 2]) * 0.45 + 7 + Math.sin(t * 3 + c) * 1.5
      ctx.beginPath()
      ctx.arc(x, y + drop, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  let raf = 0
  let last = performance.now()
  let time = 0
  let acc = 0
  const H_STEP = 1 / 60
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (rig.veil <= 0.001) {
      if (canvas.style.display !== 'none') canvas.style.display = 'none'
      return
    }
    time += dt
    acc += dt
    let steps = 0
    while (acc >= H_STEP && steps < 3) {
      step(H_STEP, time)
      acc -= H_STEP
      steps += 1
    }
    if (steps === 3) acc = 0
    project()
    drawVeil(time)
  }
  raf = requestAnimationFrame(frame)

  // drag the hem up
  const local = (event) => {
    const rect = host.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  const onDown = (event) => {
    if (timeline) return
    const [x, y] = local(event)
    let best = 0
    let bestD = Infinity
    const hem = (rows - 1) * cols
    for (let c = 0; c < cols; c += 1) {
      const d = Math.abs(scr[(hem + c) * 2] - x)
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    Object.assign(grab, { on: true, col: best, x, y: scr[(hem + best) * 2 + 1], offset: scr[(hem + best) * 2 + 1] - y, startY: y, moved: 0 })
  }
  const onMove = (event) => {
    if (!grab.on) return
    const [x, y] = local(event)
    grab.x = x
    grab.y = y + grab.offset
    grab.moved = Math.max(grab.moved, grab.startY - y)
  }
  const onUp = () => {
    if (!grab.on) return
    grab.on = false
    // a real drag does not always produce a click on touch screens
    if (grab.moved > 12) host.click()
  }
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  const open = () => {
    if (timeline) return
    grab.on = false
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(rig, { gust: 1, duration: 0.45, ease: 'power2.out' }, 0)
      .to(rig, { gust: 0.15, duration: 1.4, ease: 'power1.inOut' }, 0.45)
      .to(rig, { lift: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to(rig, { slide: 1, duration: 1.7, ease: 'power2.in' }, 0.7)
      .to(rig, { glow: 1, duration: 1.8, ease: 'sine.inOut', onUpdate: () => scene.setGlow(rig.glow) }, 0.2)
      .to(rig, { veil: 0, duration: 0.5, ease: 'power1.in' }, 2.0)
      .fromTo(medallion, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 1.5)
      .to(drawing, { p: 1, duration: 2.5, ease: 'power1.inOut', onUpdate: () => setMandalaProgress(mandala, drawing.p) }, 1.7)
      .call(() => setCaption?.('date', 'top'), null, 2.5)
      .to({}, { duration: 0.6 }, 4.2)
    if (reduce) timeline.timeScale(2)
  }

  return {
    open,
    skip: () => {
      open()
      timeline.progress(1)
    },
    setPointer: (x, y) => {
      wx = x
      wy = y
      scene.setPointer(x, y)
    },
    dispose: () => {
      timeline?.kill()
      cancelAnimationFrame(raf)
      observer.disconnect()
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      canvas.remove()
      medallion.remove()
      scene.dispose()
    },
  }
}
