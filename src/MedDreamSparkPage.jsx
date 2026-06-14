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
    partnerOne: 'Sole',
    partnerTwo: 'Mare',
  },
  event: {
    dateLabel: '14 Eylül 2026',
    locationLabel: 'Bodrum, Türkiye',
    rsvpDeadline: '1 Ağustos 2026',
  },
  story: {
    eyebrow: 'Hikâyemiz',
    titleA: 'Bir',
    titleB: 'yaz akşamı',
    paragraphs: [
      'Küçük bir sahil kasabasında, zeytin ağaçlarının gölgesinde tanıştık. O günden sonra her yaz aynı kıyıya, aynı denize, aynı sofraya geri döndük.',
      "Şimdi sıra hayatımızın en güzel sözünü vermeye geldi — hem de sevdiklerimizin önünde, Akdeniz'in mavisine karşı.",
    ],
    signatureLabel: 'Gelin & Damat',
  },
  events: {
    eyebrow: 'Program',
    titleA: 'Üç gün,',
    titleB: 'tek bir kutlama.',
    cards: [
      {
        n: '01',
        img: feature1,
        time: '13 Eylül · 17:00',
        title: 'Nikâh Töreni',
        detail: 'Denize bakan beyaz bir kemerin altında, sade ve içten bir tören.',
      },
      {
        n: '02',
        img: feature2,
        time: '13 Eylül · 20:00',
        title: 'Akşam Yemeği',
        detail: 'Zeytinler ve mumların arasında uzun bir sofra, paylaşılan yemekler.',
      },
      {
        n: '03',
        img: feature3,
        time: '14 Eylül · 11:00',
        title: 'Brunch & Veda',
        detail: 'Beyaz sokaklarda kahvaltı, son bir kadeh, yola çıkış.',
      },
    ],
  },
  venue: {
    eyebrow: 'Mekân',
    titleA: 'Denizin',
    titleB: 'kenarında.',
    description:
      "Bodrum'un sakin bir köyünde, zeytinlikler ve uçurumlar arasında, küçük bir taş villa bizi ağırlıyor.",
    cta: 'Ulaşım Bilgisi',
    dateShort: '13 Eylül',
    placeShort: 'Bodrum',
  },
  quote: {
    eyebrow: 'Bir söz',
    text:
      "“Deniz ne kadar maviyse, aşkımız o kadar derin. Bu güzel günde yanımızda olmanız bizim için bir armağan.”",
  },
  rsvp: {
    titleA: 'Lütfen geleceğinizi bildirin.',
    titleB: 'Sizleri bekliyoruz.',
    description:
      'E-posta adresinizi bırakın, davetiye ve ulaşım detaylarını size gönderelim.',
    inputPlaceholder: 'e-posta adresiniz',
    submitLabel: 'Gönder →',
  },
}

