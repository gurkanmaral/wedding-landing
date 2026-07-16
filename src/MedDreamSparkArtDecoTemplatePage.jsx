import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

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
  const jewelCanvas = useRef(null)
  const [time, setTime] = useState(() => getCountdown())

  useEffect(() => {
    const id = window.setInterval(() => setTime(getCountdown()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!root.current) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cleanups = []
    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set('.curtain-overlay', { display: 'none' })
        gsap.set('.hero-letter, .hero-sub, .fade-up, .deco-card, .deco-panel', { clearProps: 'all' })
        return
      }

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
      gsap.from('.hero-frame-line', {
        scaleX: 0,
        transformOrigin: 'center',
        delay: 1.2,
        duration: 1.4,
        stagger: 0.08,
        ease: 'expo.out',
      })
      gsap.from('.hero-arch', {
        scale: 0.86,
        opacity: 0,
        delay: 1.05,
        duration: 1.5,
        ease: 'power4.out',
      })

      const isMobile = window.innerWidth < 768

      gsap.utils.toArray('.parallax-leaf').forEach((el, i) => {
        gsap.to(el, {
          yPercent: (i % 2 === 0 ? -1 : 1) * (isMobile ? 10 : 20),
          rotate: (i % 2 === 0 ? -1 : 1) * (isMobile ? 4 : 9),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.6 },
        })
      })

      gsap.utils.toArray('.reveal-words').forEach((el) => {
        const words = el.innerText.split(' ')
        el.innerHTML = words
          .map((w) => `<span class="inline-block overflow-hidden"><span class="inline-block word">${w}&nbsp;</span></span>`)
          .join('')
        gsap.from(el.querySelectorAll('.word'), {
          yPercent: 105,
          duration: 0.9,
          stagger: isMobile ? 0.025 : 0.045,
          immediateRender: false,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      const countTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.ad-count-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
      countTimeline.from('.ad-count-cell', {
        y: isMobile ? 22 : 36,
        scale: 0.94,
        opacity: 0,
        duration: 0.72,
        stagger: 0.075,
        immediateRender: false,
        ease: 'power3.out',
      })

      const storyTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.ad-story-section',
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        },
      })
      storyTimeline
        .from('.ad-story-photo', {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1.05,
          immediateRender: false,
          ease: 'power4.inOut',
        })
        .from('.ad-story-photo img', {
          scale: 1.12,
          duration: 1.2,
          immediateRender: false,
          ease: 'power3.out',
        }, '<0.12')
        .from('.ad-story-copy > :not(.reveal-words)', {
          x: isMobile ? 0 : 28,
          y: isMobile ? 20 : 0,
          opacity: 0,
          duration: 0.7,
          stagger: 0.075,
          immediateRender: false,
          ease: 'power3.out',
        }, '-=0.58')

      gsap.from('.ad-detail-card', {
        y: (index) => (isMobile ? 28 : index % 2 === 0 ? 46 : 24),
        scale: 0.96,
        opacity: 0,
        duration: 0.82,
        immediateRender: false,
        stagger: 0.11,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.ad-details-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      })

      const galleryTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.ad-gallery-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      })
      galleryTimeline
        .from('.ad-gallery-tile', {
          clipPath: 'inset(100% 0 0 0)',
          y: 20,
          opacity: 0.3,
          duration: 0.86,
          immediateRender: false,
          stagger: { each: 0.055, from: 'center' },
          ease: 'power3.inOut',
        })
        .from('.ad-gallery-tile img', {
          scale: 1.14,
          duration: 1.05,
          immediateRender: false,
          stagger: { each: 0.04, from: 'center' },
          ease: 'power3.out',
        }, '<0.08')

      const venueTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.ad-venue-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
      venueTimeline
        .from('.ad-map-panel', {
          clipPath: 'inset(12% 12% 12% 12%)',
          scale: 0.96,
          opacity: 0,
          duration: 0.95,
          immediateRender: false,
          ease: 'power3.out',
        })
        .from('.ad-venue-copy > *', {
          x: isMobile ? 0 : 28,
          y: isMobile ? 18 : 0,
          opacity: 0,
          duration: 0.68,
          stagger: 0.07,
          immediateRender: false,
          ease: 'power3.out',
        }, '-=0.55')

      const rsvpTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.ad-rsvp-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
      rsvpTimeline
        .from('.ad-rsvp-shell', {
          clipPath: 'inset(0 48% 0 48%)',
          opacity: 0,
          duration: 1.05,
          immediateRender: false,
          ease: 'power4.inOut',
        })
        .from('.ad-rsvp-form > *', {
          y: 18,
          opacity: 0,
          duration: 0.6,
          stagger: 0.055,
          immediateRender: false,
          ease: 'power3.out',
        }, '-=0.38')

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

      gsap.to('.rotate-slow', { rotation: 360, duration: 40, ease: 'none', repeat: -1 })
      window.setTimeout(() => ScrollTrigger.refresh(), 250)
    }, root)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const canvas = jewelCanvas.current
    if (!canvas) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0.15, 8)

    const group = new THREE.Group()
    scene.add(group)

    const gold = new THREE.MeshPhysicalMaterial({
      color: 0xd8a847,
      metalness: 0.78,
      roughness: 0.28,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    })
    const champagne = new THREE.MeshPhysicalMaterial({
      color: 0xf1d992,
      metalness: 0.62,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    })
    const onyx = new THREE.MeshPhysicalMaterial({
      color: 0x09201d,
      metalness: 0.35,
      roughness: 0.32,
      clearcoat: 0.6,
    })

    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(1.25, 2), onyx)
    jewel.rotation.set(0.45, 0.12, 0.78)
    group.add(jewel)

    const crown = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.035, 12, 96), gold)
    crown.rotation.x = Math.PI / 2
    group.add(crown)

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.025, 12, 96), champagne)
    innerRing.rotation.x = Math.PI / 2
    group.add(innerRing)

    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2
      const length = i % 2 === 0 ? 1.05 : 0.62
      const ray = new THREE.Mesh(new THREE.BoxGeometry(0.028, length, 0.028), i % 2 === 0 ? gold : champagne)
      ray.position.set(Math.cos(angle) * (2.22 + length * 0.25), Math.sin(angle) * (2.22 + length * 0.25), -0.18)
      ray.rotation.z = angle - Math.PI / 2
      group.add(ray)
    }

    const ambient = new THREE.AmbientLight(0xf8e6b2, 1.1)
    scene.add(ambient)
    const key = new THREE.DirectionalLight(0xf7d77a, 2.4)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0x8ccac1, 1.2, 12)
    rim.position.set(-3, -1.5, 4)
    scene.add(rim)

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2
    }
    window.addEventListener('pointermove', onPointerMove)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let frameId = 0
    const startTime = window.performance.now()
    const render = () => {
      const elapsed = (window.performance.now() - startTime) / 1000
      group.rotation.y += ((pointer.x * 0.24) - group.rotation.y) * 0.045
      group.rotation.x += ((pointer.y * 0.12) - group.rotation.x) * 0.045
      jewel.rotation.y = elapsed * 0.28
      crown.rotation.z = elapsed * 0.08
      innerRing.rotation.z = -elapsed * 0.11
      renderer.render(scene, camera)
      if (!reduceMotion) frameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', resize)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={root} className="theme-artdeco relative min-h-screen overflow-x-hidden text-foreground">
      <div className="curtain-overlay pointer-events-none fixed inset-0 z-50">
        <div className="curtain-left absolute inset-y-0 left-0 w-1/2 bg-[oklch(0.14_0.03_165)]" />
        <div className="curtain-right absolute inset-y-0 right-0 w-1/2 bg-[oklch(0.14_0.03_165)]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[oklch(0.15_0.045_185/0.72)] border-b border-primary/20">
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

      <section id="top" className="relative min-h-[100svh] flex items-center justify-center px-4 pt-20 pb-32 overflow-hidden">
        <img src={decoHero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" width={1280} height={1600} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,oklch(0.34_0.08_80/0.36),transparent_32%),linear-gradient(180deg,oklch(0.12_0.04_205/0.92),oklch(0.16_0.05_172/0.72)_42%,oklch(0.09_0.025_220)_100%)]" />
        <div className="hero-arch absolute inset-x-5 top-24 bottom-16 md:inset-x-[12vw] border border-primary/35" />
        <div className="hero-frame-line absolute left-1/2 top-28 h-px w-[72vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <div className="hero-frame-line absolute left-1/2 bottom-20 h-px w-[64vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
        <canvas ref={jewelCanvas} className="pointer-events-none absolute left-1/2 top-[47%] z-[1] h-[520px] w-[min(92vw,620px)] -translate-x-1/2 -translate-y-1/2 opacity-65 mix-blend-screen" aria-hidden="true" />

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

          <h1 className="deco-hero-title font-display text-[18vw] md:text-[9rem] leading-[0.95] font-light">
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

      <section className="border-y border-primary/20 py-5 overflow-hidden bg-[oklch(0.10_0.035_205)]">
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

      <section className="ad-count-section container-x py-20 md:py-32 text-center relative">
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
              <div key={t.l} className="ad-count-cell deco-card gold-border bg-card/70 backdrop-blur p-3 md:p-6">
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

      <section id="story" className="ad-story-section container-x py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        <div className="ad-story-photo deco-panel relative">
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
        <div className="ad-story-copy">
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

      <section id="details" className="ad-details-section relative py-20 md:py-32">
        <img src={decoFrame} alt="" className="absolute inset-0 w-full h-full object-cover opacity-12 mix-blend-screen" loading="lazy" />
        <div className="container-x relative">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">The Details</div>
            <h2 className="reveal-words font-display text-4xl md:text-6xl">An evening of glamour</h2>
          </div>

          <div className="ad-details-grid grid md:grid-cols-3 gap-6">
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
                className="ad-detail-card deco-card group relative gold-border bg-card/75 backdrop-blur p-8 text-center hover:bg-primary/8 transition"
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

      <section id="gallery" className="ad-gallery-section container-x py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Moments</div>
          <h2 className="reveal-words font-display text-4xl md:text-6xl">From us to you</h2>
        </div>

        <div className="ad-gallery-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[decoCouple, decoFeather, decoHero, decoFrame, decoFeather, decoCouple, decoFrame, decoHero].map((src, i) => (
            <div key={i} className="ad-gallery-tile deco-card overflow-hidden aspect-[3/4] gold-border">
              <img src={src} alt="" className="gallery-img h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="ad-venue-section container-x py-20 md:py-32 grid md:grid-cols-2 gap-8 items-stretch">
        <div className="ad-map-panel deco-panel gold-border overflow-hidden aspect-[4/3] md:aspect-auto">
          <iframe
            title="Villa Aurelia"
            src="https://www.google.com/maps?q=Villa+Aurelia+Rome&output=embed"
            className="w-full h-full grayscale contrast-125 invert-[0.85] hue-rotate-[60deg]"
            loading="lazy"
          />
        </div>
        <div className="ad-venue-copy flex flex-col justify-center">
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

      <section id="rsvp" className="ad-rsvp-section relative py-20 md:py-32">
        <img src={decoHero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-14" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.10_0.035_205),oklch(0.15_0.052_188/0.94),oklch(0.08_0.028_220))]" />

        <div className="ad-rsvp-shell container-x relative max-w-xl text-center">
          <img src={decoLeaf} alt="" className="mx-auto w-24 opacity-70 mb-6" loading="lazy" />
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Kindly Reply</div>
          <h2 className="reveal-words font-display text-4xl md:text-6xl mb-3">Will you join us?</h2>
          <p className="font-script text-3xl md:text-4xl text-primary mb-10">by the first of August</p>

          <form
            className="ad-rsvp-form space-y-4 text-left"
            onSubmit={(e) => {
              e.preventDefault()
              window.alert('Merci! Your reply has been noted.')
            }}
          >
            <input
              type="text"
              placeholder="Your full name"
              required
              className="w-full bg-card/70 gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/8"
            />
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full bg-card/70 gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/8"
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-card gold-border px-4 py-3 text-foreground focus:outline-none">
                <option>Joyfully accepts</option>
                <option>Regretfully declines</option>
              </select>
              <select className="bg-card gold-border px-4 py-3 text-foreground focus:outline-none">
                <option>1 guest</option>
                <option>2 guests</option>
              </select>
            </div>
            <textarea
              placeholder="A note to the couple…"
              rows={3}
              className="w-full bg-card/70 gold-border px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:bg-primary/8"
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
