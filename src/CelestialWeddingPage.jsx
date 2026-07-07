import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { Body, GeoMoon, HelioDistance, Illumination, KM_PER_AU, MoonPhase } from 'astronomy-engine'

gsap.registerPlugin(ScrollTrigger)

const EVENT_DATE = new Date('2026-09-12T17:30:00-07:00')

const schedule = [
  {
    phase: 10,
    time: '4:30 in the afternoon',
    title: 'Arrival & Stardust',
    body: 'Find your seat as the sun begins to set over the vineyard. Sparkling wine awaits.',
  },
  {
    phase: 35,
    time: '5:30 in the evening',
    title: 'The Ceremony',
    body: 'We exchange our vows beneath the old oak as the first stars appear.',
  },
  {
    phase: 60,
    time: '6:30 in the evening',
    title: 'Cocktails & Constellations',
    body: 'Golden-hour drinks, canapes and a little stargazing on the terrace.',
  },
  {
    phase: 82,
    time: '8:00 in the evening',
    title: 'Dinner Beneath the Stars',
    body: 'A long-table feast under a canopy of lights and open sky.',
  },
  {
    phase: 100,
    time: '10:00 till late',
    title: 'Dancing & Moonlight',
    body: 'The band plays, the floor opens, and we celebrate until the moon is high.',
  },
]

const venueDetails = [
  {
    key: 'Ceremony',
    value: 'Open-air, on the East Lawn beneath the old oak. Arrive by 5:00pm.',
  },
  {
    key: 'Parking',
    value: 'Complimentary valet at the main gate, plus a shuttle from The Stellar Hotel.',
  },
  {
    key: 'Stay',
    value: 'Room block held under "Aurora & Elias" until 1 August 2026.',
  },
]

const gallery = [
  'First rooftop evening',
  'Late-night city walk',
  'Autumn proposal',
  'Vineyard weekend',
  'Moonlit dinner',
  'Favorite memory',
]

const skyStars = [
  { name: 'Vega', x: 18, y: 22, size: 5 },
  { name: 'Deneb', x: 42, y: 13, size: 3 },
  { name: 'Altair', x: 62, y: 34, size: 4 },
  { name: 'Spica', x: 72, y: 68, size: 3 },
  { name: 'Arcturus', x: 28, y: 64, size: 4 },
]

function formatEventDate(date, options) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    ...options,
  }).format(date)
}

function getMoonPhaseName(angle) {
  if (angle < 7 || angle >= 353) return 'New moon'
  if (angle < 83) return 'Waxing crescent'
  if (angle < 97) return 'First quarter'
  if (angle < 173) return 'Waxing gibbous'
  if (angle < 187) return 'Full moon'
  if (angle < 263) return 'Waning gibbous'
  if (angle < 277) return 'Last quarter'
  return 'Waning crescent'
}

function getSkySnapshot(date) {
  const moonAngle = MoonPhase(date)
  const moonIllumination = Illumination(Body.Moon, date).phase_fraction * 100
  const moonDistanceKm = GeoMoon(date).Length() * KM_PER_AU
  const mercuryDistanceAu = HelioDistance(Body.Mercury, date)

  return [
    {
      label: 'Moon phase',
      value: getMoonPhaseName(moonAngle),
      meta: `About ${moonIllumination.toFixed(1)}% illuminated`,
    },
    {
      label: 'Moon distance',
      value: `${Math.round(moonDistanceKm / 1000).toLocaleString('en-US')},000 km`,
      meta: 'Earth to Moon on this date',
    },
    {
      label: 'Mercury',
      value: `${mercuryDistanceAu.toFixed(2)} AU`,
      meta: 'Distance from the Sun',
    },
    {
      label: 'Best direction',
      value: 'West after sunset',
      meta: 'Slim crescent near the evening horizon',
    },
  ]
}

