import { ApiError } from '../api/weddingCardApi'
import { findTemplateOption } from './templateDetails'

export const ADMIN_TABS = [
  { id: 'overview', hash: 'genel-bakis', label: 'Genel bakış', icon: 'overview' },
  { id: 'cards', hash: 'davetiyeler', label: 'Davetiyeler', icon: 'cards' },
  { id: 'requests', hash: 'talepler', label: 'Talepler', icon: 'inbox' },
  { id: 'rsvp', hash: 'lcv', label: 'LCV', icon: 'rsvp' },
]

export function tabFromHash(hash) {
  const value = String(hash || '').replace(/^#/, '').split('/')[0]
  return ADMIN_TABS.find((tab) => tab.hash === value)?.id || 'overview'
}

export function hashForTab(id) {
  return ADMIN_TABS.find((tab) => tab.id === id)?.hash || 'genel-bakis'
}

export const REQUEST_STATUSES = [
  { value: 'new', label: 'Yeni', description: 'Henüz dönüş yapılmadı' },
  { value: 'contacted', label: 'İletişime geçildi', description: 'Çiftle görüşüldü' },
  { value: 'closed', label: 'Kapandı', description: 'Süreç tamamlandı' },
]

export const requestStatusLabel = (status) => (
  REQUEST_STATUSES.find((item) => item.value === status)?.label || status || 'Bilinmiyor'
)

export const DETAIL_LABELS_TR = {
  template: 'Şablon',
  slug: 'Bağlantı adresi',
  published: 'Yayın durumu',
  partner1: 'Birinci isim',
  partner2: 'İkinci isim',
  eventDate: 'Tören tarihi ve saati',
  dateLabel: 'Davetiyede görünen tarih',
  venue: 'Mekân',
  city: 'Şehir',
  address: 'Adres',
  rsvpDeadline: 'LCV son tarihi',
  description: 'Davet metni',
  receptionVenue: 'Resepsiyon mekânı',
}

export const DETAIL_HINTS_TR = {
  dateLabel: 'Davetiyede yazıldığı gibi görünür, ör. “18 Eylül 2027”.',
  rsvpDeadline: 'Konuklara gösterilen son yanıt tarihi, ör. “1 Ağustos 2027”.',
  address: 'Harita bağlantısı bu adresle oluşturulur.',
}

// ---------- formatting ----------

const dateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })
const shortDateFormatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
const numberFormatter = new Intl.NumberFormat('tr-TR')

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

export const formatDate = (value) => {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : ''
}

export const formatDateTime = (value) => {
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date) : ''
}

export const formatShortDate = (value) => {
  const date = toDate(value)
  return date ? shortDateFormatter.format(date) : ''
}

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0)

export function relativeTime(value, now) {
  const date = toDate(value)
  if (!date || !now) return ''
  const minutes = Math.round((now - date.getTime()) / 60000)
  if (minutes < 1) return 'az önce'
  if (minutes < 60) return `${minutes} dk önce`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} sa önce`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} gün önce`
  return formatDate(date)
}

// ---------- cards ----------

export function coupleName(card) {
  const details = card?.details || {}
  const names = [details.partner1, details.partner2].map((item) => item?.trim()).filter(Boolean)
  if (names.length) return names.join(' & ')
  return card?.name || 'İsimsiz davetiye'
}

export function cardEventTime(card) {
  return toDate(card?.details?.eventDate)?.getTime() ?? null
}

export function cardDateText(card) {
  const details = card?.details || {}
  return formatDate(details.eventDate) || details.dateLabel || ''
}

export const isPublished = (card) => card?.details?.published === 'true'

const collator = new Intl.Collator('tr-TR', { sensitivity: 'base' })

export function compareText(a, b) {
  return collator.compare(a || '', b || '')
}

export function normalizeSearch(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[̀-ͯ]/g, '')
}

// ---------- event date ----------

// "2027-09-18T16:00:00+02:00" → { local: "2027-09-18T16:00", offset: "+02:00" }
export function splitEventDate(value) {
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/)
  if (!match) return { local: '', offset: '+03:00' }
  const offset = match[3] === 'Z' ? '+00:00' : (match[3] || '+03:00')
  return { local: `${match[1]}T${match[2] || '17:00'}`, offset }
}

export function joinEventDate(local, offset = '+03:00') {
  if (!local) return ''
  return `${local}:00${offset}`
}

export function dateLabelFromEvent(value, template) {
  const { local } = splitEventDate(value)
  if (!local) return ''
  const date = new Date(`${local.slice(0, 10)}T12:00:00`)
  const lang = findTemplateOption(template)?.lang
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

// ---------- contact helpers ----------

export function phoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '')
}

// wa.me needs the number in international format without "+" or leading zeros.
export function whatsappHref(phone) {
  let digits = phoneDigits(phone)
  if (!digits) return null
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.length === 11 && digits.startsWith('0')) digits = `90${digits.slice(1)}`
  else if (digits.length === 10 && digits.startsWith('5')) digits = `90${digits}`
  return `https://wa.me/${digits}`
}

