import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import decoHero from './assets/med-dream-spark/deco-hero.jpg'

const templates = [
  {
    id: '01',
    name: 'Celestial Wedding',
    label: 'Moonlit invitation',
    couple: 'Aurora & Elias',
    date: '12 September 2026',
    price: '$109',
    href: '/celestial',
    tone: 'Indigo, pearl, warm gold',
    note: 'A romantic starlit page with countdown, venue details, gallery, and RSVP.',
    buttonClass: 'bg-[#1f2a5f] text-white hover:bg-[#18214b]',
    accentClass: 'bg-[#e7bd67]',
    surfaceClass: 'from-[#111936] via-[#27336a] to-[#f4dfae]',
    dark: true,
  },
  {
    id: '02',
    name: 'Art Deco Invitation',
    label: 'Gold editorial',
    couple: 'Elena & Marcus',
    date: '14 September 2026',
    price: '$129',
    href: '/artdeco',
    tone: 'Emerald, black, metallic gold',
    note: 'A polished art deco design with curtain reveal, countdown, map, and RSVP.',
    buttonClass: 'bg-[#06483c] text-white hover:bg-[#053b32]',
    accentClass: 'bg-[#d9a84a]',
    surfaceClass: 'from-[#05372f] via-[#081f1b] to-[#d9a84a]',
    image: decoHero,
  },
]

