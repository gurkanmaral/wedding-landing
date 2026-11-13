import { useEffect } from 'react'
import { site } from './site.js'

const DEFAULT_IMAGE = `${site.url}/og-image.png`

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

function upsertStructuredData(data) {
  let element = document.head.querySelector('#seo-structured-data')
  if (!element) {
    element = document.createElement('script')
    element.id = 'seo-structured-data'
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(data)
}

export function applySeo({
  title = site.defaultTitle,
  description = site.description,
  path = '/',
  image = DEFAULT_IMAGE,
  imageAlt = site.name,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  structuredData,
  locale = 'en',
}) {
  const canonical = new URL(path, site.url).href
  const imageUrl = new URL(image, site.url).href

  document.title = title
  document.documentElement.lang = locale
  upsertMeta('meta[name="description"]', { name: 'description', content: description })
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots })
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: locale === 'tr' ? 'tr_TR' : 'en_US' })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: site.name })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
  upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt })
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
  upsertLink('canonical', canonical)

  if (structuredData) {
    upsertStructuredData(structuredData)
  } else {
    document.head.querySelector('#seo-structured-data')?.remove()
  }
}

export function useSeo(options) {
  useEffect(() => {
    applySeo(options)
  }, [options])
}

export function homeStructuredData(faq, locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: `${site.url}/`,
        name: site.name,
        alternateName: 'e-invitation digital invitations',
        inLanguage: locale === 'tr' ? 'tr-TR' : 'en',
      },
      {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        url: `${site.url}/`,
        logo: `${site.url}/favicon.svg`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: `+${site.whatsapp}`,
          contactType: 'sales',
          availableLanguage: ['English', 'Turkish'],
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${site.url}/#sss`,
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }
}

export function designStructuredData(template) {
  const url = `${site.url}/tasarim/${template.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: `${template.name} digital invitation`,
        description: template.blurb,
        url,
        provider: { '@id': `${site.url}/#organization` },
        areaServed: { '@type': 'Country', name: 'Türkiye' },
        serviceType: 'Digital invitation design',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${site.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Dijital Davetiye Tasarımları', item: `${site.url}/#tasarimlar` },
          { '@type': 'ListItem', position: 3, name: template.name, item: url },
        ],
      },
    ],
  }
}
