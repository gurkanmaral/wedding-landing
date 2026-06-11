import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import lemons from './assets/med-dream-spark/lemons.jpg'
import table from './assets/med-dream-spark/table.jpg'
import boat from './assets/med-dream-spark/boat.jpg'
import door from './assets/med-dream-spark/door.jpg'

gsap.registerPlugin(ScrollTrigger)

const storyCards = [
  {
    label: 'Couple block',
    value: 'Name & Name',
    note: 'Keep names and the invitation line prominent on the first fold.',
  },
  {
    label: 'Venue block',
    value: 'Seaside venue',
    note: 'Use a short location line and one premium photo to set the mood.',
  },
  {
    label: 'RSVP block',
    value: 'Quick reply',
    note: 'Leave enough space for RSVP, map, and travel details later.',
  },
]

const showcaseMoments = [
  {
    name: 'Welcome',
    title: 'Open with a softer introduction instead of a basic hero.',
    description:
      'This slide-like section is inspired by your mojito project. It gives the page a dedicated showcase area where names, welcome copy, and the primary image can rotate with a more premium feel.',
    img: lemons,
    kicker: 'First scene',
  },
  {
    name: 'Details',
    title: 'Turn practical information into a designed invitation feature.',
    description:
      'Venue, schedule, RSVP deadline, and dress code can live inside a section that feels interactive and styled, rather than a plain list of facts.',
    img: table,
    kicker: 'Middle scene',
  },
  {
    name: 'Gallery',
    title: 'Give one visual chapter its own focus and animation rhythm.',
    description:
      'A featured image area helps the template feel more editorial. You can later swap in real couple photography while keeping the section structure the same.',
    img: boat,
    kicker: 'Final scene',
  },
]

const timelineItems = [
  {
    time: '16:30',
    title: 'Arrival & welcome',
    description: 'Guests arrive, welcome drinks are served, and the first photos begin.',
  },
  {
    time: '18:00',
    title: 'Ceremony',
    description: 'Main vows, entrance music, and the signature invitation moment.',
  },
  {
    time: '19:30',
    title: 'Dinner',
    description: 'Dinner service, speeches, table styling, and soft sunset lighting.',
  },
  {
    time: '21:00',
    title: 'Celebration',
    description: 'Cake, dancing, after party, and the night-time social moments.',
  },
]

const detailCards = [
  {
    label: 'Dress code',
    value: 'Elegant coastal',
    note: 'Replace with formal, sunset chic, black tie, or a custom note.',
  },
  {
    label: 'RSVP deadline',
    value: '01 July 2027',
    note: 'A clear deadline helps planning and keeps the template practical.',
  },
  {
    label: 'Transport',
    value: 'Shuttle info',
    note: 'Use this space for parking, shuttle times, or meeting points.',
  },
  {
    label: 'After party',
    value: 'Beach lounge',
    note: 'Add a second location or keep it hidden when not needed.',
  },
]

