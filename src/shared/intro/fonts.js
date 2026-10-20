// Intro text is drawn to canvas or sampled into particles, so fonts must be ready first.

function stylesheet(href) {
  const existing = document.querySelector(`link[href="${href}"]`)
  if (existing?.sheet) return Promise.resolve()
  const link = existing ?? Object.assign(document.createElement('link'), { rel: 'stylesheet', href })
  const loaded = new Promise((resolve) => {
    link.addEventListener('load', resolve, { once: true })
    link.addEventListener('error', resolve, { once: true })
  })
  if (!existing) document.head.appendChild(link)
  return loaded
}

/**
 * fonts: [{ family, weight?, style?, google? }] — `google` is the css2 family
 * query (e.g. 'Great+Vibes') for fonts not already loaded globally.
 */
export function loadFontList(fonts, timeoutMs = 3000) {
  const google = fonts.filter((f) => f.google).map((f) => `family=${f.google}`)
  const sheet = google.length ? stylesheet(`https://fonts.googleapis.com/css2?${google.join('&')}&display=swap`) : Promise.resolve()
  const ready = sheet.then(() =>
    Promise.allSettled(
      fonts.map((f) => document.fonts.load(`${f.style ?? 'normal'} ${f.weight ?? 400} 80px "${f.family}"`, 'Aa&0Jj')),
    ),
  )
  return Promise.race([ready, new Promise((resolve) => setTimeout(resolve, timeoutMs))])
}

// Fonts used by the original envelope scene.
export function loadFonts(intro) {
  return loadFontList([
    { family: intro.font, weight: intro.fontWeight, style: intro.fontStyle, google: intro.googleFont },
    { family: intro.font, weight: intro.fontWeight },
    { family: 'Italianno' },
  ])
}
