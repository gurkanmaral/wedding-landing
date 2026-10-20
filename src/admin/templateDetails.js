import { templates as registryTemplates } from '../templates/registry.js'

// Card details store the template under the `template` key. The first eight
// templates were saved with their own historical values, so they keep them;
// every other template uses its registry slug.
const LEGACY_VALUES = {
  'art-deco': 'artdeco',
  storybook: 'gilded-rome',
  'sole-mare': 'spark',
}

export const TEMPLATE_OPTIONS = registryTemplates.map((template) => ({
  value: LEGACY_VALUES[template.slug] || template.slug,
  slug: template.slug,
  label: template.name,
  path: template.path,
  mood: template.mood,
  lang: template.lang,
  swatch: template.intro?.bg || template.intro?.paper || '#d9b67c',
}))

const DEFAULT_TEMPLATE = TEMPLATE_OPTIONS.find((option) => option.value === 'artdeco') || TEMPLATE_OPTIONS[0]

// Accepts a card's `template` detail, a registry slug (as sent by the landing
// contact form) or a path, and returns the matching template option.
export function findTemplateOption(value) {
  if (!value) return null
  const key = String(value).trim().toLowerCase().replace(/^\/+/, '')
  return TEMPLATE_OPTIONS.find((option) => (
    option.value === key || option.slug === key || option.path === `/${key}`
  )) || null
}

export function templateLabel(value) {
  return findTemplateOption(value)?.label || value || 'Şablon seçilmedi'
}

// Path of the live invitation page for a card's template detail.
export function templatePathFor(value) {
  return (findTemplateOption(value) || DEFAULT_TEMPLATE)?.path || '/artdeco'
}

export function invitationHref(details) {
  const path = templatePathFor(details?.template)
  return details?.slug ? `${path}/${encodeURIComponent(details.slug)}` : null
}

export const DETAIL_LABELS = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: 'Event date and time',
  dateLabel: 'Displayed date',
  venue: 'Venue',
  city: 'City',
  address: 'Address',
  rsvpDeadline: 'RSVP deadline',
  description: 'Invitation message',
  receptionVenue: 'Reception venue',
}

const CORE_FIELDS = ['partner1', 'partner2', 'eventDate', 'dateLabel']
const PLACE_FIELDS = ['venue', 'city', 'address', 'rsvpDeadline']

const TEMPLATE_SCHEMAS = {
  artdeco: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-09-18T16:00:00+02:00',
      dateLabel: '18 September 2027',
      venue: 'Villa Aurelia',
      city: 'Rome',
      address: 'Largo di Porta San Pancrazio, 1',
      rsvpDeadline: '7 August 2027',
    },
  },
  celestial: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-09-11T17:30:00-07:00',
      dateLabel: '11 September 2027',
      venue: 'Lumiere Estate',
      city: 'Napa Valley, California',
      address: '1700 Stargrove Lane, Napa Valley, California',
      rsvpDeadline: '7 August 2027',
    },
  },
  'gilded-rome': {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-06-12T17:00:00+02:00',
      dateLabel: '12 June 2027',
      venue: 'Masseria del Sole',
      city: 'Puglia, Italy',
      address: 'Ostuni, Puglia, Italy',
      rsvpDeadline: '1 May 2027',
    },
  },
  sakura: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS, 'description', 'receptionVenue'],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-04-03T16:00:00+09:00',
      dateLabel: '3 April 2027',
      venue: 'Heian Shrine',
      city: 'Kyoto',
      address: 'Sakyo-ku, Kyoto',
      rsvpDeadline: '20 February 2027',
      description: 'With the warmth of the season and the blessing of our families, we invite you to witness the joining of our lives.',
      receptionVenue: 'Heian Shrine Garden',
    },
  },
  autumn: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-10-16T16:00:00-04:00',
      dateLabel: '16 October 2027',
      venue: 'Maplewood Estate',
      city: 'Hudson Valley, New York',
      address: 'Maplewood Estate, Hudson Valley, New York',
      rsvpDeadline: '4 September 2027',
    },
  },
  aegean: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-06-19T17:00:00+03:00',
      dateLabel: '19 Haziran 2027',
      venue: 'Zeytinlik Koyu',
      city: 'Alaçatı, Çeşme',
      address: 'Zeytinlik Koyu, Alaçatı, Çeşme, İzmir',
      rsvpDeadline: '8 Mayıs 2027',
    },
  },
  spark: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-09-04T17:00:00+03:00',
      dateLabel: '4 Eylül 2027',
      venue: 'Villa Defne',
      city: 'Bodrum, Muğla',
      address: 'Yalıkavak Sahil Yolu',
      rsvpDeadline: '24 Temmuz 2027',
    },
  },
  royal: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Jane',
      partner2: 'Joe',
      eventDate: '2027-09-25T17:00:00+02:00',
      dateLabel: 'Saturday, 25 September 2027',
      venue: 'Villa Ephrussi de Rothschild',
      city: 'Saint-Jean-Cap-Ferrat',
      address: '1 Avenue Ephrussi de Rothschild, 06230 Saint-Jean-Cap-Ferrat',
      rsvpDeadline: 'Saturday, 14 August 2027',
    },
  },
}

const formatRegistryDate = (isoDate, lang, offsetDays = 0) => {
  const date = new Date(`${isoDate}T12:00:00`)
  if (!Number.isFinite(date.getTime())) return ''
  date.setDate(date.getDate() + offsetDays)
  return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

// Templates without a hand-written schema get the core and place fields,
// pre-filled from their registry entry.
function registrySchema(slug) {
  const entry = registryTemplates.find((template) => template.slug === slug)
  if (!entry) return null
  const [partner1 = 'Jane', partner2 = 'Joe'] = entry.couple || []
  const places = (entry.place || '').split(',').map((part) => part.trim()).filter(Boolean)
  return {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1,
      partner2,
      eventDate: entry.date ? `${entry.date}T17:00:00+03:00` : '',
      dateLabel: entry.date ? formatRegistryDate(entry.date, entry.lang) : '',
      venue: places[0] || '',
      city: places.slice(1).join(', ') || places[0] || '',
      address: entry.place || '',
      rsvpDeadline: entry.date ? formatRegistryDate(entry.date, entry.lang, -42) : '',
    },
  }
}

const schemaCache = new Map()

export function getTemplateSchema(template) {
  const option = findTemplateOption(template) || DEFAULT_TEMPLATE
  const value = option?.value || 'artdeco'
  if (TEMPLATE_SCHEMAS[value]) return TEMPLATE_SCHEMAS[value]
  if (!schemaCache.has(value)) schemaCache.set(value, registrySchema(option.slug) || TEMPLATE_SCHEMAS.artdeco)
  return schemaCache.get(value)
}

export function createTemplateDetails(template = 'artdeco') {
  const schema = getTemplateSchema(template)
  const value = findTemplateOption(template)?.value || template
  return { template: value, ...schema.defaults }
}

export function changeDetailsTemplate(details, template) {
  const defaults = createTemplateDetails(template)
  const next = { ...details, template: defaults.template }
  getTemplateSchema(template).fields.forEach((key) => {
    if (!Object.hasOwn(next, key)) next[key] = defaults[key] || ''
  })
  return next
}

export function storedDetails(details, fallbackTemplate = 'artdeco') {
  const source = details || {}
  return { template: source.template || fallbackTemplate, ...source }
}
