import { useEffect } from 'react'
import { templates } from '../templates/registry.js'
import { site } from '../app/site.js'
import ContactSection from './ContactSection.jsx'
import PhoneDemo from './PhoneDemo.jsx'
import './landing.css'

const INCLUDED = [
  'Dokunarak açılan özel giriş animasyonu',
  'Geri sayım ve takvime ekleme',
  'Program, hikâyeniz ve kıyafet notu',
  'Harita ve yol tarifi',
  'Katılım bildirimi (LCV) ve kişi sayısı',
  'Hediye notu ve kopyalanabilir IBAN',
  'Türkçe / İngilizce geçişi',
  'Size özel link ve QR kod',
]

// Product page for one design: the live invitation in a phone, price and an order form.
export default function DesignPage({ slug }) {
  const template = templates.find((t) => t.slug === slug)
  const others = templates.filter((t) => t.slug !== slug).slice(0, 4)

  useEffect(() => {
    document.title = template ? `${template.name} — ${site.name} dijital davetiye` : site.name
    document.documentElement.lang = 'tr'
  }, [template])

  if (!template) {
    return (
      <div className="lp">
        <main className="lp-section">
          <h1 className="lp-h2">Bu tasarımı bulamadık</h1>
          <p className="lp-lead">Bağlantı eski olabilir. Tüm tasarımlara göz atın.</p>
          <a className="lp-button" href="/#tasarimlar">
            Tasarımlara dön
          </a>
        </main>
      </div>
    )
  }

  return (
    <div className="lp">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600&display=swap"
      />
      <header className="lp-header">
        <a href="/" className="lp-logo">
          {site.name}
        </a>
        <nav aria-label="Ana menü" className="lp-nav">
          <a href="/#tasarimlar">Tasarımlar</a>
          <a href="/#paketler">Paketler</a>
          <a href="/#sss">SSS</a>
        </nav>
        <a href="#iletisim" className="lp-button lp-button--small">
          Bu tasarımla başla
        </a>
      </header>

      <main>
        <section className="lp-hero lp-design" aria-labelledby="design-title">
          <div className="lp-hero__demo">
            <PhoneDemo template={template} autoLoad />
            <p className="lp-design__hint">Dokunun, kaydırın ve katılım formunu bir misafir gibi deneyin.</p>
          </div>
          <div className="lp-hero__copy">
            <a className="lp-link" href="/#tasarimlar">
              ← Tüm tasarımlar
            </a>
            <h1 id="design-title" className="lp-h1">
              {template.name}
            </h1>
            <p className="lp-design__mood">{template.mood}</p>
            <p className="lp-lead">{template.blurb}</p>
            <p className="lp-design__price">
              <strong>${template.price}</strong> tek seferlik
            </p>
            <div className="lp-hero__actions">
              <a className="lp-button" href="#iletisim">
                Bu tasarımla başla
              </a>
              <a className="lp-button lp-button--ghost" href={template.path} target="_blank" rel="noopener noreferrer">
                Tam ekran önizle
              </a>
            </div>
            <ul className="lp-design__included" aria-label="Pakete dahil">
              {INCLUDED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <ContactSection templates={templates} selected={template.slug} />

        <section className="lp-section" aria-labelledby="others-title">
          <div className="lp-section__head">
            <h2 id="others-title" className="lp-h2">
              Diğer tasarımlar
            </h2>
          </div>
          <ul className="lp-grid">
            {others.map((t) => (
              <li key={t.slug}>
                <a className="lp-card" href={`/tasarim/${t.slug}`}>
                  <div className="lp-card__media" style={{ background: t.intro.bg }}>
                    <span className="lp-card__fallback">{t.name}</span>
                  </div>
                  <div className="lp-card__body">
                    <h3>{t.name}</h3>
                    <p>{t.mood}</p>
                    <span className="lp-card__price">${t.price}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="lp-footer">
        <span className="lp-logo">{site.name}</span>
        <p>Açıldığı an başlayan dijital düğün davetiyeleri.</p>
      </footer>
    </div>
  )
}
