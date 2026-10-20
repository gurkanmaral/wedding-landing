import { useCallback, useState } from 'react'
import { rsvpApi } from './weddingCardApi'
import { useWeddingCard } from './weddingCardContext'

const messages = {
  tr: {
    rateLimited: 'Kısa sürede çok fazla yanıt gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.',
    failed: 'Yanıtınız gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.',
  },
  en: {
    rateLimited: 'Too many replies were sent in a short time. Please try again in a few minutes.',
    failed: 'Your reply could not be sent. Check your connection and try again.',
  },
}

/**
 * Sends a guest's reply for the card this invitation belongs to.
 * On the demo pages (no card in the link) nothing is stored; the reply just succeeds,
 * so visitors can try the form.
 *
 * payload: { name, attending: boolean, guests?: number, note?: string, song?: string }
 */
export function useRsvp(lang = 'tr') {
  const { card, cardId, cardSlug } = useWeddingCard()
  const [state, setState] = useState({ status: 'idle', error: '' })

  const submit = useCallback(
    async (payload) => {
      const text = messages[lang] ?? messages.tr
      setState({ status: 'sending', error: '' })
      const body = {
        name: String(payload.name ?? '').trim(),
        attending: Boolean(payload.attending),
        guests: payload.attending ? Math.min(10, Math.max(1, Number(payload.guests) || 1)) : 0,
        note: payload.note?.trim() || null,
        song: payload.song?.trim() || null,
      }
      try {
        const id = card?.id ?? cardId
        if (id) await rsvpApi.create(id, body)
        else if (cardSlug) await rsvpApi.createBySlug(cardSlug, body)
        setState({ status: 'sent', error: '' })
        return true
      } catch (error) {
        setState({ status: 'error', error: error?.status === 429 ? text.rateLimited : text.failed })
        return false
      }
    },
    [card, cardId, cardSlug, lang],
  )

  return { ...state, submit, isDemo: !card && !cardId && !cardSlug }
}
