// The picture palace, in 2D layers: dark auditorium wall, the silver screen
// (a film canvas), painted velvet traveller curtains, a swagged valance with
// brass fringe, the stage lip with its footlights, the projector beam with
// dust turning in it, thrown from the booth behind the audience. Shared by
// the intro and the page hero, so the intro's last frame is the hero's first.
import { gsap } from 'gsap'
import { createFilm } from './film.js'
import { paintCurtain, valanceSvg } from './drapery.js'
import './theatre.css'

let instances = 0
const lerp = (a, b, t) => a + (b - a) * t

/**
 * state (tween it with GSAP):
 *   open   curtains 0 closed … 1 hero position
 *   light  projector lamp on the screen 0..1
 *   card   0 leader … 1 title card
 *   count  leader number, 5 → 0
 *   flash  white frame 0..1
 *   beam   visible beam 0..1
 *   zoom   1 = hero framing; < 1 the hall seen from further back
 */
export function createTheatre(host, { names, lang = 'en', reduce = false, state = {}, onLayout }) {
  instances += 1
  const uid = `cn${instances}`
  const st = { open: 1, light: 1, card: 1, count: 5, flash: 0, beam: 1, zoom: 1, ...state }

  const root = document.createElement('div')
  root.className = 'cn-theatre'
  root.setAttribute('aria-hidden', 'true')
  root.innerHTML = `
    <div class="cn-hall">
      <div class="cn-wall"></div>
      <div class="cn-screen"><canvas></canvas></div>
      <div class="cn-drape cn-drape--left"><div class="cn-drape-body"><canvas></canvas><i class="cn-drape-sheen"></i></div></div>
      <div class="cn-drape cn-drape--right"><div class="cn-drape-body"><canvas></canvas><i class="cn-drape-sheen"></i></div></div>
      <div class="cn-spill"></div>
      <div class="cn-valance"></div>
      <div class="cn-stage"><i class="cn-footlights"></i></div>
    </div>
    <svg class="cn-beam" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${uid}-beam" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#fff6dc" stop-opacity="0.62"/>
          <stop offset="0.22" stop-color="#fff0cc" stop-opacity="0.2"/>
          <stop offset="1" stop-color="#ffeec8" stop-opacity="0.075"/>
        </linearGradient>
        <filter id="${uid}-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
      </defs>
      <polygon fill="url(#${uid}-beam)" filter="url(#${uid}-soft)"/>
    </svg>
    <canvas class="cn-dust"></canvas>
  `
  host.appendChild(root)

  const $ = (sel) => root.querySelector(sel)
  const hall = $('.cn-hall')
  const screenEl = $('.cn-screen')
  const film = createFilm($('.cn-screen canvas'), { names, lang })
  const drapes = [...root.querySelectorAll('.cn-drape')]
  const bodies = drapes.map((d) => d.querySelector('.cn-drape-body'))
  const curtainCanvases = drapes.map((d) => d.querySelector('canvas'))
  const spill = $('.cn-spill')
  const valance = $('.cn-valance')
  const stage = $('.cn-stage')
  const beamSvg = $('.cn-beam')
  const beamPoly = beamSvg.querySelector('polygon')
  const beamGrad = beamSvg.querySelector('linearGradient')
  const dust = $('.cn-dust')
  const dctx = dust.getContext('2d')

  const L = { W: 1, H: 1, portrait: true, sx: 0, sy: 0, sw: 1, sh: 1, scy: 0, closedW: 1, openW: 1, stageY: 1 }
  const small = Math.min(window.innerWidth, window.innerHeight) < 640
  const motes = Array.from({ length: small ? 60 : 140 }, () => ({
    s: Math.random(),
    a: Math.random(),
    b: Math.random(),
    speed: 0.006 + Math.random() * 0.018,
    phase: Math.random() * Math.PI * 2,
    size: 0.6 + Math.random() * 1.6,
  }))

  /* ------------------------------------------------------------ layout */

  let paintTimer = 0
  let painted = false
  const paintDrapes = () => {
    drapes.forEach((_, i) => {
      paintCurtain(curtainCanvases[i], {
        width: L.closedW,
        height: L.stageY + 8,
        side: i ? 'right' : 'left',
        pitch: L.portrait ? 30 : 44,
        seed: i ? 7 : 3,
      })
    })
    painted = true
  }

  const layout = () => {
    const W = root.clientWidth || window.innerWidth
    const H = root.clientHeight || window.innerHeight
    const portrait = W / H < 0.9
    let sw
    let sh
    let scy
    let valH
    let stageY
    if (portrait) {
      sw = W * 0.86
      sh = sw / 1.375
      scy = H * 0.405
      valH = H * 0.2
      stageY = scy + sh / 2 + H * 0.055
    } else {
      sh = H * 0.54
      sw = Math.min(sh * 1.375, W * 0.62)
      sh = sw / 1.375
      scy = H * 0.47
      valH = Math.max(H * 0.17, 90)
      stageY = scy + sh / 2 + H * 0.06
    }
    Object.assign(L, { W, H, portrait, sw, sh, scy, sx: (W - sw) / 2, sy: scy - sh / 2, stageY })
    L.closedW = W / 2 + 16
    L.openW = L.sx + Math.min(18, sw * 0.03)

    hall.style.transformOrigin = `${W / 2}px ${scy}px`
    Object.assign(screenEl.style, { left: `${L.sx}px`, top: `${L.sy}px`, width: `${sw}px`, height: `${sh}px` })
    film.resize(sw, sh)
    Object.assign(spill.style, { left: `${L.sx - sw * 0.35}px`, top: `${L.sy - sh * 0.35}px`, width: `${sw * 1.7}px`, height: `${sh * 1.7}px` })
    drapes.forEach((d) => {
      d.style.width = `${L.closedW}px`
      d.style.height = `${stageY + 8}px`
    })
    valance.style.height = `${valH}px`
    valance.innerHTML = valanceSvg(W * 1.04, valH, uid)
    stage.style.top = `${stageY}px`
    root.style.setProperty('--cn-stage-y', `${stageY}px`)
    host.style.setProperty('--cn-stage-y', `${stageY}px`)
    beamSvg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    dust.width = Math.round(W)
    dust.height = Math.round(H)
    // curtains are expensive to paint: once now, then after resizing settles
    clearTimeout(paintTimer)
    if (!painted) paintDrapes()
    else paintTimer = setTimeout(paintDrapes, 180)
    lastBeam = ''
    film.render(st, 0)
    onLayout?.(L)
  }

  /* ------------------------------------------------------------ frame */

  let clock = 0
  let filmClock = 0
  let flick = 1
  let lastBeam = ''

  const beamGeometry = () => {
    const { W, H, sx, sy, sw, sh, scy } = L
    const z = st.zoom
    const cx = W / 2
    // the screen as it appears after the hall's zoom
    const x0 = cx + (sx - cx) * z
    const x1 = cx + (sx + sw - cx) * z
    const y0 = scy + (sy - scy) * z
    const y1 = scy + (sy + sh - scy) * z
    // the booth port, out of shot behind and above the back row
    const ox = W * 0.5
    const oy = H * 1.14
    return { x0, x1, y0, y1, ox, oy }
  }

  const drawDust = (g, dt) => {
    dctx.clearRect(0, 0, dust.width, dust.height)
    if (st.beam < 0.01) return
    dctx.globalCompositeOperation = 'lighter'
    dctx.fillStyle = '#fff4dc'
    const { x0, x1, y0, y1, ox, oy } = g
    for (let i = 0; i < motes.length; i += 1) {
      const m = motes[i]
      m.s += m.speed * dt * (reduce ? 0 : 1)
      if (m.s > 1) m.s -= 1
      const a = m.a + Math.sin(clock * 0.3 + m.phase) * 0.04
      const b = m.b + Math.cos(clock * 0.23 + m.phase) * 0.05
      const tx = x0 + (x1 - x0) * a
      const ty = y0 + (y1 - y0) * b
      // dust is only lit inside the cone, brightest near the lens
      const s = 0.08 + m.s * 0.86
      const x = ox + (tx - ox) * s
      const y = oy + (ty - oy) * s
      const twinkle = 0.5 + 0.5 * Math.sin(clock * 2.1 + m.phase * 5)
      const alpha = st.beam * flick * (1 - s * 0.55) * (0.25 + twinkle * 0.6)
      dctx.globalAlpha = alpha > 0 ? alpha : 0
      const size = m.size * (1.4 - s * 0.6)
      dctx.fillRect(x, y, size, size)
    }
    dctx.globalAlpha = 1
    dctx.globalCompositeOperation = 'source-over'
  }

  const tick = (_t, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05)
    clock += dt
    filmClock += dt
    hall.style.transform = st.zoom === 1 ? '' : `scale(${st.zoom})`

    const width = lerp(L.closedW, L.openW, st.open)
    const sway = reduce ? 0 : Math.sin(clock * 0.55) * 0.35
    const breathe = reduce ? 1 : 1 + Math.sin(clock * 0.8) * 0.005
    const k = (width / L.closedW) * breathe
    bodies[0].style.transform = `scaleX(${k.toFixed(4)}) skewX(${sway.toFixed(3)}deg)`
    bodies[1].style.transform = `scaleX(${k.toFixed(4)}) skewX(${(-sway * 0.8).toFixed(3)}deg)`

    if (filmClock >= 1 / 24) {
      filmClock = 0
      flick = 0.86 + Math.random() * 0.14
      film.render(st, clock)
      spill.style.opacity = (st.light * flick * 0.55).toFixed(3)
      beamSvg.style.opacity = (st.beam * (0.8 + flick * 0.2)).toFixed(3)
    }

    const g = beamGeometry()
    const key = `${g.ox.toFixed(1)},${g.oy.toFixed(1)} ${g.x0.toFixed(1)},${g.y1.toFixed(1)} ${g.x0.toFixed(1)},${g.y0.toFixed(1)} ${g.x1.toFixed(1)},${g.y0.toFixed(1)} ${g.x1.toFixed(1)},${g.y1.toFixed(1)}`
    if (key !== lastBeam) {
      lastBeam = key
      beamPoly.setAttribute('points', key)
      beamGrad.setAttribute('x1', g.ox.toFixed(1))
      beamGrad.setAttribute('y1', g.oy.toFixed(1))
      beamGrad.setAttribute('x2', ((g.x0 + g.x1) / 2).toFixed(1))
      beamGrad.setAttribute('y2', ((g.y0 + g.y1) / 2).toFixed(1))
    }
    drawDust(g, dt)
  }

  let running = false
  const start = () => {
    if (running) return
    running = true
    gsap.ticker.add(tick)
  }
  const stop = () => {
    if (!running) return
    running = false
    gsap.ticker.remove(tick)
  }

  let frame = 0
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(layout)
  })
  ro.observe(root)
  layout()
  start()

  // the title card needs its typefaces before it is painted for good
  let disposed = false
  if (document.fonts?.load) {
    Promise.all([
      document.fonts.load('400 40px Limelight'),
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
      document.fonts.load('700 40px "Josefin Sans"'),
    ])
      .catch(() => {})
      .then(() => !disposed && film.repaintCard())
  }

  return {
    root,
    state: st,
    layout: () => L,
    setPointer(nx, ny) {
      if (reduce) return
      hall.style.setProperty('--cn-px', nx.toFixed(3))
      hall.style.setProperty('--cn-py', ny.toFixed(3))
    },
    setPaused(value) {
      if (value) stop()
      else start()
    },
    dispose() {
      disposed = true
      stop()
      clearTimeout(paintTimer)
      cancelAnimationFrame(frame)
      ro.disconnect()
      root.remove()
    },
  }
}
