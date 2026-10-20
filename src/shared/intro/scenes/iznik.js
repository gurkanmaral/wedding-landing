// İznik: a wall of blank glazed tiles. Touching one sends a ripple of cobalt
// across the glaze; the tiles turn over in a wave from that point, revealing
// the painted saz-leaf lattice, and the central tiles form a medallion in
// which the couple's names are painted. The wall is the page hero's wall, so
// the hand-off is seamless.
import { gsap } from 'gsap'
import { buildWall } from '../../../templates/iznik/wall.js'

export const fonts = () => [
  { family: 'Cinzel', weight: 500, google: 'Cinzel:wght@500' },
  { family: 'EB Garamond', style: 'italic', weight: 400, google: 'EB+Garamond:ital@1' },
]

export const copy = {
  en: { prompt: 'Touch a tile to paint the wall' },
  tr: { prompt: 'Duvarı boyamak için bir çiniye dokunun' },
}

export default function create(host, template, { onOpened }) {
  const root = document.createElement('div')
  root.className = 'izw-intro'
  host.appendChild(root)
  const wall = buildWall(root, { mode: 'blank' })

  // names and date, painted into the medallion and the inscription band
  const [name1, name2] = template.couple
  const copyEl = document.createElement('div')
  copyEl.className = 'izw-copy'
  copyEl.style.opacity = '0'
  copyEl.innerHTML =
    '<div class="izw-medal"><p class="izw-names"><span></span><span class="izw-amp">&amp;</span><span></span></p></div>' +
    '<div class="izw-band"><p class="izw-date"></p><p class="izw-place"></p></div>'
  const names = copyEl.querySelector('.izw-names')
  names.style.setProperty('--len', String(Math.max(4, name1.length, name2.length)))
  names.children[0].textContent = name1
  names.children[2].textContent = name2
  copyEl.querySelector('.izw-date').textContent = template.dateLabel ?? ''
  copyEl.querySelector('.izw-place').textContent = template.place ?? ''
  const band = copyEl.querySelector('.izw-band')
  const ripple = document.createElement('div')
  ripple.className = 'izw-ripple'
  wall.el.append(ripple, copyEl)

  // light: follows the pointer, drifts on its own while idle
  const light = { x: 0, y: 0, px: null, py: null, glint: -1 }
  let raf = 0
  const start = performance.now()
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const t = (now - start) / 1000
    const { width, height } = wall.layout
    let tx
    let ty
    if (light.glint >= 0) {
      tx = width * (-0.1 + light.glint * 1.2)
      ty = wall.layout.cy - wall.layout.s * 1.2
    } else if (light.px !== null) {
      tx = (0.5 + light.px * 0.45) * width
      ty = (0.5 + light.py * 0.45) * height
    } else {
      tx = width * (0.5 + 0.34 * Math.sin(t * 0.37))
      ty = height * (0.36 + 0.2 * Math.sin(t * 0.53 + 1))
    }
    const k = light.glint >= 0 ? 0.35 : 0.06
    light.x += (tx - light.x) * k
    light.y += (ty - light.y) * k
    wall.setLight(light.x, light.y)
  }
  light.x = wall.layout.width * 0.3
  light.y = wall.layout.height * 0.3
  raf = requestAnimationFrame(frame)

  // idle: now and then a loose tile rocks and catches the light
  let timeline = null
  const idle = gsap.delayedCall(1.1, function rock() {
    if (timeline) return
    const tile = wall.tiles[Math.floor(Math.random() * wall.tiles.length)]
    gsap.to(tile.card, { rotationX: (Math.random() - 0.5) * 16, rotationY: (Math.random() - 0.5) * 16, duration: 0.32, ease: 'sine.out', yoyo: true, repeat: 1 })
    idle.restart(true)
  })

  let origin = null
  const onDown = (event) => {
    const rect = root.getBoundingClientRect()
    origin = wall.tileAt(event.clientX - rect.left, event.clientY - rect.top)
  }
  host.addEventListener('pointerdown', onDown)

  const open = () => {
    if (timeline) return
    idle.kill()
    const L = wall.layout
    const o = origin ?? { col: 1.5, row: 1.5 }
    const step = 0.13
    const first = 0.16
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    let maxDist = 0
    wall.tiles.forEach((tile) => {
      gsap.killTweensOf(tile.card)
      gsap.set(tile.card, { rotationX: 0, rotationY: 0 })
      const dc = tile.col - o.col
      const dr = tile.row - o.row
      const dist = Math.hypot(dc, dr)
      maxDist = Math.max(maxDist, dist)
      const at = first + dist * step
      const alongX = Math.abs(dc) >= Math.abs(dr)
      const sign = (alongX ? dc : dr) >= 0 ? 1 : -1
      tile.art.style.transform = alongX ? 'rotateY(180deg)' : 'rotateX(180deg)'
      timeline.to(tile.card, alongX ? { rotationY: 180 * sign, scale: 1, duration: 0.78, ease: 'power2.inOut' } : { rotationX: -180 * sign, scale: 1, duration: 0.78, ease: 'power2.inOut' }, at)
      timeline.to(tile.el, { z: L.s * 0.5, duration: 0.36, ease: 'power2.out' }, at)
      timeline.to(tile.el, { z: 0, duration: 0.42, ease: 'power2.in' }, at + 0.36)
      if (dist < 0.75) timeline.to(tile.card, { scale: 0.92, duration: first, ease: 'power2.out' }, 0)
    })

    // the cobalt ripple runs just ahead of the turning tiles
    const cx = L.mx + (o.col + 0.5) * L.s
    const cy = L.my + (o.row + 0.5) * L.s
    const radius = (maxDist + 1.2) * L.s
    gsap.set(ripple, { left: cx - radius, top: cy - radius, width: radius * 2, height: radius * 2, scale: 0.02, opacity: 1 })
    timeline.to(ripple, { scale: 1, duration: (maxDist + 1.2) * step, ease: 'none' }, first)
    timeline.to(ripple, { opacity: 0, duration: 0.5 }, first + maxDist * step * 0.75)

    // names are brushed in once the medallion has turned
    const medalDist = Math.max(...[0, 3].flatMap((c) => [0, 3].map((r) => Math.hypot(c - o.col, r - o.row))))
    const paint = first + medalDist * step + 0.8
    timeline.set(copyEl, { opacity: 1 }, paint)
    timeline.fromTo(names, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, paint)
    timeline.fromTo(band, { opacity: 0, y: L.s * 0.08 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, paint + 0.45)
    timeline.fromTo(light, { glint: 0 }, { glint: 1, duration: 1.3, ease: 'power1.inOut' }, paint + 0.2)
    timeline.set(light, { glint: -1 }, paint + 1.5)
    timeline.to({}, { duration: 0.35 }, Math.max(paint + 1.5, first + maxDist * step + 0.8))
  }

  return {
    open,
    skip: () => {
      if (!timeline) open()
      timeline.progress(1)
    },
    setPointer: (x, y) => {
      light.px = x
      light.py = y
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      idle.kill()
      timeline?.kill()
      wall.tiles.forEach((tile) => gsap.killTweensOf([tile.card, tile.el]))
      host.removeEventListener('pointerdown', onDown)
      wall.dispose()
      root.remove()
    },
  }
}
