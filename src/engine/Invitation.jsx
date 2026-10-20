import { useEffect, useMemo, useRef, useState } from 'react'
import { useWeddingCardFields } from '../api/weddingCardContext'
import { fill, strings } from './i18n.js'
import './engine.css'

/* ----------------------------------------------------------- helpers */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

// Reveals [data-reveal] elements once they reach the viewport. A scroll check
// (not only IntersectionObserver) means fast scrolls and anchor jumps never
// leave content hidden.
function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    root.classList.add('inv-animate')
    let frame = 0
    const check = () => {
      frame = 0
      const limit = window.innerHeight * 0.92
      root.querySelectorAll('[data-reveal]:not([data-shown])').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.setAttribute('data-shown', '')
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const fallback = setTimeout(check, 1200)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(fallback)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [rootRef])
}

function pad(n) {
  return String(Math.max(0, n)).padStart(2, '0')
}

function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function downloadIcs({ title, start, end, location, fileName }) {
  const escape = (v) => String(v).replace(/[\\,;]/g, (m) => `\\${m}`)
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedfolio//Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${start.getTime()}-${fileName}@wedfolio`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${fileName}.ics` })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------------------------------------------------------- sections */

function SectionHeading({ kicker, title, ornament }) {
  return (
    <header className="inv-heading" data-reveal>
      {kicker ? <p className="inv-kicker">{kicker}</p> : null}
      <h2 className="inv-title">{title}</h2>
      {ornament ? <div className="inv-ornament" aria-hidden="true">{ornament}</div> : null}
    </header>
  )
}

function Countdown({ target, t }) {
  const now = useNow()
  const diff = Math.max(0, target.getTime() - now)
  const total = Math.floor(diff / 1000)
  const parts = [
    [Math.floor(total / 86400), t.days],
    [Math.floor((total % 86400) / 3600), t.hours],
    [Math.floor((total % 3600) / 60), t.minutes],
    [total % 60, t.seconds],
  ]
  if (diff === 0) return <p className="inv-countdown-today">{t.today}</p>
  return (
    <div className="inv-countdown" role="timer" aria-label={`${parts[0][0]} ${t.days}`}>
      {parts.map(([value, label]) => (
        <div key={label} className="inv-countdown-cell">
          <span className="inv-countdown-value" aria-hidden="true">
            {label === t.days ? value : pad(value)}
          </span>
          <span className="inv-countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

function Rsvp({ t, deadline }) {
  const [state, setState] = useState({ sent: false, name: '', attending: 'yes' })
  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setState({ sent: true, name: String(data.get('name') || '').split(' ')[0], attending: data.get('attending') })
  }
  if (state.sent) {
    return (
      <p className="inv-rsvp-thanks" role="status">
        {fill(state.attending === 'yes' ? t.thanks : t.thanksSorry, { name: state.name })}
      </p>
    )
  }
  return (
    <form className="inv-rsvp" onSubmit={submit}>
      {deadline ? <p className="inv-rsvp-deadline">{fill(t.rsvpBy, { date: deadline })}</p> : null}
      <label className="inv-field">
        <span>{t.name}</span>
        <input name="name" required autoComplete="name" />
      </label>
      <fieldset className="inv-choice">
        <legend>{t.attending}</legend>
        <label>
          <input type="radio" name="attending" value="yes" defaultChecked /> <span>{t.yes}</span>
        </label>
        <label>
          <input type="radio" name="attending" value="no" /> <span>{t.no}</span>
        </label>
      </fieldset>
      <label className="inv-field">
        <span>{t.guests}</span>
        <select name="guests" defaultValue="1">
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="inv-field">
        <span>{t.note}</span>
        <textarea name="note" rows={3} />
      </label>
      <button type="submit" className="inv-button">
        {t.send}
      </button>
    </form>
  )
}

function CopyButton({ value, t }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="inv-link-button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1800)
        })
      }}
    >
      {done ? t.copied : t.copy}
    </button>
  )
}

/* ------------------------------------------------------------ engine */

/**
 * Shared invitation page for engine-built templates.
 * - theme: { className, fontsHref, ornament (ReactNode), Hero (component), Backdrop (component) }
 * - defaults: demo values for useWeddingCardFields (partner1, partner2, eventDate, venue, city, address, rsvpDeadline)
 * - content: { tr, en } — tagline, welcome, story[], schedule[], dressCode, gifts, quote
 * - lang: starting language; guests can switch TR/EN
 */
