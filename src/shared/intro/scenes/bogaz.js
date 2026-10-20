// Boğaz: a dark Bosphorus night. Running a finger along the shore switches the
// yalı windows on one house at a time; a tap (or enough lit houses) sends the
// bridge lights sweeping, the rest of the shore lights up and a vapur crosses —
// its wake writes the couple's names on the water. The last frame is the page hero.
import { gsap } from 'gsap'
import { mountBosphorus } from '../../../templates/bogaz/bosphorusArt.js'

export const fonts = () => [{ family: 'Great Vibes', google: 'Great+Vibes' }]

export const copy = {
  en: { prompt: 'Trace the shore to light the yalıs' },
  tr: { prompt: 'Parmağınızı kıyıda gezdirin, ışıklar yansın' },
}

export default function create(host, template, { onOpened, setCaption }) {
  const art = mountBosphorus(host, { mode: 'intro' })
  art.setNames(`${template.couple[0]} & ${template.couple[1]}`)

  let timeline = null
  let guestLit = 0
  let autoTimer = 0
  // Opening goes through the stage's own click handler so the intro UI follows along.
  const requestOpen = () => {
    if (!timeline) host.click()
  }

  const onPointer = (event) => {
    if (timeline) return
    const rect = host.getBoundingClientRect()
    if (!rect.width) return
    if (art.lightAt((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)) {
      guestLit += 1
      const enough = Math.min(5, Math.max(2, Math.ceil(art.yaliCount * 0.5)))
      if (guestLit >= enough && !autoTimer) autoTimer = setTimeout(requestOpen, 1100)
    }
  }
  host.addEventListener('pointermove', onPointer)
  host.addEventListener('pointerdown', onPointer)

  const open = () => {
    if (timeline) return
    clearTimeout(autoTimer)
    const { state } = art
    timeline = gsap.timeline({ onComplete: () => onOpened?.() })
    timeline
      .call(() => art.cascade(2.2), null, 0)
      .to(state, { bridgeGlow: 1, duration: 1.4, ease: 'power1.out' }, 0.1)
      .fromTo(state, { sweep: -0.2 }, { sweep: 1.25, duration: 1.9, ease: 'power1.inOut' }, 0.15)
      .fromTo(
        state,
        { ferryX: () => -art.ferryLength - 10 },
        {
          ferryX: () => art.view.W + 40,
          duration: 3.9,
          ease: 'power1.inOut',
          onStart: () => {
            state.ferryScripted = true
          },
        },
        0.45,
      )
      .to(state, { namesAlpha: 1, duration: 0.5 }, 0.6)
      .call(() => setCaption?.('date', 'top'), null, 3.1)
      .fromTo(state, { sweep: -0.2 }, { sweep: 1.25, duration: 1.7, ease: 'power1.inOut' }, 3.2)
      .to(state, { namesAlpha: 0.55, duration: 0.9 }, 4.9)
      .call(() => setCaption?.(null), null, 5.3)
  }

  return {
    open,
    skip: () => (timeline ? timeline.progress(1) : onOpened?.()),
    setPointer: (x, y) => art.setPointer(x, y),
    dispose: () => {
      timeline?.kill()
      clearTimeout(autoTimer)
      host.removeEventListener('pointermove', onPointer)
      host.removeEventListener('pointerdown', onPointer)
      art.dispose()
    },
  }
}
