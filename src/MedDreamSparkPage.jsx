import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import hero from './assets/med-dream-spark/hero-generic.jpg'
import feature1 from './assets/med-dream-spark/feature-1.jpg'
import feature2 from './assets/med-dream-spark/feature-2.jpg'
import feature3 from './assets/med-dream-spark/feature-3.jpg'
import gallery from './assets/med-dream-spark/gallery-generic.jpg'

gsap.registerPlugin(ScrollTrigger)

const TEMPLATE = {
  couple: {
    partnerOne: 'Name',
    partnerTwo: 'Name',
  },
  event: {
    dateLabel: '14 September 2027',
    locationLabel: 'Bodrum, Türkiye',
    rsvpDeadline: '01 July 2027',
  },
  story: {
    eyebrow: 'Our story',
    titleA: 'It started on a',
    titleB: 'summer evening',
    paragraphs: [
      'Use this template for any couple. Replace this story with one or two short paragraphs, or remove it entirely.',
      'Keep the design and animations. Only swap the names, date, location, and a few lines of text.',
    ],
    signatureLabel: 'Bride & Groom',
  },
  events: {
    eyebrow: 'Schedule',
    titleA: 'One day,',
    titleB: 'beautifully planned.',
    cards: [
      {
        n: '01',
        img: feature1,
        time: '17:00 · Ceremony',
        title: 'Ceremony',
        detail: 'A simple ceremony by the sea with your closest people.',
      },
      {
        n: '02',
        img: feature2,
        time: '19:30 · Dinner',
        title: 'Dinner',
        detail: 'A long-table dinner under warm lights and the sunset.',
      },
      {
        n: '03',
        img: feature3,
        time: '21:00 · Party',
        title: 'Celebration',
        detail: 'Music, dancing, and a late-night toast.',
      },
    ],
  },
  venue: {
    eyebrow: 'The place',
    titleA: 'By the',
    titleB: 'Mediterranean sea.',
    description:
      'Add a short venue description here. Keep it generic so you can reuse this template for different weddings.',
    cta: 'View travel info',
    dateShort: '14 Sep',
    placeShort: 'Bodrum',
  },
  quote: {
    eyebrow: 'A note',
    text:
      '“As deep as the sea, as warm as the sun — having you with us will be the best gift.”',
  },
  rsvp: {
    titleA: 'Please let us know',
    titleB: 'if you can make it.',
    description:
      'This is a placeholder RSVP block. Later you can connect it to WhatsApp, Google Forms, or your own dashboard.',
    inputPlaceholder: 'your email address',
    submitLabel: 'Send →',
  },
}

