import { Fragment, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

import decoHero from './assets/deco-hero.jpg'
import decoLeaf from './assets/deco-leaf.png'
import decoFeather from './assets/deco-feather.jpg'
import decoCouple from './assets/deco-couple.jpg'
import decoFrame from './assets/deco-frame.jpg'
import { useWeddingCardFields } from '../../api/weddingCardContext'

gsap.registerPlugin(ScrollTrigger)

// Demo couple shown until the API supplies real card data.
// Saturday 18 September 2027, ceremony at 16:00 Rome time (CEST).
const DEFAULTS = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-09-18T16:00:00+02:00',
  venue: 'Villa Aurelia',
  city: 'Rome',
  address: 'Largo di Porta San Pancrazio, 1, 00152 Roma',
  rsvpDeadline: '7 August 2027',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
const ORDINAL_IRREGULAR = { One: 'First', Two: 'Second', Three: 'Third', Five: 'Fifth', Eight: 'Eighth', Nine: 'Ninth', Twelve: 'Twelfth', Twenty: 'Twentieth', Thirty: 'Thirtieth' }

// 1–99 in title-cased words ("Twenty Seven").
function numberToWords(n) {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '')
}

function dayToWords(day) {
  return day >= 1 && day <= 31 ? numberToWords(day) : String(day)
}

function yearToWords(year) {
  if (year < 2000 || year > 2099) return String(year)
  const rest = year - 2000
  return rest ? `Two Thousand ${numberToWords(rest)}` : 'Two Thousand'
}

// 1–31 as a lower-case ordinal ("seventh", "twenty first").
function dayToOrdinalWords(day) {
  const words = numberToWords(day).split(' ')
  const lastWord = words.pop()
  words.push(ORDINAL_IRREGULAR[lastWord] || `${lastWord}th`)
  return words.join(' ').toLowerCase()
}

