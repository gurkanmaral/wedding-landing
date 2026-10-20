// B-Side: the record sleeve fills the screen. Pull (swipe) or tap and the
// record slides out, the sleeve is set aside, the record drops onto the
// platter, the tonearm swings over and lowers — a soft crackle starts — and
// the label spins with the couple's names. The last frame is the page hero.
import { gsap } from 'gsap'
import { createDeckStage, deckTexts, ARM_PLAY } from '../../../templates/b-side/deck.js'

const FRAUNCES = 'Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100'

export const fonts = () => [
  { family: 'Fraunces', weight: 800, google: FRAUNCES },
  { family: 'Space Mono', weight: 700, google: 'Space+Mono:wght@400;700' },
]

export const copy = {
  en: { prompt: 'Slide the record out — tap or swipe' },
  tr: { prompt: 'Plağı kılıfından çıkarın — dokunun ya da kaydırın' },
}

// Vinyl surface noise: hiss, pops and a low rumble, looped. Built on the tap,
// so nothing plays before the guest interacts.
function createCrackle() {
  const Context = window.AudioContext || window.webkitAudioContext
  if (!Context) return null
  let ctx
  try {
    ctx = new Context()
  } catch {
    return null
  }
  const rate = ctx.sampleRate
  const buffer = ctx.createBuffer(1, rate * 3, rate)
  const data = buffer.getChannelData(0)
  let seed = 7
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  let pop = 0
  let rumble = 0
  for (let i = 0; i < data.length; i += 1) {
    if (random() < 0.00035) pop = (0.25 + random() * 0.55) * (random() < 0.5 ? -1 : 1)
    rumble += ((random() * 2 - 1) * 0.02 - rumble) * 0.01
    data[i] = (random() * 2 - 1) * 0.012 + pop + rumble * 2
    pop *= 0.62
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 4200
  const gain = ctx.createGain()
  gain.gain.value = 0
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()

  return {
    // the needle meets the groove: a soft thump, then the crackle
    drop() {
      const now = ctx.currentTime
      const thump = ctx.createOscillator()
      const thumpGain = ctx.createGain()
      thump.frequency.setValueAtTime(70, now)
      thump.frequency.exponentialRampToValueAtTime(38, now + 0.18)
      thumpGain.gain.setValueAtTime(0.0001, now)
      thumpGain.gain.exponentialRampToValueAtTime(0.22, now + 0.012)
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      thump.connect(thumpGain).connect(ctx.destination)
      thump.start(now)
      thump.stop(now + 0.3)
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0.32, now + 0.25)
    },
    fade(seconds) {
      const now = ctx.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + seconds)
    },
    dispose() {
      try {
        source.stop()
      } catch {
        /* already stopped */
      }
      ctx.close?.()
    },
  }
}

