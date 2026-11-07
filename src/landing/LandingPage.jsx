import { useMemo, useState } from 'react'
import { templates } from '../templates/registry.js'
import { priceRequestText, site, whatsappLink } from '../app/site.js'
import { homeStructuredData, useSeo } from '../app/seo.js'
import ContactSection from './ContactSection.jsx'
import PhoneDemo from './PhoneDemo.jsx'
import TemplatePreview from './TemplatePreview.jsx'
import './landing.css'

const COLLECTIONS = [
  { id: 'all', label: 'Tümü' },
  { id: 'turkiye', label: 'Türkiye’den', slugs: ['kapadokya', 'aegean', 'bogaz', 'iznik', 'kina', 'karakoy', 'bodrum', 'oya', 'ebru', 'sole-mare'] },
  { id: 'romantic', label: 'Romantik', slugs: ['celestial', 'sakura', 'royal', 'oya', 'orangerie', 'snow-globe', 'kina'] },
  { id: 'modern', label: 'Modern ve eğlenceli', slugs: ['karakoy', 'cinema', 'b-side', 'departures', 'storybook', 'art-deco'] },
  { id: 'nature', label: 'Doğa ve mevsimler', slugs: ['autumn', 'sakura', 'kapadokya', 'orangerie', 'snow-globe', 'aegean'] },
]

// the designs offered in the hero phone, strongest first
const FEATURED = ['kapadokya', 'bogaz', 'iznik', 'kina', 'cinema', 'celestial', 'orangerie', 'art-deco']

const FEATURES = [
  { mark: '01', title: 'Tek link, eksiksiz davet', text: 'Program, konum, geri sayım, hikâyeniz ve tüm önemli bilgiler bir arada.' },
  { mark: '02', title: 'Kolay katılım bildirimi', text: 'Misafirleriniz kişi sayısı ve notuyla saniyeler içinde LCV yanıtı bırakır.' },
  { mark: '03', title: 'Her zaman güncel', text: 'Saat veya mekân değiştiğinde link aynı kalır; misafirleriniz güncel bilgiyi görür.' },
  { mark: '04', title: 'Tamamen size ait', text: 'İsimleriniz, fotoğraflarınız, müziğiniz ve hikâyeniz tasarıma zarifçe işlenir.' },
]

const STEPS = [
  { title: 'Tasarımı seçin', text: 'Davetiyeleri telefonda, misafirlerinizin göreceği gibi deneyin.' },
  { title: 'Bilgilerinizi gönderin', text: 'İsimler, tarih, mekân, program ve hikâyeniz. Size özel bir önizleme linki hazırlıyoruz.' },
  { title: 'Linki paylaşın', text: 'WhatsApp’tan, SMS’le ya da basılı kartınızdaki QR kodla. Uygulama gerekmez.' },
]

const FAQ = [
  { q: 'Davetiyeyi misafirlerime nasıl gönderirim?', a: 'Size özel bir link veriyoruz (ör. /kapadokya/ayse-mehmet). WhatsApp, SMS veya e-postayla paylaşabilir, basılı davetiyenize QR kod olarak ekleyebilirsiniz.' },
  { q: 'Sonradan değişiklik yapabilir miyim?', a: 'Evet. Saat, mekân ya da program değişirse bilgileri güncelliyoruz; link aynı kalır, misafirleriniz her zaman güncel hâlini görür.' },
  { q: 'Katılım yanıtlarını nereden görürüm?', a: 'Misafirlerinizin yanıtları, kişi sayıları ve notları size özel panelde toplanır; isterseniz Excel’e aktarabilirsiniz.' },
  { q: 'Yabancı misafirlerimiz var, İngilizce olur mu?', a: 'Tüm davetiyelerde Türkçe ve İngilizce arasında tek dokunuşla geçiş var.' },
  { q: 'Tasarımda değişiklik isteyebilir miyim?', a: 'Renkler, yazı tipleri ve bölümler size göre uyarlanabilir. Tamamen size özel bir tasarım için de bize yazın.' },
]

