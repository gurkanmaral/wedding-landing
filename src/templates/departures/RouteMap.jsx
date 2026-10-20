import { useId, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSlot } from './useSlot.js'

// Equirectangular window over Europe and the Aegean (lon -12…36, lat 33…56).
const project = (lon, lat) => [((lon + 12) / 48) * 600, ((56 - lat) / 23) * 340]

const ORIGINS = [
  ['LHR', -0.45, 51.47],
  ['CDG', 2.55, 49.01],
  ['FRA', 8.57, 50.03],
  ['MXP', 8.72, 45.63],
  ['IST', 28.81, 41.26],
  ['ATH', 23.94, 37.94],
]
const DESTINATION = [25.48, 36.4] // Santorini (JTR)

function arc([x1, y1], [x2, y2]) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dist = Math.hypot(x2 - x1, y2 - y1)
  // bow every arc upward, like a great-circle on a flat map
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${(my - dist * 0.32).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

export default function RouteMap({ city, caption, label }) {
  const slot = useSlot('.theme-departures .inv-venue .inv-venue-grid', 'beforebegin', 'dp-route-slot')
  const rawId = useId()
  const id = `dpr${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const dest = project(...DESTINATION)
  const routes = ORIGINS.map(([code, lon, lat]) => ({ code, from: project(lon, lat), d: arc(project(lon, lat), dest) }))
  const name = String(city || '').toLocaleUpperCase()
  const showCode = /santorin|thira|fira|oia|pyrgos/i.test(city || '')

  return createPortal(
    <figure className="dp-route" data-reveal>
      <svg viewBox="0 0 600 340" role="img" aria-label={label}>
        <defs>
          <pattern id={`${id}-dots`} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1" fill="rgb(255 255 255 / 0.14)" />
          </pattern>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#ee6c4d" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ee6c4d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="340" fill="#121417" />
        <rect width="600" height="340" fill={`url(#${id}-dots)`} />
        <g stroke="rgb(255 255 255 / 0.06)" strokeWidth="1">
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`h${i}`} x1="0" x2="600" y1={34 + i * 68} y2={34 + i * 68} />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={`v${i}`} y1="0" y2="340" x1={37 + i * 75} x2={37 + i * 75} />
          ))}
        </g>
        <circle cx={dest[0]} cy={dest[1]} r="46" fill={`url(#${id}-glow)`} />
        {routes.map((route, i) => (
          <g key={route.code}>
            <path id={`${id}-r${i}`} d={route.d} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="1.2" />
            <path className="dp-route-dash" d={route.d} fill="none" stroke="#f4d35e" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 7" />
            <circle cx={route.from[0]} cy={route.from[1]} r="3.4" fill="#ffffff" />
            <text x={route.from[0]} y={route.from[1] - 9} textAnchor="middle" className="dp-route-code">
              {route.code}
            </text>
            {reduce ? null : (
              <path d="M7 0 -5 -4.5 -2.5 0 -5 4.5Z" fill="#ffffff">
                <animateMotion dur={`${5 + i * 0.7}s`} begin={`${i * -1.3}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${id}-r${i}`} />
                </animateMotion>
              </path>
            )}
          </g>
        ))}
        <circle className="dp-route-pulse" cx={dest[0]} cy={dest[1]} r="7" fill="none" stroke="#ee6c4d" strokeWidth="2" />
        <circle cx={dest[0]} cy={dest[1]} r="5" fill="#ee6c4d" stroke="#ffffff" strokeWidth="1.6" />
        <text x={dest[0] + 12} y={dest[1] + 22} className="dp-route-dest">
          {name}
          {showCode ? ' · JTR' : ''}
        </text>
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>,
    slot,
  )
}
