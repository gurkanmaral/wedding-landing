import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const siteUrl = process.env.VITE_SITE_URL || 'https://e-invitation.com'
const siteName = 'e-invitation'
const registry = await readFile(resolve(root, 'src/templates/registry.js'), 'utf8')
const baseHtml = await readFile(resolve(dist, 'index.html'), 'utf8')

const templates = [...registry.matchAll(/slug: '([^']+)'[\s\S]*?name: '([^']+)'[\s\S]*?mood: '([^']+)'[\s\S]*?blurb: '([^']+)'/g)].map(
  ([, slug, name, mood, blurb]) => ({ slug, name, mood, blurb }),
)

if (!templates.length) throw new Error('SEO sayfaları için hiçbir davetiye tasarımı bulunamadı.')

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const replaceMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i')
  return html.replace(pattern, `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`)
}

function designHtml(template) {
  const path = `/tasarim/${template.slug}`
  const canonical = `${siteUrl}${path}`
  const title = `${template.name} Dijital Davetiye | ${siteName}`
  const description = `${template.mood}. ${template.blurb}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: `${template.name} digital invitation`,
        description: template.blurb,
        url: canonical,
        provider: { '@id': `${siteUrl}/#organization` },
        areaServed: { '@type': 'Country', name: 'Türkiye' },
        serviceType: 'Digital invitation design',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Dijital Davetiye Tasarımları', item: `${siteUrl}/#tasarimlar` },
          { '@type': 'ListItem', position: 3, name: template.name, item: canonical },
        ],
      },
    ],
  }

  let html = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
  html = html.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
  html = replaceMeta(html, 'name', 'description', description)
  html = replaceMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
  html = replaceMeta(html, 'property', 'og:title', title)
  html = replaceMeta(html, 'property', 'og:description', description)
  html = replaceMeta(html, 'property', 'og:url', canonical)
  html = replaceMeta(html, 'property', 'og:image:alt', `${template.name} digital invitation`)
  html = replaceMeta(html, 'name', 'twitter:title', title)
  html = replaceMeta(html, 'name', 'twitter:description', description)
  html = html.replace(
    /<script id="seo-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="seo-structured-data" type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>`,
  )
  return html
}

await mkdir(resolve(dist, 'tasarim'), { recursive: true })
await Promise.all(
  templates.map((template) => writeFile(resolve(dist, 'tasarim', `${template.slug}.html`), designHtml(template))),
)

const lastmod = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
  ...templates.map((template) => ({
    loc: `${siteUrl}/tasarim/${template.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq }) =>
      `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(resolve(dist, 'sitemap.xml'), sitemap)

console.log(`${templates.length} tasarım için SEO sayfası ve sitemap.xml oluşturuldu.`)