export default function MedDreamSparkPage() {
  const root = useRef(null)
  const coupleName = `${TEMPLATE.couple.partnerOne} & ${TEMPLATE.couple.partnerTwo}`
  const headlineWords = useMemo(() => [TEMPLATE.couple.partnerOne, '&', TEMPLATE.couple.partnerTwo], [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8 })
        .from('.hero-word', { y: 80, opacity: 0, duration: 1, stagger: 0.12 }, '-=0.4')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-meta', { opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.3')

      gsap.to('.hero-img', {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })

      gsap.to('.marquee-track', {
        xPercent: -50,
        ease: 'none',
        duration: 30,
        repeat: -1,
      })

      gsap.utils.toArray('.parallax-img').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      gsap.utils.toArray('[data-count]').forEach((el) => {
        const target = Number(el.getAttribute('data-count') || '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString()
          },
        })
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50">
        <div className="container-x flex items-center justify-between py-6">
          <a href="#top" className="font-display text-xl tracking-wide">
            {TEMPLATE.couple.partnerOne}
            <span className="text-primary"> &amp; </span>
            {TEMPLATE.couple.partnerTwo}
          </a>
          <nav className="hidden md:flex items-center gap-10 text-sm text-muted-foreground">
            <a href="#story" className="hover:text-foreground transition">
              Our Story
            </a>
            <a href="#events" className="hover:text-foreground transition">
              Events
            </a>
            <a href="#gallery" className="hover:text-foreground transition">
              Gallery
            </a>
            <a href="#travel" className="hover:text-foreground transition">
              Travel
            </a>
          </nav>
          <a
            href="#rsvp"
            className="text-sm px-5 py-2.5 rounded-full bg-foreground text-background hover:bg-primary transition-colors"
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
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        </div>

        <div className="relative z-10 container-x h-full flex flex-col justify-end pb-24">
          <p className="hero-eyebrow text-xs tracking-[0.4em] uppercase text-background/80 mb-6">
            Akdeniz · {TEMPLATE.event.dateLabel}
          </p>
          <h1 className="font-display text-background text-balance leading-[0.95] text-[clamp(3.5rem,11vw,11rem)]">
            <span className="hero-word inline-block mr-4">{headlineWords[0]}</span>
            <span className="hero-word inline-block mr-4 italic">&amp;</span>
            <span className="hero-word inline-block text-primary">{headlineWords[2]}</span>
          </h1>
          <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8 max-w-5xl">
            <p className="hero-sub text-background/90 text-lg max-w-md">
              Zeytin ağaçlarının ve begonvillerin altında, Akdeniz kıyısında bir araya geliyoruz. Bu özel günümüzde yanımızda olun.
            </p>
            <a
              href="#story"
              className="hero-cta inline-flex items-center gap-3 text-background border-b border-background/60 pb-2 text-sm tracking-widest uppercase hover:gap-5 transition-all"
            >
              Hikâyemiz
              <span>→</span>
            </a>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl text-background/85">
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="14">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Eylül · Gün</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="120">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Sevdiklerimiz</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                2<span className="text-primary">.</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">Gün · Kutlama</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap py-6 font-display text-3xl md:text-5xl italic">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-12 pr-12">
              <span>Aşk</span>
              <span className="text-primary">✦</span>
              <span className="italic">Deniz</span>
              <span className="text-primary">✦</span>
              <span>Zeytin</span>
              <span className="text-primary">✦</span>
              <span className="italic">Güneş</span>
              <span className="text-primary">✦</span>
              <span>Begonvil</span>
              <span className="text-primary">✦</span>
              <span className="italic">Akdeniz</span>
              <span className="text-primary">✦</span>
              <span>Sonsuza</span>
              <span className="text-primary">✦</span>
            </div>
          ))}
        </div>
      </section>

      <section id="story" className="py-32 container-x">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 reveal">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-6">{TEMPLATE.story.eyebrow}</p>
            <h2 className="font-display text-5xl md:text-6xl leading-[1.05] text-balance">
              Bir <em className="text-primary">yaz akşamı</em> başladı.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 reveal space-y-6 text-muted-foreground leading-relaxed text-lg">
            {TEMPLATE.story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="pt-6">
              <div className="font-display italic text-xl">{coupleName}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{TEMPLATE.story.signatureLabel}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="py-32 bg-card">
        <div className="container-x">
          <div className="flex items-end justify-between mb-16 reveal">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-primary mb-4">{TEMPLATE.events.eyebrow}</p>
              <h2 className="font-display text-5xl md:text-6xl max-w-2xl text-balance">
                Üç gün, <em>tek bir</em> kutlama.
              </h2>
            </div>
            <a href="#rsvp" className="hidden md:inline text-sm uppercase tracking-widest hover:text-primary transition">
              RSVP →
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TEMPLATE.events.cards.map((c) => (
              <article key={c.n} className="reveal group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md mb-6">
                  <img
                    src={c.img}
                    alt={c.title}
                    loading="lazy"
                    className="parallax-img w-full h-[120%] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 text-background font-display text-sm">{c.n}</div>
                </div>
                <div className="text-xs uppercase tracking-widest text-primary mb-2">{c.time}</div>
                <h3 className="font-display text-2xl mb-2">{c.title}</h3>
                <p className="text-muted-foreground">{c.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-32 container-x">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 reveal relative">
            <div className="aspect-[4/5] overflow-hidden rounded-md">
              <img
                src={gallery}
                alt="Wedding couple by the Mediterranean sea"
                loading="lazy"
                className="parallax-img w-full h-[115%] object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-4 md:col-start-9 reveal">
            <p className="text-xs tracking-[0.4em] uppercase text-primary mb-6">{TEMPLATE.venue.eyebrow}</p>
            <h2 className="font-display text-5xl leading-[1.05] mb-6 text-balance">
              Denizin <em>kenarında</em>.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">{TEMPLATE.venue.description}</p>
            <dl className="grid grid-cols-2 gap-6 text-sm border-t border-border pt-6">
              <div>
                <dt className="uppercase tracking-widest text-xs text-muted-foreground mb-1">Tarih</dt>
                <dd className="font-display text-2xl">{TEMPLATE.venue.dateShort}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest text-xs text-muted-foreground mb-1">Yer</dt>
                <dd className="font-display text-2xl">{TEMPLATE.venue.placeShort}</dd>
              </div>
            </dl>
            <a
              href="#travel"
              className="inline-block mt-10 px-7 py-3 rounded-full bg-primary text-primary-foreground hover:bg-foreground transition-colors text-sm tracking-widest uppercase"
            >
              {TEMPLATE.venue.cta}
            </a>
          </div>
        </div>
      </section>

      <section id="travel" className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-sunset)' }} />
        <div className="container-x text-center reveal">
          <p className="text-xs tracking-[0.4em] uppercase text-background/80 mb-8">— {TEMPLATE.quote.eyebrow}</p>
          <blockquote className="font-display text-background text-4xl md:text-6xl leading-[1.1] max-w-4xl mx-auto text-balance">
            {TEMPLATE.quote.text}
          </blockquote>
          <div className="mt-10 text-background/80 text-sm tracking-widest uppercase">{coupleName}</div>
        </div>
      </section>

      <footer id="rsvp" className="bg-foreground text-background pt-28 pb-12">
        <div className="container-x">
          <div className="grid md:grid-cols-12 gap-12 pb-20 border-b border-background/15">
            <div className="md:col-span-7 reveal">
              <h2 className="font-display text-5xl md:text-7xl leading-[1.02] text-balance">
                {TEMPLATE.rsvp.titleA}
                <br />
                <em className="text-primary">{TEMPLATE.rsvp.titleB}</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal flex flex-col justify-end">
              <p className="text-background/70 mb-6">
                {TEMPLATE.rsvp.description} Son yanıt tarihi: {TEMPLATE.event.rsvpDeadline}.
              </p>
              <form
                className="flex border-b border-background/40 pb-3"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <input
                  type="email"
                  placeholder={TEMPLATE.rsvp.inputPlaceholder}
                  className="bg-transparent flex-1 outline-none placeholder:text-background/50 text-background"
                />
                <button className="text-sm tracking-widest uppercase hover:text-primary transition">{TEMPLATE.rsvp.submitLabel}</button>
              </form>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-background/60">
            <div className="font-display text-xl text-background">
              {TEMPLATE.couple.partnerOne}
              <span className="text-primary"> &amp; </span>
              {TEMPLATE.couple.partnerTwo}
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-background transition">
                Instagram
              </a>
              <a href="#" className="hover:text-background transition">
                Konum
              </a>
              <a href="#" className="hover:text-background transition">
                İletişim
              </a>
            </div>
            <div>© {TEMPLATE.couple.partnerOne} &amp; {TEMPLATE.couple.partnerTwo} · 2026</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
