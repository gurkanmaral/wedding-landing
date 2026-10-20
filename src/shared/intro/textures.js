// Canvas-drawn textures for the envelope intro. Everything is generated at
// runtime so each template only needs a handful of colours in the registry.
import * as THREE from 'three'

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return [canvas, canvas.getContext('2d')]
}

function toTexture(canvas, renderer) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

// Deterministic noise so the paper grain doesn't shimmer between mounts.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function grain(ctx, width, height, amount = 0.05, seed = 7) {
  const random = rng(seed)
  const image = ctx.getImageData(0, 0, width, height)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 255 * amount
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n
  }
  ctx.putImageData(image, 0, 0)
  // a few long paper fibres
  ctx.save()
  ctx.globalAlpha = 0.05
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  for (let i = 0; i < 70; i += 1) {
    const x = random() * width
    const y = random() * height
    const a = random() * Math.PI
    const l = 10 + random() * 40
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 4, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }
  ctx.restore()
}

function polygon(ctx, points) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
}

function shade(color, amount) {
  return new THREE.Color(color).offsetHSL(0, 0, amount).getStyle()
}

function setFont(ctx, { size, family, weight = 400, style = 'normal' }) {
  ctx.font = `${style} ${weight} ${size}px "${family}", Georgia, serif`
}

function fitText(ctx, text, maxWidth, font) {
  let size = font.size
  setFont(ctx, { ...font, size })
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 2
    setFont(ctx, { ...font, size })
  }
  return size
}

/* ------------------------------------------------------------------ paper */

// Front pocket: side flaps, bottom flap and an addressed line in script.
export function pocketTexture(renderer, { paper, ink, text }, { width, height, notch, address }) {
  const W = 1024
  const H = Math.round((W * height) / width)
  const [canvas, ctx] = makeCanvas(W, H)
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 0.045, 11)

  const meet = [W / 2, H * (notch + 0.08)]
  // side flaps (slightly darker, folded under the bottom flap)
  ctx.fillStyle = shade(paper, -0.035)
  polygon(ctx, [[0, 0], meet, [0, H]])
  ctx.fill()
  polygon(ctx, [[W, 0], meet, [W, H]])
  ctx.fill()

  // bottom flap with a soft shadow along its top edges
  const bottomTip = [W / 2, H * (notch - 0.02)]
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = -2
  ctx.fillStyle = shade(paper, 0.015)
  polygon(ctx, [[0, H], bottomTip, [W, H]])
  ctx.fill()
  ctx.restore()
  grain(ctx, W, H, 0.02, 12)

  // crease highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, H)
  ctx.lineTo(...bottomTip)
  ctx.lineTo(W, H)
  ctx.stroke()

  if (address) {
    // dark envelopes get the light intro text colour instead of the card ink
    const { l } = new THREE.Color(paper).getHSL({})
    ctx.fillStyle = l < 0.35 ? text : ink
    ctx.globalAlpha = 0.82
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    setFont(ctx, { size: 74, family: 'Italianno' })
    ctx.fillText(address, W / 2, H * 0.8)
    ctx.globalAlpha = 1
  }
  return toTexture(canvas, renderer)
}

export function flapTexture(renderer, { paper }) {
  const [canvas, ctx] = makeCanvas(1024, 512)
  const gradient = ctx.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, shade(paper, 0.02))
  gradient.addColorStop(1, shade(paper, -0.02))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1024, 512)
  grain(ctx, 1024, 512, 0.045, 21)
  return toTexture(canvas, renderer)
}

