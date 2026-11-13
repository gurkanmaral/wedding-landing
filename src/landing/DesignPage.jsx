import { useMemo } from 'react'
import { templates } from '../templates/registry.js'
import { priceRequestText, site, whatsappLink } from '../app/site.js'
import { designStructuredData, useSeo } from '../app/seo.js'
import { LanguageSwitch, useI18n } from '../app/i18n.jsx'
import ContactSection from './ContactSection.jsx'
import PhoneDemo from './PhoneDemo.jsx'
import TemplatePreview from './TemplatePreview.jsx'
import './landing.css'

const INCLUDED_TR = [
  'Dokunarak açılan özel giriş animasyonu',
  'Geri sayım ve takvime ekleme',
  'Program, hikâyeniz ve kıyafet notu',
  'Harita ve yol tarifi',
  'Katılım bildirimi (LCV) ve kişi sayısı',
  'Hediye notu ve kopyalanabilir IBAN',
  'Türkçe / İngilizce geçişi',
  'Size özel link ve QR kod',
]
const INCLUDED_EN = ['Interactive opening animation', 'Countdown and add to calendar', 'Schedule and event details', 'Map and directions', 'RSVP and party size', 'Gift information', 'English / Turkish switch', 'Personal link and QR code']

// Product page for one design: the live invitation in a phone, price and an order form.
export default function DesignPage({ slug }) {
  const { locale } = useI18n()
  const c = locale === 'tr' ? {
    designs: 'Tasarımlar', plans: 'Paketler', faq: 'SSS', start: 'Bu tasarımla başla', all: '← Tüm tasarımlar', kind: 'dijital davetiye', price: 'Güncel fiyat ve paket ayrıntıları için WhatsApp’tan yazın.', ask: 'WhatsApp’tan fiyat sor', full: 'Tam ekran önizle', hint: 'Dokunun, kaydırın ve davetiyeyi bir misafir gibi deneyin.', others: 'Diğer tasarımlar', footer: 'Açıldığı an başlayan dijital davetiyeler.', missing: 'Bu tasarımı bulamadık', back: 'Tasarımlara dön',
  } : {
    designs: 'Designs', plans: 'Plans', faq: 'FAQ', start: 'Start with this design', all: '← All designs', kind: 'digital invitation', price: 'Message us on WhatsApp for current pricing and package details.', ask: 'Ask on WhatsApp', full: 'Full-screen preview', hint: 'Tap and scroll to experience it just like a guest.', others: 'More designs', footer: 'Digital invitations that come alive when opened.', missing: 'Design not found', back: 'Browse designs',
  }
  const template = templates.find((t) => t.slug === slug)
  const others = templates.filter((t) => t.slug !== slug).slice(0, 4)

  const seo = useMemo(() => {
    if (!template) {
      return {
        title: `${c.missing} | ${site.name}`,
        description: c.missing,
        path: `/tasarim/${slug}`,
        robots: 'noindex, follow',
      }
    }
    return {
      title: `${template.name} Digital Invitation | ${site.name}`,
      description: `${template.name} animated digital invitation. Explore the live design and get pricing.`,
      path: `/tasarim/${template.slug}`,
      imageAlt: `${template.name} digital invitation preview`,
      structuredData: designStructuredData(template),
    }
  }, [c.missing, slug, template])
  useSeo(seo)

  if (!template) {
    return (
      <div className="lp">
        <main className="lp-section">
          <h1 className="lp-h2">{c.missing}</h1>
          <a className="lp-button" href="/#tasarimlar">
            {c.back}
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
          <a href="/#tasarimlar">{c.designs}</a><a href="/#paketler">{c.plans}</a><a href="/#sss">{c.faq}</a>
        </nav>
        <LanguageSwitch />
        <a href="#iletisim" className="lp-button lp-button--small">
          {c.start}
        </a>
      </header>

      <main>
        <section className="lp-hero lp-design" aria-labelledby="design-title">
          <div className="lp-hero__demo">
            <PhoneDemo template={template} autoLoad />
            <p className="lp-design__hint">{c.hint}</p>
          </div>
          <div className="lp-hero__copy">
            <a className="lp-link" href="/#tasarimlar">
              {c.all}
            </a>
            <h1 id="design-title" className="lp-h1">
              {template.name} {c.kind}
            </h1>
            {locale === 'tr' && <><p className="lp-design__mood">{template.mood}</p><p className="lp-lead">{template.blurb}</p></>}
            <p className="lp-design__price">{c.price}</p>
            <div className="lp-hero__actions">
              <a className="lp-button" href={whatsappLink(priceRequestText(template, locale))} target="_blank" rel="noopener noreferrer">
                {c.ask}
              </a>
              <a className="lp-button lp-button--ghost" href={template.path} target="_blank" rel="noopener noreferrer">
                {c.full}
              </a>
            </div>
            <ul className="lp-design__included" aria-label="Pakete dahil">
              {(locale === 'tr' ? INCLUDED_TR : INCLUDED_EN).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <ContactSection templates={templates} selected={template.slug} />

        <section className="lp-section" aria-labelledby="others-title">
          <div className="lp-section__head">
            <h2 id="others-title" className="lp-h2">
              {c.others}
            </h2>
          </div>
          <ul className="lp-grid">
            {others.map((t) => (
              <li key={t.slug}>
                <a className="lp-card" href={`/tasarim/${t.slug}`}>
                  <TemplatePreview template={t} />
                  <div className="lp-card__body">
                    <h3>{t.name}</h3>
                    <p>{locale === 'tr' ? t.mood : 'An immersive, animated invitation'}</p>
                    <span className="lp-card__price">{c.ask}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="lp-footer">
        <span className="lp-logo">{site.name}</span>
        <p>{c.footer}</p>
      </footer>
    </div>
  )
}