function PreviewArt({ template }) {
  const isArtDeco = template.href === '/artdeco'

  return (
    <div className={`relative h-full w-full overflow-hidden ${isArtDeco ? 'bg-[#061c18]' : `bg-gradient-to-br ${template.surfaceClass}`}`}>
      {isArtDeco ? (
        <img
          src={template.image}
          alt={`${template.name} preview`}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
        />
      ) : (
        <>
          <div className="absolute left-8 top-12 h-1.5 w-1.5 rounded-full bg-white/90" />
          <div className="absolute right-10 top-24 h-1 w-1 rounded-full bg-white/75" />
          <div className="absolute bottom-28 left-12 h-1 w-1 rounded-full bg-white/70" />
          <div className="absolute bottom-36 right-8 h-1.5 w-1.5 rounded-full bg-white/85" />
          <div className="absolute left-1/2 top-28 h-32 w-32 -translate-x-1/2 rounded-full border border-white/25" />
          <div className="absolute inset-x-10 top-44 h-px bg-white/30" />
        </>
      )}

      <div className={`absolute inset-0 ${isArtDeco ? 'bg-gradient-to-b from-black/20 via-black/10 to-black/55' : 'bg-gradient-to-b from-black/10 via-transparent to-black/30'}`} />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.26em] ${isArtDeco ? 'text-[#f5d680]' : 'text-white/75'}`}>
          <span>{template.id}</span>
          <span>RSVP</span>
        </div>

        <div className={`mt-5 border ${isArtDeco ? 'border-[#d9a84a]/55 bg-[#041713]/70 text-[#fff8df]' : 'border-white/30 bg-white/12 text-white'} p-5 text-center backdrop-blur-sm`}>
          <p className="text-[10px] uppercase tracking-[0.34em] opacity-75">
            {template.label}
          </p>
          <h3 className="mt-5 font-display text-5xl leading-[0.92]">
            {template.couple.split(' & ')[0]}
            <span className="block text-3xl">&</span>
            {template.couple.split(' & ')[1]}
          </h3>
          <p className="mt-5 text-xs uppercase tracking-[0.24em] opacity-80">
            {template.date}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className={`grid grid-cols-2 gap-3 text-xs ${isArtDeco ? 'text-[#fff8df]' : 'text-white'}`}>
            <div className={`${isArtDeco ? 'bg-[#041713]/78' : 'bg-white/16'} p-3 backdrop-blur-sm`}>
              <p className="uppercase tracking-[0.2em] opacity-60">Venue</p>
              <p className="mt-2 font-medium leading-5">
                {isArtDeco ? 'Villa Aurelia' : 'Napa Valley'}
              </p>
            </div>
            <div className={`${isArtDeco ? 'bg-[#041713]/78' : 'bg-white/16'} p-3 backdrop-blur-sm`}>
              <p className="uppercase tracking-[0.2em] opacity-60">Time</p>
              <p className="mt-2 font-medium leading-5">7:00 PM</p>
            </div>
          </div>
          <div className={`flex items-center justify-between ${isArtDeco ? 'bg-[#d9a84a] text-[#041713]' : 'bg-white text-[#1f2a5f]'} px-4 py-3 text-sm font-semibold`}>
            <span>View invitation</span>
            <span>{template.price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DevicePreview({ template }) {
  return (
    <div className="mx-auto w-full max-w-[330px]" data-active-preview>
      <div className="rounded-[2.5rem] border border-stone-300 bg-[#111111] p-3 shadow-[0_28px_80px_-34px_rgba(12,18,32,0.85)]">
        <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center px-5 text-[10px] font-semibold text-white/70">
          <span>9:41</span>
          <div className="h-5 w-24 rounded-full bg-black" />
          <span className="text-right">100%</span>
        </div>
        <div className="h-[560px] overflow-hidden rounded-[2rem] bg-stone-100">
          <PreviewArt template={template} />
        </div>
        <div className="mt-3 flex justify-center">
          <div className="h-1 w-20 rounded-full bg-stone-800" />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const previewRef = useRef(null)
  const cardRefs = useRef([])
  const activeTemplate = templates[activeIndex]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-reveal]',
        { autoAlpha: 0, y: 22 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
        },
      )

      gsap.fromTo(
        '[data-template-card]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.2,
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { autoAlpha: 0, y: 18, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out' },
      )
    }

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      gsap.to(card, {
        y: index === activeIndex ? -4 : 0,
        borderColor: index === activeIndex ? '#1c1917' : '#e7e5e4',
        duration: 0.35,
        ease: 'power2.out',
      })
    })
  }, [activeIndex])

  const animateCard = (index, y) => {
    if (index === activeIndex || !cardRefs.current[index]) return

    gsap.to(cardRefs.current[index], {
      y,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  return (
    <div ref={rootRef} className="min-h-screen bg-[#f8f7f4] text-[#1c1917]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="text-sm font-semibold uppercase tracking-[0.24em]">
          Wedfolio
        </a>
        <nav className="flex items-center gap-2 text-sm text-stone-600">
          <a href="#dashboard" className="px-3 py-2 transition hover:text-stone-950">
            Templates
          </a>
          <a href={activeTemplate.href} className={`px-4 py-2 text-sm font-medium transition ${activeTemplate.buttonClass}`}>
            Open preview
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p data-reveal className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
              Digital wedding invitations
            </p>
            <h1 data-reveal className="mt-5 text-5xl font-semibold leading-[0.98] tracking-normal text-stone-950 sm:text-6xl lg:text-7xl">
              Two refined templates. One clear choice.
            </h1>
            <p data-reveal className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Browse the Celestial and Art Deco wedding pages, compare their mood,
              and open the live invitation in one click.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              <a href="/celestial" className="bg-[#1f2a5f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#18214b]">
                Open Celestial
              </a>
              <a href="/artdeco" className="border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-950">
                Open Art Deco
              </a>
            </div>
            <dl data-reveal className="mt-10 grid max-w-lg grid-cols-3 border-y border-stone-200 py-5">
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Live</dt>
                <dd className="mt-2 text-2xl font-semibold">2</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Start</dt>
                <dd className="mt-2 text-2xl font-semibold">$109</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">RSVP</dt>
                <dd className="mt-2 text-2xl font-semibold">Yes</dd>
              </div>
            </dl>
          </div>

          <div data-reveal className="grid gap-5 lg:grid-cols-[1fr_330px]">
            <div className="order-2 grid content-center gap-3 lg:order-1">
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  ref={(element) => {
                    cardRefs.current[index] = element
                  }}
                  type="button"
                  data-template-card
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => animateCard(index, -3)}
                  onMouseLeave={() => animateCard(index, 0)}
                  className="border bg-white p-5 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-stone-900"
                  aria-pressed={activeIndex === index}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      {template.label}
                    </span>
                    <span className={`h-3 w-3 ${template.accentClass}`} />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-normal text-stone-950">
                    {template.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {template.note}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4 text-sm">
                    <span>{template.price}</span>
                    <span className="text-stone-500">{template.date}</span>
                  </div>
                </button>
              ))}
            </div>

            <div ref={previewRef} className="order-1 lg:order-2">
              <DevicePreview template={activeTemplate} />
            </div>
          </div>
        </section>

        <section id="dashboard" className="border-t border-stone-200 bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div data-reveal>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-stone-500">
                Template dashboard
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-stone-950 sm:text-4xl">
                Simple, focused, ready to open.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <a
                  key={`dashboard-${template.id}`}
                  href={template.href}
                  data-reveal
                  className="group border border-stone-200 bg-[#f8f7f4] p-5 transition hover:-translate-y-1 hover:border-stone-950"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      {template.id}
                    </span>
                    <span className="text-sm text-stone-500">{template.price}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-stone-950">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {template.tone}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-medium text-stone-950">
                    Open template
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
