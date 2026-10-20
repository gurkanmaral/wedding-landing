import Invitation from '../../engine/Invitation.jsx'
import WinterHero from './WinterHero.jsx'
import './snow-globe.css'

function Snowflake() {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      {[0, 60, 120].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -10V10M-3 -7.5L0 -5L3 -7.5M-3 7.5L0 5L3 7.5" />
        </g>
      ))}
    </svg>
  )
}

function Hero({ partner1, partner2, dateLabel, place, c }) {
  return (
    <header className="sng-hero">
      <WinterHero />
      <div className="sng-hero-veil" aria-hidden="true" />
      <div className="sng-hero-copy">
        <p className="sng-eyebrow">{c.tagline}</p>
        <h1 className="sng-names">
          <span>{partner1}</span>
          <span className="sng-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
        <p className="sng-date">{dateLabel}</p>
        <p className="sng-place">{place}</p>
      </div>
      {c.weather ? (
        <aside className="sng-weather" aria-label={c.weather.label}>
          <span className="sng-weather-icon">
            <Snowflake />
          </span>
          <span className="sng-weather-label">{c.weather.label}</span>
          <span className="sng-weather-temp">{c.weather.temp}</span>
          <span className="sng-weather-note">{c.weather.note}</span>
        </aside>
      ) : null}
    </header>
  )
}

const ornament = (
  <svg viewBox="0 0 220 28" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
    <path d="M6 14H84M136 14H214" />
    <path d="M70 14l6 -4l6 4l-6 4zM138 14l6 -4l6 4l-6 4z" fill="currentColor" stroke="none" opacity=".7" />
    <g transform="translate(110 14)">
      {[0, 60, 120].map((a) => (
        <path key={a} transform={`rotate(${a})`} d="M0 -11V11M-3.4 -8L0 -5.4L3.4 -8M-3.4 8L0 5.4L3.4 8" />
      ))}
    </g>
    <circle cx="94" cy="14" r="2.4" fill="#c0392b" stroke="none" />
    <circle cx="126" cy="14" r="2.4" fill="#c0392b" stroke="none" />
  </svg>
)

const content = {
  en: {
    tagline: 'A winter wedding, sealed in glass',
    welcome:
      'On one of the longest nights of the year, high on Uludağ, we are going to light every window, pour something warm and get married in the snow. Come and be part of the scene.',
    story: [
      { when: '2020', title: 'First snow', text: '{partner1} and {partner2} met on the Sarıalan chairlift, the day it stopped for forty minutes in a blizzard.' },
      { when: '2023', title: 'A tradition', text: 'Every December since: a week in a mountain chalet, wool socks, chestnuts on the stove and no phones after dark.' },
      { when: '2026', title: 'The question', text: 'On the balcony at midnight, snow falling, {partner1} asked. {partner2} said yes, and the hot chocolate went cold.' },
    ],
    schedule: [
      { time: '15:30', title: 'Arrivals', text: 'Mulled wine, salep and a fire on the terrace.' },
      { time: '17:00', title: 'The ceremony', text: 'Beneath the snow-laden pines beside {venue}, at the blue hour.' },
      { time: '18:00', title: 'Lanterns', text: 'Photographs in the snow and ten minutes of everyone at once.' },
      { time: '19:30', title: 'Dinner', text: 'Long tables by the fireplace, mountain cooking and far too many toasts.' },
      { time: '21:30', title: 'Dancing', text: 'Until the fire burns low and the snow piles up against the door.' },
    ],
    venueNote:
      'The mountain road climbs 32 km from Bursa. Shuttles will run from the city centre and from the Teleferik base station; winter tyres or chains are compulsory on the road.',
    dressCode: {
      title: 'Winter formal',
      text: 'Velvet, wool and something that sparkles, in night blue, berry red, frost white or gold. Boots for the ceremony, shoes for dancing.',
      swatches: ['#0f2a44', '#c0392b', '#dde7f0', '#d4af37', '#9fb8cc'],
    },
    gifts: {
      title: 'You coming up the mountain is the gift',
      text: 'If you would still like to give something, a contribution to our honeymoon would be a very warm surprise.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Wherever the snow falls, home is the two of us.',
    weather: { label: 'Uludağ in December', temp: '−6° / −1°', note: 'Fresh snow most days · sunset around 16:40' },
  },
  tr: {
    tagline: 'Cama mühürlenmiş bir kış düğünü',
    welcome:
      'Yılın en uzun gecelerinden birinde, Uludağ’ın yükseklerinde bütün pencereleri yakacak, sıcak bir şeyler dolduracak ve karın içinde evleneceğiz. Gelin, bu manzaranın bir parçası olun.',
    story: [
      { when: '2020', title: 'İlk kar', text: '{partner1} ile {partner2}, Sarıalan’da tipide kırk dakika duran telesiyejde tanıştı.' },
      { when: '2023', title: 'Bir gelenek', text: 'O günden beri her aralık bir dağ evinde bir hafta: yün çoraplar, sobada kestane ve hava karardıktan sonra telefon yok.' },
      { when: '2026', title: 'Soru', text: 'Gece yarısı balkonda, kar yağarken {partner1} sordu. {partner2} “evet” dedi; sıcak çikolata da soğuyup gitti.' },
    ],
    schedule: [
      { time: '15:30', title: 'Karşılama', text: 'Sıcak şarap, salep ve terasta çıtırdayan bir ateş.' },
      { time: '17:00', title: 'Nikâh', text: '{venue} yanında, karla örtülü çamların altında, mavi saatte.' },
      { time: '18:00', title: 'Fenerler', text: 'Karda fotoğraflar ve herkesin bir arada olduğu on dakika.' },
      { time: '19:30', title: 'Akşam yemeği', text: 'Şöminenin yanında uzun masalar, dağ mutfağı ve bolca kadeh.' },
      { time: '21:30', title: 'Dans', text: 'Ateş kısılana ve kar kapının önünde birikene kadar.' },
    ],
    venueNote:
      'Dağ yolu Bursa’dan 32 km tırmanıyor. Şehir merkezinden ve Teleferik istasyonundan servislerimiz olacak; yolda kış lastiği ya da zincir zorunlu.',
    dressCode: {
      title: 'Kış şıklığı',
      text: 'Kadife, yün ve biraz ışıltı; gece mavisi, böğürtlen kırmızısı, kırağı beyazı ya da altın tonlarında. Nikâh için bot, dans için ayakkabı.',
      swatches: ['#0f2a44', '#c0392b', '#dde7f0', '#d4af37', '#9fb8cc'],
    },
    gifts: {
      title: 'Dağa kadar gelmeniz en güzel hediye',
      text: 'Yine de bir şey yapmak isterseniz, balayımıza katkınız sıcacık bir sürpriz olur.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Kar nereye yağarsa yağsın, yuvamız ikimiziz.',
    weather: { label: 'Aralıkta Uludağ', temp: '−6° / −1°', note: 'Neredeyse her gün taze kar · gün batımı 16.40 civarı' },
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-12-18T17:00:00+03:00',
  venue: 'Grand Yazıcı Uludağ',
  city: 'Uludağ, Bursa',
  address: 'Oteller Bölgesi, Uludağ, Osmangazi, Bursa',
  rsvpDeadline: '6 November 2027',
}

const theme = {
  className: 'theme-snow-globe',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@400;500&family=Great+Vibes&display=swap',
  ornament,
  Hero,
}

export default function SnowGlobePage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="en" />
}
