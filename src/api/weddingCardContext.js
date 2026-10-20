import { createContext, useContext, useMemo } from 'react'

export const WeddingCardContext = createContext({
  card: null,
  loading: false,
  error: null,
  cardId: null,
  cardSlug: null,
})

export function useWeddingCard() {
  return useContext(WeddingCardContext)
}

export function cardDetail(card, key, fallback) {
  const value = card?.details?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

export function useWeddingCardFields(defaults, locale = 'en-GB') {
  const context = useWeddingCard()
  const { card } = context
  const cardNameParts = (card?.name || '')
    .split('&')
    .map((value) => value.trim())
    .filter(Boolean)
  const partner1 = cardDetail(card, 'partner1', cardNameParts[0] || defaults.partner1)
  const partner2 = cardDetail(card, 'partner2', cardNameParts[1] || defaults.partner2)
  const eventDateValue = cardDetail(
    card,
    'eventDate',
    cardDetail(card, 'date', defaults.eventDate),
  )
  const eventDate = useMemo(() => {
    const parsed = new Date(eventDateValue)
    if (Number.isFinite(parsed.getTime())) return parsed
    return new Date(defaults.eventDate)
  }, [defaults.eventDate, eventDateValue])
  const fallbackDateLabel = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(eventDate)
  const venue = cardDetail(card, 'venue', defaults.venue)
  const address = cardDetail(card, 'address', defaults.address)

  return {
    ...context,
    partner1,
    partner2,
    eventDate,
    eventDateValue,
    dateLabel: cardDetail(card, 'dateLabel', defaults.dateLabel || fallbackDateLabel),
    venue,
    city: cardDetail(card, 'city', defaults.city),
    address,
    rsvpDeadline: cardDetail(card, 'rsvpDeadline', defaults.rsvpDeadline),
    description: cardDetail(card, 'description', defaults.description),
    receptionVenue: cardDetail(card, 'receptionVenue', defaults.receptionVenue || venue),
    receptionAddress: cardDetail(card, 'receptionAddress', defaults.receptionAddress || address),
  }
}
