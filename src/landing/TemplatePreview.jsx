// Phone-sized screenshots of each template, keyed by slug; templates without one show their colours and name.
const previews = Object.fromEntries(
  Object.entries(import.meta.glob('./previews/*.jpg', { eager: true, import: 'default' })).map(([path, url]) => [
    path.match(/([\w-]+)\.jpg$/)[1],
    url,
  ]),
)

export default function TemplatePreview({ template }) {
  const src = previews[template.slug]
  return (
    <div className="lp-card__media" style={{ background: template.intro.bg }}>
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="lp-card__fallback">{template.name}</span>}
    </div>
  )
}
