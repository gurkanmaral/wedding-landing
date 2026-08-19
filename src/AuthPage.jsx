import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, authApi } from './api/weddingCardApi'

function messageFor(error) {
  return error instanceof ApiError ? error.message : error?.message || 'Something went wrong.'
}

function AuthNotice({ notice }) {
  if (!notice) return null
  return <div className={`manager-notice ${notice.type === 'error' ? 'manager-notice-error' : ''}`} role="status">{notice.text}</div>
}

function AccountPage() {
  const [info, setInfo] = useState(null)
  const [twoFactor, setTwoFactor] = useState(null)
  const [code, setCode] = useState('')
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' })
  const [newEmail, setNewEmail] = useState('')
  const [busy, setBusy] = useState(true)
  const [notice, setNotice] = useState(null)
  const initialLoadStarted = useRef(false)

  const refreshAccount = useCallback(async () => {
    setBusy(true)
    try {
      const [nextInfo, nextTwoFactor] = await Promise.all([
        authApi.getInfo(),
        authApi.manageTwoFactor({}),
      ])
      setInfo(nextInfo)
      setTwoFactor(nextTwoFactor)
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (initialLoadStarted.current) return
    initialLoadStarted.current = true
    void Promise.resolve().then(refreshAccount)
  }, [refreshAccount])

  const updatePassword = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await authApi.updateInfo(passwords)
      setPasswords({ oldPassword: '', newPassword: '' })
      setNotice({ type: 'success', text: 'Password updated.' })
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  const updateEmail = async (event) => {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      const response = await authApi.updateInfo({ newEmail })
      setInfo(response)
      setNewEmail('')
      setNotice({ type: 'success', text: 'Email update requested. Check the new address for confirmation.' })
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  const resendConfirmation = async () => {
    if (!info?.email) return
    setBusy(true)
    setNotice(null)
    try {
      await authApi.resendConfirmation(info.email)
      setNotice({ type: 'success', text: 'Confirmation email sent.' })
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  const updateTwoFactor = async (payload, successText) => {
    setBusy(true)
    setNotice(null)
    try {
      const response = await authApi.manageTwoFactor(payload)
      setTwoFactor(response)
      setCode('')
      setNotice({ type: 'success', text: successText })
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  if (!authApi.isAuthenticated()) {
    return <AuthShell><div className="auth-single"><h1>Sign in required</h1><a className="manager-primary" href="/login?returnTo=/account">Sign in</a></div></AuthShell>
  }

  return (
    <AuthShell>
      <main className="account-page">
        <div className="account-heading">
          <p className="manager-kicker">Account security</p>
          <h1>{info?.email || 'Your account'}</h1>
          <span>{info?.isEmailConfirmed ? 'Email confirmed' : 'Email confirmation pending'}</span>
        </div>
        <AuthNotice notice={notice} />
        <div className="account-grid">
          <section>
            <div className="account-section-head"><span>01</span><h2>Email address</h2></div>
            <form className="manager-form" onSubmit={updateEmail}>
              <label>New email<input type="email" required autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder={info?.email || 'you@example.com'} /></label>
              <button className="manager-secondary" disabled={busy}>Update email</button>
              {!info?.isEmailConfirmed && <button className="manager-secondary" type="button" disabled={busy} onClick={resendConfirmation}>Resend confirmation</button>}
            </form>
          </section>
          <section>
            <div className="account-section-head"><span>02</span><h2>Password</h2></div>
            <form className="manager-form" onSubmit={updatePassword}>
              <label>Current password<input type="password" required value={passwords.oldPassword} onChange={(event) => setPasswords((current) => ({ ...current, oldPassword: event.target.value }))} /></label>
              <label>New password<input type="password" required minLength={6} value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} /></label>
              <button className="manager-secondary" disabled={busy}>Update password</button>
            </form>
          </section>
          <section>
            <div className="account-section-head"><span>03</span><h2>Two-factor authentication</h2></div>
            {busy && !twoFactor ? <p>Loading security settings…</p> : (
              <div className="account-2fa">
                <div className="account-status"><span className={twoFactor?.isTwoFactorEnabled ? 'on' : ''} />{twoFactor?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
                {twoFactor?.sharedKey && <div className="account-key"><span>Authenticator setup key</span><code>{twoFactor.sharedKey}</code></div>}
                {twoFactor?.recoveryCodes?.length > 0 && (
                  <div className="account-recovery"><span>Save these recovery codes now</span>{twoFactor.recoveryCodes.map((item) => <code key={item}>{item}</code>)}</div>
                )}
                <label className="account-code">Authenticator code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" /></label>
                <div className="account-actions">
                  {!twoFactor?.isTwoFactorEnabled && !twoFactor?.sharedKey && <button type="button" onClick={() => updateTwoFactor({ resetSharedKey: true }, 'Setup key generated.')}>Generate setup key</button>}
                  {!twoFactor?.isTwoFactorEnabled && twoFactor?.sharedKey && <button type="button" disabled={!code || busy} onClick={() => updateTwoFactor({ enable: true, twoFactorCode: code }, 'Two-factor authentication enabled.')}>Enable 2FA</button>}
                  {twoFactor?.isTwoFactorEnabled && <button type="button" disabled={!code || busy} onClick={() => updateTwoFactor({ enable: false, twoFactorCode: code }, 'Two-factor authentication disabled.')}>Disable 2FA</button>}
                  {twoFactor?.isTwoFactorEnabled && <button type="button" disabled={busy} onClick={() => updateTwoFactor({ resetRecoveryCodes: true }, 'New recovery codes generated.')}>New recovery codes</button>}
                  {twoFactor?.isMachineRemembered && <button type="button" disabled={busy} onClick={() => updateTwoFactor({ forgetMachine: true }, 'This machine is no longer remembered.')}>Forget this machine</button>}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </AuthShell>
  )
}

function ConfirmEmailPage() {
  const query = new URLSearchParams(window.location.search)
  const userId = query.get('userId') || ''
  const code = query.get('code') || ''
  const changedEmail = query.get('changedEmail') || ''
  const [status, setStatus] = useState({ state: 'loading', text: 'Confirming your email…' })
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (!userId || !code) {
      void Promise.resolve().then(() => setStatus({ state: 'error', text: 'This confirmation link is incomplete.' }))
      return
    }

    void Promise.resolve()
      .then(() => authApi.confirmEmail(userId, code, changedEmail))
      .then(() => setStatus({ state: 'success', text: 'Your email address is confirmed.' }))
      .catch((error) => setStatus({ state: 'error', text: messageFor(error) }))
  }, [changedEmail, code, userId])

  return (
    <AuthShell>
      <main className="auth-single">
        <p className="manager-kicker">Email confirmation</p>
        <h1>{status.state === 'loading' ? 'One moment.' : status.state === 'success' ? 'Email confirmed.' : 'Confirmation failed.'}</h1>
        <p>{status.text}</p>
        <div className="auth-confirm-actions">
          {status.state === 'success' ? <a className="manager-primary" href="/login">Continue to sign in</a> : <a className="manager-secondary" href="/resend-confirmation">Request a new link</a>}
        </div>
      </main>
    </AuthShell>
  )
}

function AuthShell({ children }) {
  return (
    <div className="manager-page min-h-screen">
      <header className="manager-header">
        <a href="/" className="manager-brand">Wedding Invitations</a>
        <nav className="flex items-center gap-2"><a className="manager-link" href="/manage">My cards</a><a className="manager-link" href="/admin">Admin</a></nav>
      </header>
      {children}
    </div>
  )
}

function CredentialPage() {
  const path = window.location.pathname
  const isRegister = path === '/register'
  const isForgot = path === '/forgot-password'
  const isReset = path === '/reset-password'
  const isResend = path === '/resend-confirmation'

  const query = new URLSearchParams(window.location.search)
  const [form, setForm] = useState({
    email: query.get('email') || '',
    password: '',
    confirmPassword: '',
    twoFactorCode: '',
    recoveryCode: '',
    resetCode: query.get('code') || '',
  })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const title = isRegister ? 'Create your account' : isForgot ? 'Reset your password' : isReset ? 'Choose a new password' : isResend ? 'Confirm your email' : 'Welcome back'
  const kicker = isRegister ? 'Register' : isForgot || isReset ? 'Account recovery' : isResend ? 'Email confirmation' : 'Sign in'

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setNotice(null)
    try {
      if (isRegister) {
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match.')
        await authApi.register(form.email, form.password)
        setNotice({ type: 'success', text: 'Account created. You can now sign in.' })
      } else if (isResend) {
        await authApi.resendConfirmation(form.email)
        setNotice({ type: 'success', text: 'Confirmation email sent.' })
      } else if (isForgot) {
        await authApi.forgotPassword(form.email)
        setNotice({ type: 'success', text: 'If the account exists, password reset instructions have been sent.' })
      } else if (isReset) {
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match.')
        await authApi.resetPassword(form.email, form.resetCode, form.password)
        setNotice({ type: 'success', text: 'Password reset. You can now sign in.' })
      } else {
        await authApi.login(form.email, form.password, form.twoFactorCode, form.recoveryCode)
        const returnTo = query.get('returnTo')
        window.location.href = returnTo?.startsWith('/') ? returnTo : '/manage'
      }
    } catch (error) {
      setNotice({ type: 'error', text: messageFor(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell>
      <main className="auth-page-grid">
        <section className="auth-page-copy"><p className="manager-kicker">{kicker}</p><h1>{title}</h1><p>Manage your invitation details securely.</p></section>
        <section className="auth-page-form">
          <form className="manager-form" onSubmit={submit}>
            <label>Email<input type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
            {!isForgot && !isResend && <label>{isReset ? 'New password' : 'Password'}<input type="password" required minLength={6} autoComplete={isRegister || isReset ? 'new-password' : 'current-password'} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></label>}
            {(isRegister || isReset) && <label>Confirm password<input type="password" required minLength={6} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} /></label>}
            {isReset && <label>Reset code<input required value={form.resetCode} onChange={(event) => setForm((current) => ({ ...current, resetCode: event.target.value }))} /></label>}
            {!isRegister && !isForgot && !isReset && !isResend && (
              <details className="auth-2fa-details"><summary>Use a 2FA or recovery code</summary><label>Authenticator code<input inputMode="numeric" autoComplete="one-time-code" value={form.twoFactorCode} onChange={(event) => setForm((current) => ({ ...current, twoFactorCode: event.target.value }))} /></label><label>Recovery code<input value={form.recoveryCode} onChange={(event) => setForm((current) => ({ ...current, recoveryCode: event.target.value }))} /></label></details>
            )}
            <button className="manager-primary" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : isForgot ? 'Send reset link' : isReset ? 'Reset password' : isResend ? 'Send confirmation link' : 'Sign in'}</button>
          </form>
          <AuthNotice notice={notice} />
          <div className="auth-page-links">
            {!isRegister && <a href="/register">Create account</a>}
            {isRegister && <a href="/login">Already have an account?</a>}
            {!isForgot && !isReset && <a href="/forgot-password">Forgot password?</a>}
            {!isResend && <a href="/resend-confirmation">Resend confirmation</a>}
            {(isForgot || isReset || isResend) && <a href="/login">Back to sign in</a>}
          </div>
        </section>
      </main>
    </AuthShell>
  )
}

export default function AuthPage() {
  if (window.location.pathname === '/account') return <AccountPage />
  if (window.location.pathname === '/confirm-email') return <ConfirmEmailPage />
  return <CredentialPage />
}
