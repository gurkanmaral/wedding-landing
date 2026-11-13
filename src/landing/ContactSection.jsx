import { useMemo, useState } from 'react'
import { priceRequestText, whatsappLink } from '../app/site.js'
import { useI18n } from '../app/i18n.jsx'

export default function ContactSection({ templates, selected }) {
  const { locale } = useI18n()
  const c = locale === 'tr' ? {
    title: 'Davetiyenizi birlikte hazırlayalım', text: 'Beğendiğiniz tasarımı seçin; etkinliğinizi ve ihtiyaçlarınızı WhatsApp üzerinden bize anlatın.', label: 'Fiyatını öğrenmek istediğiniz tasarım', preview: 'Gönderilecek mesaj', button: 'WhatsApp’tan fiyat sor',
  } : {
    title: 'Let’s create your invitation', text: 'Choose a design, then tell us about your event and what you need on WhatsApp.', label: 'Design you would like pricing for', preview: 'Message preview', button: 'Ask on WhatsApp',
  }
  const [chosenSlug, setChosenSlug] = useState('')
  const templateSlug = chosenSlug || selected || templates[0]?.slug || ''
  const template = useMemo(
    () => templates.find((item) => item.slug === templateSlug) ?? templates[0],
    [templateSlug, templates],
  )
  const message = priceRequestText(template, locale)

  return (
    <section id="iletisim" className="lp-section lp-contact" aria-labelledby="contact-title">
      <div className="lp-contact__intro">
        <h2 id="contact-title" className="lp-h2">
          {c.title}
        </h2>
        <p className="lp-lead">
          {c.text}
        </p>
      </div>

      <div className="lp-form">
        <label className="lp-field">
          <span>{c.label}</span>
          <select value={templateSlug} onChange={(event) => setChosenSlug(event.target.value)}>
            {templates.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="lp-whatsapp-preview" aria-live="polite">
          <span>{c.preview}</span>
          <p>{message}</p>
        </div>
        <div className="lp-form__submit">
          <a className="lp-button" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
            {c.button}
          </a>
        </div>
      </div>
    </section>
  )
}
