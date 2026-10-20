// Business details shown on the landing page. Fill these in before going live.
export const site = {
  name: 'Wedfolio',
  // international format without "+" or spaces, e.g. '905551112233'
  whatsapp: '',
  email: '',
  instagram: '',
}

export const whatsappLink = (text = 'Merhaba, düğün davetiyesi hakkında bilgi almak istiyorum.') =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : '#iletisim'
