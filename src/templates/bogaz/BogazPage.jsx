import Invitation from '../../engine/Invitation.jsx'
import BosphorusHero from './BosphorusHero.jsx'
import './bogaz.css'

function Hero({ partner1, partner2, dateLabel, timeLabel, place, c }) {
  return (
    <header className="bz-hero">
      <BosphorusHero />
      <div className="bz-hero-copy">
        <p className="bz-eyebrow">{c.tagline}</p>
        <h1 className="bz-names">
          <span>{partner1}</span>
          <span className="bz-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
        <p className="bz-date">
          <span>{dateLabel}</span>
          <span className="bz-dot" aria-hidden="true" />
          <span>{timeLabel}</span>
        </p>
        <p className="bz-place">{place}</p>
      </div>
    </header>
  )
}

// A tiny suspension bridge between two rules.
const ornament = (
  <svg viewBox="0 0 220 28" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
    <path d="M0 22 H220" opacity="0.45" />
    <path d="M60 22 V6 M160 22 V6" strokeWidth="1.6" />
    <path d="M30 22 Q46 12 60 6 Q110 26 160 6 Q174 12 190 22" />
    <path d="M70 10 L74 22 M80 14 L78 22 M90 17 L94 22 M100 19 L98 22 M120 19 L124 22 M130 17 L128 22 M140 14 L144 22 M150 10 L148 22" opacity="0.6" />
    <circle cx="60" cy="3.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="160" cy="3.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

const iban = 'TR00 0000 0000 0000 0000 0000 00'
const swatches = ['#0b1630', '#1f3a5f', '#f6c667', '#e9eef5', '#b23a48']

const content = {
  tr: {
    tagline: 'Boğaz’da bir yaz gecesi',
    welcome:
      'Temmuzun ilk serin akşamında, Kandilli’nin yalıları ışıklarını birer birer yakarken hayatımızın en güzel gecesini sizinle paylaşmak istiyoruz. Vapurdan inin, kıyıda buluşalım.',
    story: [
      {
        when: '2018',
        title: 'Aynı vapurda',
        text: '{partner1} ve {partner2}, Kadıköy–Beşiktaş vapurunun üst güvertesinde martılara simit atarken tanıştı. İskeleye vardıklarında telefon numaraları çoktan değişilmişti.',
      },
      {
        when: '2022',
        title: 'Kandilli’de bir akşam',
        text: 'Rasathanenin altındaki iskelede, karşı kıyının ışıklarına bakarak saatlerce konuştuk ve son vapuru bilerek kaçırdık.',
      },
      {
        when: '2026',
        title: 'Köprünün ışıkları',
        text: 'Köprünün ışıkları renk değiştirirken soru soruldu; cevap tek kelimeydi: evet.',
      },
    ],
    schedule: [
      { time: '18:30', title: 'Karşılama', text: '{venue} terasında, Boğaz’a karşı şerbet ve mezeler.' },
      { time: '19:30', title: 'Nikâh', text: 'Gün batarken, karşı kıyının ışıkları yanmaya başladığında.' },
      { time: '20:30', title: 'Akşam yemeği', text: 'Uzun masalarda Boğaz usulü bir sofra: mezeler, balık ve rakı.' },
      { time: '22:00', title: 'İlk dans', text: 'Köprünün ışıkları eşliğinde, ardından sabaha kadar müzik.' },
      { time: '00:30', title: 'Son vapur', text: 'Özel motorumuz Üsküdar ve Beşiktaş iskelelerine dönüş yapacak.' },
    ],
    venueNote:
      'Beşiktaş ve Üsküdar iskelelerinden 17:45’te özel motor kalkacak; Kandilli iskelesinden koruya yürüyerek beş dakika. Araçla gelecek misafirlerimiz için sahilde vale hizmeti olacak. Boğaz’da geceler serin olur, yanınıza ince bir şal ya da ceket alın.',
    dressCode: {
      title: 'Gece mavisi ve altın',
      text: 'Lacivert, gece mavisi, inci ve şampanya tonları; bir dokunuş altın. Çimen ve taş zemin için ince topuk yerine dolgu ya da kalın topuk öneririz.',
      swatches,
    },
    gifts: {
      title: 'En güzel hediye, o gece yanımızda olmanız',
      text: 'Yine de bir şey yapmak isterseniz, yeni evimizin ilk eşyalarına katkınızı aşağıdaki hesaba gönderebilirsiniz. Takılarınızı düğün gecesi gönül rahatlığıyla getirebilirsiniz.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'İki yakayı birleştiren bir köprü gibi, el ele.',
  },
  en: {
    tagline: 'A summer night on the Bosphorus',
    welcome:
      'On the first cool evening of July, as the yalıs of Kandilli switch on their lights one by one, we would love to share the most beautiful night of our lives with you. Step off the ferry and meet us on the shore.',
    story: [
      {
        when: '2018',
        title: 'The same ferry',
        text: '{partner1} and {partner2} met on the top deck of the Kadıköy–Beşiktaş ferry, throwing simit to the gulls. By the time it docked, they had swapped numbers.',
      },
      {
        when: '2022',
        title: 'An evening in Kandilli',
        text: 'On the pier below the observatory we talked for hours, watching the lights of the far shore, and missed the last ferry on purpose.',
      },
      {
        when: '2026',
        title: 'The bridge lights',
        text: 'As the bridge lights changed colour, the question was asked. The answer was one word: yes.',
      },
    ],
    schedule: [
      { time: '18:30', title: 'Welcome', text: 'Sherbet and meze on the terrace at {venue}, facing the water.' },
      { time: '19:30', title: 'Ceremony', text: 'At sunset, as the lights come on across the strait.' },
      { time: '20:30', title: 'Dinner', text: 'A Bosphorus table at long tables: meze, fresh fish and rakı.' },
      { time: '22:00', title: 'First dance', text: 'Under the bridge lights, then music until late.' },
      { time: '00:30', title: 'Last boat', text: 'Our private boat returns to the Üsküdar and Beşiktaş piers.' },
    ],
    venueNote:
      'A private boat leaves the Beşiktaş and Üsküdar piers at 17:45; from Kandilli pier it is a five-minute walk up to the grove. Valet parking will be available on the waterfront. Nights on the Bosphorus get cool, so bring a light wrap or jacket.',
    dressCode: {
      title: 'Midnight blue and gold',
      text: 'Navy, midnight blue, pearl and champagne, with a touch of gold. Lawn and stone underfoot, so block heels rather than stilettos.',
      swatches,
    },
    gifts: {
      title: 'Your presence is the gift',
      text: 'If you would still like to give something, a contribution towards the first things for our new home would mean the world to us.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'Hand in hand, like a bridge between two shores.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-07-10T19:30:00+03:00',
  venue: 'Mihrabad Korusu',
  city: 'Kandilli, İstanbul',
  address: 'Mihrabad Korusu, Kandilli, Üsküdar',
  rsvpDeadline: '29 Mayıs 2027',
}

const theme = {
  className: 'theme-bogaz',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500&family=Great+Vibes&family=IBM+Plex+Mono:wght@400;500&display=swap',
  ornament,
  Hero,
}

export default function BogazPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
