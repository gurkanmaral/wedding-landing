import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { adminInvitationRequestApi, adminStatsApi, adminWeddingCardApi, authApi } from '../api/weddingCardApi'
import { Icon, Spinner, Toasts } from './adminUi'
import {
  ADMIN_TABS,
  adminErrorText,
  hashForTab,
  isForbidden,
  isUnauthorized,
  loginErrorText,
  requiresTwoFactor,
  tabFromHash,
} from './adminUtils'
import CardEditorDrawer from './CardEditorDrawer'
import CardsView from './CardsView'
import InvitationRequestInbox from './InvitationRequestInbox'
import OverviewView from './OverviewView'
import RsvpView from './RsvpView'
import './admin.css'

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400&family=Manrope:wght@400;500;600;700&display=swap'

const idle = (value) => ({ data: value, loading: true, error: null })

function Fonts() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONT_HREF} />
    </>
  )
}

function Brand({ compact = false }) {
  return (
    <a className={`wf-brand ${compact ? 'wf-brand--compact' : ''}`} href="/" aria-label="Wedfolio ana sayfası">
      <span className="wf-brand__mark" aria-hidden="true">W</span>
      <span className="wf-brand__text">
        <strong>Wedfolio</strong>
        <small>Yönetim paneli</small>
      </span>
    </a>
  )
}

function SignInScreen({ onSignedIn }) {
  const emailId = useId()
  const passwordId = useId()
  const codeId = useId()
  const errorId = useId()
  const [form, setForm] = useState({ email: '', password: '', code: '' })
  const [showCode, setShowCode] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const code = form.code.trim()
      const isRecovery = code.length > 8
      await authApi.login(form.email.trim(), form.password, isRecovery ? '' : code, isRecovery ? code : '')
      onSignedIn()
    } catch (loginError) {
      if (requiresTwoFactor(loginError)) setShowCode(true)
      setError(loginErrorText(loginError))
      setBusy(false)
    }
  }

  return (
    <div className="wf-admin wf-gate">
      <Fonts />
      <div className="wf-gate__panel">
        <Brand />
        <div className="wf-gate__intro">
          <p className="wf-eyebrow">Yönetici girişi</p>
          <h1>Tekrar hoş geldiniz.</h1>
          <p>Davetiyeleri, gelen talepleri ve konuk yanıtlarını yönetmek için yönetici hesabınızla giriş yapın.</p>
        </div>
        <form className="wf-form" onSubmit={submit} noValidate={false} aria-describedby={error ? errorId : undefined}>
          {error && <div id={errorId} className="wf-alert wf-alert--error" role="alert">{error}</div>}
          <div className="wf-field">
            <label htmlFor={emailId}>E-posta adresi</label>
            <input id={emailId} type="email" autoComplete="username" required value={form.email} onChange={update('email')} placeholder="ornek@wedfolio.com" />
          </div>
          <div className="wf-field">
            <label htmlFor={passwordId}>Şifre</label>
            <input id={passwordId} type="password" autoComplete="current-password" required value={form.password} onChange={update('password')} />
          </div>
          {showCode ? (
            <div className="wf-field">
              <label htmlFor={codeId}>Doğrulama kodu</label>
              <input id={codeId} inputMode="text" autoComplete="one-time-code" value={form.code} onChange={update('code')} placeholder="6 haneli kod ya da kurtarma kodu" />
              <p className="wf-hint">Doğrulama uygulamanızdaki 6 haneli kodu ya da kurtarma kodlarınızdan birini girin.</p>
            </div>
          ) : (
            <button type="button" className="wf-link-btn" onClick={() => setShowCode(true)}>İki adımlı doğrulama kodum var</button>
          )}
          <button type="submit" className="wf-btn wf-btn--primary wf-btn--block" disabled={busy}>
            {busy ? <><Spinner label="Giriş yapılıyor" /> Giriş yapılıyor…</> : 'Giriş yap'}
          </button>
          <p className="wf-gate__foot"><a href="/forgot-password">Şifremi unuttum</a><span aria-hidden="true">·</span><a href="/">Siteye dön</a></p>
        </form>
      </div>
    </div>
  )
}

