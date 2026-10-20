// A 1930s 35 mm projector in profile, drawn like an engraving: black
// crackle enamel with brass hairline detailing, two spoked reels on their
// arms, the lamp house with its chimney and the lens barrel facing right.
// viewBox 0 0 420 300; the lens glass sits at LENS.

export const LENS = { x: 404 / 420, y: 196 / 300 }

const reel = (cx, cy, r, cls) => {
  const holes = [0, 120, 240]
    .map((deg) => {
      const a = (deg * Math.PI) / 180
      return `<circle cx="${(cx + Math.cos(a) * r * 0.55).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.55).toFixed(1)}" r="${(r * 0.24).toFixed(1)}" fill="#0b0a09" stroke="#c9a85c" stroke-width="1" stroke-opacity="0.55"/>`
    })
    .join('')
  return `<g class="cn-reel ${cls}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#cn-p-reel)" stroke="url(#cn-p-brass)" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#c9a85c" stroke-opacity="0.35" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#2a1d15"/>
    ${holes}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.12}" fill="url(#cn-p-brass)"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.04}" fill="#1a1918"/>
  </g>`
}

export const PROJECTOR_SVG = `<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="cn-p-brass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6e2a6"/><stop offset="0.45" stop-color="#c9a85c"/><stop offset="1" stop-color="#6e5525"/>
    </linearGradient>
    <linearGradient id="cn-p-brass-h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7a5f2c"/><stop offset="0.5" stop-color="#e9cf86"/><stop offset="1" stop-color="#8c6d30"/>
    </linearGradient>
    <linearGradient id="cn-p-enamel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3632"/><stop offset="0.18" stop-color="#1d1b19"/><stop offset="1" stop-color="#0c0b0a"/>
    </linearGradient>
    <radialGradient id="cn-p-reel" cx="0.4" cy="0.35" r="0.8">
      <stop offset="0" stop-color="#4b4741"/><stop offset="1" stop-color="#141312"/>
    </radialGradient>
    <radialGradient id="cn-p-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff8e4"/><stop offset="0.4" stop-color="#ffd27a" stop-opacity="0.8"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- stand -->
  <path d="M168 246 L150 296 H250 L232 246Z" fill="url(#cn-p-enamel)" stroke="#c9a85c" stroke-opacity="0.5"/>
  <rect x="138" y="290" width="124" height="8" rx="2" fill="url(#cn-p-brass)"/>
  <!-- reel arms and film path -->
  <path d="M150 150 L124 66 M268 150 L298 58" stroke="url(#cn-p-brass-h)" stroke-width="7" stroke-linecap="round"/>
  <path d="M84 92 C96 140 150 140 172 156 M336 82 C330 130 290 140 262 156" fill="none" stroke="#2b1e15" stroke-width="2.4"/>
  ${reel(124, 66, 58, 'cn-reel--front')}
  ${reel(298, 58, 52, 'cn-reel--rear')}
  <!-- lamp house -->
  <rect x="52" y="96" width="40" height="26" rx="4" fill="url(#cn-p-enamel)" stroke="#c9a85c" stroke-opacity="0.6"/>
  <rect x="38" y="118" width="72" height="112" rx="10" fill="url(#cn-p-enamel)" stroke="url(#cn-p-brass)" stroke-width="1.6"/>
  <g stroke="#c9a85c" stroke-opacity="0.55">
    <path d="M50 136 H98 M50 146 H98 M50 156 H98 M50 166 H98"/>
  </g>
  <rect class="cn-lamp" x="54" y="182" width="40" height="22" rx="3" fill="#ffb560"/>
  <!-- body -->
  <rect x="96" y="148" width="226" height="98" rx="14" fill="url(#cn-p-enamel)" stroke="url(#cn-p-brass)" stroke-width="1.6"/>
  <path d="M108 162 H310" stroke="#c9a85c" stroke-opacity="0.4"/>
  <path d="M108 232 H310" stroke="#c9a85c" stroke-opacity="0.4"/>
  <circle cx="200" cy="198" r="26" fill="#11100f" stroke="url(#cn-p-brass)" stroke-width="2"/>
  <circle cx="200" cy="198" r="17" fill="none" stroke="#c9a85c" stroke-opacity="0.45" stroke-dasharray="3 3"/>
  <circle cx="200" cy="198" r="5" fill="url(#cn-p-brass)"/>
  <circle cx="132" cy="214" r="7" fill="url(#cn-p-brass)"/>
  <circle cx="278" cy="214" r="7" fill="url(#cn-p-brass)"/>
  <ellipse cx="258" cy="182" rx="20" ry="9" fill="url(#cn-p-brass-h)"/>
  <text x="258" y="186" text-anchor="middle" font-family="Limelight, Georgia, serif" font-size="10" fill="#1a1612">35</text>
  <circle class="cn-pilot" cx="300" cy="226" r="3" fill="#b5121b"/>
  <!-- lens barrel -->
  <rect x="322" y="178" width="66" height="36" rx="3" fill="url(#cn-p-brass)"/>
  <path d="M334 178 V214 M346 178 V214 M358 178 V214" stroke="#6e5525" stroke-opacity="0.7"/>
  <rect x="386" y="170" width="16" height="52" rx="3" fill="url(#cn-p-brass)"/>
  <ellipse class="cn-lens" cx="404" cy="196" rx="5" ry="22" fill="#2a2620"/>
  <ellipse class="cn-lens-glow" cx="404" cy="196" rx="34" ry="34" fill="url(#cn-p-glow)" opacity="0"/>
</svg>`
