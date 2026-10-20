import { useState } from 'react'
import { invitationRequestApi } from '../api/weddingCardApi'
import { site, whatsappLink } from '../app/site.js'

const EMPTY_FORM = { fullName: '', email: '', phone: '', template: '', message: '' }

export default function ContactSection({ templates, selected }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, template: selected ?? templates[0]?.slug ?? '' }))
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'loading', message: '' })
    try {
      await invitationRequestApi.create(form)
      setForm({ ...EMPTY_FORM, template: form.template })
      setStatus({ state: 'success', message: 'Talebiniz bize ulaştı. En geç bir iş günü içinde size dönüyoruz.' })
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.message || 'Talebiniz gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin ya da WhatsApp’tan yazın.',
      })
    }
  }

  return (
    <section id="iletisim" className="lp-section lp-contact" aria-labelledby="contact-title">
      <div className="lp-contact__intro">
        <h2 id="contact-title" className="lp-h2">
          Davetiyenizi birlikte hazırlayalım
        </h2>
        <p className="lp-lead">
          Beğendiğiniz tasarımı seçin, bilgilerinizi bırakın. Tarih, mekân ve detayları konuşmak için size biz ulaşalım.
        </p>
        {site.whatsapp ? (
          <a className="lp-button lp-button--ghost" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
            WhatsApp’tan yazın
          </a>
        ) : null}
      </div>

      <form className="lp-form" onSubmit={submit}>
        <div className="lp-form__row">
          <label className="lp-field">
            <span>Ad soyad</span>
            <input required maxLength={120} autoComplete="name" value={form.fullName} onChange={update('fullName')} />
          </label>
          <label className="lp-field">
            <span>Telefon</span>
            <input required type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={update('phone')} />
          </label>
        </div>
        <div className="lp-form__row">
          <label className="lp-field">
            <span>E-posta</span>
            <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={update('email')} />
          </label>
          <label className="lp-field">
            <span>Tasarım</span>
            <select value={form.template} onChange={update('template')}>
              {templates.map((template) => (
                <option key={template.slug} value={template.slug}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="lp-field">
          <span>Düğün tarihi, şehir ve notunuz</span>
          <textarea maxLength={2000} rows={4} value={form.message} onChange={update('message')} />
        </label>
        <div className="lp-form__submit">
          <button className="lp-button" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Gönderiliyor…' : 'Talep gönder'}
          </button>
          {status.message ? (
            <p className="lp-form__status" data-state={status.state} role="status">
              {status.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}
