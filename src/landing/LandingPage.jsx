import { useMemo, useState } from 'react'
import { templates } from '../templates/registry.js'
import { priceRequestText, site, whatsappLink } from '../app/site.js'
import { LanguageSwitch, useI18n } from '../app/i18n.jsx'
import { homeStructuredData, useSeo } from '../app/seo.js'
import ContactSection from './ContactSection.jsx'
import PhoneDemo from './PhoneDemo.jsx'
import TemplatePreview from './TemplatePreview.jsx'
import './landing.css'

const GROUPS = [
  ['all'], ['local', ['kapadokya', 'aegean', 'bogaz', 'iznik', 'kina', 'karakoy', 'bodrum', 'oya', 'ebru', 'sole-mare']],
  ['romantic', ['celestial', 'sakura', 'royal', 'oya', 'orangerie', 'snow-globe', 'kina']],
  ['modern', ['karakoy', 'cinema', 'b-side', 'departures', 'storybook', 'art-deco']],
  ['nature', ['autumn', 'sakura', 'kapadokya', 'orangerie', 'snow-globe', 'aegean']],
]
const FEATURED = ['kapadokya', 'bogaz', 'iznik', 'kina', 'cinema', 'celestial', 'orangerie', 'art-deco']

const COPY = {
  en: {
    nav: ['Designs', 'How it works', 'Plans', 'FAQ'], cta: 'Get pricing', eyebrow: 'Digital invitations · Designed to feel personal',
    hero: 'Your celebration, beautifully invited.', lead: 'Create an animated invitation that feels like your event—complete with schedule, location, countdown and effortless RSVPs, all in one shareable link.',
    explore: 'Find your design', talk: 'Create yours', note: 'No app · Unlimited guests · English & Turkish', live: 'Interactive preview', replay: 'Replay', full: 'Open full screen',
    trust: [[String(templates.length), 'original designs'], ['Unlimited', 'guests & RSVPs'], ['TR / EN', 'language options'], ['One link', 'easy sharing']],
    groups: ['All', 'Local stories', 'Romantic', 'Modern & playful', 'Nature & seasons'], types: ['Wedding', 'Engagement', 'Birthday', 'Baby shower', 'Graduation', 'Corporate event'],
    collection: 'Collection', designsTitle: 'Every celebration has its own atmosphere.', designsLead: 'Find yours. Open a design and experience it exactly as your guests will.', mood: 'An immersive, animated invitation', price: 'Get pricing',
    quote: '“The feeling of your celebration begins long before your guests arrive.”', quoteTop: 'For every reason to gather', quoteBottom: 'From the first tap to the final RSVP, every detail is shaped around your event.',
    experience: 'Experience', featuresTitle: 'Beautiful to open. Effortless to manage.', features: [['One link, every detail', 'Schedule, location, countdown, story and everything guests need in one place.'], ['Simple RSVP', 'Guests can reply with party size and a note in seconds.'], ['Always up to date', 'Change the time or venue without changing the link.'], ['Made for your event', 'Your names, imagery, music, language and story—thoughtfully composed.']],
    how: 'How it works', stepsTitle: 'Your invitation in three steps.', steps: [['Choose a design', 'Experience invitations exactly as your guests will.'], ['Share your details', 'Tell us the event type, date, venue, schedule and story.'], ['Send one link', 'Share by WhatsApp, email, SMS or QR code. No app required.']],
    options: 'Flexible options', plansTitle: 'Choose how personal to make it.', plansLead: 'One-time payment. No subscription and no guest limit.',
    plans: [['Signature design', 'Contact us for pricing', ['Your details in your chosen design', 'Animation, countdown, location and RSVP', 'English and Turkish', 'Personal link and QR code']], ['Tailored design', 'Priced to your brief', ['Everything in Signature', 'Colours, type and sections tailored to you', 'Your photographs, music and story', 'Multiple pages for multi-day events']], ['Bespoke experience', 'Quote on request', ['A unique opening scene', 'Custom illustration', 'A collaborative design process']]],
    faqTop: 'Good to know', faqTitle: 'Frequently asked questions', faq: [['What kinds of events are supported?', 'Weddings, engagements, birthdays, baby showers, graduations, launches, dinners and corporate events.'], ['How do I send it?', 'Share your personal link through WhatsApp, email or SMS, or use its QR code.'], ['Can I change details later?', 'Yes. Update the time, venue or schedule while the link stays the same.'], ['Where can I see RSVPs?', 'Replies, party sizes and notes are collected in your private dashboard.'], ['Can guests switch languages?', 'Yes. Invitations support Turkish and English, and more languages can be added.']],
    ask: 'Ask for pricing', footer: 'Digital invitations for every celebration.', contact: 'Contact',
  },
  tr: {
    nav: ['Tasarımlar', 'Nasıl çalışır', 'Paketler', 'SSS'], cta: 'Fiyat bilgisi al', eyebrow: 'Dijital davetiye · Size özel · Tek link',
    hero: 'Kutlamanız güzel bir davetle başlasın.', lead: 'Etkinliğinizin ruhunu taşıyan animasyonlu bir davetiye hazırlayın; program, konum, geri sayım ve kolay katılım bildirimi tek paylaşılabilir linkte buluşsun.',
    explore: 'Tasarımınızı bulun', talk: 'Sizinkini hazırlayalım', note: 'Uygulama yok · Sınırsız misafir · Türkçe & İngilizce', live: 'Etkileşimli önizleme', replay: 'Baştan oynat', full: 'Tam ekran aç',
    trust: [[String(templates.length), 'özgün tasarım'], ['Sınırsız', 'misafir ve LCV'], ['TR / EN', 'dil seçeneği'], ['Tek link', 'kolay paylaşım']],
    groups: ['Tümü', 'Yerel hikâyeler', 'Romantik', 'Modern ve eğlenceli', 'Doğa ve mevsimler'], types: ['Düğün', 'Nişan', 'Doğum günü', 'Baby shower', 'Mezuniyet', 'Kurumsal etkinlik'],
    collection: 'Koleksiyon', designsTitle: 'Her kutlamanın başka bir havası var.', designsLead: 'Sizinkini bulun. Bir tasarıma dokunun ve misafirlerinizin göreceği gibi deneyin.', mood: 'Etkileyici, animasyonlu davetiye', price: 'Fiyat bilgisi alın',
    quote: '“Kutlamanızın hissi, misafirleriniz gelmeden çok önce başlar.”', quoteTop: 'Bir araya gelmek için her sebebe', quoteBottom: 'İlk dokunuştan son katılım yanıtına kadar her ayrıntı etkinliğinizin etrafında şekillenir.',
    experience: 'Deneyim', featuresTitle: 'Güzel görünür. İşinizi de kolaylaştırır.', features: [['Tek link, tüm ayrıntılar', 'Program, konum, geri sayım, hikâye ve tüm önemli bilgiler bir arada.'], ['Kolay katılım bildirimi', 'Misafirleriniz kişi sayısı ve notuyla saniyeler içinde yanıt bırakır.'], ['Her zaman güncel', 'Saat veya mekân değişse de link aynı kalır.'], ['Etkinliğinize özel', 'İsimleriniz, görselleriniz, müziğiniz, diliniz ve hikâyeniz tasarıma işlenir.']],
    how: 'Nasıl çalışır?', stepsTitle: 'Üç adımda davetiniz hazır.', steps: [['Tasarımı seçin', 'Davetiyeleri misafirlerinizin göreceği gibi deneyin.'], ['Bilgilerinizi gönderin', 'Etkinlik türünü, tarihi, mekânı, programı ve hikâyeyi paylaşın.'], ['Tek linki paylaşın', 'WhatsApp, e-posta, SMS veya QR kodla gönderin.']],
    options: 'Esnek seçenekler', plansTitle: 'Ne kadar özel, siz karar verin.', plansLead: 'Tek seferlik ödeme. Abonelik ve misafir sınırı yok.',
    plans: [['Hazır tasarım', 'Fiyat bilgisi için bize yazın', ['Seçtiğiniz tasarım, sizin bilgilerinizle', 'Animasyon, geri sayım, konum ve LCV', 'Türkçe ve İngilizce', 'Size özel link ve QR kod']], ['Kişiye özel', 'İhtiyaca göre fiyatlandırılır', ['Hazır tasarımdaki her şey', 'Renk, yazı tipi ve bölümler size göre', 'Fotoğraflarınız, müziğiniz ve hikâyeniz', 'Çok günlü etkinlikler için ayrı sayfalar']], ['Sıfırdan deneyim', 'Teklif üzerine', ['Size özel açılış sahnesi', 'Özel illüstrasyon', 'Birlikte yürütülen tasarım süreci']]],
    faqTop: 'Merak ettikleriniz', faqTitle: 'Sık sorulanlar', faq: [['Hangi etkinlikler destekleniyor?', 'Düğün, nişan, doğum günü, baby shower, mezuniyet, lansman, özel yemek ve kurumsal etkinlikler.'], ['Nasıl gönderirim?', 'Size özel linki WhatsApp, e-posta veya SMS ile paylaşabilir ya da QR kod kullanabilirsiniz.'], ['Sonradan değiştirebilir miyim?', 'Evet. Saat, mekân veya program değişse de link aynı kalır.'], ['Yanıtları nerede görürüm?', 'Yanıtlar, kişi sayıları ve notlar size özel panelde toplanır.'], ['Dil değiştirilebilir mi?', 'Evet. Türkçe ve İngilizce desteklenir; başka diller de eklenebilir.']],
    ask: 'Fiyat sorun', footer: 'Her kutlamaya özel dijital davetiyeler.', contact: 'İletişim',
  },
}

