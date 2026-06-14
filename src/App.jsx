import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const templates = [
  {
    id: '01',
    name: 'Rose Gold Classic',
    couple: 'Ayla & Mert',
    date: '24 August 2026',
    mood: 'Elegant RSVP',
    gradient: 'from-rose-200 via-white to-amber-100',
    accent: 'bg-rose-400',
    price: '$79',
    note: 'Soft luxury look with RSVP and venue blocks.',
  },
  {
    id: '02',
    name: 'Moonlight Minimal',
    couple: 'Selin & Can',
    date: '12 September 2026',
    mood: 'Clean Story',
    gradient: 'from-slate-900 via-slate-700 to-slate-500',
    accent: 'bg-slate-800',
    price: '$89',
    note: 'Modern dark mode invitation for premium branding.',
  },
  {
    id: '03',
    name: 'Garden Bloom',
    couple: 'Zeynep & Arda',
    date: '03 May 2027',
    mood: 'Floral Timeline',
    gradient: 'from-emerald-100 via-lime-50 to-white',
    accent: 'bg-emerald-500',
    price: '$84',
    note: 'Nature-inspired layout with a romantic event story.',
  },
  {
    id: '04',
    name: 'Sunset Party',
    couple: 'Ela & Kaan',
    date: '18 June 2026',
    mood: 'Video Invite',
    gradient: 'from-orange-200 via-pink-100 to-fuchsia-100',
    accent: 'bg-orange-400',
    price: '$94',
    note: 'Energetic party feeling with media-first sections.',
  },
  {
    id: '05',
    name: 'Royal Evening',
    couple: 'Duru & Efe',
    date: '07 October 2026',
    mood: 'Premium Landing',
    gradient: 'from-violet-200 via-white to-indigo-100',
    accent: 'bg-violet-500',
    price: '$99',
    note: 'A polished premium concept for upscale wedding brands.',
  },
  {
    id: '06',
    name: 'Celestial Wedding',
    couple: 'Aurora & Elias',
    date: '12 September 2026',
    mood: 'Starlit RSVP',
    gradient: 'from-indigo-950 via-slate-900 to-amber-100',
    accent: 'bg-amber-300',
    price: '$109',
    note: 'A moonlit botanical-celestial page with countdown, story, venue, gallery and RSVP.',
    href: '/celestial',
  },
]

const highlights = [
  'Collect orders for premium invitation templates',
  'Show each design inside a realistic mobile frame',
  'Swap placeholder cards with your real templates later',
]

