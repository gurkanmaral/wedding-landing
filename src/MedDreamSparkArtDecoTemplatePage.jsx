import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import decoHero from './assets/med-dream-spark/deco-hero.jpg'
import decoLeaf from './assets/med-dream-spark/deco-leaf.png'
import decoFeather from './assets/med-dream-spark/deco-feather.jpg'
import decoCouple from './assets/med-dream-spark/deco-couple.jpg'
import decoFrame from './assets/med-dream-spark/deco-frame.jpg'

gsap.registerPlugin(ScrollTrigger)

const TARGET_DATE = new Date('2026-09-14T16:00:00+02:00')

function getCountdown() {
  const targetMs = Number.isFinite(TARGET_DATE.getTime()) ? TARGET_DATE.getTime() : Date.now()
  const totalSeconds = Math.max(0, Math.floor((targetMs - Date.now()) / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

export default function MedDreamSparkArtDecoTemplatePage() {
  const root = useRef(null)
  const [time, setTime] = useState(() => getCountdown())

  useEffect(() => {
    const id = window.setInterval(() => setTime(getCountdown()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!root.current) return
    const cleanups = []
    const ctx = gsap.context(() => {
      gsap.to('.curtain-left', { xPercent: -100, duration: 1.6, delay: 0.2, ease: 'expo.inOut' })
      gsap.to('.curtain-right', {
        xPercent: 100,
        duration: 1.6,
        delay: 0.2,
        ease: 'expo.inOut',
        onComplete: () => {
          const overlay = document.querySelector('.curtain-overlay')
          if (overlay) overlay.style.display = 'none'
        },
      })

      const letters = gsap.utils.toArray('.hero-letter')
      gsap.from(letters, {
        yPercent: 120,
        opacity: 0,
        stagger: 0.05,
        duration: 1.2,
        delay: 0.8,
        ease: 'power4.out',
      })

      gsap.from('.hero-sub', { opacity: 0, y: 20, delay: 1.6, duration: 1, ease: 'power2.out' })

      gsap.utils.toArray('.parallax-leaf').forEach((el, i) => {
        gsap.to(el, {
          yPercent: (i % 2 === 0 ? -1 : 1) * 30,
          rotate: (i % 2 === 0 ? -1 : 1) * 15,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      })

      gsap.utils.toArray('.reveal-words').forEach((el) => {
        const words = el.innerText.split(' ')
        el.innerHTML = words
          .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block word">${w}&nbsp;</span></span>`)
          .join('')
        gsap.from(el.querySelectorAll('.word'), {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.06,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })

      gsap.utils.toArray('.fade-up').forEach((el) => {
        gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } })
      })

      gsap.utils.toArray('.magnetic').forEach((btn) => {
        const onMove = (e) => {
          const r = btn.getBoundingClientRect()
          const x = e.clientX - r.left - r.width / 2
          const y = e.clientY - r.top - r.height / 2
          gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.5, ease: 'power3.out' })
        }
        const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.4)' })
        btn.addEventListener('mousemove', onMove)
        btn.addEventListener('mouseleave', onLeave)
        cleanups.push(() => {
          btn.removeEventListener('mousemove', onMove)
          btn.removeEventListener('mouseleave', onLeave)
        })
      })

      gsap.to('.marquee-track', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 })

      gsap.utils.toArray('.gallery-img').forEach((img) => {
        gsap.from(img, {
          scale: 1.3,
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
        })
      })

      gsap.to('.rotate-slow', { rotation: 360, duration: 40, ease: 'none', repeat: -1 })
    }, root)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <div ref={root} className="theme-artdeco relative min-h-screen overflow-x-hidden text-foreground">
      <div className="curtain-overlay pointer-events-none fixed inset-0 z-50">
        <div className="curtain-left absolute inset-y-0 left-0 w-1/2 bg-[oklch(0.14_0.03_165)]" />
        <div className="curtain-right absolute inset-y-0 right-0 w-1/2 bg-[oklch(0.14_0.03_165)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[oklch(0.18_0.04_165/0.7)] border-b border-primary/20">
        <div className="container-x flex items-center justify-between py-3">
          <a href="#top" className="font-display text-lg tracking-[0.3em] gold-text">
            E &amp; M
          </a>
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <a href="#story" className="hover:text-primary transition">
              Story
            </a>
            <a href="#details" className="hover:text-primary transition">
              Details
            </a>
            <a href="#gallery" className="hover:text-primary transition">
              Gallery
            </a>
            <a href="#rsvp" className="hover:text-primary transition">
              RSVP
            </a>
          </nav>
          <a
            href="#rsvp"
            className="text-[10px] uppercase tracking-[0.3em] gold-border px-3 py-2 text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            RSVP
          </a>
        </div>
      </header>

      <section id="top" className="relative min-h-[100svh] flex items-center justify-center px-4 pt-20 pb-32">
        <img src={decoHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" width={1280} height={1600} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />

        <img
          src={decoLeaf}
          alt=""
          className="parallax-leaf absolute -left-12 top-32 w-40 md:w-64 opacity-50"
          loading="lazy"
          width={768}
          height={1024}
        />
        <img
          src={decoLeaf}
          alt=""
          className="parallax-leaf absolute -right-12 bottom-32 w-40 md:w-64 opacity-50 scale-x-[-1]"
          loading="lazy"
          width={768}
          height={1024}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="hero-sub mb-6 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.5em] text-primary">
            <span className="h-px w-10 bg-primary" />
            Save the date
            <span className="h-px w-10 bg-primary" />
          </div>

          <h1 className="font-display text-[18vw] md:text-[9rem] leading-[0.95] font-light">
            <div className="overflow-hidden">
              {'Elena'.split('').map((c, i) => (
                <span key={`e${i}`} className="hero-letter inline-block">
                  {c}
                </span>
              ))}
            </div>
            <div className="overflow-hidden">
              <span className="hero-letter inline-block font-script text-primary text-[14vw] md:text-[7rem] italic">
                &amp;
              </span>
            </div>
            <div className="overflow-hidden">
              {'Marcus'.split('').map((c, i) => (
                <span key={`m${i}`} className="hero-letter inline-block">
                  {c}
                </span>
              ))}
            </div>
          </h1>

          <div className="hero-sub mt-8 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <span>Fourteen</span>
            <span className="text-primary">◆</span>
            <span>September</span>
            <span className="text-primary">◆</span>
            <span>Two Thousand Twenty Six</span>
          </div>

          <div className="hero-sub mt-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">Villa Aurelia · Rome</div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-sub">
          <div className="h-12 w-px bg-primary/40 animate-pulse" />
        </div>
      </section>

      <section className="border-y border-primary/20 py-5 overflow-hidden bg-[oklch(0.14_0.03_165)]">
        <div className="marquee-track flex gap-12 whitespace-nowrap font-display text-2xl md:text-3xl italic text-primary">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 shrink-0">
              <span>Forever begins</span>
              <span>◆</span>
              <span>14 · 09 · 2026</span>
              <span>◆</span>
              <span>Villa Aurelia</span>
              <span>◆</span>
              <span>Roma</span>
              <span>◆</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-20 md:py-32 text-center relative">
        <img
          src={decoLeaf}
          alt=""
          className="rotate-slow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] opacity-[0.04]"
          loading="lazy"
        />
        <div className="relative">
          <div className="deco-divider justify-center text-xs uppercase tracking-[0.4em] mb-4">
            <span className="h-px w-12 bg-primary" />
            Counting moments
            <span className="h-px w-12 bg-primary" />
          </div>
          <h2 className="reveal-words font-display text-4xl md:text-6xl text-balance">
            Until we say <em className="font-script text-primary text-5xl md:text-7xl">&quot;I do&quot;</em>
          </h2>

          <div className="mt-12 grid grid-cols-4 gap-2 md:gap-6 max-w-2xl mx-auto">
            {[
              { v: time.days, l: 'Days' },
              { v: time.hours, l: 'Hours' },
              { v: time.minutes, l: 'Minutes' },
              { v: time.seconds, l: 'Seconds' },
            ].map((t) => (
              <div key={t.l} className="fade-up gold-border bg-card/40 backdrop-blur p-3 md:p-6">
                <div className="font-display text-3xl md:text-6xl gold-text tabular-nums">
                  {String(t.v).padStart(2, '0')}
                </div>
                <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {t.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="container-x py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="fade-up relative">
          <div className="absolute -inset-4 gold-border opacity-50" />
          <img
            src={decoCouple}
            alt="The couple"
            className="relative w-full aspect-[4/5] object-cover"
            loading="lazy"
            width={1024}
            height={1280}
          />
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Our Story</div>
          <h2 className="reveal-words font-display text-4xl md:text-5xl mb-6">A chance meeting in a Paris café</h2>
          <p className="fade-up text-muted-foreground leading-relaxed mb-4">
            It began on a rainy afternoon in 2019 — a borrowed umbrella, a cup of espresso, and a conversation that lasted
            seven hours. Seven years, three cities, and countless adventures later, we&apos;re ready to write the next
            chapter together.
          </p>
          <p className="fade-up text-muted-foreground leading-relaxed mb-8">
            We&apos;d love nothing more than to celebrate this moment surrounded by the people who shaped us. Will you join
            us?
          </p>
          <a
            href="#rsvp"
            className="magnetic inline-block gold-border px-8 py-4 text-xs uppercase tracking-[0.4em] text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            Reply by 1 August
          </a>
        </div>
      </section>

      <section id="details" className="relative py-20 md:py-32 bg-[oklch(0.14_0.03_165)]">
        <img src={decoFrame} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" loading="lazy" />
        <div className="container-x relative">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">The Details</div>
            <h2 className="reveal-words font-display text-4xl md:text-6xl">An evening of glamour</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                time: '16:00',
                title: 'Ceremony',
                place: 'Villa Aurelia · Gardens',
                desc: 'Vows beneath the cypress trees as the afternoon light turns gold.',
              },
              {
                time: '18:30',
                title: 'Reception',
                place: 'Villa Aurelia · Salone',
                desc: 'Champagne, oysters, and the music of a string quartet on the terrace.',
              },
              {
                time: '21:00',
                title: 'Dancing',
                place: 'Villa Aurelia · Ballroom',
                desc: 'Black tie. A live jazz orchestra until the small hours of the morning.',
              },
            ].map((d) => (
              <div
                key={d.title}
                className="fade-up group relative gold-border bg-background/60 backdrop-blur p-8 text-center hover:bg-primary/5 transition"
              >
                <div className="font-display text-5xl gold-text mb-2">{d.time}</div>
                <div className="h-px w-12 bg-primary mx-auto my-4" />
                <div className="font-display text-2xl mb-1">{d.title}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">{d.place}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Attire · Black Tie / Cocktail
          </div>
        </div>
      </section>

      <section id="gallery" className="container-x py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Moments</div>
          <h2 className="reveal-words font-display text-4xl md:text-6xl">From us to you</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[decoCouple, decoFeather, decoHero, decoFrame, decoFeather, decoCouple, decoFrame, decoHero].map((src, i) => (
            <div key={i} className="fade-up overflow-hidden aspect-[3/4] gold-border">
              <img src={src} alt="" className="gallery-img h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="container-x py-20 md:py-32 grid md:grid-cols-2 gap-8 items-stretch">
        <div className="fade-up gold-border overflow-hidden aspect-[4/3] md:aspect-auto">
          <iframe
            title="Villa Aurelia"
            src="https://www.google.com/maps?q=Villa+Aurelia+Rome&output=embed"
            className="w-full h-full grayscale contrast-125 invert-[0.85] hue-rotate-[60deg]"
            loading="lazy"
          />
        </div>
        <div className="fade-up flex flex-col justify-center">
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">The Venue</div>
          <h2 className="font-display text-4xl md:text-5xl mb-6">Villa Aurelia</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Largo di Porta San Pancrazio, 1<br />
            00152 Roma, Italia
          </p>
          <p className="text-sm text-muted-foreground/70 italic mb-6">
            Perched atop the Janiculum Hill, with sweeping views over the Eternal City.
          </p>
          <a
            href="https://maps.google.com/?q=Villa+Aurelia+Rome"
            target="_blank"
            rel="noreferrer"
            className="magnetic self-start gold-border px-6 py-3 text-xs uppercase tracking-[0.4em] text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            Open in Maps
          </a>
        </div>
      </section>

      <section id="rsvp" className="relative py-20 md:py-32">
        <img src={decoHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />

        <div className="container-x relative max-w-xl text-center">
          <img src={decoLeaf} alt="" className="mx-auto w-24 opacity-70 mb-6" loading="lazy" />
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Kindly Reply</div>
          <h2 className="reveal-words font-display text-4xl md:text-6xl mb-3">Will you join us?</h2>
          <p className="font-script text-3xl md:text-4xl text-primary mb-10">by the first of August</p>

          <form
            className="space-y-4 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              window.alert('Merci! Your reply has been noted.')
            }}
          >
            <input
              type="text"
              placeholder="Your full name"
              required
              className="w-full bg-transparent gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/5"
            />
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full bg-transparent gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/5"
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-background gold-border px-4 py-3 text-foreground focus:outline-none">
                <option>Joyfully accepts</option>
                <option>Regretfully declines</option>
              </select>
              <select className="bg-background gold-border px-4 py-3 text-foreground focus:outline-none">
                <option>1 guest</option>
                <option>2 guests</option>
              </select>
            </div>
            <textarea
              placeholder="A note to the couple…"
              rows={3}
              className="w-full bg-transparent gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/5"
            />
            <button
              type="submit"
              className="magnetic w-full bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.4em] hover:bg-accent transition"
            >
              Send reply
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-primary/20 py-12 text-center">
        <div className="font-script text-5xl gold-text mb-3">Elena &amp; Marcus</div>
        <div className="text-xs uppercase tracking-[0.5em] text-muted-foreground">14 · 09 · 2026 · Roma</div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[oklch(0.14_0.03_165/0.95)] backdrop-blur border-t border-primary/30 px-4 py-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">14·09·26 · Roma</div>
        <a href="#rsvp" className="bg-primary text-primary-foreground px-4 py-2 text-[10px] uppercase tracking-[0.4em]">
          RSVP
        </a>
      </div>
    </div>
  )
}

