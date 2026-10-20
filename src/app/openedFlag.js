// When the landing page plays a template's envelope itself, it leaves this
// flag so the template doesn't play the intro a second time.
const KEY = 'wedfolio:opened'

export function markOpened(slug) {
  try {
    sessionStorage.setItem(KEY, slug)
  } catch {
    // storage unavailable: the template will just show its intro
  }
}

// Read once per page load (StrictMode renders twice, so this can't live in render).
let consumed
export function consumeOpened() {
  if (consumed !== undefined) return consumed
  try {
    consumed = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
  } catch {
    consumed = null
  }
  return consumed
}