function PhonePreview({ template }) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="rounded-[3rem] border border-stone-300 bg-stone-950 p-3 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.45)]">
        <div className="mb-3 flex justify-center">
          <div className="h-6 w-28 rounded-full bg-stone-900 shadow-inner shadow-black/60" />
        </div>
        <div
          className={`overflow-hidden rounded-[2.4rem] bg-gradient-to-b ${template.gradient} px-5 pb-5 pt-6`}
        >
          <div className="rounded-[1.8rem] border border-white/70 bg-white/75 p-4 backdrop-blur">
            <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-500">
              <span>{template.id}</span>
              <span>{template.mood}</span>
            </div>
            <div className="space-y-3 rounded-[1.5rem] bg-white px-4 py-5 text-center shadow-lg shadow-stone-300/40">
              <div
                className={`mx-auto h-16 w-16 rounded-full ${template.accent} opacity-80`}
              />
              <p className="text-[11px] uppercase tracking-[0.35em] text-stone-400">
                Wedding Day
              </p>
              <h3 className="font-serif text-[1.8rem] leading-tight text-stone-900">
                {template.couple}
              </h3>
              <p className="text-sm text-stone-500">{template.date}</p>
              <div className="space-y-2 rounded-2xl bg-stone-50 p-3 text-left text-xs text-stone-500">
                <div className="flex items-center justify-between">
                  <span>Ceremony</span>
                  <span>19:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Venue</span>
                  <span>Grand Hall</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>RSVP</span>
                  <span>Active</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/85 px-3 py-2 text-left text-[11px] text-stone-500">
                Theme
                <div className="mt-1 font-semibold text-stone-800">
                  {template.name}
                </div>
              </div>
              <div className="rounded-2xl bg-white/85 px-3 py-2 text-left text-[11px] text-stone-500">
                Price
                <div className="mt-1 font-semibold text-rose-600">
                  {template.price}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="h-1.5 w-24 rounded-full bg-stone-800" />
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const trackRef = useRef(null)
  const detailsRef = useRef(null)
  const phoneRefs = useRef([])

  const nextTemplate = () => {
    setActiveIndex((current) => (current + 1) % templates.length)
  }

  const previousTemplate = () => {
    setActiveIndex((current) => (current - 1 + templates.length) % templates.length)
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-hero-badge], [data-hero-title], [data-hero-copy], [data-hero-actions], [data-hero-panels]',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
        },
      )

      gsap.fromTo(
        '[data-steps-card]',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.1,
          delay: 0.35,
        },
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (trackRef.current) {
      gsap.to(trackRef.current, {
        xPercent: activeIndex * -100,
        duration: 0.75,
        ease: 'power3.inOut',
      })
    }

    if (detailsRef.current) {
      gsap.fromTo(
        detailsRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
      )
    }

    phoneRefs.current.forEach((phone, index) => {
      if (!phone) return

      gsap.to(phone, {
        scale: index === activeIndex ? 1 : 0.92,
        opacity: index === activeIndex ? 1 : 0.45,
        rotate: index === activeIndex ? 0 : index < activeIndex ? -5 : 5,
        duration: 0.6,
        ease: 'power2.out',
      })
    })
  }, [activeIndex])

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-stone-100 text-stone-800"
    >
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 py-8 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 px-6 py-10 shadow-xl shadow-rose-100 backdrop-blur lg:px-10 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span
                data-hero-badge
                className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600"
              >
                Wedding invitation seller website starter
              </span>
              <div className="space-y-4">
                <h1
                  data-hero-title
                  className="max-w-2xl text-4xl font-semibold tracking-tight text-stone-900 lg:text-6xl"
                >
                  Sell digital wedding invitations with elegant mobile previews.
                </h1>
                <p
                  data-hero-copy
                  className="max-w-xl text-base leading-7 text-stone-600 lg:text-lg"
                >
                  This starter gives you a polished landing page, a smoother
                  template carousel, and dashboard-style phone mockups with GSAP
                  animation.
                </p>
              </div>
              <div data-hero-actions className="flex flex-wrap gap-3">
                <a
                  href="#templates"
                  className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                >
                  View template carousel
                </a>
                <a
                  href="/meditteraean"
                  className="rounded-full bg-rose-100 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
                >
                  Open Mediterranean template
                </a>
                <a
                  href="/celestial"
                  className="rounded-full bg-amber-100 px-5 py-3 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
                >
                  Open Celestial template
                </a>
                <a
                  href="#dashboard"
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-rose-300 hover:text-rose-600"
                >
                  Open dashboard concept
                </a>
              </div>
              <div className="grid gap-3 pt-2 text-sm text-stone-600">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-hero-panels
              className="grid gap-4 rounded-[2rem] bg-stone-900 p-5 text-white shadow-2xl shadow-stone-300/50"
            >
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-stone-300">Monthly orders</p>
                  <p className="text-3xl font-semibold">124</p>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm text-emerald-300">
                  +18%
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-stone-300">Active templates</p>
                  <p className="mt-3 text-4xl font-semibold">5</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-stone-300">Pending custom edits</p>
                  <p className="mt-3 text-4xl font-semibold">12</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-gradient-to-br from-rose-400 to-stone-900 p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-rose-100">
                  Seller focus
                </p>
                <p className="mt-3 max-w-sm text-lg font-medium leading-8">
                  Let couples compare invitation styles quickly before they buy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div
            data-steps-card
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-100"
          >
            <p className="text-sm font-medium text-rose-500">Step 1</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-900">
              Add your templates
            </h2>
            <p className="mt-3 text-stone-600">
              Replace the sample cards with your real invitation content,
              screenshots, or live previews.
            </p>
          </div>
          <div
            data-steps-card
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-100"
          >
            <p className="text-sm font-medium text-rose-500">Step 2</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-900">
              Customize pricing
            </h2>
            <p className="mt-3 text-stone-600">
              Add package tiers, WhatsApp contact, payment buttons, or a booking
              form.
            </p>
          </div>
          <div
            data-steps-card
            className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-lg shadow-stone-100"
          >
            <p className="text-sm font-medium text-rose-500">Step 3</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-900">
              Launch fast
            </h2>
            <p className="mt-3 text-stone-600">
              Use this Vite setup for quick iteration while you share template
              ideas later.
            </p>
          </div>
        </section>

        <section id="templates" className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-rose-500">
              Template carousel
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-900 lg:text-4xl">
              Larger phone previews with smoother animation
            </h2>
            <p className="max-w-3xl text-base leading-7 text-stone-600">
              The preview area now uses a carousel instead of a long grid. Each
              template gets a larger device mockup and GSAP-driven transitions.
            </p>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-xl shadow-stone-100 lg:p-6">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-stone-100 to-white p-4 lg:p-8">
                <div ref={trackRef} className="flex">
                  {templates.map((template, index) => (
                    <div
                      key={template.id}
                      className="w-full shrink-0 px-2"
                    >
                      <div
                        ref={(element) => {
                          phoneRefs.current[index] = element
                        }}
                      >
                        <PhonePreview template={template} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={detailsRef}
                className="space-y-5 rounded-[1.8rem] bg-stone-950 p-6 text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-stone-300">
                    Template {templates[activeIndex].id}
                  </span>
                  <span className="text-sm text-rose-300">
                    {activeIndex + 1} / {templates.length}
                  </span>
                </div>

                <div>
                  <h3 className="text-3xl font-semibold">
                    {templates[activeIndex].name}
                  </h3>
                  <p className="mt-2 text-lg text-rose-200">
                    {templates[activeIndex].mood}
                  </p>
                  <p className="mt-4 leading-7 text-stone-300">
                    {templates[activeIndex].note}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                      Couple
                    </p>
                    <p className="mt-2 text-base font-medium">
                      {templates[activeIndex].couple}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                      Price
                    </p>
                    <p className="mt-2 text-base font-medium text-rose-300">
                      {templates[activeIndex].price}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-stone-400">
                      Date
                    </p>
                    <p className="mt-2 text-base font-medium">
                      {templates[activeIndex].date}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={previousTemplate}
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-rose-300 hover:text-rose-200"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={nextTemplate}
                    className="rounded-full bg-rose-400 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-rose-300"
                  >
                    Next template
                  </button>
                  {templates[activeIndex].href && (
                    <a
                      href={templates[activeIndex].href}
                      className="rounded-full bg-white px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-rose-100"
                    >
                      Open page
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {templates.map((template, index) => (
                    <button
                      key={`dot-${template.id}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-3 rounded-full transition ${
                        index === activeIndex
                          ? 'w-10 bg-rose-300'
                          : 'w-3 bg-white/25 hover:bg-white/45'
                      }`}
                      aria-label={`Show ${template.name}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="dashboard"
          className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-white shadow-2xl shadow-stone-300/30 lg:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-5">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-rose-300">
                Dashboard concept
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                A cleaner product dashboard with one strong preview at a time.
              </h2>
              <p className="text-base leading-7 text-stone-300">
                Instead of showing many narrow phones at once, the dashboard idea
                now highlights the active template and lets the user browse with a
                carousel flow.
              </p>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-200">
                  Better focus on each template before purchase
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-200">
                  Space for future screenshots, live demos, or video previews
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-200">
                  Ready for admin actions like edit, duplicate, publish, or sell
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 lg:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template, index) => (
                  <button
                    key={`dashboard-card-${template.id}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${
                      index === activeIndex
                        ? 'border-rose-300 bg-rose-300/10'
                        : 'border-white/10 bg-stone-900/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm text-stone-300">
                      <span>{template.name}</span>
                      <span>{template.price}</span>
                    </div>
                    <p className="mt-3 text-base font-medium text-white">
                      {template.mood}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                      {template.note}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
