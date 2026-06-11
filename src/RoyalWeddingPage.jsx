import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import hero from './assets/med-dream-spark/door.jpg'
import feature1 from './assets/med-dream-spark/table.jpg'
import feature2 from './assets/med-dream-spark/feature-2.jpg'
import feature3 from './assets/med-dream-spark/feature-3.jpg'

gsap.registerPlugin(ScrollTrigger)

const TEMPLATE = {
  couple: {
    partnerOne: 'Name',
    partnerTwo: 'Name',
  },
  event: {
    dateLabel: '14 September 2027',
    timeLabel: '17:00',
    locationLabel: 'City, Country',
    rsvpDeadline: '01 July 2027',
  },
  hero: {
    eyebrow: 'Royal Wedding Invitation',
    sub:
      'A premium royal-style wedding template with smooth GSAP animations. Swap names, date and location and reuse it.',
    cta: 'View Details',
  },
  details: {
    eyebrow: 'Invitation',
    titleA: 'An evening of',
    titleB: 'grace & celebration',
    items: [
      { k: 'Ceremony', v: '17:00 · Cathedral / Garden' },
      { k: 'Reception', v: '19:30 · Grand Hall' },
      { k: 'Dress Code', v: 'Black tie · Optional' },
      { k: 'RSVP By', v: '01 July 2027' },
    ],
  },
  story: {
    eyebrow: 'The story',
    titleA: 'A modern love,',
    titleB: 'timeless tradition',
    paragraphs: [
      'Use this section for a short story or a few lines that match a royal theme: elegant, minimal, and refined.',
      'Keep it reusable: change the names, date, city, and your preferred details without touching the design.',
    ],
  },
  schedule: {
    eyebrow: 'Schedule',
    titleA: 'The',
    titleB: 'ceremony & festivities',
    cards: [
      {
        n: '01',
        img: feature1,
        time: '17:00',
        title: 'Ceremony',
        detail: 'A graceful ceremony followed by a garden salute.',
      },
      {
        n: '02',
        img: feature2,
        time: '19:30',
        title: 'Reception',
        detail: 'A candlelit dinner, speeches, and live music.',
      },
      {
        n: '03',
        img: feature3,
        time: '21:30',
        title: 'Celebration',
        detail: 'Dancing, late-night desserts, and a final toast.',
      },
    ],
  },
  venue: {
    eyebrow: 'Location',
    titleA: 'A',
    titleB: 'grand venue',
    description:
      'Add venue details here. Keep it generic and reusable for any royal wedding style: palace, château, historic hotel, or private estate.',
    addressLine: 'Venue name · Street · City',
  },
  map: {
    eyebrow: 'Map',
    titleA: 'Find the',
    titleB: 'venue',
    note: 'Placeholder map. Replace with Google Maps embed when ready.',
  },
  rsvp: {
    eyebrow: 'RSVP',
    titleA: 'Kindly respond',
    titleB: 'by the deadline',
    description:
      'This is a placeholder RSVP block. Later you can connect it to WhatsApp, Google Forms, or your own dashboard.',
    inputPlaceholder: 'your email address',
    submitLabel: 'Send →',
  },
}

