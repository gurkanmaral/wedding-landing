// Karaköy kinetic type: the couple's names set huge in Instrument Serif on a
// hairline grid, every glyph a DOM letter on its own spring. Letters lean
// away from the pointer (or the phone's tilt) and spring home; in the intro
// they start scattered at random sizes and angles and are pulled into the
// lockup by a magnet that gets stronger the closer they come. Behind them a
// single-line drawing of the Galata Tower and the Karaköy skyline draws
// itself. Shared by the intro scene and the page hero so the last frame of
// one is the first frame of the other.
import { gsap } from 'gsap'
import { GALATA_PATH, SKY_H, SKY_W, SUN, WATERLINE } from './galata.js'
import './kinetic.css'

const SVG_NS = 'http://www.w3.org/2000/svg'
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const rand = (a, b) => a + Math.random() * (b - a)

function node(tag, className, parent) {
  const el = document.createElement(tag)
  if (className) el.className = className
  parent?.appendChild(el)
  return el
}

function svgNode(tag, attrs, parent) {
  const el = document.createElementNS(SVG_NS, tag)
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  parent?.appendChild(el)
  return el
}

/**
 * host: element to fill (position: relative/absolute, sized).
 * names: [partner1, partner2]
 * mode: 'lockup' (letters at home) or 'scatter' (letters strewn, for the intro)
 * drawn: initial skyline progress 0..1
 * draggable: letters can be picked up and dropped (intro)
 */
