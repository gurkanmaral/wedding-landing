import { useEffect, useId, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useWeddingCardFields } from '../../api/weddingCardContext'
import { useRsvp } from '../../api/useRsvp'

import hero from './assets/hero-generic.jpg'
import feature1 from './assets/feature-1.jpg'
import feature2 from './assets/feature-2.jpg'
import feature3 from './assets/feature-3.jpg'
import gallery from './assets/gallery-generic.jpg'
import church from './assets/scene-church.jpg'
import olive from './assets/ornament-olive.png'

gsap.registerPlugin(ScrollTrigger)

// Darker terracotta for small text on the cream background (theme --primary is ~4:1, too light for AA).
const INK = 'text-[oklch(0.5_0.15_35)]'

const DEFAULTS = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-09-04T17:00:00+03:00',
  venue: 'Villa Defne',
  city: 'Bodrum, Muğla',
  address: 'Yalıkavak Sahil Yolu',
  rsvpDeadline: '24 Temmuz 2027',
}

const DAY_MS = 24 * 60 * 60 * 1000

const fmtTr = (date, options) => new Intl.DateTimeFormat('tr-TR', options).format(date)

/** "4 Eylül Cumartesi" */
const dayLabel = (date) =>
  `${fmtTr(date, { day: 'numeric' })} ${fmtTr(date, { month: 'long' })} ${fmtTr(date, { weekday: 'long' })}`

const toCalendarStamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function buildEvents(eventDate) {
  const day1 = dayLabel(eventDate)
  const day2 = dayLabel(new Date(eventDate.getTime() + DAY_MS))
  return [
    {
      n: '01',
      img: feature1,
      t: 'Nikâh Töreni',
      d: 'Denize bakan beyaz bir kemerin altında sade ve içten bir tören.',
      time: `${day1} · 17:00`,
    },
    {
      n: '02',
      img: feature2,
      t: 'Akşam Yemeği',
      d: 'Zeytin ağaçları ve mumların arasında uzun bir sofra, paylaşılan yemekler ve dans.',
      time: `${day1} · 20:00`,
    },
    {
      n: '03',
      img: church,
      t: 'Sabah Kahvesi',
      d: 'Mavi kubbeli küçük şapelin önünde sabah kahvesi, ardından sahil yürüyüşü.',
      time: `${day2} · 09:30`,
    },
    {
      n: '04',
      img: feature3,
      t: 'Brunch & Veda',
      d: 'Beyaz sokaklarda geç bir kahvaltı, son bir kadeh ve yola çıkış.',
      time: `${day2} · 11:30`,
    },
  ]
}

const QUOTE =
  'Deniz ne kadar maviyse, aşkımız o kadar derin. Bu güzel günde yanımızda olmanız bizim için bir armağan.'

/** Splits text into per-character spans in React (StrictMode-safe, no DOM mutation). */
function SplitChars({ text }) {
  return Array.from(text).map((ch, i) => (
    <span key={i} className="char inline-block">
      {ch === ' ' ? ' ' : ch}
    </span>
  ))
}

