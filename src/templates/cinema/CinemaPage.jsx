import Invitation from '../../engine/Invitation.jsx'
import CinemaHero from './CinemaHero.jsx'
import './cinema.css'

// a short strip of 35 mm film with a star in the middle frame
const ornament = (
  <svg viewBox="0 0 220 26" fill="none">
    <path d="M0 13 H62 M158 13 H220" stroke="currentColor" strokeWidth="1" />
    <rect x="66" y="2" width="88" height="22" rx="2" fill="#0a0909" stroke="currentColor" strokeWidth="1" />
    <g fill="currentColor" opacity="0.8">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={`t${i}`} x={70 + i * 10.5} y="4" width="5" height="3" rx="0.8" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={`b${i}`} x={70 + i * 10.5} y="19" width="5" height="3" rx="0.8" />
      ))}
    </g>
    <path d="M95 9 V17 M125 9 V17" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <path d="M110 8.5 L111.3 12 L115 13 L111.3 14 L110 17.5 L108.7 14 L105 13 L108.7 12Z" fill="#b5121b" />
  </svg>
)

const content = {
  en: {
    tagline: 'Opening night · one show only',
    welcome:
      'Dim the lights and silence your phones. After years of rehearsals, near-misses and one unforgettable meet-cute, our story finally gets its premiere — and we would love you in the best seats in the house.',
    story: [
      { when: '2018', title: 'The meet-cute', text: '{partner1} and {partner2} reached for the last two tickets to the same midnight screening. They shared the armrest, then the popcorn, then a very long walk home.' },
      { when: '2021', title: 'The montage', text: 'Three cities, two flats, one cat and a standing Sunday-night film. Fast-forward through the good bits and you would still need an intermission.' },
      { when: '2026', title: 'The big scene', text: 'In an empty cinema after closing, the trailers stopped and a single slide came up on the screen. There was only ever going to be one answer.' },
    ],
    schedule: [
      { time: '17:30', title: 'Doors & champagne', text: 'Red carpet and a cold glass in the foyer of {venue}.' },
      { time: '18:00', title: 'The ceremony', text: 'In the main auditorium, under the painted ceiling. Phones down, please — no spoilers.' },
      { time: '19:00', title: 'Intermission', text: 'Cocktails, popcorn done properly and photographs on the grand staircase.' },
      { time: '20:00', title: 'Dinner', text: 'A long supper in the balcony bar, with speeches kept to the length of a trailer.' },
      { time: '22:00', title: 'The after-party', text: 'The screen goes up, the dance floor comes out. Until the final reel.' },
    ],
    venueNote:
      'Le Louxor sits right by Barbès–Rochechouart métro (lines 2 and 4). Taxis can stop at the door on Boulevard de Magenta; the cloakroom is just inside on the left.',
    dressCode: {
      title: 'Black tie, silver screen',
      text: 'Black tie or your most cinematic evening wear: velvet, satin, a touch of gold. There is a grand staircase, so choose shoes you can make an entrance in.',
      swatches: ['#0d0d0d', '#e8dcc2', '#b5121b', '#c9a85c', '#5c5c5c'],
    },
    gifts: {
      title: 'Your company is the gift',
      text: 'Having you in the audience is all we wish for. If you would like to give something, a contribution toward our honeymoon would be the perfect sequel.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'And they lived happily ever after.',
  },
  tr: {
    tagline: 'Gala gecesi · tek gösterim',
    welcome:
      'Işıklar kararıyor, telefonlar sessize. Yıllarca süren provalardan, kıl payı kaçan karşılaşmalardan ve unutulmaz bir tanışmadan sonra hikâyemiz nihayet galasını yapıyor. Salonun en güzel koltuklarında sizi görmek istiyoruz.',
    story: [
      { when: '2018', title: 'Tanışma sahnesi', text: '{partner1} ve {partner2} aynı gece yarısı gösteriminin son iki biletine aynı anda uzandı. Önce koltuk kolçağını, sonra patlamış mısırı, sonra da eve doğru çok uzun bir yürüyüşü paylaştılar.' },
      { when: '2021', title: 'Montaj', text: 'Üç şehir, iki ev, bir kedi ve hiç aksamayan pazar akşamı filmleri. En güzel kısımları hızlı geçsek bile araya bir ara vermek gerekirdi.' },
      { when: '2026', title: 'Büyük sahne', text: 'Kapanıştan sonra boş bir sinema salonunda fragmanlar bitti ve perdeye tek bir slayt yansıdı. Cevap zaten belliydi.' },
    ],
    schedule: [
      { time: '17:30', title: 'Kapılar ve şampanya', text: '{venue} fuayesinde kırmızı halı ve soğuk bir kadeh.' },
      { time: '18:00', title: 'Nikâh', text: 'Ana salonda, boyalı tavanın altında. Telefonlar kapalı lütfen, sürprizi bozmayalım.' },
      { time: '19:00', title: 'Ara', text: 'Kokteyller, hakkıyla yapılmış patlamış mısır ve büyük merdivende fotoğraflar.' },
      { time: '20:00', title: 'Akşam yemeği', text: 'Balkon barında uzun bir sofra; konuşmalar bir fragman uzunluğunda.' },
      { time: '22:00', title: 'Parti', text: 'Perde kalkıyor, dans pisti açılıyor. Son makaraya kadar.' },
    ],
    venueNote:
      'Le Louxor, Barbès–Rochechouart metro durağının hemen yanında (2 ve 4 numaralı hatlar). Taksiler Boulevard de Magenta’daki kapının önünde durabiliyor; vestiyer girişin hemen solunda.',
    dressCode: {
      title: 'Siyah kravat, beyaz perde',
      text: 'Siyah kravat ya da en sinematik gece kıyafetiniz: kadife, saten, biraz altın. Büyük bir merdiven var; görkemli bir giriş yapabileceğiniz ayakkabılar seçin.',
      swatches: ['#0d0d0d', '#e8dcc2', '#b5121b', '#c9a85c', '#5c5c5c'],
    },
    gifts: {
      title: 'En güzel hediye varlığınız',
      text: 'Sizi salonda görmek bize yeter. Yine de bir hediye düşünürseniz balayımıza katkınız hikâyemizin en güzel devam filmi olur.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Ve sonsuza dek mutlu yaşadılar.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-11-13T18:00:00+01:00',
  venue: 'Le Louxor',
  city: 'Paris',
  address: '170 Boulevard de Magenta, 75010 Paris',
  rsvpDeadline: '2 October 2027',
}

const theme = {
  className: 'theme-cinema',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Limelight&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Josefin+Sans:wght@400;600;700&family=Courier+Prime:wght@400;700&display=swap',
  ornament,
  Hero: CinemaHero,
}

export default function CinemaPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="en" />
}
