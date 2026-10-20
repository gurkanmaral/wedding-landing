// Cinéma: a dark picture palace seen from the back of the stalls, the
// velvet curtains all but closed and breathing in the house dark. Tap and
// the booth behind us strikes its lamp: the beam stutters over our heads
// into the hall with dust turning in it; the curtains draw back and the academy leader counts down 5-4-3-2-1 with its
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
  en: { prompt: 'Tap to roll film' },
  tr: { prompt: 'Filmi başlatmak için dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const theatre = createTheatre(host, {
    names: template.couple,
    lang: template.lang,
    reduce,
    state: { open: 0.14, light: 0, card: 0, count: 5, beam: 0, zoom: 0.8 },
  })
  const st = theatre.state

  // idle: the hall breathes a little
  const idle = gsap.to(st, { zoom: 0.82, open: 0.17, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })

  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onOpened?.()
  }

  let tl = null
  const build = () => {
    idle.kill()
    tl = gsap.timeline({ onComplete: finish })
    // the lamp strikes with a stutter
    tl.to(st, { beam: 0.7, light: 0.5, duration: 0.05 }, 0.3)
      .to(st, { beam: 0.12, light: 0.1, duration: 0.06 }, 0.36)
      .to(st, { beam: 1, light: 1, duration: 0.3 }, 0.45)
      .to(st, { open: 0.88, zoom: 0.84, duration: 1.7, ease: 'power2.inOut' }, 0.25)
      // academy leader, 0.6 s a number
      .to(st, { count: 0, duration: 3, ease: 'none' }, 0.55)
      .to(st, { flash: 0.85, duration: 0.05 }, 3.55)
      .set(st, { card: 1 }, 3.6)
      .to(st, { flash: 0, duration: 0.3 }, 3.62)
      .call(() => setCaption?.('date', 'bottom'), null, 4.15)
      // curtains part and we move up the aisle into the hero framing
      .to(st, { open: 1, duration: 1.8, ease: 'power3.inOut' }, 4)
      .to(st, { zoom: 1, duration: 1.85, ease: 'power3.inOut' }, 4)
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
      tl?.kill()
      theatre.dispose()
    },
  }
}
