import { useEffect, useState } from 'react'

// A DOM slot next to an engine-rendered element (found by selector), so the
// template can portal its own markup into an engine section — e.g. an extra
// RSVP field. Re-attaches when the engine re-renders the anchor.
export function useSlot(selector, position = 'beforebegin', className = '') {
  const [slot] = useState(() => {
    const element = document.createElement('div')
    element.className = className
    return element
  })
  useEffect(() => {
    const place = () => {
      if (slot.isConnected) return
      const anchor = document.querySelector(selector)
      if (anchor) anchor.insertAdjacentElement(position, slot)
    }
    place()
    const observer = new MutationObserver(place)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      slot.remove()
    }
  }, [slot, selector, position])
  return slot
}
