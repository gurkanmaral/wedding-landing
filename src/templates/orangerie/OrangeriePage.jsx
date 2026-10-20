import Invitation from '../../engine/Invitation.jsx'
import GlasshouseHero from './GlasshouseHero.jsx'
import { spriteURL } from './glasshouseArt.js'
import './orangerie.css'

// Short date for the brass plaque: drop the weekday from the long label.
function plaqueDate(label) {
  const parts = label.replace(/,/g, '').split(' ')
  if (parts.length > 3 && !/\d/.test(parts[0])) parts.shift()
  else if (parts.length > 3 && !/\d/.test(parts[parts.length - 1])) parts.pop()
  return parts.join(' ')
}

// Botanical engravings for the sections, generated once as CSS background images.
let sprites = null
function spriteStyle() {
  if (!sprites) {
    sprites = `.theme-orangerie{--org-frond:${spriteURL('frond', 220)};--org-begonia:${spriteURL('begonia', 260)};--org-monstera:${spriteURL('monstera', 320)};--org-sprig:${spriteURL('sprig', 420)}}`
  }
  return sprites
}

function Hero({ partner1, partner2, dateLabel, place, c }) {
  return (
    <header className="org-hero">
      <style>{spriteStyle()}</style>
      <GlasshouseHero names={[partner1, partner2]} date={plaqueDate(dateLabel)} />
      <div className="org-hero-veil" aria-hidden="true" />
      <div className="org-hero-copy">
        <p className="org-eyebrow">{c.tagline}</p>
        <h1 className="org-names">
          <span>{partner1}</span>
          <span className="org-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
        <p className="org-date">{dateLabel}</p>
        <p className="org-place">{place}</p>
      </div>
    </header>
  )
}

// A fern sprig with a begonia bloom: the divider under every heading.
const leaflets = (() => {
  let d = ''
  for (let i = 0; i < 9; i += 1) {
    const x = 104 - i * 10
    const s = 7 - i * 0.55
    d += `M${x} 20 q-${s * 0.6} -${s} -${s * 1.4} -${s * 0.9} M${x} 20 q-${s * 0.6} ${s} -${s * 1.4} ${s * 0.9} `
  }
  return d
})()

const ornament = (
  <svg viewBox="0 0 240 40" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
    <path d="M14 20 C50 21 80 19 106 20 M134 20 C160 19 190 21 226 20" />
    <path d={leaflets} />
    <path d={leaflets} transform="matrix(-1 0 0 1 240 0)" />
    <g fill="#e8a0a0" stroke="currentColor" strokeWidth="0.7">
      <ellipse cx="114" cy="20" rx="6" ry="4.6" />
      <ellipse cx="126" cy="20" rx="6" ry="4.6" />
      <ellipse cx="120" cy="13.5" rx="3.2" ry="4.4" />
      <ellipse cx="120" cy="26.5" rx="3.2" ry="4.4" />
    </g>
    <circle cx="120" cy="20" r="2" fill="#d9a93c" stroke="none" />
  </svg>
)

