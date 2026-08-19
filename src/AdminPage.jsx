import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { adminWeddingCardApi, ApiError, authApi } from './api/weddingCardApi'
import { uniqueWeddingSlug } from './api/weddingCardSlug'
import {
  changeDetailsTemplate,
  createTemplateDetails,
  DETAIL_LABELS,
  getTemplateSchema,
  storedDetails,
  TEMPLATE_OPTIONS,
} from './templateDetails'

const ADMIN_DETAIL_KEYS = new Set(['template', 'slug', 'published'])

function createAdminDetails(template = 'artdeco') {
  return { slug: '', published: 'false', ...createTemplateDetails(template) }
}

const LABELS = {
  template: 'Template',
  slug: 'Share link',
  published: 'Published',
  ...DETAIL_LABELS,
}

const errorText = (error) => error instanceof ApiError ? error.message : error?.message || 'Something went wrong.'

const adminErrorText = (error) => {
  if (error instanceof ApiError && error.status === 405) {
    return 'The live API does not expose GET /api/admin/wedding-cards yet. Deploy the updated backend to enable the invitation list.'
  }
  if (error instanceof ApiError && error.status === 403) {
    return 'This account does not have the Admin role.'
  }
  return errorText(error)
}

export default function AdminPage() {
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [details, setDetails] = useState(() => createAdminDetails())
  const [newDetail, setNewDetail] = useState({ key: '', value: '' })
  const [busy, setBusy] = useState(true)
  const [notice, setNotice] = useState(null)
  const initialLoadStarted = useRef(false)

  const isAuthenticated = authApi.isAuthenticated()
  const previewHref = useMemo(() => {
    if (!selected) return null
    const template = TEMPLATE_OPTIONS.find((item) => item.value === details.template) || TEMPLATE_OPTIONS[0]
    return details.slug
      ? `${template.path}/${encodeURIComponent(details.slug)}`
      : `${template.path}?cardId=${encodeURIComponent(selected.id)}`
  }, [details.slug, details.template, selected])

  const generateSlug = () => {
    const slug = uniqueWeddingSlug(details.partner1, details.partner2, cards, selected?.id)
    setDetails((current) => ({ ...current, slug }))
  }

  const selectCard = useCallback((card) => {
    setSelected(card)
    setName(card.name || '')
    setUserId(card.userId || '')
    setDetails({ slug: '', published: 'false', ...storedDetails(card.details) })
    setNotice(null)
  }, [])

  const loadCard = async (id) => {
    setBusy(true)
    setNotice(null)
    try {
      const response = await adminWeddingCardApi.get(id)
      selectCard(response)
    } catch (error) {
      setNotice({ type: 'error', text: adminErrorText(error) })
    } finally {
      setBusy(false)
    }
  }

  const loadCards = useCallback(async (preferredId) => {
    setBusy(true)
    try {
      const response = await adminWeddingCardApi.list()
      setCards(response)
      if (preferredId) {
        const next = response.find((item) => item.id === preferredId)
        if (next) selectCard(next)
      }
      setNotice(null)
    } catch (error) {
      setNotice({ type: 'error', text: adminErrorText(error) })
    } finally {
      setBusy(false)
    }
  }, [selectCard])

  useEffect(() => {
    if (!isAuthenticated || initialLoadStarted.current) return
    initialLoadStarted.current = true
    void Promise.resolve().then(() => loadCards())
  }, [isAuthenticated, loadCards])

  const newDraft = () => {
    setSelected(null)
    setName('New wedding invitation')
    setUserId('')
    setDetails(createAdminDetails())
    setNewDetail({ key: '', value: '' })
    setNotice(null)
  }

  const addDetail = () => {
    const key = newDetail.key.trim()
    if (!key || Object.hasOwn(details, key)) return
    setDetails((current) => ({ ...current, [key]: newDetail.value }))
    setNewDetail({ key: '', value: '' })
  }

  const removeDetail = async (key) => {
    if (selected && Object.hasOwn(selected.details || {}, key)) {
      setBusy(true)
      setNotice(null)
      try {
        await adminWeddingCardApi.removeDetail(selected.id, key)
      } catch (error) {
        setNotice({ type: 'error', text: adminErrorText(error) })
        setBusy(false)
        return
      }
      setBusy(false)
    }

    setDetails((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
    setSelected((current) => {
      if (!current) return current
      const nextDetails = { ...(current.details || {}) }
      delete nextDetails[key]
      return { ...current, details: nextDetails }
    })
    setNotice({ type: 'success', text: `Removed “${key}”.` })
  }

  const save = async (event) => {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      const nextDetails = {
        ...details,
        slug: details.slug.trim() || uniqueWeddingSlug(details.partner1, details.partner2, cards, selected?.id),
      }
      setDetails(nextDetails)
      if (!selected) {
        const created = await adminWeddingCardApi.create({ name, userId: userId || null, details: nextDetails })
        await loadCards(created.id)
        setNotice({ type: 'success', text: 'Invitation created.' })
      } else {
        await adminWeddingCardApi.update(selected.id, { name, userId: userId || null })
        await Promise.all(Object.entries(nextDetails).map(([key, value]) => adminWeddingCardApi.upsertDetail(selected.id, key, String(value))))
        await loadCards(selected.id)
        setNotice({ type: 'success', text: 'Invitation updated.' })
      }
    } catch (error) {
      setNotice({ type: 'error', text: errorText(error) })
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!selected || !window.confirm(`Delete “${selected.name}”? This cannot be undone.`)) return
    setBusy(true)
    try {
      await adminWeddingCardApi.remove(selected.id)
      setSelected(null)
      setName('')
      setDetails(createAdminDetails())
      await loadCards()
      setNotice({ type: 'success', text: 'Invitation deleted.' })
    } catch (error) {
      setNotice({ type: 'error', text: errorText(error) })
      setBusy(false)
    }
  }

  const copyClientLink = async () => {
    if (!previewHref) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${previewHref}`)
      setNotice({ type: 'success', text: 'Client link copied.' })
    } catch {
      setNotice({ type: 'error', text: 'The client link could not be copied.' })
    }
  }

  const supportedKeys = getTemplateSchema(details.template).fields
  const visibleKeys = new Set([...ADMIN_DETAIL_KEYS, ...supportedKeys])
  const detailFields = [
    ...['template', 'slug', 'published'].map((key) => ({ key, value: details[key] || '', removable: false })),
    ...supportedKeys.map((key) => ({ key, value: details[key] || '', removable: false })),
    ...Object.entries(details)
      .filter(([key]) => !visibleKeys.has(key))
      .map(([key, value]) => ({ key, value, removable: true })),
  ]

  if (!isAuthenticated) {
    return (
      <div className="manager-page min-h-screen">
        <header className="manager-header"><a href="/" className="manager-brand">Wedding Invitations</a></header>
        <main className="admin-gate"><p className="manager-kicker">Administration</p><h1>Admin access required.</h1><p>Sign in with an administrator account to manage published invitations.</p><a className="manager-primary" href="/login?returnTo=/admin">Admin sign in</a></main>
      </div>
    )
  }

  return (
    <div className="admin-page min-h-screen">
      <header className="manager-header">
        <a href="/" className="manager-brand">Wedding Invitations <small>Admin</small></a>
        <nav className="flex items-center gap-2"><a className="manager-link" href="/">Public site</a><a className="manager-link" href="/account">Security</a><button className="manager-link" onClick={() => { authApi.logout(); window.location.href = '/login?returnTo=/admin' }}>Sign out</button></nav>
      </header>
      <main className="admin-layout">
        <aside className="admin-list-panel">
          <div className="admin-list-head"><div><p className="manager-kicker">Content</p><h1>Invitations</h1></div><button type="button" onClick={newDraft} title="Create invitation">+</button></div>
          <div className="admin-list-meta"><span>{cards.length} records</span><button type="button" onClick={() => loadCards()} disabled={busy}>Refresh</button></div>
          <div className="admin-card-list">
            {cards.map((card) => (
            <button key={card.id} type="button" aria-pressed={selected?.id === card.id} onClick={() => loadCard(card.id)}>
                <span className={`admin-publish-dot ${card.details?.published === 'true' ? 'on' : ''}`} />
                <span><strong>{card.name}</strong><small>{card.details?.template || 'No template'} · {card.details?.dateLabel || 'No date'}</small></span>
                <span>→</span>
              </button>
            ))}
            {!busy && cards.length === 0 && <p className="admin-empty-list">No invitations yet.</p>}
          </div>
        </aside>

        <section className="admin-editor-panel">
          {notice && <div className={`manager-notice ${notice.type === 'error' ? 'manager-notice-error' : ''}`}>{notice.text}</div>}
          {!selected && !name ? (
            <div className="manager-empty"><span>ADMIN</span><h2>Select an invitation or create a new one.</h2></div>
          ) : (
            <form onSubmit={save}>
              <div className="admin-editor-head">
                <div><p>{selected ? 'Editing invitation' : 'New invitation'}</p><h2>{name || 'Untitled'}</h2>{selected && <code>{selected.id}</code>}</div>
                <div>
                  {selected && <button className="manager-danger" type="button" onClick={remove}>Delete</button>}
                  {previewHref && <button className="manager-secondary" type="button" onClick={copyClientLink}>Copy client link</button>}
                  {previewHref && <a className="manager-secondary" href={previewHref} target="_blank" rel="noreferrer">Open ↗</a>}
                </div>
              </div>
              <div className="manager-field-grid">
                <label className="manager-field-wide">Record name<input required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className="manager-field-wide">Owner account ID <span className="admin-label-note">Use an existing registered user ID, or leave empty for an admin-owned card</span><input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Optional Identity user ID" /></label>
                {detailFields.map(({ key, value, removable }) => (
                  <label key={key} className={key === 'description' ? 'manager-field-wide' : ''}>
                    <span>{LABELS[key] || key}</span>
                    {key === 'template' ? (
                      <select value={value} onChange={(event) => setDetails((current) => changeDetailsTemplate(current, event.target.value))}>{TEMPLATE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                    ) : key === 'published' ? (
                      <select value={value} onChange={(event) => setDetails((current) => ({ ...current, published: event.target.value }))}><option value="false">Draft</option><option value="true">Published</option></select>
                    ) : key === 'slug' ? (
                      <div className="admin-slug-field">
                        <input value={value} onChange={(event) => setDetails((current) => ({ ...current, slug: event.target.value }))} placeholder="elena-marcus" />
                        <button type="button" onClick={generateSlug}>Generate</button>
                      </div>
                    ) : (
                      <div className="admin-detail-field">
                        <input value={value} onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))} />
                        {removable && <button type="button" title={`Remove ${key}`} onClick={() => removeDetail(key)}>×</button>}
                      </div>
                    )}
                  </label>
                ))}
              </div>
              <div className="manager-add-detail">
                <input aria-label="New detail key" placeholder="New detail key" value={newDetail.key} onChange={(event) => setNewDetail((current) => ({ ...current, key: event.target.value }))} />
                <input aria-label="New detail value" placeholder="Value" value={newDetail.value} onChange={(event) => setNewDetail((current) => ({ ...current, value: event.target.value }))} />
                <button type="button" onClick={addDetail}>Add field</button>
              </div>
              <div className="manager-savebar"><span>{details.published === 'true' ? 'Visible on homepage' : 'Draft only'}</span><button className="manager-primary" disabled={busy}>{busy ? 'Saving…' : selected ? 'Save changes' : 'Create invitation'}</button></div>
            </form>
          )}
        </section>
      </main>
    </div>
  )
}
