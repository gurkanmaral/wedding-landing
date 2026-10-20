import Invitation from '../../engine/Invitation.jsx'
import { OyaBackdrop, OyaHero } from './OyaHero.jsx'
import './oya.css'

// An oya border: scallops with picots and three small flowers.
const ornament = (
  <svg viewBox="0 0 240 30" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
    <path d="M4 10 H236" strokeDasharray="2 3" />
    <path d="M20 10 Q30 24 40 10 Q50 24 60 10 Q70 24 80 10 M160 10 Q170 24 180 10 Q190 24 200 10 Q210 24 220 10" />
    <circle cx="30" cy="22" r="1.4" fill="currentColor" />
    <circle cx="50" cy="22" r="1.4" fill="currentColor" />
    <circle cx="70" cy="22" r="1.4" fill="currentColor" />
    <circle cx="170" cy="22" r="1.4" fill="currentColor" />
    <circle cx="190" cy="22" r="1.4" fill="currentColor" />
    <circle cx="210" cy="22" r="1.4" fill="currentColor" />
    {[96, 120, 144].map((x, i) => (
      <g key={x} transform={`translate(${x} ${i === 1 ? 14 : 16})`}>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy={i === 1 ? -5.5 : -4.2} rx={i === 1 ? 3.4 : 2.6} ry={i === 1 ? 5.5 : 4.2} transform={`rotate(${r})`} fill="#c7a9a0" fillOpacity="0.55" />
        ))}
        <circle r={i === 1 ? 2.2 : 1.6} fill="#b89b5e" stroke="none" />
      </g>
    ))}
  </svg>
)

const iban = 'TR00 0000 0000 0000 0000 0000 00'

const content = {
  tr: {
    tagline: 'İlmek ilmek ördüğümüz hayata davetlisiniz',
    welcome:
      'Anneannelerimizin yazmalarının kenarına sabırla işlenen oyalar gibi, biz de birbirimize ilmek ilmek bağlandık. Safranbolu’nun taş sokaklarında, bu bağın en güzel gününü sizinle paylaşmak istiyoruz.',
    story: [
      { when: '2018', title: 'İlk ilmek', text: '{partner1} ile {partner2} Safranbolu’da bir el sanatları atölyesinde tanıştı; ikisi de ilk oyasını yarım bıraktı.' },
      { when: '2022', title: 'Oyanın dili', text: 'Eskiden genç kızlar söyleyemediklerini yazmalarının oyasıyla anlatırmış. Bir gün biz de birbirimize küçük bir karanfil oyası hediye ettik.' },
      { when: '2026', title: 'Son ilmek', text: 'Anneannemizin çeyiz sandığının başında “evet” dedik. Şimdi sıra düğünde.' },
    ],
    schedule: [
      { time: '16:30', title: 'Karşılama', text: '{venue} avlusunda safran şerbeti ve Safranbolu lokumu.' },
      { time: '17:30', title: 'Nikâh', text: 'Hanın taş avlusunda, gün yavaş yavaş batarken.' },
      { time: '18:30', title: 'Kokteyl', text: 'Çarşıda kısa bir yürüyüş ve hatıra fotoğrafları.' },
      { time: '19:30', title: 'Akşam yemeği', text: 'Uzun masalarda Safranbolu mutfağı: peruhi, yaprak sarma ve zerde.' },
      { time: '21:30', title: 'Dans', text: 'Gece yarısına kadar müzik ve dans.' },
    ],
    venueNote:
      'Cinci Han, Safranbolu çarşısının tam kalbinde. Konuklarımız için handa ve çevredeki konaklarda oda ayırdık. Arnavut kaldırımları için düz ayakkabı öneririz.',
    dressCode: {
      title: 'Keten ve pastel',
      text: 'Fildişi, gül kurusu ve adaçayı yeşili tonlarında hafif kumaşlar. Oyalı bir yazma ya da mendil takarsanız gözümüzden kaçmaz.',
      swatches: ['#fbf8f3', '#e9dfd3', '#c7a9a0', '#a3b18a', '#6b5b53'],
    },
    gifts: {
      title: 'Çeyiz sandığımıza bir ilmek',
      text: 'Varlığınız bizim için en güzel hediye. Yine de katkıda bulunmak isterseniz yeni evimiz için aşağıdaki hesabı kullanabilirsiniz.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'İlmek ilmek, ömür boyu.',
  },
  en: {
    tagline: 'Join us as we tie the final stitch',
    welcome:
      'Like the needle lace our grandmothers worked, loop by patient loop, onto the edges of their scarves, we have been joined to each other stitch by stitch. On the stone streets of Safranbolu, we would love to share the most beautiful day of that bond with you.',
    story: [
      { when: '2018', title: 'The first loop', text: '{partner1} and {partner2} met at a craft workshop in Safranbolu; both left their first piece of oya unfinished.' },
      { when: '2022', title: 'The language of oya', text: 'Young women once said what they could not say aloud through the lace on their scarves. One day we gave each other a tiny lace carnation.' },
      { when: '2026', title: 'The last stitch', text: 'We said yes beside our grandmother’s dowry chest. Now it is time for the wedding.' },
    ],
    schedule: [
      { time: '16:30', title: 'Welcome', text: 'Saffron sherbet and Safranbolu lokum in the courtyard of {venue}.' },
      { time: '17:30', title: 'Ceremony', text: 'In the stone courtyard of the old caravanserai, as the sun goes down.' },
      { time: '18:30', title: 'Drinks', text: 'A short stroll through the old bazaar and photographs.' },
      { time: '19:30', title: 'Dinner', text: 'Long tables and Safranbolu cooking: peruhi, stuffed vine leaves and saffron zerde.' },
      { time: '21:30', title: 'Dancing', text: 'Music and dancing until midnight.' },
    ],
    venueNote:
      'Cinci Han sits right in the heart of the Safranbolu bazaar. We have reserved rooms for our guests at the han and in the mansions nearby. Flat shoes are kind to the cobblestones.',
    dressCode: {
      title: 'Linen and pastels',
      text: 'Light fabrics in ivory, dusty rose and sage. If you wear a scarf or handkerchief edged with oya, we will notice.',
      swatches: ['#fbf8f3', '#e9dfd3', '#c7a9a0', '#a3b18a', '#6b5b53'],
    },
    gifts: {
      title: 'A stitch for our dowry chest',
      text: 'Your presence is the loveliest gift. If you would like to contribute, you can use the account below for our new home.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'Stitch by stitch, for a lifetime.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-06-05T17:30:00+03:00',
  venue: 'Cinci Han',
  city: 'Safranbolu, Karabük',
  address: 'Çarşı Mahallesi, Cinci Han, Safranbolu',
  rsvpDeadline: '24 Nisan 2027',
}

const theme = {
  className: 'theme-oya',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Italianno&family=Marcellus&display=swap',
  ornament,
  Hero: OyaHero,
  Backdrop: OyaBackdrop,
}

export default function OyaPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