const faqItems = [
  {
    question: 'Can this layout be reused for different couples?',
    answer:
      'Yes. The page is designed as a reusable template, so names, dates, photos, venue text, and RSVP details can be swapped quickly.',
  },
  {
    question: 'Can the map be connected to a real venue later?',
    answer:
      'Yes. The current Google Maps block is a placeholder and can be replaced with the exact real venue link and coordinates.',
  },
  {
    question: 'Can this page include accommodation and travel notes?',
    answer:
      'Yes. The guest information and FAQ areas are meant to hold hotel suggestions, local tips, transport plans, or family notes.',
  },
  {
    question: 'Can this template work without changing the design?',
    answer:
      'Yes. That is the main goal. You should be able to change only the content and imagery while keeping the same section system.',
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
      gsap.set(currentRef.current, { yPercent: -100, opacity: 0 })

      gsap.to(previousRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.42,
        ease: 'power2.in',
      })

      gsap.to(currentRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.42,
        ease: 'power2.out',
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
  const faqRefs = useRef([])
  const sceneCopyRef = useRef(null)
  const sceneMediaRef = useRef(null)
  const [countdown, setCountdown] = useState(() => getCountdownParts(templateDate))
  const [activeScene, setActiveScene] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

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
        .from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.7 })
        .from(
          '.hero-word',
          { y: 42, opacity: 0, duration: 0.9, stagger: 0.08 },
          '-=0.4',
        )
        .from('.hero-sub', { y: 16, opacity: 0, duration: 0.7 }, '-=0.45')
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.55 }, '-=0.35')
        .from('.hero-meta', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.28')
        .from('.hero-panel', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.35')

      gsap.to('.hero-img', {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.from('.countdown-shell', {
        scale: 0.94,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#countdown-section',
          start: 'top 78%',
        },
      })

      gsap.from('.countdown-note', {
        x: (index) => (index === 0 ? -36 : 36),
        rotation: (index) => (index === 0 ? -4 : 4),
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#countdown-section',
          start: 'top 78%',
        },
      })

      gsap.from('.countdown-card', {
        y: (index) => (index % 2 === 0 ? 30 : 18),
        rotation: (index) => (index % 2 === 0 ? -5 : 5),
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.countdown-grid',
          start: 'top 82%',
        },
      })

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 72%',
        },
      })

      aboutTl
        .from('.about-copy [data-text-item]', {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.about-chip',
          {
            y: 26,
            opacity: 0,
            scale: 0.95,
            rotation: (index) => (index - 1) * 3,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.35',
        )
        .from(
          '.mosaic-card',
          {
            clipPath: 'inset(18% 12% 18% 12% round 1.8rem)',
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.38',
        )

      const showcaseTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#experiences',
          start: 'top 74%',
        },
      })

      showcaseTl
        .from('.showcase-head [data-text-item]', {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.showcase-tabs button',
          {
            y: 14,
            opacity: 0,
            scale: 0.95,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '-=0.35',
        )
        .from(
          '.scene-copy',
          {
            x: -34,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.2',
        )
        .from(
          '.scene-media',
          {
            x: 42,
            opacity: 0,
            scale: 0.97,
            duration: 0.8,
            ease: 'power2.out',
          },
          '<',
        )

      const timelineTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#timeline-section',
          start: 'top 74%',
        },
      })

      timelineTl
        .from('.timeline-copy [data-text-item]', {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.timeline-line',
          {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.15',
        )
        .from(
          '.timeline-card',
          {
            y: (index) => (index % 2 === 0 ? 28 : -28),
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
          },
          '-=0.3',
        )
        .from(
          '.timeline-dot',
          {
            scale: 0,
            duration: 0.35,
            stagger: 0.12,
            ease: 'back.out(2)',
          },
          '-=0.5',
        )

      const infoTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#info-section',
          start: 'top 72%',
        },
      })

      infoTl
        .from('.info-visual', {
          clipPath: 'inset(10% 0 10% 0 round 2.5rem)',
          opacity: 0,
          duration: 0.95,
          ease: 'power2.out',
        })
        .from(
          '.info-overlay',
          {
            y: 34,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.45',
        )
        .from(
          '.info-copy [data-text-item]',
          {
            x: 26,
            opacity: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.55',
        )
        .from(
          '.info-strip',
          {
            x: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.35',
        )

      const galleryTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top 72%',
        },
      })

      galleryTl
        .from('.gallery-stage', {
          clipPath: 'inset(6% 4% 6% 4% round 2.8rem)',
          opacity: 0,
          duration: 1,
          ease: 'power2.out',
        })
        .from(
          '.gallery-panel [data-text-item]',
          {
            y: 26,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.5',
        )
        .from(
          '.gallery-chip',
          {
            y: 12,
            opacity: 0,
            scale: 0.94,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '-=0.3',
        )

      const faqTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#faq-section',
          start: 'top 74%',
        },
      })

      faqTl
        .from('.faq-copy [data-text-item]', {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.faq-item',
          {
            x: 34,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.25',
        )

      const journalTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#journal',
          start: 'top 76%',
        },
      })

      journalTl
        .from('.journal-copy [data-text-item]', {
          y: 28,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
        })
        .from(
          '#journal',
          {
            backgroundPosition: '50% 0%',
            duration: 1,
            ease: 'none',
          },
          0,
        )

      const mapTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#map-section',
          start: 'top 74%',
        },
      })

      mapTl
        .from('.map-frame', {
          x: -42,
          opacity: 0,
          clipPath: 'inset(0 0 18% 0 round 2.4rem)',
          duration: 0.95,
          ease: 'power2.out',
        })
        .from(
          '.map-copy [data-text-item]',
          {
            x: 28,
            opacity: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.45',
        )
        .from(
          '.map-detail',
          {
            x: 34,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.3',
        )

      gsap.utils.toArray('.parallax-img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -3 },
          {
            yPercent: 3,
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

  useEffect(() => {
    if (!sceneCopyRef.current || !sceneMediaRef.current) return

    const ctx = gsap.context(() => {
      gsap.killTweensOf(sceneCopyRef.current.children)
      gsap.killTweensOf(sceneMediaRef.current)

      gsap.fromTo(
        sceneCopyRef.current.children,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.06 },
      )

      gsap.fromTo(
        sceneMediaRef.current,
        { x: 24, opacity: 0, scale: 0.985 },
        { x: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out' },
      )
    }, root)

    return () => ctx.revert()
  }, [activeScene])

  useEffect(() => {
    faqRefs.current.forEach((element, index) => {
      if (!element) return

      const contentHeight = element.scrollHeight

      gsap.to(element, {
        height: openFaq === index ? contentHeight : 0,
        opacity: openFaq === index ? 1 : 0,
        duration: 0.45,
        ease: 'power2.out',
      })
    })
  }, [openFaq])

  const activeMoment = showcaseMoments[activeScene]

  return (
    <div ref={root} className="overflow-x-hidden bg-[#faf6ed] text-[#4d433b]">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            Med<span className="text-[#ffd5a3]">·</span>Template
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <a href="#about" className="transition hover:text-white">
              Intro
            </a>
            <a href="#experiences" className="transition hover:text-white">
              Showcase
            </a>
            <a href="#gallery" className="transition hover:text-white">
              Gallery
            </a>
            <a href="#journal" className="transition hover:text-white">
              Quote
            </a>
          </nav>
          <a
            href="#book"
            className="rounded-full border border-white/20 bg-[#163847]/80 px-5 py-2.5 text-sm text-[#f7fcfd] backdrop-blur-sm transition-colors hover:bg-[#224c59]"
          >
            Contact
          </a>
        </div>
      </header>

      <section id="top" className="hero relative min-h-[720px] w-full overflow-hidden">
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
                  A premium invitation hero with calmer colors, stronger typography,
                  and room for names, dates, and venue details to feel special from
                  the first screen.
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
                    <span data-count="8">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Sections
                  </div>
                </div>
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    <span data-count="3">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Layouts
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

      <section
        id="countdown-section"
        className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="countdown-shell relative mx-auto max-w-5xl text-center">
          <div className="countdown-note absolute left-0 top-10 hidden w-44 rounded-[1.5rem] border border-[#b8d8e1]/18 bg-white/45 p-4 text-left shadow-[0_24px_60px_-42px_rgba(34,76,89,0.35)] backdrop-blur md:block">
            <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
              Event note
            </div>
            <div className="mt-3 font-display text-2xl text-[#224c59]">
              Countdown focus
            </div>
            <p className="mt-3 text-sm leading-7 text-[#5f7680]">
              A strong middle section gives the page more purpose before guests reach
              the details.
            </p>
          </div>

          <div className="countdown-note absolute right-0 top-20 hidden w-44 rounded-[1.5rem] border border-[#f1d4af]/40 bg-[#fff7ed]/70 p-4 text-left shadow-[0_24px_60px_-42px_rgba(175,124,82,0.34)] backdrop-blur md:block">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b7358]">
              Template use
            </div>
            <div className="mt-3 font-display text-2xl text-[#224c59]">
              Replace date
            </div>
            <p className="mt-3 text-sm leading-7 text-[#6c6257]">
              Keep this animation and only update the actual wedding date per couple.
            </p>
          </div>

          <div className="countdown-grid flex flex-wrap justify-center gap-4">
            {countdown.map((item) => (
              <article
                key={item.label}
                className="countdown-card relative w-[112px] overflow-hidden rounded-[1.6rem] border border-[#b8d8e1]/30 bg-[linear-gradient(180deg,rgba(22,56,71,0.92),rgba(34,76,89,0.88))] px-4 py-5 text-center shadow-[0_28px_56px_-34px_rgba(16,55,66,0.72)] backdrop-blur-sm"
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
                  <div className="font-display flex items-center justify-center gap-0.5 text-4xl leading-none text-white md:text-5xl">
                    {item.value.split('').map((digit, index) => (
                      <CountdownDigit key={`${item.label}-${index}`} value={digit} />
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#c7dfe6]">
                  {item.label}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto w-full max-w-7xl rounded-[2.8rem] border border-[#b8d8e1]/22 bg-[linear-gradient(145deg,rgba(22,56,71,0.98),rgba(34,76,89,0.94))] px-6 py-16 shadow-[0_34px_90px_-46px_rgba(16,55,66,0.78)] lg:px-10 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="about-copy flex flex-col justify-between" data-text-group>
            <div>
              <p
                data-text-item
                className="mb-6 text-xs uppercase tracking-[0.4em] text-[#b8d8e1]"
              >
                Template intro
              </p>
              <h2
                data-text-item
                className="font-display text-balance text-5xl leading-[1.03] text-white md:text-6xl"
              >
                One theme, but <em className="text-[#ffd5a3] not-italic">different</em>{' '}
                section personalities.
              </h2>
              <p
                data-text-item
                className="mt-6 max-w-xl text-lg leading-8 text-white/72"
              >
                Inspired by your mojito layout, this part now feels more like an
                editorial mosaic instead of another repeated card row.
              </p>
            </div>

            <div data-text-item className="mt-10 grid gap-4 sm:grid-cols-3">
              {storyCards.map((item) => (
                <div
                  key={item.label}
                  className="about-chip rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#b8d8e1]">
                    {item.label}
                  </div>
                  <div className="mt-3 font-display text-2xl text-white">{item.value}</div>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-mosaic grid gap-4 md:grid-cols-12" data-card-grid>
            <article
              data-card-item
              className="mosaic-card relative overflow-hidden rounded-[1.8rem] border border-white/12 md:col-span-4"
            >
              <img
                src={lemons}
                alt="Mediterranean lemons styling detail"
                className="parallax-img h-full min-h-[240px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,28,37,0.72))]" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Mood
                </div>
                <div className="mt-2 font-display text-3xl">Warm palette</div>
              </div>
            </article>

            <article
              data-card-item
              className="mosaic-card relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/8 p-6 text-white backdrop-blur-sm md:col-span-8"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                Layout idea
              </div>
              <h3 className="mt-4 font-display text-4xl leading-tight">
                A mosaic section gives the page a more custom feel.
              </h3>
              <p className="mt-4 max-w-2xl leading-8 text-white/72">
                Use one large statement, one image-driven block, and smaller
                supporting panels. This prevents the page from feeling like every
                section is the same card copied again.
              </p>
            </article>

            <article
              data-card-item
              className="mosaic-card relative overflow-hidden rounded-[1.8rem] border border-white/12 md:col-span-7"
            >
              <img
                src={table}
                alt="Mediterranean table styling"
                className="parallax-img h-full min-h-[260px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.16),rgba(8,28,37,0.62))]" />
              <div className="absolute bottom-0 left-0 max-w-md p-6 text-white">
                <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Styling block
                </div>
                <div className="mt-2 font-display text-3xl">Tablescape moment</div>
              </div>
            </article>

            <article
              data-card-item
              className="mosaic-card rounded-[1.8rem] border border-white/12 bg-[#fff7ed]/10 p-6 text-white backdrop-blur-sm md:col-span-5"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                Editable notes
              </div>
              <ul className="mt-5 space-y-4">
                <li className="border-b border-white/10 pb-4">Change names and subtitle</li>
                <li className="border-b border-white/10 pb-4">Update date and venue</li>
                <li className="border-b border-white/10 pb-4">Replace photos per couple</li>
                <li>Keep the same layout and motion</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="experiences" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="showcase-head mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-text-group>
          <div>
            <p
              data-text-item
              className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
            >
              Showcase section
            </p>
            <h2
              data-text-item
              className="font-display text-balance max-w-3xl text-5xl leading-[1.04] text-[#224c59] md:text-6xl"
            >
              Use a <em>slider-like</em> component so one section feels alive.
            </h2>
          </div>
          <div data-text-item className="showcase-tabs flex flex-wrap gap-3">
            {showcaseMoments.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveScene(index)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                  activeScene === index
                    ? 'bg-[#224c59] text-[#f7fcfd]'
                    : 'border border-[#d7e6eb] bg-white/70 text-[#6a8790]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div
            ref={sceneCopyRef}
            className="scene-copy rounded-[2rem] border border-[#dbe8ec] bg-white/75 p-7 shadow-[0_28px_56px_-40px_rgba(34,76,89,0.2)] backdrop-blur-sm"
          >
            <div className="text-xs uppercase tracking-[0.35em] text-[#6a8790]">
              {activeMoment.kicker}
            </div>
            <h3 className="mt-4 font-display text-5xl leading-[1.04] text-[#224c59]">
              {activeMoment.title}
            </h3>
            <p className="mt-5 leading-8 text-[#5f7680]">{activeMoment.description}</p>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveScene(
                    (activeScene - 1 + showcaseMoments.length) % showcaseMoments.length,
                  )
                }
                className="rounded-full border border-[#d7e6eb] bg-white px-4 py-3 text-sm uppercase tracking-[0.28em] text-[#224c59]"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveScene((activeScene + 1) % showcaseMoments.length)}
                className="rounded-full bg-[#224c59] px-4 py-3 text-sm uppercase tracking-[0.28em] text-[#f7fcfd]"
              >
                Next
              </button>
            </div>
          </div>

          <div
            ref={sceneMediaRef}
            className="scene-media relative overflow-hidden rounded-[2.4rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.94),rgba(34,76,89,0.9))] p-4 shadow-[0_30px_70px_-42px_rgba(16,55,66,0.64)]"
          >
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src={activeMoment.img}
                alt={activeMoment.title}
                className="h-[520px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.1),rgba(8,28,37,0.6))]" />
            </div>

            <div className="pointer-events-none absolute left-8 top-8 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white backdrop-blur-sm">
              {activeMoment.name}
            </div>

            <div className="absolute bottom-8 left-8 right-8 rounded-[1.7rem] border border-white/14 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.32em] text-[#b8d8e1]">
                Template scene
              </div>
              <div className="mt-3 font-display text-4xl">{activeMoment.name}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline-section" className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="timeline-copy mb-10 max-w-2xl" data-text-group>
          <p
            data-text-item
            className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
          >
            Timeline section
          </p>
          <h2
            data-text-item
            className="font-display text-5xl leading-[1.04] text-[#224c59] md:text-6xl"
          >
            The schedule should feel <em>editorial</em>, not generic.
          </h2>
        </div>

        <div className="relative">
          <div className="timeline-line absolute left-0 right-0 top-11 hidden h-px bg-[#d7e6eb] lg:block" />
          <div className="grid gap-5 lg:grid-cols-4">
            {timelineItems.map((item, index) => (
              <article
                key={item.time}
                className={`timeline-card rounded-[1.8rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] backdrop-blur-sm ${
                  index % 2 === 1 ? 'lg:mt-12' : ''
                }`}
              >
                <div className="timeline-dot mb-5 h-3 w-3 rounded-full bg-[#224c59]" />
                <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
                  {item.time}
                </div>
                <h3 className="mt-4 font-display text-3xl text-[#224c59]">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[#5f7680]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="info-section" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="info-visual relative overflow-hidden rounded-[2.5rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-4 shadow-[0_28px_56px_-36px_rgba(16,55,66,0.68)]">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src={table}
                alt="Guest information themed image"
                className="parallax-img h-[560px] w-full object-cover"
              />
            </div>
            <div className="info-overlay absolute bottom-8 left-8 right-8 rounded-[1.8rem] border border-white/14 bg-white/10 p-6 text-white backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]">
                Guest information
              </div>
              <div className="mt-3 font-display text-4xl">
                Practical details can still feel elegant.
              </div>
            </div>
          </div>

          <div>
            <div className="info-copy mb-8" data-text-group>
              <p
                data-text-item
                className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
              >
                Information section
              </p>
              <h2
                data-text-item
                className="font-display text-5xl leading-[1.04] text-[#224c59] md:text-6xl"
              >
                Use stacked info strips instead of repeating cards.
              </h2>
            </div>

            <div className="grid gap-4">
              {detailCards.map((card, index) => (
                <article
                  key={card.label}
                  className={`info-strip rounded-[1.7rem] border p-5 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] ${
                    index === 1
                      ? 'border-[#f1d4af]/60 bg-[#fff7ed]'
                      : 'border-[#d7e6eb] bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#224c59] font-display text-lg text-white">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
                        {card.label}
                      </div>
                      <div className="mt-2 font-display text-3xl text-[#224c59]">
                        {card.value}
                      </div>
                      <p className="mt-3 leading-7 text-[#5f7680]">{card.note}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="gallery-stage relative overflow-hidden rounded-[2.8rem] border border-[#b8d8e1]/24 shadow-[0_32px_70px_-44px_rgba(16,55,66,0.44)]">
          <img
            src={door}
            alt="Mediterranean architectural detail for invitation gallery"
            className="parallax-img h-[720px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,37,0.62)_0%,rgba(8,28,37,0.32)_34%,rgba(8,28,37,0.08)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 top-0 flex items-end p-6 md:p-10">
            <div
              className="gallery-panel max-w-xl rounded-[2rem] border border-white/16 bg-white/10 p-7 text-white backdrop-blur-md"
              data-text-group
            >
              <p
                data-text-item
                className="mb-4 text-xs uppercase tracking-[0.35em] text-[#b8d8e1]"
              >
                Featured section
              </p>
              <h2
                data-text-item
                className="font-display text-5xl leading-[1.04] md:text-6xl"
              >
                A full-bleed visual chapter breaks the layout rhythm.
              </h2>
              <p data-text-item className="mt-5 max-w-lg leading-8 text-white/74">
                Instead of another boxed section, this one works like a hero inside
                the page. It is good for the venue, a gallery highlight, or the most
                important celebration photo.
              </p>

              <div data-text-item className="mt-7 flex flex-wrap gap-3">
                <div className="gallery-chip rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#d9eef3]">
                  Event date
                </div>
                <div className="gallery-chip rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#d9eef3]">
                  Venue note
                </div>
                <div className="gallery-chip rounded-full border border-[#f1d4af]/26 bg-[#fff7ed]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Save the date
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq-section" className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="faq-copy rounded-[2rem] border border-[#d7e6eb] bg-white/80 p-7 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.2)]" data-text-group>
            <p
              data-text-item
              className="mb-4 text-xs uppercase tracking-[0.35em] text-[#6a8790]"
            >
              FAQ section
            </p>
            <h2
              data-text-item
              className="font-display text-5xl leading-[1.04] text-[#224c59] md:text-6xl"
            >
              Add interaction with a proper accordion.
            </h2>
            <p data-text-item className="mt-5 leading-8 text-[#5f7680]">
              This keeps the lower part of the page more dynamic and makes the
              section feel different from the others.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <article
                key={item.question}
                className={`faq-item overflow-hidden rounded-[1.7rem] border transition-colors ${
                  openFaq === index
                    ? 'border-[#224c59] bg-[linear-gradient(180deg,#163847,#224c59)] text-white'
                    : 'border-[#d7e6eb] bg-white/80 text-[#224c59]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-3xl">{item.question}</span>
                  <span className="text-xs uppercase tracking-[0.3em]">
                    {openFaq === index ? 'Close' : 'Open'}
                  </span>
                </button>
                <div
                  ref={(element) => {
                    faqRefs.current[index] = element
                  }}
                  className="h-0 overflow-hidden px-6"
                >
                  <p
                    className={`pb-6 leading-7 ${
                      openFaq === index ? 'text-white/72' : 'text-[#5f7680]'
                    }`}
                  >
                    {item.answer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journal" className="relative overflow-hidden py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,216,225,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,213,163,0.14),transparent_35%)]"
          aria-hidden="true"
        />
        <div
          className="journal-copy mx-auto w-full max-w-7xl px-6 text-center lg:px-10"
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

      <section id="map-section" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="map-frame overflow-hidden rounded-[2.4rem] border border-[#d7e6eb] bg-white shadow-[0_30px_60px_-40px_rgba(34,76,89,0.24)]">
            <div className="border-b border-[#d7e6eb] bg-[linear-gradient(145deg,#f4fafb,#eef5f7)] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                Google Maps placeholder
              </div>
            </div>
            <iframe
              title="Placeholder wedding venue map"
              src="https://www.google.com/maps?q=Bodrum%20Turkey&z=12&output=embed"
              className="h-[520px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="map-copy rounded-[2rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-7 text-white shadow-[0_28px_56px_-36px_rgba(16,55,66,0.68)]" data-text-group>
            <p
              data-text-item
              className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]"
            >
              Location map
            </p>
            <h2
              data-text-item
              className="mt-4 font-display text-5xl leading-[1.05]"
            >
              Finish with arrival details and a clean map block.
            </h2>
            <p data-text-item className="mt-5 leading-8 text-white/72">
              The map works better as a main visual on one side and a concise venue
              summary on the other, rather than another duplicated info grid.
            </p>

            <div data-text-item className="mt-7 space-y-4">
              <div className="map-detail rounded-[1.4rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Venue
                </div>
                <div className="mt-2 font-display text-2xl text-white">
                  Placeholder Beach Club
                </div>
              </div>
              <div className="map-detail rounded-[1.4rem] border border-[#f1d4af]/30 bg-[#fff5e8]/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Address
                </div>
                <div className="mt-2 font-display text-2xl text-white">
                  Seaside Road 12
                </div>
              </div>
              <div className="map-detail rounded-[1.4rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Travel note
                </div>
                <div className="mt-2 text-white/72">
                  Add parking, shuttle, or nearby hotel guidance in this block.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        id="book"
        className="bg-[linear-gradient(180deg,#102c38,#163847_42%,#0d2430_100%)] pb-12 pt-28 text-[#f7fcfd]"
      >
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
                <em className="text-[#ffd5a3]">details, and RSVP edits.</em>
              </h2>
            </div>
            <div className="reveal flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p data-text-item className="mb-6 text-white/70">
                Use this footer for contact, booking, pricing, or a lead capture
                form for clients who want the template customized.
              </p>
              <form data-text-item className="flex border-b border-white/40 pb-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-[#faf6ed] outline-none placeholder:text-white/50"
                />
                <button
                  type="button"
                  className="text-sm uppercase tracking-widest transition hover:text-[#ffd5a3]"
                >
                  Send →
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 text-sm text-white/60 md:flex-row md:justify-between">
            <div className="font-display text-xl text-[#faf6ed]">
              Med<span className="text-[#ffd5a3]">·</span>Template
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