function RsvpForm() {
  const [sent, setSent] = useState(false)
  const [attending, setAttending] = useState('evet')
  const ids = useId()
  const rsvp = useRsvp('tr')
  const sending = rsvp.status === 'sending'

  if (sent) {
    return (
      <div role="status" className="rounded-md border border-background/20 p-6">
        <p className="font-display text-2xl">Teşekkür ederiz!</p>
        <p className="mt-2 text-background/80">
          {attending === 'evet'
            ? 'Yanıtınız bize ulaştı. Düğün günümüzde sizi aramızda görmek için sabırsızlanıyoruz.'
            : 'Yanıtınız bize ulaştı. Sizi çok özleyeceğiz; kadehlerimizi sizin için de kaldıracağız.'}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 min-h-11 border-b border-background/40 text-xs uppercase tracking-widest transition-colors hover:border-primary hover:text-primary"
        >
          Yanıtı düzenle
        </button>
      </div>
    )
  }

  const field =
    'mt-1.5 block min-h-11 w-full rounded-md border border-background/30 bg-transparent px-3 py-2.5 text-background placeholder:text-background/55 focus:border-background'
  const label = 'text-[0.7rem] uppercase tracking-[0.2em] text-background/80'

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (sending) return
        const data = new FormData(e.currentTarget)
        const yes = attending === 'evet'
        const email = String(data.get('eposta') || '').trim()
        // yanıtın ayrı bir e-posta alanı yok; adres nota eklenir
        const ok = await rsvp.submit({
          name: String(data.get('ad') || ''),
          attending: yes,
          guests: yes ? Number(data.get('kisi')) || 1 : 0,
          note: email ? `E-posta: ${email}` : '',
        })
        if (ok) setSent(true)
      }}
      aria-busy={sending}
    >
      <div>
        <label htmlFor={`${ids}-ad`} className={label}>
          Adınız Soyadınız
        </label>
        <input id={`${ids}-ad`} name="ad" type="text" required maxLength={120} autoComplete="name" className={field} />
      </div>
      <div>
        <label htmlFor={`${ids}-eposta`} className={label}>
          E-posta adresiniz
        </label>
        <input id={`${ids}-eposta`} name="eposta" type="email" required autoComplete="email" className={field} />
      </div>
      <fieldset>
        <legend className={label}>Katılım durumunuz</legend>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {[
            { v: 'evet', l: 'Seve seve katılıyorum' },
            { v: 'hayir', l: 'Maalesef katılamıyorum' },
          ].map((o) => (
            <label
              key={o.v}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-background/30 px-3 py-2 has-[:checked]:border-background"
            >
              <input
                type="radio"
                name="katilim"
                value={o.v}
                checked={attending === o.v}
                onChange={() => setAttending(o.v)}
                className="h-4 w-4 accent-[oklch(0.58_0.16_35)]"
              />
              <span className="text-sm">{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {attending === 'evet' && (
        <div>
          <label htmlFor={`${ids}-kisi`} className={label}>
            Kişi sayısı
          </label>
          <select id={`${ids}-kisi`} name="kisi" defaultValue="1" className={field}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n} className="text-foreground">
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
      {rsvp.error ? (
        <p role="alert" className="rounded-md border border-[oklch(0.72_0.15_35)] bg-[oklch(0.58_0.16_35/0.18)] px-3 py-2.5 text-sm text-background">
          {rsvp.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-background px-6 text-sm uppercase tracking-widest text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-progress disabled:opacity-60"
      >
        {sending ? 'Gönderiliyor…' : <>Gönder <span aria-hidden="true">→</span></>}
      </button>
    </form>
  )
}

export default function SoleMarePage() {
  const root = useRef(null)
  const { partner1, partner2, eventDate, dateLabel, venue, city, address, rsvpDeadline } = useWeddingCardFields(
    DEFAULTS,
    'tr-TR',
  )
  const cityShort = city.split(',')[0].trim()
  const mapQuery = `${address}, ${city}`
  const events = buildEvents(eventDate)
  const calendarUrl =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' +
    encodeURIComponent(`${partner1} & ${partner2} — Düğün`) +
    `&dates=${toCalendarStamp(eventDate)}/${toCalendarStamp(new Date(eventDate.getTime() + 7 * 60 * 60 * 1000))}` +
    '&details=' +
    encodeURIComponent('Nikâh töreni 17:00, akşam yemeği 20:00.') +
    '&location=' +
    encodeURIComponent(`${venue}, ${address}, ${city}`)
  const statDay = fmtTr(eventDate, { day: 'numeric' })
  const statMonthYear = `${fmtTr(eventDate, { month: 'long' })} ${fmtTr(eventDate, { year: 'numeric' })}`
  const weekday = fmtTr(eventDate, { weekday: 'long' })
  const bigDate = fmtTr(eventDate, { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\D+/g, '·')
  const footerDate = fmtTr(eventDate, { day: '2-digit', month: '2-digit', year: 'numeric' })

  useEffect(() => {
    let mm
    const ctx = gsap.context(() => {
      mm = gsap.matchMedia()

      // Horizontal pinned programme (desktop only). Registered first so later
      // ScrollTriggers compute their start positions including the pin spacing.
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const track = root.current?.querySelector('.pin-track')
        const wrap = root.current?.querySelector('.pin-wrap')
        if (!track || !wrap) return
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth)
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top top',
            end: () => '+=' + distance(),
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            refreshPriority: 1,
          },
        })
        ScrollTrigger.sort()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        tl.from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.8 })
          .from('.split .char', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.035 }, '-=0.4')
          .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
          .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
          .addLabel('meta', '-=0.3')
          .from('.hero-meta', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, 'meta')
          .from('.float-olive', { scale: 0, rotate: -40, opacity: 0, duration: 1.2, ease: 'back.out(1.7)' }, '-=0.8')

        // Count-up in the hero. The final value is already in the markup, so
        // the number is correct even if the tween is skipped or reverted.
        const counters = gsap.utils.toArray('[data-count]')
        counters.forEach((el) => {
          const target = Number(el.getAttribute('data-count') || '0')
          const obj = { v: 0 }
          el.textContent = '0'
          tl.to(
            obj,
            {
              v: target,
              duration: 1.6,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = String(Math.round(obj.v))
              },
            },
            'meta',
          )
        })

        gsap.to('.hero-img', {
          yPercent: 16,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        gsap.to('.float-olive-wrap', {
          y: -80,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        })

        // One-shot reveals (`once`, not scrub) so every element ends fully visible,
        // even when the user scrolls straight past it.
        const reveals = []
        const reveal = (selector, from, to, start = 'top 90%', getTargets) => {
          gsap.utils.toArray(selector).forEach((el) => {
            reveals.push(
              gsap.fromTo(getTargets ? getTargets(el) : el, from, {
                ...to,
                scrollTrigger: { trigger: el, start, once: true, toggleActions: 'play play none none' },
              }),
            )
          })
        }

        reveal(
          '.clip-reveal',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', clearProps: 'clipPath', duration: 1.4, ease: 'power3.out' },
          'top 85%',
        )
        reveal('.reveal', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
        reveal(
          '.words',
          { yPercent: 110 },
          { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05 },
          'top 85%',
          (el) => el.querySelectorAll('.word-i'),
        )
        reveal(
          '.big-date',
          { letterSpacing: '0.15em', opacity: 0 },
          { letterSpacing: '0.02em', opacity: 1, duration: 1.6, ease: 'power3.out' },
          'top 88%',
        )

        gsap.utils.toArray('.draw-path').forEach((p) => {
          const len = p.getTotalLength()
          reveals.push(
            gsap.fromTo(
              p,
              { strokeDasharray: len, strokeDashoffset: len },
              {
                strokeDashoffset: 0,
                duration: 2.4,
                ease: 'power2.inOut',
                scrollTrigger: { trigger: p, start: 'top 90%', once: true, toggleActions: 'play play none none' },
              },
            ),
          )
        })

        // Safety net: complete anything still pending once the bottom of the page is reached.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'bottom bottom+=4',
          once: true,
          onEnter: () => reveals.forEach((t) => t.progress(1)),
        })

        const marqueeTween = gsap.to('.marquee-track', {
          xPercent: -50,
          ease: 'none',
          duration: 28,
          repeat: -1,
        })
        const marqueeEl = root.current?.querySelector('.marquee')
        const onEnter = () => marqueeTween.timeScale(0.2)
        const onLeave = () => marqueeTween.timeScale(1)
        marqueeEl?.addEventListener('mouseenter', onEnter)
        marqueeEl?.addEventListener('mouseleave', onLeave)

        return () => {
          marqueeEl?.removeEventListener('mouseenter', onEnter)
          marqueeEl?.removeEventListener('mouseleave', onLeave)
          counters.forEach((el) => {
            el.textContent = el.getAttribute('data-count') || '0'
          })
        }
      })

      // Magnetic buttons only for fine pointers.
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const offs = gsap.utils.toArray('.magnetic').map((btn) => {
          const move = (e) => {
            const r = btn.getBoundingClientRect()
            const x = e.clientX - (r.left + r.width / 2)
            const y = e.clientY - (r.top + r.height / 2)
            gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power3.out' })
          }
          const reset = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' })
          btn.addEventListener('mousemove', move)
          btn.addEventListener('mouseleave', reset)
          return () => {
            btn.removeEventListener('mousemove', move)
            btn.removeEventListener('mouseleave', reset)
          }
        })
        return () => offs.forEach((off) => off())
      })
    }, root)

    return () => {
      mm?.revert()
      ctx.revert()
    }
  }, [partner1, partner2])

  return (
    <div ref={root} lang="tr" className="sm-root bg-background text-foreground overflow-x-clip">
      <style>{`
        .sm-root [id] { scroll-margin-top: 5.5rem; }
        .sm-root :focus-visible { outline: 2px solid oklch(0.5 0.15 35); outline-offset: 3px; border-radius: 4px; }
        .sm-root footer :focus-visible { outline-color: var(--background); }
        .sm-root .hero-text-halo { text-shadow: 0 1px 12px color-mix(in oklab, var(--background) 85%, transparent); }
      `}</style>

      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/75 border-b border-foreground/5">
        <div className="container-x flex items-center justify-between gap-4 py-2.5 md:py-4">
          <a href="#top" className="inline-flex min-h-11 items-center font-display text-lg md:text-xl tracking-wide">
            {partner1}
            <span className="text-primary px-1">&amp;</span>
            {partner2}
          </a>
          <nav aria-label="Bölümler" className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {[
              ['#story', 'Hikâye'],
              ['#events', 'Program'],
              ['#gallery', 'Galeri'],
              ['#map', 'Mekân'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#rsvp"
            className="magnetic inline-flex min-h-11 items-center text-xs md:text-sm px-5 rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            Katılım Bildir
          </a>
        </div>
      </header>

      <main>
        <section id="top" className="hero relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-end">
          <div className="hero-img absolute inset-0 will-change-transform">
            <img
              src={hero}
              alt="Suluboya: Akdeniz kıyısında, begonvillerle çevrili beyaz bir köy ve uçurum"
              width={1080}
              height={1920}
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/5 to-background" />
          </div>
          {/* Extra wash behind the text block so copy and stats stay legible over the watercolor. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[88%] bg-gradient-to-t from-background via-background/85 to-transparent md:h-[60%] md:via-background/75" />

          <div className="float-olive-wrap pointer-events-none absolute top-20 right-3 md:top-32 md:right-12 z-10">
            <img src={olive} alt="" aria-hidden="true" className="float-olive w-24 md:w-44 opacity-90" />
          </div>

          <div className="relative z-10 container-x pb-12 md:pb-20 pt-32">
            <p className="hero-eyebrow hero-text-halo text-[0.7rem] md:text-xs tracking-[0.3em] uppercase text-foreground/85 mb-4 md:mb-6">
              {cityShort} · {dateLabel}
            </p>
            <h1 aria-label={`${partner1} ve ${partner2}`} className="font-display leading-[0.9] text-balance">
              <span aria-hidden="true" className="split block overflow-hidden pt-[0.08em] pb-[0.04em] text-[17vw] md:text-[11vw] lg:text-[10rem]">
                <SplitChars text={partner1} />
              </span>
              <span
                aria-hidden="true"
                className="split block overflow-hidden pt-[0.04em] pb-[0.08em] pr-[0.1em] italic text-primary text-[17vw] md:text-[11vw] lg:text-[10rem]"
              >
                <SplitChars text={`& ${partner2}`} />
              </span>
            </h1>

            <div className="mt-6 md:mt-10 grid md:grid-cols-2 gap-6 md:gap-8 md:items-end">
              <p className="hero-sub hero-text-halo text-foreground text-base md:text-lg max-w-md">
                Zeytin ağaçlarının ve begonvillerin altında, Akdeniz’in kıyısında bir araya geliyoruz. Bu özel
                günümüzde yanımızda olun.
              </p>
              <a
                href="#story"
                className="hero-cta inline-flex min-h-11 items-center gap-3 self-start md:self-end md:justify-self-end border-b border-foreground/50 text-xs md:text-sm tracking-widest uppercase hover:gap-5 transition-[color,background-color,border-color,gap] w-fit"
              >
                Hikâyemiz
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <dl className="mt-8 md:mt-12 inline-flex flex-wrap gap-x-6 gap-y-3 md:gap-x-12 rounded-md bg-background/85 backdrop-blur-sm border border-foreground/10 px-4 py-3 md:px-6 md:py-4 shadow-sm">
              <div className="hero-meta flex flex-col-reverse">
                <dt className="text-[0.65rem] md:text-xs uppercase tracking-[0.12em] md:tracking-widest text-foreground/80 mt-1 whitespace-nowrap">
                  {statMonthYear}
                </dt>
                <dd className="font-display text-2xl md:text-4xl text-foreground">
                  {statDay}
                </dd>
              </div>
              <div className="hero-meta flex flex-col-reverse">
                <dt className="text-[0.65rem] md:text-xs uppercase tracking-[0.12em] md:tracking-widest text-foreground/80 mt-1 whitespace-nowrap">
                  Sevdiklerimiz
                </dt>
                <dd className="font-display text-2xl md:text-4xl text-foreground">
                  <span data-count="120">120</span>
                </dd>
              </div>
              <div className="hero-meta flex flex-col-reverse">
                <dt className="text-[0.65rem] md:text-xs uppercase tracking-[0.12em] md:tracking-widest text-foreground/80 mt-1 whitespace-nowrap">
                  Gün Kutlama
                </dt>
                <dd className="font-display text-2xl md:text-4xl text-foreground">
                  2<span className="text-primary">.</span>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section aria-hidden="true" className="marquee border-y border-border bg-card overflow-hidden">
          <div className="marquee-track flex w-max whitespace-nowrap py-4 md:py-6 font-display text-2xl md:text-5xl italic">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex shrink-0 items-center gap-8 md:gap-12 pr-8 md:pr-12">
                <span>Aşk</span>
                <span className="text-primary">✦</span>
                <span>Deniz</span>
                <span className="text-primary">✦</span>
                <span>Akdeniz</span>
                <span className="text-primary">✦</span>
                <span>Sonsuza</span>
                <span className="text-primary">✦</span>
              </div>
            ))}
          </div>
        </section>

        <section id="story" className="py-20 md:py-32 container-x">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
            <div className="md:col-span-5 reveal">
              <p className={`text-[0.7rem] md:text-xs tracking-[0.35em] uppercase ${INK} mb-4 md:mb-6`}>Hikâyemiz</p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
                Bir <em className="text-primary">yaz akşamı</em> başladı.
              </h2>
              <svg viewBox="0 0 220 24" aria-hidden="true" className="mt-6 w-44 md:w-56 h-5 text-primary">
                <path
                  className="draw-path"
                  d="M2 14 C 40 4, 90 22, 140 10 S 210 6, 218 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="md:col-span-6 md:col-start-7 reveal space-y-5 text-muted-foreground leading-relaxed text-base md:text-lg">
              <p>
                Küçük bir sahil kasabasında, zeytin ağaçlarının gölgesinde tanıştık. O günden sonra her yaz aynı
                kıyıya, aynı denize, aynı sofraya geri döndük.
              </p>
              <p>
                Şimdi sıra hayatımızın en güzel sözünü vermeye geldi — hem de sevdiklerimizin önünde, Akdeniz’in
                mavisine karşı.
              </p>
              <div className="pt-4">
                <div className="font-display italic text-xl text-foreground">
                  {partner1} &amp; {partner2}
                </div>
                <div className="text-[0.7rem] uppercase tracking-widest text-muted-foreground">Gelin &amp; Damat</div>
              </div>
            </div>
          </div>
        </section>

        <section id="events" className="bg-card overflow-hidden">
          <div className="container-x pt-20 md:pt-28 pb-10">
            <div className="reveal max-w-3xl">
              <p className={`text-[0.7rem] md:text-xs tracking-[0.35em] uppercase ${INK} mb-4`}>Program</p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
                İki gün, <em>tek bir</em> kutlama.
              </h2>
            </div>
          </div>

          <div className="pin-wrap">
            <ol className="pin-track flex flex-col gap-14 px-6 pb-20 md:px-12 md:motion-safe:flex-row md:motion-safe:w-max md:motion-safe:h-screen md:motion-safe:items-center md:motion-safe:gap-12 md:motion-safe:pb-0">
              {events.map((c) => (
                <li key={c.n} className="reveal group md:motion-safe:w-[70vw] lg:motion-safe:w-[55vw] md:motion-safe:shrink-0">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                    <div className="relative aspect-[4/5] md:motion-safe:max-h-[75vh] overflow-hidden rounded-md clip-reveal">
                      <img
                        src={c.img}
                        alt={c.t}
                        loading="lazy"
                        width={1024}
                        height={1024}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 font-display text-sm bg-background/90 backdrop-blur px-2 py-1 rounded">
                        {c.n}
                      </div>
                    </div>
                    <div>
                      <div className={`text-[0.7rem] uppercase tracking-widest ${INK} mb-2`}>{c.time}</div>
                      <h3 className="font-display text-3xl md:text-5xl mb-3 leading-tight">{c.t}</h3>
                      <p className="text-muted-foreground text-base md:text-lg">{c.d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-24 md:py-40 container-x text-center overflow-hidden">
          <p className={`text-[0.7rem] md:text-xs tracking-[0.35em] uppercase ${INK} mb-6`}>Bu tarihi ayırın</p>
          <p className="big-date font-display italic text-primary text-[17vw] md:text-[12rem] leading-none whitespace-nowrap">
            <span className="sr-only">{dateLabel}</span>
            <span aria-hidden="true">{bigDate}</span>
          </p>
          <p className="mt-6 text-muted-foreground tracking-widest text-xs uppercase">
            {weekday} · {city}
          </p>
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-foreground/40 text-xs md:text-sm tracking-widest uppercase hover:text-primary hover:border-primary transition-colors"
          >
            Takvime ekle <span aria-hidden="true">→</span>
          </a>
        </section>

        <section id="gallery" className="py-20 md:py-32 container-x">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-7 order-2 md:order-1">
              <div className="aspect-[4/5] overflow-hidden rounded-md clip-reveal">
                <img
                  src={gallery}
                  alt="Akdeniz kıyısında gelin ve damat"
                  loading="lazy"
                  width={1280}
                  height={1600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal order-1 md:order-2">
              <p className={`text-[0.7rem] md:text-xs tracking-[0.35em] uppercase ${INK} mb-4 md:mb-6`}>Mekân</p>
              <h2 className="font-display text-4xl md:text-5xl leading-[1.05] mb-5 md:mb-6 text-balance">
                Denizin <em>kenarında</em>.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 md:mb-8">
                Bodrum’un sakin bir köyünde, zeytinlikler ve uçurumlar arasında, küçük bir taş villa bizi ağırlıyor.
              </p>
              <dl className="grid grid-cols-2 gap-4 md:gap-6 text-sm border-t border-border pt-5 md:pt-6">
                <div>
                  <dt className="uppercase tracking-widest text-[0.7rem] text-muted-foreground mb-1">Tarih</dt>
                  <dd className="font-display text-xl md:text-2xl">{dateLabel}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-widest text-[0.7rem] text-muted-foreground mb-1">Yer</dt>
                  <dd className="font-display text-xl md:text-2xl">{venue}</dd>
                </div>
              </dl>
              <a
                href="#rsvp"
                className="magnetic inline-flex min-h-11 items-center mt-8 md:mt-10 px-6 md:px-7 rounded-full bg-foreground text-background hover:bg-primary transition-colors text-xs md:text-sm tracking-widest uppercase"
              >
                Katılımınızı bildirin
              </a>
            </div>
          </div>
        </section>

        <section id="map" className="py-20 md:py-32 container-x">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end mb-10 md:mb-14">
            <div className="md:col-span-6 reveal">
              <p className={`text-[0.7rem] md:text-xs tracking-[0.35em] uppercase ${INK} mb-4`}>Konum</p>
              <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
                Bizi <em className="text-primary">burada</em> bulun.
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 reveal text-muted-foreground">
              <p className="text-base md:text-lg leading-relaxed">
                Bodrum’un kıyısında, zeytinliklerin arasında saklı bir villa. Yol tarifi ve park bilgisi için haritayı
                kullanabilirsiniz.
              </p>
            </div>
          </div>

          <div className="reveal relative rounded-md overflow-hidden border border-border shadow-xl bg-card">
            <div className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[21/9] w-full">
              <iframe
                title={`Düğün mekânı haritası: ${venue}, ${city}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full border-0 grayscale-[0.2] contrast-[1.05]"
                allowFullScreen
              />
            </div>

            <div className="md:absolute md:left-8 md:bottom-8 bg-background/95 backdrop-blur md:border border-border md:rounded-md p-5 md:p-6 md:max-w-[18rem] md:shadow-2xl">
              <div className={`text-[0.65rem] uppercase tracking-[0.3em] ${INK} mb-2`}>Mekân</div>
              <div className="font-display text-xl md:text-2xl leading-tight mb-1">{venue}</div>
              <address className="not-italic text-sm text-muted-foreground mb-3">
                {address}
                <br />
                {city}
              </address>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-xs tracking-widest uppercase border-b border-foreground/40 hover:text-primary hover:border-primary transition-colors"
              >
                Yol tarifi al <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        <section className="relative isolate py-24 md:py-40 overflow-hidden">
          <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-sunset)' }} />
          {/* Darkening layer so the cream quote meets contrast on the light end of the gradient. */}
          <div className="absolute inset-0 -z-10 bg-[oklch(0.28_0.06_35/0.5)]" />
          <div className="container-x text-center">
            <p className="text-[0.7rem] md:text-xs tracking-[0.35em] uppercase text-background mb-6 md:mb-8">— Bir söz</p>
            <blockquote
              aria-label={QUOTE}
              className="words font-display text-background text-3xl md:text-6xl leading-[1.15] max-w-4xl mx-auto text-balance italic"
            >
              <span aria-hidden="true">
                {QUOTE.split(' ').map((w, i) => (
                  <span key={i}>
                    <span className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em] pr-[0.06em]">
                      <span className="word-i inline-block">{w}</span>
                    </span>{' '}
                  </span>
                ))}
              </span>
            </blockquote>
            <div className="mt-8 md:mt-10 text-background text-xs tracking-widest uppercase">
              {partner1} &amp; {partner2}
            </div>
          </div>
        </section>
      </main>

      <footer id="rsvp" className="bg-foreground text-background pt-20 md:pt-28 pb-10">
        <div className="container-x">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 pb-14 md:pb-20 border-b border-background/15">
            <div className="md:col-span-6 reveal">
              <h2 className="font-display text-4xl md:text-7xl leading-[1.02] text-balance">
                Lütfen katılımınızı bildirin.
                <br />
                <em className="text-primary">Sizleri bekliyoruz.</em>
              </h2>
              <p className="mt-6 text-background/80 max-w-md">
                Yanıtınızı en geç <strong className="font-medium text-background">{rsvpDeadline}</strong> tarihine
                kadar bekliyoruz. Ulaşım ve konaklama bilgilerini e-posta ile ileteceğiz.
              </p>
            </div>
            <div className="md:col-span-5 md:col-start-8 reveal">
              <RsvpForm />
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-sm text-background/75">
            <div className="font-display text-xl text-background">
              {partner1}
              <span className="text-primary px-1">&amp;</span>
              {partner2}
            </div>
            <nav aria-label="Alt menü" className="flex flex-wrap gap-x-8">
              {[
                ['#story', 'Hikâyemiz'],
                ['#events', 'Program'],
                ['#map', 'Konum'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="inline-flex min-h-11 items-center hover:text-background transition-colors">
                  {label}
                </a>
              ))}
            </nav>
            <div>
              {partner1} &amp; {partner2} · {footerDate}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