function ForbiddenScreen({ email, onSignOut }) {
  return (
    <div className="wf-admin wf-gate">
      <Fonts />
      <div className="wf-gate__panel">
        <Brand />
        <div className="wf-gate__intro">
          <span className="wf-gate__icon"><Icon name="shield" size={24} /></span>
          <p className="wf-eyebrow">Erişim yok</p>
          <h1>Bu hesabın yönetici yetkisi yok.</h1>
          <p>
            {email ? <><strong>{email}</strong> hesabıyla giriş yaptınız, </> : 'Giriş yaptığınız hesap '}
            ancak yönetim paneli yalnızca <em>Admin</em> rolüne sahip hesaplara açıktır. Yönetici hesabıyla giriş yapmak için önce çıkış yapın.
          </p>
        </div>
        <div className="wf-gate__actions">
          <button type="button" className="wf-btn wf-btn--primary wf-btn--block" onClick={onSignOut}><Icon name="logout" size={16} /> Çıkış yap</button>
          <a className="wf-btn wf-btn--ghost wf-btn--block" href="/manage">Kendi davetiyelerime git</a>
        </div>
      </div>
    </div>
  )
}

function CheckingScreen() {
  return (
    <div className="wf-admin wf-gate">
      <Fonts />
      <div className="wf-gate__loading" role="status">
        <Spinner label="Yönetim paneli hazırlanıyor" />
        <p>Yönetim paneli hazırlanıyor…</p>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [auth, setAuth] = useState(() => (authApi.isAuthenticated() ? 'checking' : 'signedOut'))
  const [email, setEmail] = useState('')
  const [tab, setTab] = useState(() => tabFromHash(window.location.hash))
  const [stats, setStats] = useState(() => idle(null))
  const [cards, setCards] = useState(() => idle([]))
  const [requests, setRequests] = useState(() => idle([]))
  const [toasts, setToasts] = useState([])
  const [editor, setEditor] = useState({ open: false, card: null, prefill: null, requestId: null })
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [rsvpCardId, setRsvpCardId] = useState('')
  const toastId = useRef(0)

  useEffect(() => {
    document.title = 'Wedfolio · Yönetim paneli'
    document.documentElement.lang = 'tr'
  }, [])

  const dismissToast = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  const notify = useCallback((type, text) => {
    toastId.current += 1
    const id = toastId.current
    setToasts((current) => [...current.slice(-3), { id, type, text }])
    window.setTimeout(() => dismissToast(id), type === 'error' ? 7000 : 4000)
  }, [dismissToast])

  const signOut = useCallback(() => {
    authApi.logout()
    setEmail('')
    setAuth('signedOut')
  }, [])

  // Any admin call that comes back 401/403 sends the user to the right gate.
  const handleAuthError = useCallback((error) => {
    if (isUnauthorized(error)) {
      authApi.logout()
      setAuth('signedOut')
      return true
    }
    if (isForbidden(error)) {
      setAuth('forbidden')
      return true
    }
    return false
  }, [])

  const loadAll = useCallback(async () => {
    authApi.getInfo().then((info) => setEmail(info?.email || '')).catch(() => {})
    const [statsResult, cardsResult, requestsResult] = await Promise.allSettled([
      adminStatsApi.get(),
      adminWeddingCardApi.list(),
      adminInvitationRequestApi.list(),
    ])
    const failures = [statsResult, cardsResult, requestsResult].filter((result) => result.status === 'rejected').map((result) => result.reason)
    if (failures.some(isUnauthorized)) {
      authApi.logout()
      setAuth('signedOut')
      return
    }
    if (failures.some(isForbidden)) {
      setAuth('forbidden')
      return
    }
    const settle = (result, fallback, message) => (
      result.status === 'fulfilled'
        ? { data: result.value ?? fallback, loading: false, error: null }
        : { data: fallback, loading: false, error: adminErrorText(result.reason, message) }
    )
    setStats(settle(statsResult, null, 'Özet bilgiler yüklenemedi.'))
    setCards(settle(cardsResult, [], 'Davetiyeler yüklenemedi.'))
    setRequests(settle(requestsResult, [], 'Talepler yüklenemedi.'))
    setAuth('ready')
  }, [])

  useEffect(() => {
    if (auth !== 'checking') return
    void Promise.resolve().then(loadAll)
  }, [auth, loadAll])

  const makeLoader = useCallback((setter, request, message, fallback) => async () => {
    setter((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await request()
      setter({ data: data ?? fallback, loading: false, error: null })
    } catch (error) {
      if (handleAuthError(error)) return
      setter((current) => ({ ...current, loading: false, error: adminErrorText(error, message) }))
    }
  }, [handleAuthError])

  const refreshStats = useCallback(() => makeLoader(setStats, adminStatsApi.get, 'Özet bilgiler yüklenemedi.', null)(), [makeLoader])
  const refreshCards = useCallback(() => makeLoader(setCards, adminWeddingCardApi.list, 'Davetiyeler yüklenemedi.', [])(), [makeLoader])
  const refreshRequests = useCallback(() => makeLoader(setRequests, () => adminInvitationRequestApi.list(), 'Talepler yüklenemedi.', [])(), [makeLoader])
  const refreshEverything = useCallback(() => Promise.all([refreshStats(), refreshCards(), refreshRequests()]), [refreshCards, refreshRequests, refreshStats])

  useEffect(() => {
    const onHash = () => setTab(tabFromHash(window.location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const goTo = useCallback((id) => {
    setTab(id)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${hashForTab(id)}`)
    window.scrollTo({ top: 0 })
  }, [])

  const openRequest = useCallback((id) => {
    setSelectedRequestId(id)
    goTo('requests')
  }, [goTo])

  const openRsvp = useCallback((cardId) => {
    setRsvpCardId(cardId)
    goTo('rsvp')
  }, [goTo])

  const openCreate = useCallback((prefill = null, requestId = null) => setEditor({ open: true, card: null, prefill, requestId }), [])
  const openEdit = useCallback((card) => setEditor({ open: true, card, prefill: null, requestId: null }), [])
  const closeEditor = useCallback(() => setEditor((current) => ({ ...current, open: false })), [])

  const onCardSaved = useCallback(async (saved, created) => {
    setEditor((current) => ({ ...current, open: false }))
    notify('success', created ? 'Davetiye oluşturuldu.' : 'Değişiklikler kaydedildi.')
    if (created && saved?.id && tab !== 'cards') goTo('cards')
    await Promise.all([refreshCards(), refreshStats()])
  }, [goTo, notify, refreshCards, refreshStats, tab])

  const onCardDeleted = useCallback(async (id) => {
    setCards((current) => ({ ...current, data: current.data.filter((card) => card.id !== id) }))
    setEditor((current) => (current.card?.id === id ? { ...current, open: false } : current))
    if (rsvpCardId === id) setRsvpCardId('')
    await refreshStats()
  }, [refreshStats, rsvpCardId])

  const onRequestChanged = useCallback((updated) => {
    setRequests((current) => ({ ...current, data: current.data.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)) }))
    void refreshStats()
  }, [refreshStats])

  const onRequestRemoved = useCallback((id) => {
    setRequests((current) => ({ ...current, data: current.data.filter((item) => item.id !== id) }))
    setSelectedRequestId(null)
    void refreshStats()
  }, [refreshStats])

  if (auth === 'signedOut') return <SignInScreen onSignedIn={() => setAuth('checking')} />
  if (auth === 'forbidden') return <ForbiddenScreen email={email} onSignOut={signOut} />
  if (auth === 'checking') return <CheckingScreen />

  const newRequests = requests.data.filter((item) => item.status === 'new').length
  const counts = { cards: cards.data.length, requests: newRequests }

  return (
    <div className="wf-admin wf-shell">
      <Fonts />
      <a className="wf-skip" href="#wf-main">İçeriğe geç</a>
      <aside className="wf-sidebar">
        <div className="wf-sidebar__top">
          <Brand />
          <button type="button" className="wf-icon-btn wf-sidebar__mobile-out" onClick={signOut} aria-label="Çıkış yap"><Icon name="logout" /></button>
        </div>
        <nav className="wf-nav" aria-label="Yönetim bölümleri">
          {ADMIN_TABS.map((item) => (
            <a
              key={item.id}
              href={`#${item.hash}`}
              className="wf-nav__item"
              aria-current={tab === item.id ? 'page' : undefined}
              onClick={(event) => { event.preventDefault(); goTo(item.id) }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'requests' && counts.requests > 0 && <span className="wf-nav__count" aria-label={`${counts.requests} yeni talep`}>{counts.requests}</span>}
              {item.id === 'cards' && !cards.loading && <span className="wf-nav__count wf-nav__count--muted" aria-label={`${counts.cards} davetiye`}>{counts.cards}</span>}
            </a>
          ))}
        </nav>
        <div className="wf-sidebar__foot">
          {email && <p className="wf-sidebar__user" title={email}><span>Giriş yapan</span>{email}</p>}
          <a className="wf-sidebar__link" href="/" target="_blank" rel="noopener noreferrer"><Icon name="site" size={16} /> Siteyi aç</a>
          <a className="wf-sidebar__link" href="/account"><Icon name="shield" size={16} /> Hesap güvenliği</a>
          <button type="button" className="wf-sidebar__link" onClick={signOut}><Icon name="logout" size={16} /> Çıkış yap</button>
        </div>
      </aside>

      <main id="wf-main" className="wf-main" tabIndex={-1}>
        {tab === 'overview' && (
          <OverviewView
            stats={stats}
            cards={cards}
            requests={requests}
            onRetry={refreshEverything}
            onNavigate={goTo}
            onOpenRequest={openRequest}
            onCreate={() => openCreate()}
          />
        )}
        {tab === 'cards' && (
          <CardsView
            cards={cards}
            onRefresh={refreshCards}
            onCreate={() => openCreate()}
            onEdit={openEdit}
            onOpenRsvp={openRsvp}
            onDeleted={onCardDeleted}
            onAuthError={handleAuthError}
            notify={notify}
          />
        )}
        {tab === 'requests' && (
          <InvitationRequestInbox
            requests={requests}
            selectedId={selectedRequestId}
            onSelect={setSelectedRequestId}
            onRefresh={refreshRequests}
            onChanged={onRequestChanged}
            onRemoved={onRequestRemoved}
            onCreateCard={(prefill, requestId) => openCreate(prefill, requestId)}
            onAuthError={handleAuthError}
            notify={notify}
          />
        )}
        {tab === 'rsvp' && (
          <RsvpView
            cards={cards}
            cardId={rsvpCardId}
            onSelectCard={setRsvpCardId}
            onChanged={refreshStats}
            onAuthError={handleAuthError}
            notify={notify}
          />
        )}
      </main>

      <CardEditorDrawer
        key={editor.open ? `${editor.card?.id || 'new'}-${editor.requestId || ''}` : 'closed'}
        open={editor.open}
        card={editor.card}
        prefill={editor.prefill}
        fromRequest={editor.requestId ? requests.data.find((item) => item.id === editor.requestId) : null}
        cards={cards.data}
        onClose={closeEditor}
        onSaved={onCardSaved}
        onDeleted={onCardDeleted}
        onAuthError={handleAuthError}
        notify={notify}
      />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
