const ASCII_OVERRIDES = {
  ı: 'i',
  ł: 'l',
  đ: 'd',
  ø: 'o',
  þ: 'th',
}

export function slugifyWeddingNames(partner1, partner2) {
  const source = [partner1, partner2].filter(Boolean).join('-')
  const normalized = source
    .toLocaleLowerCase('en-US')
    .replace(/[ıłđøþ]/g, (character) => ASCII_OVERRIDES[character] || character)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'our-wedding'
}

export function uniqueWeddingSlug(partner1, partner2, cards, currentCardId = null) {
  const base = slugifyWeddingNames(partner1, partner2)
  const used = new Set(
    cards
      .filter((card) => card.id !== currentCardId)
      .map((card) => card.details?.slug)
      .filter(Boolean),
  )

  if (!used.has(base)) return base
  let suffix = 2
  while (used.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