// The patterned tissue liner on the inside of the flap and back.
export function linerTexture(renderer, { liner, paper, linerPattern }) {
  const S = 1024
  const [canvas, ctx] = makeCanvas(S, S)
  ctx.fillStyle = liner
  ctx.fillRect(0, 0, S, S)
  const light = shade(liner, 0.12)
  const pale = paper

  ctx.save()
  switch (linerPattern) {
    case 'stars': {
      const random = rng(5)
      ctx.fillStyle = shade(liner, -0.3)
      ctx.fillRect(0, 0, S, S)
      ctx.fillStyle = liner
      for (let i = 0; i < 160; i += 1) {
        const x = random() * S
        const y = random() * S
        const r = 1 + random() * 3.5
        ctx.globalAlpha = 0.35 + random() * 0.65
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case 'deco': {
      ctx.strokeStyle = shade(liner, -0.18)
      ctx.lineWidth = 3
      const step = 128
      for (let y = 0; y <= S + step; y += step / 2) {
        for (let x = (y / (step / 2)) % 2 ? step / 2 : 0; x <= S + step; x += step) {
          for (let r = step / 2; r > 8; r -= 14) {
            ctx.beginPath()
            ctx.arc(x, y, r, Math.PI, Math.PI * 2)
            ctx.stroke()
          }
        }
      }
      break
    }
    case 'stripes': {
      ctx.fillStyle = pale
      for (let x = -S; x < S * 2; x += 72) {
        polygon(ctx, [
          [x, 0],
          [x + 30, 0],
          [x + 30 + S * 0.35, S],
          [x + S * 0.35, S],
        ])
        ctx.fill()
      }
      break
    }
    case 'blossom': {
      const random = rng(9)
      for (let i = 0; i < 60; i += 1) {
        const x = random() * S
        const y = random() * S
        const r = 14 + random() * 22
        ctx.fillStyle = i % 3 ? light : '#fff6f8'
        ctx.globalAlpha = 0.85
        for (let p = 0; p < 5; p += 1) {
          const a = (p / 5) * Math.PI * 2 + random()
          ctx.beginPath()
          ctx.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.32, a, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = '#c9a35c'
        ctx.beginPath()
        ctx.arc(x, y, r * 0.14, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case 'plaid': {
      ctx.globalAlpha = 0.35
      ctx.fillStyle = shade(liner, -0.15)
      for (let i = 0; i < S; i += 96) {
        ctx.fillRect(i, 0, 34, S)
        ctx.fillRect(0, i, S, 34)
      }
      ctx.globalAlpha = 0.5
      ctx.fillStyle = '#f6c27a'
      for (let i = 48; i < S; i += 96) {
        ctx.fillRect(i, 0, 4, S)
        ctx.fillRect(0, i, S, 4)
      }
      break
    }
    case 'waves': {
      ctx.strokeStyle = pale
      ctx.lineWidth = 6
      ctx.globalAlpha = 0.8
      for (let y = 20; y < S + 40; y += 52) {
        ctx.beginPath()
        for (let x = 0; x <= S; x += 8) {
          const yy = y + Math.sin((x / S) * Math.PI * 8 + y) * 10
          if (x === 0) ctx.moveTo(x, yy)
          else ctx.lineTo(x, yy)
        }
        ctx.stroke()
      }
      break
    }
    default:
      break
  }
  ctx.restore()
  grain(ctx, S, S, 0.03, 31)
  const texture = toTexture(canvas, renderer)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

/* ------------------------------------------------------------------- card */

export function cardTexture(renderer, intro, { width, height, couple, dateLabel, place, lang }) {
  const W = 1400
  const H = Math.round((W * height) / width)
  const [canvas, ctx] = makeCanvas(W, H)
  const { card, ink, accent, font, fontWeight = 400, fontStyle = 'normal' } = intro

  ctx.fillStyle = card
  ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 0.025, 41)

  // double rule frame
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.strokeRect(46, 46, W - 92, H - 92)
  ctx.lineWidth = 1.5
  ctx.strokeRect(62, 62, W - 124, H - 124)

  ctx.fillStyle = ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const eyebrow = lang === 'tr' ? 'Ailelerimizle birlikte sizi davet ediyoruz' : 'Together with their families'
  setFont(ctx, { size: 34, family: font, weight: fontWeight })
  ctx.globalAlpha = 0.75
  ctx.fillText(eyebrow, W / 2, H * 0.2)
  ctx.globalAlpha = 1

  const names = `${couple[0]} & ${couple[1]}`
  const nameFont = { size: 150, family: font, weight: fontWeight, style: fontStyle }
  fitText(ctx, names, W * 0.8, nameFont)
  ctx.fillText(names, W / 2, H * 0.5)

  // little ornament
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(W / 2 - 150, H * 0.6)
  ctx.lineTo(W / 2 - 18, H * 0.6)
  ctx.moveTo(W / 2 + 18, H * 0.6)
  ctx.lineTo(W / 2 + 150, H * 0.6)
  ctx.stroke()
  ctx.fillStyle = accent
  ctx.save()
  ctx.translate(W / 2, H * 0.6)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-7, -7, 14, 14)
  ctx.restore()

  ctx.fillStyle = ink
  setFont(ctx, { size: 46, family: font, weight: fontWeight })
  ctx.fillText(dateLabel, W / 2, H * 0.72)
  ctx.globalAlpha = 0.7
  setFont(ctx, { size: 34, family: font, weight: fontWeight })
  ctx.fillText(place, W / 2, H * 0.8)
  ctx.globalAlpha = 1

  return toTexture(canvas, renderer)
}

/* ------------------------------------------------------------------- seal */

export function sealTextures(renderer, { seal, sealInk, font }, couple) {
  const S = 512
  const [canvas, ctx] = makeCanvas(S, S)
  const [bumpCanvas, bump] = makeCanvas(S, S)

  const gradient = ctx.createRadialGradient(S * 0.38, S * 0.35, S * 0.05, S / 2, S / 2, S * 0.5)
  gradient.addColorStop(0, shade(seal, 0.12))
  gradient.addColorStop(1, shade(seal, -0.1))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, S, S)
  bump.fillStyle = '#000'
  bump.fillRect(0, 0, S, S)

  const drawMarks = (c, color, alpha) => {
    c.save()
    c.globalAlpha = alpha
    c.strokeStyle = color
    c.fillStyle = color
    c.lineWidth = 10
    c.beginPath()
    c.arc(S / 2, S / 2, S * 0.36, 0, Math.PI * 2)
    c.stroke()
    c.lineWidth = 3
    c.beginPath()
    c.arc(S / 2, S / 2, S * 0.31, 0, Math.PI * 2)
    c.stroke()
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    setFont(c, { size: 150, family: font, weight: 500 })
    c.fillText(couple[0][0], S * 0.37, S * 0.5)
    c.fillText(couple[1][0], S * 0.63, S * 0.5)
    setFont(c, { size: 70, family: 'Italianno' })
    c.fillText('&', S / 2, S * 0.53)
    c.restore()
  }
  drawMarks(ctx, sealInk, 0.55)
  drawMarks(bump, '#fff', 1)

  const map = toTexture(canvas, renderer)
  const bumpMap = new THREE.CanvasTexture(bumpCanvas)
  return { map, bumpMap }
}

/* -------------------------------------------------------------- particles */

// White silhouettes; colour comes from per-instance colours.
export function particleTexture(renderer, type) {
  const S = 128
  const [canvas, ctx] = makeCanvas(S, S)
  ctx.fillStyle = '#fff'
  ctx.translate(S / 2, S / 2)

  switch (type) {
    case 'stars': {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, S / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.12, 'rgba(255,255,255,0.9)')
      g.addColorStop(0.35, 'rgba(255,255,255,0.15)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(-S / 2, -S / 2, S, S)
      ctx.fillStyle = '#fff'
      polygon(ctx, [
        [0, -60],
        [5, -5],
        [60, 0],
        [5, 5],
        [0, 60],
        [-5, 5],
        [-60, 0],
        [-5, -5],
      ])
      ctx.fill()
      break
    }
    case 'dust': {
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, S / 2)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(0.3, 'rgba(255,255,255,0.6)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(-S / 2, -S / 2, S, S)
      break
    }
    case 'confetti':
      ctx.fillRect(-26, -48, 52, 96)
      break
    case 'leaves': {
      // five-lobed maple leaf
      ctx.beginPath()
      const lobes = [
        [0, -58],
        [12, -30],
        [34, -42],
        [28, -14],
        [56, -10],
        [34, 10],
        [42, 26],
        [14, 22],
        [4, 46],
        [-4, 46],
        [-14, 22],
        [-42, 26],
        [-34, 10],
        [-56, -10],
        [-28, -14],
        [-34, -42],
        [-12, -30],
      ]
      lobes.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.fill()
      ctx.fillRect(-2, 40, 4, 22)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 44)
      ctx.lineTo(0, -50)
      ctx.moveTo(0, 10)
      ctx.lineTo(40, -6)
      ctx.moveTo(0, 10)
      ctx.lineTo(-40, -6)
      ctx.stroke()
      break
    }
    case 'olive':
      ctx.beginPath()
      ctx.ellipse(0, 0, 16, 56, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -50)
      ctx.lineTo(0, 50)
      ctx.stroke()
      break
    case 'petals':
    default:
      ctx.beginPath()
      ctx.moveTo(0, 54)
      ctx.bezierCurveTo(-52, 20, -40, -46, -8, -52)
      ctx.quadraticCurveTo(0, -40, 8, -52)
      ctx.bezierCurveTo(40, -46, 52, 20, 0, 54)
      ctx.fill()
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = 'rgba(0,0,0,0.12)'
      ctx.beginPath()
      ctx.ellipse(0, 30, 16, 22, 0, 0, Math.PI * 2)
      ctx.fill()
      break
  }
  return toTexture(canvas, renderer)
}

export function shadowTexture(renderer) {
  const S = 256
  const [canvas, ctx] = makeCanvas(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.25)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  return toTexture(canvas, renderer)
}
