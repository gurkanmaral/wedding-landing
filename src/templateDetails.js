export const TEMPLATE_OPTIONS = [
  { value: 'artdeco', label: 'Art Deco', path: '/artdeco' },
  { value: 'celestial', label: 'Celestial', path: '/celestial' },
  { value: 'gilded-rome', label: 'Sunny Storybook', path: '/gilded-rome' },
  { value: 'sakura', label: 'Sakura', path: '/sakura' },
  { value: 'autumn', label: 'Autumn Falls', path: '/autumn' },
  { value: 'aegean', label: 'Ege Zeytin', path: '/aegean' },
]

export const DETAIL_LABELS = {
  partner1: 'First partner',
  partner2: 'Second partner',
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
      partner1: 'Elena',
      partner2: 'Marcus',
      eventDate: '2026-09-14T16:00:00+02:00',
      dateLabel: '14 September 2026',
      venue: 'Villa Aurelia',
      city: 'Rome',
      address: 'Largo di Porta San Pancrazio, 1',
      rsvpDeadline: '1 August 2026',
    },
  },
  celestial: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Aurora',
      partner2: 'Elias',
      eventDate: '2026-09-12T17:30:00-07:00',
      dateLabel: '12 September 2026',
      venue: 'Lumiere Estate',
      city: 'Napa Valley, California',
      address: '1700 Stargrove Lane, Napa Valley, California',
      rsvpDeadline: '1 August 2026',
    },
  },
  'gilded-rome': {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Sofia',
      partner2: 'Luca',
      eventDate: '2026-06-12T17:00:00+02:00',
      dateLabel: '12 June 2026',
      venue: 'Masseria del Sole',
      city: 'Puglia, Italy',
      address: 'Ostuni, Puglia, Italy',
      rsvpDeadline: '15 April 2026',
    },
  },
  sakura: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS, 'description', 'receptionVenue'],
    defaults: {
      partner1: 'Hiro',
      partner2: 'Aiko',
      eventDate: '2027-04-12T16:00:00+09:00',
      dateLabel: '12 April 2027',
      venue: 'Heian Shrine',
      city: 'Kyoto',
      address: 'Sakyo-ku, Kyoto',
      rsvpDeadline: '1 March 2027',
      description: 'With the warmth of the season and the blessing of our families, we invite you to witness the joining of our lives.',
      receptionVenue: 'Heian Shrine Garden',
    },
  },
  autumn: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Nazlı',
      partner2: 'Bahadır',
      eventDate: '2026-10-17T16:00:00-04:00',
      dateLabel: '17 October 2026',
      venue: 'Maplewood Estate',
      city: 'Hudson Valley, New York',
      address: 'Maplewood Estate, Hudson Valley, New York',
      rsvpDeadline: '15 September 2026',
    },
  },
  aegean: {
    fields: [...CORE_FIELDS, ...PLACE_FIELDS],
    defaults: {
      partner1: 'Elif',
      partner2: 'Deniz',
      eventDate: '2027-06-19T17:00:00+03:00',
      dateLabel: '19 Haziran 2027',
      venue: 'Zeytinlik Koyu',
      city: 'Alaçatı, Çeşme',
      address: 'Zeytinlik Koyu, Alaçatı, Çeşme, İzmir',
      rsvpDeadline: '15 Mayıs 2027',
    },
  },
}

export function getTemplateSchema(template) {
  return TEMPLATE_SCHEMAS[template] || TEMPLATE_SCHEMAS.artdeco
}

export function createTemplateDetails(template = 'artdeco') {
  const schema = getTemplateSchema(template)
  return { template, ...schema.defaults }
}

export function changeDetailsTemplate(details, template) {
  const defaults = createTemplateDetails(template)
  const next = { ...details, template }
  getTemplateSchema(template).fields.forEach((key) => {
    if (!Object.hasOwn(next, key)) next[key] = defaults[key] || ''
  })
  return next
}

export function storedDetails(details, fallbackTemplate = 'artdeco') {
  const source = details || {}
  return { template: source.template || fallbackTemplate, ...source }
}
