import { useEffect, useRef, useState } from 'react'

const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÇĞİÖŞÜ0123456789&·:-./'

function setChar(half, value) {
  half.firstChild.textContent = value === ' ' ? ' ' : value
}

// One real split-flap step per character: the upper leaf falls, the lower
// leaf lands, then the next character. Each cell rolls through a few random
// characters before settling, like a station board.
function rollCell(cell, target, token, delay) {
  const [top, bottom, leafTop, leafBottom] = cell.children
  const current = cell.dataset.shown ?? ' '
  if (current === target) return
  const steps = []
  let seed = (target.charCodeAt(0) * 9301 + delay * 7) % 233280
  const count = 3 + (seed % 6)
  for (let i = 0; i < count; i += 1) {
    seed = (seed * 9301 + 49297) % 233280
    steps.push(CHARSET[seed % CHARSET.length])
  }
  steps.push(target)
  let shown = current
  const stepMs = 92
  const next = () => {
    if (cell.dataset.token !== token) return
    const value = steps.shift()
    setChar(top, value)
    setChar(leafTop, shown)
    setChar(leafBottom, value)
    setChar(bottom, shown)
    leafTop.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: stepMs / 2, easing: 'ease-in', fill: 'forwards' })
    const land = leafBottom.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], {
      duration: stepMs / 2,
      delay: stepMs / 2,
      easing: 'cubic-bezier(.3,1.4,.6,1)',
      fill: 'forwards',
    })
    land.onfinish = () => {
      setChar(bottom, value)
      shown = value
      cell.dataset.shown = value
      if (steps.length && cell.dataset.token === token) next()
    }
  }
  cell.dataset.token = token
  setTimeout(next, delay)
}

function showCell(cell, value) {
  const [top, bottom, leafTop, leafBottom] = cell.children
  ;[top, bottom, leafTop, leafBottom].forEach((half) => setChar(half, value))
  cell.dataset.shown = value
  cell.dataset.token = ''
}

function Cells({ text, cols }) {
  const chars = [...text.padEnd(cols, ' ')].slice(0, Math.max(cols, text.length))
  return (
    <span className="dpf-flaps" style={{ '--cols': chars.length }} aria-hidden="true">
      {chars.map((ch, i) => (
        <span key={i} className="dpf-cell" data-char={ch}>
          <span className="dpf-half dpf-top">
            <span>{' '}</span>
          </span>
          <span className="dpf-half dpf-bottom">
            <span>{' '}</span>
          </span>
          <span className="dpf-half dpf-top dpf-leaf">
            <span>{' '}</span>
          </span>
          <span className="dpf-half dpf-bottom dpf-leaf">
            <span>{' '}</span>
          </span>
        </span>
      ))}
    </span>
  )
}

// Waits for the intro overlay to leave, so guests see the board flip.
function useIntroGone() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    let timer = 0
    const check = () => {
      if (document.querySelector('.invitation-intro')) return
      observer.disconnect()
      timer = setTimeout(() => setGone(true), 350)
    }
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    timer = setTimeout(check, 400)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])
  return gone
}

/**
 * rows: [[{ label, text, cols, accent }...]] — each row holds one or two fields.
 */
export default function SplitFlapBoard({ title, clockLabel, rows, summary }) {
  const rootRef = useRef(null)
  const ready = useIntroGone()
  const [clock, setClock] = useState('')
  const signature = rows.map((row) => row.map((f) => f.text).join('|')).join('/')

  useEffect(() => {
    const format = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const id = setInterval(() => setClock(format()), 10000)
    const first = setTimeout(() => setClock(format()), 0)
    return () => {
      clearInterval(id)
      clearTimeout(first)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || !ready) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const token = String(Date.now())
    const cells = root.querySelectorAll('.dpf-cell')
    cells.forEach((cell, i) => {
      const target = cell.dataset.char
      if (reduce) showCell(cell, target)
      else rollCell(cell, target, token, i * 28)
    })
    return () => cells.forEach((cell) => {
      cell.dataset.token = ''
    })
  }, [ready, signature])

  return (
    <div ref={rootRef} className="dpf-board">
      <p className="dp-sr">{summary}</p>
      <div className="dpf-head" aria-hidden="true">
        <span className="dpf-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M22 12 2 4.5l3.6 7.5L2 19.5Z" />
          </svg>
          {title}
        </span>
        <span className="dpf-clock">
          {clockLabel} {clock}
        </span>
      </div>
      {rows.map((row, r) => (
        <div key={r} className={`dpf-row${row.length > 1 ? ' dpf-row--split' : ''}`} aria-hidden="true">
          {row.map((field) => (
            <div key={field.label} className={`dpf-field${field.accent ? ' is-accent' : ''}${field.big ? ' is-big' : ''}`}>
              <span className="dpf-label">
                {field.accent ? <i className="dpf-lamp" /> : null}
                {field.label}
              </span>
              <Cells text={field.text} cols={field.cols ?? field.text.length} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