const content = {
  en: {
    tagline: 'Among the ferns, at first light',
    welcome:
      'Spring arrives early under glass. On a late-April afternoon, among the palms and tree ferns of Kew, we will promise each other a lifetime — and we would love you to be there to see it.',
    story: [
      { when: '2019', title: 'A seed', text: '{partner1} and {partner2} met sheltering from a downpour in the Palm House, both pretending to read the same plant label for twenty minutes.' },
      { when: '2022', title: 'Taking root', text: 'A first flat in Richmond, a windowsill of stubborn begonias and one maidenhair fern that has somehow survived everything.' },
      { when: '2026', title: 'In bloom', text: 'Back under the same dripping glass, {partner1} asked — and {partner2} said yes before the question was finished.' },
    ],
    schedule: [
      { time: '13:30', title: 'Arrivals', text: 'Elderflower spritz on the Orangery lawn. The gates open at one.' },
      { time: '14:00', title: 'The ceremony', text: 'Under the white arches of {venue}.' },
      { time: '15:00', title: 'The garden hour', text: 'Drinks, lawn games and a wander through the Temperate House.' },
      { time: '17:30', title: 'Wedding breakfast', text: 'One long table, the best of the spring and speeches kept mercifully short.' },
      { time: '20:00', title: 'Dancing', text: 'Under strings of lights until the gardens send us home at midnight.' },
    ],
    venueNote:
      'Kew Gardens station (District line and Overground) is a ten-minute walk from Victoria Gate. The paths are gravel and lawn, so leave the stilettos at home.',
    dressCode: {
      title: 'Garden formal',
      text: 'Think sage, fern, blush and cream. Light layers: the glasshouse is warm, the lawn a little less so.',
      swatches: ['#2f4a3a', '#a7c4a0', '#f2efe6', '#e8a0a0', '#b8860b'],
    },
    gifts: {
      title: 'Seeds for our first garden',
      text: 'Your company is the gift. If you would like to give something more, a contribution toward the garden of our first home will grow into something lovely.',
      holder: 'Jane & Joe',
      iban: 'GB00 0000 0000 0000 0000 00',
    },
    quote: 'Love, like a glasshouse fern, grows best with warmth and time.',
  },
  tr: {
    tagline: 'İlk ışıkta, eğreltiotlarının arasında',
    welcome:
      'Camın altında bahar erken gelir. Nisan sonunda bir öğleden sonra, Kew’in palmiyeleri ve ağaç eğreltileri arasında birbirimize ömür boyu söz vereceğiz; o an yanımızda olmanızı çok isteriz.',
    story: [
      { when: '2019', title: 'İlk tohum', text: '{partner1} ile {partner2}, Palmiye Serası’nda bir sağanaktan saklanırken tanıştı; yirmi dakika boyunca aynı bitki etiketini okuyormuş gibi yaptılar.' },
      { when: '2022', title: 'Kök salmak', text: 'Richmond’da ilk ev, inatçı begonyalarla dolu bir pencere önü ve her şeye rağmen yaşamayı sürdüren tek bir saçaklı eğrelti.' },
      { when: '2026', title: 'Çiçek açmak', text: 'Yine aynı damlayan camın altında {partner1} sordu; {partner2} soru bitmeden “evet” dedi.' },
    ],
    schedule: [
      { time: '13:30', title: 'Karşılama', text: 'Orangery çimeninde mürver çiçeği şerbeti. Kapılar saat birde açılıyor.' },
      { time: '14:00', title: 'Nikâh', text: '{venue} içinde, beyaz demir kemerlerin altında.' },
      { time: '15:00', title: 'Bahçe saati', text: 'İçecekler, çim oyunları ve Ilıman Sera’da bir gezinti.' },
      { time: '17:30', title: 'Akşam yemeği', text: 'Uzun bir masa, baharın en güzel lezzetleri ve kısa tutacağımıza söz verdiğimiz konuşmalar.' },
      { time: '20:00', title: 'Dans', text: 'Işık zincirlerinin altında, bahçeler bizi gece yarısı evlerimize gönderene dek.' },
    ],
    venueNote:
      'Kew Gardens istasyonu (District hattı ve Overground) Victoria Gate’e on dakika yürüme mesafesinde. Yollar çakıl ve çim; ince topuklu ayakkabıları evde bırakın.',
    dressCode: {
      title: 'Bahçe şıklığı',
      text: 'Adaçayı, eğrelti yeşili, pudra pembesi ve krem tonlarını düşünün. Sera sıcak, çimenler biraz serin; ince katmanlar en iyisi.',
      swatches: ['#2f4a3a', '#a7c4a0', '#f2efe6', '#e8a0a0', '#b8860b'],
    },
    gifts: {
      title: 'İlk bahçemiz için tohumlar',
      text: 'En güzel hediye varlığınız. Yine de bir şey yapmak isterseniz, ilk evimizin bahçesine katkınız orada çok güzel bir şeye dönüşecek.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Sevgi de seradaki bir eğrelti gibidir: sıcaklık ve zamanla büyür.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-04-24T14:00:00+01:00',
  venue: 'The Orangery, Kew Gardens',
  city: 'Kew, London',
  address: 'Royal Botanic Gardens, Kew, Richmond TW9 3AE',
  rsvpDeadline: '13 March 2027',
}

const theme = {
  className: 'theme-orangerie',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Gloock&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Pinyon+Script&display=swap',
  ornament,
  Hero,
}

export default function OrangeriePage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="en" />
}