export default function LandingPage() {
  const [active, setActive] = useState(() => templates.find((t) => t.slug === 'kapadokya') ?? templates[0])
  const [collection, setCollection] = useState('all')
  const shown = useMemo(() => {
    const group = COLLECTIONS.find((c) => c.id === collection)
    return group?.slugs ? templates.filter((t) => group.slugs.includes(t.slug)) : templates
  }, [collection])
  const seo = useMemo(
    () => ({
      title: site.defaultTitle,
      description: site.description,
      path: '/',
      structuredData: homeStructuredData(FAQ),
    }),
    [],
  )
  useSeo(seo)
  return (
    <div className="lp">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600&display=swap"
      />

      <header className="lp-header">
        <a href="/" className="lp-logo">
          <span className="lp-logo__mark" aria-hidden="true"><i /><i /></span>
          <span>{site.name}</span>
        </a>
        <nav aria-label="Ana menü" className="lp-nav">
          <a href="#tasarimlar">Tasarımlar</a>
          <a href="#nasil">Nasıl çalışır</a>
          <a href="#paketler">Paketler</a>
          <a href="#sss">SSS</a>
        </nav>
        <a href="#iletisim" className="lp-button lp-button--small">
          Fiyat bilgisi al
        </a>
      </header>

      <main>
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__copy">
            <p className="lp-eyebrow">Size özel · Animasyonlu · Tek link</p>
            <h1 id="hero-title" className="lp-h1">
              Hikâyenize yakışan dijital düğün davetiyesi.
            </h1>
            <p className="lp-lead">
              Misafirleriniz linke dokunduğu anda düğününüzün dünyasına girsin. Sinematik bir açılış, program, konum,
              geri sayım ve katılım formu tek bir zarif sayfada.
            </p>
            <div className="lp-hero__actions">
              <a href="#tasarimlar" className="lp-button">
                Tasarımları keşfet
              </a>
              <a href={whatsappLink(priceRequestText(active))} className="lp-button lp-button--ghost" target="_blank" rel="noopener noreferrer">
                WhatsApp’tan konuşalım
              </a>
            </div>
            <p className="lp-hero__note">Uygulama gerekmez · WhatsApp’tan kolayca paylaşılır</p>
          </div>

          <div className="lp-hero__demo">
            <div className="lp-showcase">
              <div className="lp-showcase__label">
                <span>Canlı davetiye</span>
                <strong>{active.name}</strong>
              </div>
              <PhoneDemo template={active} autoLoad />
            </div>
            <div className="lp-switch" role="radiogroup" aria-label="Önizlenecek tasarım">
              {FEATURED.map((slug) => templates.find((t) => t.slug === slug))
                .filter(Boolean)
                .map((t) => (
                  <button key={t.slug} type="button" role="radio" aria-checked={t.slug === active.slug} onClick={() => setActive(t)}>
                    {t.name}
                  </button>
                ))}
            </div>
          </div>
        </section>

        <ul className="lp-trust" aria-label="Hizmet özellikleri">
          <li><strong>{templates.length}</strong><span>özgün tasarım</span></li>
          <li><strong>Sınırsız</strong><span>misafir ve LCV</span></li>
          <li><strong>TR / EN</strong><span>dil seçeneği</span></li>
          <li><strong>Tek link</strong><span>kolay paylaşım</span></li>
        </ul>

        <section id="tasarimlar" className="lp-section" aria-labelledby="designs-title">
          <div className="lp-section__head">
            <p className="lp-eyebrow">Koleksiyon</p>
            <h2 id="designs-title" className="lp-h2">
              Her aşkın başka bir havası var.
            </h2>
            <p className="lp-lead">Sizinkini bulun. Bir tasarıma dokunun ve misafirlerinizin göreceği gibi canlı deneyin.</p>
          </div>
          <div className="lp-filters" role="tablist" aria-label="Koleksiyonlar">
            {COLLECTIONS.map((c) => (
              <button key={c.id} type="button" role="tab" aria-selected={collection === c.id} onClick={() => setCollection(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <ul className="lp-grid">
            {shown.map((t) => (
              <li key={t.slug}>
                <a className="lp-card" href={`/tasarim/${t.slug}`}>
                  <TemplatePreview template={t} />
                  <div className="lp-card__body">
                    <h3>{t.name}</h3>
                    <p>{t.mood}</p>
                    <span className="lp-card__price">Fiyat bilgisi alın</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="lp-story" aria-label="Dijital davetiye deneyimi">
          <p className="lp-story__kicker">Bir davetiyeden daha fazlası</p>
          <blockquote>
            “Düğününüzün hissi, misafirleriniz mekâna gelmeden çok önce başlar.”
          </blockquote>
          <p>İlk dokunuştan son katılım yanıtına kadar, her ayrıntıyı sizin hikâyeniz etrafında tasarlıyoruz.</p>
        </section>

        <section className="lp-section lp-features" aria-labelledby="features-title">
          <div className="lp-section__head">
            <p className="lp-eyebrow">Deneyim</p>
            <h2 id="features-title" className="lp-h2">
              Güzel görünür. İşinizi de kolaylaştırır.
            </h2>
          </div>
          <ul className="lp-features__list">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <span className="lp-feature__mark" aria-hidden="true">{f.mark}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="nasil" className="lp-section lp-steps" aria-labelledby="steps-title">
          <div className="lp-section__head">
            <p className="lp-eyebrow">Nasıl çalışır?</p>
            <h2 id="steps-title" className="lp-h2">
              Üç adımda davetiniz hazır.
            </h2>
          </div>
          <ol className="lp-steps__list">
            {STEPS.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="paketler" className="lp-section lp-plans" aria-labelledby="plans-title">
          <div className="lp-section__head">
            <p className="lp-eyebrow">Size uygun seçenekler</p>
            <h2 id="plans-title" className="lp-h2">
              Ne kadar özel, siz karar verin.
            </h2>
            <p className="lp-lead">Tek seferlik ödeme. Abonelik yok, misafir sınırı yok.</p>
          </div>
          <div className="lp-plans__grid">
            <article className="lp-plan">
              <h3>Hazır tasarım</h3>
              <p className="lp-plan__price">Fiyat bilgisi için bize yazın</p>
              <ul>
                <li>Seçtiğiniz tasarım, sizin bilgilerinizle</li>
                <li>Açılış animasyonu, geri sayım, konum, LCV</li>
                <li>Türkçe ve İngilizce</li>
                <li>Size özel link ve QR kod</li>
              </ul>
              <a className="lp-button lp-button--ghost" href="#iletisim">
                Fiyat sor
              </a>
            </article>
            <article className="lp-plan lp-plan--featured">
              <h3>Kişiye özel</h3>
              <p className="lp-plan__price">Tasarıma göre fiyatlandırılır</p>
              <ul>
                <li>Hazır tasarımdaki her şey</li>
                <li>Renk, yazı tipi ve bölümler size göre</li>
                <li>Fotoğraflarınız ve hikâyeniz</li>
                <li>Kına, nikâh ve düğün için ayrı sayfalar</li>
              </ul>
              <a className="lp-button" href="#iletisim">
                Teklif alın
              </a>
            </article>
            <article className="lp-plan">
              <h3>Sıfırdan tasarım</h3>
              <p className="lp-plan__price">Teklif üzerine</p>
              <ul>
                <li>Size özel açılış sahnesi</li>
                <li>Mekânınıza ya da hikâyenize özel illüstrasyon</li>
                <li>Birebir tasarım süreci</li>
              </ul>
              <a className="lp-button lp-button--ghost" href="#iletisim">
                Görüşelim
              </a>
            </article>
          </div>
        </section>

        <section id="sss" className="lp-section lp-faq" aria-labelledby="faq-title">
          <div className="lp-section__head">
            <p className="lp-eyebrow">Merak ettikleriniz</p>
            <h2 id="faq-title" className="lp-h2">
              Sık sorulanlar
            </h2>
          </div>
          <div className="lp-faq__list">
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <ContactSection templates={templates} selected={active.slug} />
      </main>

      <footer className="lp-footer">
        <div>
          <span className="lp-logo">{site.name}</span>
          <p>Hikâyenize yakışan dijital düğün davetiyeleri.</p>
        </div>
        <nav aria-label="Alt menü">
          <a href="#tasarimlar">Tasarımlar</a>
          <a href="#nasil">Nasıl çalışır?</a>
          <a href="#iletisim">İletişim</a>
        </nav>
      </footer>

      {site.whatsapp ? (
        <a className="lp-whatsapp" href={whatsappLink(priceRequestText(active))} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp’tan fiyat sorun">
          WhatsApp
        </a>
      ) : null}
    </div>
  )
}
