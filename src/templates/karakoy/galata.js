// One continuous pen line: Galata Bridge with its lamp posts, the Karaköy
// waterfront blocks (Karaköy Palas cupola), the houses climbing the hill,
// Galata Tower (thick round stone body, arched upper storey, projecting
// gallery with balustrade, broad conical roof and finial), down past the Kılıç Ali Paşa
// dome and minaret to the Tophane quay and the slim Nusretiye minaret.
// viewBox 0 0 1200 500, waterline at y = 452, the tower centred on x = 600.
export const SKY_W = 1200
export const SKY_H = 500
export const WATERLINE = 452

// Galata Tower, drawn in one pass: up the thick, slightly tapering stone
// body, the short upper storey, out to the eaves and over the broad conical
// roof and its finial, down the far side, back across the upper storey as a
// row of arched windows, then out along the projecting gallery with its
// balustrade and down the near wall to the hill.
function tower() {
  const sill = 112
  const top = 92
  const left = 567
  const right = 633
  const parts = ['L567 124', `V${top}`, 'H558 L600 24 V10 V24 L642 92', `H${right}`, `V${sill}`]
  // five arched windows, right to left
  const span = right - left
  for (let i = 4; i >= 0; i -= 1) {
    const c = left + (span * (i + 0.5)) / 5
    parts.push(`H${(c + 3.5).toFixed(1)} V102 A3.5 3.5 0 0 0 ${(c - 3.5).toFixed(1)} 102 V${sill}`)
  }
  parts.push(`H${left}`)
  // the viewing gallery: rail, balusters, floor
  parts.push('H552 V124')
  for (let x = 556; x <= 644; x += 6) parts.push(`H${x} V117 H${x + 2} V124`)
  parts.push(`H648 V${sill} H${right} V124 L636 326`)
  return parts.join(' ')
}

export const GALATA_PATH = [
  'M0 452 H30 V440',
  // bridge deck with three lamp posts
  'H80 V424 H84 V440 H140 V424 H144 V440 H200 V424 H204 V440 H240',
  // waterfront blocks, Karaköy Palas with its small cupola
  'V412 H262 V406 H300 V392 H314 Q322 374 330 392 H345 V400 H380',
  // the hill: stepped houses and pitched roofs
  'V372 H420 V360 L437 348 L455 360 V345 H490 V330 L505 318 L520 330 V322 H564',
  tower(),
  // down the hill toward Tophane
  'H642 L651 316 L660 326 V338 H700 V350 H735 V362 H770 V380 H780',
  // Kılıç Ali Paşa: half dome, main dome with finial, half dome
  'Q787 366 795 372 A35 35 0 0 1 830 337 V324 V337 A35 35 0 0 1 865 372 Q873 366 880 380',
  // its slim minaret with the şerefe balcony
  'H890 V266 H886 V260 H890 V232 L895 198 L900 232 V260 H904 V266 H900 V380',
  // Tophane quay and the slim Nusretiye minaret
  'H930 V392 H1000 V404 H1075 V300 L1078 284 L1081 300 V404 H1110 V410 H1150 V452 H1200',
].join(' ')

// Where the signal-orange sun sits, just off the tower's shoulder.
export const SUN = { cx: 696, cy: 112, r: 22 }
