import { useId, useMemo, useState } from 'react'
import { adminInvitationRequestApi } from '../api/weddingCardApi'
import { ConfirmDialog, EmptyState, ErrorState, Icon, PageHeader, Skeleton, Spinner, StatusBadge, TemplateBadge } from './adminUi'
import {
  adminErrorText,
  formatDateTime,
  normalizeSearch,
  parseRequestForCard,
  REQUEST_STATUSES,
  requestStatusLabel,
  telHref,
  whatsappHref,
} from './adminUtils'
import { findTemplateOption } from './templateDetails'

const NOTE_LIMIT = 2000

function NoteEditor({ request, onSaved, onAuthError, notify }) {
  const id = useId()
  const [value, setValue] = useState(request.adminNote || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = value.trim() !== (request.adminNote || '').trim()

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminInvitationRequestApi.updateNote(request.id, value)
      const adminNote = value.trim() || null
      onSaved({ ...request, adminNote, updatedAtUtc: new Date().toISOString() })
      setValue(adminNote || '')
      notify('success', adminNote ? 'Not kaydedildi.' : 'Not temizlendi.')
    } catch (saveError) {
      if (!onAuthError(saveError)) setError(adminErrorText(saveError, 'Not kaydedilemedi.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="wf-note" onSubmit={save}>
      <label htmlFor={id}><Icon name="note" size={16} /> Yönetici notu</label>
      <textarea
        id={id}
        rows={4}
        maxLength={NOTE_LIMIT}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Görüşme notları, fiyat teklifi, hatırlatmalar… Bu not yalnızca yöneticilere görünür."
        aria-describedby={`${id}-meta`}
      />
      <div className="wf-note__foot">
        <span id={`${id}-meta`} className="wf-hint">{dirty ? 'Kaydedilmemiş değişiklik var.' : request.adminNote ? 'Kaydedildi.' : 'Henüz not yok.'} {value.length}/{NOTE_LIMIT}</span>
        <button type="submit" className="wf-btn wf-btn--primary wf-btn--sm" disabled={!dirty || saving}>
          {saving ? <><Spinner label="Kaydediliyor" /> Kaydediliyor…</> : 'Notu kaydet'}
        </button>
      </div>
      {error && <p className="wf-field-error" role="alert">{error}</p>}
    </form>
  )
}

function RequestDetail({ request, onBack, onChanged, onDelete, onCreateCard, onAuthError, notify }) {
  const [statusBusy, setStatusBusy] = useState('')
  const template = findTemplateOption(request.template)
  const wa = whatsappHref(request.phone)
  const tel = telHref(request.phone)
  const currentIndex = REQUEST_STATUSES.findIndex((item) => item.value === request.status)

  const setStatus = async (status) => {
    if (status === request.status) return
    setStatusBusy(status)
    try {
      await adminInvitationRequestApi.updateStatus(request.id, status)
      onChanged({ ...request, status, updatedAtUtc: new Date().toISOString() })
      notify('success', `Talep “${requestStatusLabel(status)}” olarak işaretlendi.`)
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'Talebin durumu güncellenemedi.'))
    } finally {
      setStatusBusy('')
    }
  }

  return (
    <article className="wf-request" aria-labelledby="wf-request-title">
      <button type="button" className="wf-link-btn wf-request__back" onClick={onBack}><Icon name="back" size={16} /> Taleplere dön</button>
      <header className="wf-request__head">
        <div>
          <p className="wf-eyebrow">{formatDateTime(request.createdAtUtc)} tarihinde geldi</p>
          <h2 id="wf-request-title">{request.fullName}</h2>
          {request.updatedAtUtc && <p className="wf-hint">Son güncelleme: {formatDateTime(request.updatedAtUtc)}</p>}
        </div>
        <StatusBadge status={request.status} />
      </header>

      <div className="wf-contact">
        {tel && <a className="wf-btn wf-btn--ghost" href={tel}><Icon name="phone" size={16} /> Ara</a>}
        {wa && <a className="wf-btn wf-btn--ghost" href={wa} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} /> WhatsApp</a>}
        {request.email && <a className="wf-btn wf-btn--ghost" href={`mailto:${request.email}`}><Icon name="mail" size={16} /> E-posta gönder</a>}
      </div>

      <dl className="wf-facts">
        <div><dt>Telefon</dt><dd>{tel ? <a href={tel}>{request.phone}</a> : request.phone || '—'}</dd></div>
        <div><dt>E-posta</dt><dd>{request.email ? <a href={`mailto:${request.email}`}>{request.email}</a> : '—'}</dd></div>
        <div>
          <dt>İstenen şablon</dt>
          <dd>
            {request.template ? <TemplateBadge template={request.template} /> : 'Belirtilmedi'}
            {template && <a className="wf-inline-link" href={template.path} target="_blank" rel="noopener noreferrer">Örneği aç <Icon name="external" size={13} /></a>}
          </dd>
        </div>
        <div className="wf-facts__wide">
          <dt>Mesaj</dt>
          <dd className="wf-message">{request.message?.trim() || <span className="wf-muted">Mesaj bırakılmamış.</span>}</dd>
        </div>
      </dl>

      <section className="wf-pipeline" aria-labelledby="wf-pipeline-title">
        <h3 id="wf-pipeline-title">Talep durumu</h3>
        <ol>
          {REQUEST_STATUSES.map((item, index) => (
            <li key={item.value} className={index < currentIndex ? 'is-done' : index === currentIndex ? 'is-current' : ''}>
              <button type="button" aria-pressed={request.status === item.value} onClick={() => setStatus(item.value)} disabled={Boolean(statusBusy)}>
                <span className="wf-pipeline__dot" aria-hidden="true">{statusBusy === item.value ? <Spinner label="Güncelleniyor" /> : index < currentIndex ? <Icon name="check" size={14} /> : index + 1}</span>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <NoteEditor key={request.id} request={request} onSaved={onChanged} onAuthError={onAuthError} notify={notify} />

      <footer className="wf-request__actions">
        <button type="button" className="wf-btn wf-btn--primary" onClick={() => onCreateCard(parseRequestForCard(request), request.id)}>
          <Icon name="plus" size={16} /> Bu talepten davetiye oluştur
        </button>
        <button type="button" className="wf-btn wf-btn--danger-ghost" onClick={onDelete}><Icon name="trash" size={16} /> Talebi sil</button>
      </footer>
    </article>
  )
}

export default function InvitationRequestInbox({ requests, selectedId, onSelect, onRefresh, onChanged, onRemoved, onCreateCard, onAuthError, notify }) {
  const searchId = useId()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const sorted = useMemo(
    () => [...requests.data].sort((a, b) => new Date(b.createdAtUtc) - new Date(a.createdAtUtc)),
    [requests.data],
  )
  const counts = useMemo(() => {
    const result = { all: sorted.length }
    REQUEST_STATUSES.forEach((item) => { result[item.value] = sorted.filter((request) => request.status === item.value).length })
    return result
  }, [sorted])
  const visible = useMemo(() => {
    const needle = normalizeSearch(query.trim())
    return sorted.filter((request) => {
      if (filter !== 'all' && request.status !== filter) return false
      if (!needle) return true
      return normalizeSearch([request.fullName, request.email, request.phone, request.message].join(' ')).includes(needle)
    })
  }, [filter, query, sorted])
  const selected = sorted.find((request) => request.id === selectedId) || null

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminInvitationRequestApi.remove(pendingDelete.id)
      notify('success', `${pendingDelete.fullName} adlı kişinin talebi silindi.`)
      onRemoved(pendingDelete.id)
      setPendingDelete(null)
    } catch (error) {
      if (!onAuthError(error)) notify('error', adminErrorText(error, 'Talep silinemedi.'))
    } finally {
      setDeleting(false)
    }
  }

  const loading = requests.loading && !requests.data.length
  const chips = [{ value: 'all', label: 'Tümü' }, ...REQUEST_STATUSES]

  return (
    <div className="wf-page">
      <PageHeader
        eyebrow="Talepler"
        title="Davetiye talepleri"
        description="Sitedeki iletişim formundan gelen talepleri takip edin ve çiftlere dönüş yapın."
        actions={<button type="button" className="wf-btn wf-btn--ghost" onClick={onRefresh} disabled={requests.loading}><Icon name="refresh" size={16} /> Yenile</button>}
      />

      <div className={`wf-inbox ${selected ? 'has-selection' : ''}`}>
        <section className="wf-panel wf-inbox__list" aria-label="Talep listesi">
          <div className="wf-inbox__filters">
            <div className="wf-chips" role="group" aria-label="Duruma göre filtrele">
              {chips.map((chip) => (
                <button key={chip.value} type="button" className={`wf-chip wf-chip--${chip.value}`} aria-pressed={filter === chip.value} onClick={() => setFilter(chip.value)}>
                  {chip.label}<span>{counts[chip.value] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="wf-search wf-search--compact">
              <label htmlFor={searchId} className="wf-sr-only">Taleplerde ara</label>
              <Icon name="search" size={16} />
              <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="İsim, e-posta, telefon ara" />
            </div>
          </div>

          {requests.error && <ErrorState message={requests.error} onRetry={onRefresh} />}
          {loading ? (
            <ul className="wf-inbox__items" aria-label="Talepler yükleniyor">
              {[0, 1, 2, 3, 4].map((index) => <li key={index} className="wf-inbox__skeleton"><Skeleton width="50%" /><Skeleton width="80%" height={12} /></li>)}
            </ul>
          ) : visible.length === 0 && !requests.error ? (
            <EmptyState icon="inbox" title={sorted.length ? 'Bu filtrede talep yok.' : 'Henüz talep gelmedi.'}>
              {sorted.length ? 'Başka bir durum seçin ya da aramayı temizleyin.' : 'Sitedeki iletişim formu doldurulduğunda talepler burada görünecek.'}
            </EmptyState>
          ) : (
            <ul className="wf-inbox__items">
              {visible.map((request) => (
                <li key={request.id}>
                  <button type="button" className="wf-inbox__item" aria-current={selectedId === request.id ? 'true' : undefined} onClick={() => onSelect(request.id)}>
                    <span className={`wf-inbox__marker wf-inbox__marker--${request.status}`} aria-hidden="true" />
                    <span className="wf-inbox__body">
                      <span className="wf-inbox__row">
                        <strong>{request.fullName}</strong>
                        <time dateTime={request.createdAtUtc}>{formatDateTime(request.createdAtUtc)}</time>
                      </span>
                      <span className="wf-inbox__row">
                        <small>{findTemplateOption(request.template)?.label || request.template || 'Şablon belirtilmedi'}</small>
                        <StatusBadge status={request.status} />
                      </span>
                      {request.message && <span className="wf-inbox__preview">{request.message}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="wf-panel wf-inbox__detail" aria-live="polite">
          {selected ? (
            <RequestDetail
              key={selected.id}
              request={selected}
              onBack={() => onSelect(null)}
              onChanged={onChanged}
              onDelete={() => setPendingDelete(selected)}
              onCreateCard={onCreateCard}
              onAuthError={onAuthError}
              notify={notify}
            />
          ) : (
            <EmptyState icon="inbox" title="Bir talep seçin.">Ayrıntıları, iletişim bilgilerini ve notları görmek için soldaki listeden bir talep seçin.</EmptyState>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Talep silinsin mi?"
        confirmLabel="Talebi sil"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      >
        <p><strong>{pendingDelete?.fullName}</strong> adlı kişinin talebi ve yönetici notu kalıcı olarak silinecek. Bu işlem geri alınamaz.</p>
      </ConfirmDialog>
    </div>
  )
}