function CrestMark() {
  return (
    <svg
      viewBox="0 0 120 120"
      width="120"
      height="120"
      aria-hidden="true"
      className="crest w-24 md:w-28"
    >
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e6b8" />
          <stop offset="0.5" stopColor="#d2a94b" />
          <stop offset="1" stopColor="#f7efcf" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke="url(#gold)" strokeWidth="2.2" opacity="0.9" />
      <path
        className="crest-path"
        d="M30 52c6-10 14-16 22-16 4 0 6 2 8 6 2-4 4-6 8-6 8 0 16 6 22 16-4 2-7 4-10 7-4-8-8-12-12-12-2 0-3 1-4 3 8 2 14 8 14 16 0 10-9 18-20 18s-20-8-20-18c0-8 6-14 14-16-1-2-2-3-4-3-4 0-8 4-12 12-3-3-6-5-10-7z"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        className="crest-path"
        d="M44 83c6 6 26 6 32 0"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        className="crest-path"
        d="M60 86v10"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function RoyalWeddingPage() {
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

      const headerBar = root.current?.querySelector('[data-header-bar]')
      if (headerBar) {
        gsap.fromTo(
          headerBar,
          { backgroundColor: 'rgba(10,12,20,0)', backdropFilter: 'blur(0px)' },
          {
            backgroundColor: 'rgba(10,12,20,0.55)',
            backdropFilter: 'blur(10px)',
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
          },
        )
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-curtain', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.1 })
        .from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.7 }, '-=0.65')
        .from('.hero-word', { y: 88, opacity: 0, duration: 1.1, stagger: 0.12 }, '-=0.5')
        .from('.hero-sub', { y: 16, opacity: 0, duration: 0.8 }, '-=0.55')
        .from('.hero-cta', { y: 14, opacity: 0, duration: 0.65 }, '-=0.6')
        .from('.crest', { y: 18, opacity: 0, scale: 0.96, duration: 0.9 }, '-=0.8')

      gsap.utils.toArray('.crest-path').forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 0
        if (!len) return
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top' },
        })
      })

      gsap.to('.hero-img', {
        yPercent: 14,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.utils.toArray('.royal-title').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 26, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
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

      gsap.utils.toArray('.royal-reveal').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 54, opacity: 0, filter: 'blur(10px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 86%' },
          },
        )
      })

      gsap.utils.toArray('.royal-divider').forEach((element) => {
        gsap.fromTo(
          element,
          { scaleX: 0, opacity: 0.6, transformOrigin: '0% 50%' },
          {
            scaleX: 1,
            opacity: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 92%' },
          },
        )
      })

      gsap.utils.toArray('.royal-card').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 70, opacity: 0, rotateX: 16, transformPerspective: 1000, scale: 0.985 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            scale: 1,
            duration: 1.05,
            ease: 'power4.out',
            scrollTrigger: { trigger: element, start: 'top 86%' },
          },
        )
      })

      gsap.utils.toArray('.royal-img').forEach((element) => {
        gsap.fromTo(
          element,
          { clipPath: 'inset(14% 8% 14% 8% round 22px)', filter: 'saturate(0.9)', scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 22px)',
            filter: 'saturate(1)',
            scale: 1,
            duration: 1.3,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 78%' },
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
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="overflow-x-hidden bg-[#0b0f18] text-[#f6f1e4]">
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          data-header-bar
          className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-b-3xl px-6 py-6 ring-1 ring-white/10 lg:px-10"
        >
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            {TEMPLATE.couple.partnerOne}
            <span className="text-[#d2a94b]"> &amp; </span>
            {TEMPLATE.couple.partnerTwo}
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/70 md:flex">
            <a href="#invitation" className="transition hover:text-white">
              Invitation
            </a>
            <a href="#story" className="transition hover:text-white">
              Story
            </a>
            <a href="#schedule" className="transition hover:text-white">
              Schedule
            </a>
            <a href="#venue" className="transition hover:text-white">
              Venue
            </a>
          </nav>
          <a
            href="#rsvp"
            className="rounded-full bg-white px-5 py-2.5 text-sm text-[#0b0f18] transition-colors hover:bg-[#f6f1e4]"
          >
            RSVP
          </a>
        </div>
      </header>

      <section id="top" className="hero relative h-screen min-h-[720px] w-full overflow-hidden">
        <div className="hero-img absolute inset-0 will-change-transform">
          <img src={hero} alt="Royal venue" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(210,169,75,0.35),transparent_38%),linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(11,15,24,0.82))]" />
        </div>

        <div className="hero-curtain absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(11,15,24,0.98),rgba(11,15,24,0))]" />

        <div className="pointer-events-none absolute inset-0">
          <div className="floaty absolute left-[10%] top-[18%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(210,169,75,0.55),rgba(210,169,75,0.0)_70%)] blur-[1px]" />
          <div className="floaty absolute right-[10%] top-[28%] h-36 w-36 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),rgba(255,255,255,0.0)_70%)] blur-[1px]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-6 pb-24 pt-32 lg:px-10">
          <div className="flex items-center justify-between gap-10">
            <p className="hero-eyebrow text-xs uppercase tracking-[0.45em] text-white/80">
              {TEMPLATE.hero.eyebrow} · {TEMPLATE.event.dateLabel}
            </p>
            <div className="hidden md:block">
              <CrestMark />
            </div>
          </div>

          <h1 className="mt-6 font-display text-balance text-[clamp(3.25rem,10.5vw,10rem)] leading-[0.95] text-white">
            {headlineWords.map((word) => (
              <span
                key={word}
                className={`hero-word mr-4 inline-block ${word === '&' ? 'italic text-white/85' : ''} ${word === TEMPLATE.couple.partnerTwo ? 'text-[#f6e6b8]' : ''}`}
              >
                {word}
              </span>
            ))}
          </h1>

          <div className="mt-10 flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="hero-sub max-w-md text-lg leading-8 text-white/80">{TEMPLATE.hero.sub}</p>
            <a
              href="#invitation"
              className="hero-cta inline-flex items-center gap-3 border-b border-[#f6e6b8]/70 pb-2 text-sm uppercase tracking-widest text-white transition-all hover:gap-5"
            >
              {TEMPLATE.hero.cta}
              <span>→</span>
            </a>
          </div>

          <div className="mt-14 grid max-w-3xl grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/5 px-5 py-5 ring-1 ring-white/10">
              <div className="font-display text-3xl text-white">{TEMPLATE.event.timeLabel}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Time</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-5 py-5 ring-1 ring-white/10">
              <div className="font-display text-3xl text-white">{TEMPLATE.event.dateLabel.split(' ')[0]}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Day</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-5 py-5 ring-1 ring-white/10">
              <div className="font-display text-3xl text-white">—</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-white/60">Black Tie</div>
            </div>
          </div>
        </div>
      </section>

      <section id="invitation" className="relative bg-[#0b0f18] py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="royal-reveal flex items-center gap-4">
            <div className="h-px w-10 bg-[#d2a94b]" />
            <p className="text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">{TEMPLATE.details.eyebrow}</p>
          </div>
          <h2 className="royal-title mt-6 max-w-3xl font-display text-balance text-5xl leading-[1.03] text-white md:text-6xl">
            {TEMPLATE.details.titleA} <em className="text-[#f6e6b8]">{TEMPLATE.details.titleB}</em>.
          </h2>

          <div className="royal-divider mt-10 h-px w-full bg-[linear-gradient(90deg,rgba(210,169,75,0),rgba(210,169,75,0.95),rgba(210,169,75,0))]" />

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {TEMPLATE.details.items.map((it) => (
              <div key={it.k} className="royal-card rounded-3xl bg-white/5 px-8 py-7 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.45em] text-white/55">{it.k}</div>
                <div className="mt-2 font-display text-2xl text-white">{it.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="relative bg-[#0b0f18] py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <p className="royal-reveal text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">
                {TEMPLATE.story.eyebrow}
              </p>
              <h2 className="royal-title mt-6 font-display text-balance text-5xl leading-[1.05] text-white md:text-6xl">
                {TEMPLATE.story.titleA} <em className="text-[#d2a94b]">{TEMPLATE.story.titleB}</em>.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <div className="space-y-7 text-lg leading-relaxed text-white/75">
                {TEMPLATE.story.paragraphs.map((p) => (
                  <p key={p} className="royal-reveal">
                    {p}
                  </p>
                ))}
              </div>
              <div className="royal-reveal mt-10 inline-flex items-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10">
                <span className="text-xs uppercase tracking-[0.45em] text-white/60">Hosted by</span>
                <span className="font-display text-xl text-white">{coupleName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="relative bg-[linear-gradient(180deg,#0b0f18_0%,#0f1420_48%,#0b0f18_100%)] py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <p className="royal-reveal text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">{TEMPLATE.schedule.eyebrow}</p>
          <h2 className="royal-title mt-6 font-display text-balance text-5xl text-white md:text-6xl">
            {TEMPLATE.schedule.titleA} <em className="text-[#f6e6b8]">{TEMPLATE.schedule.titleB}</em>.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {TEMPLATE.schedule.cards.map((c) => (
              <article key={c.n} className="royal-card group">
                <div className="royal-img relative mb-6 aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/10">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_60%)]" />
                  <div className="absolute left-5 top-5 inline-flex items-center gap-3 rounded-full bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.45em] text-white ring-1 ring-white/10">
                    <span className="text-[#f6e6b8]">{c.n}</span>
                    <span className="text-white/70">{c.time}</span>
                  </div>
                </div>
                <h3 className="font-display text-2xl text-white">{c.title}</h3>
                <p className="mt-3 text-white/70">{c.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="venue" className="relative bg-[#0b0f18] py-28">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <p className="royal-reveal text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">{TEMPLATE.venue.eyebrow}</p>
              <h2 className="royal-title mt-6 font-display text-balance text-5xl leading-[1.05] text-white md:text-6xl">
                {TEMPLATE.venue.titleA} <em className="text-[#d2a94b]">{TEMPLATE.venue.titleB}</em>.
              </h2>
              <p className="royal-reveal mt-8 leading-relaxed text-white/70">{TEMPLATE.venue.description}</p>
              <div className="royal-reveal mt-10 rounded-3xl bg-white/5 px-8 py-7 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-[0.45em] text-white/55">Address</div>
                <div className="mt-2 font-display text-2xl text-white">{TEMPLATE.venue.addressLine}</div>
              </div>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="royal-reveal text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">{TEMPLATE.map.eyebrow}</p>
              <h3 className="royal-title mt-4 font-display text-4xl text-white md:text-5xl">
                {TEMPLATE.map.titleA} <em className="text-[#f6e6b8]">{TEMPLATE.map.titleB}</em>.
              </h3>
              <div className="royal-reveal mt-10 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-6 px-8 py-6">
                  <div className="text-sm uppercase tracking-[0.35em] text-white/60">{TEMPLATE.event.locationLabel}</div>
                  <div className="h-px flex-1 bg-white/10" />
                  <div className="text-sm uppercase tracking-[0.35em] text-[#f6e6b8]/90">{TEMPLATE.event.dateLabel}</div>
                </div>
                <div className="grid place-items-center px-8 pb-10">
                  <div className="w-full rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(210,169,75,0.14),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.08),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-8 py-16 text-center ring-1 ring-white/10">
                    <div className="mx-auto mb-5 h-10 w-10 rounded-full bg-[#d2a94b]/20 ring-1 ring-[#d2a94b]/30" />
                    <p className="mx-auto max-w-md text-white/70">{TEMPLATE.map.note}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="rsvp" className="relative bg-[#070a11] pt-24 pb-12 text-white">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <p className="royal-reveal text-xs uppercase tracking-[0.45em] text-[#f6e6b8]/80">{TEMPLATE.rsvp.eyebrow}</p>
          <div className="mt-6 grid gap-10 border-b border-white/10 pb-16 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <h2 className="royal-title font-display text-balance text-5xl leading-[1.02] md:text-7xl">
                {TEMPLATE.rsvp.titleA}.<br />
                <em className="text-[#f6e6b8]">{TEMPLATE.rsvp.titleB}</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="royal-reveal mb-6 text-white/70">
                {TEMPLATE.rsvp.description} RSVP deadline: {TEMPLATE.event.rsvpDeadline}.
              </p>
              <form
                className="royal-reveal flex border-b border-white/25 pb-3"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <input
                  type="email"
                  placeholder={TEMPLATE.rsvp.inputPlaceholder}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-white/45"
                />
                <button className="text-sm uppercase tracking-widest transition hover:text-[#f6e6b8]">
                  {TEMPLATE.rsvp.submitLabel}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-6 text-sm text-white/55 md:flex-row md:items-center">
            <div className="font-display text-xl text-white">
              {TEMPLATE.couple.partnerOne}
              <span className="text-[#d2a94b]"> &amp; </span>
              {TEMPLATE.couple.partnerTwo}
            </div>
            <div className="flex gap-8">
              <a href="#top" className="transition hover:text-white">
                Top
              </a>
              <a href="#invitation" className="transition hover:text-white">
                Invitation
              </a>
              <a href="#venue" className="transition hover:text-white">
                Venue
              </a>
            </div>
            <div>Reusable royal wedding template</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

