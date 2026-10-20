import { useId, useState } from 'react'
import { adminWeddingCardApi } from '../api/weddingCardApi'
import { uniqueWeddingSlug } from '../api/weddingCardSlug'
import { ConfirmDialog, Drawer, Field, Icon, Spinner } from './adminUi'
import {
  adminErrorText,
  coupleName,
  dateLabelFromEvent,
  DETAIL_HINTS_TR,
  DETAIL_LABELS_TR,
  joinEventDate,
  splitEventDate,
} from './adminUtils'
import {
  changeDetailsTemplate,
  createTemplateDetails,
  findTemplateOption,
  getTemplateSchema,
  invitationHref,
  storedDetails,
  TEMPLATE_OPTIONS,
  templatePathFor,
} from './templateDetails'

const ADMIN_KEYS = ['template', 'slug', 'published']
const PARTNER_KEYS = ['partner1', 'partner2']
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const OFFSETS = [
  ['+03:00', 'Türkiye (UTC+3)'],
  ['+02:00', 'UTC+2'],
  ['+01:00', 'UTC+1'],
  ['+00:00', 'UTC'],
  ['-04:00', 'UTC−4'],
  ['-05:00', 'UTC−5'],
  ['-07:00', 'UTC−7'],
]

const joinNames = (a, b) => [a, b].map((item) => (item || '').trim()).filter(Boolean).join(' & ')

const cleanSlug = (value) => value
  .toLocaleLowerCase('en-US')
  .replace(/ı/g, 'i')
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[\s_]+/g, '-')
  .replace(/[^a-z0-9-]/g, '')
  .replace(/-{2,}/g, '-')

function initialDraft(card, prefill, cards) {
  if (card) {
    const details = { slug: '', published: 'false', ...storedDetails(card.details) }
    return {
      name: card.name || '',
      userId: card.userId || '',
      details,
      nameTouched: (card.name || '') !== joinNames(details.partner1, details.partner2),
      slugTouched: true,
    }
  }
  const base = createTemplateDetails(prefill?.template || 'artdeco')
  const details = { slug: '', published: 'false', ...base, partner1: prefill?.partner1 || '', partner2: prefill?.partner2 || '' }
  if (prefill?.eventDate) {
    details.eventDate = prefill.eventDate
    details.dateLabel = dateLabelFromEvent(prefill.eventDate, details.template)
  }
  if (details.partner1 || details.partner2) details.slug = uniqueWeddingSlug(details.partner1, details.partner2, cards)
  return { name: joinNames(details.partner1, details.partner2), userId: '', details, nameTouched: false, slugTouched: false }
}