// "7 August 2027" -> "the seventh of August"; anything unparseable is shown as given.
function deadlinePhrase(deadline) {
  const match = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS.join('|')})\\b`, 'i').exec(deadline)
  const day = match ? Number(match[1]) : 0
  if (!match || day < 1 || day > 31) return deadline
  const month = MONTHS.find((m) => m.toLowerCase() === match[2].toLowerCase())
  return `the ${dayToOrdinalWords(day)} of ${month}`
}

// Calendar parts in the venue's own time: taken from the ISO string when possible,
// so a guest in another time zone still sees the wedding's local date.
function getEventParts(value, fallbackDate) {
  const source = Number.isFinite(new Date(value).getTime()) ? value : DEFAULTS.eventDate
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(source))
  const year = iso ? Number(iso[1]) : fallbackDate.getFullYear()
  const month = iso ? Number(iso[2]) : fallbackDate.getMonth() + 1
  const day = iso ? Number(iso[3]) : fallbackDate.getDate()
  const utc = new Date(Date.UTC(year, month - 1, day))
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' }).format(utc)
  const monthName = MONTHS[month - 1]
  const dd = String(day).padStart(2, '0')
  const mm = String(month).padStart(2, '0')
  return {
    weekday,
    monthName,
    longDate: `${weekday} ${day} ${monthName} ${year}`,
    numericDate: `${dd} · ${mm} · ${year}`,
    shortDate: `${dd}·${mm}·${String(year).slice(-2)}`,
    words: [dayToWords(day), monthName, yearToWords(year)],
  }
}

function initial(name) {
  return (Array.from(name.trim())[0] || '').toUpperCase()
}

// Words are split in React (not via innerHTML) so StrictMode re-mounts and
// reconciliation never see a DOM that GSAP rewrote behind React's back.
function SplitWords({ text }) {
  const words = text.split(' ')
  return words.map((w, i) => (
    <Fragment key={`${w}-${i}`}>
      <span className="inline-block overflow-hidden pb-[0.08em]">
        <span className="word inline-block">{w}</span>
      </span>
      {i < words.length - 1 ? ' ' : null}
    </Fragment>
  ))
}

const STYLES = `
.theme-artdeco a:focus-visible,
.theme-artdeco button:focus-visible,
.theme-artdeco input:focus-visible,
.theme-artdeco select:focus-visible,
.theme-artdeco textarea:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}
.theme-artdeco .ad-field {
  min-height: 2.75rem;
  width: 100%;
  min-width: 0;
  background: oklch(0.16 0.05 190 / 0.7);
  padding: 0.75rem 1rem;
  color: var(--color-foreground);
}
.theme-artdeco .ad-field::placeholder { color: oklch(0.82 0.035 92 / 0.7); }
.theme-artdeco .ad-field:focus { background: oklch(0.81 0.12 82 / 0.08); }
.theme-artdeco select.ad-field { background: var(--color-card); }
@media (prefers-reduced-motion: reduce) {
  .theme-artdeco .animate-pulse { animation: none; }
}
`

function getGallery(coupleAlt) {
  return [
    { src: decoCouple, alt: coupleAlt },
    { src: decoFeather, alt: 'Gold peacock feather illustration' },
    { src: decoHero, alt: 'Gilded palm-leaf art deco frame' },
    { src: decoFrame, alt: 'Gold art deco sunburst frame' },
    { src: decoFeather, alt: 'Gold peacock feather illustration' },
    { src: decoCouple, alt: coupleAlt },
    { src: decoFrame, alt: 'Gold art deco sunburst frame' },
    { src: decoHero, alt: 'Gilded palm-leaf art deco frame' },
  ]
}

// Name split into animatable letters; works for any name (spaces kept visible).
function HeroLetters({ name, prefix }) {
  return Array.from(name).map((c, i) => (
    <span key={`${prefix}${i}`} className="hero-letter inline-block">
      {c === ' ' ? ' ' : c}
    </span>
  ))
}

function getCountdown(targetDate, now) {
  const targetMs = Number.isFinite(targetDate.getTime()) ? targetDate.getTime() : now
  const totalSeconds = Math.max(0, Math.floor((targetMs - now) / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

export default function MedDreamSparkArtDecoTemplatePage() {
  const root = useRef(null)
  const jewelCanvas = useRef(null)
  const {
    loading: cardLoading,
    error: cardError,
    card,
    partner1,
    partner2,
    eventDate: targetDate,
    eventDateValue,
    dateLabel,
    venue,
    city,
    address,
    rsvpDeadline,
  } = useWeddingCardFields(DEFAULTS)
  const { weekday, longDate, numericDate, shortDate, words: dateWords } = getEventParts(eventDateValue, targetDate)
  // An explicit dateLabel from the card wins; otherwise use the venue-local long date.
  const displayDate = card?.details?.dateLabel ? dateLabel : longDate
  const couple = `${partner1} & ${partner2}`
  const coupleAlt = `${partner1} and ${partner2}`
  const gallery = getGallery(coupleAlt)
  const mapQuery = encodeURIComponent([venue, address, city].filter(Boolean).join(', '))

  // Only the clock ticks; the countdown itself is derived so a new target date applies at once.
  const [now, setNow] = useState(() => Date.now())
  const time = getCountdown(targetDate, now)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const rootEl = root.current
    if (!rootEl) return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cleanups = []

    // Content must always end visible: with reduced motion nothing is tweened at all.
    if (reduceMotion) return undefined

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768
      // clamp() keeps the start inside the scrollable range, so sections near the
      // page end still fire; once:true means a reveal never reverses back to hidden.
      // toggleActions also plays on leave: a fast scroll can jump past the whole trigger in one frame.
      const reveal = (trigger, start = 'top 86%') => ({ trigger, start: `clamp(${start})`, once: true, toggleActions: 'play play none none' })

      // Hero entrance starts right away (the shared envelope intro runs before mount).
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-arch', { scale: 0.86, opacity: 0, duration: 1.4 }, 0)
        .from('.hero-frame-line', { scaleX: 0, transformOrigin: 'center', duration: 1.3, stagger: 0.08, ease: 'expo.out' }, 0.15)
        .from('.hero-letter', { yPercent: 120, opacity: 0, stagger: 0.05, duration: 1.1 }, 0.1)
        .from('.hero-sub', { opacity: 0, y: 20, duration: 0.9, ease: 'power2.out' }, 0.55)

      gsap.utils.toArray('.parallax-leaf').forEach((el, i) => {
        gsap.to(el, {
          yPercent: (i % 2 === 0 ? -1 : 1) * (isMobile ? 10 : 20),
          rotate: (i % 2 === 0 ? -1 : 1) * (isMobile ? 4 : 9),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.6 },
        })
      })

      gsap.utils.toArray('.reveal-words').forEach((el) => {
        gsap.from(el.querySelectorAll('.word'), {
          yPercent: 105,
          duration: 0.9,
          stagger: isMobile ? 0.025 : 0.045,
          ease: 'power4.out',
          scrollTrigger: reveal(el),
        })
      })

      gsap.from('.ad-count-cell', {
        y: isMobile ? 22 : 36,
        scale: 0.94,
        opacity: 0,
        duration: 0.72,
        stagger: 0.075,
        ease: 'power3.out',
        scrollTrigger: reveal('.ad-count-section', 'top 80%'),
      })

      gsap
        .timeline({ scrollTrigger: reveal('.ad-story-section', 'top 78%') })
        .from('.ad-story-photo', { clipPath: 'inset(0 100% 0 0)', duration: 1.05, ease: 'power4.inOut' })
        .from('.ad-story-photo img', { scale: 1.12, duration: 1.2, ease: 'power3.out' }, '<0.12')
        .from(
          '.ad-story-copy > :not(.reveal-words)',
          { x: isMobile ? 0 : 28, y: isMobile ? 20 : 0, opacity: 0, duration: 0.7, stagger: 0.075, ease: 'power3.out' },
          '-=0.58',
        )

      gsap.from('.ad-detail-card', {
        y: (index) => (isMobile ? 28 : index % 2 === 0 ? 46 : 24),
        scale: 0.96,
        opacity: 0,
        duration: 0.82,
        stagger: 0.11,
        ease: 'power3.out',
        scrollTrigger: reveal('.ad-details-grid', 'top 82%'),
      })

      gsap
        .timeline({ scrollTrigger: reveal('.ad-gallery-grid', 'top 82%') })
        .from('.ad-gallery-tile', {
          clipPath: 'inset(100% 0 0 0)',
          y: 20,
          opacity: 0.3,
          duration: 0.86,
          stagger: { each: 0.055, from: 'center' },
          ease: 'power3.inOut',
        })
        .from('.ad-gallery-tile img', { scale: 1.14, duration: 1.05, stagger: { each: 0.04, from: 'center' }, ease: 'power3.out' }, '<0.08')

      gsap
        .timeline({ scrollTrigger: reveal('.ad-venue-section', 'top 80%') })
        .from('.ad-map-panel', { clipPath: 'inset(12% 12% 12% 12%)', scale: 0.96, opacity: 0, duration: 0.95, ease: 'power3.out' })
        .from(
          '.ad-venue-copy > *',
          { x: isMobile ? 0 : 28, y: isMobile ? 18 : 0, opacity: 0, duration: 0.68, stagger: 0.07, ease: 'power3.out' },
          '-=0.55',
        )

      gsap
        .timeline({ scrollTrigger: reveal('.ad-rsvp-section', 'top 80%') })
        .from('.ad-rsvp-shell', { clipPath: 'inset(0 48% 0 48%)', opacity: 0, duration: 1.05, ease: 'power4.inOut' })
        .from('.ad-rsvp-form > *', { y: 18, opacity: 0, duration: 0.6, stagger: 0.055, ease: 'power3.out' }, '-=0.38')

      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
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
      }

      // Infinite loops only run while their section is on screen.
      const loopWhileVisible = (selector, trigger, vars) => {
        const tween = gsap.to(selector, { ...vars, ease: 'none', repeat: -1, paused: true })
        ScrollTrigger.create({
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
        })
      }
      loopWhileVisible('.marquee-track', '.ad-marquee', { xPercent: -50, duration: 30 })
      loopWhileVisible('.rotate-slow', '.ad-count-section', { rotation: 360, duration: 40 })
    }, rootEl)

    // Late-loading images / fonts shift layout; keep trigger positions accurate.
    let refreshTimer = 0
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200)
    }
    scheduleRefresh()
    const ro = new ResizeObserver(scheduleRefresh)
    ro.observe(rootEl)
    window.addEventListener('load', scheduleRefresh)

    return () => {
      window.clearTimeout(refreshTimer)
      ro.disconnect()
      window.removeEventListener('load', scheduleRefresh)
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const host = jewelCanvas.current
    if (!host) return undefined

    // The canvas is created per effect run and removed on cleanup, so a StrictMode
    // double-mount can never leave two canvases (or reuse a disposed context).
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    canvas.setAttribute('aria-hidden', 'true')
    host.replaceChildren(canvas)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      canvas.remove()
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.18

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0.15, 9.2)

    const group = new THREE.Group()
    scene.add(group)

    const portal = new THREE.Group()
    const halo = new THREE.Group()
    const ornaments = new THREE.Group()
    group.add(halo, portal, ornaments)

    const gold = new THREE.MeshPhysicalMaterial({
      color: 0xd8a847,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
    })
    const champagne = new THREE.MeshPhysicalMaterial({
      color: 0xf1d992,
      metalness: 0.72,
      roughness: 0.16,
      transparent: true,
      opacity: 0.94,
    })
    const onyx = new THREE.MeshPhysicalMaterial({
      color: 0x041b18,
      metalness: 0.42,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    })
    const emeraldTable = new THREE.MeshPhysicalMaterial({
      color: 0x159276,
      emissive: 0x063b31,
      emissiveIntensity: 0.5,
      metalness: 0.04,
      roughness: 0.07,
      transmission: 0.34,
      thickness: 1.5,
      ior: 2.15,
      attenuationColor: new THREE.Color(0x08705b),
      attenuationDistance: 1.25,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      side: THREE.DoubleSide,
    })
    const emeraldLight = new THREE.MeshPhysicalMaterial({
      color: 0x36b698,
      emissive: 0x0b493c,
      emissiveIntensity: 0.38,
      metalness: 0.04,
      roughness: 0.1,
      transmission: 0.22,
      thickness: 1.2,
      ior: 2.05,
      clearcoat: 1,
      side: THREE.DoubleSide,
    })
    const emeraldMid = emeraldLight.clone()
    emeraldMid.color.setHex(0x08715d)
    emeraldMid.emissive.setHex(0x032d26)
    const emeraldDark = emeraldLight.clone()
    emeraldDark.color.setHex(0x023d34)
    emeraldDark.emissive.setHex(0x011b17)
    emeraldDark.transmission = 0.12
    const emeraldEdge = new THREE.MeshPhysicalMaterial({
      color: 0x063b32,
      emissive: 0x021c18,
      emissiveIntensity: 0.3,
      metalness: 0.16,
      roughness: 0.14,
      clearcoat: 1,
      side: THREE.DoubleSide,
    })

    const makeDecoShape = (scale = 1) => {
      const shape = new THREE.Shape()
      shape.moveTo(0, 1.75 * scale)
      shape.lineTo(0.78 * scale, 1.08 * scale)
      shape.lineTo(0.96 * scale, 0.42 * scale)
      shape.lineTo(0.96 * scale, -1.08 * scale)
      shape.lineTo(0.58 * scale, -1.62 * scale)
      shape.lineTo(0, -1.82 * scale)
      shape.lineTo(-0.58 * scale, -1.62 * scale)
      shape.lineTo(-0.96 * scale, -1.08 * scale)
      shape.lineTo(-0.96 * scale, 0.42 * scale)
      shape.lineTo(-0.78 * scale, 1.08 * scale)
      shape.closePath()
      return shape
    }

    const outerFrame = new THREE.Mesh(
      new THREE.ExtrudeGeometry(makeDecoShape(1), {
        depth: 0.34,
        bevelEnabled: true,
        bevelSegments: 4,
        bevelSize: 0.09,
        bevelThickness: 0.08,
      }),
      gold,
    )
    outerFrame.geometry.center()
    portal.add(outerFrame)

    const innerStone = new THREE.Mesh(
      new THREE.ExtrudeGeometry(makeDecoShape(0.82), {
        depth: 0.42,
        bevelEnabled: true,
        bevelSegments: 5,
        bevelSize: 0.12,
        bevelThickness: 0.1,
      }),
      onyx,
    )
    innerStone.geometry.center()
    innerStone.position.z = 0.18
    portal.add(innerStone)

    const crystal = new THREE.Group()
    crystal.position.z = 0.52
    portal.add(crystal)

    const outerPoints = [
      [-0.58, 1.38], [0.58, 1.38], [0.88, 1.08], [0.88, -1.08],
      [0.58, -1.38], [-0.58, -1.38], [-0.88, -1.08], [-0.88, 1.08],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0))
    const tablePoints = outerPoints.map((point) => new THREE.Vector3(point.x * 0.57, point.y * 0.62, 0.64))
    const outerFront = outerPoints.map((point) => new THREE.Vector3(point.x, point.y, 0.22))
    const outerBack = outerPoints.map((point) => new THREE.Vector3(point.x, point.y, 0.04))

    const makeFacet = (vertices, material) => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]), 3))
      geometry.computeVertexNormals()
      const facet = new THREE.Mesh(geometry, material)
      crystal.add(facet)
      return facet
    }

    const tableCenter = new THREE.Vector3(0, 0, 0.665)
    tablePoints.forEach((point, index) => {
      const next = tablePoints[(index + 1) % tablePoints.length]
      makeFacet([tableCenter, point, next], emeraldTable)
    })

    const crownMaterials = [emeraldLight, emeraldMid, emeraldDark, emeraldMid, emeraldLight, emeraldDark, emeraldMid, emeraldDark]
    outerFront.forEach((point, index) => {
      const nextIndex = (index + 1) % outerFront.length
      makeFacet(
        [point, outerFront[nextIndex], tablePoints[nextIndex], point, tablePoints[nextIndex], tablePoints[index]],
        crownMaterials[index],
      )
    })

    outerFront.forEach((point, index) => {
      const nextIndex = (index + 1) % outerFront.length
      makeFacet(
        [point, outerBack[nextIndex], outerFront[nextIndex], point, outerBack[index], outerBack[nextIndex]],
        index % 2 === 0 ? emeraldEdge : emeraldDark,
      )
    })

    const pavilionTip = new THREE.Vector3(0, 0, -0.72)
    outerBack.forEach((point, index) => {
      const next = outerBack[(index + 1) % outerBack.length]
      makeFacet([point, pavilionTip, next], index % 3 === 0 ? emeraldLight : index % 2 === 0 ? emeraldMid : emeraldDark)
    })

    const facetLines = []
    const addLoopLines = (points) => {
      points.forEach((point, index) => {
        const next = points[(index + 1) % points.length]
        facetLines.push(point.x, point.y, point.z + 0.012, next.x, next.y, next.z + 0.012)
      })
    }
    addLoopLines(tablePoints)
    addLoopLines(outerFront)
    tablePoints.forEach((point, index) => {
      const outer = outerFront[index]
      facetLines.push(point.x, point.y, point.z + 0.012, outer.x, outer.y, outer.z + 0.012)
    })
    const facetLineGeometry = new THREE.BufferGeometry()
    facetLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facetLines, 3))
    const facetLineMesh = new THREE.LineSegments(
      facetLineGeometry,
      new THREE.LineBasicMaterial({ color: 0x9ce7cf, transparent: true, opacity: 0.28 }),
    )
    crystal.add(facetLineMesh)

    const lightSweep = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 2.15),
      new THREE.MeshBasicMaterial({
        color: 0xe8fff7,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    )
    lightSweep.position.set(-0.18, 0.06, 0.69)
    lightSweep.rotation.z = -0.32
    crystal.add(lightSweep)

    const archRings = [
      { radius: 1.65, tube: 0.035, z: -0.08, arc: Math.PI * 1.38 },
      { radius: 2.02, tube: 0.026, z: -0.15, arc: Math.PI * 1.24 },
      { radius: 2.38, tube: 0.02, z: -0.22, arc: Math.PI * 1.1 },
    ]
    archRings.forEach((ring, index) => {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(ring.radius, ring.tube, 10, 100, ring.arc), index === 1 ? champagne : gold)
      arc.rotation.z = Math.PI + (Math.PI * 2 - ring.arc) / 2
      arc.position.z = ring.z
      halo.add(arc)

      const lowerArc = arc.clone()
      lowerArc.rotation.z += Math.PI
      lowerArc.scale.setScalar(index === 2 ? 0.92 : 1)
      halo.add(lowerArc)
    })

    for (const side of [-1, 1]) {
      for (let i = 0; i < 6; i += 1) {
        const length = 0.72 + i * 0.13
        const wing = new THREE.Mesh(new THREE.BoxGeometry(length, 0.035, 0.055), i % 2 === 0 ? gold : champagne)
        wing.position.set(side * (1.12 + length / 2), 0.76 - i * 0.29, -0.04 - i * 0.015)
        wing.rotation.z = side * (0.12 + i * 0.035)
        portal.add(wing)
      }
    }

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2 + Math.PI / 12
      const radius = i % 2 === 0 ? 2.72 : 2.52
      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(i % 3 === 0 ? 0.12 : 0.075, 0), i % 2 === 0 ? champagne : gold)
      diamond.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -0.1 + (i % 3) * 0.08)
      diamond.rotation.z = angle
      ornaments.add(diamond)
    }

    const finialTop = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.82, 4), gold)
    finialTop.position.set(0, 2.48, 0.02)
    finialTop.rotation.z = Math.PI / 4
    portal.add(finialTop)
    const finialBottom = finialTop.clone()
    finialBottom.position.y = -2.48
    finialBottom.rotation.z += Math.PI
    portal.add(finialBottom)

    const ambient = new THREE.AmbientLight(0xf8e6b2, 0.9)
    scene.add(ambient)
    const key = new THREE.DirectionalLight(0xffdb84, 3.2)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0x6ce2cf, 2.1, 14)
    rim.position.set(-3, -1.5, 4)
    scene.add(rim)
    const front = new THREE.PointLight(0xffecc0, 1.6, 10)
    front.position.set(0, 0, 5)
    scene.add(front)

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event) => {
      const rect = host.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    let elapsed = 0
    const draw = () => {
      group.rotation.y += ((pointer.x * 0.18) - group.rotation.y) * 0.035
      group.rotation.x += ((pointer.y * 0.09) - group.rotation.x) * 0.035
      portal.position.y = Math.sin(elapsed * 0.65) * 0.055
      crystal.rotation.y = Math.sin(elapsed * 0.38) * 0.42
      crystal.rotation.x = Math.sin(elapsed * 0.24) * 0.035
      lightSweep.position.x = Math.sin(elapsed * 0.72) * 0.34
      lightSweep.material.opacity = 0.18 + (Math.sin(elapsed * 1.1) + 1) * 0.08
      halo.rotation.z = Math.sin(elapsed * 0.22) * 0.035
      ornaments.rotation.z = -elapsed * 0.035
      ornaments.children.forEach((diamond, index) => {
        diamond.rotation.x = elapsed * (0.25 + index * 0.012)
        diamond.rotation.y = elapsed * (0.18 + index * 0.009)
      })
      renderer.render(scene, camera)
    }

    // RAF loop runs only while the gem is on screen, the tab is visible and motion is allowed.
    let frameId = 0
    let running = false
    let onScreen = true
    let last = 0
    const tick = (now) => {
      elapsed += Math.min(0.1, (now - last) / 1000)
      last = now
      draw()
      frameId = window.requestAnimationFrame(tick)
    }
    const updateLoop = () => {
      const shouldRun = !reduceMotion && onScreen && !document.hidden
      if (shouldRun && !running) {
        running = true
        last = window.performance.now()
        frameId = window.requestAnimationFrame(tick)
      } else if (!shouldRun && running) {
        running = false
        window.cancelAnimationFrame(frameId)
      }
    }

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      if (!running) draw()
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      updateLoop()
    })
    io.observe(host)
    document.addEventListener('visibilitychange', updateLoop)
    updateLoop()

    return () => {
      running = false
      window.cancelAnimationFrame(frameId)
      io.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', updateLoop)
      window.removeEventListener('pointermove', onPointerMove)
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }, [])

  return (
    <div ref={root} className="theme-artdeco relative min-h-screen overflow-x-clip text-foreground">
      <style>{STYLES}</style>

      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[oklch(0.15_0.045_185/0.72)] border-b border-primary/20">
        <div className="container-x flex items-center justify-between py-1.5">
          <a href="#top" className="inline-flex min-h-11 items-center font-display text-lg tracking-[0.3em] gold-text" aria-label={`${coupleAlt} — back to top`}>
            {initial(partner1)} &amp; {initial(partner2)}
          </a>
          <nav aria-label="Sections" className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {[
              ['#story', 'Story'],
              ['#details', 'Details'],
              ['#gallery', 'Gallery'],
              ['#rsvp', 'RSVP'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center px-1 hover:text-primary transition-colors">
                {label}
              </a>
            ))}
          </nav>
          <a
            href="#rsvp"
            className="inline-flex min-h-11 items-center text-[11px] uppercase tracking-[0.3em] gold-border px-4 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            RSVP
          </a>
        </div>
      </header>

      <main>
        <section id="top" className="relative min-h-[100svh] flex items-center justify-center px-4 pt-20 pb-32 overflow-hidden">
          <img src={decoHero} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-20" width={1280} height={1600} />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,oklch(0.34_0.08_80/0.36),transparent_32%),linear-gradient(180deg,oklch(0.12_0.04_205/0.92),oklch(0.16_0.05_172/0.72)_42%,oklch(0.09_0.025_220)_100%)]" />
          <div aria-hidden="true" className="hero-arch absolute inset-x-5 top-24 bottom-16 md:inset-x-[12vw] border border-primary/35" />
          <div aria-hidden="true" className="hero-frame-line absolute left-1/2 top-28 h-px w-[72vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div aria-hidden="true" className="hero-frame-line absolute left-1/2 bottom-20 h-px w-[64vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div
            ref={jewelCanvas}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[47%] z-[1] h-[min(560px,78svh)] w-[min(94vw,680px)] -translate-x-1/2 -translate-y-1/2 opacity-80 mix-blend-screen"
          />

          <img
            src={decoLeaf}
            alt=""
            aria-hidden="true"
            className="parallax-leaf absolute -left-12 top-32 w-40 md:w-64 opacity-50"
            width={768}
            height={1024}
          />
          <img
            src={decoLeaf}
            alt=""
            aria-hidden="true"
            className="parallax-leaf absolute -right-12 bottom-32 w-40 md:w-64 opacity-50 scale-x-[-1]"
            width={768}
            height={1024}
          />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className="hero-sub mb-6 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.5em] text-primary">
              <span aria-hidden="true" className="h-px w-10 bg-primary" />
              Save the date
              <span aria-hidden="true" className="h-px w-10 bg-primary" />
            </div>

            <h1 aria-label={couple} className="deco-hero-title font-display text-[clamp(3.5rem,18vw,9rem)] leading-[0.95] font-light">
              <span aria-hidden="true" className="block overflow-hidden">
                <HeroLetters name={partner1} prefix="a" />
              </span>
              <span aria-hidden="true" className="block overflow-hidden">
                <span className="hero-letter inline-block font-script text-primary text-[clamp(3rem,14vw,7rem)] italic">
                  &amp;
                </span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden">
                <HeroLetters name={partner2} prefix="b" />
              </span>
            </h1>

            <p className="hero-sub mt-8 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <span>{dateWords[0]}</span>
              <span aria-hidden="true" className="text-primary">◆</span>
              <span>{dateWords[1]}</span>
              <span aria-hidden="true" className="text-primary">◆</span>
              <span>{dateWords[2]}</span>
            </p>

            <p className="hero-sub mt-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">{weekday} · {venue} · {city}</p>
          </div>

          <div aria-hidden="true" className="absolute bottom-8 left-1/2 -translate-x-1/2 hero-sub">
            <div className="h-12 w-px bg-primary/40 animate-pulse" />
          </div>
        </section>

        <div aria-hidden="true" className="ad-marquee border-y border-primary/20 py-5 overflow-hidden bg-[oklch(0.10_0.035_205)]">
          <div className="marquee-track flex w-max gap-12 whitespace-nowrap font-display text-2xl md:text-3xl italic text-primary">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12 shrink-0">
                <span>Forever begins</span>
                <span>◆</span>
                <span>{numericDate}</span>
                <span>◆</span>
                <span>{venue}</span>
                <span>◆</span>
                <span>{city}</span>
                <span>◆</span>
              </div>
            ))}
          </div>
        </div>

        <section className="ad-count-section container-x py-20 md:py-32 text-center relative overflow-hidden">
          <img
            src={decoLeaf}
            alt=""
            aria-hidden="true"
            className="rotate-slow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,140vw)] max-w-none opacity-[0.04]"
            loading="lazy"
          />
          <div className="relative">
            <div className="deco-divider justify-center text-xs uppercase tracking-[0.4em] mb-4">
              <span aria-hidden="true" className="h-px w-12 bg-primary" />
              Counting moments
              <span aria-hidden="true" className="h-px w-12 bg-primary" />
            </div>
            <h2 className="reveal-words font-display text-4xl md:text-6xl text-balance">
              <SplitWords text="Until we say" />{' '}
              <span className="inline-block overflow-hidden pb-[0.08em]">
                <em className="word inline-block font-script text-primary text-5xl md:text-7xl">&quot;I do&quot;</em>
              </span>
            </h2>

            <div
              role="timer"
              aria-label={`Countdown to ${displayDate}`}
              className="mt-12 grid grid-cols-4 gap-2 md:gap-6 max-w-2xl mx-auto"
            >
              {[
                { v: time.days, l: 'Days' },
                { v: time.hours, l: 'Hours' },
                { v: time.minutes, l: 'Minutes' },
                { v: time.seconds, l: 'Seconds' },
              ].map((t) => (
                <div key={t.l} className="ad-count-cell deco-card gold-border bg-card/70 backdrop-blur min-w-0 px-1.5 py-3 md:p-6">
                  <div className="font-display text-[clamp(1.4rem,7vw,3rem)] leading-tight gold-text tabular-nums">
                    {String(t.v).padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.1em] sm:tracking-[0.3em] text-muted-foreground">
                    {t.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="ad-story-section container-x py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="ad-story-photo deco-panel relative">
            <div aria-hidden="true" className="absolute -inset-4 gold-border opacity-50" />
            <img
              src={decoCouple}
              alt={coupleAlt}
              className="relative w-full aspect-[4/5] object-cover"
              loading="lazy"
              width={1024}
              height={1280}
            />
          </div>
          <div className="ad-story-copy">
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Our Story</div>
            <h2 className="reveal-words font-display text-4xl md:text-5xl mb-6">
              <SplitWords text="A chance meeting in a Paris café" />
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              It began on a rainy afternoon in 2019 — a borrowed umbrella, a cup of espresso, and a conversation that lasted
              seven hours. Seven years, three cities, and countless adventures later, we&apos;re ready to write the next
              chapter together.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We&apos;d love nothing more than to celebrate this moment surrounded by the people who shaped us. Will you join
              us?
            </p>
            <a
              href="#rsvp"
              className="magnetic inline-flex min-h-11 items-center gold-border px-8 py-4 text-xs uppercase tracking-[0.4em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Reply by {rsvpDeadline}
            </a>
          </div>
        </section>

        <section id="details" className="ad-details-section relative py-20 md:py-32">
          <img src={decoFrame} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-12 mix-blend-screen" loading="lazy" />
          <div className="container-x relative">
            <div className="text-center mb-16">
              <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">The Details · {displayDate}</div>
              <h2 className="reveal-words font-display text-4xl md:text-6xl">
                <SplitWords text="An evening of glamour" />
              </h2>
            </div>

            <div className="ad-details-grid grid md:grid-cols-3 gap-6">
              {[
                {
                  time: '16:00',
                  title: 'Ceremony',
                  place: `${venue} · Gardens`,
                  desc: 'Vows beneath the cypress trees as the afternoon light turns gold.',
                },
                {
                  time: '18:30',
                  title: 'Reception',
                  place: `${venue} · Salone`,
                  desc: 'Champagne, oysters, and the music of a string quartet on the terrace.',
                },
                {
                  time: '21:00',
                  title: 'Dancing',
                  place: `${venue} · Ballroom`,
                  desc: 'Black tie. A live jazz orchestra until the small hours of the morning.',
                },
              ].map((d) => (
                <div
                  key={d.title}
                  className="ad-detail-card deco-card group relative gold-border bg-card/75 backdrop-blur p-6 md:p-8 text-center hover:bg-primary/8 transition-colors"
                >
                  <div className="font-display text-5xl gold-text mb-2">{d.time}</div>
                  <div aria-hidden="true" className="h-px w-12 bg-primary mx-auto my-4" />
                  <h3 className="font-display text-2xl mb-1">{d.title}</h3>
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
            <h2 className="reveal-words font-display text-4xl md:text-6xl">
              <SplitWords text="From us to you" />
            </h2>
          </div>

          <div className="ad-gallery-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {gallery.map((item, i) => (
              <div key={i} className="ad-gallery-tile deco-card overflow-hidden aspect-[3/4] gold-border">
                <img src={item.src} alt={item.alt} className="gallery-img h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>

        <section className="ad-venue-section container-x py-20 md:py-32 grid md:grid-cols-2 gap-8 items-stretch">
          <div className="ad-map-panel deco-panel gold-border overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[22rem]">
            <iframe
              title={`Map of ${venue}, ${city}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="block w-full h-full border-0 grayscale contrast-125 invert-[0.85] hue-rotate-[60deg]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="ad-venue-copy flex flex-col justify-center">
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">The Venue</div>
            <h2 className="font-display text-4xl md:text-5xl mb-6">{venue}</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              {address}
              <br />
              {city}
            </p>
            <p className="text-sm text-muted-foreground/85 italic mb-6">
              Perched atop the Janiculum Hill, with sweeping views over the Eternal City.
            </p>
            <a
              href={`https://maps.google.com/?q=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
              className="magnetic self-start inline-flex min-h-11 items-center gold-border px-6 py-3 text-xs uppercase tracking-[0.4em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Open in Maps<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>

        <section id="rsvp" className="ad-rsvp-section relative py-20 md:py-32">
          <img src={decoHero} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-14" loading="lazy" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.10_0.035_205),oklch(0.15_0.052_188/0.94),oklch(0.08_0.028_220))]" />

          <div className="ad-rsvp-shell container-x relative max-w-xl text-center">
            <img src={decoLeaf} alt="" aria-hidden="true" className="mx-auto w-24 opacity-70 mb-6" loading="lazy" />
            <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Kindly Reply</div>
            <h2 className="reveal-words font-display text-4xl md:text-6xl mb-3">
              <SplitWords text="Will you join us?" />
            </h2>
            <p className="font-script text-3xl md:text-4xl text-primary mb-10">by {deadlinePhrase(rsvpDeadline)}</p>

            {sent ? (
              <div role="status" className="ad-rsvp-form gold-border px-6 py-10 text-center">
                <div className="font-script text-4xl gold-text mb-2">Merci!</div>
                <p className="text-sm text-muted-foreground">Your reply has been noted. We can&apos;t wait to celebrate with you.</p>
              </div>
            ) : (
              <form
                className="ad-rsvp-form space-y-4 text-left"
                onSubmit={(e) => {
                  e.preventDefault()
                  setSent(true)
                }}
              >
                <div>
                  <label htmlFor="ad-name" className="sr-only">Your full name</label>
                  <input id="ad-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required className="ad-field gold-border" />
                </div>
                <div>
                  <label htmlFor="ad-email" className="sr-only">Email address</label>
                  <input id="ad-email" name="email" type="email" autoComplete="email" placeholder="Email address" required className="ad-field gold-border" />
                </div>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label htmlFor="ad-attending" className="sr-only">Attendance</label>
                    <select id="ad-attending" name="attending" className="ad-field gold-border">
                      <option>Joyfully accepts</option>
                      <option>Regretfully declines</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="ad-guests" className="sr-only">Number of guests</label>
                    <select id="ad-guests" name="guests" className="ad-field gold-border">
                      <option>1 guest</option>
                      <option>2 guests</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="ad-note" className="sr-only">A note to the couple</label>
                  <textarea id="ad-note" name="note" placeholder="A note to the couple…" rows={3} className="ad-field gold-border" />
                </div>
                <button
                  type="submit"
                  className="magnetic w-full min-h-11 bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.4em] hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Send reply
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-primary/20 pt-12 pb-24 md:pb-12 text-center">
        <div className="font-script text-5xl gold-text mb-3">
          {partner1} &amp; {partner2}
        </div>
        <div className="text-xs uppercase tracking-[0.5em] text-muted-foreground">
          {numericDate} · {city}
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[oklch(0.14_0.03_165/0.95)] backdrop-blur border-t border-primary/30 px-4 py-2 flex items-center justify-between pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          {shortDate} · {city}
        </div>
        <a href="#rsvp" className="inline-flex min-h-11 items-center bg-primary text-primary-foreground px-5 text-[11px] uppercase tracking-[0.4em]">
          RSVP
        </a>
      </div>

      {(cardLoading || cardError) && (
        <div
          role="status"
          className={`fixed left-4 top-20 z-50 border px-3 py-2 text-[10px] uppercase tracking-[0.18em] backdrop-blur ${cardError ? 'border-red-400/40 bg-red-950/80 text-red-100' : 'border-primary/30 bg-[oklch(0.12_0.04_205/0.82)] text-primary'}`}
        >
          {cardError ? 'Invitation data could not be loaded' : 'Loading invitation data'}
        </div>
      )}
    </div>
  )
}
