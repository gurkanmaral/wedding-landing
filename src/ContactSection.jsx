import { useState } from 'react'
import { invitationRequestApi } from './api/weddingCardApi'

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  template: '',
  message: '',
}

export default function ContactSection({ activeTemplate, templates }) {
  const selectedTemplate = activeTemplate.href.replace(/^\//, '')
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, template: selectedTemplate }))
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'loading', message: '' })
    try {
      await invitationRequestApi.create(form)
      setForm({ ...EMPTY_FORM, template: selectedTemplate })
      setStatus({
        state: 'success',
        message: 'Talebiniz alındı. Sizinle en kısa sürede iletişime geçeceğiz.',
      })
    } catch (error) {
      setStatus({
        state: 'error',
        message: error?.message || 'Talebiniz gönderilemedi. Lütfen tekrar deneyin.',
      })
    }
  }

  return (
    <section id="contact" className="home-contact border-t border-stone-800 bg-[#171717] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
        <div data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f08068]">Bize ulaşın</p>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Davetiyenizi birlikte hazırlayalım.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-400">
            Beğendiğiniz tasarımı seçin ve iletişim bilgilerinizi bırakın. Detayları konuşmak için size dönüş yapalım.
          </p>
          <div className="mt-10 border-t border-white/15 pt-5 text-sm text-stone-400">
            Seçili tasarım: <strong className="font-semibold text-white">{activeTemplate.name}</strong>
          </div>
        </div>

        <form data-reveal className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="home-contact-field">
              <span>Ad soyad</span>
              <input required maxLength={120} autoComplete="name" value={form.fullName} onChange={update('fullName')} />
            </label>
            <label className="home-contact-field">
              <span>Telefon</span>
              <input required type="tel" maxLength={40} autoComplete="tel" value={form.phone} onChange={update('phone')} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="home-contact-field">
              <span>E-posta</span>
              <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={update('email')} />
            </label>
            <label className="home-contact-field">
              <span>Tasarım</span>
              <select value={form.template} onChange={update('template')}>
                {templates.map((template) => (
                  <option key={template.id} value={template.href.replace(/^\//, '')}>{template.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="home-contact-field">
            <span>Notunuz</span>
            <textarea maxLength={2000} rows={4} value={form.message} onChange={update('message')} />
          </label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button className="min-h-12 bg-[#f08068] px-6 text-sm font-semibold text-[#171717] transition hover:bg-white disabled:cursor-wait disabled:opacity-60" disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'Gönderiliyor…' : 'Talep gönder'}
            </button>
            {status.message && (
              <p className={`max-w-md text-sm leading-6 ${status.state === 'error' ? 'text-red-300' : 'text-emerald-300'}`} role="status">
                {status.message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
