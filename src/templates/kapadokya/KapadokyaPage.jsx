import Invitation from '../../engine/Invitation.jsx'
import KapadokyaHero from './KapadokyaHero.jsx'
import './kapadokya.css'

function Hero({ partner1, partner2, dateLabel, place, c }) {
  return (
    <KapadokyaHero>
      <div className="kap-hero-copy">
        <p className="kap-eyebrow">{c.tagline}</p>
        <h1 className="kap-names">
          <span>{partner1}</span>
          <span className="kap-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
        <p className="kap-date">{dateLabel}</p>
        <p className="kap-place">{place}</p>
      </div>
    </KapadokyaHero>
  )
}

const ornament = (
  <svg viewBox="0 0 220 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M0 12 H86 M134 12 H220" />
    <path d="M110 3 C100 3 96 10 96 14 C96 18 102 21 110 21 C118 21 124 18 124 14 C124 10 120 3 110 3Z" />
    <path d="M104 21 L106 24 H114 L116 21" />
  </svg>
)

const content = {
  tr: {
    tagline: 'Göreme’de gün doğarken',
    welcome: 'Balonlar havalanırken, peri bacalarının arasında hayatımızın en güzel sabahını sizinle paylaşmak istiyoruz.',
    story: [
      { when: '2019', title: 'İlk karşılaşma', text: '{partner1} ve {partner2} bir arkadaş yemeğinde tanıştı; sohbet sabaha kadar sürdü.' },
      { when: '2023', title: 'İlk balon', text: 'Kapadokya’da şafakta bindiğimiz ilk balonda bu günü hayal ettik.' },
      { when: '2026', title: 'Evet', text: 'Aynı vadide, gün doğarken “evet” dedik.' },
    ],
    schedule: [
      { time: '06:00', title: 'Balon kalkışı', text: 'Şafakta Göreme vadisinden birlikte havalanıyoruz (isteğe bağlı).' },
      { time: '16:30', title: 'Karşılama', text: '{venue} terasında ikram ve müzik.' },
      { time: '17:30', title: 'Nikâh', text: 'Gün batımına karşı, vadiye bakan terasta.' },
      { time: '19:30', title: 'Akşam yemeği', text: 'Uzun masalar, mum ışığı ve yerel lezzetler.' },
      { time: '22:00', title: 'Dans', text: 'Yıldızların altında, gece boyunca.' },
    ],
    venueNote: 'Kayseri ve Nevşehir havalimanlarından servis düzenlenecektir. Akşam serinliği için yanınıza bir şal alın.',
    dressCode: { title: 'Toprak tonları', text: 'Terakota, krem ve gün batımı renkleri. Taş zeminler için rahat ayakkabılar öneririz.', swatches: ['#e07a5f', '#f4c9a8', '#f2e8dc', '#3d405b', '#c9a227'] },
    gifts: { title: 'En güzel hediye varlığınız', text: 'Yine de bir hediye düşünürseniz yeni evimiz için katkınızı aşağıdaki hesaba gönderebilirsiniz.', holder: 'Jane & Joe', iban: 'TR00 0000 0000 0000 0000 0000 00' },
    quote: 'Gökyüzü kadar geniş bir sevgiyle.',
  },
  en: {
    tagline: 'As the sun rises over Göreme',
    welcome: 'As the balloons lift off between the fairy chimneys, we would love to share the most beautiful morning of our lives with you.',
    story: [
      { when: '2019', title: 'We met', text: '{partner1} and {partner2} met at a friends’ dinner and talked until sunrise.' },
      { when: '2023', title: 'First flight', text: 'On our first balloon ride over Cappadocia we dreamed about this day.' },
      { when: '2026', title: 'Yes', text: 'In the same valley, at dawn, we said yes.' },
    ],
    schedule: [
      { time: '06:00', title: 'Balloon flight', text: 'We lift off together from Göreme valley at dawn (optional).' },
      { time: '16:30', title: 'Welcome', text: 'Drinks and music on the terrace at {venue}.' },
      { time: '17:30', title: 'Ceremony', text: 'Facing the sunset on the valley terrace.' },
      { time: '19:30', title: 'Dinner', text: 'Long tables, candlelight and local flavours.' },
      { time: '22:00', title: 'Dancing', text: 'Under the stars, all night long.' },
    ],
    venueNote: 'Shuttles will run from Kayseri and Nevşehir airports. Evenings get cool, so bring a wrap.',
    dressCode: { title: 'Earth tones', text: 'Terracotta, cream and sunset shades. Comfortable shoes for the stone terraces.', swatches: ['#e07a5f', '#f4c9a8', '#f2e8dc', '#3d405b', '#c9a227'] },
    gifts: { title: 'Your presence is our gift', text: 'If you would like to give something, a contribution to our new home would mean the world.', holder: 'Jane & Joe', iban: 'TR00 0000 0000 0000 0000 0000 00' },
    quote: 'With a love as wide as the sky.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-05-22T17:30:00+03:00',
  venue: 'Argos in Cappadocia',
  city: 'Uçhisar, Nevşehir',
  address: 'Argos in Cappadocia, Uçhisar',
  rsvpDeadline: '10 Nisan 2027',
}

const theme = {
  className: 'theme-kapadokya',
  fontsHref: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@400;500&family=Great+Vibes&display=swap',
  ornament,
  Hero,
}

export default function KapadokyaPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
