// Orangerie: the whole screen is the misted pane of a Victorian glasshouse at
// dawn. Behind it, blurred, are ferns, palms and a brass plaque. The guest
// wipes the condensation with a finger (soft erase brush with streaks, beads
// and drips that run down and cut trails); once about 40% is clear the fog
// evaporates, the view eases forward and the plaque with the couple's names
// catches the light. Built from SVG, canvas and CSS (no WebGL); the last frame
// is the page hero's glasshouse.
import { gsap } from 'gsap'
import { mountGlasshouse } from '../../../templates/orangerie/glasshouseArt.js'
import { loop, seeded } from '../foil.js'

export const fonts = () => [
  { family: 'Gloock', google: 'Gloock' },
  { family: 'Pinyon Script', google: 'Pinyon+Script' },
  { family: 'EB Garamond', weight: 500, google: 'EB+Garamond:wght@400;500' },
]

export const copy = {
  en: { prompt: 'Wipe the misted glass with your finger' },
  tr: { prompt: 'Buğulu camı parmağınızla silin' },
}

const THRESHOLD = 0.4
const PUSH = 1.06
const MAX_DRIPS = 22

export default function create(host, template, { onOpened, setCaption }) {
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  root.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#e4eadf;touch-action:none;user-select:none;-webkit-user-select:none'
  host.appendChild(root)

  const sceneBox = document.createElement('div')
  sceneBox.style.cssText = 'position:absolute;inset:0'
  root.appendChild(sceneBox)
  const gh = mountGlasshouse(sceneBox, { names: template.couple, date: template.dateLabel, motion: true })
  gh.world.style.transform = `scale(${PUSH})`

  const fog = document.createElement('canvas')
  const water = document.createElement('canvas')
  for (const c of [fog, water]) {
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none'
    root.appendChild(c)
  }
  const fctx = fog.getContext('2d')
  const wctx = water.getContext('2d')
  const sharp = document.createElement('canvas')
  const sctx = sharp.getContext('2d')

  const S = { W: 1, H: 1, dpr: 1, brush: 30, painted: false }
  const random = seeded(29)
  let disposed = false

  /* --------------------------------------------------------- painters */

  // A water drop: a tiny inverted lens of the sharp view, with rim shading and a glint.
  const drop = (ctx, x, y, r, alpha = 1) => {
    if (r < 0.6) return
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2)
    ctx.clip()
    if (S.painted) {
      const d = S.dpr
      const span = r * 5
      ctx.translate(x, y)
      ctx.scale(1, -1)
      ctx.drawImage(sharp, (x - span / 2) * d, (y - span / 2) * d, span * d, span * d, -r, -r * 1.08, r * 2, r * 2.16)
      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0)
    }
    const rim = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.2, x, y, r * 1.08)
    rim.addColorStop(0, 'rgba(255,255,255,0.12)')
    rim.addColorStop(0.7, 'rgba(255,255,255,0)')
    rim.addColorStop(1, 'rgba(38,58,44,0.42)')
    ctx.fillStyle = rim
    ctx.fillRect(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4)
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = alpha * 0.9
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.ellipse(x - r * 0.32, y - r * 0.42, r * 0.28, r * 0.18, -0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // soft round eraser used for the finger
  const brush = document.createElement('canvas')
  const makeBrush = () => {
    const size = Math.ceil(S.brush * 2)
    brush.width = brush.height = size
    const b = brush.getContext('2d')
    const g = b.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.55, 'rgba(0,0,0,0.92)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    b.fillStyle = g
    b.fillRect(0, 0, size, size)
  }

  const paintFog = () => {
    const { W, H, dpr } = S
    fctx.setTransform(1, 0, 0, 1, 0, 0)
    fctx.globalCompositeOperation = 'source-over'
    fctx.globalAlpha = 1
    fctx.clearRect(0, 0, fog.width, fog.height)
    if (S.painted) {
      // blur by stepping down and back up: smooth in every browser
      const tiny = document.createElement('canvas')
      tiny.width = Math.max(8, Math.round(W / 14))
      tiny.height = Math.max(8, Math.round(H / 14))
      const t = tiny.getContext('2d')
      t.imageSmoothingQuality = 'high'
      t.drawImage(sharp, 0, 0, tiny.width, tiny.height)
      const midC = document.createElement('canvas')
      midC.width = Math.round(W / 5)
      midC.height = Math.round(H / 5)
      const m = midC.getContext('2d')
      m.imageSmoothingQuality = 'high'
      m.drawImage(tiny, 0, 0, midC.width, midC.height)
      fctx.imageSmoothingQuality = 'high'
      fctx.drawImage(midC, 0, 0, fog.width, fog.height)
    } else {
      fctx.fillStyle = '#dfe6da'
      fctx.fillRect(0, 0, fog.width, fog.height)
    }
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // the milky veil of condensation, thicker toward the bottom of the pane
    const veil = fctx.createLinearGradient(0, 0, 0, H)
    veil.addColorStop(0, 'rgba(240,242,234,0.5)')
    veil.addColorStop(0.6, 'rgba(242,240,232,0.58)')
    veil.addColorStop(1, 'rgba(236,238,228,0.7)')
    fctx.fillStyle = veil
    fctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 26; i += 1) {
      const x = random() * W
      const y = random() * H
      const r = (0.1 + random() * 0.3) * Math.max(W, H)
      const g = fctx.createRadialGradient(x, y, 0, x, y, r)
      const light = random() > 0.4
      g.addColorStop(0, light ? 'rgba(255,255,252,0.16)' : 'rgba(150,170,150,0.08)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      fctx.fillStyle = g
      fctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    // micro-condensation: a fine bead texture
    const dots = Math.round((W * H) / 70)
    for (let i = 0; i < dots; i += 1) {
      const x = random() * W
      const y = random() * H
      const r = 0.35 + random() * 0.9
      fctx.fillStyle = random() > 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(80,100,85,0.12)'
      fctx.fillRect(x, y, r, r)
    }
    // larger beads that act as little lenses
    const drops = Math.round((W * H) / 1900)
    for (let i = 0; i < drops; i += 1) {
      const k = random()
      drop(fctx, random() * W, random() * H, 0.9 + k * k * k * 6.5)
    }
  }

  /* ----------------------------------------------------------- layout */

  const grid = { cols: 24, rows: 40, cells: new Uint8Array(24 * 40), count: 0 }
  const layout = async () => {
    const W = host.clientWidth || window.innerWidth
    const H = host.clientHeight || window.innerHeight
    if (W === S.W && H === S.H) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    Object.assign(S, { W, H, dpr, brush: Math.min(W, H) * 0.085 + 10 })
    for (const c of [fog, water, sharp]) {
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
    }
    makeBrush()
    grid.cols = 24
    grid.rows = Math.max(8, Math.round((24 * H) / W))
    grid.cells = new Uint8Array(grid.cols * grid.rows)
    grid.count = 0
    S.painted = false
    paintFog()
    gh.layout()
    await gh.ready
    if (disposed || S.W !== W) return
    // the snapshot is taken with the scene still unpushed, then scaled like the CSS push
    const prev = gh.world.style.transform
    gh.world.style.transform = 'none'
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    sctx.clearRect(0, 0, W, H)
    await gh.snapshot(sctx, PUSH)
    gh.world.style.transform = prev
    if (disposed) return
    S.painted = true
    if (!state.clearing) paintFog()
  }

  /* ------------------------------------------------------------ wiping */

  const state = { clearing: false, opened: false, down: false, moved: 0, last: null, sinceDrip: 0 }
  const drips = []
  const coverage = () => grid.count / grid.cells.length

  const mark = (x, y, r) => {
    const cw = S.W / grid.cols
    const ch = S.H / grid.rows
    const c0 = Math.max(0, Math.floor((x - r) / cw))
    const c1 = Math.min(grid.cols - 1, Math.floor((x + r) / cw))
    const r0 = Math.max(0, Math.floor((y - r) / ch))
    const r1 = Math.min(grid.rows - 1, Math.floor((y + r) / ch))
    for (let row = r0; row <= r1; row += 1) {
      for (let col = c0; col <= c1; col += 1) {
        const i = row * grid.cols + col
        if (grid.cells[i]) continue
        const dx = (col + 0.5) * cw - x
        const dy = (row + 0.5) * ch - y
        if (dx * dx + dy * dy < r * r * 0.8) {
          grid.cells[i] = 1
          grid.count += 1
        }
      }
    }
  }

  const spawnDrip = (x, y, r, speed) => {
    if (drips.length >= MAX_DRIPS) return
    drips.push({ x, y, r, v: speed, stick: 0, px: x, py: y, wob: random() * 6 })
  }

  const wipe = (x0, y0, x1, y1) => {
    const r = S.brush
    const dist = Math.hypot(x1 - x0, y1 - y0)
    const steps = Math.max(1, Math.ceil(dist / (r * 0.3)))
    fctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0)
    fctx.globalCompositeOperation = 'destination-out'
    for (let i = 1; i <= steps; i += 1) {
      const x = x0 + ((x1 - x0) * i) / steps
      const y = y0 + ((y1 - y0) * i) / steps
      fctx.drawImage(brush, x - r, y - r, r * 2, r * 2)
      mark(x, y, r)
    }
    fctx.globalCompositeOperation = 'source-over'
    if (dist > 0.5) {
      // fine streaks the skin leaves behind, parallel to the stroke
      const nx = -(y1 - y0) / dist
      const ny = (x1 - x0) / dist
      fctx.lineCap = 'round'
      for (const k of [-0.62, -0.25, 0.18, 0.55]) {
        fctx.strokeStyle = `rgba(238,240,232,${0.1 + Math.abs(k) * 0.14})`
        fctx.lineWidth = 0.8 + Math.abs(k) * 1.4
        fctx.beginPath()
        fctx.moveTo(x0 + nx * r * k, y0 + ny * r * k)
        fctx.lineTo(x1 + nx * r * k, y1 + ny * r * k)
        fctx.stroke()
      }
      // water pushed to the edge of the stroke gathers into beads and drips
      state.sinceDrip += dist
      if (state.sinceDrip > r * 1.6) {
        state.sinceDrip = 0
        const side = random() > 0.5 ? 1 : -1
        drop(fctx, x1 + nx * r * 0.85 * side, y1 + ny * r * 0.85 * side, 1.5 + random() * 2.2)
        if (random() > 0.35) spawnDrip(x1 + (random() - 0.5) * r, y1 + r * 0.75, 2.4 + random() * 2.6, 30 + random() * 40)
      }
    }
  }

  const point = (event) => {
    const rect = root.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  const onDown = (event) => {
    if (state.clearing) return
    state.down = true
    state.moved = 0
    state.last = point(event)
    root.setPointerCapture?.(event.pointerId)
  }
  const onMove = (event) => {
    if (!state.down || state.clearing) return
    const p = point(event)
    const [lx, ly] = state.last
    state.moved += Math.hypot(p[0] - lx, p[1] - ly)
    if (state.moved > 6) wipe(lx, ly, p[0], p[1])
    state.last = p
    if (!state.opened && coverage() >= THRESHOLD) {
      // hand over to the intro shell, which calls open()
      host.click()
    }
  }
  const onUp = () => {
    state.down = false
  }
  // a drag is a wipe, not a tap: keep it from opening the intro
  const onClick = (event) => {
    if (state.moved > 10) {
      event.stopPropagation()
      state.moved = 0
    }
  }
  root.addEventListener('pointerdown', onDown)
  root.addEventListener('pointermove', onMove)
  root.addEventListener('pointerup', onUp)
  root.addEventListener('pointercancel', onUp)
  root.addEventListener('click', onClick)

  /* ------------------------------------------------------ frame loop */

  let idleDrip = 1.2
  const fx = { evap: 0, fog: 1, water: 1, push: PUSH, blobs: 0 }
  const stop = loop((dt) => {
    // the wall clock, like the hero, so the motes carry on through the hand-off
    gh.tick(performance.now() / 1000)
    // the odd drop slides down the pane on its own
    idleDrip -= dt
    if (idleDrip < 0 && !state.clearing) {
      idleDrip = 0.9 + random() * 1.6
      spawnDrip(random() * S.W, random() * S.H * 0.55, 2.6 + random() * 3.2, 24 + random() * 30)
    }
    wctx.setTransform(1, 0, 0, 1, 0, 0)
    wctx.clearRect(0, 0, water.width, water.height)
    wctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0)
    fctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0)
    for (let i = drips.length - 1; i >= 0; i -= 1) {
      const d = drips[i]
      // stick-slip: drops pause, gather, then run
      d.stick -= dt
      if (d.stick < 0 && random() < dt * 1.4) d.stick = 0.15 + random() * 0.5
      const speed = d.stick > 0 ? 0 : d.v * (0.7 + d.r * 0.08)
      d.px = d.x
      d.py = d.y
      d.y += speed * dt
      d.x += Math.sin(d.y * 0.05 + d.wob) * speed * dt * 0.08
      if (speed > 0) {
        fctx.globalCompositeOperation = 'destination-out'
        fctx.strokeStyle = 'rgba(0,0,0,0.92)'
        fctx.lineCap = 'round'
        fctx.lineWidth = d.r * 1.15
        fctx.beginPath()
        fctx.moveTo(d.px, d.py - d.r * 0.4)
        fctx.lineTo(d.x, d.y - d.r * 0.4)
        fctx.stroke()
        fctx.globalCompositeOperation = 'source-over'
        // the trail leaves a few beads and the drop slowly shrinks
        if (random() < dt * 5) drop(fctx, d.x + (random() - 0.5) * d.r, d.y - d.r * 2, d.r * (0.25 + random() * 0.25))
        d.r -= dt * 0.12
      }
      drop(wctx, d.x, d.y, d.r)
      if (d.y > S.H + 10 || d.r < 1.1) drips.splice(i, 1)
    }
    if (state.clearing) {
      // evaporation: the veil thins in soft patches before fading out
      fctx.globalCompositeOperation = 'destination-out'
      const n = Math.round(fx.blobs)
      for (let i = 0; i < n; i += 1) {
        const x = random() * S.W
        const y = random() * S.H
        const r = (0.12 + random() * 0.22) * Math.max(S.W, S.H)
        const g = fctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, 'rgba(0,0,0,0.16)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        fctx.fillStyle = g
        fctx.fillRect(x - r, y - r, r * 2, r * 2)
      }
      fctx.globalCompositeOperation = 'source-over'
      fog.style.opacity = fx.fog.toFixed(3)
      water.style.opacity = fx.water.toFixed(3)
      gh.world.style.transform = `scale(${fx.push.toFixed(4)})`
    }
  })

  /* ---------------------------------------------------------- opening */

  let timeline = null
  const sheen = { v: 140 }

  const evaporate = (tl, at) => {
    tl.call(() => {
      state.clearing = true
    }, null, at)
      .to(fx, { blobs: 6, duration: 0.6, ease: 'power1.in' }, at)
      .to(fx, { fog: 0, duration: 2.1, ease: 'power2.in' }, at + 0.2)
      .to(fx, { water: 0, duration: 1.4, ease: 'power1.in' }, at + 0.5)
      .to(fx, { push: 1, duration: 3.2, ease: 'power2.inOut' }, at)
      .to(sheen, { v: -40, duration: 1.5, ease: 'power2.inOut', onUpdate: () => gh.setSheen(sheen.v) }, at + 1.5)
      .call(() => setCaption?.('date', 'top'), null, at + 1.8)
      .call(() => setCaption?.(null), null, at + 3.7)
  }

  // A scripted finger sweep for a tap or the button: a zig-zag across the middle.
  const autoWipe = (tl, duration) => {
    const p = { u: 0 }
    let last = null
    const at = (u) => [S.W * (0.5 + 0.36 * Math.sin(u * Math.PI * 5 - Math.PI / 2)), S.H * (0.3 + 0.46 * u)]
    tl.to(p, {
      u: 1,
      duration,
      ease: 'sine.inOut',
      onUpdate: () => {
        const next = at(p.u)
        if (last) wipe(last[0], last[1], next[0], next[1])
        last = next
      },
    }, 0)
    return duration
  }

  const open = () => {
    if (state.opened) return
    state.opened = true
    state.down = false
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    const c = coverage()
    const start = c >= THRESHOLD ? 0 : autoWipe(timeline, c > 0.15 ? 0.8 : 1.4) + 0.1
    evaporate(timeline, start)
    timeline.to({}, { duration: 0.3 }, start + 3.4)
  }

  const resize = new ResizeObserver(() => {
    if (!state.opened) layout()
  })
  resize.observe(host)
  layout()

  return {
    open,
    skip: () => {
      if (!timeline) {
        state.opened = true
        timeline = gsap.timeline({ onComplete: () => onOpened?.() })
        evaporate(timeline, 0)
        timeline.to({}, { duration: 0.3 }, 3.4)
      }
      timeline.progress(1)
    },
    setPointer: (x, y) => {
      if (state.clearing) gh.setParallax(x, y)
    },
    dispose: () => {
      disposed = true
      timeline?.kill()
      stop()
      resize.disconnect()
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointercancel', onUp)
      root.removeEventListener('click', onClick)
      gh.dispose()
      root.remove()
    },
  }
}