export function createKinetic(host, { names, mode = 'lockup', drawn = 1, draggable = false, reduce = false } = {}) {
  const root = node('div', 'kk-stage', host)
  root.setAttribute('aria-hidden', 'true')
  root.dataset.mode = mode

  node('div', 'kk-grid', root)
  const horizon = node('div', 'kk-horizon', root)

  const sky = svgNode('svg', { class: 'kk-sky', viewBox: `0 0 ${SKY_W} ${SKY_H}`, fill: 'none' }, root)
  const sun = svgNode('circle', { class: 'kk-sun', cx: SUN.cx, cy: SUN.cy, r: SUN.r }, sky)
  const line = svgNode('path', { class: 'kk-line', d: GALATA_PATH, pathLength: 1000 }, sky)

  const rules = [node('i', 'kk-rule', root), node('i', 'kk-rule', root), node('i', 'kk-rule', root)]

  // lockup: name / & / name — every glyph a spring
  const lockup = node('div', 'kk-lockup', root)
  const rows = [node('div', 'kk-row kk-row--a', lockup), node('div', 'kk-row kk-row--amp', lockup), node('div', 'kk-row kk-row--b', lockup)]
  const glyphs = []
  const addGlyphs = (row, text) => {
    Array.from(text).forEach((ch) => {
      if (ch === ' ') {
        node('span', 'kk-space', row).textContent = ' '
        return
      }
      const el = node('span', 'kk-glyph', row)
      el.textContent = ch
      glyphs.push({
        el,
        hx: 0,
        hy: 0,
        x: 0,
        y: 0,
        r: 0,
        s: 1,
        vx: 0,
        vy: 0,
        vr: 0,
        vs: 0,
        sx: 0,
        sy: 0,
        sr: 0,
        ss: 1,
        depth: rand(0.4, 1.2),
        phase: rand(0, Math.PI * 2),
        release: Infinity,
        snapped: mode === 'lockup',
        held: false,
      })
    })
  }
  addGlyphs(rows[0], names[0] || '')
  addGlyphs(rows[1], '&')
  addGlyphs(rows[2], names[1] || '')

  const view = { w: 1, h: 1, fs: 100, layout: 'stack' }
  const pointer = { x: 0, y: 0, on: false }
  const tilt = { x: 0, y: 0 }
  let state = mode // lockup | scatter | assemble
  let clock = 0
  let running = false
  let onAssembled = null
  const sky$ = { p: drawn, sun: drawn >= 1 ? 1 : 0 }
  const tweens = []
  let disposed = false

  const applySky = () => {
    line.style.strokeDashoffset = String(1000 * (1 - sky$.p))
    sun.style.opacity = String(sky$.sun)
    sun.style.transform = `scale(${0.4 + sky$.sun * 0.6})`
    horizon.style.transform = `scaleX(${clamp(sky$.p * 1.6, 0, 1)})`
  }

  const scatterTargets = () => {
    const { w, h, fs } = view
    glyphs.forEach((g) => {
      // anywhere on screen, avoiding the very edges
      const px = rand(w * 0.08, w * 0.92)
      const py = rand(h * 0.1, h * 0.86)
      g.sx = px - g.hx
      g.sy = py - g.hy
      g.sr = rand(-48, 48)
      g.ss = rand(0.35, 1.7)
      if (g.ss > 1.3 && fs > 150) g.ss = rand(0.5, 1.1)
    })
  }

  const write = (g) => {
    g.el.style.transform = `translate3d(${g.x.toFixed(2)}px, ${g.y.toFixed(2)}px, 0) rotate(${g.r.toFixed(2)}deg) scale(${g.s.toFixed(4)})`
  }

  /* ---------------------------------------------------------- layout */

  const layout = () => {
    const w = root.clientWidth || window.innerWidth
    const h = root.clientHeight || window.innerHeight
    const isRow = w / h > 1.05
    view.w = w
    view.h = h
    view.layout = isRow ? 'row' : 'stack'
    root.dataset.layout = view.layout

    // skyline: crop around the tower on portrait, show it whole on landscape
    const skyH = isRow ? h * 0.46 : h * 0.36
    const skyBottom = isRow ? h * 0.075 : h * 0.085
    const scale = isRow ? Math.min(w / SKY_W, skyH / SKY_H) : Math.max(w / SKY_W, skyH / SKY_H)
    sky.setAttribute('preserveAspectRatio', isRow ? 'xMidYMax meet' : 'xMidYMax slice')
    sky.style.height = `${skyH}px`
    sky.style.bottom = `${skyBottom}px`
    line.style.strokeWidth = String(1.35 / scale)
    horizon.style.top = `${h - skyBottom - (SKY_H - WATERLINE) * scale}px`

    // fit the names: as big as the width allows, capped by the height
    glyphs.forEach((g) => {
      g.el.style.transform = 'none'
    })
    lockup.style.fontSize = '100px'
    const pad = Math.max(16, w * 0.045)
    let natural
    if (isRow) {
      natural = lockup.scrollWidth
    } else {
      natural = Math.max(rows[0].scrollWidth, rows[2].scrollWidth, 1)
    }
    const maxW = w - pad * 2
    const capH = isRow ? (h * 0.34) / 0.9 : (h * 0.43) / 2.25
    const fs = Math.max(28, Math.min((100 * maxW) / Math.max(natural, 1), capH))
    view.fs = fs
    lockup.style.fontSize = `${fs}px`
    lockup.style.top = `${isRow ? h * 0.205 : h * 0.175}px`
    lockup.style.setProperty('--kk-pad', `${pad}px`)

    const base = root.getBoundingClientRect()
    glyphs.forEach((g) => {
      const r = g.el.getBoundingClientRect()
      g.hx = r.left - base.left + r.width / 2
      g.hy = r.top - base.top + r.height / 2
    })
    // baselines under each row of the lockup
    const rowEls = isRow ? [lockup] : rows
    rules.forEach((rule, i) => {
      const el = rowEls[i]
      if (!el) {
        rule.style.display = 'none'
        return
      }
      rule.style.display = ''
      const r = el.getBoundingClientRect()
      const left = isRow ? r.left - base.left : pad
      const width = isRow ? r.width : w - pad * 2
      rule.style.left = `${left}px`
      rule.style.width = `${width}px`
      rule.style.top = `${r.top - base.top + r.height * (i === 1 ? 0.78 : 0.86)}px`
    })
    if (state === 'scatter') scatterTargets()
    glyphs.forEach(write)
  }

  /* ---------------------------------------------------------- physics */

  const step = (dt) => {
    const { fs } = view
    const R = fs * 0.95
    for (let i = 0; i < glyphs.length; i += 1) {
      const g = glyphs[i]
      let tx = 0
      let ty = 0
      let tr = 0
      let ts = 1
      let k
      let c
      const scattered = state === 'scatter' || (state === 'assemble' && clock < g.release)
      if (g.held) {
        tx = pointer.x - g.hx - g.grabX
        ty = pointer.y - g.hy - g.grabY
        tr = g.sr * 0.3
        ts = Math.max(0.8, g.ss)
        k = 420
        c = 34
      } else if (scattered && !g.snapped) {
        // lazy drift where they fell
        tx = g.sx + Math.sin(clock * 0.35 + g.phase) * fs * 0.12
        ty = g.sy + Math.cos(clock * 0.29 + g.phase * 1.3) * fs * 0.1
        tr = g.sr + Math.sin(clock * 0.4 + g.phase) * 6
        ts = g.ss
        k = 7
        c = 3.2
      } else {
        // home, with a magnet that strengthens as the letter nears its slot
        const d = Math.hypot(g.x, g.y)
        const pull = clamp(1 - d / (fs * 1.4), 0, 1)
        k = state === 'lockup' && g.snapped ? 140 : 70 + 330 * pull * pull
        c = 2 * Math.sqrt(k) * (state === 'lockup' ? 0.62 : 0.5)
        if (state === 'lockup' && !reduce) {
          tx = Math.sin(clock * 0.6 + g.phase) * fs * 0.006 + tilt.x * g.depth * fs * 0.07
          ty = Math.cos(clock * 0.5 + g.phase) * fs * 0.005 + tilt.y * g.depth * fs * 0.05
          tr = Math.sin(clock * 0.45 + g.phase) * 0.5 + tilt.x * g.depth * 3
        }
      }
      // letters lean away from the pointer
      if (pointer.on && !g.held && !reduce) {
        const dx = g.hx + g.x - pointer.x
        const dy = g.hy + g.y - pointer.y
        const d = Math.hypot(dx, dy) || 1
        if (d < R) {
          const f = (1 - d / R) ** 2
          tx += (dx / d) * f * fs * 0.45
          ty += (dy / d) * f * fs * 0.35
          tr += (dx / d) * f * 16
          ts += f * 0.06
        }
      }
      g.vx += (k * (tx - g.x) - c * g.vx) * dt
      g.vy += (k * (ty - g.y) - c * g.vy) * dt
      g.vr += (k * (tr - g.r) - c * g.vr) * dt
      g.vs += (k * (ts - g.s) - c * g.vs) * dt
      g.x += g.vx * dt
      g.y += g.vy * dt
      g.r += g.vr * dt
      g.s += g.vs * dt

      if (state === 'assemble' && !g.snapped && clock >= g.release) {
        const close = Math.hypot(g.x, g.y) < fs * 0.03 && Math.abs(g.r) < 2 && Math.abs(g.s - 1) < 0.05
        if (close) snap(g)
      }
    }
  }

  let snappedCount = glyphs.filter((g) => g.snapped).length
  const snap = (g) => {
    if (g.snapped) return
    g.snapped = true
    snappedCount += 1
    g.el.classList.remove('is-snapped')
    // restart the flash animation
    void g.el.offsetWidth
    g.el.classList.add('is-snapped')
    g.vs += 2.2
    if (snappedCount >= glyphs.length && onAssembled) {
      const done = onAssembled
      onAssembled = null
      done()
    }
  }

  const tick = (_time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 1 / 30)
    clock += dt
    // two sub-steps keep stiff springs stable on slow frames
    step(dt / 2)
    step(dt / 2)
    for (let i = 0; i < glyphs.length; i += 1) write(glyphs[i])
  }

  const start = () => {
    if (running || reduce) return
    running = true
    gsap.ticker.add(tick)
  }
  const stop = () => {
    if (!running) return
    running = false
    gsap.ticker.remove(tick)
  }

  /* --------------------------------------------------------- dragging */

  const toLocal = (event) => {
    const r = root.getBoundingClientRect()
    pointer.x = event.clientX - r.left
    pointer.y = event.clientY - r.top
  }
  let held = null
  const onDown = (event) => {
    const el = event.target.closest?.('.kk-glyph')
    const g = el && glyphs.find((item) => item.el === el)
    if (!g || g.snapped) return
    toLocal(event)
    held = g
    g.held = true
    g.grabX = pointer.x - (g.hx + g.x)
    g.grabY = pointer.y - (g.hy + g.y)
    el.classList.add('is-held')
  }
  const onMove = (event) => {
    if (!held) return
    toLocal(event)
    pointer.on = true
  }
  const onUp = () => {
    if (!held) return
    const g = held
    held = null
    g.held = false
    pointer.on = false
    g.el.classList.remove('is-held')
    // dropped near its slot: the magnet takes it
    if (Math.hypot(g.x, g.y) < view.fs * 0.9) {
      g.release = 0
      snap(g)
    } else {
      g.sx = g.x
      g.sy = g.y
    }
  }
  if (draggable) {
    root.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  /* ------------------------------------------------------------- init */

  let frame = 0
  const relayout = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(layout)
  }
  const ro = new ResizeObserver(relayout)
  ro.observe(root)
  layout()
  // first scatter: letters already strewn when the intro appears
  if (mode === 'scatter') {
    glyphs.forEach((g) => {
      g.x = g.sx
      g.y = g.sy
      g.r = g.sr
      g.s = g.ss
      write(g)
    })
  }
  document.fonts?.load?.(`400 100px "Instrument Serif"`).then(() => !disposed && relayout())
  applySky()
  start()

  const drawSkyline = (to, duration = 2.4, ease = 'power2.inOut') => {
    const tw = gsap.to(sky$, { p: to, duration: reduce ? 0 : duration, ease, onUpdate: applySky })
    tweens.push(tw)
    return tw
  }
  const showSun = (delay = 0) => {
    const tw = gsap.to(sky$, { sun: 1, duration: reduce ? 0 : 0.9, delay, ease: 'back.out(2.2)', onUpdate: applySky })
    tweens.push(tw)
  }

  return {
    root,
    layout,
    drawSkyline,
    // pointer from the intro: -1..1 across the screen
    setPointer(nx, ny) {
      if (held) return
      pointer.x = ((nx + 1) / 2) * view.w
      pointer.y = ((ny + 1) / 2) * view.h
      pointer.on = true
    },
    // pointer from the page: client coordinates
    pointerClient(clientX, clientY) {
      const r = root.getBoundingClientRect()
      pointer.x = clientX - r.left
      pointer.y = clientY - r.top
      pointer.on = pointer.y > -40 && pointer.y < r.height + 40
    },
    clearPointer() {
      pointer.on = false
    },
    setTilt(x, y) {
      tilt.x = clamp(x, -1, 1)
      tilt.y = clamp(y, -1, 1)
    },
    // letters fly home and snap; skyline completes; rules draw
    assemble({ onDone } = {}) {
      onAssembled = onDone ?? null
      state = 'assemble'
      root.dataset.mode = 'assemble'
      // read the names in order, with a little irregularity
      glyphs.forEach((g, i) => {
        if (g.release > clock) g.release = clock + 0.12 + i * 0.075 + Math.random() * 0.12
        g.vx += rand(-60, 60)
        g.vy += rand(-90, -20)
      })
      drawSkyline(1, 2.6, 'power2.inOut')
      showSun(2.2)
      const tw = gsap.delayedCall(0.9, () => root.classList.add('is-ruled'))
      tweens.push(tw)
      // never wait forever for a lazy letter
      tweens.push(
        gsap.delayedCall(3.4, () => {
          glyphs.forEach(snap)
          state = 'lockup'
          root.dataset.mode = 'lockup'
        }),
      )
      if (snappedCount >= glyphs.length) onAssembled?.()
    },
    // jump to the final lockup
    settle() {
      tweens.forEach((tw) => tw.kill())
      state = 'lockup'
      root.dataset.mode = 'lockup'
      root.classList.add('is-ruled')
      glyphs.forEach((g) => {
        Object.assign(g, { x: 0, y: 0, r: 0, s: 1, vx: 0, vy: 0, vr: 0, vs: 0, held: false })
        if (!g.snapped) {
          g.snapped = true
          snappedCount += 1
        }
        write(g)
      })
      sky$.p = 1
      sky$.sun = 1
      applySky()
      onAssembled = null
    },
    // the page hero playing on its own: letters rise into place, line draws
    enter() {
      glyphs.forEach((g, i) => {
        g.y = view.fs * (0.5 + Math.random() * 0.3)
        g.r = rand(-10, 10)
        g.s = 0.9
        g.vy = 0
        g.el.style.opacity = '0'
        tweens.push(gsap.to(g.el, { opacity: 1, duration: 0.5, delay: 0.1 + i * 0.05 }))
      })
      root.classList.add('is-ruled')
      drawSkyline(1, 2.8)
      showSun(2.4)
    },
    setPaused(value) {
      if (value) stop()
      else start()
    },
    dispose() {
      disposed = true
      stop()
      cancelAnimationFrame(frame)
      tweens.forEach((tw) => tw.kill())
      ro.disconnect()
      root.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      root.remove()
    },
  }
}
