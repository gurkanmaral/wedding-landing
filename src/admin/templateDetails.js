export const TEMPLATE_OPTIONS = [
  { value: 'artdeco', label: 'Art Deco', path: '/artdeco' },
  { value: 'celestial', label: 'Celestial', path: '/celestial' },
  { value: 'gilded-rome', label: 'Sunny Storybook', path: '/gilded-rome' },
  { value: 'sakura', label: 'Sakura', path: '/sakura' },
  { value: 'autumn', label: 'Autumn Falls', path: '/autumn' },
  { value: 'aegean', label: 'Ege Zeytin', path: '/aegean' },
  { value: 'spark', label: 'Sole & Mare', path: '/spark' },
  { value: 'royal', label: 'Royal Garden', path: '/royal' },
]

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