export default function MedDreamSparkPage() {
  const root = useRef(null)
  const coupleName = `${TEMPLATE.couple.partnerOne} & ${TEMPLATE.couple.partnerTwo}`
  const headlineWords = useMemo(() => [TEMPLATE.couple.partnerOne, '&', TEMPLATE.couple.partnerTwo], [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-eyebrow', { y: 18, opacity: 0, duration: 0.75 })
        .from('.hero-word', { y: 90, opacity: 0, duration: 1.05, stagger: 0.12 }, '-=0.35')
        .from('.hero-sub', { y: 18, opacity: 0, duration: 0.75 }, '-=0.55')
        .from('.hero-cta', { y: 18, opacity: 0, duration: 0.65 }, '-=0.5')
        .from('.hero-meta', { y: 10, opacity: 0, duration: 0.8, stagger: 0.12 }, '-=0.45')
        .from('.hero-orb', { scale: 0.85, opacity: 0, duration: 0.9, stagger: 0.12 }, '-=0.7')

      gsap.to('.hero-img', {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      const headerBar = root.current?.querySelector('[data-header-bar]')
      if (headerBar) {
        gsap.fromTo(
          headerBar,
          { backgroundColor: 'rgba(23,56,71,0)', backdropFilter: 'blur(0px)' },
          {
            backgroundColor: 'rgba(23,56,71,0.45)',
            backdropFilter: 'blur(10px)',
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
          },
        )
      }

      gsap.utils.toArray('.reveal').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 56, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 85%' },
          },
        )
      })

      gsap.utils.toArray('.title-wipe').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 30, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            y: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.2,
            ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 85%' },
          },
        )
      })

      gsap.utils.toArray('.img-reveal').forEach((element) => {
        gsap.fromTo(
          element,
          { clipPath: 'inset(14% 8% 14% 8% round 20px)', filter: 'saturate(0.9)', scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 20px)',
            filter: 'saturate(1)',
            scale: 1,
            duration: 1.35,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 78%' },
          },
        )
      })

      gsap.utils.toArray('.card-pop').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 70, opacity: 0, rotateX: 18, rotateZ: -1.5, transformPerspective: 900, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            rotateZ: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 86%' },
          },
        )
      })

      gsap.utils.toArray('.sticker').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 18, rotate: -6, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'elastic.out(1, 0.55)',
            scrollTrigger: { trigger: element, start: 'top 88%' },
          },
        )
      })

      gsap.to('.marquee-track', {
        xPercent: -50,
        ease: 'none',
        duration: 30,
        repeat: -1,
      })

      gsap.utils.toArray('.parallax-img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      gsap.utils.toArray('.floaty').forEach((element) => {
        gsap.to(element, {
          y: () => gsap.utils.random(-18, -34),
          x: () => gsap.utils.random(-10, 10),
          duration: () => gsap.utils.random(3.2, 5.6),
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      gsap.utils.toArray('[data-count]').forEach((element) => {
        const target = Number(element.getAttribute('data-count') || '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: { trigger: element, start: 'top 85%' },
          onUpdate: () => {
            element.textContent = Math.round(obj.v).toLocaleString()
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={root}
      className="overflow-x-hidden bg-[linear-gradient(180deg,#fffaf7_0%,#fbf7ef_45%,#f6fbfd_100%)] text-[#173847]"
    >
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          data-header-bar
          className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-b-3xl px-6 py-6 ring-1 ring-white/10 lg:px-10"
        >
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            {TEMPLATE.couple.partnerOne}
            <span className="text-[#ffd5a3]"> &amp; </span>
            {TEMPLATE.couple.partnerTwo}
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/75 md:flex">
            <a href="#story" className="transition hover:text-white">
              Story
            </a>
            <a href="#events" className="transition hover:text-white">
              Events
            </a>
            <a href="#gallery" className="transition hover:text-white">
              Venue
            </a>
            <a href="#travel" className="transition hover:text-white">
              Note
            </a>
          </nav>
          <a
            href="#rsvp"
            className="rounded-full bg-white px-5 py-2.5 text-sm text-[#173847] transition-colors hover:bg-[#fff7ed]"
          >
            RSVP
          </a>
        </div>
      </header>

      <section id="top" className="hero relative h-screen min-h-[720px] w-full overflow-hidden">
        <div className="hero-img absolute inset-0 will-change-transform">
          <img
            src={hero}
            alt="Mediterranean wedding villa at golden hour"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-[#fbf7ef]" />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="hero-orb floaty absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,213,163,0.9),rgba(255,213,163,0.0)_70%)] blur-[1px]" />
          <div className="hero-orb floaty absolute right-[10%] top-[28%] h-32 w-32 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(158,209,223,0.9),rgba(158,209,223,0.0)_70%)] blur-[1px]" />
          <div className="hero-orb floaty absolute bottom-[18%] left-[22%] h-20 w-20 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5),rgba(255,255,255,0.0)_70%)] blur-[1px]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-24 pt-32 lg:px-10">
          <p className="hero-eyebrow mb-6 text-xs uppercase tracking-[0.4em] text-white/80">
            Mediterranean · {TEMPLATE.event.dateLabel}
          </p>
          <h1 className="font-display text-balance text-[clamp(3.5rem,11vw,11rem)] leading-[0.95] text-white">
            {headlineWords.map((word) => (
              <span
                key={word}
                className={`hero-word mr-4 inline-block ${word === '&' ? 'italic' : ''} ${word === TEMPLATE.couple.partnerTwo ? 'text-[#ffd5a3]' : ''}`}
              >
                {word}
              </span>
            ))}
          </h1>

          <div className="mt-10 flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="hero-sub max-w-md text-lg leading-8 text-white/90">
              A premium Mediterranean wedding template with smooth GSAP animations. Swap names, date and location and reuse it.
            </p>
            <a
              href="#story"
              className="hero-cta inline-flex items-center gap-3 border-b border-white/60 pb-2 text-sm uppercase tracking-widest text-white transition-all hover:gap-5"
            >
              Explore
              <span>→</span>
            </a>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 text-white/85">
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="14">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Sep · Day</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="120">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Guests</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                2<span className="text-[#ffd5a3]">.</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Day · Celebration</div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#e3eef2] bg-white/70">
        <div className="marquee-track flex whitespace-nowrap py-6 font-display text-3xl italic md:text-5xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-12 pr-12">
              <span>Love</span>
              <span className="text-[#ffd5a3]">✦</span>
              <span className="italic">Sea</span>
              <span className="text-[#ffd5a3]">✦</span>
              <span>Sun</span>
              <span className="text-[#ffd5a3]">✦</span>
              <span className="italic">Salt</span>
              <span className="text-[#ffd5a3]">✦</span>
              <span>Music</span>
              <span className="text-[#ffd5a3]">✦</span>
              <span className="italic">Forever</span>
              <span className="text-[#ffd5a3]">✦</span>
            </div>
          ))}
        </div>
      </section>

      <section id="story" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-start gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[#2f7186]">
              {TEMPLATE.story.eyebrow}
            </p>
            <h2 className="title-wipe font-display text-balance text-5xl leading-[1.05] md:text-6xl">
              {TEMPLATE.story.titleA} <em className="text-[#2f7186]">{TEMPLATE.story.titleB}</em>.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-[#5f7680] md:col-span-6 md:col-start-7">
            {TEMPLATE.story.paragraphs.map((p) => (
              <p key={p} className="reveal">
                {p}
              </p>
            ))}
            <div className="pt-6">
              <div className="font-display italic text-xl">{coupleName}</div>
              <div className="text-xs uppercase tracking-widest text-[#6a8790]">
                {TEMPLATE.story.signatureLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="bg-white/70 py-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="mb-16 flex items-end justify-between gap-10">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#2f7186]">
                {TEMPLATE.events.eyebrow}
              </p>
              <h2 className="title-wipe font-display max-w-2xl text-balance text-5xl md:text-6xl">
                {TEMPLATE.events.titleA} <em>{TEMPLATE.events.titleB}</em>
              </h2>
            </div>
            <a
              href="#rsvp"
              className="hidden text-sm uppercase tracking-widest text-[#173847] transition hover:text-[#2f7186] md:inline"
            >
              RSVP →
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {TEMPLATE.events.cards.map((c) => (
              <article key={c.n} className="card-pop group">
                <div className="img-reveal relative mb-6 aspect-[4/5] overflow-hidden rounded-xl">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="parallax-img h-[120%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 font-display text-sm text-white">{c.n}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
                <div className="mb-2 text-xs uppercase tracking-widest text-[#2f7186]">{c.time}</div>
                <h3 className="mb-2 font-display text-2xl">{c.title}</h3>
                <p className="text-[#5f7680]">{c.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="relative md:col-span-7">
            <div className="img-reveal aspect-[4/5] overflow-hidden rounded-xl">
              <img
                src={gallery}
                alt="Wedding couple by the Mediterranean sea"
                loading="lazy"
                className="parallax-img h-[115%] w-full object-cover"
              />
            </div>
            <div className="sticker absolute -bottom-6 left-6 rounded-2xl bg-white/90 px-5 py-4 shadow-[0_20px_60px_rgba(23,56,71,0.18)] ring-1 ring-[#e3eef2]">
              <div className="text-xs uppercase tracking-[0.4em] text-[#2f7186]">Venue</div>
              <div className="font-display text-2xl">{TEMPLATE.event.locationLabel}</div>
            </div>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[#2f7186]">
              {TEMPLATE.venue.eyebrow}
            </p>
            <h2 className="title-wipe mb-6 font-display text-5xl leading-[1.05] text-balance">
              {TEMPLATE.venue.titleA} <em>{TEMPLATE.venue.titleB}</em>
            </h2>
            <p className="reveal mb-8 leading-relaxed text-[#5f7680]">{TEMPLATE.venue.description}</p>
            <dl className="grid grid-cols-2 gap-6 border-t border-[#e3eef2] pt-6 text-sm">
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#6a8790]">Date</dt>
                <dd className="font-display text-2xl">{TEMPLATE.venue.dateShort}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#6a8790]">Place</dt>
                <dd className="font-display text-2xl">{TEMPLATE.venue.placeShort}</dd>
              </div>
            </dl>
            <a
              href="#travel"
              className="mt-10 inline-block rounded-full bg-[#2f7186] px-7 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-[#173847]"
            >
              {TEMPLATE.venue.cta}
            </a>
          </div>
        </div>
      </section>

      <section id="travel" className="relative overflow-hidden py-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,213,163,0.9),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(158,209,223,0.65),transparent_55%),linear-gradient(135deg,#173847,#224c59)]" />
        <div className="mx-auto w-full max-w-7xl px-6 text-center lg:px-10">
          <div>
            <p className="mb-8 text-xs uppercase tracking-[0.4em] text-white/80">— {TEMPLATE.quote.eyebrow}</p>
            <blockquote className="title-wipe mx-auto max-w-4xl text-balance font-display text-4xl leading-[1.1] text-white md:text-6xl">
              {TEMPLATE.quote.text}
            </blockquote>
            <div className="reveal mt-10 text-sm uppercase tracking-widest text-white/75">{coupleName}</div>
          </div>
        </div>
      </section>

      <footer id="rsvp" className="bg-[#173847] pt-28 pb-12 text-white">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 border-b border-white/15 pb-20 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="title-wipe font-display text-balance text-5xl leading-[1.02] md:text-7xl">
                {TEMPLATE.rsvp.titleA}.<br />
                <em className="text-[#ffd5a3]">{TEMPLATE.rsvp.titleB}</em>
              </h2>
            </div>
            <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p className="reveal mb-6 text-white/70">
                {TEMPLATE.rsvp.description} RSVP deadline: {TEMPLATE.event.rsvpDeadline}.
              </p>
              <form
                className="reveal flex border-b border-white/40 pb-3"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <input
                  type="email"
                  placeholder={TEMPLATE.rsvp.inputPlaceholder}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/50"
                />
                <button className="text-sm uppercase tracking-widest transition hover:text-[#ffd5a3]">
                  {TEMPLATE.rsvp.submitLabel}
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 pt-10 text-sm text-white/60 md:flex-row md:items-center">
            <div className="font-display text-xl text-white">
              {TEMPLATE.couple.partnerOne}
              <span className="text-[#ffd5a3]"> &amp; </span>
              {TEMPLATE.couple.partnerTwo}
            </div>
            <div className="flex gap-8">
              <a href="#top" className="transition hover:text-white">
                Top
              </a>
              <a href="#gallery" className="transition hover:text-white">
                Venue
              </a>
              <a href="#rsvp" className="transition hover:text-white">
                RSVP
              </a>
            </div>
            <div>Reusable Mediterranean wedding template</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
