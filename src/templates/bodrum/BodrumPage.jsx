import Invitation from '../../engine/Invitation.jsx'
import ShoreHero from './ShoreHero.jsx'
import './bodrum.css'

function Hero({ partner1, partner2, dateLabel, place, c }) {
  return (
    <header className="bd-hero">
      <ShoreHero />
      <div className="bd-hero-copy">
        <p className="bd-eyebrow">{c.tagline}</p>
        <h1 className="bd-names">
          <span>{partner1}</span>
          <span className="bd-amp">&amp;</span>
          <span>{partner2}</span>
        </h1>
        <p className="bd-date">{dateLabel}</p>
        <p className="bd-place">{place}</p>
      </div>
    </header>
  )
}

// A rope with a small compass star at its knot.
const ornament = (
  <svg viewBox="0 0 220 24" fill="none" stroke="currentColor">
    <path d="M4 12 C30 6 56 18 82 12 M138 12 C164 6 190 18 216 12" strokeWidth="2.2" strokeDasharray="2.4 1.6" />
    <path d="M110 1 L113 9 L121 12 L113 15 L110 23 L107 15 L99 12 L107 9 Z" fill="currentColor" stroke="none" />
    <circle cx="110" cy="12" r="11" strokeWidth="0.8" opacity="0.6" />
  </svg>
)

const iban = 'TR00 0000 0000 0000 0000 0000 00'
const swatches = ['#0e6ba8', '#7fd1e8', '#f6e7c8', '#e1b16a', '#ffffff']

const content = {
  tr: {
    tagline: 'Ege’den bir şişede mesaj',
    welcome:
      'Eylülün ılık bir akşamında, Gümüşlük’te güneş Tavşan Adası’nın ardına çekilirken evleniyoruz. Ayakkabılarınızı kumda bırakın, gelin bu mesajı birlikte okuyalım.',
    story: [
      {
        when: '2019',
        title: 'Aynı gulette',
        text: '{partner1} ve {partner2}, Bodrum’dan kalkan bir mavi yolculukta aynı güvertede uyandı. Üçüncü gün, Orak Adası’nda birlikte suya atladılar.',
      },
      {
        when: '2023',
        title: 'Kumdaki şişe',
        text: 'Gümüşlük sahilinde bulduğumuz boş bir şişeye bir dilek yazıp denize bıraktık. Dileğimiz bu gündü.',
      },
      {
        when: '2026',
        title: 'Evet',
        text: 'Yel değirmenlerinin altında, gün batımında soru soruldu; cevap rüzgârdan bile hızlı geldi.',
      },
    ],
    schedule: [
      { time: '17:30', title: 'Karşılama', text: 'Koyun kıyısında limonata, buzlu şerbet ve deniz meltemi.' },
      { time: '18:30', title: 'Nikâh', text: '{venue} kıyısında, Tavşan Adası’na karşı, güneş batarken.' },
      { time: '19:30', title: 'Gün batımı kokteyli', text: 'Kumsalda çıplak ayak, ellerde kadeh, ufukta gulet yelkenleri.' },
      { time: '20:30', title: 'Akşam yemeği', text: 'Balıkçı usulü uzun sofra: Ege otları, ızgara balık, zeytinyağlılar.' },
      { time: '22:30', title: 'Dans', text: 'Ay ışığında, kumların üstünde, gece boyunca.' },
    ],
    venueNote:
      'Bodrum merkezden Gümüşlük’e yol 25 dakika; Milas–Bodrum Havalimanı’ndan 16:00’da servis kalkacak. Köy içi araç trafiğine kapalı, otoparktan sahile beş dakikalık bir yürüyüş var. Akşam rüzgârı için yanınıza ince bir şal alın.',
    dressCode: {
      title: 'Deniz, kum ve keten',
      text: 'Beyaz, kum, turkuaz ve derin mavi; keten ve ipek. Kumsalda topuk batar, sandalet ya da düz ayakkabı öneririz.',
      swatches,
    },
    gifts: {
      title: 'En güzel hediye, kumsalda yanımızda olmanız',
      text: 'Yine de bir şey yapmak isterseniz, balayımızdaki ilk mavi yolculuğa katkınızı aşağıdaki hesaba gönderebilirsiniz. Takılarınızı düğün akşamı gönül rahatlığıyla getirebilirsiniz.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'Her dalga bizi biraz daha birbirimize getirdi.',
  },
  en: {
    tagline: 'A message in a bottle from the Aegean',
    welcome:
      'On a warm September evening in Gümüşlük, as the sun sinks behind Rabbit Island, we are getting married. Leave your shoes in the sand and come read this message with us.',
    story: [
      {
        when: '2019',
        title: 'The same gulet',
        text: '{partner1} and {partner2} woke up on the same deck of a Blue Cruise out of Bodrum. On the third day they jumped into the sea together off Orak Island.',
      },
      {
        when: '2023',
        title: 'A bottle in the sand',
        text: 'We found an empty bottle on Gümüşlük beach, wrote a wish, and let the sea take it. The wish was this day.',
      },
      {
        when: '2026',
        title: 'Yes',
        text: 'Under the windmills at sunset the question was asked; the answer came faster than the wind.',
      },
    ],
    schedule: [
      { time: '17:30', title: 'Welcome', text: 'Lemonade, iced sherbet and a sea breeze on the edge of the bay.' },
      { time: '18:30', title: 'Ceremony', text: 'On the shore at {venue}, facing Rabbit Island, as the sun goes down.' },
      { time: '19:30', title: 'Sunset drinks', text: 'Barefoot on the sand, glass in hand, gulet sails on the horizon.' },
      { time: '20:30', title: 'Dinner', text: 'A long fisherman’s table: Aegean greens, grilled fish and olive-oil dishes.' },
      { time: '22:30', title: 'Dancing', text: 'By moonlight, on the sand, all night long.' },
    ],
    venueNote:
      'Gümüşlük is 25 minutes from Bodrum town; a shuttle leaves Milas–Bodrum Airport at 16:00. The village is car-free, so allow a five-minute walk from the car park to the beach. Bring a light wrap for the evening wind.',
    dressCode: {
      title: 'Sea, sand and linen',
      text: 'White, sand, turquoise and deep blue; linen and silk. Heels sink in the sand, so sandals or flats are best.',
      swatches,
    },
    gifts: {
      title: 'Your presence on the beach is the gift',
      text: 'If you would still like to give something, a contribution towards our first Blue Cruise as a married couple would mean the world to us.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'Every wave brought us a little closer.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-09-11T18:30:00+03:00',
  venue: 'Gümüşlük Koyu',
  city: 'Gümüşlük, Bodrum',
  address: 'Gümüşlük Mahallesi, Bodrum, Muğla',
  rsvpDeadline: '31 Temmuz 2027',
}

const theme = {
  className: 'theme-bodrum',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Josefin+Sans:wght@300;400;600&family=Allura&display=swap',
  ornament,
  Hero,
}

export default function BodrumPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
