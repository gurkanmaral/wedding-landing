import Invitation from '../../engine/Invitation.jsx'
import { useWeddingCardFields } from '../../api/weddingCardContext'
import EbruHero from './EbruHero.jsx'
import './ebru.css'

// The cartouche carries the same date and place the intro printed on the
// sheet, so the lines do not change when the intro dissolves into the page.
function Hero({ partner1, partner2, city, place, c, lang }) {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
  const { eventDate } = useWeddingCardFields(defaults, locale)
  const printedDate = eventDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  return <EbruHero partner1={partner1} partner2={partner2} dateLabel={printedDate} place={city || place} tagline={c.tagline} />
}

// A lale ebru tulip between two combed lines.
const ornament = (
  <svg viewBox="0 0 240 40" fill="none">
    <path d="M0 22C14 16 26 28 40 22S66 16 80 22 94 26 100 22" stroke="currentColor" strokeWidth="1" />
    <path d="M240 22C226 16 214 28 200 22S174 16 160 22 146 26 140 22" stroke="currentColor" strokeWidth="1" />
    <path d="M0 26C14 20 26 32 40 26S66 20 80 26" stroke="#457b9d" strokeWidth=".8" opacity=".7" />
    <path d="M240 26C226 20 214 32 200 26S174 20 160 26" stroke="#457b9d" strokeWidth=".8" opacity=".7" />
    <path d="M120 39C120 33 119 30 120 27" stroke="#1d3557" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M120 28C111 27 106 20 107 12C108 9 109 7 110 5C112 10 115 13 120 14C125 13 128 10 130 5C131 7 132 9 133 12C134 20 129 27 120 28Z" fill="#e63946" />
    <path d="M120 25C114 24 111 19 112 14C114 17 117 19 120 19C123 19 126 17 128 14C129 19 126 24 120 25Z" fill="#f1faee" />
    <path d="M120 22C117 18 116 10 120 1C124 10 123 18 120 22Z" fill="#e63946" />
    <path d="M120 19C119 15 119 10 120 6C121 10 121 15 120 19Z" fill="#f1c453" />
    <circle cx="100" cy="22" r="2.2" fill="#f1c453" />
    <circle cx="140" cy="22" r="2.2" fill="#f1c453" />
  </svg>
)

const content = {
  tr: {
    tagline: 'Suyun üstünde bir kez oluşan desen gibi',
    welcome:
      'Ebru, su üstünde yalnızca bir kez oluşan bir desendir; aynısı bir daha asla yapılamaz. Bizim hikâyemiz de öyle. Bu davetiyedeki desen yalnızca size ait; o günü de sizinle birlikte, bir kez ve en güzel hâliyle yaşamak istiyoruz.',
    story: [
      { when: '2018', title: 'Üsküdar’da bir ebru atölyesi', text: '{partner1} ve {partner2} aynı teknenin başında tanıştı. İkisinin boyası birbirine karıştı; ortaya çıkan desen hâlâ duvarımızda asılı.' },
      { when: '2022', title: 'Kuzguncuk’ta bir ev', text: 'Mor salkımlı bir sokakta, kapısı yeşil bir eve birlikte taşındık.' },
      { when: '2026', title: 'Evet', text: 'Kız Kulesi’ne karşı, akşam ezanı okunurken “evet” dedik.' },
    ],
    schedule: [
      { time: '17:00', title: 'Karşılama', text: 'Bahçede şerbet ve limonata. Ebru ustamızın teknesinde kendi kâğıdınızı da batırabilirsiniz.' },
      { time: '18:00', title: 'Nikâh', text: '{venue} rıhtımında, Boğaz’a karşı.' },
      { time: '19:00', title: 'Akşam yemeği', text: 'Deniz kıyısında, mevsimin lezzetleriyle uzun bir sofra.' },
      { time: '21:00', title: 'İlk dans', text: 'Işıklar yandığında pistte buluşalım.' },
      { time: '22:00', title: 'Gece', text: 'Boğaz’ın üstünde, müzik ve dans gece yarısını geçene kadar.' },
    ],
    venueNote: 'Üsküdar ve Beşiktaş iskelelerinden düzenli servisimiz olacak. Akşamları Boğaz serinler; yanınıza ince bir şal alın.',
    dressCode: {
      title: 'Ebru tonları',
      text: 'Lacivert, mercan, safran ve çelik mavisi; ya da hepsini taşıyan desenli bir ipek. Rıhtım taş zeminli, rahat ayakkabıları tercih edin.',
      swatches: ['#1d3557', '#e63946', '#f1c453', '#457b9d', '#f1faee'],
    },
    gifts: {
      title: 'En güzel hediye, aramızda olmanız',
      text: 'Takı ya da hediye düşünürseniz, yeni yuvamız için katkınızı aşağıdaki hesaba iletebilirsiniz.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Her ebru bir kez olur; bizimki de öyle.',
  },
  en: {
    tagline: 'Like a pattern that forms on water only once',
    welcome:
      'Ebru is a pattern that forms on water only once; it can never be made the same way again. So is our story. The pattern on this invitation belongs to you alone, and we would love to live that one day with you, once and at its most beautiful.',
    story: [
      { when: '2018', title: 'A marbling class in Üsküdar', text: '{partner1} and {partner2} met over the same marbling tray. Their colours ran into each other, and that sheet still hangs on our wall.' },
      { when: '2022', title: 'A house in Kuzguncuk', text: 'We moved into a house with a green door on a street full of wisteria.' },
      { when: '2026', title: 'Yes', text: 'Facing the Maiden’s Tower, as the evening call to prayer rang out, we said yes.' },
    ],
    schedule: [
      { time: '17:00', title: 'Welcome', text: 'Sherbet and lemonade in the garden. Dip your own sheet in our ebru master’s tray.' },
      { time: '18:00', title: 'Ceremony', text: 'On the quay of {venue}, facing the Bosphorus.' },
      { time: '19:00', title: 'Dinner', text: 'A long table by the water with the flavours of the season.' },
      { time: '21:00', title: 'First dance', text: 'When the lights come on, meet us on the floor.' },
      { time: '22:00', title: 'Night', text: 'Music and dancing above the Bosphorus until well past midnight.' },
    ],
    venueNote: 'Shuttles will run regularly from the Üsküdar and Beşiktaş piers. The Bosphorus gets cool in the evening, so bring a light wrap.',
    dressCode: {
      title: 'Marbling tones',
      text: 'Navy, coral, saffron and steel blue, or a patterned silk that carries them all. The quay is stone, so comfortable shoes are best.',
      swatches: ['#1d3557', '#e63946', '#f1c453', '#457b9d', '#f1faee'],
    },
    gifts: {
      title: 'Your presence is our gift',
      text: 'If you would like to give something, a contribution to our new home can be sent to the account below.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Every ebru happens only once, and so does ours.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-05-15T18:00:00+03:00',
  venue: 'Adile Sultan Kasrı',
  city: 'Üsküdar, İstanbul',
  address: 'Kandilli Mahallesi, Kandilli Kız Lisesi Sokak, Kandilli',
  rsvpDeadline: '3 Nisan 2027',
}

const theme = {
  className: 'theme-ebru',
  fontsHref: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Mulish:wght@400;600&display=swap',
  ornament,
  Hero,
}

export default function EbruPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
