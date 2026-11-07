import { priceRequestText, whatsappLink } from '../app/site.js'
import './template-price-contact.css'

export default function TemplatePriceContact({ template }) {
  const message = priceRequestText(template)

  return (
    <aside className="template-price-contact" aria-labelledby={`price-contact-${template.slug}`}>
      <div className="template-price-contact__inner">
        <p className="template-price-contact__eyebrow">Bu tasarımı beğendiniz mi?</p>
        <h2 id={`price-contact-${template.slug}`}>{template.name} için fiyat bilgisi alın</h2>
        <p className="template-price-contact__copy">
          Güncel fiyatı ve pakete dahil olan hizmetleri WhatsApp’tan hemen sorun.
        </p>
        <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer">
          WhatsApp’tan fiyat sor
        </a>
      </div>
    </aside>
  )
}
