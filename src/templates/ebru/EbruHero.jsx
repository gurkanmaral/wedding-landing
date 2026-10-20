import { useEffect, useRef, useState } from 'react'
import {
  NOISE,
  WATER,
  cartoucheLayout,
  createGL,
  createProgram,
  createTray,
  drawCartouche,
  drawFullscreen,
  generatePattern,
  loadSheet,
  loadSnapshot,
  renderOpsToCanvas,
  pixelsToCanvas,
  saveSheet,
  traySize,
} from './marbling.js'

// The guest's marbled sheet, still a little wet: the colours drift very
// slightly, swirl under a finger and relax back; a raking light follows the
// pointer across the paper fibre and the raised paint.
const PAPER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uHalf;
uniform vec2 uTexel;
uniform float uA;
uniform float uTime;
uniform vec3 uSwirl;
uniform vec2 uLight;
in vec2 vUv;
out vec4 outColor;
${NOISE}
float lum(vec3 c) { return dot(c, vec3(0.3, 0.59, 0.11)); }
void main() {
  vec2 p = (vUv * 2.0 - 1.0) * uHalf;
  vec2 q = p + 0.0028 * vec2(sin(p.y * 4.0 + uTime * 0.35), sin(p.x * 3.3 - uTime * 0.28));
  vec2 d = q - uSwirl.xy;
  float th = uSwirl.z * exp(-dot(d, d) / 0.05);
  q = uSwirl.xy + vec2(cos(th) * d.x - sin(th) * d.y, sin(th) * d.x + cos(th) * d.y);
  vec2 uv = vec2(q.x / uA * 0.5 + 0.5, q.y * 0.5 + 0.5);
  vec3 col = texture(uTex, uv).rgb;
  float l0 = lum(col);
  float lx = lum(texture(uTex, uv + vec2(uTexel.x * 1.5, 0.0)).rgb);
  float ly = lum(texture(uTex, uv + vec2(0.0, uTexel.y * 1.5)).rgb);
  vec2 toLight = normalize(uLight - vUv + 1e-4);
  col += dot(vec2(lx - l0, ly - l0), toLight) * 0.6;
  float fibre = fbm(vec2(p.x * 70.0, p.y * 22.0));
  col *= 0.955 + 0.06 * fibre;
  vec2 s = vUv - uLight;
  col += exp(-dot(s, s) * 2.6) * 0.07;
  vec2 v = vUv - 0.5;
  col *= 1.0 - dot(v, v) * 0.22;
  outColor = vec4(col, 1.0);
}`

// true when the composed sheet holds paint, not only bare water
function hasPaint(pixels) {
  const [wr, wg, wb] = WATER.map((v) => v * 255)
  let painted = 0
  const step = Math.max(4, Math.floor(pixels.length / 4 / 4000)) * 4
  for (let i = 0; i < pixels.length; i += step) {
    if (Math.abs(pixels[i] - wr) + Math.abs(pixels[i + 1] - wg) + Math.abs(pixels[i + 2] - wb) > 40) painted += 1
  }
  return painted > 40
}

const measure = () => ({ w: window.innerWidth, h: window.innerHeight })

export default function EbruHero({ partner1, partner2, dateLabel, place, tagline }) {
  const rootRef = useRef(null)
  const glHostRef = useRef(null)
  const cartRef = useRef(null)
  const [size, setSize] = useState(measure)

  useEffect(() => {
    const root = rootRef.current
    // a fresh canvas per mount: a canvas whose context was released (React
    // StrictMode mounts effects twice) would hand back a lost context
    const glCanvas = document.createElement('canvas')
    glCanvas.className = 'eb-hero-layer'
    glHostRef.current.appendChild(glCanvas)
    const cartCanvas = cartRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const box = () => ({ w: root.clientWidth || window.innerWidth, h: root.clientHeight || window.innerHeight })

    // the guest's own sheet from the intro, or a fresh one seeded by the clock
    let sheet = loadSheet()
    if (sheet) sheet.source = 'guest sheet'
    if (!sheet) {
      const { w, h } = box()
      const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0
      const L = cartoucheLayout(w, h)
      const zone = { x: ((L.rw + 20) * 2) / h, y: ((L.rh + 20) * 2) / h }
      sheet = { A: w / h, seed, ops: generatePattern(seed, w / h, zone), source: 'generated' }
      saveSheet(sheet)
    }
    const A = sheet.A

    let current = box()
    const drawCart = () => {
      cartCanvas.width = Math.round(current.w * dpr)
      cartCanvas.height = Math.round(current.h * dpr)
      const ctx = cartCanvas.getContext('2d')
      drawCartouche(ctx, cartoucheLayout(current.w, current.h), sheet.seed, dpr)
    }

    let gl = null
    let tray = null
    let paper = null
    try {
      gl = createGL(glCanvas)
      const [tw, th] = traySize(current.w, current.h, A, dpr)
      tray = createTray(gl, { A, width: tw, height: th })
      tray.ops.push(...sheet.ops)
      tray.update(tray.ops.length)
      paper = createProgram(gl, PAPER_FRAG)
      // the same sheet dresses the rest of the page (dividers, RSVP card)
      const pixels = tray.read()
      if (!hasPaint(pixels)) throw new Error('composed sheet came out blank')
      const snapshot = pixelsToCanvas(pixels, tw, th, 900)
      root.closest('.inv-root')?.style.setProperty('--ebru-paper', `url(${snapshot.toDataURL('image/jpeg', 0.86)})`)
      if (gl.isContextLost()) throw new Error('context lost')
      if (import.meta.env.DEV) console.info(`[ebru] hero: WebGL2 path, ${sheet.ops.length} ops (${sheet.source}), ${tw}×${th}`)
    } catch (error) {
      console.warn('[ebru] marbled hero falling back to the saved snapshot:', error?.message ?? error)
      try {
        tray?.dispose()
      } catch {
        // context already gone
      }
      tray = null
      gl = null
      root.classList.add('eb-hero--flat')
      let still = loadSnapshot()
      if (!still) {
        // paint a small still of the sheet on the CPU instead
        const h = 420
        still = renderOpsToCanvas(sheet.ops, A, Math.round(h * A), h).toDataURL('image/jpeg', 0.85)
      }
      if (import.meta.env.DEV) console.info(`[ebru] hero: still fallback, ${sheet.ops.length} ops (${sheet.source})`)
      if (still) {
        root.style.setProperty('--eb-still', `url(${still})`)
        root.closest('.inv-root')?.style.setProperty('--ebru-paper', `url(${still})`)
      }
    }

    const swirl = [0, 0, 0]
    const light = { x: 0.3, y: 0.75, tx: null, ty: null, last: 0 }
    let pointerPrev = null

    const render = (t) => {
      if (!gl) return
      const aspect = current.w / current.h
      const halfH = Math.min(1, A / aspect)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, glCanvas.width, glCanvas.height)
      gl.useProgram(paper)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, tray.texture)
      gl.uniform1i(paper.u('uTex'), 0)
      gl.uniform2f(paper.u('uHalf'), halfH * aspect, halfH)
      gl.uniform2f(paper.u('uTexel'), 1 / tray.size[0], 1 / tray.size[1])
      gl.uniform1f(paper.u('uA'), A)
      gl.uniform1f(paper.u('uTime'), t)
      gl.uniform3fv(paper.u('uSwirl'), swirl)
      gl.uniform2f(paper.u('uLight'), light.x, light.y)
      drawFullscreen(gl)
    }

    const onResize = () => {
      const next = box()
      if (Math.abs(next.w - current.w) < 1 && Math.abs(next.h - current.h) < 1) return
      current = next
      setSize(next)
      sizeGl()
      drawCart()
      render(performance.now() / 1000)
    }
    const sizeGl = () => {
      glCanvas.width = Math.round(current.w * dpr)
      glCanvas.height = Math.round(current.h * dpr)
    }
    sizeGl()
    drawCart()
    render(0)
    const ro = new ResizeObserver(onResize)
    ro.observe(root)

    const onMove = (event) => {
      const rect = root.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = 1 - (event.clientY - rect.top) / rect.height
      light.tx = x
      light.ty = y
      light.last = performance.now()
      const aspect = rect.width / rect.height
      const halfH = Math.min(1, A / aspect)
      const px = (x * 2 - 1) * halfH * aspect
      const py = (y * 2 - 1) * halfH
      if (pointerPrev) {
        const speed = Math.hypot(px - pointerPrev[0], py - pointerPrev[1])
        swirl[2] = Math.max(-0.7, Math.min(0.7, swirl[2] + speed * 2.2 * (px > swirl[0] ? 1 : -1)))
      }
      swirl[0] += (px - swirl[0]) * 0.5
      swirl[1] += (py - swirl[1]) * 0.5
      pointerPrev = [px, py]
    }
    const onTilt = (event) => {
      if (event.gamma == null || event.beta == null) return
      light.tx = 0.5 + Math.max(-0.45, Math.min(0.45, event.gamma / 60))
      light.ty = 0.6 - Math.max(-0.4, Math.min(0.4, (event.beta - 45) / 80))
      light.last = performance.now()
    }

    let raf = 0
    let visible = true
    const frame = (now) => {
      raf = 0
      if (!visible) return
      raf = requestAnimationFrame(frame)
      const t = now / 1000
      if (light.tx === null || now - light.last > 4000) {
        light.tx = 0.5 + 0.3 * Math.sin(t * 0.17)
        light.ty = 0.62 + 0.2 * Math.sin(t * 0.23 + 1)
      }
      light.x += (light.tx - light.x) * 0.04
      light.y += (light.ty - light.y) * 0.04
      swirl[2] *= 0.965
      render(t)
    }
    let io = null
    if (!reduce && gl) {
      root.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('deviceorientation', onTilt, { passive: true })
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible && !raf) raf = requestAnimationFrame(frame)
      })
      io.observe(root)
    }

    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      ro.disconnect()
      root.removeEventListener('pointermove', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      if (gl) {
        tray.dispose()
        gl.deleteProgram(paper)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
      glCanvas.remove()
    }
  }, [])

  const L = cartoucheLayout(size.w, size.h, [partner1, partner2])
  const line = (y) => ({ top: `${y.toFixed(1)}px` })
  return (
    <header ref={rootRef} className="eb-hero" style={{ '--eb-name': `${L.name}px`, '--eb-meta': `${L.meta}px` }}>
      <div ref={glHostRef} className="eb-hero-gl" aria-hidden="true" />
      <canvas ref={cartRef} className="eb-hero-layer" aria-hidden="true" />
      {tagline ? (
        <p className="eb-line eb-tagline" style={line(L.yTag)}>
          {tagline}
        </p>
      ) : null}
      <h1 className="eb-names">
        <span className="eb-line eb-name" style={line(L.y1)}>
          {partner1}
        </span>
        <span className="eb-line eb-amp" style={line(L.yAmp)}>
          &amp;
        </span>
        <span className="eb-line eb-name" style={line(L.y2)}>
          {partner2}
        </span>
      </h1>
      <p className="eb-line eb-date" style={line(L.yDate)}>
        {dateLabel}
      </p>
      <p className="eb-line eb-place" style={line(L.yPlace)}>
        {place}
      </p>
    </header>
  )
}
