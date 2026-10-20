import { useState } from 'react'
import { templates } from '../templates/registry.js'
import HeroEnvelope from './HeroEnvelope.jsx'
import './landing.css'

// Screenshots of each template's hero, keyed by slug (missing ones fall back to the envelope colours).
const previews = Object.fromEntries(
  Object.entries(import.meta.glob('./previews/*.jpg', { eager: true, import: 'default' })).map(([path, url]) => [
    path.match(/([\w-]+)\.jpg$/)[1],
    url,
  ]),
)

const steps = [
  {
    title: 'Choose a design',
    text: 'Open any invitation below and try it the way your guests will: break the seal, scroll the day, fill in the RSVP.',
  },
  {
    title: 'Send us your details',
    text: 'Names, date, venue, the order of the day and a few photos. We set up your invitation and send you a private link to review.',
  },
  {
    title: 'Share one link',
    text: 'Send it on WhatsApp or by email, or print it as a QR code on paper cards. It opens on any phone, no app needed.',
  },
]

function Seal({ template, size = 'md' }) {
  return (
    <span
      className={`landing-seal landing-seal--${size}`}
      style={{ '--seal': template.intro.seal, '--seal-ink': template.intro.sealInk, '--paper': template.intro.paper }}
      aria-hidden="true"
    >
      {template.couple[0][0]}
      {template.couple[1][0]}
    </span>
  )
}

function formatDate(template) {
  return new Date(`${template.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function TemplateCard({ template }) {
  const preview = previews[template.slug]
  return (
    <li className="landing-card">
      <a href={template.path} className="landing-card__link">
        <div className="landing-card__media" style={{ background: template.intro.bg }}>
          {preview ? <img src={preview} alt="" loading="lazy" width="1600" height="1000" /> : null}
          <Seal template={template} size="lg" />
        </div>
        <div className="landing-card__body">
          <div className="landing-card__heading">
            <h3>{template.name}</h3>
            <span className="landing-card__price">${template.price}</span>
          </div>
          <p className="landing-card__blurb">{template.blurb}</p>
          <p className="landing-card__meta">
            Shown with {template.couple[0]} &amp; {template.couple[1]}, {formatDate(template)}
            {template.lang === 'tr' ? ', in Turkish' : ''}
          </p>
          <p className="landing-card__features">{template.features.join(', ')}</p>
        </div>
      </a>
    </li>
  )
}

export default function LandingPage() {
  const [selected, setSelected] = useState(0)
  const active = templates[selected]

  return (
    <div className="landing">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Instrument+Sans:wght@400;500;600&display=swap"
      />
      <header className="landing-header">
        <a href="/" className="landing-logo">
          Wedfolio
        </a>
        <nav aria-label="Main">
          <a href="#invitations">Invitations</a>
          <a href="#how-it-works">How it works</a>
        </nav>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="hero-title">
          <div className="landing-hero__copy">
            <h1 id="hero-title">Wedding invitations that arrive sealed.</h1>
            <p className="landing-hero__lede">
              Your guests open a wax-sealed envelope on their phone. Inside is your whole day: the timeline, a countdown, the map
              and an RSVP form.
            </p>
            <a href="#invitations" className="landing-button landing-button--ghost">
              See all {templates.length} designs
            </a>
          </div>

          <div className="landing-hero__showcase">
            <HeroEnvelope key={active.slug} template={active}>
              <div className="landing-picker">
                <p className="landing-picker__current" aria-live="polite">
                  <span className="landing-picker__name">{active.name}</span>
                  <span className="landing-picker__mood">{active.mood}</span>
                </p>
                <div className="landing-picker__swatches" role="radiogroup" aria-label="Choose an envelope">
                  {templates.map((template, index) => (
                    <button
                      key={template.slug}
                      type="button"
                      role="radio"
                      aria-checked={index === selected}
                      aria-label={template.name}
                      title={template.name}
                      className="landing-picker__swatch"
                      onClick={() => setSelected(index)}
                    >
                      <Seal template={template} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            </HeroEnvelope>
          </div>
        </section>

        <section id="invitations" className="landing-section" aria-labelledby="invitations-title">
          <div className="landing-section__intro">
            <h2 id="invitations-title">Eight designs, each with its own envelope</h2>
            <p>Every invitation is a full website. Open one to see it exactly as a guest would.</p>
          </div>
          <ul className="landing-grid">
            {templates.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </ul>
        </section>

        <section id="how-it-works" className="landing-section landing-steps" aria-labelledby="steps-title">
          <h2 id="steps-title">How it works</h2>
          <ol>
            {steps.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-logo">Wedfolio</span>
        <p>Wedding invitation websites, made to be opened.</p>
      </footer>
    </div>
  )
}
