import { useMemo, useState } from 'react'
import { ApiError, authApi, recentCards, weddingCardApi } from './api/weddingCardApi'
import {
  changeDetailsTemplate,
  createTemplateDetails,
  DETAIL_LABELS,
  getTemplateSchema,
  storedDetails,
  TEMPLATE_OPTIONS,
} from './templateDetails'

const DEFAULT_DETAILS = createTemplateDetails()

const FIELD_LABELS = {
  template: 'Template',
  ...DETAIL_LABELS,
}

function formatError(error) {
  if (error instanceof ApiError) return error.message
  return error?.message || 'Something went wrong. Please try again.'
}

function Notice({ notice }) {
  if (!notice) return null
  return (
    <div className={`manager-notice ${notice.type === 'error' ? 'manager-notice-error' : ''}`} role="status">
      {notice.text}
    </div>
  )
}

export default function WeddingCardManagerPage() {
  const [authenticated, setAuthenticated] = useState(() => authApi.isAuthenticated())
  const [authMode, setAuthMode] = useState('login')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [recent, setRecent] = useState(() => recentCards.get())
  const [openId, setOpenId] = useState(() => new URLSearchParams(window.location.search).get('cardId') || '')
  const [card, setCard] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [details, setDetails] = useState(DEFAULT_DETAILS)
  const [newDetail, setNewDetail] = useState({ key: '', value: '' })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const previewHref = useMemo(() => {
    if (!card) return null
    const template = TEMPLATE_OPTIONS.find((item) => item.value === details.template) || TEMPLATE_OPTIONS[0]
    return `${template.path}?cardId=${encodeURIComponent(card.id)}`
  }, [card, details.template])

  const syncCard = (nextCard) => {
    setCard(nextCard)
    setDraftName(nextCard.name || '')
    setDetails(storedDetails(nextCard.details))
    setOpenId(nextCard.id)
    setRecent(recentCards.remember(nextCard))
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      if (authMode === 'register') {
        await authApi.register(credentials.email, credentials.password)
        setAuthMode('login')
        setNotice({ type: 'success', text: 'Account created. Sign in with your new account.' })
      } else {
        await authApi.login(credentials.email, credentials.password)
        setAuthenticated(true)
        setNotice({ type: 'success', text: 'Signed in successfully.' })
      }
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const loadCard = async (id = openId) => {
    if (!id.trim()) return
    setBusy(true)
    setNotice(null)
    try {
      const response = await weddingCardApi.get(id.trim())
      syncCard(response)
      setNotice({ type: 'success', text: 'Wedding card loaded.' })
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const createCard = async () => {
    setBusy(true)
    setNotice(null)
    try {
      const response = await weddingCardApi.create({
        name: 'Our invitation',
        details: DEFAULT_DETAILS,
      })
      syncCard(response)
      setNotice({ type: 'success', text: 'Wedding card created.' })
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const saveCard = async (event) => {
    event.preventDefault()
    if (!card) return
    setBusy(true)
    setNotice(null)
    try {
      await weddingCardApi.update(card.id, draftName.trim())
      await Promise.all(
        Object.entries(details).map(([key, value]) => weddingCardApi.upsertDetail(card.id, key, String(value))),
      )
      const response = await weddingCardApi.get(card.id)
      syncCard(response)
      setNotice({ type: 'success', text: 'Changes saved to the backend.' })
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const addDetail = () => {
    const key = newDetail.key.trim()
    if (!key) return
    setDetails((current) => ({ ...current, [key]: newDetail.value }))
    setNewDetail({ key: '', value: '' })
  }

  const deleteDetail = async (key) => {
    if (!card) return
    setBusy(true)
    setNotice(null)
    try {
      if (card.details && Object.hasOwn(card.details, key)) {
        await weddingCardApi.removeDetail(card.id, key)
      }
      setDetails((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
      setCard((current) => {
        if (!current) return current
        const nextDetails = { ...(current.details || {}) }
        delete nextDetails[key]
        return { ...current, details: nextDetails }
      })
      setNotice({ type: 'success', text: `Removed “${key}”.` })
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const deleteCard = async () => {
    if (!card || !window.confirm(`Delete “${card.name}”? This cannot be undone.`)) return
    setBusy(true)
    try {
      await weddingCardApi.remove(card.id)
      setRecent(recentCards.forget(card.id))
      setCard(null)
      setOpenId('')
      setNotice({ type: 'success', text: 'Wedding card deleted.' })
    } catch (error) {
      setNotice({ type: 'error', text: formatError(error) })
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setAuthenticated(false)
    setCard(null)
    setNotice(null)
  }

  const supportedKeys = getTemplateSchema(details.template).fields
  const visibleKeys = new Set(['template', ...supportedKeys])
  const detailFields = [
    { key: 'template', value: details.template || 'artdeco', removable: false },
    ...supportedKeys.map((key) => ({ key, value: details[key] || '', removable: false })),
    ...Object.entries(details)
      .filter(([key]) => !visibleKeys.has(key))
      .map(([key, value]) => ({ key, value, removable: true })),
  ]

  return (
    <div className="manager-page min-h-screen">
      <header className="manager-header">
        <a href="/" className="manager-brand">Wedding Invitations</a>
        <div className="flex items-center gap-3">
          <a href="/" className="manager-link">Templates</a>
          {authenticated && <button type="button" className="manager-link" onClick={logout}>Sign out</button>}
        </div>
      </header>

      {!authenticated ? (
        <main className="manager-auth-wrap">
          <section className="manager-auth-copy">
            <p className="manager-kicker">Invitation workspace</p>
            <h1>Create the invitation.<br />Keep the details yours.</h1>
            <p>Sign in to create and manage your invitations securely.</p>
          </section>
          <section className="manager-auth-panel">
            <div className="manager-segmented" aria-label="Account action">
              <button type="button" aria-pressed={authMode === 'login'} onClick={() => setAuthMode('login')}>Sign in</button>
              <button type="button" aria-pressed={authMode === 'register'} onClick={() => setAuthMode('register')}>Register</button>
            </div>
            <form onSubmit={submitAuth} className="manager-form">
              <label>Email<input type="email" required autoComplete="email" value={credentials.email} onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))} /></label>
              <label>Password<input type="password" required minLength={6} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} /></label>
              <button className="manager-primary" disabled={busy} type="submit">{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}</button>
            </form>
            <Notice notice={notice} />
          </section>
        </main>
      ) : (
        <main>
          <section className="manager-toolbar-band">
            <div>
              <p className="manager-kicker">Invitation workspace</p>
              <h1>{card ? draftName || 'Untitled invitation' : 'Choose an invitation to begin'}</h1>
            </div>
            <div className="manager-toolbar-actions">
              <button type="button" className="manager-secondary" onClick={createCard} disabled={busy}>New invitation</button>
              {previewHref && <a className="manager-primary" href={previewHref} target="_blank" rel="noreferrer">Open preview ↗</a>}
            </div>
          </section>

          <section className="manager-workspace">
            <aside className="manager-sidebar">
              <form onSubmit={(event) => { event.preventDefault(); loadCard() }} className="manager-open-form">
                <label htmlFor="card-id">Open by card ID</label>
                <div><input id="card-id" value={openId} onChange={(event) => setOpenId(event.target.value)} placeholder="UUID" /><button disabled={busy} type="submit">→</button></div>
              </form>
              <div className="manager-recent">
                <p>Recent on this device</p>
                {recent.length === 0 ? <span>No recent cards</span> : recent.map((item) => (
                  <button key={item.id} type="button" onClick={() => loadCard(item.id)}>
                    <strong>{item.name || 'Untitled card'}</strong>
                    <span>{item.id}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="manager-editor">
              <Notice notice={notice} />
              {!card ? (
                <div className="manager-empty">
                  <span>01</span>
                  <h2>Create a new card or open an existing ID.</h2>
                </div>
              ) : (
                <form onSubmit={saveCard}>
                  <div className="manager-editor-head">
                    <div><p>Card ID</p><code>{card.id}</code></div>
                    <button type="button" className="manager-danger" onClick={deleteCard} disabled={busy}>Delete card</button>
                  </div>

                  <div className="manager-field-grid">
                    <label className="manager-field-wide">Card name<input value={draftName} maxLength={200} required onChange={(event) => setDraftName(event.target.value)} /></label>
                    {detailFields.map(({ key, value, removable }) => (
                      <label key={key}>
                        <span>{FIELD_LABELS[key] || key}</span>
                        <div className="manager-field-row">
                          {key === 'template' ? (
                            <select value={value} onChange={(event) => setDetails((current) => changeDetailsTemplate(current, event.target.value))}>
                              {TEMPLATE_OPTIONS.map((template) => <option key={template.value} value={template.value}>{template.label}</option>)}
                            </select>
                          ) : (
                            <input value={value} onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))} />
                          )}
                          {removable && <button type="button" title={`Remove ${key}`} onClick={() => deleteDetail(key)}>×</button>}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="manager-add-detail">
                    <input aria-label="New detail key" placeholder="New detail key" value={newDetail.key} onChange={(event) => setNewDetail((current) => ({ ...current, key: event.target.value }))} />
                    <input aria-label="New detail value" placeholder="Value" value={newDetail.value} onChange={(event) => setNewDetail((current) => ({ ...current, value: event.target.value }))} />
                    <button type="button" onClick={addDetail}>Add field</button>
                  </div>

                  <div className="manager-savebar">
                    <span>{Object.keys(details).length} detail fields</span>
                    <button className="manager-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
