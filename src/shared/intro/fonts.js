// Card and seal text is drawn to canvas, so the fonts must be ready first.

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

export function loadFonts(intro) {
  const style = intro.fontStyle ?? 'normal'
  const weight = intro.fontWeight ?? 400
  // The @font-face rules have to exist before document.fonts.load can find them.
  const ready = (intro.googleFont ? stylesheet(`https://fonts.googleapis.com/css2?family=${intro.googleFont}&display=swap`) : Promise.resolve()).then(() =>
    Promise.allSettled([
      document.fonts.load(`${style} ${weight} 80px "${intro.font}"`, 'Aa&0'),
      document.fonts.load(`${weight} 80px "${intro.font}"`, 'Aa&0'),
      document.fonts.load('80px "Italianno"', 'Aa'),
    ]),
  )
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000))
  return Promise.race([ready, timeout])
}
