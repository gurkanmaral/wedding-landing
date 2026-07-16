import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import decoHero from './assets/med-dream-spark/deco-hero.jpg'
import illoDance from './assets/med-dream-spark/illo-dance.png'

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
  {
    id: '03',
    name: 'Sunny Storybook',
    label: 'Illustrated invite',
    couple: 'Sofia & Luca',
    date: '12 June 2026',
    price: '$119',
    href: '/gilded-rome',
    tone: 'Cream paper, tomato red, hand-drawn ink',
    note: 'A playful illustrated wedding story with chapters, tram story, countdown, map, and RSVP.',
    buttonClass: 'bg-[#28241d] text-white hover:bg-[#1c1915]',
    accentClass: 'bg-[#d84b2a]',
    surfaceClass: 'from-[#f7efd8] via-[#f0dfbe] to-[#d84b2a]',
    image: illoDance,
  },
]

function PreviewArt({ template }) {
  const isArtDeco = template.href === '/artdeco'
  const isIllustrated = template.href === '/gilded-rome'

  return (
    <div className={`relative h-full w-full overflow-hidden ${isArtDeco ? 'bg-[#061c18]' : isIllustrated ? 'bg-[#f6edd5]' : `bg-gradient-to-br ${template.surfaceClass}`}`}>
      {isArtDeco ? (
        <img
          src={template.image}
          alt={`${template.name} preview`}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
        />
      ) : isIllustrated ? (
        <>
          <div className="absolute inset-4 border-2 border-[#28241d]" />
          <div className="absolute -right-7 top-10 h-28 w-28 rounded-full bg-[#d84b2a]/15" />
          <div className="absolute -left-8 bottom-16 h-24 w-24 rounded-full bg-[#28241d]/10" />
          <img
            src={template.image}
            alt={`${template.name} preview`}
            className="absolute left-1/2 top-[42%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </>
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

      <div className={`absolute inset-0 ${isArtDeco ? 'bg-gradient-to-b from-black/20 via-black/10 to-black/55' : isIllustrated ? 'bg-gradient-to-b from-[#f7efd8]/10 via-transparent to-[#f7efd8]/80' : 'bg-gradient-to-b from-black/10 via-transparent to-black/30'}`} />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.26em] ${isArtDeco ? 'text-[#f5d680]' : isIllustrated ? 'text-[#d84b2a]' : 'text-white/75'}`}>
          <span>{template.id}</span>
          <span>RSVP</span>
        </div>

        <div className={`mt-5 border ${isArtDeco ? 'border-[#d9a84a]/55 bg-[#041713]/70 text-[#fff8df]' : isIllustrated ? 'border-[#28241d] bg-[#f7efd8]/80 text-[#28241d] shadow-[6px_6px_0_0_#d84b2a]' : 'border-white/30 bg-white/12 text-white'} p-5 text-center backdrop-blur-sm`}>
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
          <div className={`grid grid-cols-2 gap-3 text-xs ${isArtDeco ? 'text-[#fff8df]' : isIllustrated ? 'text-[#28241d]' : 'text-white'}`}>
            <div className={`${isArtDeco ? 'bg-[#041713]/78' : isIllustrated ? 'border border-[#28241d] bg-[#f7efd8]/85' : 'bg-white/16'} p-3 backdrop-blur-sm`}>
              <p className="uppercase tracking-[0.2em] opacity-60">Venue</p>
              <p className="mt-2 font-medium leading-5">
                {isArtDeco ? 'Villa Aurelia' : isIllustrated ? 'Puglia' : 'Napa Valley'}
              </p>
            </div>
            <div className={`${isArtDeco ? 'bg-[#041713]/78' : isIllustrated ? 'border border-[#28241d] bg-[#f7efd8]/85' : 'bg-white/16'} p-3 backdrop-blur-sm`}>
              <p className="uppercase tracking-[0.2em] opacity-60">Time</p>
              <p className="mt-2 font-medium leading-5">{isIllustrated ? '5:00 PM' : '7:00 PM'}</p>
            </div>
          </div>
          <div className={`flex items-center justify-between ${isArtDeco ? 'bg-[#d9a84a] text-[#041713]' : isIllustrated ? 'bg-[#d84b2a] text-white' : 'bg-white text-[#1f2a5f]'} px-4 py-3 text-sm font-semibold`}>
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
    <div className="home-device mx-auto w-full max-w-[304px]" data-active-preview>
      <span className="absolute -left-[3px] top-28 h-14 w-[3px] rounded-l bg-[#343434]" />
      <span className="absolute -left-[3px] top-48 h-20 w-[3px] rounded-l bg-[#343434]" />
      <span className="absolute -right-[3px] top-36 h-20 w-[3px] rounded-r bg-[#343434]" />
      <div className="relative rounded-[2.7rem] border border-white/15 bg-[#101010] p-2.5 shadow-[0_38px_90px_-28px_rgba(10,18,30,0.7)]">
        <div className="mb-2.5 grid grid-cols-[1fr_auto_1fr] items-center px-4 text-[9px] font-semibold text-white/70">
          <span>9:41</span>
          <div className="h-5 w-20 rounded-full bg-black shadow-inner" />
          <span className="text-right">100%</span>
        </div>
        <div className="h-[510px] overflow-hidden rounded-[2.15rem] bg-stone-100">
          <PreviewArt template={template} />
        </div>
        <div className="mt-2.5 flex justify-center">
          <div className="h-1 w-20 rounded-full bg-stone-700" />
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
        { autoAlpha: 0, y: 20 },
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
        { autoAlpha: 0, x: 18 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.25,
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { autoAlpha: 0.55, y: 12, rotateY: -3, scale: 0.985 },
        { autoAlpha: 1, y: 0, rotateY: 0, scale: 1, duration: 0.65, ease: 'power3.out' },
      )
    }

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      gsap.to(card, {
        x: index === activeIndex ? 5 : 0,
        borderColor: index === activeIndex ? '#171717' : '#deded9',
        duration: 0.4,
        ease: 'power2.out',
      })
    })
  }, [activeIndex])

  const animateCard = (index, x) => {
    if (index === activeIndex || !cardRefs.current[index]) return

    gsap.to(cardRefs.current[index], {
      x,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  return (
    <div ref={rootRef} className="home-shell min-h-screen text-[#171717]">
      <header className="home-header mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="/" className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em]">
          <span className="grid h-8 w-8 place-items-center bg-[#171717] text-[10px] text-white">W</span>
          Wedfolio
        </a>
        <nav className="flex items-center gap-2 text-sm text-stone-600">
          <a href="#dashboard" className="hidden px-3 py-2 transition hover:text-stone-950 sm:block">
            Templates
          </a>
          <a href={activeTemplate.href} className="home-open-button px-4 py-2.5 text-sm font-medium text-white transition">
            Open {activeTemplate.name.split(' ')[0]}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="home-hero mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-20 pt-8 sm:px-8 lg:min-h-[calc(100svh-80px)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pb-14 lg:pt-4">
          <div className="max-w-xl">
            <p data-reveal className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              <span className="h-px w-8 bg-[#e7583d]" />
              Invitation design studio
            </p>
            <h1 data-reveal className="mt-6 text-5xl font-semibold leading-[0.96] tracking-normal text-stone-950 sm:text-6xl lg:text-[4.6rem]">
              Your story,
              <span className="block font-display font-normal italic text-[#e7583d]">beautifully invited.</span>
            </h1>
            <p data-reveal className="mt-6 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
              Explore three distinct wedding experiences. Tap a style to preview it on the phone, then open the complete invitation.
            </p>
            <div data-reveal className="mt-8 flex items-center gap-5">
              <a href={activeTemplate.href} className="home-primary-button px-5 py-3.5 text-sm font-semibold text-white transition">
                View live invitation <span aria-hidden="true">↗</span>
              </a>
              <a href="#dashboard" className="text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900">
                Compare all
              </a>
            </div>
            <div data-reveal className="mt-12 flex items-center gap-4 border-t border-stone-300/70 pt-5 text-xs text-stone-500">
              <span className="font-semibold text-stone-950">03 live designs</span>
              <span className="h-1 w-1 rounded-full bg-[#e7583d]" />
              <span>Mobile ready</span>
              <span className="h-1 w-1 rounded-full bg-[#e7583d]" />
              <span>RSVP included</span>
            </div>
          </div>

          <div data-reveal className="home-preview-stage grid items-center gap-5 px-3 py-8 sm:px-8 lg:grid-cols-[minmax(190px,0.72fr)_304px] lg:px-8">
            <div className="order-2 grid content-center gap-2 lg:order-1">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-500 sm:col-span-3 lg:col-span-1">Choose a design</p>
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  ref={(element) => {
                    cardRefs.current[index] = element
                  }}
                  type="button"
                  data-template-card
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => animateCard(index, 4)}
                  onMouseLeave={() => animateCard(index, 0)}
                  className="home-template-selector group border bg-white/80 p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-stone-900"
                  aria-pressed={activeIndex === index}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-9 w-1.5 shrink-0 ${template.accentClass}`} />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">{template.label}</span>
                      <h2 className="mt-1 truncate text-sm font-semibold text-stone-950">{template.name}</h2>
                    </div>
                    <span className="text-sm text-stone-400 transition group-hover:text-stone-950" aria-hidden="true">→</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between pl-[18px] text-[11px] text-stone-500">
                    <span>{template.date}</span>
                    <span className="font-semibold text-stone-800">{template.price}</span>
                  </div>
                </button>
              ))}
            </div>

            <div ref={previewRef} className="order-1 lg:order-2 [perspective:900px]">
              <DevicePreview template={activeTemplate} />
            </div>
          </div>
        </section>

        <section id="dashboard" className="home-dashboard border-t border-stone-200">
          <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
            <div data-reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e7583d]">
                The collection
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
                Three moods. One celebration.
              </h2>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden border border-stone-200 bg-stone-200 md:grid-cols-3">
              {templates.map((template) => (
                <a
                  key={`dashboard-${template.id}`}
                  href={template.href}
                  data-reveal
                  className="group bg-white p-6 transition hover:bg-[#f7f7f3]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                      {template.id}
                    </span>
                    <span className="text-sm text-stone-500">{template.price}</span>
                  </div>
                  <div className={`mt-8 h-1 w-12 ${template.accentClass} transition-all duration-300 group-hover:w-20`} />
                  <h3 className="mt-5 text-2xl font-semibold text-stone-950">
                    {template.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {template.tone}
                  </p>
                  <span className="mt-8 inline-flex text-sm font-semibold text-stone-950">
                    Open template <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
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
