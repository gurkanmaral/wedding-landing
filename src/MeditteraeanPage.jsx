import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import lemons from './assets/med-dream-spark/lemons.jpg'
import table from './assets/med-dream-spark/table.jpg'
import boat from './assets/med-dream-spark/boat.jpg'
import door from './assets/med-dream-spark/door.jpg'

gsap.registerPlugin(ScrollTrigger)

const moments = [
  {
    n: '01',
    img: lemons,
    title: 'Welcome Story',
    description:
      'Introduce the couple, your opening message, or a short romantic welcome for guests.',
  },
  {
    n: '02',
    img: table,
    title: 'Event Details',
    description:
      'Use this block for venue, dress code, RSVP timing, or celebration flow.',
  },
  {
    n: '03',
    img: boat,
    title: 'Photo Moment',
    description:
      'Show gallery images, couple portraits, or a signature memory from the day.',
  },
]

const timelineItems = [
  {
    time: '16:30',
    title: 'Guest Arrival',
    description: 'Welcome drinks, live music, and first gathering moments.',
  },
  {
    time: '18:00',
    title: 'Ceremony',
    description: 'Main vows, couple entrance, and opening celebration photos.',
  },
  {
    time: '20:00',
    title: 'Dinner & Party',
    description: 'Dinner service, speeches, cake, and dancing under the lights.',
  },
]

const detailCards = [
  {
    label: 'Dress code',
    value: 'Elegant coastal',
    note: 'Swap this for formal, semi-formal, or custom styling notes.',
  },
  {
    label: 'RSVP deadline',
    value: '01 July 2027',
    note: 'Keep a clear response date for guests and planning.',
  },
  {
    label: 'After party',
    value: 'Beach lounge',
    note: 'Perfect for an extra section with music or location details.',
  },
]

const faqItems = [
  {
    question: 'Can this section show accommodation info?',
    answer:
      'Yes. Replace this answer with hotel blocks, shuttle details, or local recommendations.',
  },
  {
    question: 'Can I reuse this layout for another couple?',
    answer:
      'Yes. This template is structured so names, dates, venue details, and photos can be changed quickly.',
  },
  {
    question: 'Can this be connected to a real RSVP form?',
    answer:
      'Yes. The CTA areas can later be connected to a form, WhatsApp link, or payment flow.',
  },
]

const templateDate = new Date('2027-08-12T18:00:00')

