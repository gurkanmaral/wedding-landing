// Velvet drapery, painted rather than modelled: each traveller curtain is a
// canvas shaded pixel by pixel (deep folds, a velvet rim-sheen on the flank
// that faces the screen, a warm footlight bounce at the hem), and the
// swagged valance with its brass fringe and tassels is built as SVG.

const VELVET = [150, 14, 26]
const SHADOW = [22, 1, 4]
const SHEEN = [255, 120, 118]
const WARM = [255, 168, 96]

function noise1(seed) {
  let s = seed >>> 0
  const values = Array.from({ length: 256 }, () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  })
  return (x) => {
    const i = Math.floor(x)
    const f = x - i
    const t = f * f * (3 - 2 * f)
    return values[i & 255] + (values[(i + 1) & 255] - values[i & 255]) * t
  }
}

/**
 * Paints one curtain panel. side: 'left' | 'right' (which half of the stage
 * it hangs in; the flank nearest the screen catches the sheen).
 */
export function paintCurtain(canvas, { width, height, side, pitch, seed = 3 }) {
  const scale = Math.min(1.25, window.devicePixelRatio || 1)
  const W = Math.max(2, Math.round(width * scale))
  const H = Math.max(2, Math.round(height * scale))
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const data = img.data
  const n = noise1(seed)
  const p = pitch * scale
  // light comes from the screen side
  const toward = side === 'left' ? 1 : -1
  const columnPhase = new Float32Array(W)
  for (let x = 0; x < W; x += 1) {
    const u = x / p
    columnPhase[x] = u * Math.PI * 2 + n(u * 0.9) * 2.4 + n(u * 0.23 + 40) * 3
  }
  for (let y = 0; y < H; y += 1) {
    const v = y / H
    // fabric gathered at the rail, falling open toward the hem
    const fan = 1 + 0.08 * v
    const sway = Math.sin(v * 3.1) * 0.25
    // top falls into darkness above the lights, the hem catches the footlights
    const vert = Math.min(1, 0.28 + v * 1.25) * (v > 0.965 ? 0.55 : 1)
    const foot = v ** 5 * 0.55
    for (let x = 0; x < W; x += 1) {
      const phi = columnPhase[x] * fan + sway
      const crest = 0.5 + 0.5 * Math.sin(phi)
      const flank = Math.cos(phi) * toward
      const lambert = 0.12 + 0.78 * crest ** 1.4
      const sheen = Math.max(0, flank) ** 5 * 0.55 * (0.4 + crest) + crest ** 22 * 0.18
      const grain = (Math.random() - 0.5) * 0.035
      const i = (y * W + x) * 4
      for (let c = 0; c < 3; c += 1) {
        const base = SHADOW[c] + (VELVET[c] - SHADOW[c]) * lambert
        const value = (base + SHEEN[c] * sheen + WARM[c] * foot * crest * 0.35) * vert * (1 + grain)
        data[i + c] = value > 255 ? 255 : value
      }
      data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  // leading edge: a heavier turned hem with a soft shadow
  const edgeX = side === 'left' ? W : 0
  const edge = ctx.createLinearGradient(edgeX, 0, edgeX - toward * W * 0.05, 0)
  edge.addColorStop(0, 'rgba(10,0,2,0.75)')
  edge.addColorStop(0.25, 'rgba(255,120,118,0.08)')
  edge.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, W, H)
}

/** Swagged velvet valance with a brass pelmet rail, bullion fringe and tassels. */
export function valanceSvg(width, height, uid) {
  const W = Math.max(1, Math.round(width))
  const H = Math.max(1, Math.round(height))
  const swags = Math.max(3, Math.round(W / 250))
  const sw = W / swags
  const band = H * 0.42
  const dip = H * 0.9
  const inner = H * 0.58
  const id = (name) => `${name}-${uid}`

  let swagPaths = ''
  let fringe = ''
  let tassels = ''
  for (let i = 0; i < swags; i += 1) {
    const x0 = i * sw - sw * 0.04
    const x1 = (i + 1) * sw + sw * 0.04
    const outer = `M${x0} ${band} C${x0 + sw * 0.18} ${dip} ${x1 - sw * 0.18} ${dip} ${x1} ${band}`
    swagPaths += `<path d="${outer} C${x1 - sw * 0.22} ${inner} ${x0 + sw * 0.22} ${inner} ${x0} ${band}Z" fill="url(#${id('swag')})"/>`
    // folds inside the swag
    for (let f = 1; f <= 3; f += 1) {
      const k = f / 4
      const y = inner + (dip - inner) * k
      swagPaths += `<path d="M${x0 + sw * 0.03 * f} ${band + (y - band) * 0.15} C${x0 + sw * 0.2} ${y} ${x1 - sw * 0.2} ${y} ${x1 - sw * 0.03 * f} ${band + (y - band) * 0.15}" fill="none" stroke="rgba(12,0,2,0.45)" stroke-width="${H * 0.03}" stroke-linecap="round"/>`
      swagPaths += `<path d="M${x0 + sw * 0.05 * f} ${band + (y - band) * 0.12} C${x0 + sw * 0.22} ${y - H * 0.035} ${x1 - sw * 0.22} ${y - H * 0.035} ${x1 - sw * 0.05 * f} ${band + (y - band) * 0.12}" fill="none" stroke="rgba(255,120,118,0.16)" stroke-width="${H * 0.012}" stroke-linecap="round"/>`
    }
    // bullion fringe and braid along the hem
    const hem = `M${x0} ${band} C${x0 + sw * 0.18} ${dip} ${x1 - sw * 0.18} ${dip} ${x1} ${band}`
    fringe += `<path d="${hem}" fill="none" stroke="url(#${id('brass')})" stroke-width="${H * 0.075}" stroke-dasharray="1.4 2.2" transform="translate(0 ${H * 0.035})"/>`
    fringe += `<path d="${hem}" fill="none" stroke="url(#${id('brass')})" stroke-width="${Math.max(1.5, H * 0.014)}"/>`
    if (i > 0) {
      const tx = i * sw
      tassels += `<g transform="translate(${tx} ${band})"><circle r="${H * 0.04}" fill="url(#${id('brass')})"/><path d="M${-H * 0.025} ${H * 0.04} L${-H * 0.05} ${H * 0.3} L${H * 0.05} ${H * 0.3} L${H * 0.025} ${H * 0.04}Z" fill="url(#${id('brass')})"/><path d="M${-H * 0.05} ${H * 0.3} L${H * 0.05} ${H * 0.3}" stroke="#7a5f2c" stroke-width="${H * 0.012}"/></g>`
    }
  }

  const pitch = Math.max(14, H * 0.11)
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
  <defs>
    <linearGradient id="${id('folds')}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${pitch}" y2="0" spreadMethod="repeat">
      <stop offset="0" stop-color="#2a0306"/><stop offset="0.35" stop-color="#8e0c18"/><stop offset="0.55" stop-color="#c83a40"/><stop offset="0.7" stop-color="#8e0c18"/><stop offset="1" stop-color="#2a0306"/>
    </linearGradient>
    <linearGradient id="${id('shade')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.75"/><stop offset="0.7" stop-color="#000" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="${id('swag')}" cx="0.5" cy="0.05" r="0.95">
      <stop offset="0" stop-color="#4a0509"/><stop offset="0.45" stop-color="#9a1220"/><stop offset="0.75" stop-color="#c2333b"/><stop offset="1" stop-color="#5a060c"/>
    </radialGradient>
    <linearGradient id="${id('brass')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f3dc9b"/><stop offset="0.45" stop-color="#c9a85c"/><stop offset="1" stop-color="#7a5f2c"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${W}" height="${band + H * 0.04}" fill="url(#${id('folds')})"/>
  <rect x="0" y="0" width="${W}" height="${band + H * 0.04}" fill="url(#${id('shade')})"/>
  <rect x="0" y="${H * 0.02}" width="${W}" height="${Math.max(2, H * 0.03)}" fill="url(#${id('brass')})" opacity="0.9"/>
  <rect x="0" y="${H * 0.065}" width="${W}" height="${Math.max(1, H * 0.008)}" fill="url(#${id('brass')})" opacity="0.6"/>
  ${swagPaths}
  ${fringe}
  ${tassels}
</svg>`
}
