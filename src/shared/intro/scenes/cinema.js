// Cinéma: a dark picture palace seen from the back of the stalls, the
// velvet curtains all but closed, a 35 mm projector in the foreground with
// its pilot light blinking. Tap and it clatters on: the reels spin, the lamp
// strikes, the beam stutters into the hall with dust turning in it; the
// curtains draw back and the academy leader counts down 5-4-3-2-1 with its
// rotating sweep, scratches and grain; a white frame, then the title card
// with the couple's names; the date comes up beneath the stage while the
// curtains part fully and we move up the aisle into the page hero.
import { gsap } from 'gsap'
import { createTheatre } from '../../../templates/cinema/theatre.js'

export const fonts = () => [
  { family: 'Limelight', google: 'Limelight' },
  { family: 'Cormorant Garamond', weight: 500, style: 'italic', google: 'Cormorant+Garamond:ital,wght@1,500' },
  { family: 'Josefin Sans', weight: 700, google: 'Josefin+Sans:wght@700' },
]

export const copy = {
  en: { prompt: 'Tap the projector to roll film' },
  tr: { prompt: 'Filmi başlatmak için projektöre dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const theatre = createTheatre(host, {
    names: template.couple,
    lang: template.lang,
    projector: true,
    reduce,
    state: { open: 0.14, light: 0, card: 0, count: 5, beam: 0, zoom: 0.8, origin: 0 },
  })
  const st = theatre.state
  const proj = theatre.projector
  const reels = proj.querySelectorAll('.cn-reel')
  const lamp = proj.querySelector('.cn-lamp')
  const glow = proj.querySelector('.cn-lens-glow')

  // idle: the hall breathes a little
  const idle = gsap.to(st, { zoom: 0.82, open: 0.17, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
  const spin = gsap.to(reels, { rotation: 360, transformOrigin: '50% 50%', duration: 0.8, ease: 'none', repeat: -1, paused: true })

  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onOpened?.()
  }

  let tl = null
  const build = () => {
    idle.kill()
    spin.play()
    spin.timeScale(0.1)
    tl = gsap.timeline({ onComplete: finish })
    tl.to(spin, { timeScale: 1, duration: 0.8, ease: 'power2.in' }, 0)
      // the clatter
      .to(proj, { x: 2.2, y: -1.6, duration: 0.045, repeat: 17, yoyo: true, ease: 'none' }, 0)
      .to(lamp, { opacity: 1, duration: 0.12 }, 0.12)
      .to(glow, { opacity: 1, duration: 0.2 }, 0.28)
      // the lamp strikes with a stutter
      .to(st, { beam: 0.7, light: 0.5, duration: 0.05 }, 0.3)
      .to(st, { beam: 0.12, light: 0.1, duration: 0.06 }, 0.36)
      .to(st, { beam: 1, light: 1, duration: 0.3 }, 0.45)
      .to(st, { open: 0.88, zoom: 0.84, duration: 1.7, ease: 'power2.inOut' }, 0.25)
      // academy leader, 0.6 s a number
      .to(st, { count: 0, duration: 3, ease: 'none' }, 0.55)
      .to(st, { flash: 0.85, duration: 0.05 }, 3.55)
      .set(st, { card: 1 }, 3.6)
      .to(st, { flash: 0, duration: 0.3 }, 3.62)
      .call(() => setCaption?.('date', 'bottom'), null, 4.15)
      // curtains part, we move up the aisle, the projector falls behind us
      .to(st, { open: 1, duration: 1.8, ease: 'power3.inOut' }, 4)
      .to(st, { zoom: 1, duration: 1.85, ease: 'power3.inOut' }, 4)
      .to(st, { origin: 1, duration: 1.7, ease: 'power2.inOut' }, 4.05)
      .to(proj, { yPercent: 130, xPercent: -12, scale: 1.25, opacity: 0, duration: 1.5, ease: 'power2.in' }, 4)
  }

  return {
    open() {
      if (tl) return
      build()
    },
    skip() {
      if (!tl) build()
      setCaption?.('date', 'bottom')
      tl.progress(1)
    },
    setPointer: (x, y) => theatre.setPointer(x, y),
    dispose() {
      idle.kill()
      spin.kill()
      tl?.kill()
      theatre.dispose()
    },
  }
}