export function telHref(phone) {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : null
}

const NAME = '[A-ZÇĞİÖŞÜ][a-zçğıöşüâîû]+'
const COUPLE_PATTERN = new RegExp(`(${NAME})\\s*(?:&|\\+|\\bve\\b|\\band\\b|\\bile\\b|-)\\s*(${NAME})`, 'u')
const DATE_PATTERN = /\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/
const STOP_WORDS = new Set(['Merhaba', 'Selam', 'Biz', 'Bizim', 'Ben', 'Hello', 'Hi', 'Düğün', 'Nikah', 'Nikâh', 'Davetiye'])

// Best-effort extraction of the couple's names and wedding date from a request.
export function parseRequestForCard(request) {
  const message = request?.message || ''
  let partner1
  let partner2 = ''
  const match = message.match(COUPLE_PATTERN)
  if (match && !STOP_WORDS.has(match[1]) && !STOP_WORDS.has(match[2])) {
    partner1 = match[1]
    partner2 = match[2]
  } else {
    const fromName = (request?.fullName || '').match(COUPLE_PATTERN)
    if (fromName) {
      partner1 = fromName[1]
      partner2 = fromName[2]
    } else {
      partner1 = (request?.fullName || '').trim().split(/\s+/)[0] || ''
    }
  }

  let eventDate = ''
  const dateMatch = message.match(DATE_PATTERN)
  if (dateMatch) {
    const [, day, month, year] = dateMatch
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    if (Number.isFinite(new Date(`${iso}T12:00:00`).getTime()) && Number(month) <= 12) eventDate = `${iso}T17:00:00+03:00`
  }

  const template = findTemplateOption(request?.template)?.value || ''
  return { template, partner1, partner2, eventDate }
}

// ---------- errors ----------

const KNOWN_MESSAGES = [
  [/share link is already in use/i, 'Bu bağlantı adresi başka bir davetiyede kullanılıyor. Farklı bir adres deneyin.'],
  [/slug must contain only/i, 'Bağlantı adresi yalnızca küçük harf, rakam ve tire (-) içerebilir.'],
  [/name must be between/i, 'Davetiye adı 1 ile 200 karakter arasında olmalıdır.'],
  [/detail keys must be|key must be between/i, 'Alan adları 1 ile 100 karakter arasında olmalı ve değerleri boş bırakılmamalıdır.'],
  [/was not found/i, 'Kayıt bulunamadı; başka biri tarafından silinmiş olabilir.'],
  [/status must be/i, 'Geçersiz bir talep durumu gönderildi.'],
]

const translate = (message) => {
  const known = KNOWN_MESSAGES.find(([pattern]) => pattern.test(message))
  return known ? known[1] : message
}

export function isForbidden(error) {
  return error instanceof ApiError && error.status === 403
}

export function isUnauthorized(error) {
  return error instanceof ApiError && error.status === 401
}

export function adminErrorText(error, fallback = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.') {
  if (!(error instanceof ApiError)) {
    if (error instanceof TypeError) return 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'
    return fallback
  }
  if (error.status === 401) return 'Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.'
  if (error.status === 403) return 'Bu işlem için yönetici yetkisi gerekiyor.'
  if (error.status === 404) return 'Kayıt bulunamadı; silinmiş olabilir. Listeyi yenileyip tekrar deneyin.'
  if (error.status >= 500) return 'Sunucuda beklenmeyen bir hata oluştu. Birkaç dakika sonra tekrar deneyin.'
  const errors = error.details?.errors
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors).flat().filter(Boolean).map(translate)
    if (messages.length) return [...new Set(messages)].join(' ')
  }
  if (error.details?.detail) return translate(error.details.detail)
  return translate(error.message) || fallback
}

export function loginErrorText(error) {
  if (error instanceof ApiError) {
    const detail = String(error.details?.detail || error.message || '')
    if (/RequiresTwoFactor/i.test(detail)) return 'Bu hesap iki adımlı doğrulama kullanıyor. Doğrulama uygulamanızdaki kodu girin.'
    if (/LockedOut/i.test(detail)) return 'Çok fazla hatalı deneme yapıldı. Hesabınız kısa bir süreliğine kilitlendi; biraz sonra tekrar deneyin.'
    if (/NotAllowed/i.test(detail)) return 'Bu hesabın e-posta adresi henüz doğrulanmadı. Gelen kutunuzdaki doğrulama bağlantısını kullanın.'
    if (error.status === 401) return 'E-posta adresi ya da şifre hatalı. Lütfen bilgilerinizi kontrol edin.'
  }
  return adminErrorText(error, 'Giriş yapılamadı. Lütfen tekrar deneyin.')
}

export function requiresTwoFactor(error) {
  return error instanceof ApiError && /RequiresTwoFactor/i.test(String(error.details?.detail || error.message || ''))
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = Object.assign(document.createElement('textarea'), { value: text })
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  area.remove()
  if (!ok) throw new Error('copy failed')
}
