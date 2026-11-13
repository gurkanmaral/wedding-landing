// Business details shown on the landing page. Fill these in before going live.
export const site = {
  name: 'e-invitation',
  url: String(import.meta.env.VITE_SITE_URL || 'https://e-invitation.com').replace(/\/$/, ''),
  defaultTitle: 'Digital Invitations for Every Celebration | e-invitation',
  description:
    'Create a personal, animated digital invitation for weddings, birthdays, engagements, baby showers, graduations and events. Share every detail with one link.',
  // international format without "+" or spaces, e.g. '905551112233'
  whatsapp: String(import.meta.env.VITE_WHATSAPP_NUMBER || '905378314730').replace(/\D/g, ''),
  email: '',
  instagram: '',
}

export const priceRequestText = (template, locale = 'en') => {
  const name = template?.name || (locale === 'tr' ? 'bir dijital davetiye tasarımı' : 'a digital invitation design')
  return locale === 'tr'
    ? `Merhaba, e-invitation'da ${name} tasarımını beğendim. Güncel fiyatı ve pakete dahil olan hizmetleri öğrenebilir miyim?`
    : `Hello, I like the ${name} design on e-invitation. Could you share the current price and what is included?`
}

export const whatsappLink = (text = priceRequestText()) => {
  const target = site.whatsapp ? `https://wa.me/${site.whatsapp}` : 'https://wa.me/'
  return `${target}?text=${encodeURIComponent(text)}`
}
