// Henna mandala drawn around the couple's names. Every stroke carries its own
// start time and duration (fractions of the whole drawing) so it can be drawn
// ring by ring like a henna artist's cone, outward from the names.

const f = (n) => Math.round(n * 10) / 10
const polar = (r, a) => `${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`

function petal(a, r0, r1, w) {
  const span = r1 - r0
  return `M${polar(r0, a - w)}C${polar(r0 + span * 0.55, a - w * 1.08)} ${polar(r1 - span * 0.14, a - w * 0.32)} ${polar(r1, a)}C${polar(r1 - span * 0.14, a + w * 0.32)} ${polar(r0 + span * 0.55, a + w * 1.08)} ${polar(r0, a + w)}`
}

function circle(r) {
  return `M${f(-r)} 0A${r} ${r} 0 1 0 ${f(r)} 0A${r} ${r} 0 1 0 ${f(-r)} 0`
}

// Stroke list: { d } paths or { c: [x, y, r] } dots, with t (start) and l (length) in 0..1.
export function mandalaStrokes() {
  const out = []
  const TAU = Math.PI * 2
  // fine dotted ring right around the names
  for (let k = 0; k < 56; k += 1) {
    const a = (k / 56) * TAU - Math.PI / 2
    out.push({ c: [Math.cos(a) * 252, Math.sin(a) * 252, 2.4], t: (k / 56) * 0.1, l: 0.04 })
  }
  out.push({ d: circle(266), t: 0.06, l: 0.16 })
  out.push({ d: circle(276), t: 0.1, l: 0.16 })
  const n = 16
  for (let k = 0; k < n; k += 1) {
    const a = (k / n) * TAU - Math.PI / 2
    const t = 0.2 + (k / n) * 0.18
    out.push({ d: petal(a, 284, 372, (Math.PI / n) * 0.92), t, l: 0.1 })
    out.push({ d: petal(a, 298, 350, (Math.PI / n) * 0.5), t: t + 0.04, l: 0.08 })
    out.push({ c: [Math.cos(a) * 318, Math.sin(a) * 318, 4], t: t + 0.08, l: 0.04 })
  }
  out.push({ d: circle(382), t: 0.36, l: 0.16 })
  let scallops = ''
  for (let k = 0; k < 32; k += 1) {
    const a0 = (k / 32) * TAU
    const a1 = ((k + 1) / 32) * TAU
    scallops += `${k ? 'L' : 'M'}${polar(382, a0)}Q${polar(410, (a0 + a1) / 2)} ${polar(382, a1)}`
  }
  out.push({ d: scallops, t: 0.42, l: 0.18 })
  for (let k = 0; k < n; k += 1) {
    const a = ((k + 0.5) / n) * TAU - Math.PI / 2
    const t = 0.55 + (k / n) * 0.22
    const w = (Math.PI / n) * 0.95
    out.push({ d: petal(a, 404, 478, w), t, l: 0.1 })
    out.push({ d: petal(a, 418, 458, w * 0.55), t: t + 0.04, l: 0.07 })
    // fill lines, like a henna cone shading the petal
    for (let j = -1; j <= 1; j += 1) {
      out.push({ d: `M${polar(424, a + j * w * 0.28)}L${polar(446, a + j * w * 0.12)}`, t: t + 0.07, l: 0.04 })
    }
    out.push({ c: [Math.cos(a) * 492, Math.sin(a) * 492, 4.5], t: t + 0.1, l: 0.04 })
    const b = (k / n) * TAU - Math.PI / 2
    out.push({ c: [Math.cos(b) * 432, Math.sin(b) * 432, 3.2], t: t + 0.12, l: 0.04 })
  }
  return out
}

/** Builds the mandala as an <svg> (viewBox -500..500). */
export function buildMandala(doc = document) {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = doc.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '-500 -500 1000 1000')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'kina-mandala')
  const g = doc.createElementNS(ns, 'g')
  g.setAttribute('fill', 'none')
  g.setAttribute('stroke', 'currentColor')
  g.setAttribute('stroke-width', '4')
  g.setAttribute('stroke-linecap', 'round')
  g.setAttribute('stroke-linejoin', 'round')
  svg.appendChild(g)
  const items = mandalaStrokes().map((s) => {
    let el
    if (s.c) {
      el = doc.createElementNS(ns, 'circle')
      el.setAttribute('cx', s.c[0].toFixed(1))
      el.setAttribute('cy', s.c[1].toFixed(1))
      el.setAttribute('r', s.c[2])
      el.setAttribute('fill', 'currentColor')
      el.setAttribute('stroke', 'none')
    } else {
      el = doc.createElementNS(ns, 'path')
      el.setAttribute('d', s.d)
      el.setAttribute('pathLength', '1')
      el.setAttribute('stroke-dasharray', '1 1')
    }
    g.appendChild(el)
    return { el, dot: Boolean(s.c), t: s.t, l: s.l }
  })
  return { svg, items }
}

/** Sets every stroke to a drawing progress (0 = blank, 1 = complete). */
export function setMandalaProgress(mandala, p) {
  for (const item of mandala.items) {
    const local = Math.min(1, Math.max(0, (p - item.t) / item.l))
    if (item.dot) item.el.style.opacity = local.toFixed(3)
    else item.el.style.strokeDashoffset = (1 - local).toFixed(4)
  }
}
