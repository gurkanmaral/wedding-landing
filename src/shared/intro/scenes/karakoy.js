// Karaköy: the letters of the couple's names lie scattered across a warm
// off-white sheet at random sizes and angles, drifting a little; the Galata
// line drawing is only begun. Pick a letter up and drop it near its place
// and the magnet takes it; tap anywhere and every letter flies home and
// snaps into the lockup with a flash of signal orange, the baselines rule
// themselves in, the tower drawing completes and the sun drops in beside it.
// The page hero carries on from exactly this frame.
import { gsap } from 'gsap'
import { createKinetic } from '../../../templates/karakoy/kinetic.js'

export const fonts = () => [
  { family: 'Instrument Serif', google: 'Instrument+Serif:ital@0;1' },
  { family: 'Instrument Serif', style: 'italic' },
]

export const copy = {
  en: { prompt: 'Drag a letter home — or tap to set the names' },
  tr: { prompt: 'Bir harfi yerine sürükleyin ya da dokunun' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const kinetic = createKinetic(host, { names: template.couple, mode: 'scatter', drawn: 0, draggable: true, reduce })
  // the drawing has only just begun
  kinetic.drawSkyline(0.34, 3.6, 'power1.out')

  let finished = false
  let opened = false
  const calls = []
  const finish = () => {
    if (finished) return
    finished = true
    onOpened?.()
  }

  const open = () => {
    if (opened) return
    opened = true
    kinetic.clearPointer()
    kinetic.assemble()
    calls.push(gsap.delayedCall(1.7, () => setCaption?.('date', 'top')))
    calls.push(gsap.delayedCall(4.3, finish))
  }

  return {
    open,
    skip() {
      opened = true
      calls.forEach((c) => c.kill())
      kinetic.clearPointer()
      kinetic.settle()
      setCaption?.('date', 'top')
      finish()
    },
    setPointer: (x, y) => !opened && kinetic.setPointer(x, y),
    dispose() {
      calls.forEach((c) => c.kill())
      kinetic.dispose()
    },
  }
}
