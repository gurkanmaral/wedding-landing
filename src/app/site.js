// Business details shown on the landing page. Fill these in before going live.
export const site = {
  name: 'Şimdi Evleniyoruz',
  url: 'https://simdievleniyoruz.com',
  defaultTitle: 'Dijital Düğün Davetiyesi | Şimdi Evleniyoruz',
  description:
    'Animasyonlu dijital düğün davetiyenizi seçin; geri sayım, konum, program ve online LCV özellikleriyle misafirlerinize tek linkle gönderin.',
  // international format without "+" or spaces, e.g. '905551112233'
  whatsapp: String(import.meta.env.VITE_WHATSAPP_NUMBER || '905378314730').replace(/\D/g, ''),
  email: '',
  instagram: '',
}

export const priceRequestText = (template) => {
  const name = template?.name || 'bir düğün davetiyesi tasarımı'
  return `Merhaba, Şimdi Evleniyoruz'da ${name} tasarımını beğendim. Bu tasarımın güncel fiyatını ve pakete dahil olan hizmetleri öğrenebilir miyim?`
}

export const whatsappLink = (text = priceRequestText()) => {
  const target = site.whatsapp ? `https://wa.me/${site.whatsapp}` : 'https://wa.me/'
  return `${target}?text=${encodeURIComponent(text)}`
}