export default function Invitation({ theme, defaults, content, lang: initialLang = 'tr', sections }) {
  const rootRef = useRef(null)
  const [lang, setLang] = useState(initialLang)
  const t = strings[lang]
  const c = content[lang] ?? content[initialLang]
  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
  const fields = useWeddingCardFields(defaults, locale)
  const { partner1, partner2, eventDate, venue, city, address, rsvpDeadline, loading } = fields
  useReveal(rootRef)

  const dateLabel = useMemo(
    () => eventDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [eventDate, locale],
  )
  const timeLabel = eventDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const place = [venue, city].filter(Boolean).join(', ')
  const mapQuery = encodeURIComponent([venue, address, city].filter(Boolean).join(', '))
  const end = new Date(eventDate.getTime() + 7 * 3600 * 1000)
  const title = `${partner1} & ${partner2}`
  const googleCalendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${icsDate(eventDate)}/${icsDate(end)}&location=${mapQuery}`
  const order = sections ?? ['welcome', 'countdown', 'story', 'schedule', 'venue', 'dresscode', 'gifts', 'rsvp']
  const { Hero, Backdrop, ornament } = theme
  const heroProps = { partner1, partner2, dateLabel, timeLabel, venue, city, place, t, c, lang }

  const render = {
    welcome: () => (
      <section key="welcome" className="inv-section inv-welcome">
        <div className="inv-narrow" data-reveal>
          <p className="inv-lead">{c.welcome}</p>
        </div>
      </section>
    ),
    countdown: () => (
      <section key="countdown" className="inv-section inv-countdown-section">
        <SectionHeading kicker={dateLabel} title={t.countdown} ornament={ornament} />
        <div data-reveal>
          <Countdown target={eventDate} t={t} />
        </div>
        <div className="inv-actions" data-reveal>
          <a className="inv-button inv-button--ghost" href={googleCalendar} target="_blank" rel="noopener noreferrer">
            {t.addToCalendar}
          </a>
          <button
            type="button"
            className="inv-link-button"
            onClick={() => downloadIcs({ title, start: eventDate, end, location: place, fileName: `${partner1}-${partner2}`.toLowerCase() })}
          >
            .ics
          </button>
        </div>
      </section>
    ),
    story: () =>
      c.story?.length ? (
        <section key="story" className="inv-section inv-story">
          <SectionHeading title={t.story} ornament={ornament} />
          <ol className="inv-timeline">
            {c.story.map((item) => (
              <li key={item.title} data-reveal>
                <span className="inv-timeline-when">{item.when}</span>
                <h3>{item.title}</h3>
                <p>{fill(item.text, { partner1, partner2 })}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null,
    schedule: () => (
      <section key="schedule" className="inv-section inv-schedule">
        <SectionHeading kicker={dateLabel} title={t.schedule} ornament={ornament} />
        <ol className="inv-schedule-list">
          {c.schedule.map((item) => (
            <li key={item.time + item.title} data-reveal>
              <span className="inv-schedule-time">{item.time}</span>
              <div>
                <h3>{item.title}</h3>
                {item.text ? <p>{fill(item.text, { venue, city })}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </section>
    ),
    venue: () => (
      <section key="venue" className="inv-section inv-venue">
        <SectionHeading kicker={t.venue} title={venue} ornament={ornament} />
        <div className="inv-venue-grid">
          <div className="inv-venue-copy" data-reveal>
            <p className="inv-venue-address">{[address, city].filter(Boolean).join(' · ')}</p>
            {c.venueNote ? <p>{c.venueNote}</p> : null}
            <a className="inv-button" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer">
              {t.directions}
            </a>
          </div>
          <div className="inv-map" data-reveal>
            <iframe
              title={`${t.venue}: ${venue}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    ),
    dresscode: () =>
      c.dressCode ? (
        <section key="dresscode" className="inv-section inv-dresscode">
          <SectionHeading kicker={t.dressCode} title={c.dressCode.title} ornament={ornament} />
          <div className="inv-narrow" data-reveal>
            <p>{c.dressCode.text}</p>
            {c.dressCode.swatches ? (
              <ul className="inv-swatches" aria-label={c.dressCode.title}>
                {c.dressCode.swatches.map((color) => (
                  <li key={color} style={{ background: color }} />
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null,
    gifts: () =>
      c.gifts ? (
        <section key="gifts" className="inv-section inv-gifts">
          <SectionHeading kicker={t.gifts} title={c.gifts.title} ornament={ornament} />
          <div className="inv-narrow" data-reveal>
            <p>{c.gifts.text}</p>
            {c.gifts.iban ? (
              <p className="inv-iban">
                <span>{c.gifts.holder}</span>
                <code>{c.gifts.iban}</code>
                <CopyButton value={c.gifts.iban.replace(/\s/g, '')} t={t} />
              </p>
            ) : null}
          </div>
        </section>
      ) : null,
    rsvp: () => (
      <section key="rsvp" id="rsvp" className="inv-section inv-rsvp-section">
        <SectionHeading title={t.rsvp} ornament={ornament} />
        <div className="inv-narrow" data-reveal>
          <Rsvp t={t} deadline={rsvpDeadline} />
        </div>
      </section>
    ),
  }

  return (
    <div ref={rootRef} className={`inv-root ${theme.className}`} lang={lang}>
      {theme.fontsHref ? <link rel="stylesheet" precedence="default" href={theme.fontsHref} /> : null}
      {Backdrop ? <Backdrop {...heroProps} /> : null}

      <div className="inv-lang" role="group" aria-label={t.language}>
        {['tr', 'en'].map((code) => (
          <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
            {code.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="inv-status" role="status">
          {t.loading}
        </p>
      ) : null}

      <main>
        <Hero {...heroProps} />
        {order.map((key) => render[key]?.())}
      </main>

      <footer className="inv-footer">
        <p className="inv-footer-names">
          {partner1} <span>&amp;</span> {partner2}
        </p>
        <p>{c.quote ?? t.footer}</p>
        <p className="inv-footer-date">{dateLabel}</p>
      </footer>
    </div>
  )
}
