// The message in a bottle. The bottle is painted on a 2D canvas laid over the
// shore so the glass can refract the live sea and sand beneath it: the scene
// shows through almost straight in the middle, squeezes towards the walls and
// flips at the rim, all under an aqua-green tint with Fresnel-dark edges, a
// long specular streak, a backlit rim and a caustic focused into its shadow.
// Inside lies a rolled letter tied with twine. Also the parchment itself (SVG)
// for the unrolling moment. Shared by the intro and the page hero, which keeps
// the opened bottle and its cork on the sand.
import { el, stops, seeded } from './bodrumArt.js'

// Local units: axis along +x, base at x=0, lip at x=300, body radius 46.
export const LIP = 300
export const SCROLL = { x0: 40, x1: 200, r: 11 }
// how far the letter slides to clear the lip
export const SCROLL_OUT = LIP + 8 - SCROLL.x0
// where the popped cork comes to rest on the sand, relative to the neck (local units)
export const CORK_REST = { pull: 40, corkX: 62, corkY: 56, corkR: 560 }
const CENTER = 160

// Where the bottle lies on the sand, for a given shore layout.
export function restPose(v) {
  const s = v.portrait ? (v.W * 0.56) / 320 : Math.min(v.W * 0.2, 400) / 320
  return { x: v.W * (v.portrait ? 0.46 : 0.7), y: v.Ys + (v.portrait ? 100 : 97), a: -7, s }
}

// The opened bottle as the hero shows it (and the intro ends on).
export function openPose(v) {
  return { ...restPose(v), ...CORK_REST, scroll: SCROLL_OUT, scrollY: 0, scrollA: 0, showScroll: false, floating: 0, foam: 0 }
}

// How wet the glass and sand are right now: the swash runs up behind the bottle.
export function wetness(art, pose) {
  const { run, full } = art.swash(pose.x)
  const reach = Math.max(0, Math.min(1, (full - (pose.y - 50 * pose.s)) / (40 * pose.s)))
  return reach * Math.min(1, run * 1.4)
}

function radius(x) {
  if (x < 8) return 46 - 7 * (1 - Math.sin((x / 8) * (Math.PI / 2)))
  if (x < 176) return 46 - (x - 8) * 0.006
  if (x < 238) return 45 - 30 * (0.5 - 0.5 * Math.cos(Math.PI * ((x - 176) / 62)))
  if (x < 284) return 15 + (x - 238) * 0.015
  if (x < 287) return 15.7 + (x - 284) * 0.8
  if (x < 297) return 18.1
  return 18.1 - (x - 297) * 0.5
}

const XS = (() => {
  const xs = []
  for (let x = 0; x <= LIP; x += 2) xs.push(x)
  xs.push(287, 297)
  return [...new Set(xs)].sort((a, b) => a - b)
})()

// the silhouette, optionally shrunk towards the axis by q
function outline(q = 1) {
  const path = new Path2D()
  XS.forEach((x, i) => (i ? path.lineTo(x, -radius(x) * q) : path.moveTo(x, -radius(x) * q)))
  for (let i = XS.length - 1; i >= 0; i -= 1) path.lineTo(XS[i], radius(XS[i]) * q)
  path.closePath()
  return path
}

// a strip between q0 and q1 of the radius on one side (-1 top, 1 bottom), tapered at the ends
function band(q0, q1, side, x0, x1) {
  const xs = XS.filter((x) => x >= x0 && x <= x1)
  const qm = (q0 + q1) / 2
  const taper = (x) => Math.min(1, (x - x0) / 18, (x1 - x) / 18)
  const path = new Path2D()
  xs.forEach((x, i) => {
    const y = side * radius(x) * (qm + (q1 - qm) * taper(x))
    if (i) path.lineTo(x, y)
    else path.moveTo(x, y)
  })
  for (let i = xs.length - 1; i >= 0; i -= 1) path.lineTo(xs[i], side * radius(xs[i]) * (qm + (q0 - qm) * taper(xs[i])))
  path.closePath()
  return path
}

function corkTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 40
  const c = canvas.getContext('2d')
  c.fillStyle = '#c39a62'
  c.fillRect(0, 0, 40, 40)
  const random = seeded(3)
  for (let i = 0; i < 70; i += 1) {
    c.fillStyle = random() < 0.6 ? `rgba(110,72,36,${0.35 + random() * 0.4})` : `rgba(236,204,150,${0.4 + random() * 0.4})`
    c.beginPath()
    c.ellipse(random() * 40, random() * 40, 0.4 + random() * 1.5, 0.3 + random() * 0.8, random() * 3, 0, Math.PI * 2)
    c.fill()
  }
  return canvas
}

