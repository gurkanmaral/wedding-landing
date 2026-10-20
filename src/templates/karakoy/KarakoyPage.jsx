import Invitation from '../../engine/Invitation.jsx'
import KarakoyHero from './KarakoyHero.jsx'
import './karakoy.css'

// a gallery rule: hairline, tick marks, one signal-orange dot
const ornament = (
  <svg viewBox="0 0 220 14" fill="none" stroke="#111111" strokeWidth="1">
    <path d="M0 7 H220" strokeOpacity="0.35" />
    <path d="M0 3 V11 M55 5 V9 M165 5 V9 M220 3 V11" strokeOpacity="0.6" />
    <circle cx="110" cy="7" r="4.5" fill="#ff5a36" stroke="none" />
  </svg>
)

const content = {
  tr: {
    tagline: 'Karaköy’de bir akşam',
    welcome:
      'Galata’nın gölgesinde, Haliç’e bakan taş bir binada, bir sergi açılışı kadar sade ve bir meyhane sofrası kadar sıcak bir akşam hayal ettik. Duvarlarda isimlerimiz, masada sevdiklerimiz olsun istiyoruz.',
    story: [
      { when: '2019', title: 'Aynı tablonun önünde', text: '{partner1} ve {partner2} Tophane’de bir sergi açılışında aynı tablonun önünde durdu; ikisi de tabloyu beğenmedi, ama sohbeti çok beğendiler.' },
      { when: '2022', title: 'Merdivenli bir ev', text: 'Kamondo Merdivenleri’ne üç sokak mesafede, sabahları vapur düdüğüyle uyandığımız küçük bir eve taşındık.' },
      { when: '2026', title: 'Kadıköy vapurunda', text: 'Karaköy iskelesinden kalkan akşam vapurunda, Kız Kulesi’nin hizasında bir soru soruldu. Cevap “evet” oldu.' },
    ],
    schedule: [
      { time: '18:30', title: 'Karşılama', text: '{venue} girişinde bir kadeh, hafif bir caz ve Bankalar Caddesi’nin akşam ışığı.' },
      { time: '19:00', title: 'Nikâh', text: 'Binanın taş avlusunda, kısa, sade ve gülümseten bir tören.' },
      { time: '20:00', title: 'Akşam yemeği', text: 'Uzun, tek bir masa; Karaköy meyhane mezelerinin modern bir yorumu.' },
      { time: '21:45', title: 'Konuşmalar ve pasta', text: 'Kısa tutacağımıza söz veriyoruz. Pastayı ise uzun tutacağız.' },
      { time: '22:30', title: 'Dans', text: 'Haliç’in ışıkları karşısında, gece yarısını epey geçene kadar.' },
    ],
    venueNote:
      'Karaköy tramvay durağına iki dakikalık yürüme mesafesindeyiz. Akşam saatlerinde otopark bulmak zor; tramvay, vapur ya da taksi öneririz. Dönüşte Galata Köprüsü’nden yürümek de bir seçenek.',
    dressCode: {
      title: 'Siyah, beyaz ve tek bir renk',
      text: 'Bir galeri açılışı gibi düşünün: siyah, beyaz, taş tonları ve isterseniz tek bir cesur renk. Kamondo Merdivenleri’ni çıkmak isteyenler için rahat bir ayakkabı iyi fikir.',
      swatches: ['#111111', '#f5f3ef', '#d9d4cc', '#8a8a8a', '#ff5a36'],
    },
    gifts: {
      title: 'Hediye yerine bir anı',
      text: 'Bu akşamı bizimle paylaşmanız en güzel hediye. Yine de bir katkıda bulunmak isterseniz, yeni evimizin ilk duvarına asacağımız eser için aşağıdaki hesabı kullanabilirsiniz.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Aynı şehirde, aynı çizgide.',
  },
  en: {
    tagline: 'An evening in Karaköy',
    welcome:
      'In the shadow of Galata, in a stone building looking over the Golden Horn, we imagined an evening as clean as a gallery opening and as warm as a meyhane table. Our names on the wall, the people we love at the table.',
    story: [
      { when: '2019', title: 'In front of the same painting', text: '{partner1} and {partner2} stopped in front of the same painting at an opening in Tophane. Neither of them liked the painting; both of them liked the conversation.' },
      { when: '2022', title: 'A house with stairs', text: 'We moved into a small flat three streets from the Kamondo Steps, woken every morning by the ferry horns.' },
      { when: '2026', title: 'On the Kadıköy ferry', text: 'On the evening ferry out of Karaköy pier, level with the Maiden’s Tower, a question was asked. The answer was yes.' },
    ],
    schedule: [
      { time: '18:30', title: 'Welcome', text: 'A glass at the door of {venue}, a little jazz and the evening light on Bankalar Caddesi.' },
      { time: '19:00', title: 'Ceremony', text: 'In the stone courtyard: short, simple and with a few laughs.' },
      { time: '20:00', title: 'Dinner', text: 'One long table and a modern take on Karaköy meyhane meze.' },
      { time: '21:45', title: 'Toasts and cake', text: 'We promise to keep the speeches short and the cake generous.' },
      { time: '22:30', title: 'Dancing', text: 'Facing the lights of the Golden Horn, until well past midnight.' },
    ],
    venueNote:
      'We are a two-minute walk from the Karaköy tram stop. Parking is hard to find in the evening, so the tram, a ferry or a taxi is best. Walking home across the Galata Bridge is also an option.',
    dressCode: {
      title: 'Black, white and one colour',
      text: 'Think gallery opening: black, white, stone tones and, if you like, one brave colour. Comfortable shoes if you plan to climb the Kamondo Steps.',
      swatches: ['#111111', '#f5f3ef', '#d9d4cc', '#8a8a8a', '#ff5a36'],
    },
    gifts: {
      title: 'A memory instead of a gift',
      text: 'Sharing this evening with us is the gift. If you would still like to contribute, it will go toward the first piece of art for the first wall of our new home.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Same city, same line.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-10-02T19:00:00+03:00',
  venue: 'SALT Galata',
  city: 'Karaköy, İstanbul',
  address: 'Bankalar Caddesi No: 11, Karaköy, Beyoğlu',
  rsvpDeadline: '21 Ağustos 2027',
}

const theme = {
  className: 'theme-karakoy',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
  ornament,
  Hero: KarakoyHero,
}

export default function KarakoyPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
