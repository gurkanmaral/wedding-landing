import { useEffect, useRef, useState } from 'react'

const SCREEN_W = 390
const SCREEN_H = 844

// A phone with the real invitation running inside it (an iframe of the template route).
export default function PhoneDemo({ template, autoLoad = false, label }) {
  const frameRef = useRef(null)
  const [scale, setScale] = useState(0.7)
  const [visible, setVisible] = useState(autoLoad)
  const [run, setRun] = useState(0)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SCREEN_W))
    ro.observe(el)
    if (autoLoad) return () => ro.disconnect()
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: '200px' })
    io.observe(el)
    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [autoLoad])

  return (
    <figure className="lp-phone">
      <div className="lp-phone__body">
        <div className="lp-phone__notch" aria-hidden="true" />
        <div ref={frameRef} className="lp-phone__screen" style={{ background: template.intro.bg }}>
          {visible ? (
            <iframe
              key={`${template.slug}-${run}`}
              title={label ?? `${template.name} davetiye önizlemesi`}
              src={template.path}
              width={SCREEN_W}
              height={SCREEN_H}
              loading="lazy"
              style={{ transform: `scale(${scale})` }}
            />
          ) : null}
        </div>
      </div>
      <figcaption className="lp-phone__caption">
        <button type="button" className="lp-link" onClick={() => setRun((n) => n + 1)}>
          Baştan oynat
        </button>
        <a className="lp-link" href={template.path} target="_blank" rel="noopener noreferrer">
          Tam ekran aç
        </a>
      </figcaption>
    </figure>
  )
}
