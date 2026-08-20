const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? '/backend'
    : 'http://utij5aczpy88qpa9jk67q2jp.51.178.142.251.sslip.io')
).replace(/\/$/, '')

const AUTH_STORAGE_KEY = 'wedding-card-auth'
const RECENT_CARDS_KEY = 'wedding-card-recent-ids'

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

function readJsonStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readAuth() {
  if (typeof window === 'undefined') return null
  return readJsonStorage(AUTH_STORAGE_KEY, null)
}

function saveAuth(auth) {
  if (typeof window === 'undefined') return
  if (!auth) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
}

function storeTokens(response) {
  const auth = {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + Number(response.expiresIn || 0) * 1000,
  }
  saveAuth(auth)
  return auth
}

async function parseResponse(response) {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('json')) return response.json()
  const text = await response.text()
  return text || null
}

function getErrorMessage(payload, response) {
  if (payload?.detail) return payload.detail
  if (payload?.title) return payload.title
  if (payload?.errors) {
    return Object.values(payload.errors).flat().filter(Boolean).join(' ')
  }
  return `Request failed (${response.status})`
}

async function rawRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response), response.status, payload)
  }
  return payload
}

let refreshPromise = null

async function refreshAccessToken() {
  const auth = readAuth()
  if (!auth?.refreshToken) throw new ApiError('Your session has expired.', 401)

  if (!refreshPromise) {
    refreshPromise = rawRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    })
      .then(storeTokens)
      .catch((error) => {
        saveAuth(null)
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function authorizedRequest(path, options = {}) {
  const auth = readAuth()
  if (!auth?.accessToken) throw new ApiError('Please sign in to continue.', 401)

  if (auth.expiresAt && auth.expiresAt <= Date.now() + 15000) {
    await refreshAccessToken()
  }

  const perform = () => rawRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${readAuth()?.accessToken}`,
    },
  })

  try {
    return await perform()
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    await refreshAccessToken()
    return perform()
  }
}

const encode = (value) => encodeURIComponent(value)

export const authApi = {
  getSession: readAuth,
  isAuthenticated: () => Boolean(readAuth()?.accessToken || readAuth()?.refreshToken),
  logout: () => saveAuth(null),
  register: (email, password) => rawRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  login: async (email, password, twoFactorCode = '', twoFactorRecoveryCode = '') => {
    const response = await rawRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        twoFactorCode: twoFactorCode || null,
        twoFactorRecoveryCode: twoFactorRecoveryCode || null,
      }),
    })
    storeTokens(response)
    return response
  },
  refresh: refreshAccessToken,
  confirmEmail: (userId, code, changedEmail = '') => {
    const query = new URLSearchParams({ userId, code })
    if (changedEmail) query.set('changedEmail', changedEmail)
    return rawRequest(`/auth/confirmEmail?${query.toString()}`)
  },
  forgotPassword: (email) => rawRequest('/auth/forgotPassword', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (email, resetCode, newPassword) => rawRequest('/auth/resetPassword', {
    method: 'POST',
    body: JSON.stringify({ email, resetCode, newPassword }),
  }),
  resendConfirmation: (email) => rawRequest('/auth/resendConfirmationEmail', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  getInfo: () => authorizedRequest('/auth/manage/info'),
  updateInfo: (payload) => authorizedRequest('/auth/manage/info', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  manageTwoFactor: (payload = {}) => authorizedRequest('/auth/manage/2fa', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}

export const weddingCardApi = {
  listPublished: () => rawRequest('/api/client/wedding-cards'),
  get: (id) => rawRequest(`/api/client/wedding-cards/${encode(id)}`),
  getBySlug: (slug) => rawRequest(`/api/client/wedding-cards/by-slug/${encode(slug)}`),
  create: (payload) => authorizedRequest('/api/client/wedding-cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, name) => authorizedRequest(`/api/client/wedding-cards/${encode(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  }),
  remove: (id) => authorizedRequest(`/api/client/wedding-cards/${encode(id)}`, {
    method: 'DELETE',
  }),
  upsertDetail: (id, key, value) => authorizedRequest(
    `/api/client/wedding-cards/${encode(id)}/details/${encode(key)}`,
    { method: 'PUT', body: JSON.stringify({ value }) },
  ),
  removeDetail: (id, key) => authorizedRequest(
    `/api/client/wedding-cards/${encode(id)}/details/${encode(key)}`,
    { method: 'DELETE' },
  ),
}

export const invitationRequestApi = {
  create: (payload) => rawRequest('/api/client/invitation-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
}

export const adminInvitationRequestApi = {
  list: (status = '') => authorizedRequest(`/api/admin/invitation-requests${status ? `?status=${encode(status)}` : ''}`),
  get: (id) => authorizedRequest(`/api/admin/invitation-requests/${encode(id)}`),
  updateStatus: (id, status) => authorizedRequest(`/api/admin/invitation-requests/${encode(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  remove: (id) => authorizedRequest(`/api/admin/invitation-requests/${encode(id)}`, {
    method: 'DELETE',
  }),
}

export const adminWeddingCardApi = {
  list: () => authorizedRequest('/api/admin/wedding-cards'),
  get: (id) => authorizedRequest(`/api/admin/wedding-cards/${encode(id)}`),
  create: (payload) => authorizedRequest('/api/admin/wedding-cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (id, payload) => authorizedRequest(`/api/admin/wedding-cards/${encode(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (id) => authorizedRequest(`/api/admin/wedding-cards/${encode(id)}`, {
    method: 'DELETE',
  }),
  upsertDetail: (id, key, value) => authorizedRequest(
    `/api/admin/wedding-cards/${encode(id)}/details/${encode(key)}`,
    { method: 'PUT', body: JSON.stringify({ value }) },
  ),
  removeDetail: (id, key) => authorizedRequest(
    `/api/admin/wedding-cards/${encode(id)}/details/${encode(key)}`,
    { method: 'DELETE' },
  ),
}

export const recentCards = {
  get: () => (typeof window === 'undefined' ? [] : readJsonStorage(RECENT_CARDS_KEY, [])),
  remember: (card) => {
    const cards = recentCards.get().filter((item) => item.id !== card.id)
    const next = [{ id: card.id, name: card.name }, ...cards].slice(0, 8)
    window.localStorage.setItem(RECENT_CARDS_KEY, JSON.stringify(next))
    return next
  },
  forget: (id) => {
    const next = recentCards.get().filter((item) => item.id !== id)
    window.localStorage.setItem(RECENT_CARDS_KEY, JSON.stringify(next))
    return next
  },
}

export { API_BASE_URL }
