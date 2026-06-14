import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import hero from './assets/med-dream-spark/hero-generic.jpg'
import feature1 from './assets/med-dream-spark/feature-1.jpg'
import feature2 from './assets/med-dream-spark/feature-2.jpg'
import feature3 from './assets/med-dream-spark/feature-3.jpg'
import gallery from './assets/med-dream-spark/gallery-generic.jpg'
import church from './assets/med-dream-spark/scene-church.jpg'
import olive from './assets/med-dream-spark/ornament-olive.png'

gsap.registerPlugin(ScrollTrigger)

function splitChars(el) {
  const text = el.textContent ?? ''
  el.textContent = ''
  const frag = document.createDocumentFragment()
  for (const ch of text) {
    const span = document.createElement('span')
    span.className = 'char inline-block will-change-transform'
    span.style.display = 'inline-block'
    span.textContent = ch === ' ' ? '\u00A0' : ch
    frag.appendChild(span)
  }
  el.appendChild(frag)
  return el.querySelectorAll('.char')
}

export default function MedDreamSparkTemplatePage() {
  const root = useRef(null)

  useEffect(() => {
    const cleanups = []
    const ctx = gsap.context(() => {
      const splitTargets = gsap.utils.toArray('.split')
      splitTargets.forEach((el) => splitChars(el))

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.8 })
        .from('.split .char', { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.035 }, '-=0.4')
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
        .from('.hero-meta', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.3')
        .from('.float-olive', { scale: 0, rotate: -40, opacity: 0, duration: 1.2, ease: 'back.out(1.7)' }, '-=0.8')

      gsap.to('.hero-img', {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.to('.float-olive', {
        y: -80,
        rotate: 12,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      gsap.utils.toArray('.clip-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)' },
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%' },
          },
        )
      })

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      })

      gsap.utils.toArray('.words').forEach((el) => {
        const words = el.textContent?.split(' ') ?? []
        el.innerHTML = words
          .map((w) => `<span class="word inline-block overflow-hidden align-top"><span class="word-i inline-block">${w}&nbsp;</span></span>`)
          .join('')
        gsap.from(el.querySelectorAll('.word-i'), {
          yPercent: 110,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 80%' },
        })
      })

      const marqueeTween = gsap.to('.marquee-track', {
        xPercent: -50,
        ease: 'none',
        duration: 28,
        repeat: -1,
      })

      const marqueeEl = root.current?.querySelector('.marquee')
      if (marqueeEl) {
        const onEnter = () => marqueeTween.timeScale(0.2)
        const onLeave = () => marqueeTween.timeScale(1)
        marqueeEl.addEventListener('mouseenter', onEnter)
        marqueeEl.addEventListener('mouseleave', onLeave)
        cleanups.push(() => {
          marqueeEl.removeEventListener('mouseenter', onEnter)
          marqueeEl.removeEventListener('mouseleave', onLeave)
        })
      }

      gsap.utils.toArray('[data-count]').forEach((el) => {
        const target = Number(el.getAttribute('data-count') || '0')
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => {
            el.textContent = Math.round(obj.v).toLocaleString()
          },
        })
      })

      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const track = root.current?.querySelector('.pin-track')
        if (!track) return
        const distance = () => track.scrollWidth - window.innerWidth
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current?.querySelector('.pin-wrap'),
            start: 'top top',
            end: () => '+=' + distance(),
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
      })
      cleanups.push(() => mm.revert())

      gsap.utils.toArray('.big-date').forEach((el) => {
        gsap.fromTo(
          el,
          { letterSpacing: '0.3em', opacity: 0.2 },
          {
            letterSpacing: '0.02em',
            opacity: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 30%', scrub: 1 },
          },
        )
      })

      gsap.utils.toArray('.draw-path').forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = String(len)
        p.style.strokeDashoffset = String(len)
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 2.4,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: p, start: 'top 85%' },
        })
      })

      gsap.utils.toArray('.magnetic').forEach((btn) => {
        const move = (e) => {
          const r = btn.getBoundingClientRect()
          const x = e.clientX - (r.left + r.width / 2)
          const y = e.clientY - (r.top + r.height / 2)
          gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power3.out' })
        }
        const reset = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' })
        btn.addEventListener('mousemove', move)
        btn.addEventListener('mouseleave', reset)
        cleanups.push(() => {
          btn.removeEventListener('mousemove', move)
          btn.removeEventListener('mouseleave', reset)
        })
      })
    }, root)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <div ref={root} className="bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/40">
        <div className="container-x flex items-center justify-between py-4 md:py-6">
          <a href="#top" className="font-display text-lg md:text-xl tracking-wide">
            Sole<span className="text-primary"> &amp; </span>Mare
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#story" className="hover:text-foreground transition">
              Hikâye
            </a>
            <a href="#events" className="hover:text-foreground transition">
              Program
            </a>
            <a href="#gallery" className="hover:text-foreground transition">
              Galeri
            </a>
            <a href="#travel" className="hover:text-foreground transition">
              Mekân
            </a>
          </nav>
          <a
            href="#rsvp"
            className="magnetic text-xs md:text-sm px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            RSVP
          </a>
        </div>
      </header>

      <section className="hero relative min-h-[100svh] w-full overflow-hidden flex flex-col justify-end">
        <div className="hero-img absolute inset-0 will-change-transform">
          <img
            src={hero}
            alt="Akdeniz düğün sahnesi"
            width={1536}
            height={1920}
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/0 to-background" />
        </div>

        <img
          src={olive}
          alt=""
          aria-hidden
          className="float-olive pointer-events-none absolute top-24 right-4 w-28 md:w-44 md:top-32 md:right-12 opacity-90 z-10"
        />

        <div className="relative z-10 container-x pb-16 md:pb-24 pt-32">
          <p className="hero-eyebrow text-[0.65rem] md:text-xs tracking-[0.35em] uppercase text-foreground/70 mb-4 md:mb-6">
            Akdeniz · 14 Eylül 2026
          </p>
          <h1 className="font-display leading-[0.9] text-balance overflow-hidden">
            <span className="split block text-[18vw] md:text-[11vw] lg:text-[10rem]">Sole</span>
            <span className="split block italic text-primary text-[18vw] md:text-[11vw] lg:text-[10rem]">&amp; Mare</span>
          </h1>

          <div className="mt-8 md:mt-12 grid md:grid-cols-2 gap-6 md:gap-8 md:items-end">
            <p className="hero-sub text-foreground/80 text-base md:text-lg max-w-md">
              Zeytin ağaçlarının ve begonvillerin altında, Akdeniz&apos;in kıyısında bir araya geliyoruz. Bu özel
              günümüzde yanımızda olun.
            </p>
            <a
              href="#story"
              className="hero-cta inline-flex items-center gap-3 self-start md:self-end md:justify-self-end border-b border-foreground/40 pb-2 text-xs md:text-sm tracking-widest uppercase hover:gap-5 transition-all w-fit"
            >
              Hikâyemiz
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="mt-10 md:mt-16 grid grid-cols-3 gap-3 md:gap-6 max-w-xl text-foreground/85">
            <div className="hero-meta">
              <div className="font-display text-2xl md:text-4xl">
                <span data-count="14">0</span>
              </div>
              <div className="text-[0.6rem] md:text-xs uppercase tracking-widest opacity-70 mt-1">Eylül</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-2xl md:text-4xl">
                <span data-count="120">0</span>
              </div>
              <div className="text-[0.6rem] md:text-xs uppercase tracking-widest opacity-70 mt-1">Sevdiklerimiz</div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-2xl md:text-4xl">
                2<span className="text-primary">.</span>
              </div>
              <div className="text-[0.6rem] md:text-xs uppercase tracking-widest opacity-70 mt-1">Gün Kutlama</div>
            </div>
          </div>
        </div>
      </section>

      <section className="marquee border-y border-border bg-card overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap py-4 md:py-6 font-display text-2xl md:text-5xl italic">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex shrink-0 items-center gap-8 md:gap-12 pr-8 md:pr-12">
              <span>Aşk</span>
              <span className="text-primary">✦</span>
              <span className="italic">Deniz</span>
              <span className="text-primary">✦</span>
              <span className="italic">Akdeniz</span>
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
            <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 md:mb-6">Hikâyemiz</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Bir <em className="text-primary">yaz akşamı</em> başladı.
            </h2>
            <svg viewBox="0 0 220 24" className="mt-6 w-44 md:w-56 h-5 text-primary">
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
              Küçük bir sahil kasabasında, zeytin ağaçlarının gölgesinde tanıştık. O günden sonra her yaz aynı kıyıya,
              aynı denize, aynı sofraya geri döndük.
            </p>
            <p>
              Şimdi sıra hayatımızın en güzel sözünü vermeye geldi — hem de sevdiklerimizin önünde, Akdeniz&apos;in
              mavisine karşı.
            </p>
            <div className="pt-4">
              <div className="font-display italic text-xl">Sole &amp; Mare</div>
              <div className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">Gelin &amp; Damat</div>
            </div>
          </div>
        </div>
      </section>

      <section id="events" className="bg-card overflow-hidden">
        <div className="container-x pt-20 md:pt-28 pb-10">
          <div className="reveal max-w-3xl">
            <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-primary mb-4">Program</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Üç gün, <em>tek bir</em> kutlama.
            </h2>
          </div>
        </div>

        <div className="pin-wrap">
          <div className="pin-track flex flex-col md:flex-row md:h-screen md:items-center gap-8 md:gap-12 px-4 md:px-12 pb-20 md:pb-0">
            {[
              {
                n: '01',
                img: feature1,
                t: 'Nikâh Töreni',
                d: 'Denize bakan beyaz bir kemerin altında sade ve içten bir tören.',
                time: '13 Eylül · 17:00',
              },
              {
                n: '02',
                img: feature2,
                t: 'Akşam Yemeği',
                d: 'Zeytinler ve mumların arasında uzun bir sofra, paylaşılan yemekler.',
                time: '13 Eylül · 20:00',
              },
              {
                n: '03',
                img: feature3,
                t: 'Brunch & Veda',
                d: 'Beyaz sokaklarda kahvaltı, son bir kadeh, yola çıkış.',
                time: '14 Eylül · 11:00',
              },
              {
                n: '04',
                img: church,
                t: 'Kutsal Mekân',
                d: 'Mavi kubbeli küçük kilisede bir an, ardından sahil yürüyüşü.',
                time: '14 Eylül · 09:00',
              },
            ].map((c) => (
              <article key={c.n} className="reveal md:w-[70vw] lg:w-[55vw] md:shrink-0 group">
                <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md clip-reveal">
                    <img
                      src={c.img}
                      alt={c.t}
                      loading="lazy"
                      width={1024}
                      height={1280}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 font-display text-sm bg-background/80 backdrop-blur px-2 py-1 rounded">
                      {c.n}
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-widest text-primary mb-2">{c.time}</div>
                    <h3 className="font-display text-3xl md:text-5xl mb-3 leading-tight">{c.t}</h3>
                    <p className="text-muted-foreground text-base md:text-lg">{c.d}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 container-x text-center">
        <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-primary mb-6">Save the date</p>
        <div className="big-date font-display italic text-primary text-[18vw] md:text-[12rem] leading-none">14·09·26</div>
        <p className="mt-6 text-muted-foreground tracking-widest text-xs uppercase">Bodrum · Akdeniz</p>
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
          <div id="travel" className="md:col-span-4 md:col-start-9 reveal order-1 md:order-2">
            <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-primary mb-4 md:mb-6">Mekân</p>
            <h2 className="font-display text-4xl md:text-5xl leading-[1.05] mb-5 md:mb-6 text-balance">
              Denizin <em>kenarında</em>.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 md:mb-8">
              Bodrum&apos;un sakin bir köyünde, zeytinlikler ve uçurumlar arasında, küçük bir taş villa bizi ağırlıyor.
            </p>
            <dl className="grid grid-cols-2 gap-4 md:gap-6 text-sm border-t border-border pt-5 md:pt-6">
              <div>
                <dt className="uppercase tracking-widest text-[0.65rem] text-muted-foreground mb-1">Tarih</dt>
                <dd className="font-display text-xl md:text-2xl">13 Eylül</dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest text-[0.65rem] text-muted-foreground mb-1">Yer</dt>
                <dd className="font-display text-xl md:text-2xl">Bodrum</dd>
              </div>
            </dl>
            <a
              href="#rsvp"
              className="magnetic inline-block mt-8 md:mt-10 px-6 md:px-7 py-3 rounded-full bg-primary text-primary-foreground hover:bg-foreground transition-colors text-xs md:text-sm tracking-widest uppercase"
            >
              Yer Ayırt
            </a>
          </div>
        </div>
      </section>

      <section id="map" className="py-20 md:py-32 container-x">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end mb-10 md:mb-14">
          <div className="md:col-span-6 reveal">
            <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-primary mb-4">Konum</p>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Bizi <em className="text-primary">burada</em> bulun.
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 reveal text-muted-foreground">
            <p className="text-base md:text-lg leading-relaxed">
              Bodrum&apos;un kıyısında, zeytinliklerin arasında saklı bir villa. Yol tarifi ve park bilgisi için haritayı
              kullanabilirsiniz.
            </p>
          </div>
        </div>

        <div className="reveal relative rounded-md overflow-hidden border border-border shadow-xl">
          <div className="aspect-[16/10] md:aspect-[21/9] w-full">
            <iframe
              title="Düğün mekânı haritası"
              src="https://www.google.com/maps?q=Bodrum,Turkey&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0 grayscale-[0.2] contrast-[1.05]"
              allowFullScreen
            />
          </div>

          <div className="absolute left-4 bottom-4 md:left-8 md:bottom-8 bg-background/95 backdrop-blur border border-border rounded-md p-4 md:p-6 max-w-[18rem] shadow-2xl">
            <div className="text-[0.6rem] uppercase tracking-[0.3em] text-primary mb-2">Mekân</div>
            <div className="font-display text-xl md:text-2xl leading-tight mb-1">Villa Sole &amp; Mare</div>
            <div className="text-sm text-muted-foreground mb-4">
              Yalıkavak Sahil Yolu
              <br />
              Bodrum, Muğla
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Bodrum,Turkey"
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic inline-flex items-center gap-2 text-xs tracking-widest uppercase border-b border-foreground/40 pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              Yol Tarifi Al <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-sunset)' }} />
        <div className="container-x text-center">
          <p className="text-[0.65rem] md:text-xs tracking-[0.4em] uppercase text-background/80 mb-6 md:mb-8">
            — Bir söz
          </p>
          <blockquote className="words font-display text-background text-3xl md:text-6xl leading-[1.15] max-w-4xl mx-auto text-balance italic">
            Deniz ne kadar maviyse, aşkımız o kadar derin. Bu güzel günde yanımızda olmanız bizim için bir armağan.
          </blockquote>
          <div className="mt-8 md:mt-10 text-background/80 text-xs tracking-widest uppercase">Sole &amp; Mare</div>
        </div>
      </section>

      <footer id="rsvp" className="bg-foreground text-background pt-20 md:pt-28 pb-10">
        <div className="container-x">
          <div className="grid md:grid-cols-12 gap-10 md:gap-12 pb-14 md:pb-20 border-b border-background/15">
            <div className="md:col-span-7 reveal">
              <h2 className="font-display text-4xl md:text-7xl leading-[1.02] text-balance">
                Lütfen geleceğinizi bildirin.
                <br />
                <em className="text-primary">Sizleri bekliyoruz.</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9 reveal flex flex-col justify-end">
              <p className="text-background/70 mb-6">
                E-posta adresinizi bırakın, davetiye ve ulaşım detaylarını size gönderelim. Son yanıt tarihi: 1 Ağustos
                2026.
              </p>
              <form className="flex border-b border-background/40 pb-3">
                <input
                  type="email"
                  placeholder="e-posta adresiniz"
                  className="bg-transparent flex-1 outline-none placeholder:text-background/50 text-background"
                />
                <button className="text-sm tracking-widest uppercase hover:text-primary transition">Gönder →</button>
              </form>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-background/60">
            <div className="font-display text-xl text-background">
              Sole<span className="text-primary"> &amp; </span>Mare
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
            <div>© Sole &amp; Mare · 2026</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

 