function TemplatePicker({ value, onChange }) {
  const current = findTemplateOption(value)?.value || value
  return (
    <fieldset className="wf-template-picker">
      <legend>Şablon</legend>
      <p className="wf-hint">Seçtiğiniz şablon, konukların açtığı davetiye sayfasının tasarımını belirler.</p>
      <div className="wf-template-grid" role="radiogroup" aria-label="Şablon seçin">
        {TEMPLATE_OPTIONS.map((option) => (
          <label key={option.value} className={`wf-template-option ${current === option.value ? 'is-selected' : ''}`}>
            <input type="radio" name="wf-template" value={option.value} checked={current === option.value} onChange={() => onChange(option.value)} />
            <span className="wf-template-option__swatch" style={{ background: option.swatch }} aria-hidden="true" />
            <span className="wf-template-option__text">
              <strong>{option.label}</strong>
              <small>{option.lang === 'tr' ? 'Türkçe' : 'İngilizce'}</small>
            </span>
            {current === option.value && <Icon name="check" size={16} className="wf-template-option__check" />}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function CardEditorDrawer({ open, card, prefill, fromRequest, cards, onClose, onSaved, onDeleted, onAuthError, notify }) {
  const uid = useId()
  const [draft, setDraft] = useState(() => initialDraft(card, prefill, cards))
  const [snapshot] = useState(() => JSON.stringify(initialDraft(card, prefill, cards)))
  const [newField, setNewField] = useState({ key: '', value: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { details } = draft
  const schema = getTemplateSchema(details.template)
  const placeFields = schema.fields.filter((key) => !PARTNER_KEYS.includes(key))
  const knownKeys = new Set([...ADMIN_KEYS, ...schema.fields])
  const extraKeys = Object.keys(details).filter((key) => !knownKeys.has(key))
  const dirty = JSON.stringify(draft) !== snapshot
  const path = templatePathFor(details.template)
  const liveHref = card ? invitationHref(card.details) : null
  const fieldId = (key) => `${uid}-${key}`

  const setDetail = (key, value) => setDraft((current) => {
    const nextDetails = { ...current.details, [key]: value }
    const next = { ...current, details: nextDetails }
    if (PARTNER_KEYS.includes(key)) {
      if (!current.nameTouched) next.name = joinNames(nextDetails.partner1, nextDetails.partner2)
      if (!current.slugTouched) {
        nextDetails.slug = nextDetails.partner1 || nextDetails.partner2
          ? uniqueWeddingSlug(nextDetails.partner1, nextDetails.partner2, cards, card?.id)
          : ''
      }
    }
    return next
  })

  const setEventDate = (local, offset) => setDraft((current) => {
    const previous = current.details.eventDate
    const nextValue = joinEventDate(local, offset)
    const previousAuto = dateLabelFromEvent(previous, current.details.template)
    const nextDetails = { ...current.details, eventDate: nextValue }
    if (!current.details.dateLabel || current.details.dateLabel === previousAuto) {
      nextDetails.dateLabel = dateLabelFromEvent(nextValue, current.details.template)
    }
    return { ...current, details: nextDetails }
  })

  const changeTemplate = (value) => setDraft((current) => ({ ...current, details: changeDetailsTemplate(current.details, value) }))

  const suggestSlug = () => {
    setDraft((current) => ({
      ...current,
      slugTouched: false,
      details: { ...current.details, slug: uniqueWeddingSlug(current.details.partner1, current.details.partner2, cards, card?.id) },
    }))
    setErrors((current) => ({ ...current, slug: undefined }))
  }

  const addField = () => {
    const key = newField.key.trim()
    if (!key) {
      setErrors((current) => ({ ...current, newField: 'Alan adı boş bırakılamaz.' }))
      return
    }
    if (key.length > 100) {
      setErrors((current) => ({ ...current, newField: 'Alan adı en fazla 100 karakter olabilir.' }))
      return
    }
    if (Object.hasOwn(details, key)) {
      setErrors((current) => ({ ...current, newField: 'Bu adla bir alan zaten var.' }))
      return
    }
    setDraft((current) => ({ ...current, details: { ...current.details, [key]: newField.value } }))
    setNewField({ key: '', value: '' })
    setErrors((current) => ({ ...current, newField: undefined }))
  }

  const removeField = (key) => setDraft((current) => {
    const nextDetails = { ...current.details }
    delete nextDetails[key]
    return { ...current, details: nextDetails }
  })

  const effectiveName = () => draft.name.trim() || joinNames(details.partner1, details.partner2) || 'Yeni davetiye'

  const validate = () => {
    const next = {}
    if (effectiveName().length > 200) next.name = 'Davetiye adı en fazla 200 karakter olabilir.'
    if (!details.partner1?.trim() && !details.partner2?.trim()) next.partner1 = 'En az bir isim girin.'
    const slug = (details.slug || '').trim()
    if (!slug) next.slug = 'Bağlantı adresi boş bırakılamaz. “Adlardan öner” ile otomatik oluşturabilirsiniz.'
    else if (slug.length > 100) next.slug = 'Bağlantı adresi en fazla 100 karakter olabilir.'
    else if (!SLUG_PATTERN.test(slug)) next.slug = 'Bağlantı adresi yalnızca küçük harf, rakam ve tek tire (-) içerebilir; tire ile başlayıp bitemez.'
    else if (cards.some((item) => item.id !== card?.id && item.details?.slug === slug)) next.slug = 'Bu bağlantı adresi başka bir davetiyede kullanılıyor.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) {
      setFormError('Kaydetmeden önce işaretli alanları düzeltin.')
      return
    }
    setSaving(true)
    const name = effectiveName()
    const userId = draft.userId.trim() || null
    const payload = Object.fromEntries(Object.entries({ ...details, slug: details.slug.trim() }).map(([key, value]) => [key, String(value ?? '')]))
    try {
      if (!card) {
        const created = await adminWeddingCardApi.create({ name, userId, details: payload })
        await onSaved(created, true)
        return
      }
      if (name !== card.name || userId !== (card.userId || null)) {
        await adminWeddingCardApi.update(card.id, { name, userId })
      }
      const original = card.details || {}
      const changed = Object.entries(payload).filter(([key, value]) => original[key] !== value)
      const slugChange = changed.find(([key]) => key === 'slug')
      if (slugChange) await adminWeddingCardApi.upsertDetail(card.id, 'slug', slugChange[1])
      await Promise.all(changed.filter(([key]) => key !== 'slug').map(([key, value]) => adminWeddingCardApi.upsertDetail(card.id, key, value)))
      const removed = Object.keys(original).filter((key) => !Object.hasOwn(payload, key))
      await Promise.all(removed.map((key) => adminWeddingCardApi.removeDetail(card.id, key)))
      await onSaved(card, false)
    } catch (error) {
      if (onAuthError(error)) return
      const message = adminErrorText(error, 'Davetiye kaydedilemedi.')
      if (/bağlantı adresi/i.test(message)) setErrors((current) => ({ ...current, slug: message }))
      setFormError(message)
      setSaving(false)
    }
  }

  const requestClose = () => {
    if (saving) return
    if (dirty) setConfirm('discard')
    else onClose()
  }

  const remove = async () => {
    setDeleting(true)
    try {
      await adminWeddingCardApi.remove(card.id)
      notify('success', `“${coupleName(card)}” davetiyesi silindi.`)
      setConfirm(null)
      await onDeleted(card.id)
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'Davetiye silinemedi.'))
      setDeleting(false)
    }
  }

  const renderInput = (key) => {
    const id = fieldId(key)
    const value = details[key] ?? ''
    if (key === 'eventDate') {
      const { local, offset } = splitEventDate(value)
      const offsets = OFFSETS.some(([item]) => item === offset) ? OFFSETS : [[offset, `UTC${offset}`], ...OFFSETS]
      return (
        <Field key={key} label={DETAIL_LABELS_TR[key]} htmlFor={id} hint="Geri sayım ve takvim bu tarihe göre çalışır." wide>
          <div className="wf-input-row">
            <input id={id} type="datetime-local" value={local} onChange={(event) => setEventDate(event.target.value, offset)} />
            <label className="wf-sr-only" htmlFor={`${id}-tz`}>Saat dilimi</label>
            <select id={`${id}-tz`} value={offset} onChange={(event) => setEventDate(local, event.target.value)} aria-label="Saat dilimi">
              {offsets.map(([item, label]) => <option key={item} value={item}>{label}</option>)}
            </select>
          </div>
        </Field>
      )
    }
    if (key === 'description') {
      return (
        <Field key={key} label={DETAIL_LABELS_TR[key]} htmlFor={id} wide>
          <textarea id={id} rows={4} value={value} onChange={(event) => setDetail(key, event.target.value)} />
        </Field>
      )
    }
    if (key === 'dateLabel') {
      return (
        <Field key={key} label={DETAIL_LABELS_TR[key]} htmlFor={id} hint={DETAIL_HINTS_TR[key]}>
          <div className="wf-input-row">
            <input id={id} value={value} onChange={(event) => setDetail(key, event.target.value)} />
            <button type="button" className="wf-btn wf-btn--ghost wf-btn--sm" onClick={() => setDetail(key, dateLabelFromEvent(details.eventDate, details.template))} disabled={!details.eventDate}>Tarihten üret</button>
          </div>
        </Field>
      )
    }
    return (
      <Field key={key} label={DETAIL_LABELS_TR[key] || key} htmlFor={id} hint={DETAIL_HINTS_TR[key]} wide={key === 'address'}>
        <input id={id} value={value} onChange={(event) => setDetail(key, event.target.value)} />
      </Field>
    )
  }

  const footer = (
    <>
      {card && (
        <button type="button" className="wf-btn wf-btn--danger-ghost" onClick={() => setConfirm('delete')} disabled={saving}>
          <Icon name="trash" size={16} /> Sil
        </button>
      )}
      <span className="wf-drawer__spacer" />
      <button type="button" className="wf-btn wf-btn--ghost" onClick={requestClose} disabled={saving}>Vazgeç</button>
      <button type="submit" form={`${uid}-form`} className="wf-btn wf-btn--primary" disabled={saving}>
        {saving ? <><Spinner label="Kaydediliyor" /> Kaydediliyor…</> : card ? 'Değişiklikleri kaydet' : 'Davetiyeyi oluştur'}
      </button>
    </>
  )

  return (
    <>
      <Drawer
        open={open}
        title={card ? coupleName(card) : 'Yeni davetiye'}
        subtitle={card ? 'Davetiyeyi düzenle' : 'Davetiye oluştur'}
        onClose={requestClose}
        footer={footer}
      >
        <form id={`${uid}-form`} className="wf-form wf-editor" onSubmit={save} noValidate>
          {fromRequest && (
            <div className="wf-alert wf-alert--info">
              <Icon name="inbox" size={16} />
              <span><strong>{fromRequest.fullName}</strong> talebinden hazırlanıyor. İsimleri ve tarihi mesajdan çıkarmaya çalıştık; lütfen kontrol edin.</span>
            </div>
          )}
          {formError && <div className="wf-alert wf-alert--error" role="alert">{formError}</div>}

          <section className="wf-editor__section">
            <TemplatePicker value={details.template} onChange={changeTemplate} />
          </section>

          <section className="wf-editor__section" aria-labelledby={`${uid}-couple`}>
            <h3 id={`${uid}-couple`}>Çift</h3>
            <div className="wf-grid-2">
              <Field label={DETAIL_LABELS_TR.partner1} htmlFor={fieldId('partner1')} error={errors.partner1}>
                <input id={fieldId('partner1')} data-autofocus value={details.partner1 || ''} onChange={(event) => setDetail('partner1', event.target.value)} placeholder="ör. Ayşe" autoComplete="off" aria-invalid={Boolean(errors.partner1)} />
              </Field>
              <Field label={DETAIL_LABELS_TR.partner2} htmlFor={fieldId('partner2')}>
                <input id={fieldId('partner2')} value={details.partner2 || ''} onChange={(event) => setDetail('partner2', event.target.value)} placeholder="ör. Mehmet" autoComplete="off" />
              </Field>
              <Field label="Davetiye adı" htmlFor={fieldId('name')} hint="Yalnızca panelde görünür; boş bırakırsanız isimlerden oluşturulur." error={errors.name} wide>
                <input
                  id={fieldId('name')}
                  value={draft.name}
                  maxLength={200}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value, nameTouched: true }))}
                  aria-invalid={Boolean(errors.name)}
                />
              </Field>
            </div>
          </section>

          <section className="wf-editor__section" aria-labelledby={`${uid}-place`}>
            <h3 id={`${uid}-place`}>Tarih ve mekân</h3>
            <div className="wf-grid-2">{placeFields.map(renderInput)}</div>
          </section>

          <section className="wf-editor__section" aria-labelledby={`${uid}-share`}>
            <h3 id={`${uid}-share`}>Paylaşım</h3>
            <Field label={DETAIL_LABELS_TR.slug} htmlFor={fieldId('slug')} error={errors.slug} hint="Konuklarla paylaşılan adres. Çift isimlerinden otomatik önerilir." wide>
              <div className="wf-slug">
                <span className="wf-slug__prefix" aria-hidden="true">{path}/</span>
                <input
                  id={fieldId('slug')}
                  value={details.slug || ''}
                  onChange={(event) => {
                    const slug = cleanSlug(event.target.value)
                    setDraft((current) => ({ ...current, slugTouched: true, details: { ...current.details, slug } }))
                  }}
                  placeholder="ayse-mehmet"
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={Boolean(errors.slug)}
                />
                <button type="button" className="wf-btn wf-btn--ghost wf-btn--sm" onClick={suggestSlug}><Icon name="sparkle" size={15} /> Adlardan öner</button>
              </div>
            </Field>
            <label className="wf-switch">
              <input
                type="checkbox"
                checked={details.published === 'true'}
                onChange={(event) => setDetail('published', event.target.checked ? 'true' : 'false')}
              />
              <span className="wf-switch__track" aria-hidden="true"><span /></span>
              <span className="wf-switch__text">
                <strong>Ana sayfada yayınla</strong>
                <small>{details.published === 'true' ? 'Davetiye herkese açık listelerde görünür.' : 'Taslak: yalnızca bağlantıyı bilenler açabilir.'}</small>
              </span>
            </label>
            {liveHref && (
              <a className="wf-btn wf-btn--ghost wf-btn--sm wf-editor__preview" href={liveHref} target="_blank" rel="noopener noreferrer">
                <Icon name="external" size={15} /> Kayıtlı davetiyeyi aç
              </a>
            )}
          </section>

          <section className="wf-editor__section" aria-labelledby={`${uid}-extra`}>
            <h3 id={`${uid}-extra`}>Ek alanlar</h3>
            <p className="wf-hint">Bu şablonun standart alanları dışında kayıtlı bilgiler. Kaldırdığınız alanlar kaydettiğinizde silinir.</p>
            {extraKeys.length > 0 && (
              <ul className="wf-extra-list">
                {extraKeys.map((key) => (
                  <li key={key}>
                    <label htmlFor={fieldId(`extra-${key}`)}><code>{key}</code></label>
                    <input id={fieldId(`extra-${key}`)} value={details[key] ?? ''} onChange={(event) => setDetail(key, event.target.value)} />
                    <button type="button" className="wf-icon-btn wf-icon-btn--danger" onClick={() => removeField(key)} aria-label={`${key} alanını kaldır`}><Icon name="close" size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="wf-extra-add">
              <div className="wf-field">
                <label htmlFor={fieldId('new-key')}>Alan adı</label>
                <input id={fieldId('new-key')} value={newField.key} onChange={(event) => setNewField((current) => ({ ...current, key: event.target.value }))} placeholder="ör. receptionAddress" aria-invalid={Boolean(errors.newField)} />
              </div>
              <div className="wf-field">
                <label htmlFor={fieldId('new-value')}>Değer</label>
                <input id={fieldId('new-value')} value={newField.value} onChange={(event) => setNewField((current) => ({ ...current, value: event.target.value }))} />
              </div>
              <button type="button" className="wf-btn wf-btn--ghost" onClick={addField}><Icon name="plus" size={16} /> Ekle</button>
            </div>
            {errors.newField && <p className="wf-field-error" role="alert">{errors.newField}</p>}
          </section>

          <details className="wf-editor__advanced">
            <summary>Gelişmiş ayarlar</summary>
            <Field label="Sahip hesap kimliği (isteğe bağlı)" htmlFor={fieldId('userId')} hint="Davetiyeyi kayıtlı bir müşteri hesabına bağlamak için kullanıcı kimliğini girin. Boş bırakırsanız davetiye yönetime ait olur." wide>
              <input id={fieldId('userId')} value={draft.userId} onChange={(event) => setDraft((current) => ({ ...current, userId: event.target.value }))} spellCheck={false} autoComplete="off" />
            </Field>
            {card && <p className="wf-hint">Kayıt kimliği: <code>{card.id}</code></p>}
          </details>
        </form>
      </Drawer>

      <ConfirmDialog
        open={confirm === 'discard'}
        title="Değişiklikler kaydedilmedi"
        confirmLabel="Kaydetmeden kapat"
        cancelLabel="Düzenlemeye dön"
        tone="neutral"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); onClose() }}
      >
        <p>Bu paneli kapatırsanız yaptığınız değişiklikler kaybolacak.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'delete'}
        title="Davetiye silinsin mi?"
        confirmLabel="Davetiyeyi sil"
        busy={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      >
        <p><strong>{card && coupleName(card)}</strong> davetiyesi ve tüm ayrıntıları kalıcı olarak silinecek. Paylaşılan bağlantı artık açılmayacak. Bu işlem geri alınamaz.</p>
      </ConfirmDialog>
    </>
  )
}