function getCountdownParts(targetDate) {
  const difference = Math.max(targetDate.getTime() - Date.now(), 0)
  const totalSeconds = Math.floor(difference / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    { label: 'Days', value: String(days).padStart(2, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Minutes', value: String(minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(seconds).padStart(2, '0') },
  ]
}

function CountdownDigit({ value }) {
  const wrapperRef = useRef(null)
  const currentRef = useRef(null)
  const previousRef = useRef(null)
  const [displayValue, setDisplayValue] = useState(value)
  const [previousValue, setPreviousValue] = useState(null)

  useEffect(() => {
    if (value === displayValue) return

    setPreviousValue(displayValue)
    setDisplayValue(value)
  }, [value, displayValue])

  useEffect(() => {
    if (!previousValue || !currentRef.current || !previousRef.current) return

    const ctx = gsap.context(() => {
      gsap.set(currentRef.current, { yPercent: -115, opacity: 0 })

      gsap.to(previousRef.current, {
        yPercent: 135,
        xPercent: 8,
        rotate: 10,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      })

      gsap.to(currentRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.58,
        ease: 'bounce.out',
        onComplete: () => {
          setPreviousValue(null)
          gsap.set(currentRef.current, { clearProps: 'all' })
        },
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [previousValue, displayValue])

  return (
    <div
      ref={wrapperRef}
      className="relative h-[1.1em] w-[0.75em] overflow-hidden"
      aria-hidden="true"
    >
      {previousValue !== null && (
        <span
          ref={previousRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          {previousValue}
        </span>
      )}
      <span
        ref={currentRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {displayValue}
      </span>
    </div>
  )
}

function MeditteraeanPage() {
  const root = useRef(null)
  const [countdown, setCountdown] = useState(() => getCountdownParts(templateDate))

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownParts(templateDate))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8 })
        .from(
          '.hero-word',
          { y: 80, opacity: 0, duration: 1, stagger: 0.12 },
          '-=0.4',
        )
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-meta', { opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.3')
        .from('.hero-panel', { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.4')

      gsap.to('.hero-img', {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.utils.toArray('.reveal').forEach((element) => {
        gsap.from(element, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
        })
      })

      gsap.utils.toArray('[data-text-group]').forEach((element) => {
        const targets = element.querySelectorAll('[data-text-item]')
        if (!targets.length) return

        gsap.from(targets, {
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: element,
            start: 'top 82%',
          },
        })
      })

      gsap.utils.toArray('[data-card-grid]').forEach((element) => {
        const cards = element.querySelectorAll('[data-card-item]')
        if (!cards.length) return

        gsap.from(cards, {
          y: 36,
          opacity: 0,
          scale: 0.97,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: element,
            start: 'top 80%',
          },
        })
      })

      gsap.from('.countdown-shell', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.countdown-shell',
          start: 'top 82%',
        },
      })

      gsap.from('.countdown-card', {
        y: 42,
        opacity: 0,
        scale: 0.92,
        duration: 0.9,
        stagger: 0.1,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: '.countdown-grid',
          start: 'top 84%',
        },
      })

      gsap.to('.countdown-card', {
        y: -8,
        duration: 2.2,
        stagger: 0.16,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.utils.toArray('.parallax-img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray('[data-count]').forEach((element) => {
        const target = Number(element.dataset.count || '0')
        const counter = { value: 0 }

        gsap.to(counter, {
          value: target,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
          onUpdate: () => {
            element.textContent = Math.round(counter.value).toLocaleString()
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={root}
      className="overflow-x-hidden bg-[#faf6ed] text-[#4d433b]"
    >
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            Med<span className="text-[#c96a4b]">·</span>Template
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <a href="#about" className="transition hover:text-white">
              Intro
            </a>
            <a href="#experiences" className="transition hover:text-white">
              Sections
            </a>
            <a href="#gallery" className="transition hover:text-white">
              Feature
            </a>
            <a href="#journal" className="transition hover:text-white">
              Quote
            </a>
          </nav>
          <a
            href="#book"
            className="rounded-full bg-[#2f2a25] px-5 py-2.5 text-sm text-[#faf6ed] transition-colors hover:bg-[#c96a4b]"
          >
            Contact
          </a>
        </div>
      </header>

      <section
        id="top"
        className="hero relative min-h-[720px] w-full overflow-hidden"
      >
        <div className="hero-img absolute inset-0 will-change-transform">
          <img
            src={boat}
            alt="Mediterranean sea view for wedding invitation hero background"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.38)_0%,rgba(8,28,37,0.18)_34%,rgba(8,28,37,0.28)_62%,rgba(250,246,237,0.95)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full min-h-[720px] w-full max-w-7xl flex-col justify-end px-6 pb-18 pt-32 lg:px-10 lg:pb-24">
          <div className="grid items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-4xl rounded-[2.3rem] border border-white/25 bg-white/12 p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:p-8">
              <p className="hero-eyebrow mb-5 text-xs uppercase tracking-[0.4em] text-white/75">
                Mediterranean Invitation Collection
              </p>
              <h1 className="font-display text-balance text-[clamp(3.2rem,9vw,8rem)] leading-[0.95] text-white">
                <span className="hero-word mr-4 inline-block">Seaside</span>
                <span className="hero-word mr-4 inline-block italic">vows</span>
                <span className="hero-word mr-4 inline-block">with</span>
                <span className="hero-word inline-block text-[#ffd5a3]">a softer entrance.</span>
              </h1>

              <div className="mt-8 flex max-w-3xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <p className="hero-sub max-w-xl text-lg leading-8 text-white/88">
                  Redesigned as a more premium wedding hero with calmer colors,
                  stronger typography, and room for names, dates, and venue details
                  to feel special from the first screen.
                </p>
                <a
                  href="#about"
                  className="hero-cta inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm uppercase tracking-[0.28em] text-white transition-all hover:bg-white/18 hover:gap-5"
                >
                  View invitation
                  <span>→</span>
                </a>
              </div>
            </div>

            <div className="grid gap-4 lg:justify-self-end lg:max-w-[360px]">
              <div className="hero-panel rounded-[1.9rem] border border-white/18 bg-[#163847]/70 p-5 text-white shadow-[0_24px_70px_-36px_rgba(11,31,40,0.8)] backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.32em] text-[#b8d8e1]">
                  Template mood
                </div>
                <div className="mt-3 font-display text-4xl text-white">
                  Coastal romance
                </div>
                <p className="mt-3 leading-7 text-white/72">
                  Best for elegant seaside weddings, destination celebrations, and
                  warm evening ceremonies.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-white/92">
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    <span data-count="6">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Sections
                  </div>
                </div>
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    <span data-count="1">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Theme
                  </div>
                </div>
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    100<span className="text-[#ffd5a3]">%</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Editable
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="countdown-shell mx-auto max-w-3xl text-center">
          <div className="countdown-grid flex flex-wrap justify-center gap-4">
            {countdown.map((item) => (
              <article
                key={item.label}
                className="countdown-card relative w-[112px] overflow-hidden rounded-[1.6rem] border border-[#d8e7ec] bg-[linear-gradient(180deg,#ffffff,#f4fafb)] px-4 py-5 text-center shadow-[0_20px_48px_-34px_rgba(37,90,103,0.38)]"
              >
                <div
                  className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#72b6c8] to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f1d4af] to-transparent"
                  aria-hidden="true"
                />
                <div className="overflow-hidden">
                  <div className="font-display flex items-center justify-center gap-0.5 text-4xl leading-none text-[#224c59] md:text-5xl">
                    {item.value.split('').map((digit, index) => (
                      <CountdownDigit
                        key={`${item.label}-${index}`}
                        value={digit}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#6b7f88]">
                  {item.label}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      <section className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3" data-card-grid>
          <article
            data-card-item
            className="rounded-[1.8rem] border border-[#e5dccf] bg-[#fffaf3] p-6"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
              Hero message
            </p>
            <h3 className="mt-4 font-display text-3xl">Names and date first</h3>
            <p className="mt-4 leading-7 text-[#76685d]">
              Keep the opening strong with couple names, a subtitle, and one
              clear invitation message.
            </p>
          </article>
          <article
            data-card-item
            className="rounded-[1.8rem] border border-[#e5dccf] bg-[#fffaf3] p-6"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
              Info blocks
            </p>
            <h3 className="mt-4 font-display text-3xl">Useful guest details</h3>
            <p className="mt-4 leading-7 text-[#76685d]">
              Add schedule, dress code, transport, and RSVP instructions without
              breaking the visual style.
            </p>
          </article>
          <article
            data-card-item
            className="rounded-[1.8rem] border border-[#e5dccf] bg-[#fffaf3] p-6"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
              Final CTA
            </p>
            <h3 className="mt-4 font-display text-3xl">Map and contact finish</h3>
            <p className="mt-4 leading-7 text-[#76685d]">
              End the page with location guidance, a map block, and the final call
              to action.
            </p>
          </article>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-start gap-12 md:grid-cols-12">
          <div className="reveal md:col-span-5" data-text-group>
            <p
              data-text-item
              className="mb-6 text-xs uppercase tracking-[0.4em] text-[#c96a4b]"
            >
              Template intro
            </p>
            <h2
              data-text-item
              className="font-display text-balance text-5xl leading-[1.05] md:text-6xl"
            >
              A reusable <em className="text-[#c96a4b]">Mediterranean</em> wedding page.
            </h2>
          </div>
          <div
            className="reveal space-y-6 text-lg leading-relaxed text-[#76685d] md:col-span-6 md:col-start-7"
            data-text-group
          >
            <p data-text-item>
              This layout is now written as a generic invitation template instead
              of a travel brand story, so you can reuse it for multiple couples
              with minimal text changes.
            </p>
            <p data-text-item>
              Keep the Mediterranean visual language, then replace only the names,
              event date, venue, short love story, and gallery images for each
              version you sell.
            </p>
            <div data-text-item className="grid grid-cols-2 gap-4 pt-6 sm:max-w-md">
              <div className="rounded-2xl border border-[#e5dccf] bg-[#f7f2e8] p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-[#8a7b6d]">
                  Couple
                </div>
                <div className="mt-2 font-display text-2xl">Name &amp; Name</div>
              </div>
              <div className="rounded-2xl border border-[#e5dccf] bg-[#f7f2e8] p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-[#8a7b6d]">
                  Venue
                </div>
                <div className="mt-2 font-display text-2xl">Seaside Venue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal rounded-[2rem] bg-[#2f2a25] p-8 text-[#faf6ed]" data-text-group>
            <p
              data-text-item
              className="text-xs uppercase tracking-[0.36em] text-[#d7b58f]"
            >
              Event timeline
            </p>
            <h2
              data-text-item
              className="mt-4 font-display text-5xl leading-[1.05]"
            >
              Add a complete wedding flow guests can follow easily.
            </h2>
            <p data-text-item className="mt-5 max-w-xl leading-8 text-white/70">
              This section gives the page more structure and helps guests
              understand the day without asking extra questions.
            </p>
          </div>

          <div className="grid gap-4" data-card-grid>
            {timelineItems.map((item) => (
              <article
                key={item.time}
                data-card-item
                className="rounded-[1.8rem] border border-[#e5dccf] bg-white/80 p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
                      {item.time}
                    </p>
                    <h3 className="mt-3 font-display text-3xl text-[#3e352f]">
                      {item.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#f2ede4] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8a7b6d]">
                    Template item
                  </span>
                </div>
                <p className="mt-4 max-w-xl leading-7 text-[#76685d]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experiences" className="bg-[#f2ede4] py-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="reveal mb-16 flex items-end justify-between" data-text-group>
            <div>
              <p
                data-text-item
                className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c96a4b]"
              >
                Editable blocks
              </p>
              <h2
                data-text-item
                className="font-display text-balance max-w-2xl text-5xl md:text-6xl"
              >
                Use the same layout for different <em>couples</em> and events.
              </h2>
            </div>
            <a
              href="#book"
              data-text-item
              className="hidden text-sm uppercase tracking-widest transition hover:text-[#c96a4b] md:inline"
            >
              Template CTA →
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-3" data-card-grid>
            {moments.map((card) => (
              <article key={card.n} className="reveal group" data-card-item>
                <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-md">
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="parallax-img h-[120%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="font-display absolute left-4 top-4 text-sm text-[#faf6ed]">
                    {card.n}
                  </div>
                </div>
                <h3 className="font-display mb-2 text-2xl">{card.title}</h3>
                <p className="text-[#76685d]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="reveal rounded-[2rem] border border-[#e5dccf] bg-[#fffaf3] p-7" data-text-group>
            <p
              data-text-item
              className="text-xs uppercase tracking-[0.35em] text-[#c96a4b]"
            >
              Guest information
            </p>
            <h2
              data-text-item
              className="mt-4 font-display text-5xl leading-[1.06]"
            >
              Add practical details without losing the romantic design.
            </h2>
            <p data-text-item className="mt-5 max-w-2xl leading-8 text-[#76685d]">
              This is a good place for dress code, RSVP, transfer details, child
              policy, or any note guests should know before the day.
            </p>
          </div>

          <div className="grid gap-4" data-card-grid>
            {detailCards.map((card) => (
              <article
                key={card.label}
                data-card-item
                className="rounded-[1.7rem] border border-[#e5dccf] bg-[#f7f2e8] p-6"
              >
                <p className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
                  {card.label}
                </p>
                <h3 className="mt-3 font-display text-3xl text-[#3e352f]">
                  {card.value}
                </h3>
                <p className="mt-4 leading-7 text-[#76685d]">{card.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="reveal relative md:col-span-7">
            <div className="aspect-[4/5] overflow-hidden rounded-md">
              <img
                src={door}
                alt="Mediterranean architectural detail for wedding template mood"
                loading="lazy"
                className="parallax-img h-[115%] w-full object-cover"
              />
            </div>
          </div>
          <div className="reveal md:col-span-4 md:col-start-9" data-text-group>
            <p
              data-text-item
              className="mb-6 text-xs uppercase tracking-[0.4em] text-[#c96a4b]"
            >
              Featured section
            </p>
            <h2
              data-text-item
              className="font-display text-balance mb-6 text-5xl leading-[1.05]"
            >
              Highlight one beautiful location, photo, or <em>ceremony detail</em>.
            </h2>
            <p data-text-item className="mb-8 leading-relaxed text-[#76685d]">
              This area works well for the main venue, a ceremony note, or a
              featured visual story that helps sell the invitation design.
            </p>
            <dl
              data-text-item
              className="grid grid-cols-2 gap-6 border-t border-[#e5dccf] pt-6 text-sm"
            >
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#8a7b6d]">
                  Event date
                </dt>
                <dd className="font-display text-2xl">12 Aug 2027</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#8a7b6d]">
                  Location
                </dt>
                <dd className="font-display text-2xl">Coastal Venue</dd>
              </div>
            </dl>
            <a
              href="#book"
              data-text-item
              className="mt-10 inline-block rounded-full bg-[#c96a4b] px-7 py-3 text-sm uppercase tracking-widest text-[#faf6ed] transition-colors hover:bg-[#2f2a25]"
            >
              Save your date
            </a>
          </div>
        </div>
      </section>

      <section className="bg-[#f2ede4] py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="reveal rounded-[2rem] bg-white/70 p-7" data-text-group>
              <p
                data-text-item
                className="text-xs uppercase tracking-[0.35em] text-[#c96a4b]"
              >
                Frequently asked
              </p>
              <h2
                data-text-item
                className="mt-4 font-display text-5xl leading-[1.05]"
              >
                Add answers for common guest questions.
              </h2>
              <p data-text-item className="mt-5 leading-8 text-[#76685d]">
                This makes the template feel complete and reduces the need for
                guests to message the couple for small details.
              </p>
            </div>

            <div className="grid gap-4" data-card-grid>
              {faqItems.map((item) => (
                <article
                  key={item.question}
                  data-card-item
                  className="rounded-[1.8rem] border border-[#e5dccf] bg-[#fffaf3] p-6"
                >
                  <h3 className="font-display text-3xl text-[#3e352f]">
                    {item.question}
                  </h3>
                  <p className="mt-4 leading-7 text-[#76685d]">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="journal" className="relative overflow-hidden py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f2c86d_0%,#c96a4b_60%,#754134_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_35%)]"
          aria-hidden="true"
        />
        <div
          className="reveal mx-auto w-full max-w-7xl px-6 text-center lg:px-10"
          data-text-group
        >
          <p
            data-text-item
            className="mb-8 text-xs uppercase tracking-[0.4em] text-white/80"
          >
            Template quote
          </p>
          <blockquote
            data-text-item
            className="font-display text-balance mx-auto max-w-4xl text-4xl leading-[1.1] text-white md:text-6xl"
          >
            "Use this section for a short promise, invitation message, or a
            meaningful line that fits <em>every couple you customize.</em>"
          </blockquote>
          <div
            data-text-item
            className="mt-10 text-sm uppercase tracking-widest text-white/80"
          >
            Mediterranean collection
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="reveal rounded-[2rem] border border-[#e5dccf] bg-[#fffaf3] p-7" data-text-group>
            <p
              data-text-item
              className="text-xs uppercase tracking-[0.35em] text-[#c96a4b]"
            >
              Location map
            </p>
            <h2
              data-text-item
              className="mt-4 font-display text-5xl leading-[1.05]"
            >
              Finish the invitation with a map and arrival details.
            </h2>
            <p data-text-item className="mt-5 leading-8 text-[#76685d]">
              This placeholder map can later be replaced with the real venue
              location, exact coordinates, parking details, or shuttle guidance.
            </p>
            <div data-text-item className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-[#f2ede4] p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-[#8a7b6d]">
                  Venue
                </div>
                <div className="mt-2 font-display text-2xl text-[#3e352f]">
                  Placeholder Beach Club
                </div>
              </div>
              <div className="rounded-[1.4rem] bg-[#f2ede4] p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-[#8a7b6d]">
                  Address
                </div>
                <div className="mt-2 font-display text-2xl text-[#3e352f]">
                  Seaside Road 12
                </div>
              </div>
            </div>
          </div>

          <div className="reveal overflow-hidden rounded-[2rem] border border-[#e5dccf] bg-white shadow-sm">
            <div className="border-b border-[#e5dccf] bg-[#f7f2e8] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.32em] text-[#8a7b6d]">
                Google Maps placeholder
              </div>
            </div>
            <iframe
              title="Placeholder wedding venue map"
              src="https://www.google.com/maps?q=Bodrum%20Turkey&z=12&output=embed"
              className="h-[420px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer id="book" className="bg-[#2f2a25] pb-12 pt-28 text-[#faf6ed]">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div
            className="grid gap-12 border-b border-white/15 pb-20 md:grid-cols-12"
            data-text-group
          >
            <div className="reveal md:col-span-7">
              <h2
                data-text-item
                className="font-display text-balance text-5xl leading-[1.02] md:text-7xl"
              >
                Ready for names,
                <br />
                <em className="text-[#d77a59]">details, and RSVP edits.</em>
              </h2>
            </div>
            <div className="reveal flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p data-text-item className="mb-6 text-white/70">
                Use this footer block for contact, booking, pricing, or a lead
                capture form for clients who want this template customized.
              </p>
              <form data-text-item className="flex border-b border-white/40 pb-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-[#faf6ed] outline-none placeholder:text-white/50"
                />
                <button
                  type="button"
                  className="text-sm uppercase tracking-widest transition hover:text-[#d77a59]"
                >
                  Send →
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 text-sm text-white/60 md:flex-row md:justify-between">
            <div className="font-display text-xl text-[#faf6ed]">
              Med<span className="text-[#c96a4b]">·</span>Template
            </div>
            <div className="flex gap-8">
              <a href="#top" className="transition hover:text-white">
                Hero
              </a>
              <a href="#journal" className="transition hover:text-white">
                Quote
              </a>
              <a href="#book" className="transition hover:text-white">
                Contact
              </a>
            </div>
            <div>Reusable Mediterranean invitation page</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MeditteraeanPage
