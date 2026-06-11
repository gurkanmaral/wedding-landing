import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TEMPLATE = {
  couple: {
    partnerOne: 'Name',
    partnerTwo: 'Name',
    line: 'request the pleasure of your company',
  },
  event: {
    dateLabel: 'Saturday, 18 September 2027',
    timeLabel: '18:00',
    venueName: 'Seaside Ceremony Venue',
    locationLabel: 'Bodrum, Türkiye',
    mapQuery: 'Bodrum Turkey',
  },
  rsvp: {
    primaryCta: 'RSVP',
    secondaryCta: 'Save the date',
    note: 'Replace this CTA with a WhatsApp link or your RSVP form later.',
  },
  schedule: [
    { time: '16:30', title: 'Arrival', detail: 'Welcome drinks and greetings.' },
    { time: '18:00', title: 'Ceremony', detail: 'Vows by the sea.' },
    { time: '19:30', title: 'Dinner', detail: 'Dinner, speeches, and sunset.' },
    { time: '21:00', title: 'Celebration', detail: 'Dancing and after-party.' },
  ],
  details: [
    { label: 'Dress code', value: 'Formal / Coastal' },
    { label: 'RSVP by', value: '01 July 2027' },
    { label: 'Transport', value: 'Shuttle / Parking info' },
    { label: 'Note', value: 'Kindly no white attire' },
  ],
  faq: [
    {
      q: 'Can I use this template for different couples?',
      a: 'Yes. Change names, date, venue, and the schedule — the design stays consistent.',
    },
    {
      q: 'Can you add a real RSVP form?',
      a: 'Yes. This can connect to a form, WhatsApp, or a custom dashboard later.',
    },
    {
      q: 'Can you replace the map?',
      a: 'Yes. Replace the placeholder with the real venue link and coordinates.',
    },
  ],
}

const MARKETING = {
  languages: ['ES', 'EN', 'FR', 'DE', '+15'],
  rating: '4.9',
  happyCouples: '+500',
  startingPrice: '175€',
}

const INCLUDED = [
  {
    title: 'Personalised design & theme',
    note: 'Mediterranean style, reusable layout, and editable copy blocks.',
    icon: 'spark',
  },
  {
    title: 'RSVP & confirmation',
    note: 'Placeholder CTAs now, real forms/WhatsApp later.',
    icon: 'rsvp',
  },
  {
    title: 'Guest list export',
    note: 'Structure ready to connect to a dashboard or CSV export.',
    icon: 'list',
  },
  {
    title: 'Maps, schedule & key info',
    note: 'Timeline, venue, travel notes, and important reminders.',
    icon: 'map',
  },
  {
    title: 'Countdown & reveal moments',
    note: 'Interactive “reveal” card and live countdown block.',
    icon: 'count',
  },
  {
    title: 'Music (optional)',
    note: 'Add background music when you provide audio files.',
    icon: 'music',
  },
]

const COMPARISON = {
  paper: {
    title: 'Paper invitation',
    subtitle: 'Approx. price 120 guests',
    items: [
      { label: 'Design', value: '500€' },
      { label: 'Printing', value: '260€' },
      { label: 'Envelopes + sealing', value: '104€' },
      { label: 'Postal shipping', value: '120€' },
    ],
    totalLabel: '~984€',
  },
  digital: {
    title: 'Digital invitation',
    subtitle: 'The best choice',
    saveLabel: 'Save +600€',
    perks: [
      'No printing or shipping costs',
      'Real-time confirmations',
      'Always accessible on guests’ phones',
      'Update details anytime',
      'Photos, videos, and more',
    ],
    startingFrom: MARKETING.startingPrice,
  },
  features: [
    { label: 'Data updates', paper: false, digital: true },
    { label: 'RSVP tracking', paper: false, digital: true },
    { label: 'Interactive map', paper: false, digital: true },
    { label: 'Live countdown', paper: false, digital: true },
    { label: 'Photo gallery', paper: false, digital: true },
    { label: 'Background music', paper: false, digital: true },
  ],
}

const THEMES = [
  { name: 'Costa', tone: 'Sea glass', tag: 'Minimal', accent: '#86c5d8' },
  { name: 'Sole', tone: 'Warm sand', tag: 'Romantic', accent: '#ffd5a3' },
  { name: 'Azzurro', tone: 'Blue ceramic', tag: 'Editorial', accent: '#9ed1df' },
  { name: 'Terra', tone: 'Stone & sun', tag: 'Classic', accent: '#f1d4af' },
  { name: 'Notte', tone: 'Deep navy', tag: 'Luxury', accent: '#224c59' },
]

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

function OrnamentDivider({ className = '', tone = 'light' }) {
  const stroke = tone === 'light' ? 'rgba(233,243,246,0.9)' : 'rgba(34,76,89,0.85)'
  const accent = tone === 'light' ? 'rgba(241,212,175,0.95)' : 'rgba(134,197,216,0.95)'

  return (
    <svg
      viewBox="0 0 320 70"
      className={`${className} illustration-divider`}
      aria-hidden="true"
      fill="none"
    >
      <path
        className="draw-stroke"
        d="M12 35H98C118 35 126 23 136 23C146 23 150 35 160 35"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M308 35H222C202 35 194 23 184 23C174 23 170 35 160 35"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M136 23C140 36 148 45 160 47C172 45 180 36 184 23"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M142 20C148 14 154 12 160 12C166 12 172 14 178 20"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle className="draw-fill" cx="160" cy="35" r="4.5" fill={accent} />
      <circle className="draw-fill" cx="126" cy="23" r="3.5" fill={accent} fillOpacity="0.9" />
      <circle className="draw-fill" cx="194" cy="23" r="3.5" fill={accent} fillOpacity="0.9" />
    </svg>
  )
}

function MediterraneanBackdrop({ className = '' }) {
  return (
    <div
      className={`${className} relative overflow-hidden bg-[radial-gradient(circle_at_18%_22%,rgba(255,213,163,0.32),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(158,209,223,0.28),transparent_28%),linear-gradient(180deg,#a6d8e6_0%,#6bb8cb_26%,#2f7186_54%,#143543_100%)]`}
      aria-hidden="true"
    >
      <div className="hero-glow absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,213,163,0.34),transparent_30%),radial-gradient(circle_at_76%_26%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(134,197,216,0.18),transparent_42%)] mix-blend-screen" />

      <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="sunGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(890 190) rotate(90) scale(180 180)">
            <stop stopColor="#FFD5A3" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFD5A3" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4FA7BE" stopOpacity="0.9" />
            <stop offset="1" stopColor="#143543" stopOpacity="1" />
          </linearGradient>
          <filter id="grain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0.22 0" />
          </filter>
        </defs>

        <circle className="hero-sun" cx="890" cy="190" r="52" fill="#FFD5A3" fillOpacity="0.9" />
        <circle className="hero-sun-glow" cx="890" cy="190" r="180" fill="url(#sunGlow)" />

        <path
          d="M0 430C170 400 314 410 460 446C596 480 722 534 880 524C1010 516 1108 472 1200 442V800H0V430Z"
          fill="url(#sea)"
          opacity="0.92"
        />

        <path
          className="hero-wave"
          d="M0 520C140 488 270 488 398 520C520 552 636 586 772 580C914 572 1040 516 1200 476"
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          className="hero-wave"
          d="M0 568C124 536 252 540 378 574C500 606 614 642 748 636C906 628 1040 562 1200 520"
          stroke="rgba(255,213,163,0.54)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          className="hero-wave"
          d="M0 616C132 586 258 590 386 626C512 662 626 698 768 692C928 684 1062 622 1200 586"
          stroke="rgba(158,209,223,0.42)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <path
          className="hero-horizon"
          d="M0 402C160 368 304 366 448 394C594 422 730 468 884 462C1018 456 1116 414 1200 386"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <rect x="-40" y="-40" width="1280" height="880" filter="url(#grain)" opacity="0.22" />
      </svg>

      <div className="hero-cloud hero-cloud-1 absolute left-[10%] top-[14%] h-20 w-48 rounded-[999px] bg-white/14 blur-2xl" />
      <div className="hero-cloud hero-cloud-2 absolute left-[24%] top-[18%] h-16 w-40 rounded-[999px] bg-white/12 blur-2xl" />
      <div className="hero-cloud hero-cloud-3 absolute right-[16%] top-[12%] h-16 w-44 rounded-[999px] bg-white/12 blur-2xl" />
    </div>
  )
}

function TilePattern({ className = '' }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <pattern id="tile" width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M0 0H48V48H0V0Z"
            fill="rgba(255,255,255,0.0)"
          />
          <path
            d="M24 8C28 12 32 16 40 16C32 16 28 20 24 24C20 20 16 16 8 16C16 16 20 12 24 8Z"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            strokeLinecap="round"
            className="draw-stroke"
          />
          <path
            d="M24 24C28 28 32 32 40 32C32 32 28 36 24 40C20 36 16 32 8 32C16 32 20 28 24 24Z"
            stroke="rgba(241,212,175,0.45)"
            strokeWidth="2"
            strokeLinecap="round"
            className="draw-stroke"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="240" height="240" fill="url(#tile)" opacity="0.9" />
    </svg>
  )
}

function LemonSprig({ className = '' }) {
  return (
    <svg viewBox="0 0 220 220" className={`${className} illustration-anim`} aria-hidden="true" fill="none">
      <path
        className="draw-stroke"
        d="M72 170C96 142 110 116 116 90C122 62 120 40 110 24"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M106 76C92 70 78 70 62 78C78 86 92 86 106 76Z"
        stroke="rgba(158,209,223,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M124 60C140 54 154 54 170 62C154 72 140 72 124 60Z"
        stroke="rgba(158,209,223,0.6)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse className="draw-fill" cx="78" cy="150" rx="22" ry="18" fill="rgba(255,213,163,0.9)" />
      <path
        className="draw-stroke"
        d="M62 150C70 140 86 136 96 144"
        stroke="rgba(34,76,89,0.45)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse className="draw-fill" cx="144" cy="110" rx="18" ry="15" fill="rgba(255,213,163,0.85)" />
      <path
        className="draw-stroke"
        d="M130 110C136 102 150 98 158 104"
        stroke="rgba(34,76,89,0.4)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DovePair({ className = '' }) {
  return (
    <svg viewBox="0 0 260 120" className={`${className} illustration-anim`} aria-hidden="true" fill="none">
      <path
        className="draw-stroke"
        d="M46 70C60 40 80 34 98 40C114 46 122 62 112 82C106 94 92 100 78 98C64 96 54 86 46 70Z"
        stroke="rgba(255,255,255,0.58)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M214 70C200 40 180 34 162 40C146 46 138 62 148 82C154 94 168 100 182 98C196 96 206 86 214 70Z"
        stroke="rgba(255,255,255,0.58)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M128 86C120 72 110 62 96 54"
        stroke="rgba(241,212,175,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M132 86C140 72 150 62 164 54"
        stroke="rgba(241,212,175,0.7)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle className="draw-fill" cx="130" cy="92" r="7" fill="rgba(241,212,175,0.9)" />
    </svg>
  )
}

const STORY_CARDS = [
  {
    label: 'Arrival',
    title: 'A coastal welcome',
    copy: 'Use this as a soft intro card for any wedding: arrivals, welcome drinks, greeting notes.',
  },
  {
    label: 'Ceremony',
    title: 'Vows by the sea',
    copy: 'A classic centerpiece that stays generic. Swap time, venue, and short details.',
  },
  {
    label: 'Celebration',
    title: 'Dinner & dancing',
    copy: 'A closing chapter for dinner, speeches, music, and after party.',
  },
]

function IncludedIcon({ name }) {
  if (name === 'rsvp') {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
        <path className="draw-stroke" d="M22 36H98V84H22V36Z" stroke="rgba(34,76,89,0.75)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M22 40L60 66L98 40" stroke="rgba(134,197,216,0.85)" strokeWidth="3" strokeLinecap="round" />
        <circle className="draw-fill" cx="86" cy="78" r="8" fill="rgba(255,213,163,0.9)" />
      </svg>
    )
  }

  if (name === 'map') {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
        <path className="draw-stroke" d="M30 24L54 34L78 24L96 32V96L78 88L54 96L30 88V24Z" stroke="rgba(34,76,89,0.75)" strokeWidth="3" strokeLinejoin="round" />
        <path className="draw-stroke" d="M54 34V96" stroke="rgba(158,209,223,0.85)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M78 24V88" stroke="rgba(158,209,223,0.65)" strokeWidth="3" strokeLinecap="round" />
        <circle className="draw-fill" cx="60" cy="56" r="8" fill="rgba(255,213,163,0.9)" />
      </svg>
    )
  }

  if (name === 'count') {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
        <path className="draw-stroke" d="M26 32H94V90H26V32Z" stroke="rgba(34,76,89,0.75)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M38 24V40" stroke="rgba(158,209,223,0.85)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M82 24V40" stroke="rgba(158,209,223,0.85)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M38 56H82" stroke="rgba(241,212,175,0.75)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M38 70H70" stroke="rgba(241,212,175,0.6)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'music') {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
        <path className="draw-stroke" d="M72 22V74" stroke="rgba(34,76,89,0.75)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M72 22L96 28V80" stroke="rgba(158,209,223,0.85)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="draw-fill" cx="52" cy="84" r="10" fill="rgba(255,213,163,0.9)" />
        <circle className="draw-fill" cx="88" cy="90" r="9" fill="rgba(255,213,163,0.7)" />
        <path className="draw-stroke" d="M52 84C52 76 60 72 72 74" stroke="rgba(34,76,89,0.6)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === 'list') {
    return (
      <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
        <path className="draw-stroke" d="M30 28H92" stroke="rgba(34,76,89,0.75)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M30 48H92" stroke="rgba(158,209,223,0.85)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M30 68H92" stroke="rgba(34,76,89,0.55)" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M30 88H72" stroke="rgba(158,209,223,0.65)" strokeWidth="3" strokeLinecap="round" />
        <circle className="draw-fill" cx="22" cy="28" r="4" fill="rgba(255,213,163,0.9)" />
        <circle className="draw-fill" cx="22" cy="48" r="4" fill="rgba(255,213,163,0.9)" />
        <circle className="draw-fill" cx="22" cy="68" r="4" fill="rgba(255,213,163,0.9)" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 120 120" className="h-12 w-12 illustration-anim" aria-hidden="true" fill="none">
      <path className="draw-stroke" d="M60 18L74 46L104 50L82 70L88 100L60 84L32 100L38 70L16 50L46 46L60 18Z" stroke="rgba(34,76,89,0.7)" strokeWidth="3" strokeLinejoin="round" />
      <circle className="draw-fill" cx="60" cy="58" r="9" fill="rgba(255,213,163,0.9)" />
    </svg>
  )
}

function Countdown({ targetDate }) {
  const [parts, setParts] = useState(() => getCountdownParts(targetDate))

  useEffect(() => {
    const intervalId = window.setInterval(() => setParts(getCountdownParts(targetDate)), 1000)
    return () => window.clearInterval(intervalId)
  }, [targetDate])

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      {parts.map((part) => (
        <div
          key={part.label}
          className="rounded-[1.4rem] border border-white/16 bg-white/10 px-4 py-4 text-center text-white backdrop-blur-md"
        >
          <div className="font-display text-4xl leading-none tracking-[-0.03em]">
            {part.value}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-white/70">
            {part.label}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MeditteraeanTemplatePage() {
  const root = useRef(null)
  const eventDate = useMemo(() => new Date('2027-09-18T18:00:00'), [])
  const [dateRevealed, setDateRevealed] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.hero-mask', {
        clipPath: 'inset(10% 7% 14% 7% round 3rem)',
        transformOrigin: 'center center',
      })

      gsap.timeline({ defaults: { ease: 'power2.out' } })
        .to('.hero-mask', { clipPath: 'inset(0% 0% 0% 0% round 0rem)', duration: 1.1 })
        .from('.hero-in', { y: 22, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.75')

      gsap.to('.hero-wave', {
        y: (index) => (index % 2 === 0 ? -8 : 8),
        duration: 3.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.08,
      })

      gsap.to('.hero-sun-glow', {
        scale: 1.03,
        opacity: 0.9,
        duration: 2.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center center',
      })

      gsap.to('.hero-cloud', {
        x: (index) => (index - 1) * 28,
        y: (index) => (index % 2 === 0 ? -10 : 10),
        duration: 6.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.12,
      })

      gsap.utils.toArray('[data-section]').forEach((section) => {
        const items = section.querySelectorAll('[data-item]')
        if (!items.length) return
        gsap.from(items, {
          y: 18,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
          },
        })
      })

      gsap.utils.toArray('[data-count]').forEach((element) => {
        const raw = String(element.getAttribute('data-count') || '0')
        const numberOnly = Number(raw.replace(/[^\d.-]/g, ''))
        const prefix = raw.startsWith('+') ? '+' : ''
        const suffix = raw.includes('€') ? '€' : ''
        const counter = { value: 0 }

        gsap.to(counter, {
          value: numberOnly,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
          },
          onUpdate: () => {
            const next = Math.round(counter.value)
            element.textContent = `${prefix}${next}${suffix}`
          },
        })
      })

      gsap.utils.toArray('.illustration-divider').forEach((svg) => {
        const strokes = svg.querySelectorAll('.draw-stroke')
        const fills = svg.querySelectorAll('.draw-fill')
        strokes.forEach((path) => {
          const length = path.getTotalLength()
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        })
        gsap.set(fills, { scale: 0.7, opacity: 0, transformOrigin: '50% 50%' })
        gsap.timeline({
          scrollTrigger: {
            trigger: svg,
            start: 'top 88%',
          },
        })
          .to(strokes, { strokeDashoffset: 0, duration: 1.05, stagger: 0.08, ease: 'power2.out' })
          .to(fills, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)' }, '-=0.5')
      })

      gsap.utils.toArray('.illustration-anim').forEach((svg) => {
        const strokes = svg.querySelectorAll('.draw-stroke')
        const fills = svg.querySelectorAll('.draw-fill')
        if (!strokes.length && !fills.length) return

        strokes.forEach((path) => {
          const length = path.getTotalLength()
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        })
        gsap.set(fills, { scale: 0.75, opacity: 0, transformOrigin: '50% 50%' })

        gsap.timeline({
          scrollTrigger: {
            trigger: svg,
            start: 'top 90%',
          },
        })
          .to(strokes, { strokeDashoffset: 0, duration: 1.2, stagger: 0.08, ease: 'power2.out' })
          .to(fills, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)' }, '-=0.55')
      })

      if (root.current) {
        const stage = root.current.querySelector('.story-stage')
        const panels = gsap.utils.toArray('.story-panel')
        const cards = gsap.utils.toArray('.story-card')
        if (stage && panels.length && cards.length) {
          gsap.set(panels, { autoAlpha: (i) => (i === 0 ? 1 : 0), scale: (i) => (i === 0 ? 1 : 1.06) })
          gsap.set(cards, { opacity: (i) => (i === 0 ? 1 : 0.35), y: (i) => (i === 0 ? 0 : 18) })

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: '.story-shell',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.9,
            },
          })

          tl.fromTo(stage, { scale: 0.95, rotate: -1.2 }, { scale: 1, rotate: 0, duration: 0.8, ease: 'none' }, 0)

          cards.slice(1).forEach((_, idx) => {
            const next = idx + 1
            tl.to(cards[next - 1], { opacity: 0.28, y: -16, duration: 0.55, ease: 'none' }, '+=0.6')
              .to(panels[next - 1], { autoAlpha: 0, scale: 0.92, duration: 0.7, ease: 'none' }, '<')
              .to(cards[next], { opacity: 1, y: 0, duration: 0.7, ease: 'none' }, '<0.05')
              .to(panels[next], { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'none' }, '<')
          })
        }
      }

      const scheduleLine = root.current?.querySelector('.schedule-line')
      if (scheduleLine) {
        gsap.fromTo(
          scheduleLine,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: 'top center',
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: '#schedule', start: 'top 78%' },
          },
        )
        gsap.from('.schedule-dot', {
          scale: 0,
          duration: 0.35,
          ease: 'back.out(2.2)',
          stagger: 0.12,
          scrollTrigger: { trigger: '#schedule', start: 'top 78%' },
        })
      }

      gsap.to('.hero-parallax', {
        yPercent: 8,
        scale: 1.03,
        ease: 'none',
        scrollTrigger: {
          trigger: '#top',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!dateRevealed) return undefined
    const overlay = root.current?.querySelector('.reveal-overlay')
    if (!overlay) return undefined
    const ctx = gsap.context(() => {
      gsap.to(overlay, {
        clipPath: 'inset(0% 100% 0% 0% round 1.6rem)',
        duration: 0.9,
        ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [dateRevealed])

  const coupleName = `${TEMPLATE.couple.partnerOne} & ${TEMPLATE.couple.partnerTwo}`
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(TEMPLATE.event.mapQuery)}&z=12&output=embed`

  return (
    <div
      ref={root}
      className="bg-[radial-gradient(circle_at_top,rgba(158,209,223,0.14),transparent_40%),radial-gradient(circle_at_bottom,rgba(255,213,163,0.12),transparent_42%),linear-gradient(180deg,#fbf7ef_0%,#f6fbfd_42%,#faf6ed_100%)] text-[#173847]"
    >
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            Med<span className="text-[#ffd5a3]">·</span>Wedding
          </a>
          <nav className="hidden items-center gap-9 text-sm text-white/80 md:flex">
            <a href="#details" className="transition hover:text-white">
              Details
            </a>
            <a href="#schedule" className="transition hover:text-white">
              Schedule
            </a>
            <a href="#rsvp" className="transition hover:text-white">
              RSVP
            </a>
            <a href="#map" className="transition hover:text-white">
              Map
            </a>
          </nav>
          <a
            href="#rsvp"
            className="rounded-full border border-white/20 bg-[#163847]/80 px-5 py-2.5 text-sm text-[#f7fcfd] backdrop-blur-sm transition-colors hover:bg-[#224c59]"
          >
            {TEMPLATE.rsvp.primaryCta}
          </a>
        </div>
      </header>

      <section id="top" className="relative min-h-[760px] overflow-hidden">
        <div className="hero-mask hero-parallax absolute inset-0">
          <MediterraneanBackdrop className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.32)_0%,rgba(8,28,37,0.18)_40%,rgba(250,246,237,0.94)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-7xl flex-col justify-end px-6 pb-20 pt-32 lg:px-10 lg:pb-24">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="hero-in rounded-[2.4rem] border border-white/25 bg-white/12 p-7 text-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:p-9">
              <div className="hero-in mb-6 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/85 backdrop-blur-sm">
                  Your invitation, in any language
                </div>
                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/75 backdrop-blur-sm">
                  {MARKETING.languages.join(' · ')}
                </div>
                <div className="rounded-full border border-[#ffd5a3]/40 bg-[#ffd5a3]/12 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/90 backdrop-blur-sm">
                  {MARKETING.rating} rating
                </div>
                <div className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/75 backdrop-blur-sm">
                  {MARKETING.happyCouples} happy couples
                </div>
              </div>
              <p className="hero-in text-xs uppercase tracking-[0.4em] text-white/75">
                Mediterranean wedding invitation
              </p>
              <OrnamentDivider className="hero-in mt-6 h-8 w-40 opacity-90" />
              <h1 className="hero-in font-display text-balance text-[clamp(3.2rem,9vw,7.8rem)] leading-[0.95] tracking-[-0.05em]">
                {coupleName}
              </h1>
              <p className="hero-in mt-6 max-w-2xl text-lg leading-8 text-white/86">
                {TEMPLATE.couple.line}. A clean, generic Mediterranean theme that you
                can reuse by only changing names and details.
              </p>
              <div className="hero-in mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#rsvp"
                  className="rounded-full bg-white px-6 py-3 text-sm uppercase tracking-[0.28em] text-[#173847] transition hover:bg-[#fff7ed]"
                >
                  {TEMPLATE.rsvp.secondaryCta}
                </a>
                <a
                  href="#included"
                  className="rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm uppercase tracking-[0.28em] text-white transition hover:bg-white/16"
                >
                  View features
                </a>
              </div>

              <Countdown targetDate={eventDate} />
            </div>

            <div className="hero-in grid gap-4 lg:justify-self-end lg:max-w-[380px]">
              <div className="rounded-[2rem] border border-white/18 bg-[#163847]/70 p-6 text-white shadow-[0_24px_70px_-36px_rgba(11,31,40,0.8)] backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]">
                  Event
                </div>
                <div className="mt-4 font-display text-3xl tracking-[-0.03em]">
                  {TEMPLATE.event.dateLabel}
                </div>
                <div className="mt-3 text-white/75">{TEMPLATE.event.timeLabel}</div>
                <div className="mt-6 border-t border-white/12 pt-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]">
                    Venue
                  </div>
                  <div className="mt-3 font-display text-2xl tracking-[-0.03em]">
                    {TEMPLATE.event.venueName}
                  </div>
                  <div className="mt-3 text-white/75">{TEMPLATE.event.locationLabel}</div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/18 bg-white/10 p-6 text-white backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.35em] text-[#ffd5a3]">
                  Note
                </div>
                <p className="mt-4 leading-7 text-white/74">{TEMPLATE.rsvp.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="included" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div data-item>
            <p className="text-xs uppercase tracking-[0.4em] text-[#6a8790]">
              What&apos;s included
            </p>
            <OrnamentDivider className="mt-6 h-9 w-44" tone="dark" />
            <h2 className="mt-8 font-display text-5xl leading-[1.03] tracking-[-0.045em] text-[#173847] md:text-6xl">
              A modern invitation experience.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
              Inspired by premium invitation sites like The Digital Yes — but designed as a reusable Mediterranean template.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2" data-item>
            {INCLUDED.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[2rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] backdrop-blur-sm"
              >
                <TilePattern className="pointer-events-none absolute -right-14 -top-14 h-56 w-56 opacity-[0.10]" />
                <div className="relative z-10 flex items-start gap-5">
                  <div className="rounded-[1.6rem] border border-[#d7e6eb] bg-[#f8fbfc] p-3 shadow-[0_18px_40px_-34px_rgba(34,76,89,0.3)]">
                    <IncludedIcon name={item.icon} />
                  </div>
                  <div>
                    <div className="font-display text-2xl tracking-[-0.02em] text-[#173847]">
                      {item.title}
                    </div>
                    <p className="mt-3 leading-7 text-[#5f7680]">{item.note}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="comparison" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div data-item>
            <p className="text-xs uppercase tracking-[0.4em] text-[#6a8790]">
              Comparison
            </p>
            <OrnamentDivider className="mt-6 h-9 w-44" tone="dark" />
            <h2 className="mt-8 font-display text-5xl leading-[1.03] tracking-[-0.045em] text-[#173847] md:text-6xl">
              Paper vs digital invitations.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
              Paper is beautiful. Digital can be elegant too — and easier for guests.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2" data-item>
            <article className="rounded-[2.2rem] border border-[#d7e6eb] bg-white/80 p-7 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                {COMPARISON.paper.subtitle}
              </div>
              <div className="mt-4 font-display text-4xl tracking-[-0.03em] text-[#173847]">
                {COMPARISON.paper.title}
              </div>
              <div className="mt-8 space-y-4">
                {COMPARISON.paper.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-6 border-b border-[#e3eef2] pb-4">
                    <div className="text-sm uppercase tracking-[0.22em] text-[#6a8790]">{item.label}</div>
                    <div className="font-display text-2xl tracking-[-0.02em] text-[#173847]">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-7 text-sm uppercase tracking-[0.28em] text-[#6a8790]">Total cost</div>
              <div className="mt-3 font-display text-4xl tracking-[-0.03em] text-[#173847]">{COMPARISON.paper.totalLabel}</div>
            </article>

            <article className="relative overflow-hidden rounded-[2.2rem] border border-[#b8d8e1]/24 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)] p-7 text-white shadow-[0_34px_90px_-48px_rgba(16,55,66,0.72)]">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[#9ed1df]/14 blur-3xl" />
                <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#ffd5a3]/14 blur-3xl" />
                <TilePattern className="absolute left-8 top-8 h-48 w-48 opacity-[0.06]" />
                <DovePair className="absolute right-8 top-8 h-20 w-40 opacity-75" />
              </div>
              <div className="relative z-10">
                <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                  {COMPARISON.digital.subtitle}
                </div>
                <div className="mt-4 font-display text-4xl tracking-[-0.03em]">{COMPARISON.digital.title}</div>
                <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-white/80 backdrop-blur-sm">
                  <span data-count={COMPARISON.digital.saveLabel}>{COMPARISON.digital.saveLabel}</span>
                </div>
                <ul className="mt-8 space-y-3 text-white/72">
                  {COMPARISON.digital.perks.map((perk) => (
                    <li key={perk} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ffd5a3]" />
                      <span className="leading-7">{perk}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-9 text-xs uppercase tracking-[0.32em] text-white/70">From only</div>
                <div className="mt-3 font-display text-5xl tracking-[-0.04em]">{COMPARISON.digital.startingFrom}</div>
              </div>
            </article>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2.2rem] border border-[#d7e6eb] bg-white/80 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.2)] backdrop-blur-sm" data-item>
          <div className="grid grid-cols-[1.2fr_0.4fr_0.4fr] gap-0 border-b border-[#e3eef2] px-6 py-5 text-xs uppercase tracking-[0.32em] text-[#6a8790]">
            <div>Exclusive digital features</div>
            <div className="text-center">Paper</div>
            <div className="text-center">Digital</div>
          </div>
          <div className="divide-y divide-[#e3eef2]">
            {COMPARISON.features.map((row) => (
              <div key={row.label} className="grid grid-cols-[1.2fr_0.4fr_0.4fr] gap-0 px-6 py-5">
                <div className="font-display text-2xl tracking-[-0.02em] text-[#173847]">{row.label}</div>
                <div className="flex items-center justify-center text-[#6a8790]">{row.paper ? '✓' : '—'}</div>
                <div className="flex items-center justify-center font-display text-[#173847]">{row.digital ? '✓' : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="themes" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div data-item>
            <p className="text-xs uppercase tracking-[0.4em] text-[#6a8790]">
              Exclusive designs
            </p>
            <OrnamentDivider className="mt-6 h-9 w-44" tone="dark" />
            <h2 className="mt-8 font-display text-5xl leading-[1.03] tracking-[-0.045em] text-[#173847] md:text-6xl">
              Choose your style, make it unique.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
              Each theme follows the Mediterranean wedding mood while staying generic and reusable.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-item>
            {THEMES.map((theme) => (
              <article
                key={theme.name}
                className="group relative overflow-hidden rounded-[2.2rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.2)] backdrop-blur-sm"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, ${theme.accent}33, transparent 40%), radial-gradient(circle at 80% 60%, #ffd5a322, transparent 46%)`,
                  }}
                />
                <TilePattern className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 opacity-[0.10]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">{theme.tag}</div>
                    <div className="h-2 w-10 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <div className="mt-6 font-display text-4xl tracking-[-0.03em] text-[#173847]">
                    {theme.name}
                  </div>
                  <div className="mt-4 text-[#5f7680]">{theme.tone}</div>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="rounded-full border border-[#d7e6eb] bg-white px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#6a8790]">
                      Preview
                    </div>
                    <div className="rounded-full border border-[#f1d4af]/60 bg-[#fff7ed] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#6a8790]">
                      Customize
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="details" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div data-item>
            <p className="text-xs uppercase tracking-[0.4em] text-[#6a8790]">
              Template details
            </p>
            <OrnamentDivider className="mt-6 h-9 w-44" tone="dark" />
            <h2 className="mt-8 font-display text-5xl leading-[1.03] tracking-[-0.04em] text-[#173847] md:text-6xl">
              Clean, reusable, and Mediterranean.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
              This design is intentionally generic. Swap names, dates, and the venue
              without rewriting the layout.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2" data-item>
            {TEMPLATE.details.map((item) => (
              <article
                key={item.label}
                className="group relative overflow-hidden rounded-[1.9rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] backdrop-blur-sm"
              >
                <TilePattern className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 opacity-[0.14]" />
                <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                  {item.label}
                </div>
                <div className="mt-3 font-display text-3xl tracking-[-0.03em] text-[#173847]">
                  {item.value}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-6 lg:px-10" data-section>
        <div
          className="relative overflow-hidden rounded-[2.6rem] border border-[#b8d8e1]/24 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)] px-7 py-12 text-white shadow-[0_34px_90px_-48px_rgba(16,55,66,0.72)] lg:px-12 lg:py-14"
          data-item
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-[#9ed1df]/14 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-[#ffd5a3]/14 blur-3xl" />
            <TilePattern className="absolute left-8 top-8 h-48 w-48 opacity-[0.08]" />
            <LemonSprig className="absolute right-6 top-6 h-36 w-36 opacity-70" />
          </div>

          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/80">Reveal</p>
              <OrnamentDivider className="mt-6 h-9 w-44 opacity-90" />
              <h3 className="mt-8 font-display text-5xl leading-[1.02] tracking-[-0.045em] md:text-6xl">
                Tap to reveal the date.
              </h3>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
                A small interactive moment makes the template feel less static. You can
                replace this with a real “scratch” effect later.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDateRevealed(true)}
              className="group relative w-full overflow-hidden rounded-[2rem] border border-white/18 bg-white/10 px-6 py-8 text-left backdrop-blur-md"
            >
              <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                Wedding date
              </div>
              <div className="mt-4 font-display text-4xl tracking-[-0.03em]">
                {TEMPLATE.event.dateLabel}
              </div>
              <div className="mt-3 text-white/72">{TEMPLATE.event.locationLabel}</div>

              <div
                className="reveal-overlay pointer-events-none absolute inset-3 rounded-[1.6rem] border border-white/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] backdrop-blur-sm"
                style={{ clipPath: 'inset(0% 0% 0% 0% round 1.6rem)' }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,213,163,0.22),transparent_40%),radial-gradient(circle_at_bottom,rgba(158,209,223,0.18),transparent_44%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/80">
                    Tap to reveal
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
        <div className="story-shell relative h-[240vh]">
          <div className="sticky top-20 grid min-h-[calc(100vh-5rem)] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2.4rem] border border-[#d7e6eb] bg-white/80 p-7 shadow-[0_30px_70px_-44px_rgba(34,76,89,0.22)] backdrop-blur-sm lg:p-9">
              <p className="text-xs uppercase tracking-[0.4em] text-[#6a8790]">Story</p>
              <OrnamentDivider className="mt-6 h-9 w-44" tone="dark" />
              <h2 className="mt-8 font-display text-balance text-5xl leading-[1.02] tracking-[-0.045em] text-[#173847] md:text-6xl">
                A pinned chapter section feels premium.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
                Inspired by high-end invitation sites, this section turns content into a slow,
                cinematic reveal.
              </p>

              <div className="mt-10 space-y-4">
                {STORY_CARDS.map((card) => (
                  <article
                    key={card.label}
                    className="story-card overflow-hidden rounded-[1.9rem] border border-[#d7e6eb] bg-[#f8fbfc] p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                        {card.label}
                      </div>
                      <div className="h-px w-12 bg-[linear-gradient(90deg,#86c5d8,#f1d4af)]" />
                    </div>
                    <div className="mt-4 font-display text-3xl tracking-[-0.03em] text-[#173847]">
                      {card.title}
                    </div>
                    <p className="mt-4 leading-7 text-[#5f7680]">{card.copy}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="story-stage relative overflow-hidden rounded-[2.8rem] border border-[#b8d8e1]/24 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)] p-4 shadow-[0_34px_90px_-46px_rgba(16,55,66,0.7)]">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <TilePattern className="absolute left-6 top-6 h-56 w-56 opacity-[0.06]" />
                <DovePair className="absolute right-8 top-8 h-24 w-44 opacity-70" />
              </div>

              {STORY_CARDS.map((card, index) => (
                <div key={card.label} className="story-panel absolute inset-4 overflow-hidden rounded-[2.2rem]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,213,163,0.26),transparent_40%),radial-gradient(circle_at_82%_24%,rgba(158,209,223,0.22),transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.10),transparent_66%)]" />
                  <div className="absolute inset-0 opacity-80">
                    <MediterraneanBackdrop className="h-full w-full" />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.18)_0%,rgba(8,28,37,0.22)_52%,rgba(8,28,37,0.52)_100%)]" />

                  <div className="absolute left-8 top-8 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/80 backdrop-blur-sm">
                    Chapter {index + 1}
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/14 bg-white/10 p-7 text-white backdrop-blur-md">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                          {card.label}
                        </div>
                        <div className="mt-4 font-display text-4xl leading-[1.05] tracking-[-0.04em]">
                          {card.title}
                        </div>
                        <p className="mt-5 max-w-xl leading-7 text-white/72">{card.copy}</p>
                      </div>
                      <LemonSprig className="hidden h-28 w-28 opacity-70 md:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="rounded-[2.8rem] border border-[#b8d8e1]/22 bg-[linear-gradient(145deg,rgba(22,56,71,0.98),rgba(34,76,89,0.94))] px-6 py-14 text-white shadow-[0_34px_90px_-46px_rgba(16,55,66,0.78)] lg:px-10 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div data-item>
              <p className="text-xs uppercase tracking-[0.4em] text-[#b8d8e1]">
                Schedule
              </p>
              <OrnamentDivider className="mt-6 h-9 w-44 opacity-90" />
              <h2 className="mt-8 font-display text-5xl leading-[1.03] tracking-[-0.04em] md:text-6xl">
                A simple flow, beautifully presented.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
                Keep it short and clear. Guests should understand the day in one quick scan.
              </p>
            </div>

            <div className="relative grid gap-4 pl-8" data-item>
              <div className="schedule-line absolute left-3 top-2 h-[calc(100%-0.5rem)] w-px bg-white/18" />
              {TEMPLATE.schedule.map((item) => (
                <article
                  key={item.time}
                  className="rounded-[2rem] border border-white/14 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <div className="schedule-dot absolute -left-[2px] mt-1 h-3 w-3 rounded-full bg-[#ffd5a3]" />
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div className="font-display text-3xl tracking-[-0.03em]">
                      {item.title}
                    </div>
                    <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                      {item.time}
                    </div>
                  </div>
                  <p className="mt-4 leading-7 text-white/72">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="rsvp" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="relative overflow-hidden rounded-[2.8rem] border border-[#b8d8e1]/24 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)] px-8 py-16 text-white shadow-[0_34px_90px_-48px_rgba(16,55,66,0.72)] lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,216,225,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,213,163,0.14),transparent_35%)]" aria-hidden="true" />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div data-item>
              <p className="text-xs uppercase tracking-[0.4em] text-white/80">RSVP</p>
              <OrnamentDivider className="mt-6 h-9 w-44 opacity-90" />
              <h2 className="mt-8 font-display text-6xl leading-[0.98] tracking-[-0.05em] md:text-7xl">
                Please join us.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
                Add your RSVP flow later. For now, this section holds the call to action and keeps the template complete.
              </p>
            </div>

            <div className="rounded-[2.4rem] border border-white/14 bg-white/10 p-7 backdrop-blur-md" data-item>
              <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                Quick actions
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full bg-white px-6 py-3 text-sm uppercase tracking-[0.28em] text-[#173847] transition hover:bg-[#fff7ed]"
                >
                  {TEMPLATE.rsvp.primaryCta}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm uppercase tracking-[0.28em] text-white transition hover:bg-white/16"
                >
                  Share
                </button>
              </div>
              <p className="mt-6 leading-7 text-white/70">{TEMPLATE.rsvp.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="map" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10" data-section>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-[2.4rem] border border-[#d7e6eb] bg-white shadow-[0_30px_60px_-40px_rgba(34,76,89,0.24)]" data-item>
            <div className="border-b border-[#d7e6eb] bg-[linear-gradient(145deg,#f4fafb,#eef5f7)] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                Google Maps placeholder
              </div>
            </div>
            <iframe
              title="Placeholder wedding venue map"
              src={mapSrc}
              className="h-[520px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-[2rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-7 text-white shadow-[0_28px_56px_-36px_rgba(16,55,66,0.68)]" data-item>
            <p className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]">
              Location
            </p>
            <OrnamentDivider className="mt-6 h-9 w-44 opacity-90" />
            <h2 className="mt-8 font-display text-5xl leading-[1.05] tracking-[-0.04em]">
              Finish with a clean venue block.
            </h2>
            <p className="mt-6 leading-8 text-white/72">
              This section keeps the template practical. Replace the placeholder with the real venue address and a direct Google Maps link.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10" data-section>
        <div className="grid gap-4 lg:grid-cols-3">
          {TEMPLATE.faq.map((item) => (
            <article
              key={item.q}
              className="rounded-[2rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.2)]"
              data-item
            >
              <div className="font-display text-2xl tracking-[-0.02em] text-[#173847]">
                {item.q}
              </div>
              <p className="mt-4 leading-7 text-[#5f7680]">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="bg-[linear-gradient(180deg,#102c38,#163847_42%,#0d2430_100%)] py-14 text-[#f7fcfd]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 text-sm text-white/70 lg:px-10 md:flex-row md:items-center md:justify-between">
          <div className="font-display text-xl text-[#faf6ed]">
            Med<span className="text-[#ffd5a3]">·</span>Wedding
          </div>
          <div className="flex flex-wrap gap-8">
            <a href="#top" className="transition hover:text-white">
              Hero
            </a>
            <a href="#details" className="transition hover:text-white">
              Details
            </a>
            <a href="#rsvp" className="transition hover:text-white">
              RSVP
            </a>
          </div>
          <div>Reusable Mediterranean wedding template</div>
        </div>
      </footer>
    </div>
  )
}
