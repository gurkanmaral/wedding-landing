import { useMemo, useState } from 'react'
import { templates } from '../templates/registry.js'
import { site, whatsappLink } from '../app/site.js'
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
  { title: 'Dokunarak açılan giriş', text: 'Her tasarımın kendine özgü bir açılışı var: kayan yıldız, yükselen balon, açan gül, aralanan paravan.' },
  { title: 'Katılım bildirimi (LCV)', text: 'Misafirleriniz kişi sayısı ve notuyla birlikte tek dokunuşla yanıt verir. Yanıtlar size ulaşır.' },
  { title: 'Geri sayım ve takvim', text: 'Büyük güne kalan süre canlı akar. Misafirler tarihi tek tuşla takvimlerine ekler.' },
  { title: 'Konum ve yol tarifi', text: 'Mekânın haritası sayfada açılır; yol tarifi doğrudan Google Haritalar’a gider.' },
  { title: 'Türkçe ve İngilizce', text: 'Yabancı misafirleriniz için davetiye tek dokunuşla İngilizceye geçer.' },
  { title: 'Hediye ve IBAN', text: 'Hediye notunuz ve IBAN bilginiz kopyalanabilir şekilde, zarif bir bölümde yer alır.' },
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
  const fromPrice = Math.min(...templates.map((t) => t.price))

  return (
    <div className="lp">
      <link
        rel="stylesheet"
        precedence="default"
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600&display=swap"
      />

      <header className="lp-header">
        <a href="/" className="lp-logo">
          {site.name}
        </a>
        <nav aria-label="Ana menü" className="lp-nav">
          <a href="#tasarimlar">Tasarımlar</a>
          <a href="#nasil">Nasıl çalışır</a>
          <a href="#paketler">Paketler</a>
          <a href="#sss">SSS</a>
        </nav>
        <a href="#iletisim" className="lp-button lp-button--small">
          Davetiyeni oluştur
        </a>
      </header>

      <main>
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__copy">
            <h1 id="hero-title" className="lp-h1">
              Davetiyeniz açıldığı an düğününüz başlasın.
            </h1>
            <p className="lp-lead">
              Misafirleriniz linke dokunduğunda size özel bir açılış izler; ardından geri sayım, program, konum ve katılım
              formu tek sayfada karşılar. {templates.length} tasarım, Türkçe ve İngilizce.
            </p>
            <div className="lp-hero__actions">
              <a href="#tasarimlar" className="lp-button">
                Tasarımları keşfet
              </a>
              <a href={whatsappLink()} className="lp-button lp-button--ghost" target={site.whatsapp ? '_blank' : undefined} rel="noopener noreferrer">
                Bize yazın
              </a>
            </div>
            <ul className="lp-hero__facts" aria-label="Öne çıkanlar">
              <li>
                <strong>{templates.length}</strong> tasarım
              </li>
              <li>
                <strong>TR / EN</strong> dil seçeneği
              </li>
              <li>
                <strong>Sınırsız</strong> misafir
              </li>
            </ul>
          </div>

          <div className="lp-hero__demo">
            <PhoneDemo template={active} autoLoad />
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

        <section id="tasarimlar" className="lp-section" aria-labelledby="designs-title">
          <div className="lp-section__head">
            <h2 id="designs-title" className="lp-h2">
              Her biri ayrı bir dünya
            </h2>
            <p className="lp-lead">Bir tasarıma dokunun; misafirlerinizin göreceği gibi telefonda açın.</p>
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
                    <span className="lp-card__price">${t.price}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="lp-section lp-features" aria-labelledby="features-title">
          <div className="lp-section__head">
            <h2 id="features-title" className="lp-h2">
              Bir davetiyeden fazlası
            </h2>
          </div>
          <ul className="lp-features__list">
            {FEATURES.map((f) => (
              <li key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="nasil" className="lp-section lp-steps" aria-labelledby="steps-title">
          <div className="lp-section__head">
            <h2 id="steps-title" className="lp-h2">
              Üç adımda hazır
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
            <h2 id="plans-title" className="lp-h2">
              Paketler
            </h2>
            <p className="lp-lead">Tek seferlik ödeme. Abonelik yok, misafir sınırı yok.</p>
          </div>
          <div className="lp-plans__grid">
            <article className="lp-plan">
              <h3>Hazır tasarım</h3>
              <p className="lp-plan__price">${fromPrice}’dan başlayan</p>
              <ul>
                <li>Seçtiğiniz tasarım, sizin bilgilerinizle</li>
                <li>Açılış animasyonu, geri sayım, konum, LCV</li>
                <li>Türkçe ve İngilizce</li>
                <li>Size özel link ve QR kod</li>
              </ul>
              <a className="lp-button lp-button--ghost" href="#iletisim">
                Başlayalım
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
        <span className="lp-logo">{site.name}</span>
        <p>Açıldığı an başlayan dijital düğün davetiyeleri.</p>
      </footer>

      {site.whatsapp ? (
        <a className="lp-whatsapp" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp’tan yazın">
          WhatsApp
        </a>
      ) : null}
    </div>
  )
}
