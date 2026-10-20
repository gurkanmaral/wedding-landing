import { useEffect, useId, useRef } from 'react'
import { requestStatusLabel } from './adminUtils'
import { findTemplateOption, templateLabel } from './templateDetails'

const ICON_PATHS = {
  overview: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z',
  cards: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm0 .5 8 6 8-6',
  inbox: 'M4 13.5 6.2 6A2 2 0 0 1 8.1 4.6h7.8A2 2 0 0 1 17.8 6l2.2 7.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4.5Zm0 0h4.5l1.5 2.5h4l1.5-2.5H20',
  rsvp: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 9a5 5 0 0 1 10 0M16 11a2.5 2.5 0 1 0 0-5M17 15.2A4.5 4.5 0 0 1 21 20',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  close: 'M6 6l12 12M18 6 6 18',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  whatsapp: 'M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Zm5-11c0 3.5 2.5 6 6 6l1-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2L9 9Z',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  back: 'M15 6l-6 6 6 6',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4',
  site: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  shield: 'M12 3 5 6v6c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6l-7-3Z',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  check: 'M5 12.5 10 17l9-10',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  sort: 'M8 5v14M5 16l3 3 3-3M16 19V5M13 8l3-3 3 3',
  note: 'M5 4h10l4 4v12H5V4Zm9 0v5h5M8 13h8M8 17h5',
}

export function Icon({ name, size = 18, className = '' }) {
  return (
    <svg className={`wf-icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name] || ICON_PATHS.sparkle} />
    </svg>
  )
}

export function Spinner({ label = 'Yükleniyor' }) {
  return <span className="wf-spinner" role="status" aria-label={label} />
}

export function Skeleton({ width = '100%', height = 14, radius = 6, className = '' }) {
  return <span className={`wf-skeleton ${className}`} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
}

export function SkeletonRows({ rows = 5, label = 'Veriler yükleniyor' }) {
  return (
    <div className="wf-skeleton-rows" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="wf-skeleton-row">
          <Skeleton width="34%" height={14} />
          <Skeleton width="18%" height={12} />
          <Skeleton width="22%" height={12} />
          <Skeleton width="12%" height={28} radius={999} />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon = 'sparkle', title, children, action }) {
  return (
    <div className="wf-empty">
      <span className="wf-empty__icon"><Icon name={icon} size={22} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="wf-error-state" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="wf-btn wf-btn--ghost" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Tekrar dene
        </button>
      )}
    </div>
  )
}

export function StatusBadge({ status }) {
  return <span className={`wf-badge wf-badge--${status}`}><span className="wf-dot" aria-hidden="true" />{requestStatusLabel(status)}</span>
}

export function TemplateBadge({ template }) {
  const option = findTemplateOption(template)
  return (
    <span className="wf-template-badge" title={option?.mood || undefined}>
      <span className="wf-template-badge__swatch" style={{ background: option?.swatch || 'var(--wf-line)' }} aria-hidden="true" />
      {templateLabel(template)}
    </span>
  )
}

export function AttendBadge({ attending }) {
  return attending
    ? <span className="wf-badge wf-badge--yes"><Icon name="check" size={13} />Katılıyor</span>
    : <span className="wf-badge wf-badge--no"><Icon name="close" size={13} />Katılmıyor</span>
}

export function Toasts({ toasts, onDismiss }) {
  return (
    <div className="wf-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`wf-toast wf-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <Icon name={toast.type === 'error' ? 'close' : 'check'} size={16} />
          <span>{toast.text}</span>
          <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Bildirimi kapat"><Icon name="close" size={14} /></button>
        </div>
      ))}
    </div>
  )
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Overlays can stack (a confirm dialog above the editor drawer), so the body
// scroll lock is reference counted.
let scrollLocks = 0
let savedOverflow = ''

function lockScroll() {
  if (scrollLocks === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLocks += 1
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow
}

// Keeps keyboard focus inside an open overlay, closes on Escape and restores
// focus to the element that opened it.
function useOverlay(open, ref, onClose, initialFocus) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const node = ref.current
    const target = (initialFocus && node?.querySelector(initialFocus)) || node?.querySelector(FOCUSABLE)
    target?.focus()
    lockScroll()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    node?.addEventListener('keydown', onKey)
    return () => {
      node?.removeEventListener('keydown', onKey)
      unlockScroll()
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [open, ref, initialFocus])
}

export function ConfirmDialog({ open, title, children, confirmLabel = 'Sil', cancelLabel = 'Vazgeç', tone = 'danger', busy = false, onConfirm, onCancel }) {
  const ref = useRef(null)
  const titleId = useId()
  const bodyId = useId()
  useOverlay(open, ref, busy ? null : onCancel, '[data-autofocus]')
  if (!open) return null
  return (
    <div className="wf-overlay wf-overlay--center" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel() }}>
      <div ref={ref} className="wf-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId}>
        <span className={`wf-dialog__icon wf-dialog__icon--${tone}`}><Icon name={tone === 'danger' ? 'trash' : 'sparkle'} size={20} /></span>
        <h2 id={titleId}>{title}</h2>
        <div id={bodyId} className="wf-dialog__body">{children}</div>
        <div className="wf-dialog__actions">
          <button type="button" className="wf-btn wf-btn--ghost" onClick={onCancel} disabled={busy} data-autofocus>{cancelLabel}</button>
          <button type="button" className={`wf-btn ${tone === 'danger' ? 'wf-btn--danger' : 'wf-btn--primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? <><Spinner label="İşleniyor" /> İşleniyor…</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Drawer({ open, title, subtitle, onClose, children, footer, labelledBy }) {
  const ref = useRef(null)
  const generatedId = useId()
  const titleId = labelledBy || generatedId
  useOverlay(open, ref, onClose, '[data-autofocus]')
  if (!open) return null
  return (
    <div className="wf-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside ref={ref} className="wf-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="wf-drawer__head">
          <div>
            {subtitle && <p className="wf-eyebrow">{subtitle}</p>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button type="button" className="wf-icon-btn" onClick={onClose} aria-label="Paneli kapat"><Icon name="close" /></button>
        </header>
        <div className="wf-drawer__body">{children}</div>
        {footer && <footer className="wf-drawer__foot">{footer}</footer>}
      </aside>
    </div>
  )
}

export function Field({ label, hint, error, children, wide = false, htmlFor }) {
  return (
    <div className={`wf-field ${wide ? 'wf-field--wide' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="wf-hint">{hint}</p>}
      {error && <p className="wf-field-error" role="alert">{error}</p>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="wf-page-head">
      <div>
        {eyebrow && <p className="wf-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="wf-page-head__lead">{description}</p>}
      </div>
      {actions && <div className="wf-page-head__actions">{actions}</div>}
    </header>
  )
}
