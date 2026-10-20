// 2D helpers for illustrated (DOM / SVG / canvas) intro scenes: gold-foil and
// paper-grain tiles as data URLs, scoped styles and small DOM utilities.
// Deliberately free of three.js so these scenes stay light.

export const SVG_NS = 'http://www.w3.org/2000/svg'

function canvas(width, height) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  return [c, c.getContext('2d')]
}

export function seeded(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/**
 * Seamless, semi-transparent gold-leaf crinkle: light and dark facets plus
 * fine grain. Laid over a gold gradient it reads as real foil.
 */
export function foilTile(size = 256, seed = 7) {
  const [c, ctx] = canvas(size, size)
  const random = seeded(seed)
  for (let i = 0; i < 520; i += 1) {
    const x = random() * size
    const y = random() * size
    const r = 3 + random() * 22
    const light = random() > 0.48
    ctx.fillStyle = light ? `rgba(255,246,214,${0.05 + random() * 0.16})` : `rgba(70,42,6,${0.05 + random() * 0.14})`
    const a = random() * Math.PI * 2
    const points = [0, 1, 2].map((k) => {
      const ang = a + k * 2.1 + random() * 0.8
      const rr = r * (0.5 + random() * 0.8)
      return [Math.cos(ang) * rr, Math.sin(ang) * rr]
    })
    // draw wrapped copies so the tile repeats without seams
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        if (x + ox + r < 0 || x + ox - r > size || y + oy + r < 0 || y + oy - r > size) continue
        ctx.beginPath()
        points.forEach(([px, py], k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, x + ox + px, y + oy + py))
        ctx.closePath()
        ctx.fill()
      }
    }
  }
  const image = ctx.getImageData(0, 0, size, size)
  const d = image.data
  for (let i = 0; i < d.length; i += 4) {
    const n = random()
    if (n > 0.93) {
      d[i] = 255
      d[i + 1] = 244
      d[i + 2] = 205
      d[i + 3] = Math.max(d[i + 3], 70 + random() * 90)
    } else if (n < 0.05) {
      d[i] = 60
      d[i + 1] = 36
      d[i + 2] = 6
      d[i + 3] = Math.max(d[i + 3], 40 + random() * 60)
    }
  }
  ctx.putImageData(image, 0, 0)
  return c.toDataURL('image/png')
}

// Neutral grain (transparent, light and dark specks) for paper, lacquer, velvet.
export function grainTile(size = 180, seed = 3, strength = 1) {
  const [c, ctx] = canvas(size, size)
  const image = ctx.createImageData(size, size)
  const d = image.data
  const random = seeded(seed)
  for (let i = 0; i < d.length; i += 4) {
    const v = random()
    const light = v > 0.5
    d[i] = light ? 255 : 0
    d[i + 1] = light ? 255 : 0
    d[i + 2] = light ? 255 : 0
    d[i + 3] = Math.abs(v - 0.5) * 2 * 34 * strength
  }
  ctx.putImageData(image, 0, 0)
  return c.toDataURL('image/png')
}

export const svgURL = (svg) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`

export function el(tag, className, parent, text) {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  parent?.appendChild(node)
  return node
}

export function svgEl(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVG_NS, tag)
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value))
  parent?.appendChild(node)
  return node
}

// Root element for a scene, with its own scoped <style>. remove() cleans up.
export function sceneRoot(host, prefix, css) {
  const id = `${prefix}${Math.random().toString(36).slice(2, 8)}`
  const root = document.createElement('div')
  root.className = id
  root.setAttribute('aria-hidden', 'true')
  const style = document.createElement('style')
  style.textContent = css(`.${id}`, id)
  root.appendChild(style)
  host.appendChild(root)
  return { root, id }
}

// requestAnimationFrame loop that pauses in background tabs.
export function loop(fn) {
  let raf = 0
  let last = performance.now()
  let elapsed = 0
  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (document.visibilityState !== 'visible') return
    elapsed += dt
    fn(dt, elapsed)
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}


// Measures text in the given CSS font (fonts are loaded before scenes build).
let measureCtx = null
export function textWidth(text, font) {
  if (!measureCtx) measureCtx = canvas(4, 4)[1]
  measureCtx.font = font
  return measureCtx.measureText(text).width
}
