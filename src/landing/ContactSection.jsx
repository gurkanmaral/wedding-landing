import { useMemo, useState } from 'react'
import { priceRequestText, whatsappLink } from '../app/site.js'

export default function ContactSection({ templates, selected }) {
  const [chosenSlug, setChosenSlug] = useState('')
  const templateSlug = chosenSlug || selected || templates[0]?.slug || ''
  const template = useMemo(
    () => templates.find((item) => item.slug === templateSlug) ?? templates[0],
    [templateSlug, templates],
  )
  const message = priceRequestText(template)

  return (
    <section id="iletisim" className="lp-section lp-contact" aria-labelledby="contact-title">
      <div className="lp-contact__intro">
        <h2 id="contact-title" className="lp-h2">
          Davetiyenizi birlikte hazırlayalım
        </h2>
        <p className="lp-lead">
          Beğendiğiniz tasarımı seçin. Hazır Türkçe mesajla WhatsApp’a geçin; güncel fiyatı ve paket ayrıntılarını doğrudan sorun.
        </p>
      </div>

      <div className="lp-form">
        <label className="lp-field">
          <span>Fiyatını öğrenmek istediğiniz tasarım</span>
          <select value={templateSlug} onChange={(event) => setChosenSlug(event.target.value)}>
            {templates.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="lp-whatsapp-preview" aria-live="polite">
          <span>Gönderilecek mesaj</span>
          <p>{message}</p>
        </div>
        <div className="lp-form__submit">
          <a className="lp-button" href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
            WhatsApp’tan fiyat sor
          </a>
        </div>
      </div>
    </section>
  )
}
