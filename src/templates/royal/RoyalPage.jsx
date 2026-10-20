import { useEffect, useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import hero from './assets/door.jpg'
import aperitivo from './assets/table.jpg'
import dinner from '../sole-mare/assets/feature-2.jpg'
import couple from '../sole-mare/assets/feature-3.jpg'

gsap.registerPlugin(ScrollTrigger)

const VENUE_QUERY = 'Villa Ephrussi de Rothschild, Saint-Jean-Cap-Ferrat'

const INVITE = {
  couple: { one: 'Charlotte', two: 'Henry' },
  event: {
    dateLong: 'Saturday, 25 September 2027',
    dateShort: '25 · 09 · 2027',
    time: '17:00',
    place: 'Saint-Jean-Cap-Ferrat',
    rsvpBy: 'Saturday, 14 August 2027',
  },
  details: [
    { k: 'Date', v: 'Saturday, 25 September 2027' },
    { k: 'Ceremony', v: '17:00 · The Rose Garden' },
    { k: 'Dress code', v: 'Black tie' },
    { k: 'Kindly reply by', v: '14 August 2027' },
  ],
  story: [
    'We met on a rain-soaked evening in Paris, sharing the last dry corner beneath an awning on the Rue de Lille. Henry offered his umbrella; Charlotte offered directions he did not need.',
    'Seven years, two cities and one very patient spaniel later, we would love nothing more than to celebrate the next chapter with the people who have shaped every one before it.',
  ],
  schedule: [
    {
      n: '01',
      img: couple,
      alt: 'Illustration of a bride and groom walking hand in hand beneath bougainvillea',
      time: '17:00',
      title: 'The Ceremony',
      detail: 'Vows exchanged in the Rose Garden, beneath the arches overlooking the bay. Please be seated by 16:45.',
    },
    {
      n: '02',
      img: aperitivo,
      alt: 'A table laid with fresh bread, olive oil and ripe tomatoes in the sun',
      time: '18:00',
      title: 'Champagne Reception',
      detail: 'Champagne and canapés on the garden terraces as the light turns gold over the Mediterranean.',
    },
    {
      n: '03',
      img: dinner,
      alt: 'Illustration of a long candlelit dinner table on a stone terrace at sunset',
      time: '19:30',
      title: 'Dinner & Dancing',
      detail: 'A candlelit dinner in the villa salons, followed by toasts, a string quartet and dancing until late.',
    },
  ],
}

const CALENDAR_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=' +
  encodeURIComponent('Charlotte & Henry — Wedding') +
  '&dates=20270925T150000Z/20270925T223000Z' +
  '&details=' +
  encodeURIComponent('Black tie. Ceremony at 17:00 in the Rose Garden.') +
  '&location=' +
  encodeURIComponent('Villa Ephrussi de Rothschild, 1 Avenue Ephrussi de Rothschild, 06230 Saint-Jean-Cap-Ferrat, France')

const ACCENT = '#d6517f' // deep bougainvillea rose (decorative / large text)
const ACCENT_SOFT = '#f2a9c1' // light rose for small text on dark
const CREAM = '#f6efe4'

function CrestMark() {
  const gradId = 'royal-crest-gradient'
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" className="crest w-24 md:w-28">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e3ea" />
          <stop offset="0.5" stopColor={ACCENT} />
          <stop offset="1" stopColor={CREAM} />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="none" stroke={`url(#${gradId})`} strokeWidth="2.2" opacity="0.9" />
      <path
        className="crest-path"
        d="M30 52c6-10 14-16 22-16 4 0 6 2 8 6 2-4 4-6 8-6 8 0 16 6 22 16-4 2-7 4-10 7-4-8-8-12-12-12-2 0-3 1-4 3 8 2 14 8 14 16 0 10-9 18-20 18s-20-8-20-18c0-8 6-14 14-16-1-2-2-3-4-3-4 0-8 4-12 12-3-3-6-5-10-7z"
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path className="crest-path" d="M44 83c6 6 26 6 32 0" fill="none" stroke={`url(#${gradId})`} strokeWidth="2.6" strokeLinecap="round" />
      <path className="crest-path" d="M60 86v10" fill="none" stroke={`url(#${gradId})`} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

function Eyebrow({ children, className = '' }) {
  return <p className={`text-xs uppercase tracking-[0.4em] text-[#f2a9c1] ${className}`}>{children}</p>
}

function RsvpForm() {
  const [status, setStatus] = useState('idle')
  const [attending, setAttending] = useState('yes')
  const ids = useId()

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-3xl bg-white/5 px-7 py-8 ring-1 ring-white/10">
        <p className="font-display text-3xl text-white">Thank you.</p>
        <p className="mt-3 text-white/75">
          {attending === 'yes'
            ? 'Your reply has been received — we cannot wait to celebrate with you on the 25th.'
            : 'Your reply has been received. You will be dearly missed, and we will raise a glass to you.'}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 min-h-11 border-b border-white/40 text-sm uppercase tracking-widest text-white transition-colors hover:border-[#f2a9c1] hover:text-[#f2a9c1]"
        >
          Edit reply
        </button>
      </div>
    )
  }

  const field =
    'mt-2 block min-h-11 w-full rounded-xl bg-white/5 px-4 py-3 text-white ring-1 ring-white/20 placeholder:text-white/45 focus:ring-[#f2a9c1]'

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        setStatus('sent')
      }}
    >
      <div>
        <label htmlFor={`${ids}-name`} className="text-xs uppercase tracking-[0.3em] text-white/75">
          Full name
        </label>
        <input id={`${ids}-name`} name="name" type="text" required autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor={`${ids}-email`} className="text-xs uppercase tracking-[0.3em] text-white/75">
          Email
        </label>
        <input id={`${ids}-email`} name="email" type="email" required autoComplete="email" className={field} />
      </div>
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.3em] text-white/75">Will you attend?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {[
            { v: 'yes', label: 'Joyfully accepts' },
            { v: 'no', label: 'Regretfully declines' },
          ].map((o) => (
            <label
              key={o.v}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/20 has-[:checked]:ring-[#f2a9c1]"
            >
              <input
                type="radio"
                name="attending"
                value={o.v}
                checked={attending === o.v}
                onChange={() => setAttending(o.v)}
                className="h-4 w-4 accent-[#d6517f]"
              />
              <span className="text-white">{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {attending === 'yes' && (
        <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
          <div>
            <label htmlFor={`${ids}-guests`} className="text-xs uppercase tracking-[0.3em] text-white/75">
              Guests
            </label>
            <select id={`${ids}-guests`} name="guests" defaultValue="1" className={`${field} appearance-auto`}>
              <option value="1" className="text-black">1</option>
              <option value="2" className="text-black">2</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${ids}-diet`} className="text-xs uppercase tracking-[0.3em] text-white/75">
              Dietary requirements
            </label>
            <input
              id={`${ids}-diet`}
              name="dietary"
              type="text"
              placeholder="Optional"
              className={field}
            />
          </div>
        </div>
      )}
      <button
        type="submit"
        className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f6efe4] px-7 text-sm uppercase tracking-widest text-[#0b0f18] transition-colors hover:bg-[#f2a9c1]"
      >
        Send reply <span aria-hidden="true">→</span>
      </button>
    </form>
  )
}

export default function RoyalWeddingPage() {
  const root = useRef(null)
  const { one, two } = INVITE.couple

  useEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const headerBar = root.current?.querySelector('[data-header-bar]')
        if (headerBar) {
          gsap.fromTo(
            headerBar,
            { backgroundColor: 'rgba(10,12,20,0.25)' },
            {
              backgroundColor: 'rgba(10,12,20,0.82)',
              ease: 'none',
              scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=400', scrub: true },
            },
          )
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('.hero-curtain', { scaleY: 0, transformOrigin: '50% 0%', duration: 1.1 })
          .from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.7 }, '-=0.65')
          .from('.hero-word', { yPercent: 60, opacity: 0, duration: 1.1, stagger: 0.12 }, '-=0.5')
          .from('.hero-sub', { y: 16, opacity: 0, duration: 0.8 }, '-=0.55')
          .from('.hero-cta', { y: 14, opacity: 0, duration: 0.65 }, '-=0.6')
          .from('.hero-meta', { y: 16, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.5')
          .from('.crest', { y: 18, opacity: 0, scale: 0.96, duration: 0.9 }, '-=0.8')

        gsap.utils.toArray('.crest-path').forEach((p) => {
          const len = p.getTotalLength ? p.getTotalLength() : 0
          if (!len) return
          tl.fromTo(
            p,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' },
            0.6,
          )
        })

        gsap.to('.hero-img', {
          yPercent: 12,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        // One-shot reveals: `once` + toggle (not scrub), so they always finish at full
        // visibility — even when the user jumps straight past them.
        const reveals = []
        const reveal = (selector, from, to, start = 'top 90%') => {
          gsap.utils.toArray(selector).forEach((el) => {
            reveals.push(
              gsap.fromTo(el, from, {
                ...to,
                scrollTrigger: { trigger: el, start, once: true, toggleActions: 'play play none none' },
              }),
            )
          })
        }

        reveal(
          '.royal-title',
          { y: 26, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', clearProps: 'clipPath', duration: 1.1, ease: 'power4.out' },
        )
        reveal('.royal-reveal', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
        reveal(
          '.royal-divider',
          { scaleX: 0, transformOrigin: '0% 50%' },
          { scaleX: 1, duration: 1.1, ease: 'power3.out' },
          'top 95%',
        )
        reveal(
          '.royal-card',
          { y: 60, opacity: 0, rotateX: 12, transformPerspective: 1000 },
          { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'power4.out' },
        )
        reveal(
          '.royal-img',
          { clipPath: 'inset(12% 8% 12% 8% round 24px)', scale: 1.05 },
          { clipPath: 'inset(0% 0% 0% 0% round 24px)', scale: 1, duration: 1.2, ease: 'power3.out' },
          'top 85%',
        )

        // Safety net: anything still pending when the page bottom is reached is completed.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'bottom bottom+=4',
          once: true,
          onEnter: () => reveals.forEach((t) => t.progress(1)),
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
      })
    }, root)

    return () => {
      mm?.revert()
      ctx.revert()
    }
  }, [])

  return (
    <div ref={root} lang="en" className="royal-root overflow-x-clip bg-[#0b0f18] text-[#f6efe4]">
      <style>{`
        .royal-root [id] { scroll-margin-top: 6rem; }
        .royal-root :focus-visible { outline: 2px solid ${ACCENT_SOFT}; outline-offset: 3px; border-radius: 6px; }
        .royal-root input:focus-visible, .royal-root select:focus-visible { outline-offset: 2px; }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50">
        <div
          data-header-bar
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-b-3xl bg-[rgba(10,12,20,0.6)] px-4 py-3 ring-1 ring-white/10 backdrop-blur-md sm:px-6 md:py-4 lg:px-10"
        >
          <a href="#top" className="inline-flex min-h-11 items-center font-display text-lg tracking-wide text-white sm:text-xl">
            {one}
            <span className="px-1.5 text-[#d6517f]">&amp;</span>
            {two}
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            {[
              ['#invitation', 'Invitation'],
              ['#story', 'Our story'],
              ['#schedule', 'Schedule'],
              ['#venue', 'Venue'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#rsvp"
            className="inline-flex min-h-11 items-center rounded-full bg-[#f6efe4] px-5 text-sm text-[#0b0f18] transition-colors hover:bg-[#f2a9c1]"
          >
            RSVP
          </a>
        </div>
      </header>

      <main>
        <section id="top" className="hero relative flex min-h-[100svh] w-full flex-col overflow-hidden">
          <div className="hero-img absolute inset-0 will-change-transform">
            <img
              src={hero}
              alt="A whitewashed doorway framed by deep rose bougainvillea"
              width={1024}
              height={1280}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(214,81,127,0.28),transparent_45%),linear-gradient(to_bottom,rgba(11,15,24,0.6),rgba(11,15,24,0.78)_45%,rgba(11,15,24,0.96))]" />
          </div>

          <div className="hero-curtain absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(11,15,24,0.98),rgba(11,15,24,0))]" />

          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="floaty absolute left-[8%] top-[18%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(214,81,127,0.5),rgba(214,81,127,0)_70%)]" />
            <div className="floaty absolute right-[8%] top-[30%] h-36 w-36 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),rgba(255,255,255,0)_70%)]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-16 pt-32 sm:px-6 md:pb-24 lg:px-10">
            <div className="flex items-end justify-between gap-10">
              <p className="hero-eyebrow text-xs uppercase leading-relaxed tracking-[0.35em] text-white/85 md:tracking-[0.45em]">
                Together with their families
              </p>
              <div className="hidden md:block">
                <CrestMark />
              </div>
            </div>

            <h1
              aria-label={`${one} and ${two}`}
              className="mt-6 font-display text-[clamp(3.25rem,10vw,9.5rem)] leading-[1] text-white"
            >
              <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-[0.22em]">
                <span className="hero-word inline-block">{one}</span>
                <span className="hero-word inline-block italic text-[#d6517f]">&amp;</span>
                <span className="hero-word inline-block text-[#f6efe4]">{two}</span>
              </span>
            </h1>

            <div className="mt-8 flex max-w-5xl flex-col gap-8 md:mt-10 md:flex-row md:items-end md:justify-between">
              <p className="hero-sub max-w-lg text-base leading-7 text-white/85 md:text-lg md:leading-8">
                request the pleasure of your company at the celebration of their marriage, in the rose gardens of Villa
                Ephrussi de Rothschild on the Côte d’Azur.
              </p>
              <a
                href="#invitation"
                className="hero-cta inline-flex min-h-11 w-fit items-center gap-3 border-b border-[#f2a9c1]/70 text-sm uppercase tracking-widest text-white transition-[color,background-color,border-color,gap] hover:gap-5"
              >
                The invitation
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <dl className="mt-12 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
              {[
                { v: '25 Sep', k: '2027' },
                { v: INVITE.event.time, k: 'Ceremony' },
                { v: 'Black', k: 'Tie' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="hero-meta flex flex-col-reverse rounded-2xl bg-[rgba(11,15,24,0.55)] px-3 py-4 ring-1 ring-white/15 backdrop-blur-sm sm:px-5 sm:py-5"
                >
                  <dt className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-white/75 sm:text-xs">{s.k}</dt>
                  <dd className="font-display text-2xl text-white sm:text-3xl">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="invitation" className="relative bg-[#0b0f18] py-24 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
            <div className="royal-reveal flex items-center gap-4">
              <div className="h-px w-10 bg-[#d6517f]" />
              <Eyebrow>The invitation</Eyebrow>
            </div>
            <h2 className="royal-title mt-6 max-w-3xl font-display text-balance text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl">
              An evening of <em className="text-[#f2a9c1]">grace &amp; celebration</em>.
            </h2>
            <p className="royal-reveal mt-8 max-w-2xl text-lg leading-relaxed text-white/80">
              Mr &amp; Mrs Edward Ashford and Mr &amp; Mrs Thomas Whitmore joyfully invite you to the marriage of their
              children, Charlotte Ashford and Henry Whitmore.
            </p>

            <div className="royal-divider mt-10 h-px w-full bg-[linear-gradient(90deg,rgba(214,81,127,0),rgba(214,81,127,0.95),rgba(214,81,127,0))]" />

            <dl className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
              {INVITE.details.map((it) => (
                <div key={it.k} className="royal-card rounded-3xl bg-white/5 px-6 py-6 ring-1 ring-white/10 sm:px-8 sm:py-7">
                  <dt className="text-xs uppercase tracking-[0.35em] text-white/70">{it.k}</dt>
                  <dd className="mt-2 font-display text-2xl text-white">{it.v}</dd>
                </div>
              ))}
            </dl>

            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="royal-reveal mt-10 inline-flex min-h-11 items-center gap-3 border-b border-[#f2a9c1]/70 text-sm uppercase tracking-widest text-white transition-[color,background-color,border-color,gap] hover:gap-5"
            >
              Add to calendar <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section id="story" className="relative bg-[#0b0f18] py-24 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
            <div className="grid gap-12 md:grid-cols-12 md:items-start md:gap-14">
              <div className="md:col-span-5">
                <Eyebrow className="royal-reveal">Our story</Eyebrow>
                <h2 className="royal-title mt-6 font-display text-balance text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl">
                  One umbrella, <em className="text-[#d6517f]">a lifetime after</em>.
                </h2>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <div className="space-y-7 text-lg leading-relaxed text-white/80">
                  {INVITE.story.map((p) => (
                    <p key={p} className="royal-reveal">
                      {p}
                    </p>
                  ))}
                </div>
                <div className="royal-reveal mt-10 inline-flex flex-wrap items-center gap-3 rounded-full bg-white/5 px-6 py-3 ring-1 ring-white/10">
                  <span className="text-xs uppercase tracking-[0.35em] text-white/70">With love</span>
                  <span className="font-display text-xl text-white">
                    {one} &amp; {two}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="schedule"
          className="relative bg-[linear-gradient(180deg,#0b0f18_0%,#141020_48%,#0b0f18_100%)] py-24 md:py-28"
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
            <Eyebrow className="royal-reveal">Saturday, 25 September</Eyebrow>
            <h2 className="royal-title mt-6 font-display text-balance text-4xl text-white sm:text-5xl md:text-6xl">
              The order <em className="text-[#f2a9c1]">of the evening</em>.
            </h2>

            <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
              {INVITE.schedule.map((c) => (
                <li key={c.n} className="royal-card group">
                  <div className="royal-img relative mb-6 aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/10">
                    <img
                      src={c.img}
                      alt={c.alt}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_60%)]" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white ring-1 ring-white/15">
                      <span className="text-[#f2a9c1]">{c.n}</span>
                      <span>{c.time}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-3xl text-white">{c.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/75">{c.detail}</p>
                </li>
              ))}
            </ol>
            <p className="royal-reveal mt-12 max-w-2xl text-white/75">
              Carriages at 00:30. Shuttles return to Place Masséna, Nice, at 00:45.
            </p>
          </div>
        </section>

        <section id="venue" className="relative bg-[#0b0f18] py-24 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
            <div className="grid gap-12 md:grid-cols-12 md:items-start">
              <div className="md:col-span-5">
                <Eyebrow className="royal-reveal">The venue</Eyebrow>
                <h2 className="royal-title mt-6 font-display text-balance text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl">
                  Villa Ephrussi <em className="text-[#d6517f]">de Rothschild</em>.
                </h2>
                <p className="royal-reveal mt-8 leading-relaxed text-white/80">
                  A rose-pink Belle Époque palazzo on the Cap Ferrat peninsula, set among nine gardens with the sea on
                  either side. The ceremony takes place in the Rose Garden; dinner follows in the villa’s salons.
                </p>
                <div className="royal-reveal mt-10 rounded-3xl bg-white/5 px-6 py-6 ring-1 ring-white/10 sm:px-8 sm:py-7">
                  <div className="text-xs uppercase tracking-[0.35em] text-white/70">Address</div>
                  <address className="mt-2 font-display text-2xl not-italic leading-snug text-white">
                    1 Avenue Ephrussi de Rothschild
                    <br />
                    06230 Saint-Jean-Cap-Ferrat, France
                  </address>
                </div>
                <div className="royal-reveal mt-6 rounded-3xl bg-white/5 px-6 py-6 ring-1 ring-white/10 sm:px-8 sm:py-7">
                  <div className="text-xs uppercase tracking-[0.35em] text-white/70">Getting there</div>
                  <p className="mt-2 leading-relaxed text-white/80">
                    Nice Côte d’Azur Airport is 30 minutes away. Shuttles depart Place Masséna, Nice, at 16:00. Parking
                    on site is limited.
                  </p>
                </div>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <div className="royal-reveal overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5 sm:px-8">
                    <div className="text-xs uppercase tracking-[0.3em] text-white/75">{INVITE.event.place}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-[#f2a9c1]">{INVITE.event.dateShort}</div>
                  </div>
                  <div className="aspect-[4/3] w-full md:aspect-[4/5]">
                    <iframe
                      title="Map showing Villa Ephrussi de Rothschild, Saint-Jean-Cap-Ferrat"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(VENUE_QUERY)}&output=embed`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full border-0 [filter:grayscale(0.35)_contrast(1.05)]"
                    />
                  </div>
                  <div className="px-6 py-5 sm:px-8">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(VENUE_QUERY)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-3 border-b border-[#f2a9c1]/70 text-sm uppercase tracking-widest text-white transition-[color,background-color,border-color,gap] hover:gap-5"
                    >
                      Get directions <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="rsvp" className="relative bg-[#070a11] pb-12 pt-24 text-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <Eyebrow className="royal-reveal">RSVP</Eyebrow>
          <div className="mt-6 grid gap-12 border-b border-white/10 pb-16 md:grid-cols-12">
            <div className="md:col-span-6">
              <h2 className="royal-title font-display text-balance text-5xl leading-[1.04] md:text-7xl">
                Kindly reply.
                <br />
                <em className="text-[#f2a9c1]">We hope you’ll join us.</em>
              </h2>
              <p className="royal-reveal mt-8 max-w-md text-white/80">
                Please let us know by <strong className="font-medium text-white">{INVITE.event.rsvpBy}</strong>. We
                have reserved one seat in your name unless your invitation says otherwise.
              </p>
            </div>
            <div className="royal-reveal md:col-span-5 md:col-start-8">
              <RsvpForm />
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-between gap-6 text-sm text-white/70 md:flex-row md:items-center">
            <div className="font-display text-xl text-white">
              {one}
              <span className="px-1.5 text-[#d6517f]">&amp;</span>
              {two}
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-8">
              {[
                ['#top', 'Top'],
                ['#schedule', 'Schedule'],
                ['#venue', 'Venue'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-white">
                  {label}
                </a>
              ))}
            </nav>
            <div>
              {INVITE.event.dateShort} · {INVITE.event.place}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
