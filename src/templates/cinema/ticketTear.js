import { useEffect } from 'react'

// When the ticket-stub RSVP is sent, we lay two copies of the ticket over it,
// split along the perforation, and tear the stub away while the main part
// fades — the thank-you appears as the half you keep.
//
// The reply is sent to the server first, so the tear must only play once it
// has gone through. At submit (capture phase, ahead of React) we snapshot the
// ticket as it looks; then we watch the section: when the engine swaps the
// form for the thank-you, the tear plays from the snapshot. If the form comes
// back with an error instead, the snapshot is dropped and nothing tears.
function snapshot(form, root) {
  const r = form.getBoundingClientRect()
  const base = root.getBoundingClientRect()
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const stub = parseFloat(getComputedStyle(form).getPropertyValue('--cn-stub')) || 6.5
  const keep = form.cloneNode(true)
  const away = form.cloneNode(true)
  ;[keep, away].forEach((copy) => {
    copy.removeAttribute('id')
    copy.inert = true
    copy.style.width = `${r.width}px`
    copy.querySelectorAll('[name]').forEach((field) => field.removeAttribute('name'))
    copy.querySelectorAll('.inv-rsvp-error').forEach((note) => note.remove())
  })
  return {
    keep,
    away,
    width: r.width,
    height: r.height,
    left: r.left - base.left,
    top: r.top - base.top,
    cut: Math.max(20, r.height - stub * rem),
  }
}

function tear(root, shot) {
  const { keep, away, width, height, left, top, cut } = shot
  // a torn edge: small irregular teeth along the perforation
  const teeth = []
  const n = Math.max(12, Math.round(width / 9))
  for (let i = 0; i <= n; i += 1) {
    const x = (i / n) * 100
    teeth.push(`${x.toFixed(2)}% ${(cut + (i % 2 ? 2.5 : -2.5) + (Math.random() - 0.5) * 2).toFixed(1)}px`)
  }
  const layer = document.createElement('div')
  layer.className = 'cn-tear'
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  })
  keep.style.clipPath = `polygon(0 0, 100% 0, ${teeth.slice().reverse().join(', ')})`
  away.style.clipPath = `polygon(${teeth.join(', ')}, 100% 100%, 0 100%)`
  layer.append(keep, away)
  root.appendChild(layer)

  away.animate(
    [
      { transform: 'none' },
      { transform: 'translate(6px, 10px) rotate(4deg)', offset: 0.25 },
      { transform: 'translate(40px, 380px) rotate(26deg)', opacity: 0 },
    ],
    { duration: 1400, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
  )
  keep.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: 'rotate(-1.2deg)', opacity: 1, offset: 0.35 },
      { transform: 'translateY(-14px) rotate(-1deg)', opacity: 0 },
    ],
    { duration: 1100, delay: 250, easing: 'ease-in-out', fill: 'forwards' },
  )
  setTimeout(() => layer.remove(), 1700)
}

export function useTicketTear() {
  useEffect(() => {
    let watch = null
    const stop = () => {
      if (!watch) return
      watch.observer.disconnect()
      clearTimeout(watch.timer)
      watch = null
    }
    const onSubmit = (event) => {
      const form = event.target
      if (!(form instanceof HTMLFormElement) || !form.matches('.theme-cinema .inv-rsvp')) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const root = form.closest('.inv-root')
      const section = form.parentElement
      if (!root || !section) return
      // the browser's own validation stops invalid forms before submit fires,
      // so a snapshot here is of a reply that is really being sent
      stop()
      const shot = snapshot(form, root)
      const observer = new MutationObserver(() => {
        if (section.querySelector('.inv-rsvp-thanks')) {
          stop()
          tear(root, shot)
          return
        }
        // back from "sending…" without a thank-you: the reply failed
        const button = form.querySelector('button[type="submit"]')
        if (form.isConnected && button && !button.disabled && form.querySelector('.inv-rsvp-error')) stop()
      })
      observer.observe(section, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
      watch = { observer, timer: setTimeout(stop, 60000) }
    }
    window.addEventListener('submit', onSubmit, true)
    return () => {
      window.removeEventListener('submit', onSubmit, true)
      stop()
    }
  }, [])
}
