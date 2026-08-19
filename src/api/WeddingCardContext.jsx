import { useEffect, useMemo, useState } from 'react'
import { weddingCardApi } from './weddingCardApi'
import { WeddingCardContext } from './weddingCardContext'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHAREABLE_TEMPLATE_PATHS = new Set(['/artdeco', '/celestial', '/gilded-rome', '/sakura', '/autumn', '/aegean'])

export function WeddingCardProvider({ children }) {
  const cardId = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get('cardId')
    return value && UUID_PATTERN.test(value) ? value : null
  }, [])
  const cardSlug = useMemo(() => {
    if (cardId) return null
    const segments = window.location.pathname.split('/').filter(Boolean)
    return segments.length > 1 ? decodeURIComponent(segments[1]) : null
  }, [cardId])
  const [state, setState] = useState({ card: null, loading: Boolean(cardId || cardSlug), error: null })

  useEffect(() => {
    if (!cardId && !cardSlug) return undefined
    let active = true
    const request = cardId ? weddingCardApi.get(cardId) : weddingCardApi.getBySlug(cardSlug)
    request
      .then((card) => {
        if (active) {
          setState({ card, loading: false, error: null })
          const slug = card?.details?.slug
          const routeRoot = `/${window.location.pathname.split('/').filter(Boolean)[0] || ''}`
          if (cardId && slug && SHAREABLE_TEMPLATE_PATHS.has(routeRoot)) {
            window.history.replaceState(null, '', `${routeRoot}/${encodeURIComponent(slug)}`)
          }
        }
      })
      .catch((error) => {
        if (active) setState({ card: null, loading: false, error })
      })
    return () => {
      active = false
    }
  }, [cardId, cardSlug])

  const value = useMemo(() => ({ ...state, cardId, cardSlug }), [state, cardId, cardSlug])
  return <WeddingCardContext.Provider value={value}>{children}</WeddingCardContext.Provider>
}