export default function LandingPage() {
  const { locale } = useI18n(); const c = COPY[locale]
  const [active, setActive] = useState(() => templates.find((t) => t.slug === 'kapadokya') ?? templates[0]); const [group, setGroup] = useState('all')
  const shown = useMemo(() => { const slugs = GROUPS.find(([id]) => id === group)?.[1]; return slugs ? templates.filter((t) => slugs.includes(t.slug)) : templates }, [group])
  const seo = useMemo(() => ({ title: locale === 'tr' ? 'Her Kutlamaya Özel Dijital Davetiye | e-invitation' : site.defaultTitle, description: locale === 'tr' ? 'Her etkinlik için animasyonlu, çok dilli dijital davetiyeler.' : site.description, path: '/', locale, structuredData: homeStructuredData(c.faq.map(([q, a]) => ({ q, a })), locale) }), [c.faq, locale]); useSeo(seo)
  return <div className="lp">
    <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;1,6..96,400&family=Manrope:wght@400;500;600&display=swap" />
    <header className="lp-header"><a href="/" className="lp-logo"><span className="lp-logo__mark" aria-hidden="true"><i/><i/></span>{site.name}</a><nav className="lp-nav">{c.nav.map((x, i) => <a key={x} href={['#tasarimlar','#nasil','#paketler','#sss'][i]}>{x}</a>)}</nav><LanguageSwitch/><a href="#iletisim" className="lp-button lp-button--small">{c.cta}</a></header>
    <main>
      <section className="lp-hero"><div className="lp-hero__copy"><p className="lp-eyebrow">{c.eyebrow}</p><h1 className="lp-h1">{c.hero}</h1><p className="lp-lead">{c.lead}</p><div className="lp-hero__actions"><a className="lp-button" href="#tasarimlar">{c.explore}</a><a className="lp-button lp-button--ghost" href={whatsappLink(priceRequestText(active, locale))}>{c.talk}</a></div><p className="lp-hero__note">{c.note}</p></div><div className="lp-hero__demo"><div className="lp-showcase"><div className="lp-showcase__label"><span>{c.live}</span><strong>{active.name}</strong></div><PhoneDemo template={active} autoLoad replayLabel={c.replay} fullscreenLabel={c.full}/></div><div className="lp-switch" role="radiogroup" aria-label={c.live}>{FEATURED.map((s) => templates.find((t) => t.slug === s)).filter(Boolean).map((t) => <button key={t.slug} type="button" role="radio" aria-checked={t.slug === active.slug} onClick={() => setActive(t)}>{t.name}</button>)}</div></div></section>
      <ul className="lp-trust">{c.trust.map(([a,b]) => <li key={b}><strong>{a}</strong><span>{b}</span></li>)}</ul><ul className="lp-event-types">{c.types.map((x) => <li key={x}>{x}</li>)}</ul>
      <section id="tasarimlar" className="lp-section"><div className="lp-section__head"><p className="lp-eyebrow">{c.collection}</p><h2 className="lp-h2">{c.designsTitle}</h2><p className="lp-lead">{c.designsLead}</p></div><div className="lp-filters">{GROUPS.map(([id], i) => <button key={id} aria-selected={group===id} onClick={() => setGroup(id)}>{c.groups[i]}</button>)}</div><ul className="lp-grid">{shown.map((t) => <li key={t.slug}><a className="lp-card" href={`/tasarim/${t.slug}`}><TemplatePreview template={t}/><div className="lp-card__body"><h3>{t.name}</h3><p>{locale==='tr'?t.mood:c.mood}</p><span className="lp-card__price">{c.price}</span></div></a></li>)}</ul></section>
      <section className="lp-story"><p className="lp-story__kicker">{c.quoteTop}</p><blockquote>{c.quote}</blockquote><p>{c.quoteBottom}</p></section>
      <section className="lp-section lp-features"><div className="lp-section__head"><p className="lp-eyebrow">{c.experience}</p><h2 className="lp-h2">{c.featuresTitle}</h2></div><ul className="lp-features__list">{c.features.map(([a,b],i)=><li key={a}><span className="lp-feature__mark">0{i+1}</span><h3>{a}</h3><p>{b}</p></li>)}</ul></section>
      <section id="nasil" className="lp-section lp-steps"><div className="lp-section__head"><p className="lp-eyebrow">{c.how}</p><h2 className="lp-h2">{c.stepsTitle}</h2></div><ol className="lp-steps__list">{c.steps.map(([a,b])=><li key={a}><h3>{a}</h3><p>{b}</p></li>)}</ol></section>
      <section id="paketler" className="lp-section lp-plans"><div className="lp-section__head"><p className="lp-eyebrow">{c.options}</p><h2 className="lp-h2">{c.plansTitle}</h2><p className="lp-lead">{c.plansLead}</p></div><div className="lp-plans__grid">{c.plans.map(([a,b,list],i)=><article className={`lp-plan ${i===1?'lp-plan--featured':''}`} key={a}><h3>{a}</h3><p className="lp-plan__price">{b}</p><ul>{list.map(x=><li key={x}>{x}</li>)}</ul><a className="lp-button" href="#iletisim">{c.ask}</a></article>)}</div></section>
      <section id="sss" className="lp-section lp-faq"><div className="lp-section__head"><p className="lp-eyebrow">{c.faqTop}</p><h2 className="lp-h2">{c.faqTitle}</h2></div><div className="lp-faq__list">{c.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section><ContactSection templates={templates} selected={active.slug}/>
    </main><footer className="lp-footer"><div><span className="lp-logo">{site.name}</span><p>{c.footer}</p></div><nav><a href="#tasarimlar">{c.nav[0]}</a><a href="#nasil">{c.nav[1]}</a><a href="#iletisim">{c.contact}</a></nav></footer>
  </div>
}
