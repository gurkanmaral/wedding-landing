// The silver screen: a 2D canvas that projects either the academy leader
// (5-4-3-2-1 with the rotating sweep) or the couple's title card, through
// 35 mm artefacts — grain, lamp flicker, gate weave, running scratches,
// dust and hairs, and the hot-spot vignette of a carbon-arc lamp.

const CREAM = '#efe6d2'

function canvas2d(width, height) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(width))
  c.height = Math.max(1, Math.round(height))
  return [c, c.getContext('2d')]
}

// One line if it fits, else stacked; shrinks to fit the safe area.
function fitFont(ctx, text, family, size, maxWidth, min = 10) {
  let s = size
  ctx.font = `${s}px ${family}`
  while (ctx.measureText(text).width > maxWidth && s > min) {
    s -= Math.max(1, s * 0.04)
    ctx.font = `${s}px ${family}`
  }
  return s
}

const CARD_COPY = {
  en: { starring: 'starring', tagline: '— together at last —' },
  tr: { starring: 'başrollerde', tagline: '— sonunda birlikte —' },
}

export function createFilm(canvas, { names, lang = 'en' }) {
  const ctx = canvas.getContext('2d')
  let W = 1
  let H = 1
  let dpr = 1
  let card = null
  let idle = null
  let vignette = null
  const grains = []
  let copy = { names, lang }

  // static film grain: a few tiles, a new one (and a new offset) every frame
  for (let i = 0; i < 4; i += 1) {
    const [g, gctx] = canvas2d(160, 160)
    const img = gctx.createImageData(160, 160)
    for (let p = 0; p < img.data.length; p += 4) {
      const v = Math.random() * 255
      img.data[p] = v
      img.data[p + 1] = v
      img.data[p + 2] = v
      img.data[p + 3] = 255
    }
    gctx.putImageData(img, 0, 0)
    grains.push(ctx.createPattern(g, 'repeat'))
  }

  // two long scratches that wander across the frame between shots
  const scratches = [
    { x: 0.31, drift: 0.0004, life: 0 },
    { x: 0.72, drift: -0.0003, life: 0 },
  ]

  const paintCard = () => {
    const [c, g] = canvas2d(W, H)
    const bg = g.createRadialGradient(W * 0.5, H * 0.46, H * 0.05, W * 0.5, H * 0.5, H * 0.95)
    bg.addColorStop(0, '#34302a')
    bg.addColorStop(0.55, '#1b1916')
    bg.addColorStop(1, '#090807')
    g.fillStyle = bg
    g.fillRect(0, 0, W, H)

    // double deco frame with stepped corners
    const s = H / 600
    g.strokeStyle = 'rgba(239,230,210,0.78)'
    g.lineWidth = 2.2 * s
    const m1 = H * 0.065
    const m2 = H * 0.085
    g.strokeRect(m1, m1, W - m1 * 2, H - m1 * 2)
    g.lineWidth = 1 * s
    g.strokeRect(m2, m2, W - m2 * 2, H - m2 * 2)
    const step = H * 0.035
    ;[
      [m2, m2, 1, 1],
      [W - m2, m2, -1, 1],
      [m2, H - m2, 1, -1],
      [W - m2, H - m2, -1, -1],
    ].forEach(([x, y, dx, dy]) => {
      g.beginPath()
      g.moveTo(x + dx * step * 2.4, y)
      g.lineTo(x + dx * step * 2.4, y + dy * step)
      g.lineTo(x + dx * step, y + dy * step)
      g.lineTo(x + dx * step, y + dy * step * 2.4)
      g.lineTo(x, y + dy * step * 2.4)
      g.stroke()
      g.beginPath()
      g.arc(x + dx * step * 0.5, y + dy * step * 0.5, 2.4 * s, 0, Math.PI * 2)
      g.fillStyle = 'rgba(239,230,210,0.85)'
      g.fill()
    })

    const words = CARD_COPY[copy.lang] ?? CARD_COPY.en
    const [a, b] = copy.names
    g.textAlign = 'center'
    g.textBaseline = 'alphabetic'
    g.fillStyle = CREAM
    g.shadowColor = 'rgba(255,246,222,0.35)'
    g.shadowBlur = 14 * s

    const safe = W * 0.76
    const serif = '"Cormorant Garamond", Georgia, serif'
    const display = 'Limelight, "Cormorant Garamond", Georgia, serif'
    g.font = `italic 500 ${H * 0.068}px ${serif}`
    g.globalAlpha = 0.86
    const one = `${a} & ${b}`
    const big = fitFont(g, one, display, H * 0.2, safe)
    const stacked = big < H * 0.15
    const starY = stacked ? H * 0.235 : H * 0.33
    g.font = `italic 500 ${H * 0.068}px ${serif}`
    g.fillText(words.starring, W / 2, starY)
    g.globalAlpha = 1

    let lowest
    if (!stacked) {
      g.font = `${big}px ${display}`
      g.fillText(one, W / 2, H * 0.55)
      lowest = H * 0.55
    } else {
      const sa = fitFont(g, a, display, H * 0.16, safe)
      const sb = fitFont(g, b, display, H * 0.16, safe)
      const size = Math.min(sa, sb)
      g.font = `${size}px ${display}`
      g.fillText(a, W / 2, H * 0.415)
      g.font = `italic 500 ${size * 0.55}px ${serif}`
      g.fillText('&', W / 2, H * 0.415 + size * 0.62)
      g.font = `${size}px ${display}`
      g.fillText(b, W / 2, H * 0.415 + size * 1.32)
      lowest = H * 0.415 + size * 1.32
    }

    // star rule
    g.shadowBlur = 0
    const ruleY = lowest + H * 0.085
    g.strokeStyle = 'rgba(239,230,210,0.6)'
    g.lineWidth = 1.2 * s
    g.beginPath()
    g.moveTo(W * 0.32, ruleY)
    g.lineTo(W * 0.47, ruleY)
    g.moveTo(W * 0.53, ruleY)
    g.lineTo(W * 0.68, ruleY)
    g.stroke()
    g.save()
    g.translate(W / 2, ruleY)
    g.rotate(Math.PI / 4)
    g.fillStyle = CREAM
    g.fillRect(-4 * s, -4 * s, 8 * s, 8 * s)
    g.restore()

    g.font = `italic 500 ${H * 0.072}px ${serif}`
    g.fillStyle = CREAM
    g.globalAlpha = 0.92
    g.fillText(words.tagline, W / 2, Math.min(ruleY + H * 0.11, H - m2 - H * 0.04))
    g.globalAlpha = 1
    card = c
  }

  const paintStatic = () => {
    // the unlit screen: a dull silver surface in a dark room
    const [i, ig] = canvas2d(W, H)
    const base = ig.createLinearGradient(0, 0, 0, H)
    base.addColorStop(0, '#141414')
    base.addColorStop(0.7, '#1d1c1b')
    base.addColorStop(1, '#262321')
    ig.fillStyle = base
    ig.fillRect(0, 0, W, H)
    ig.fillStyle = 'rgba(255,255,255,0.025)'
    const pitch = Math.max(3, Math.round(4 * dpr))
    for (let y = 0; y < H; y += pitch) for (let x = (y / pitch) % 2 ? pitch / 2 : 0; x < W; x += pitch) ig.fillRect(x, y, 1, 1)
    idle = i

    const [v, vg] = canvas2d(W, H)
    const grad = vg.createRadialGradient(W / 2, H * 0.48, H * 0.15, W / 2, H / 2, Math.hypot(W, H) * 0.56)
    grad.addColorStop(0, 'rgba(255,248,230,0.06)')
    grad.addColorStop(0.55, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.62)')
    vg.fillStyle = grad
    vg.fillRect(0, 0, W, H)
    vignette = v
  }

  const drawLeader = (count, ox, oy) => {
    const n = Math.max(1, Math.ceil(count - 1e-6))
    const p = n - count
    ctx.save()
    ctx.translate(ox, oy)
    ctx.fillStyle = '#aaa498'
    ctx.fillRect(-4, -4, W + 8, H + 8)
    const cx = W / 2
    const cy = H / 2
    const R = Math.hypot(W, H)
    // the sweep
    ctx.fillStyle = '#6d685f'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2)
    ctx.closePath()
    ctx.fill()
    // crosshair
    ctx.strokeStyle = '#26231f'
    ctx.lineWidth = Math.max(1, H * 0.006)
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(W, cy)
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, H)
    ctx.stroke()
    // rings
    ctx.strokeStyle = '#f6f1e6'
    ctx.lineWidth = H * 0.013
    ctx.beginPath()
    ctx.arc(cx, cy, H * 0.36, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, H * 0.43, 0, Math.PI * 2)
    ctx.stroke()
    // the number
    ctx.fillStyle = '#141311'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${H * 0.5}px "Josefin Sans", "Arial Black", sans-serif`
    ctx.fillText(String(n), cx, cy + H * 0.035)
    ctx.restore()
  }

  let frame = 0
  /**
   * state: { light 0..1, leader 0..1, count 5..0, card 0..1, flash 0..1 }
   * Call at 24 fps.
   */
  const render = (state, time) => {
    frame += 1
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(idle, 0, 0)
    const light = state.light
    if (light > 0.002) {
      // lamp flicker and gate weave
      const flicker = 0.9 + Math.random() * 0.1 - (Math.random() < 0.05 ? 0.12 : 0)
      const weave = H * 0.0035
      const ox = Math.sin(time * 1.9) * weave * 0.5 + (Math.random() - 0.5) * weave * 0.6
      const oy = Math.sin(time * 1.3 + 1) * weave + (Math.random() - 0.5) * weave
      ctx.globalAlpha = Math.min(1, light * flicker)
      if (state.card < 1) drawLeader(state.count, ox, oy)
      if (state.card > 0) {
        ctx.globalAlpha = Math.min(1, light * flicker * state.card)
        ctx.drawImage(card, ox, oy)
      }
      ctx.globalAlpha = light

      // grain
      ctx.globalCompositeOperation = 'overlay'
      ctx.globalAlpha = light * (state.card > 0.5 ? 0.24 : 0.32)
      ctx.fillStyle = grains[frame % grains.length]
      const gx = Math.random() * 160
      const gy = Math.random() * 160
      ctx.translate(-gx, -gy)
      ctx.fillRect(0, 0, W + 160, H + 160)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      // running scratches
      for (let i = 0; i < scratches.length; i += 1) {
        const sc = scratches[i]
        sc.x += sc.drift + (Math.random() - 0.5) * 0.002
        if (sc.x < 0.05 || sc.x > 0.95) sc.drift *= -1
        if (sc.life <= 0 && Math.random() < 0.06) sc.life = 6 + Math.random() * 30
        if (sc.life > 0) {
          sc.life -= 1
          ctx.globalAlpha = light * (0.25 + Math.random() * 0.3)
          ctx.fillStyle = i ? 'rgba(20,18,16,1)' : 'rgba(255,250,236,1)'
          ctx.fillRect(sc.x * W, 0, Math.max(1, dpr * (0.6 + Math.random() * 0.8)), H)
        }
      }
      // dust and the odd hair
      if (Math.random() < 0.45) {
        const specks = 1 + Math.floor(Math.random() * 3)
        for (let i = 0; i < specks; i += 1) {
          const dark = Math.random() < 0.7
          ctx.globalAlpha = light * (0.5 + Math.random() * 0.4)
          ctx.fillStyle = dark ? '#0b0a09' : '#fffaf0'
          ctx.beginPath()
          ctx.ellipse(Math.random() * W, Math.random() * H, (0.8 + Math.random() * 2.6) * dpr, (0.6 + Math.random() * 2) * dpr, Math.random() * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (Math.random() < 0.04) {
        const x = Math.random() * W
        const y = Math.random() * H
        ctx.globalAlpha = light * 0.6
        ctx.strokeStyle = '#0d0c0b'
        ctx.lineWidth = dpr
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.bezierCurveTo(x + 14 * dpr, y - 10 * dpr, x + 6 * dpr, y + 18 * dpr, x + 22 * dpr, y + 12 * dpr)
        ctx.stroke()
      }
      if (state.flash > 0) {
        ctx.globalAlpha = state.flash
        ctx.fillStyle = '#fff8e8'
        ctx.fillRect(0, 0, W, H)
      }
    }
    ctx.globalAlpha = 1
    ctx.drawImage(vignette, 0, 0)
  }

  return {
    resize(cssW, cssH) {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      W = Math.max(2, Math.round(cssW * dpr))
      H = Math.max(2, Math.round(cssH * dpr))
      canvas.width = W
      canvas.height = H
      paintCard()
      paintStatic()
    },
    repaintCard: () => paintCard(),
    setCopy(names, language) {
      copy = { names, lang: language }
      paintCard()
    },
    render,
  }
}