function spiral(c, r, turns = 3) {
  c.beginPath()
  for (let i = 0; i <= 60; i += 1) {
    const a = (i / 60) * turns * Math.PI * 2
    const rr = r * (0.92 - (i / 60) * 0.8)
    if (i) c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    else c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  c.stroke()
}

export function createBottlePainter() {
  const body = outline(1)
  const outside = new Path2D()
  outside.rect(-500, -400, 1300, 800)
  outside.addPath(body)
  // concentric zones of the glass: [outer, inner, how the scene behind is mapped across the axis]
  const rings = [
    [1, 0.88, -0.55],
    [0.88, 0.74, 0.45],
    [0.74, 0.5, 0.78],
    [0.5, 0, 0.94],
  ].map(([outer, inner, f]) => {
    const path = new Path2D()
    path.addPath(outline(outer))
    if (inner > 0) path.addPath(outline(inner))
    return { path, f }
  })
  const shine = band(0.54, 0.8, -1, 14, 296)
  const rim = band(0.88, 0.94, -1, 24, 284)
  const kick = band(0.6, 0.8, 1, 26, 180)
  const farWall = band(0.66, 0.84, 1, 30, 172)
  const wetSheen = band(0.3, 0.97, 1, 10, 230)
  const random = seeded(8)
  const grains = Array.from({ length: 34 }, () => {
    const x = 16 + random() * 150
    return { x, y: radius(x) * (0.82 + random() * 0.1) - 1, r: 0.6 + random() * 1.3, c: random() < 0.5 ? '#ead5a6' : '#b8955c' }
  })
  const beads = Array.from({ length: 18 }, () => {
    const x = 20 + random() * 210
    return { x, y: radius(x) * (0.05 + random() * 0.85), r: 0.9 + random() * 2.2 }
  })
  const corkPath = new Path2D('M281 -13.2 L318 -14.6 Q320.5 -14.6 320.5 -12 L320.5 12 Q320.5 14.6 318 14.6 L281 13.2 Z')
  const corkCanvas = corkTexture()
  let pattern = null
  let patternCtx = null

  function ground(c, pose, wet) {
    const { s } = pose
    const sand = 1 - pose.floating
    const blob = (x, y, rx, ry, rot, colors) => {
      c.save()
      c.translate(x, y)
      c.rotate(rot)
      c.scale(1, ry / rx)
      const g = c.createRadialGradient(0, 0, 0, 0, 0, rx)
      colors.forEach(([o, col]) => g.addColorStop(o, col))
      c.fillStyle = g
      c.fillRect(-rx, -rx, rx * 2, rx * 2)
      c.restore()
    }
    const rot = (pose.a * Math.PI) / 450
    if (wet > 0.01) {
      // the sand darkens and shines where the swash ran round the glass
      blob(pose.x, pose.y + 40 * s, 210 * s, 34 * s, rot, [
        [0, `rgba(122,88,46,${0.26 * wet})`],
        [0.7, `rgba(122,88,46,${0.12 * wet})`],
        [1, 'rgba(122,88,46,0)'],
      ])
    }
    // the sun is behind the bottle: its shadow falls towards us…
    blob(pose.x - 6 * s, pose.y + 52 * s, 178 * s, 24 * s, rot, [
      [0, `rgba(88,58,24,${0.42 * sand})`],
      [0.55, `rgba(88,58,24,${0.2 * sand})`],
      [1, 'rgba(88,58,24,0)'],
    ])
    // …with the light the glass focuses glowing inside it
    blob(pose.x - 34 * s, pose.y + 58 * s, 86 * s, 11 * s, rot, [
      [0, `rgba(250,255,214,${0.85 * sand})`],
      [0.35, `rgba(206,246,192,${0.5 * sand})`],
      [1, 'rgba(206,246,192,0)'],
    ])
    blob(pose.x + 40 * s, pose.y + 56 * s, 34 * s, 4 * s, rot, [
      [0, `rgba(255,255,236,${0.7 * sand})`],
      [1, 'rgba(255,255,236,0)'],
    ])
  }

  function ripples(c, pose, t) {
    const { s, floating } = pose
    const yw = pose.y + 12 * s
    c.lineWidth = 1.6 * s
    for (let i = 0; i < 3; i += 1) {
      const ph = (t * 0.45 + i / 3) % 1
      c.strokeStyle = `rgba(255,255,255,${(0.5 * (1 - ph) * floating).toFixed(3)})`
      c.beginPath()
      c.ellipse(pose.x - 6 * s, yw, (168 + ph * 90) * s, (9 + ph * 9) * s, 0, 0, Math.PI * 2)
      c.stroke()
    }
  }

  function refract(c, K, KM, C, pose, src) {
    const srcK = src.height / 1000
    const half = 250 * pose.s
    const x0 = Math.max(0, pose.x - half)
    const y0 = Math.max(0, pose.y - half)
    const x1 = Math.min(src.width / srcK, pose.x + half)
    const y1 = Math.min(1000, pose.y + half)
    if (x1 <= x0 || y1 <= y0) return
    const inverse = C.inverse()
    for (let i = 0; i < rings.length; i += 1) {
      c.save()
      c.setTransform(KM)
      c.clip(rings[i].path, 'evenodd')
      c.setTransform(K.multiply(C).scale(1.03, rings[i].f).multiply(inverse))
      c.drawImage(src, x0 * srcK, y0 * srcK, (x1 - x0) * srcK, (y1 - y0) * srcK, x0, y0, x1 - x0, y1 - y0)
      c.restore()
    }
  }

  function scroll(c, pose) {
    const { x0, x1, r } = SCROLL
    c.save()
    c.translate(pose.scroll, pose.scrollY)
    c.rotate((pose.scrollA * Math.PI) / 180)
    if (pose.scrollY > 4) {
      c.fillStyle = `rgba(20,60,44,${(0.2 * Math.min(1, pose.scrollY / 20)).toFixed(3)})`
      c.beginPath()
      c.ellipse((x0 + x1) / 2, r + 3, (x1 - x0) / 2, 3, 0, 0, Math.PI * 2)
      c.fill()
    }
    const g = c.createLinearGradient(0, -r, 0, r)
    g.addColorStop(0, '#8d6936')
    g.addColorStop(0.2, '#e3c995')
    g.addColorStop(0.4, '#fbf0d4')
    g.addColorStop(0.72, '#dfc18a')
    g.addColorStop(1, '#7c5a2c')
    c.fillStyle = g
    c.beginPath()
    c.roundRect(x0, -r, x1 - x0, r * 2, 2.5)
    c.fill()
    const age = c.createLinearGradient(x0, 0, x1, 0)
    age.addColorStop(0, 'rgba(140,92,36,0.3)')
    age.addColorStop(0.25, 'rgba(140,92,36,0)')
    age.addColorStop(0.8, 'rgba(140,92,36,0)')
    age.addColorStop(1, 'rgba(140,92,36,0.22)')
    c.fillStyle = age
    c.fill()
    // the edge of the outer turn of paper
    c.strokeStyle = 'rgba(116,80,38,0.55)'
    c.lineWidth = 0.8
    c.beginPath()
    c.moveTo(x0 + 3, r * 0.25)
    c.bezierCurveTo(x0 + 50, r * 0.45, x1 - 60, r * 0.1, x1 - 1, r * 0.5)
    c.stroke()
    // the spiral end, facing the neck
    c.save()
    c.translate(x1, 0)
    c.scale(0.3, 1)
    c.fillStyle = '#f4e4c0'
    c.beginPath()
    c.arc(0, 0, r, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = 'rgba(150,110,60,0.85)'
    c.lineWidth = 1.4
    spiral(c, r)
    c.restore()
    // twine with a little bow
    const tx = (x0 + x1) / 2 - 10
    c.strokeStyle = '#8b3a2a'
    c.lineWidth = 2
    c.beginPath()
    c.moveTo(tx, -r)
    c.lineTo(tx + 2.5, r)
    c.moveTo(tx + 5, -r)
    c.lineTo(tx + 7.5, r)
    c.stroke()
    c.lineWidth = 1.3
    c.beginPath()
    c.moveTo(tx + 3.5, -r + 0.5)
    c.bezierCurveTo(tx - 8, -r - 9, tx - 9, -r + 2, tx + 3.5, -r + 0.5)
    c.bezierCurveTo(tx + 15, -r - 9, tx + 16, -r + 2, tx + 3.5, -r + 0.5)
    c.moveTo(tx + 3.5, -r + 0.5)
    c.quadraticCurveTo(tx - 2, -r + 6, tx - 6, -r + 9)
    c.moveTo(tx + 3.5, -r + 0.5)
    c.quadraticCurveTo(tx + 10, -r + 5, tx + 13, -r + 10)
    c.stroke()
    c.restore()
  }

  function cork(c, pose, hint) {
    if (patternCtx !== c) {
      pattern = c.createPattern(corkCanvas, 'repeat')
      patternCtx = c
    }
    c.save()
    c.translate(299 + pose.pull + pose.corkX, pose.corkY)
    c.rotate((pose.corkR * Math.PI) / 180)
    c.translate(-299, 0)
    c.fillStyle = pattern
    c.fill(corkPath)
    const g = c.createLinearGradient(0, -14.6, 0, 14.6)
    g.addColorStop(0, 'rgba(52,30,10,0.6)')
    g.addColorStop(0.28, 'rgba(255,240,210,0.2)')
    g.addColorStop(0.55, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(40,22,8,0.62)')
    c.fillStyle = g
    c.fill(corkPath)
    c.fillStyle = '#d9b07a'
    c.beginPath()
    c.ellipse(319.5, 0, 3.4, 14, 0, 0, Math.PI * 2)
    c.fill()
    c.strokeStyle = 'rgba(130,92,52,0.55)'
    c.lineWidth = 0.7
    c.beginPath()
    c.ellipse(319.5, 0, 1.8, 8, 0, 0, Math.PI * 2)
    c.stroke()
    if (hint > 0.01) {
      const glow = c.createRadialGradient(318, 0, 0, 318, 0, 42)
      glow.addColorStop(0, `rgba(255,248,222,${(0.55 * hint).toFixed(3)})`)
      glow.addColorStop(1, 'rgba(255,248,222,0)')
      c.fillStyle = glow
      c.fillRect(276, -42, 84, 84)
    }
    c.restore()
  }

  function waterline(c, K, KM, pose, t) {
    const { s, floating } = pose
    const yw = pose.y + 12 * s
    // the part under the surface takes the colour of the sea
    c.save()
    c.setTransform(KM)
    c.clip(body)
    c.setTransform(K)
    const g = c.createLinearGradient(0, yw, 0, yw + 60 * s)
    g.addColorStop(0, `rgba(72,192,206,${(0.5 * floating).toFixed(3)})`)
    g.addColorStop(1, `rgba(12,96,138,${(0.82 * floating).toFixed(3)})`)
    c.fillStyle = g
    c.fillRect(pose.x - 260 * s, yw, 520 * s, 130 * s)
    c.restore()
    // foam lace and bubbles hugging the glass at the waterline
    const x0 = pose.x - 190 * s
    const x1 = pose.x + 170 * s
    const alpha = floating * Math.max(0.35, pose.foam)
    const lace = new Path2D()
    for (let x = x0; x <= x1; x += 5 * s) {
      const y = yw + Math.sin(x / (9 * s) + t * 3) * 1.3 * s
      if (x === x0) lace.moveTo(x, y)
      else lace.lineTo(x, y)
    }
    c.lineCap = 'round'
    // across the glass only a faint meniscus; the foam gathers where water meets the walls
    c.save()
    c.setTransform(KM)
    c.clip(body)
    c.setTransform(K)
    c.strokeStyle = `rgba(230,255,255,${(0.4 * alpha).toFixed(3)})`
    c.lineWidth = 1.2 * s
    c.stroke(lace)
    c.restore()
    c.save()
    c.setTransform(KM)
    c.clip(outside, 'evenodd')
    c.setTransform(K)
    c.strokeStyle = `rgba(255,255,255,${(0.9 * alpha).toFixed(3)})`
    c.lineWidth = 3 * s
    c.stroke(lace)
    c.fillStyle = `rgba(255,255,255,${(0.75 * alpha).toFixed(3)})`
    for (let i = 0; i < 16; i += 1) {
      const h = Math.sin(i * 91.7) * 0.5 + 0.5
      const x = x0 + (x1 - x0) * ((i + 0.5) / 16) + Math.sin(t * 1.4 + i) * 3 * s
      c.beginPath()
      c.arc(x, yw + (2 + h * 4) * s, (0.8 + h * 1.6) * s, 0, Math.PI * 2)
      c.fill()
    }
    c.restore()
  }

  return {
    draw(c, k, pose, { src = null, t = 0, wet = 0, hint = 0 } = {}) {
      const K = new DOMMatrix([k, 0, 0, k, 0, 0])
      const C = new DOMMatrix().translateSelf(pose.x, pose.y).rotateSelf(pose.a).scaleSelf(pose.s)
      const KM = K.multiply(C).translate(-CENTER, 0)
      c.lineJoin = 'round'
      c.lineCap = 'round'

      c.setTransform(K)
      if (pose.floating < 0.99 || wet > 0.01) ground(c, pose, wet)
      if (pose.floating > 0.01) ripples(c, pose, t)

      // the scene behind, bent by the glass
      if (src && src.width) refract(c, K, KM, C, pose, src)

      c.setTransform(KM)
      c.fillStyle = 'rgba(64,184,152,0.2)'
      c.fill(body)
      c.save()
      c.clip(body)
      c.fillStyle = 'rgba(232,255,246,0.16)'
      c.fill(farWall)
      for (let i = 0; i < grains.length; i += 1) {
        const q = grains[i]
        c.fillStyle = q.c
        c.beginPath()
        c.arc(q.x, q.y, q.r, 0, Math.PI * 2)
        c.fill()
      }
      c.restore()

      if (pose.showScroll) scroll(c, pose)
      cork(c, pose, hint)

      // the front of the glass
      c.setTransform(KM)
      c.fillStyle = 'rgba(150,225,200,0.08)'
      c.fill(body)
      c.save()
      c.clip(body)
      // thicker glass seen edge-on at the walls: darker and greener (Fresnel)
      ;[[30, 0.08], [18, 0.12], [9, 0.18], [4, 0.3]].forEach(([w, a]) => {
        c.lineWidth = w
        c.strokeStyle = `rgba(5,62,54,${a})`
        c.stroke(body)
      })
      // the low sun behind lights the rim from within
      c.lineWidth = 2.6
      c.strokeStyle = 'rgba(214,255,236,0.6)'
      c.stroke(body)
      if (wet > 0.01) {
        c.fillStyle = `rgba(170,236,240,${(0.2 * wet).toFixed(3)})`
        c.fill(wetSheen)
      }
      c.restore()

      if (pose.floating > 0.01) {
        waterline(c, K, KM, pose, t)
        c.setTransform(KM)
      }

      // speculars: a long streak along the top, a sharp line at the rim, warm light bounced up from the sand
      const streak = c.createLinearGradient(0, 0, LIP, 0)
      ;[[0, 0], [0.05, 0.92], [0.5, 0.78], [0.6, 0.3], [0.72, 0.12], [0.8, 0.72], [0.95, 0.6], [1, 0]].forEach(([o, a]) =>
        streak.addColorStop(o, `rgba(255,255,255,${a})`),
      )
      c.fillStyle = streak
      c.fill(shine)
      c.fillStyle = 'rgba(255,255,255,0.5)'
      c.fill(rim)
      c.fillStyle = 'rgba(255,236,190,0.24)'
      c.fill(kick)
      // the thick base and the lip
      c.lineWidth = 2.4
      c.strokeStyle = 'rgba(210,252,238,0.55)'
      c.beginPath()
      c.ellipse(5, 0, 4, 37, 0, 0, Math.PI * 2)
      c.stroke()
      c.lineWidth = 1.4
      c.strokeStyle = 'rgba(6,56,48,0.32)'
      c.beginPath()
      c.ellipse(10, 0, 3, 30, 0, 0, Math.PI * 2)
      c.stroke()
      c.fillStyle = 'rgba(205,248,235,0.3)'
      c.fillRect(287, -18.1, 10, 36.2)
      c.strokeStyle = 'rgba(6,56,48,0.42)'
      c.lineWidth = 1
      c.beginPath()
      c.moveTo(285.6, -16.6)
      c.lineTo(285.6, 16.6)
      c.stroke()
      c.strokeStyle = 'rgba(255,255,255,0.9)'
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(288.5, -15.8)
      c.lineTo(296, -15.8)
      c.stroke()
      if (wet > 0.01) {
        for (let i = 0; i < beads.length; i += 1) {
          const q = beads[i]
          c.fillStyle = `rgba(6,60,50,${(0.22 * wet).toFixed(3)})`
          c.beginPath()
          c.arc(q.x, q.y + q.r * 0.3, q.r, 0, Math.PI * 2)
          c.fill()
          c.fillStyle = `rgba(255,255,255,${(0.8 * wet).toFixed(3)})`
          c.beginPath()
          c.arc(q.x - q.r * 0.3, q.y - q.r * 0.2, q.r * 0.45, 0, Math.PI * 2)
          c.fill()
        }
      }
      // crisp silhouette
      c.lineWidth = 1
      c.strokeStyle = 'rgba(4,46,40,0.5)'
      c.stroke(body)
      // a twinkle where the streak turns over the shoulder
      const tw = 0.55 + 0.45 * Math.sin(t * 3.1)
      c.save()
      c.translate(192, -radius(192) * 0.68)
      c.rotate(t * 0.35)
      c.scale(tw, tw)
      c.fillStyle = '#ffffff'
      c.beginPath()
      c.moveTo(0, -10)
      c.lineTo(1.3, -1.3)
      c.lineTo(10, 0)
      c.lineTo(1.3, 1.3)
      c.lineTo(0, 10)
      c.lineTo(-1.3, 1.3)
      c.lineTo(-10, 0)
      c.lineTo(-1.3, -1.3)
      c.closePath()
      c.fill()
      c.restore()
    },
  }
}

// A canvas over the shore, sized and moved with its painted layer; `paint(ctx, k, t)` runs every frame.
export function mountBottleLayer(host, art, paint) {
  const canvas = document.createElement('canvas')
  canvas.className = 'bd-layer'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.pointerEvents = 'none'
  host.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const off = art.onRender(({ t, near }) => {
    const src = art.canvas
    if (canvas.width !== src.width || canvas.height !== src.height) {
      canvas.width = src.width
      canvas.height = src.height
    }
    canvas.style.transform = near
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    paint(ctx, canvas.height / 1000, t)
  })
  return {
    canvas,
    dispose() {
      off()
      canvas.remove()
    },
  }
}

/* -------------------------------------------------------- parchment */

function paperTexture(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const c = canvas.getContext('2d')
  c.fillStyle = '#f2e2bd'
  c.fillRect(0, 0, width, height)
  const random = seeded(29)
  for (let i = 0; i < 46; i += 1) {
    const x = random() * width
    const y = random() * height
    const r = 30 + random() * width * 0.3
    const g = c.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(176,128,62,${0.04 + random() * 0.07})`)
    g.addColorStop(1, 'rgba(176,128,62,0)')
    c.fillStyle = g
    c.fillRect(x - r, y - r, r * 2, r * 2)
  }
  c.lineWidth = 1
  for (let i = 0; i < 900; i += 1) {
    const x = random() * width
    const y = random() * height
    const a = random() * Math.PI
    const len = 3 + random() * 12
    c.strokeStyle = random() < 0.5 ? 'rgba(120,84,40,0.08)' : 'rgba(255,250,235,0.25)'
    c.beginPath()
    c.moveTo(x, y)
    c.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len)
    c.stroke()
  }
  for (let i = 0; i < 18; i += 1) {
    c.fillStyle = `rgba(140,92,40,${0.08 + random() * 0.12})`
    c.beginPath()
    c.arc(random() * width, random() * height, 1 + random() * 3.5, 0, Math.PI * 2)
    c.fill()
  }
  // darker, sea-worn edges
  const edge = (x0, y0, x1, y1) => {
    const g = c.createLinearGradient(x0, y0, x1, y1)
    g.addColorStop(0, 'rgba(140,96,44,0.45)')
    g.addColorStop(1, 'rgba(140,96,44,0)')
    c.fillStyle = g
    c.fillRect(0, 0, width, height)
  }
  edge(0, 0, width * 0.09, 0)
  edge(width, 0, width * 0.91, 0)
  edge(0, 0, 0, height * 0.06)
  edge(0, height, 0, height * 0.94)
  // deckled side edges
  c.globalCompositeOperation = 'destination-out'
  for (let y = 0; y < height; y += 3) {
    c.beginPath()
    c.arc(random() * 6, y, 2 + random() * 5, 0, Math.PI * 2)
    c.arc(width - random() * 6, y, 2 + random() * 5, 0, Math.PI * 2)
    c.fill()
  }
  c.globalCompositeOperation = 'source-over'
  return canvas.toDataURL('image/png')
}

function compassRose(parent, x, y, r) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent)
  el('circle', { r, fill: 'none', stroke: '#8a6a3e', 'stroke-width': 0.8, opacity: 0.7 }, g)
  el('circle', { r: r * 0.82, fill: 'none', stroke: '#8a6a3e', 'stroke-width': 0.5, 'stroke-dasharray': '1 2', opacity: 0.7 }, g)
  let dark = ''
  let lightPath = ''
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2
    const len = i % 2 ? r * 0.62 : r * 1.1
    const tip = [Math.cos(a) * len, Math.sin(a) * len]
    const left = [Math.cos(a - Math.PI / 2) * r * 0.13, Math.sin(a - Math.PI / 2) * r * 0.13]
    const right = [Math.cos(a + Math.PI / 2) * r * 0.13, Math.sin(a + Math.PI / 2) * r * 0.13]
    dark += `M0 0 L${left[0].toFixed(2)} ${left[1].toFixed(2)} L${tip[0].toFixed(2)} ${tip[1].toFixed(2)} Z `
    lightPath += `M0 0 L${right[0].toFixed(2)} ${right[1].toFixed(2)} L${tip[0].toFixed(2)} ${tip[1].toFixed(2)} Z `
  }
  el('path', { d: lightPath, fill: '#e1b16a' }, g)
  el('path', { d: dark, fill: '#2c3e50' }, g)
  el('circle', { r: r * 0.08, fill: '#b8862f' }, g)
  return g
}

function measure(text, font) {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = font
  return ctx.measureText(text).width
}

// a unit spiral, for the paper ends of the rolls (drawn scaled to the roll)
const SPIRAL = (() => {
  let d = ''
  for (let i = 0; i <= 60; i += 1) {
    const a = (i / 60) * 6 * Math.PI
    const rr = 0.9 - (i / 60) * 0.8
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(3)} ${(Math.sin(a) * rr).toFixed(3)} `
  }
  return d
})()

// The letter: paper rolled into one roll. `setUnroll(u, r)` opens it 0..1 from
// the top down; r is the roll's radius before it starts to open.
export function buildParchment(parent, uid, { width: Wp, height: Hp, names, kicker, place, lang }) {
  const upper = (value) => value.toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-GB')
  const id = (name) => `${uid}-${name}`
  const url = (name) => `url(#${id(name)})`
  const defs = el('defs', null, parent)
  stops(el('linearGradient', { id: id('cyl'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#7e5a2c'],
    [0.2, '#d9bd88'],
    [0.42, '#fcefd2'],
    [0.75, '#c9a46c'],
    [1, '#5e421f'],
  ])
  stops(el('linearGradient', { id: id('curl'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#6e4a1e', 0],
    [1, '#6e4a1e', 0.34],
  ])
  stops(el('linearGradient', { id: id('lip'), x1: 0, y1: 0, x2: 0, y2: 1 }, defs), [
    [0, '#6e4a1e', 0.28],
    [1, '#6e4a1e', 0],
  ])
  const blur = el('filter', { id: id('shadow'), x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs)
  el('feGaussianBlur', { stdDeviation: 12 }, blur)
  const clip = el('clipPath', { id: id('reveal') }, defs)
  const clipRect = el('rect', { x: -Wp / 2 - 2, y: -Hp / 2, width: Wp + 4, height: 0 }, clip)

  const root = el('g', null, parent)
  const shadow = el('rect', { x: -Wp / 2 + 10, y: -Hp / 2 + 24, width: Wp - 20, height: 0, fill: '#3a2a14', opacity: 0.35, filter: url('shadow') }, root)
  const sheet = el('g', { 'clip-path': url('reveal') }, root)
  el('image', { href: paperTexture(Math.round(Math.min(900, Wp * 2)), Math.round(Math.min(1100, Hp * 2))), x: -Wp / 2, y: -Hp / 2, width: Wp, height: Hp, preserveAspectRatio: 'none' }, sheet)

  const ink = '#2c3e50'
  compassRose(sheet, 0, -Hp / 2 + Hp * 0.14, Wp * 0.055)
  el('text', { x: 0, y: -Hp / 2 + Hp * 0.27, 'text-anchor': 'middle', fill: '#7a5a3a', 'font-family': '"Josefin Sans", sans-serif', 'font-size': Wp * 0.038, 'letter-spacing': Wp * 0.012 }, sheet).textContent = upper(kicker)

  const scriptFont = '"Allura", "Great Vibes", cursive'
  const widest = Math.max(measure(names[0], `100px ${scriptFont}`), measure(names[1], `100px ${scriptFont}`), 1)
  const fs = Math.min(Wp * 0.22, (Wp * 0.84 * 100) / widest)
  const mid = Hp * 0.02
  const text = (value, y, size, color) => {
    const node = el('text', { x: 0, y, 'text-anchor': 'middle', fill: color, 'font-family': scriptFont, 'font-size': size }, sheet)
    node.textContent = value
    return node
  }
  text(names[0], mid - fs * 0.42, fs, ink)
  text('&', mid + fs * 0.2, fs * 0.6, '#b8862f')
  text(names[1], mid + fs * 0.92, fs, ink)

  // a twisted-rope rule and the place
  const ruleY = Hp * 0.31
  el('path', { d: `M${-Wp * 0.3} ${ruleY} H${Wp * 0.3}`, stroke: '#8a6a3e', 'stroke-width': 3, 'stroke-dasharray': '2.2 1.6', fill: 'none' }, sheet)
  el('path', { d: `M${-Wp * 0.3} ${ruleY} H${Wp * 0.3}`, stroke: '#c9a46a', 'stroke-width': 1, fill: 'none' }, sheet)
  el('circle', { cx: 0, cy: ruleY, r: 4.5, fill: '#f2e2bd', stroke: '#8a6a3e', 'stroke-width': 1.2 }, sheet)
  el('text', { x: 0, y: Hp * 0.4, 'text-anchor': 'middle', fill: ink, 'font-family': '"Josefin Sans", sans-serif', 'font-size': Wp * 0.042, 'letter-spacing': Wp * 0.01 }, sheet).textContent = upper(place)

  // the paper curls away into the roll, and is shaded under the top edge
  const lip = el('rect', { x: -Wp / 2, y: -Hp / 2, width: Wp, height: 16, fill: url('lip') }, sheet)
  const curl = el('rect', { x: -Wp / 2, y: -Hp / 2, width: Wp, height: 0, fill: url('curl') }, sheet)

  // the rolls: paper cylinders with spiral ends
  const rollW = Wp + 10
  const roll = () => {
    const g = el('g', null, root)
    const body = el('rect', { x: -rollW / 2, y: -1, width: rollW, height: 2, fill: url('cyl') }, g)
    const seam = el('path', { fill: 'none', stroke: '#8a6a3e', 'stroke-width': 0.9, opacity: 0.55 }, g)
    const cap = (x) => {
      const c = el('g', null, g)
      el('ellipse', { rx: 1, ry: 1, fill: '#f1dfb6', stroke: '#9a7444', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, c)
      el('path', { d: SPIRAL, fill: 'none', stroke: '#a8844f', 'stroke-width': 0.9, 'vector-effect': 'non-scaling-stroke' }, c)
      return { node: c, x }
    }
    return { g, body, seam, caps: [cap(-rollW / 2), cap(rollW / 2)] }
  }
  const top = roll()
  const bottom = roll()
  const twineWrap = el('g', null, bottom.g)
  const twine = el('g', null, twineWrap)
  el('path', { d: 'M-6 -16 L-3 16 M3 -16 L6 16', stroke: '#8b3a2a', 'stroke-width': 3 }, twine)
  el('path', { d: 'M0 -15 C-14 -30 -18 -14 0 -15 C14 -30 18 -14 0 -15 M0 -15 Q-6 -6 -11 -2 M0 -15 Q7 -7 12 -1', stroke: '#8b3a2a', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, twine)

  const setRoll = (part, r) => {
    part.body.setAttribute('y', -r)
    part.body.setAttribute('height', r * 2)
    part.body.setAttribute('rx', r * 0.3)
    part.seam.setAttribute('d', `M${-rollW / 2 + r * 0.3} ${r * 0.3} C${-rollW / 6} ${r * 0.5} ${rollW / 6} ${r * 0.1} ${rollW / 2 - r * 0.3} ${r * 0.45}`)
    part.caps.forEach((cap) => cap.node.setAttribute('transform', `translate(${cap.x} 0) scale(${(r * 0.3).toFixed(2)} ${r.toFixed(2)})`))
  }
  setRoll(top, 8)

  const setUnroll = (u, r = 18) => {
    const revealed = Hp * u
    clipRect.setAttribute('height', revealed)
    shadow.setAttribute('height', Math.max(0, revealed - 20))
    curl.setAttribute('y', -Hp / 2 + revealed - 40)
    curl.setAttribute('height', Math.min(40, revealed))
    lip.style.opacity = Math.min(1, u * 8)
    top.g.setAttribute('transform', `translate(0 ${-Hp / 2})`)
    top.g.style.opacity = Math.min(1, u * 30)
    // the roll thins as the paper leaves it, and comes slightly toward the viewer
    const rr = r * (1 - u * 0.38)
    setRoll(bottom, rr)
    twineWrap.setAttribute('transform', `scale(1 ${(rr / 16).toFixed(3)})`)
    bottom.g.setAttribute('transform', `translate(0 ${-Hp / 2 + revealed}) scale(${1 + u * 0.03})`)
  }
  setUnroll(0)

  return { root, twine, setUnroll, rollLength: rollW }
}