function getCountdownParts() {
  let diff = Math.max(0, EVENT_DATE.getTime() - Date.now())
  const days = Math.floor(diff / 864e5)
  diff -= days * 864e5
  const hours = Math.floor(diff / 36e5)
  diff -= hours * 36e5
  const minutes = Math.floor(diff / 6e4)
  diff -= minutes * 6e4
  const seconds = Math.floor(diff / 1e3)

  return [
    { label: 'Days', value: String(days).padStart(3, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Minutes', value: String(minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(seconds).padStart(2, '0') },
  ]
}

function Divider({ mark = 'moon' }) {
  return (
    <div className="cw-divider" aria-hidden="true">
      <span className="cw-bar" />
      <svg viewBox="0 0 28 28" className="cw-divider-mark">
        {mark === 'moon' ? (
          <path d="M18.7 23.6a10.2 10.2 0 0 1-9.8-16.8 9 9 0 1 0 12.3 12.3 10 10 0 0 1-2.5 4.5Z" />
        ) : (
          <path d="M14 2.8 16.8 11 25 14l-8.2 2.8L14 25l-2.8-8.2L3 14l8.2-3Z" />
        )}
      </svg>
      <span className="cw-bar right" />
    </div>
  )
}

function PhotoSlot({ label, className = '' }) {
  return (
    <div className={`cw-photo-slot ${className}`}>
      <div className="cw-photo-orbit" />
      <span>{label}</span>
    </div>
  )
}

function disposeObject3D(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose()
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
}

export default function CelestialWeddingPage() {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const [countdown, setCountdown] = useState(getCountdownParts)
  const [attending, setAttending] = useState('yes')
  const [formState, setFormState] = useState({ name: '', email: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const firstName = useMemo(
    () => formState.name.trim().split(' ')[0] || 'friend',
    [formState.name],
  )
  const skySnapshot = useMemo(() => getSkySnapshot(EVENT_DATE), [])
  const eventDateLong = useMemo(
    () => formatEventDate(EVENT_DATE, { day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  )
  const eventDateShort = useMemo(
    () => formatEventDate(EVENT_DATE, { day: 'numeric', month: 'short', year: 'numeric' }),
    [],
  )

  useEffect(() => {
    const interval = window.setInterval(() => setCountdown(getCountdownParts()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('celestial-native-scroll')
    document.body.classList.add('celestial-native-scroll')

    return () => {
      document.documentElement.classList.remove('celestial-native-scroll')
      document.body.classList.remove('celestial-native-scroll')
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 820px)').matches

    if (reduceMotion) {
      root.querySelectorAll('.cw-reveal').forEach((target) => target.classList.add('in'))
      return undefined
    }

    const hoverCleanups = []
    const ctx = gsap.context(() => {
      const revealY = isMobile ? 20 : 46
      const charDuration = isMobile ? 0.34 : 0.44
      const charStagger = isMobile ? 0.003 : 0.006
      const itemStagger = isMobile ? 0.035 : 0.065
      const sectionStart = isMobile ? 'top 84%' : 'top 74%'

      const splitTargets = gsap.utils.toArray(
        '.cw-section-head h2, .cw-story-copy h2, .cw-venue-info h2, .cw-footer-names',
      )

      splitTargets.forEach((target) => {
        if (target.dataset.split) return
        const text = target.textContent
        target.dataset.split = 'true'
        target.setAttribute('aria-label', text)
        target.innerHTML = text
          .split('')
          .map((char) => {
            const value = char === ' ' ? '&nbsp;' : char
            return `<span class="cw-char" aria-hidden="true">${value}</span>`
          })
          .join('')
      })

      gsap.set('.cw-reveal:not(.in)', { autoAlpha: 0, y: revealY })
      gsap.set('.cw-section-head', { autoAlpha: 1, y: 0 })
      gsap.set('.cw-count-grid, .cw-timeline, .cw-gallery-grid', { autoAlpha: 1, y: 0 })
      gsap.set('.cw-story-copy, .cw-venue-info', { autoAlpha: 0.45, y: 24 })
      gsap.set(
        '.cw-reveal, .cw-count-cell, .cw-tl-item, .cw-gallery-cell, .cw-rsvp-card, .cw-starmap, .cw-story-photo, .cw-sky-map, .cw-sky-body, .cw-sky-card, .cw-sky-star, .cw-sky-planet',
        { force3D: true },
      )
      gsap.set('.cw-char', { yPercent: isMobile ? 72 : 115, rotate: isMobile ? 0 : 4, autoAlpha: 0 })
      gsap.utils.toArray('.cw-constellation path, .cw-starmap path').forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      })
      gsap.set('.cw-section-head h2, .cw-story-copy h2, .cw-venue-info h2', { y: 0 })

      const revealHeading = (selector, trigger, start = 'top 76%') => {
        const chars = document.querySelectorAll(`${selector} .cw-char`)
        return gsap.to(chars, {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          stagger: 0.018,
          duration: 0.85,
          ease: 'expo.out',
          scrollTrigger: {
            trigger,
            start,
            toggleActions: 'restart none restart none',
          },
        })
      }

      if (!isMobile) {
        gsap.utils.toArray('.cw-section').forEach((section) => {
          gsap.to(section, {
            '--section-progress': 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.35,
            },
          })
        })
      }

      gsap.to('.cw-motion-dot', {
        y: () => window.innerHeight - 96,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
        },
      })

      gsap.to('.cw-motion-line', {
        scaleY: 1,
        ease: 'none',
        transformOrigin: 'top',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.45,
        },
      })

      revealHeading('.cw-footer-names', '.cw-footer', 'top 84%')

      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      heroTl
        .from('.cw-moon', {
          autoAlpha: 0,
          scale: 0.62,
          rotate: -18,
          duration: 1.25,
        })
        .fromTo(
          '.cw-hero .cw-eyebrow',
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.85 },
          '-=.55',
        )
        .fromTo(
          '.cw-hero-names',
          { autoAlpha: 0, yPercent: 28 },
          { autoAlpha: 1, yPercent: 0, duration: 1.15 },
          '-=.55',
        )
        .fromTo(
          '.cw-hero-line, .cw-hero-chip',
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: isMobile ? 0.62 : 0.9, stagger: isMobile ? 0.06 : 0.12 },
          '-=.55',
        )
        .from(
          '.cw-scroll-cue',
          { autoAlpha: 0, y: -10, duration: 0.7 },
          '-=.35',
        )

      if (!isMobile) {
        gsap.to('.cw-moon', {
          y: -24,
          scale: 0.94,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cw-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.55,
          },
        })
      }

      gsap.to('.cw-starfield', {
        yPercent: isMobile ? 4 : 10,
        opacity: 0.62,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cw-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: isMobile ? 0.25 : 0.55,
        },
      })

      const countdownTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-countdown',
          start: isMobile ? 'top 84%' : 'top 72%',
          toggleActions: 'restart none restart none',
        },
      })
      countdownTl
        .to('.cw-countdown .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
        }, 0)
        .to('.cw-countdown .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.05)
        .fromTo(
          '.cw-count-cell',
          { autoAlpha: 0.28, y: isMobile ? 18 : 44, rotateX: isMobile ? 0 : -26, transformPerspective: 900 },
          {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            duration: isMobile ? 0.58 : 0.95,
            ease: isMobile ? 'power2.out' : 'back.out(1.4)',
            stagger: isMobile ? 0.045 : 0.09,
          },
          0.18,
        )
        .fromTo(
          '.cw-count-orbit',
          { scale: 0.72, rotate: -36, opacity: 0 },
          {
            scale: 1,
            rotate: 0,
            opacity: 0.5,
            duration: isMobile ? 0.52 : 0.85,
            stagger: isMobile ? 0.035 : 0.06,
          },
          0.26,
        )

      const skyTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-sky',
          start: sectionStart,
          toggleActions: 'restart none restart none',
        },
      })
      skyTl
        .to('.cw-sky .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
        }, 0)
        .to('.cw-sky .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.04)
        .fromTo(
          '.cw-sky-map',
          { autoAlpha: 0.2, y: isMobile ? 16 : 28, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: isMobile ? 0.56 : 0.82 },
          0.14,
        )
        .fromTo(
          '.cw-sky-orbit',
          { scale: 0.74, rotate: isMobile ? 0 : -18, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: isMobile ? 0.48 : 0.72, stagger: isMobile ? 0.05 : 0.09 },
          0.22,
        )
        .fromTo(
          '.cw-sky-moon-phase',
          { autoAlpha: 0, scale: 0.72, rotate: isMobile ? 0 : -10 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: isMobile ? 0.46 : 0.68, ease: 'back.out(1.5)' },
          0.32,
        )
        .fromTo(
          '.cw-sky-star, .cw-sky-planet',
          { autoAlpha: 0, scale: 0, y: isMobile ? 8 : 14 },
          { autoAlpha: 1, scale: 1, y: 0, duration: isMobile ? 0.28 : 0.38, stagger: isMobile ? 0.03 : 0.045, ease: 'back.out(1.8)' },
          0.4,
        )
        .fromTo(
          '.cw-sky-body',
          { autoAlpha: 0.2, x: isMobile ? 0 : 26, y: isMobile ? 16 : 0 },
          { autoAlpha: 1, x: 0, y: 0, duration: isMobile ? 0.52 : 0.72 },
          0.24,
        )
        .fromTo(
          '.cw-sky-body p, .cw-sky-card',
          { autoAlpha: 0, y: isMobile ? 12 : 18 },
          { autoAlpha: 1, y: 0, duration: isMobile ? 0.36 : 0.48, stagger: isMobile ? 0.035 : 0.055 },
          0.48,
        )

      const storyTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-story',
          start: isMobile ? 'top 86%' : 'top 78%',
          toggleActions: 'restart none restart none',
        },
      })
      storyTl
        .fromTo(
          '.cw-story-photo',
          { autoAlpha: 0.22, x: isMobile ? 0 : -30, y: isMobile ? 18 : 0, scale: 0.96 },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: isMobile ? 0.62 : 0.95,
            ease: 'power3.out',
          },
          0,
        )
        .fromTo(
          '.cw-frame-ring',
          { scale: 0.92, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: isMobile ? 0.5 : 0.82 },
          0.18,
        )
        .to('.cw-story-copy', {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.58 : 0.82,
        }, 0.08)
        .to('.cw-story-copy h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.14)
        .fromTo(
          '.cw-story-copy p, .cw-constellation',
          { autoAlpha: 0.24, x: isMobile ? 0 : 28, y: isMobile ? 14 : 0 },
          { autoAlpha: 1, x: 0, y: 0, duration: isMobile ? 0.52 : 0.78, stagger: isMobile ? 0.06 : 0.13 },
          0.38,
        )
        .to(
          '.cw-constellation path',
          { strokeDashoffset: 0, duration: 0.95, ease: 'power2.inOut' },
          0.58,
        )
        .fromTo(
          '.cw-constellation circle',
          { scale: 0, transformOrigin: '50% 50%' },
          { scale: 1, duration: 0.58, stagger: 0.055, ease: 'back.out(2)' },
          0.76,
        )

      if (!isMobile) {
        gsap.to('.cw-story-photo', {
          y: -46,
          ease: 'none',
          scrollTrigger: {
            trigger: '.cw-story',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.45,
          },
        })
      }

      const scheduleTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-schedule',
          start: sectionStart,
          toggleActions: 'restart none restart none',
        },
      })
      scheduleTl
        .to('.cw-schedule .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
        }, 0)
        .to('.cw-schedule .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.05)
        .to('.cw-timeline', {
          '--line-scale': 1,
          duration: 0.72,
          ease: 'power2.inOut',
        }, 0.14)
        .fromTo(
          '.cw-tl-item',
          {
            autoAlpha: 0.28,
            x: isMobile ? 0 : (index) => (index % 2 === 0 ? -44 : 44),
            y: isMobile ? 16 : 22,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: isMobile ? 0.44 : 0.58,
            stagger: itemStagger,
          },
          0.24,
        )
        .fromTo(
          '.cw-phase',
          { rotate: isMobile ? 0 : -45, scale: 0.82 },
          { rotate: 0, scale: 1, duration: isMobile ? 0.38 : 0.5, stagger: isMobile ? 0.035 : 0.05, ease: 'power2.out' },
          0.28,
        )

      const venueTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-venue',
          start: isMobile ? 'top 84%' : 'top 76%',
          toggleActions: 'restart none restart none',
        },
      })
      venueTl
        .to('.cw-venue .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
        }, 0)
        .to('.cw-venue .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.05)
        .fromTo(
          '.cw-starmap',
          { autoAlpha: 0.32, scale: 0.98, y: isMobile ? 16 : 28 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: isMobile ? 0.58 : 0.85,
            ease: 'power3.out',
          },
          0.16,
        )
        .fromTo(
          '.cw-pin',
          { autoAlpha: 0, y: isMobile ? -12 : -34, scale: 0.9 },
          { autoAlpha: 1, y: 0, scale: 1, duration: isMobile ? 0.42 : 0.58, ease: 'power2.out' },
          0.34,
        )
        .to(
          '.cw-starmap path',
          { strokeDashoffset: 0, duration: isMobile ? 0.52 : 0.82, stagger: isMobile ? 0.02 : 0.045, ease: 'power2.inOut' },
          0.4,
        )
        .fromTo(
          '.cw-starmap circle',
          { scale: 0, transformOrigin: '50% 50%' },
          { scale: 1, duration: isMobile ? 0.3 : 0.42, stagger: isMobile ? 0.015 : 0.025, ease: 'power2.out' },
          0.56,
        )
        .to('.cw-venue-info', {
          autoAlpha: 1,
          y: 0,
          duration: isMobile ? 0.52 : 0.68,
        }, 0.22)
        .to('.cw-venue-info h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.28)
        .fromTo(
          '.cw-address, .cw-detail-row, .cw-venue-info .cw-btn',
          { autoAlpha: 0.28, y: isMobile ? 12 : 20 },
          { autoAlpha: 1, y: 0, duration: isMobile ? 0.38 : 0.48, stagger: isMobile ? 0.035 : 0.055 },
          0.52,
        )

      if (!isMobile) {
        gsap.to('.cw-starmap svg', {
          scale: 1.12,
          rotate: 2,
          ease: 'none',
          transformOrigin: '50% 50%',
          scrollTrigger: {
            trigger: '.cw-venue',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.45,
          },
        })
      }

      const galleryTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-gallery',
          start: sectionStart,
          toggleActions: 'restart none restart none',
        },
      })
      galleryTl
        .to('.cw-gallery .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
        }, 0)
        .to('.cw-gallery .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.05)
        .fromTo(
          '.cw-gallery-cell',
          {
            autoAlpha: 0.46,
            y: isMobile ? 18 : (index) => (index % 2 === 0 ? 46 : -34),
            rotate: isMobile ? 0 : (index) => (index % 2 === 0 ? -2.5 : 2.5),
            scale: isMobile ? 0.98 : 0.96,
          },
          {
            autoAlpha: 1,
            y: 0,
            rotate: 0,
            scale: 1,
            duration: isMobile ? 0.44 : 0.62,
            ease: 'power3.out',
            stagger: { each: isMobile ? 0.026 : 0.045, from: 'center' },
          },
          0.18,
        )

      const rsvpTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: '.cw-rsvp',
          start: sectionStart,
          toggleActions: 'restart none restart none',
        },
      })
      rsvpTl
        .to('.cw-rsvp .cw-section-head', {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
        }, 0)
        .to('.cw-rsvp .cw-section-head h2 .cw-char', {
          autoAlpha: 1,
          yPercent: 0,
          rotate: 0,
          duration: charDuration,
          ease: 'expo.out',
          stagger: charStagger,
        }, 0.05)
        .fromTo(
          '.cw-rsvp-card',
          { autoAlpha: 0.28, y: isMobile ? 18 : 36, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: isMobile ? 0.5 : 0.72,
            ease: 'power3.out',
          },
          0.18,
        )
        .fromTo(
          '.cw-corner',
          { autoAlpha: 0, scale: 0.65, rotate: isMobile ? 0 : 18 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: isMobile ? 0.24 : 0.36, stagger: isMobile ? 0.018 : 0.03, ease: 'power2.out' },
          0.34,
        )
        .fromTo(
          '.cw-attend, .cw-field, .cw-submit',
          { autoAlpha: 0, y: isMobile ? 12 : 22 },
          { autoAlpha: 1, y: 0, duration: isMobile ? 0.34 : 0.46, stagger: isMobile ? 0.026 : 0.045 },
          0.44,
        )

      gsap.to('.cw-footer-names', {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cw-footer',
          start: 'top 80%',
          toggleActions: 'restart none restart none',
        },
      })

      gsap.to('.cw-footer-meta', {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
        delay: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.cw-footer',
          start: 'top 80%',
          toggleActions: 'restart none restart none',
        },
      })

      if (!isMobile) {
        const hoverTargets = gsap.utils.toArray('.cw-btn, .cw-gallery-cell')
        hoverTargets.forEach((target) => {
          const moveX = gsap.quickTo(target, 'x', { duration: 0.35, ease: 'power3.out' })
          const moveY = gsap.quickTo(target, 'y', { duration: 0.35, ease: 'power3.out' })
          const rotate = gsap.quickTo(target, 'rotate', { duration: 0.35, ease: 'power3.out' })

          const onMove = (event) => {
            const rect = target.getBoundingClientRect()
            const relX = event.clientX - rect.left - rect.width / 2
            const relY = event.clientY - rect.top - rect.height / 2
            moveX(relX * 0.08)
            moveY(relY * 0.08)
            rotate(relX * 0.012)
          }
          const onLeave = () => {
            moveX(0)
            moveY(0)
            rotate(0)
          }

          target.addEventListener('pointermove', onMove)
          target.addEventListener('pointerleave', onLeave)
          hoverCleanups.push(() => {
            target.removeEventListener('pointermove', onMove)
            target.removeEventListener('pointerleave', onLeave)
          })
        })
      }
    }, root)

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup())
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 820px)').matches
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas,
    })
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, 1, 1, 1200)
    const starField = new THREE.Group()
    const moonGroup = new THREE.Group()
    const pointer = new THREE.Vector2(0, 0)
    const targetPointer = new THREE.Vector2(0, 0)
    const clock = new THREE.Clock()
    let frame = 0
    let width = 1
    let height = 1
    let moonBaseY = 118

    camera.position.z = 420
    scene.add(starField)
    scene.add(moonGroup)

    const makeStarLayer = ({ count, depth, size, color, spread, opacity }) => {
      const positions = new Float32Array(count * 3)
      const phases = new Float32Array(count)

      for (let index = 0; index < count; index += 1) {
        const i3 = index * 3
        positions[i3] = (Math.random() - 0.5) * spread
        positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.62
        positions[i3 + 2] = depth + (Math.random() - 0.5) * 90
        phases[index] = Math.random() * Math.PI * 2
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))

      const material = new THREE.PointsMaterial({
        color,
        depthWrite: false,
        opacity,
        size,
        sizeAttenuation: true,
        transparent: true,
      })

      const points = new THREE.Points(geometry, material)
      points.userData.baseOpacity = opacity
      points.userData.floatSpeed = 0.05 + Math.random() * 0.04
      starField.add(points)
      return points
    }

    const farStars = makeStarLayer({
      color: '#e9ecff',
      count: 260,
      depth: -170,
      opacity: 0.52,
      size: 1.45,
      spread: 980,
    })
    const nearStars = makeStarLayer({
      color: '#f4d38a',
      count: 80,
      depth: 40,
      opacity: 0.72,
      size: 2.1,
      spread: 760,
    })
    const dustStars = makeStarLayer({
      color: '#ffffff',
      count: 140,
      depth: -20,
      opacity: 0.28,
      size: 0.95,
      spread: 1080,
    })

    const meteorGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-95, -28, 0),
    ])
    const meteorMaterial = new THREE.LineBasicMaterial({
      color: '#ffe7af',
      opacity: 0,
      transparent: true,
    })
    const meteor = new THREE.Line(meteorGeometry, meteorMaterial)
    scene.add(meteor)

    const textureLoader = new THREE.TextureLoader()
    const moonTexture = textureLoader.load('/assets/moon/lroc_color_2k.jpg')
    const moonElevation = textureLoader.load('/assets/moon/ldem_3_8bit.jpg')
    moonTexture.colorSpace = THREE.SRGBColorSpace
    moonTexture.anisotropy = 8
    moonElevation.anisotropy = 8
    const moonGeometry = new THREE.SphereGeometry(52, 160, 160)
    const moonMaterial = new THREE.MeshStandardMaterial({
      bumpMap: moonElevation,
      bumpScale: 2.6,
      color: '#e5e1d5',
      displacementMap: moonElevation,
      displacementScale: 0.85,
      emissive: '#10131d',
      emissiveIntensity: 0.025,
      map: moonTexture,
      metalness: 0,
      roughness: 1,
    })
    const moon = new THREE.Mesh(moonGeometry, moonMaterial)
    const moonGlowGeometry = new THREE.SphereGeometry(64, 72, 72)
    const moonGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#dfe5ff',
      opacity: 0.12,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial)
    const moonKeyLight = new THREE.DirectionalLight('#fff7dc', 3.8)
    const moonFillLight = new THREE.PointLight('#8f98ff', 0.7, 520)
    const ambientLight = new THREE.AmbientLight('#4f5365', 0.42)

    moonGroup.position.set(0, -18, 74)
    moon.rotation.set(0.08, -1.35, -0.05)
    moonGlow.scale.setScalar(1.08)
    moonGroup.add(moonGlow, moon)
    moonKeyLight.position.set(-130, 180, 260)
    moonFillLight.position.set(180, -120, 120)
    scene.add(moonKeyLight, moonFillLight, ambientLight)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 2))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const moonScale = width < 600 ? 0.84 : width < 900 ? 1.28 : 2.05
      moonBaseY = width < 600 ? -8 : width < 900 ? -12 : -18
      moonGroup.scale.setScalar(moonScale)
    }

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect()
      targetPointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      targetPointer.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2)
    }

    const launchMeteor = () => {
      if (reduceMotion) return
      meteor.position.set(
        (Math.random() - 0.5) * 380,
        150 + Math.random() * 120,
        20,
      )
      meteor.rotation.z = -0.28
      meteorMaterial.opacity = 0.85
      gsap.to(meteor.position, {
        duration: 1.4,
        ease: 'power2.out',
        x: meteor.position.x + 260,
        y: meteor.position.y - 80,
      })
      gsap.to(meteorMaterial, {
        duration: 1.4,
        ease: 'power2.out',
        opacity: 0,
      })
    }

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      pointer.lerp(targetPointer, reduceMotion ? 0.03 : 0.075)

      starField.rotation.y = pointer.x * 0.055
      starField.rotation.x = pointer.y * 0.035
      starField.position.x = pointer.x * 30
      starField.position.y = pointer.y * 20
      moonGroup.rotation.y = pointer.x * 0.18 + elapsed * 0.035
      moonGroup.rotation.x = pointer.y * 0.07
      moonGroup.position.x = pointer.x * 10
      moonGroup.position.y = moonBaseY + pointer.y * 6 + Math.sin(elapsed * 0.7) * 1.8
      moon.rotation.y += reduceMotion ? 0.0008 : 0.0018
      moonGlow.material.opacity = 0.13 + Math.sin(elapsed * 1.2) * 0.025

      farStars.position.x = pointer.x * -16
      farStars.position.y = pointer.y * -9
      nearStars.position.x = pointer.x * 38
      nearStars.position.y = pointer.y * 24
      dustStars.position.x = pointer.x * 20
      dustStars.position.y = pointer.y * 12

      starField.children.forEach((layer, index) => {
        layer.rotation.z = elapsed * layer.userData.floatSpeed * (index % 2 ? -1 : 1)
        layer.material.opacity =
          layer.userData.baseOpacity +
          Math.sin(elapsed * 1.1 + index) * (reduceMotion ? 0.015 : 0.08)
      })

      renderer.render(scene, camera)
      frame = window.requestAnimationFrame(animate)
    }

    resize()
    animate()

    const meteorTimer = isMobile ? 0 : window.setInterval(launchMeteor, 4200)
    const firstMeteor = isMobile ? 0 : window.setTimeout(launchMeteor, 1300)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.cancelAnimationFrame(frame)
      if (meteorTimer) window.clearInterval(meteorTimer)
      if (firstMeteor) window.clearTimeout(firstMeteor)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      disposeObject3D(starField)
      disposeObject3D(moonGroup)
      moonTexture.dispose()
      moonElevation.dispose()
      meteorGeometry.dispose()
      meteorMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  const onSubmit = (event) => {
    event.preventDefault()
    const nextErrors = {}

    if (!formState.name.trim()) nextErrors.name = true
    if (
      attending === 'yes' &&
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.email.trim())
    ) {
      nextErrors.email = true
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSubmitted(true)
  }

  return (
    <div ref={rootRef} className="celestial-page">
      <style>{`
        .celestial-page {
          --night-0: oklch(0.13 0.035 268);
          --night-1: oklch(0.16 0.045 266);
          --night-2: oklch(0.20 0.052 264);
          --night-3: oklch(0.25 0.055 262);
          --panel: oklch(0.155 0.04 268);
          --gold: oklch(0.83 0.108 84);
          --gold-soft: oklch(0.86 0.07 86);
          --gold-deep: oklch(0.70 0.10 76);
          --starlight: oklch(0.96 0.012 90);
          --mist: oklch(0.80 0.028 270);
          --mist-dim: oklch(0.66 0.03 272);
          --line: oklch(0.40 0.04 270 / 0.45);
          background: var(--night-0);
          color: var(--starlight);
          font-family: "Cormorant Garamond", Georgia, serif;
          overflow-x: hidden;
        }
        html.celestial-native-scroll {
          scroll-behavior: auto;
          scroll-snap-type: none;
        }
        body.celestial-native-scroll {
          scroll-snap-type: none;
        }
        .celestial-page * { box-sizing: border-box; }
        .celestial-page,
        .celestial-page * {
          scroll-snap-align: none;
          scroll-snap-stop: normal;
        }
        .celestial-page section { position: relative; }
        .cw-eyebrow {
          color: var(--gold);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .74rem;
          font-weight: 400;
          letter-spacing: .42em;
          text-transform: uppercase;
        }
        .cw-eyebrow.dim { color: var(--mist-dim); }
        .cw-script { font-style: italic; font-weight: 500; }
        .cw-wrap { width: min(1120px, calc(100% - 56px)); margin: 0 auto; }
        .cw-section {
          min-height: min(920px, 92svh);
          display: flex;
          align-items: center;
          padding: clamp(36px, 6vh, 68px) 0;
          overflow: hidden;
        }
        .cw-section > .cw-wrap { width: min(1120px, calc(100% - 56px)); }
        .cw-section-head { margin-bottom: clamp(22px, 4vh, 42px); text-align: center; }
        .cw-section-head h2,
        .cw-story-copy h2,
        .cw-venue-info h2 {
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: 0;
          will-change: clip-path, transform;
        }
        .cw-section-head h2 {
          margin: 18px 0 0;
          font-size: clamp(2.15rem, 4.8vw, 3.55rem);
        }
        .cw-lead {
          max-width: 560px;
          margin: 12px auto 0;
          color: var(--mist);
          font-size: 1.05rem;
        }
        .cw-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: var(--gold);
        }
        .cw-bar {
          height: 1px;
          width: 64px;
          background: linear-gradient(90deg, transparent, var(--gold-deep));
        }
        .cw-bar.right { background: linear-gradient(90deg, var(--gold-deep), transparent); }
        .cw-divider-mark {
          width: 22px;
          height: 22px;
          fill: currentColor;
          filter: drop-shadow(0 0 8px oklch(0.84 0.1 84 / .35));
        }
        .cw-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: none;
          will-change: opacity, transform;
        }
        .cw-reveal.in { opacity: 1; transform: none; }
        .cw-char {
          display: inline-block;
          transform-origin: 50% 100%;
          will-change: opacity, transform;
        }
        .cw-motion-rail {
          position: fixed;
          top: 48px;
          right: 28px;
          bottom: 48px;
          z-index: 20;
          width: 1px;
          background: oklch(0.84 0.1 84 / .14);
          pointer-events: none;
        }
        .cw-motion-line {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, var(--gold), transparent);
          transform: scaleY(0);
          transform-origin: top;
        }
        .cw-motion-dot {
          position: absolute;
          top: 0;
          left: 50%;
          width: 9px;
          height: 9px;
          border: 1px solid var(--gold);
          border-radius: 50%;
          background: var(--night-0);
          box-shadow: 0 0 16px oklch(0.84 0.1 84 / .45);
          transform: translateX(-50%);
        }
        .cw-d1 { transition-delay: .12s; }
        .cw-d2 { transition-delay: .24s; }
        .cw-d3 { transition-delay: .36s; }
        .cw-hero {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: clamp(44px, 7vh, 72px) 24px 60px;
          text-align: center;
          background:
            radial-gradient(70% 46% at 50% 8%, oklch(0.42 0.06 268 / .22), transparent 72%),
            radial-gradient(90% 60% at 50% 118%, oklch(0.30 0.06 300 / .32), transparent 64%),
            linear-gradient(180deg, var(--night-1), var(--night-0));
        }
        .cw-hero::after {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 34%;
          pointer-events: none;
          background: linear-gradient(180deg, transparent, oklch(0.10 0.03 268 / .56));
          z-index: 1;
        }
        .cw-starfield { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
        .cw-hero-inner {
          position: relative;
          z-index: 2;
          width: min(960px, 100%);
          min-height: min(680px, calc(100svh - 112px));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .cw-moon-stage {
          width: clamp(360px, 48vw, 620px);
          aspect-ratio: 1;
          position: absolute;
          left: 50%;
          top: 48%;
          display: grid;
          place-items: center;
          margin: 0;
          opacity: .78;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
        }
        .cw-moon-stage::before,
        .cw-moon-stage::after {
          content: "";
          position: absolute;
          inset: 4%;
          border: 1px solid oklch(0.84 0.1 84 / .18);
          border-radius: 50%;
          box-shadow: inset 0 0 38px oklch(0.72 0.05 260 / .08);
        }
        .cw-moon-stage::after {
          display: none;
        }
        .cw-moon {
          width: 56%;
          height: 56%;
          position: relative;
          border-radius: 50%;
          background: transparent;
          box-shadow: none;
          will-change: opacity, transform;
        }
        .cw-moon::after {
          display: none;
        }
        .cw-moon-halo {
          display: none;
        }
        .cw-moon-halo::before {
          content: "";
          position: absolute;
          top: -3px;
          left: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
        }
        .cw-hero .cw-eyebrow,
        .cw-hero-names,
        .cw-hero-line,
        .cw-hero-meta {
          position: relative;
          z-index: 2;
        }
        .cw-hero .cw-eyebrow {
          padding: 8px 12px;
          background: oklch(0.09 0.025 268 / .28);
          backdrop-filter: blur(10px);
        }
        @keyframes cw-spin { to { transform: rotate(360deg); } }
        @keyframes cw-orbit-spin {
          from { transform: rotateX(62deg) rotateZ(18deg); }
          to { transform: rotateX(62deg) rotateZ(378deg); }
        }
        .cw-hero-names {
          max-width: 780px;
          margin: clamp(10px, 2vh, 16px) 0 0;
          color: oklch(0.98 0.008 90);
          font-size: clamp(4.2rem, 11vw, 8.7rem);
          font-weight: 400;
          line-height: .84;
          letter-spacing: 0;
          text-shadow: 0 16px 60px oklch(0.04 0.02 270 / .45);
        }
        .cw-hero-names span {
          display: block;
          margin: .11em 0 .08em;
          color: var(--gold);
          font-size: .32em;
          font-style: italic;
          letter-spacing: 0;
        }
        .cw-hero-line {
          width: min(560px, 72vw);
          height: 1px;
          margin: clamp(14px, 2.5vh, 22px) 0 0;
          background: transparent;
        }
        .cw-hero-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: clamp(14px, 2.4vh, 20px);
        }
        .cw-hero-chip {
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          border: 1px solid oklch(0.84 0.1 84 / .22);
          background: oklch(0.12 0.035 268 / .34);
          color: var(--mist);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .66rem;
          letter-spacing: .2em;
          padding: 9px 14px;
          text-transform: uppercase;
          backdrop-filter: blur(14px);
        }
        .cw-hero-chip.strong {
          color: var(--gold-soft);
        }
        .cw-hero-sub,
        .cw-scroll-cue,
        .cw-count-label,
        .cw-time,
        .cw-detail-key,
        .cw-btn,
        .cw-field label,
        .cw-attend label,
        .cw-footer-meta {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
        .cw-hero-sub {
          margin-top: 0;
          color: var(--mist);
          font-size: .7rem;
          font-weight: 300;
          letter-spacing: .42em;
          text-transform: uppercase;
        }
        .cw-hero-date {
          margin-top: 0;
          color: var(--gold-soft);
          font-size: .66rem;
          letter-spacing: .2em;
          text-transform: uppercase;
        }
        .cw-scroll-cue {
          position: absolute;
          bottom: 30px;
          left: 50%;
          z-index: 2;
          display: flex;
          transform: translateX(-50%);
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--mist-dim);
          font-size: .66rem;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        .cw-scroll-cue span:last-child {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
          animation: cw-fall 1.8s ease-in-out infinite;
        }
        @keyframes cw-fall {
          0% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(16px); opacity: 0; }
        }
        .cw-countdown { background: linear-gradient(180deg, var(--night-0), var(--night-1)); text-align: center; }
        .cw-countdown::before,
        .cw-sky::before,
        .cw-story::before,
        .cw-schedule::before,
        .cw-venue::before,
        .cw-gallery::before,
        .cw-rsvp::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: calc(.08 + var(--section-progress, 0) * .18);
          background:
            linear-gradient(115deg, transparent 0 42%, oklch(0.84 0.1 84 / .18) 50%, transparent 58% 100%);
          transform: translateX(calc((-35% + var(--section-progress, 0) * 70%)));
          will-change: transform, opacity;
        }
        .cw-count-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: clamp(12px, 3.2vw, 42px);
          margin-top: 20px;
          perspective: 900px;
        }
        .cw-count-cell { position: relative; width: clamp(96px, 20vw, 150px); transform-style: preserve-3d; will-change: opacity, transform; }
        .cw-count-orbit { position: absolute; inset: -12px; border: 1px solid var(--line); border-radius: 50%; opacity: .5; }
        .cw-count-dot {
          position: absolute;
          top: -12px;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
          transform-origin: 50% calc(50% + 12px);
          animation: cw-spin 10s linear infinite;
        }
        .cw-count-num {
          color: var(--starlight);
          font-size: clamp(2.65rem, 7vw, 4.7rem);
          font-variant-numeric: tabular-nums;
          line-height: 1;
          text-shadow: 0 0 30px oklch(0.84 0.1 84 / .25);
        }
        .cw-count-label {
          margin-top: 14px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .32em;
          text-transform: uppercase;
        }
        .cw-sky {
          background:
            radial-gradient(80% 70% at 18% 18%, oklch(0.28 0.06 278 / .34), transparent 66%),
            radial-gradient(90% 70% at 86% 72%, oklch(0.29 0.06 246 / .24), transparent 62%),
            var(--night-0);
        }
        .cw-sky-grid {
          display: grid;
          grid-template-columns: 1.05fr .95fr;
          align-items: center;
          gap: clamp(28px, 5vw, 72px);
        }
        .cw-sky-map {
          min-height: min(54vh, 440px);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          background:
            radial-gradient(circle at 48% 45%, oklch(0.34 0.055 262 / .34), transparent 32%),
            radial-gradient(circle at 25% 22%, oklch(0.83 0.108 84 / .16), transparent 24%),
            linear-gradient(150deg, oklch(0.12 0.04 270), oklch(0.18 0.05 254));
          box-shadow: inset 0 0 80px oklch(0.04 0.02 270 / .52);
          isolation: isolate;
        }
        .cw-sky-map::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .5;
          background-image:
            radial-gradient(circle, oklch(0.96 0.012 90 / .9) 0 1px, transparent 1.4px),
            radial-gradient(circle, oklch(0.83 0.108 84 / .7) 0 1px, transparent 1.6px);
          background-position: 0 0, 42px 28px;
          background-size: 78px 76px, 116px 104px;
        }
        .cw-sky-orbit {
          position: absolute;
          left: 50%;
          top: 52%;
          z-index: 1;
          border: 1px solid oklch(0.84 0.1 84 / .22);
          border-radius: 50%;
          transform: translate(-50%, -50%) rotate(-12deg);
          transform-origin: center;
        }
        .cw-sky-orbit.o1 { width: 68%; aspect-ratio: 1 / .56; }
        .cw-sky-orbit.o2 { width: 88%; aspect-ratio: 1 / .42; opacity: .62; }
        .cw-sky-moon-phase {
          position: absolute;
          left: 48%;
          top: 48%;
          z-index: 3;
          width: clamp(86px, 15vw, 132px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, oklch(0.93 0.018 88), oklch(0.65 0.028 82) 72%);
          box-shadow: 0 0 34px oklch(0.82 0.08 84 / .25);
          transform: translate(-50%, -50%);
        }
        .cw-sky-moon-phase span {
          position: absolute;
          inset: -1px 16% -1px -1px;
          border-radius: 50%;
          background: linear-gradient(90deg, oklch(0.11 0.04 270) 6%, oklch(0.16 0.044 266) 72%);
          box-shadow: inset -8px 0 18px oklch(0.04 0.02 270 / .45);
        }
        .cw-sky-planet {
          position: absolute;
          left: 70%;
          top: 32%;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--gold-soft);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .64rem;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .cw-sky-planet::before {
          content: "";
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, var(--gold-soft), oklch(0.63 0.07 70));
          box-shadow: 0 0 18px oklch(0.83 0.108 84 / .38);
        }
        .cw-sky-star {
          --star-size: 4px;
          position: absolute;
          left: calc(var(--x) * 1%);
          top: calc(var(--y) * 1%);
          z-index: 2;
          color: var(--mist);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .58rem;
          letter-spacing: .16em;
          text-transform: uppercase;
          transform: translate(-50%, -50%);
        }
        .cw-sky-star::before {
          content: "";
          display: block;
          width: var(--star-size);
          height: var(--star-size);
          margin: 0 auto 7px;
          border-radius: 50%;
          background: var(--starlight);
          box-shadow: 0 0 14px oklch(0.96 0.012 90 / .7);
        }
        .cw-sky-body h3 {
          margin: 12px 0 16px;
          color: var(--starlight);
          font-size: clamp(2rem, 4vw, 3.1rem);
          font-weight: 400;
          line-height: 1.04;
        }
        .cw-sky-body p {
          max-width: 48ch;
          margin: 0 0 20px;
          color: var(--mist);
          font-size: 1.04rem;
        }
        .cw-sky-card-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .cw-sky-card {
          min-height: 112px;
          border: 1px solid var(--line);
          background: oklch(0.15 0.04 268 / .62);
          padding: 16px;
        }
        .cw-sky-card-label {
          color: var(--gold);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .62rem;
          letter-spacing: .22em;
          text-transform: uppercase;
        }
        .cw-sky-card-value {
          margin-top: 10px;
          color: var(--starlight);
          font-size: 1.36rem;
          line-height: 1.05;
        }
        .cw-sky-card-meta {
          margin-top: 9px;
          color: var(--mist-dim);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .72rem;
          line-height: 1.35;
        }
        .cw-story { background: var(--night-0); }
        .cw-story-grid,
        .cw-venue-grid {
          display: grid;
          align-items: center;
          gap: clamp(36px, 6vw, 90px);
        }
        .cw-story-grid { grid-template-columns: 1fr 1fr; }
        .cw-story-photo { position: relative; will-change: transform; }
        .cw-frame-ring { position: absolute; inset: -14px; border: 1px solid var(--line); pointer-events: none; }
        .cw-frame-ring::before,
        .cw-frame-ring::after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1px solid var(--gold);
        }
        .cw-frame-ring::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
        .cw-frame-ring::after { right: -1px; bottom: -1px; border-left: 0; border-top: 0; }
        .cw-photo-slot {
          min-height: 320px;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          border: 1px solid oklch(0.84 0.1 84 / .22);
          background:
            radial-gradient(circle at 25% 20%, oklch(0.83 0.108 84 / .22), transparent 22%),
            radial-gradient(circle at 78% 74%, oklch(0.34 0.08 290 / .55), transparent 30%),
            linear-gradient(145deg, var(--night-2), var(--night-0));
          color: var(--mist);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .7rem;
          letter-spacing: .24em;
          text-align: center;
          text-transform: uppercase;
          will-change: transform;
        }
        .cw-photo-orbit {
          position: absolute;
          width: 62%;
          aspect-ratio: 1;
          border: 1px solid var(--line);
          border-radius: 50%;
          animation: cw-spin 48s linear infinite;
        }
        .cw-photo-orbit::before,
        .cw-photo-orbit::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 10px var(--gold);
        }
        .cw-photo-orbit::before { top: 4%; left: 18%; width: 5px; height: 5px; }
        .cw-photo-orbit::after { right: 8%; bottom: 22%; width: 3px; height: 3px; }
        .cw-story-copy h2,
        .cw-venue-info h2 {
          margin: 14px 0 22px;
          font-size: clamp(2rem, 4vw, 3.05rem);
        }
        .cw-story-copy p {
          margin-bottom: 14px;
          color: var(--mist);
          font-size: 1.05rem;
        }
        .cw-story-copy .hl { color: var(--gold-soft); font-style: italic; }
        .cw-constellation { margin-top: 30px; color: var(--gold); }
        .cw-schedule { background: linear-gradient(180deg, var(--night-0), var(--night-1) 40%, var(--night-0)); }
        .cw-timeline {
          --line-scale: 0;
          max-width: 760px;
          margin: 0 auto;
          position: relative;
          padding-left: 8px;
        }
        .cw-timeline::before {
          content: "";
          position: absolute;
          left: 31px;
          top: 18px;
          bottom: 18px;
          width: 1px;
          background: linear-gradient(180deg, transparent, var(--line), transparent);
          transform: scaleY(var(--line-scale));
          transform-origin: top;
        }
        .cw-tl-item {
          display: grid;
          grid-template-columns: 64px 1fr;
          gap: 24px;
          align-items: start;
          padding: 12px 0;
        }
        .cw-phase {
          width: 46px;
          height: 46px;
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 50%;
          background: var(--night-3);
          flex: none;
        }
        .cw-phase-lit {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 34% 34%, oklch(0.95 0.02 90), oklch(0.84 0.06 86) 70%);
        }
        .cw-phase-shadow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--night-2);
        }
        .cw-time {
          color: var(--gold);
          font-size: .74rem;
          letter-spacing: .26em;
          text-transform: uppercase;
        }
        .cw-tl-body h3 { margin: 4px 0; font-size: 1.45rem; font-weight: 400; line-height: 1.08; }
        .cw-tl-body p { max-width: 46ch; color: var(--mist); font-size: .95rem; }
        .cw-venue { background: var(--night-0); }
        .cw-venue-grid { grid-template-columns: 1.15fr .85fr; align-items: stretch; }
        .cw-starmap {
          min-height: min(48vh, 360px);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          background: radial-gradient(80% 80% at 30% 20%, oklch(0.22 0.06 264), var(--night-1));
        }
        .cw-starmap svg { position: absolute; inset: 0; width: 100%; height: 100%; will-change: transform; }
        .cw-pin { position: absolute; left: 50%; top: 54%; z-index: 2; transform: translate(-50%, -100%); text-align: center; }
        .cw-pin-dot {
          width: 14px;
          height: 14px;
          margin: 0 auto 8px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 6px oklch(0.84 0.1 84 / .18), 0 0 24px var(--gold);
          animation: cw-pulse 2.6s ease-in-out infinite;
        }
        @keyframes cw-pulse { 50% { box-shadow: 0 0 0 12px oklch(0.84 0.1 84 / 0), 0 0 24px var(--gold); } }
        .cw-pin-tag {
          border: 1px solid var(--line);
          background: oklch(0.16 0.04 268 / .8);
          color: var(--starlight);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .68rem;
          letter-spacing: .24em;
          padding: 6px 12px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .cw-venue-info { display: flex; flex-direction: column; justify-content: center; }
        .cw-address { margin-bottom: 16px; color: var(--gold-soft); font-size: 1.12rem; font-style: italic; }
        .cw-detail-row { display: flex; gap: 16px; padding: 12px 0; border-top: 1px solid var(--line); }
        .cw-detail-row:last-of-type { border-bottom: 1px solid var(--line); }
        .cw-detail-key {
          width: 96px;
          flex: none;
          padding-top: 5px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .24em;
          text-transform: uppercase;
        }
        .cw-detail-value { color: var(--mist); font-size: 1rem; }
        .cw-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 46px;
          margin-top: 22px;
          border: 0;
          background: var(--gold);
          color: var(--night-0);
          cursor: pointer;
          font-size: .74rem;
          letter-spacing: .24em;
          padding: 15px 30px;
          text-decoration: none;
          text-transform: uppercase;
          transition: transform .3s, box-shadow .3s, background .3s;
        }
        .cw-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px oklch(0.84 0.1 84 / .3); background: var(--gold-soft); }
        .cw-btn.ghost { border: 1px solid var(--gold-deep); background: transparent; color: var(--gold); }
        .cw-btn.ghost:hover { background: oklch(0.84 0.1 84 / .1); box-shadow: none; }
        .cw-gallery { background: linear-gradient(180deg, var(--night-0), var(--night-1)); }
        .cw-gallery-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          grid-auto-rows: min(18vh, 120px);
          gap: 14px;
        }
        .cw-gallery-cell { position: relative; overflow: hidden; transform-origin: 50% 80%; will-change: opacity, transform; }
        .cw-gallery-cell::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid transparent;
          pointer-events: none;
          transition: border-color .4s;
        }
        .cw-gallery-cell:hover .cw-photo-slot { transform: scale(1.04); }
        .cw-gallery-cell:hover::after { border-color: var(--gold-deep); }
        .cw-gallery-cell .cw-photo-slot { width: 100%; height: 100%; min-height: 0; transition: transform .5s cubic-bezier(.2,.7,.2,1); }
        .g-a, .g-c { grid-column: span 2; grid-row: span 2; }
        .g-b, .g-d { grid-column: span 2; grid-row: span 1; }
        .g-e, .g-f { grid-column: span 3; grid-row: span 1; }
        .cw-rsvp {
          background: radial-gradient(120% 80% at 50% 0%, oklch(0.24 0.07 272 / .6), transparent 55%), var(--night-0);
          text-align: center;
        }
        .cw-rsvp-card {
          max-width: 660px;
          margin: 0 auto;
          position: relative;
          border: 1px solid var(--line);
          background: var(--panel);
          padding: clamp(24px, 3.2vw, 42px);
        }
        .cw-corner { position: absolute; width: 16px; height: 16px; border: 1px solid var(--gold); }
        .cw-corner.tl { top: 14px; left: 14px; border-right: 0; border-bottom: 0; }
        .cw-corner.tr { top: 14px; right: 14px; border-left: 0; border-bottom: 0; }
        .cw-corner.bl { bottom: 14px; left: 14px; border-right: 0; border-top: 0; }
        .cw-corner.br { right: 14px; bottom: 14px; border-left: 0; border-top: 0; }
        .cw-field { margin-bottom: 12px; text-align: left; }
        .cw-field label {
          display: block;
          margin-bottom: 9px;
          color: var(--gold);
          font-size: .7rem;
          letter-spacing: .24em;
          text-transform: uppercase;
        }
        .cw-field input,
        .cw-field select,
        .cw-field textarea {
          width: 100%;
          border: 1px solid var(--line);
          background: oklch(0.12 0.03 268);
          color: var(--starlight);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.12rem;
          outline: none;
          padding: 10px 14px;
          transition: border-color .3s, box-shadow .3s;
        }
        .cw-field input:focus,
        .cw-field select:focus,
        .cw-field textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px oklch(0.84 0.1 84 / .12); }
        .cw-field textarea { min-height: 54px; resize: vertical; }
        .cw-field.err input { border-color: oklch(0.6 0.14 25); }
        .cw-msg {
          display: none;
          margin-top: 6px;
          color: oklch(0.72 0.13 28);
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: .66rem;
          letter-spacing: .1em;
        }
        .cw-field.err .cw-msg { display: block; }
        .cw-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .cw-attend { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .cw-attend input { display: none; }
        .cw-attend label {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border: 1px solid var(--line);
          color: var(--mist);
          cursor: pointer;
          font-size: .8rem;
          letter-spacing: .16em;
          padding: 12px;
          text-transform: uppercase;
          transition: .3s;
        }
        .cw-attend label:hover,
        .cw-attend input:checked + label {
          border-color: var(--gold);
          background: oklch(0.84 0.1 84 / .08);
          color: var(--gold);
        }
        .cw-submit { width: 100%; margin-top: 8px; }
        .cw-thanks { padding: 30px 10px; animation: cw-fadein .8s both; }
        .cw-thanks .cw-moon { width: 72px; height: 72px; margin: 0 auto 10px; }
        .cw-thanks-title { margin: 18px 0 10px; color: var(--gold-soft); font-size: 2.8rem; }
        .cw-thanks p { color: var(--mist); font-size: 1.2rem; }
        @keyframes cw-fadein { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .cw-footer {
          border-top: 1px solid var(--line);
          background: var(--night-0);
          padding: 70px 24px 60px;
          text-align: center;
        }
        .cw-footer-names { color: var(--starlight); font-size: 2.4rem; font-style: italic; }
        .cw-footer-names span { color: var(--gold); }
        .cw-footer-meta {
          margin-top: 18px;
          color: var(--mist-dim);
          font-size: .72rem;
          letter-spacing: .3em;
          text-transform: uppercase;
        }
        @media (max-width: 820px) {
          .cw-motion-rail { display: none; }
          .cw-wrap { width: min(100% - 40px, 1120px); }
          .cw-hero { padding: 44px 24px 64px; }
          .cw-hero-inner { min-height: calc(100svh - 108px); }
          .cw-moon-stage { width: min(112vw, 480px); top: 45%; opacity: .58; }
          .cw-hero .cw-eyebrow { font-size: .62rem; letter-spacing: .34em; }
          .cw-hero-names { font-size: clamp(3.6rem, 19vw, 6.2rem); }
          .cw-hero-meta { gap: 8px; }
          .cw-hero-chip { min-height: 32px; font-size: .62rem; letter-spacing: .18em; padding: 8px 12px; }
          .cw-sky-grid,
          .cw-story-grid,
          .cw-venue-grid { grid-template-columns: 1fr; }
          .cw-sky-map { min-height: 330px; }
          .cw-sky-body h3 { font-size: clamp(2rem, 10vw, 2.8rem); }
          .cw-sky-card-grid { grid-template-columns: 1fr; }
          .cw-sky-card { min-height: 98px; }
          .cw-sky-planet { left: 62%; top: 28%; }
          .cw-venue-info { order: 2; }
          .cw-gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 130px; }
          .g-a, .g-c { grid-column: span 2; grid-row: span 2; }
          .g-b, .g-d, .g-e, .g-f { grid-column: span 1; grid-row: span 1; }
          .cw-row2 { grid-template-columns: 1fr; }
          .cw-attend { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cw-reveal { opacity: 1; transform: none; transition: none; }
          .cw-section-head h2,
          .cw-story-copy h2,
          .cw-venue-info h2 { clip-path: none !important; }
          .cw-moon-halo,
          .cw-count-dot,
          .cw-photo-orbit,
          .cw-scroll-cue span:last-child { animation: none; }
        }
      `}</style>
      <div className="cw-motion-rail" aria-hidden="true">
        <span className="cw-motion-line" />
        <span className="cw-motion-dot" />
      </div>

      <section className="cw-hero" id="hero">
        <canvas className="cw-starfield" ref={canvasRef} aria-hidden="true" />
        <div className="cw-hero-inner">
          <div className="cw-moon-stage" aria-hidden="true">
            <div className="cw-moon">
              <div className="cw-moon-halo" />
            </div>
          </div>
          <div className="cw-eyebrow cw-reveal in">Together with their families</div>
          <h1 className="cw-hero-names cw-reveal in cw-d1">
            Aurora<span>and</span>Elias
          </h1>
          <div className="cw-hero-line cw-reveal in cw-d2" aria-hidden="true" />
          <div className="cw-hero-meta cw-reveal in cw-d2">
            <div className="cw-hero-chip cw-hero-sub">Wedding Celebration</div>
            <div className="cw-hero-chip strong cw-hero-date">{eventDateLong}</div>
            <div className="cw-hero-chip">Napa Valley</div>
          </div>
        </div>
        <div className="cw-scroll-cue">
          <span>Scroll</span>
          <span />
        </div>
      </section>

      <section className="cw-countdown cw-section" id="countdown">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Counting down to forever
            </div>
            <h2>
              Until we say <span className="cw-script">I do</span>
            </h2>
          </div>
          <div className="cw-count-grid cw-reveal cw-d1">
            {countdown.map((item, index) => (
              <div className="cw-count-cell" key={item.label}>
                <div className="cw-count-orbit" />
                <span
                  className="cw-count-dot"
                  style={{ animationDuration: `${10 + index * 3}s` }}
                />
                <div className="cw-count-num">{item.value}</div>
                <div className="cw-count-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-sky cw-section" id="sky">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Wedding sky snapshot
            </div>
            <h2>Ay ve yıldızların konumu</h2>
            <p className="cw-lead">
              A stylized look at the Moon, Mercury and the evening stars over Napa
              on {eventDateLong}.
            </p>
          </div>
          <div className="cw-sky-grid">
            <div className="cw-sky-map cw-reveal">
              <div className="cw-sky-orbit o1" />
              <div className="cw-sky-orbit o2" />
              <div className="cw-sky-moon-phase" aria-label="Waxing crescent moon">
                <span />
              </div>
              <div className="cw-sky-planet">Mercury</div>
              {skyStars.map((star) => (
                <div
                  className="cw-sky-star"
                  key={star.name}
                  style={{ '--x': star.x, '--y': star.y, '--star-size': `${star.size}px` }}
                >
                  {star.name}
                </div>
              ))}
            </div>
            <div className="cw-sky-body cw-reveal cw-d1">
              <div className="cw-eyebrow">{eventDateShort} • Napa Valley</div>
              <h3>The sky above the vows</h3>
              <p>
                On the wedding evening, the Moon is shown as a slim waxing crescent.
                Mercury gets its own marker, while the star field keeps the invitation
                feeling celestial and personal.
              </p>
              <div className="cw-sky-card-grid">
                {skySnapshot.map((item) => (
                  <div className="cw-sky-card" key={item.label}>
                    <div className="cw-sky-card-label">{item.label}</div>
                    <div className="cw-sky-card-value">{item.value}</div>
                    <div className="cw-sky-card-meta">{item.meta}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-story cw-section" id="story">
        <div className="cw-wrap">
          <div className="cw-story-grid">
            <div className="cw-story-photo cw-reveal">
              <div className="cw-frame-ring" />
              <PhotoSlot label="Drop your favorite photo" />
            </div>
            <div className="cw-story-copy cw-reveal cw-d1">
              <div className="cw-eyebrow">Our Story</div>
              <h2>Written in the stars</h2>
              <p>
                We met on a rooftop in late autumn, both of us pretending to know
                the constellations. <span className="hl">Elias</span> pointed at a
                planet and called it a star; <span className="hl">Aurora</span> let
                him believe it for exactly three minutes.
              </p>
              <p>
                Five years, two cities and one very persistent houseplant later, he
                asked under that same sky - and this time, she knew every star by name.
              </p>
              <div className="cw-constellation">
                <svg width="220" height="44" viewBox="0 0 220 44" fill="none" aria-hidden="true">
                  <path d="M6 30 L52 14 L96 26 L140 10 L186 22 L214 8" stroke="currentColor" strokeWidth="1" strokeOpacity=".5" />
                  <g fill="currentColor">
                    <circle cx="6" cy="30" r="2.5" />
                    <circle cx="52" cy="14" r="3.5" />
                    <circle cx="96" cy="26" r="2" />
                    <circle cx="140" cy="10" r="3" />
                    <circle cx="186" cy="22" r="2.5" />
                    <circle cx="214" cy="8" r="3.5" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-schedule cw-section" id="schedule">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              The Order of Events
            </div>
            <h2>An evening under the sky</h2>
            <p className="cw-lead">
              Follow the moon through the night - from first light at the ceremony
              to the last dance beneath the stars.
            </p>
          </div>
          <div className="cw-timeline">
            {schedule.map((item, index) => (
              <div className={`cw-tl-item cw-reveal cw-d${Math.min(index, 3)}`} key={item.title}>
                <div className="cw-phase" aria-hidden="true">
                  <span className="cw-phase-lit" />
                  <span
                    className="cw-phase-shadow"
                    style={{ transform: `translateX(${item.phase}%)` }}
                  />
                </div>
                <div className="cw-tl-body">
                  <div className="cw-time">{item.time}</div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-venue cw-section" id="venue">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Where to find us
            </div>
            <h2>The Observatory Estate</h2>
          </div>
          <div className="cw-venue-grid">
            <div className="cw-starmap cw-reveal">
              <svg viewBox="0 0 400 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <g stroke="var(--line)" strokeWidth="1" fill="none">
                  <path d="M40 60 L120 110 L90 200 L180 230" />
                  <path d="M260 70 L330 130 L300 220 L360 280" />
                  <path d="M150 330 L230 300 L300 360" />
                </g>
                <g fill="var(--gold)" opacity=".75">
                  <circle cx="40" cy="60" r="2" />
                  <circle cx="120" cy="110" r="2.6" />
                  <circle cx="90" cy="200" r="1.8" />
                  <circle cx="180" cy="230" r="2.2" />
                  <circle cx="260" cy="70" r="2.4" />
                  <circle cx="330" cy="130" r="2" />
                  <circle cx="300" cy="220" r="2.6" />
                  <circle cx="360" cy="280" r="1.8" />
                  <circle cx="150" cy="330" r="2.2" />
                  <circle cx="230" cy="300" r="2.6" />
                  <circle cx="300" cy="360" r="2" />
                </g>
              </svg>
              <div className="cw-pin">
                <div className="cw-pin-dot" />
                <div className="cw-pin-tag">Lumiere Estate</div>
              </div>
            </div>
            <div className="cw-venue-info cw-reveal cw-d1">
              <div className="cw-eyebrow">The Celebration</div>
              <h2>Lumiere Estate</h2>
              <div className="cw-address">1700 Stargrove Lane, Napa Valley, California</div>
              {venueDetails.map((detail) => (
                <div className="cw-detail-row" key={detail.key}>
                  <div className="cw-detail-key">{detail.key}</div>
                  <div className="cw-detail-value">{detail.value}</div>
                </div>
              ))}
              <a
                className="cw-btn"
                href="https://maps.google.com/?q=Napa+Valley+California"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="cw-gallery cw-section" id="gallery">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Moments, collected
            </div>
            <h2>Our constellation</h2>
            <p className="cw-lead">
              A few of our favorite nights so far - drop in your own photos to make
              it yours.
            </p>
          </div>
          <div className="cw-gallery-grid cw-reveal cw-d1">
            {gallery.map((item, index) => (
              <div className={`cw-gallery-cell g-${String.fromCharCode(97 + index)}`} key={item}>
                <PhotoSlot label={item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cw-rsvp cw-section" id="rsvp">
        <div className="cw-wrap">
          <div className="cw-section-head cw-reveal">
            <Divider mark="star" />
            <div className="cw-eyebrow dim" style={{ marginTop: 18 }}>
              Kindly Reply
            </div>
            <h2>Will you join us?</h2>
            <p className="cw-lead">Please respond by the first of August, 2026.</p>
          </div>
          <div className="cw-rsvp-card cw-reveal cw-d1">
            <span className="cw-corner tl" />
            <span className="cw-corner tr" />
            <span className="cw-corner bl" />
            <span className="cw-corner br" />

            {submitted ? (
              <div className="cw-thanks">
                <div className="cw-moon" />
                <div className="cw-thanks-title cw-script">
                  {attending === 'yes' ? 'See you under the stars!' : "We'll miss you"}
                </div>
                <p>
                  {attending === 'yes'
                    ? `Thank you, ${firstName}. Your reply is on its way to us across the stars.`
                    : `Thank you for letting us know, ${firstName}. We will raise a glass to you under the moon.`}
                </p>
                <button className="cw-btn ghost" type="button" onClick={() => setSubmitted(false)}>
                  Edit response
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="cw-attend">
                  <input
                    checked={attending === 'yes'}
                    id="att-yes"
                    name="attending"
                    onChange={() => setAttending('yes')}
                    type="radio"
                    value="yes"
                  />
                  <label htmlFor="att-yes">Joyfully accepts</label>
                  <input
                    checked={attending === 'no'}
                    id="att-no"
                    name="attending"
                    onChange={() => setAttending('no')}
                    type="radio"
                    value="no"
                  />
                  <label htmlFor="att-no">Regretfully declines</label>
                </div>

                <div className={`cw-field ${errors.name ? 'err' : ''}`}>
                  <label htmlFor="in-name">Full name</label>
                  <input
                    id="in-name"
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Aurora Vance"
                    type="text"
                    value={formState.name}
                  />
                  <div className="cw-msg">Please let us know who is coming.</div>
                </div>

                <div className="cw-row2">
                  <div className={`cw-field ${errors.email ? 'err' : ''}`}>
                    <label htmlFor="in-email">Email</label>
                    <input
                      id="in-email"
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, email: event.target.value }))
                      }
                      placeholder="you@example.com"
                      type="email"
                      value={formState.email}
                    />
                    <div className="cw-msg">A valid email, please.</div>
                  </div>
                  {attending === 'yes' && (
                    <div className="cw-field">
                      <label htmlFor="in-guests">Number of guests</label>
                      <select id="in-guests" defaultValue="1">
                        <option value="1">1 - just me</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  )}
                </div>

                {attending === 'yes' && (
                  <div className="cw-field">
                    <label htmlFor="in-meal">Menu preference</label>
                    <select id="in-meal" defaultValue="">
                      <option value="">Select an option</option>
                      <option>Garden vegetarian</option>
                      <option>Land beef short rib</option>
                      <option>Sea seared halibut</option>
                      <option>Children's plate</option>
                    </select>
                  </div>
                )}

                <div className="cw-field">
                  <label htmlFor="in-note">A note for the couple</label>
                  <textarea
                    id="in-note"
                    placeholder="Leave a wish, a song request, or a memory"
                  />
                </div>
                <button className="cw-btn cw-submit" type="submit">
                  Send our reply
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="cw-footer">
        <Divider mark="star" />
        <div className="cw-footer-names">
          Aurora <span>&amp;</span> Elias
        </div>
        <div className="cw-footer-meta">12 - 09 - 2026 - Napa Valley, California</div>
      </footer>
    </div>
  )
}
