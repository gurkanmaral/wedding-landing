// Oya: on hand-woven linen a needle-lace medallion crochets itself ring by
// ring from the centre, in fast forward. The guest spins it (drag or tap): it
// whirls, the light swings in close behind the viewer so the lace shadow
// swells across the whole screen, the couple's names settle in the centre,
// and the light draws back to the resting composition of the page hero.
import { gsap } from 'gsap'
import { createLight, mountLace } from '../../../templates/oya/laceArt.js'

export const fonts = () => [
  { family: 'Marcellus', google: 'Marcellus' },
  { family: 'Italianno', google: 'Italianno' },
]

export const copy = {
  en: { prompt: 'Spin the lace — drag or tap' },
  tr: { prompt: 'Oyayı çevirin — sürükleyin ya da dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lace = mountLace(host, { blank: true })

  const [name1, name2] = template.couple
  const center = document.createElement('div')
  center.className = 'oya-center'
  center.style.opacity = '0'
  const names = document.createElement('p')
  names.className = 'oya-names'
  const longest = Math.max(name1.length, name2.length, 4)
  names.style.setProperty('--oya-name-size', `${Math.min(7.5, 33 / (0.6 * longest)).toFixed(2)}cqi`)
  ;[name1, '&', name2].forEach((text, i) => {
    const span = document.createElement('span')
    span.textContent = text
    if (i === 1) span.className = 'oya-amp'
    names.appendChild(span)
  })
  center.appendChild(names)
  host.appendChild(center)

  const crochet = lace.crochet(reduce ? 1.2 : 3.2)
  crochet.delay(0.35)

  const rig = { spin: 0, vel: 4, turn: 0, scale: 1, center: 0, boost: 0 }
  const light = createLight(
    (x, y) => {
      const k = 1 - rig.center
      lace.setLight(x * k, y * k)
    },
    { reduce },
  )

  let timeline = null
  const drag = { on: false, angle: 0, total: 0, t: 0 }
  let raf = 0
  let last = performance.now()
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (!drag.on) {
      // flick inertia easing back to a slow idle turn
      rig.vel += ((reduce ? 0 : 4) - rig.vel) * Math.min(1, dt * 1.6)
      rig.spin += rig.vel * dt
    }
    lace.set({ spin: rig.spin + rig.turn, scale: rig.scale, boost: rig.boost })
  }
  raf = requestAnimationFrame(frame)

  const angleAt = (event) => {
    const rect = host.getBoundingClientRect()
    return (Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2) * 180) / Math.PI
  }
  const onDown = (event) => {
    if (timeline) return
    Object.assign(drag, { on: true, angle: angleAt(event), total: 0, t: performance.now() })
  }
  const onMove = (event) => {
    if (!drag.on) return
    const a = angleAt(event)
    let d = a - drag.angle
    if (d > 180) d -= 360
    if (d < -180) d += 360
    drag.angle = a
    drag.total += Math.abs(d)
    rig.spin += d
    const now = performance.now()
    rig.vel = (d / Math.max(0.008, (now - drag.t) / 1000)) * 0.6
    drag.t = now
  }
  const onUp = () => {
    if (!drag.on) return
    drag.on = false
    // a real drag does not always produce a click on touch screens
    if (drag.total > 10) host.click()
  }
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)

  const open = () => {
    if (timeline) return
    drag.on = false
    if (crochet.progress() < 1) crochet.timeScale(5)
    const direction = rig.vel < 0 ? -1 : 1
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .to(rig, { turn: 540 * direction, duration: 2.8, ease: 'power3.out' }, 0)
      .to(rig, { scale: 3.9, center: 1, boost: 1, duration: 1.4, ease: 'power2.in' }, 0.25)
      .fromTo(center, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }, 0.9)
      .call(() => setCaption?.('date', 'bottom'), null, 1.8)
      .to(rig, { scale: 1, center: 0, boost: 0, duration: 1.8, ease: 'power2.inOut' }, 2.2)
      .to({}, { duration: 0.3 }, 4.0)
    if (reduce) timeline.timeScale(2)
  }

  return {
    open,
    skip: () => {
      open()
      crochet.progress(1)
      timeline.progress(1)
    },
    setPointer: (x, y) => light.set(x, y),
    dispose: () => {
      timeline?.kill()
      crochet.kill()
      cancelAnimationFrame(raf)
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      light.dispose()
      center.remove()
      lace.dispose()
    },
  }
}