export default function create(host, template, { onOpened, setCaption }) {
  const texts = deckTexts({
    partner1: template.couple[0],
    partner2: template.couple[1],
    dateText: template.dateLabel,
    place: template.place,
    date: new Date(`${template.date}T12:00:00`),
    lang: template.lang,
  })
  const stage = createDeckStage(host, { texts })
  const { root, sleeve, record, recordLayer, deckLayer, armLayer, backdrop, armState } = stage
  root.classList.add('bsd-stage--intro')

  const state = { pull: 0, idle: true, done: false, px: 0, py: 0 }
  let start = null
  let audio = null
  let timeline = null
  let springBack = null

  // the sleeve, centred and as large as the screen allows, with the record inside
  const measureStart = () => {
    const { w, h, sleeve: s, record: r } = stage.layout
    const size = Math.min(w * 0.88, h * 0.7)
    start = { cx: w / 2, cy: h * 0.46, sleeveScale: size / s.s, recordScale: (size * 0.94) / r.d, peek: size * 0.08, size }
  }

  const placeIdle = () => {
    gsap.set(sleeve, { x: start.cx, y: start.cy, xPercent: -50, yPercent: -50, scale: start.sleeveScale, rotation: 0 })
    gsap.set(record, { x: start.cx + start.peek, y: start.cy, xPercent: -50, yPercent: -50, scale: start.recordScale, rotation: 0 })
    gsap.set(recordLayer, { zIndex: 1 })
    gsap.set([deckLayer, armLayer], { autoAlpha: 0, y: 70 })
    gsap.set(backdrop, { autoAlpha: 0 })
  }

  stage.measure()
  measureStart()
  placeIdle()

  // idle: the sleeve breathes in the hand; the record follows the pull
  const tick = (time) => {
    if (!state.idle) return
    const bob = Math.sin(time * 1.15) * start.size * 0.006
    const sway = Math.sin(time * 0.7) * 0.8 + state.px * 2.2
    gsap.set(sleeve, { y: start.cy + bob, rotation: sway })
    gsap.set(record, {
      x: start.cx + start.peek + state.pull * start.size,
      y: start.cy + bob + Math.sin(sway * 0.0175) * (start.peek + state.pull * start.size),
      rotation: sway,
    })
  }
  gsap.ticker.add(tick)

  const onResize = () => {
    stage.measure()
    measureStart()
    if (state.done) stage.placeHero()
    else if (!timeline) placeIdle()
  }
  const observer = new ResizeObserver(onResize)
  observer.observe(host)

  // swipe: drag the record out of the sleeve by hand
  let drag = null
  const onDown = (event) => {
    if (timeline) return
    drag = { x: event.clientX }
    springBack?.kill()
  }
  const onMove = (event) => {
    if (!drag || timeline) return
    state.pull = Math.max(0, Math.min(0.32, ((event.clientX - drag.x) / Math.max(host.clientWidth, 1)) * 0.6))
  }
  const onUp = () => {
    drag = null
    if (!timeline) springBack = gsap.to(state, { pull: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)', delay: 0.15 })
  }
  host.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)

  const finish = () => {
    state.done = true
    onOpened?.()
  }

  const open = () => {
    if (timeline) return
    springBack?.kill()
    audio = createCrackle()
    const { sleeve: s, record: r } = stage.layout
    timeline = gsap.timeline({ onComplete: finish })
    timeline
      .to(state, { pull: 0.66, duration: 0.95, ease: 'power2.inOut' }, 0)
      .call(() => {
        state.idle = false
      }, null, 0.95)
      // the sleeve is set aside; the deck rises into view
      .to(sleeve, { x: s.cx, y: s.cy, scale: 1, rotation: s.r, duration: 1.15, ease: 'power3.inOut' }, 0.95)
      .to(backdrop, { autoAlpha: 1, duration: 1.4, ease: 'power1.out' }, 0.9)
      .to([deckLayer, armLayer], { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 1.05)
      .set(recordLayer, { zIndex: 4 }, 1.3)
      // the record floats over the platter and settles onto it
      .to(record, { x: r.cx, y: r.cy, scale: 1.05, rotation: 0, duration: 1.05, ease: 'power3.inOut' }, 1.2)
      .to(record, { scale: 1, duration: 0.35, ease: 'power2.in' }, 2.25)
      .call(() => stage.setSpin(1, 1.1), null, 2.45)
      // tonearm: lift, swing over, lower
      .to(armState, { lift: 1, duration: 0.28, ease: 'power2.out', onUpdate: stage.applyArm }, 2.65)
      .to(armState, { angle: ARM_PLAY, duration: 0.85, ease: 'power2.inOut', onUpdate: stage.applyArm }, 2.85)
      .to(armState, { lift: 0, duration: 0.32, ease: 'power2.in', onUpdate: stage.applyArm }, 3.72)
      .call(() => audio?.drop(), null, 4.02)
      .call(() => setCaption?.('date', 'top'), null, 4.1)
      .call(() => audio?.fade(1.1), null, 5.0)
      .to({}, { duration: 0.01 }, 5.7)
  }

  return {
    open,
    skip: () => {
      if (timeline) timeline.progress(1)
      else {
        state.idle = false
        gsap.set([deckLayer, armLayer, backdrop], { autoAlpha: 1, y: 0 })
        gsap.set(recordLayer, { zIndex: 4 })
        stage.placeHero()
        armState.angle = ARM_PLAY
        stage.applyArm()
        stage.setSpin(1)
        finish()
      }
    },
    setPointer: (x, y) => {
      state.px = x
      state.py = y
      stage.setParallax(x, y)
    },
    dispose: () => {
      timeline?.kill()
      springBack?.kill()
      gsap.ticker.remove(tick)
      observer.disconnect()
      host.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      audio?.dispose()
      stage.dispose()
    },
  }
}
