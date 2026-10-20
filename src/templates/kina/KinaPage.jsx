import Invitation from '../../engine/Invitation.jsx'
import { KinaHero, TurkuSection } from './KinaHero.jsx'
import './kina.css'

const ornament = (
  <svg viewBox="0 0 240 34" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M4 20 H82 M158 20 H236" />
    <path d="M82 20 C92 12 100 26 108 18 M158 20 C148 12 140 26 132 18" />
    <path d="M120 30 C108 26 104 12 110 4 C113 11 117 14 120 15 C123 14 127 11 130 4 C136 12 132 26 120 30 Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M120 15 C116 10 117 4 120 1 C123 4 124 10 120 15" />
    <circle cx="96" cy="26" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="144" cy="26" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="70" cy="20" r="2" fill="currentColor" stroke="none" />
    <circle cx="170" cy="20" r="2" fill="currentColor" stroke="none" />
  </svg>
)

function Hero(props) {
  return (
    <>
      <KinaHero {...props} />
      <TurkuSection c={props.c} ornament={ornament} />
    </>
  )
}

const iban = 'TR00 0000 0000 0000 0000 0000 00'

const content = {
  tr: {
    tagline: 'Kızımızın kına gecesine davetlisiniz',
    welcome:
      'Düğünden bir gece önce, kızımızı yeni hayatına uğurlamadan, mum ışığında toplanıyoruz. Al duvak örtülecek, kına yakılacak, türküler söylenecek. Bu geceyi bizimle paylaşırsanız sevincimiz bir kat daha artar. — Gelinin ailesi',
    story: [
      { when: 'İlk görüş', title: 'Bir dost sofrasında', text: '{partner1} ile {partner2} bir dost sofrasında tanıştı; o akşam kimse kalkmak istemedi.' },
      { when: 'Söz', title: 'Kapımız çalındı', text: '{partner2} ailesiyle kapımıza geldi. Kahveler pişti, çikolatalar sunuldu, söz kesildi.' },
      { when: 'Kına', title: 'Ve bu gece', text: 'Şimdi sıra kınada: anneannemizin pirinç tepsisi yeniden mumlarla dolacak.' },
    ],
    schedule: [
      { time: '19:30', title: 'Karşılama', text: '{venue} bahçesinde şerbet, lokum ve hoş sohbet.' },
      { time: '20:30', title: 'Gelinin girişi', text: 'Kızımız bindallısı ve al duvağıyla, ellerinde mum taşıyan genç kızların arasından geçiyor.' },
      { time: '21:00', title: 'Kına yakma', text: '“Yüksek Yüksek Tepelere” söylenirken kına yakılıyor; avucuna altını kayınvalidesi koyuyor.' },
      { time: '21:45', title: 'Akşam yemeği', text: 'Ege mezeleri, zeytinyağlılar ve evde açılmış baklava.' },
      { time: '22:30', title: 'Halay ve çiftetelli', text: 'Def ve darbukayla gece yarısına kadar.' },
    ],
    venueNote:
      'Urla’nın bağları arasında, açık havada bir gece. Akşam serinliği için omuzlarınıza bir şal alın. İzmir merkezden gelecek misafirlerimiz için Konak’tan 18:30’da servis kalkacak.',
    dressCode: {
      title: 'Bindallınızla buyurun',
      text: 'Kırmızı geline kalsın; siz bordo, altın, krem ve kına tonlarını seçin. Dolabınızda bir bindallı, işlemeli bir yelek ya da anneannenizden kalma bir yazma varsa, bu gece tam onun gecesi.',
      swatches: ['#3b0d11', '#7a3e1d', '#d4a24c', '#f3e1c7'],
    },
    gifts: {
      title: 'Hediyeniz duanız olsun',
      text: 'Bu gece en güzel hediye sesiniz ve iyi dilekleriniz. Yine de bir şey getirmek isterseniz, yeni yuvaları için katkınızı aşağıdaki hesaba iletebilirsiniz.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'Kınan kutlu, yolun açık olsun.',
    turku: {
      kicker: 'Gecenin türküleri',
      title: 'Hep birlikte söyleyeceğiz',
      intro: 'Sözlerini bilmeyen kalmasın diye listeyi şimdiden paylaşıyoruz. Birine dokunun; gece boyunca aklınızda o çalsın.',
      listen: 'Dinle',
      tracks: [
        { title: 'Yüksek Yüksek Tepelere', note: 'Kına yakılırken' },
        { title: 'Kınayı Getir Aney', note: 'Gelin ağlatma faslı' },
        { title: 'Ah Bir Ataş Ver', note: 'Mumlar gelinin etrafında dönerken' },
        { title: 'Dere Geliyor Dere', note: 'Halaya geçmeden' },
      ],
    },
  },
  en: {
    tagline: 'The bride’s family invites you to her henna night',
    welcome:
      'On the night before the wedding, before we send our daughter off to her new life, we gather by candlelight. The red veil will be lowered, the henna laid, the old songs sung. Having you with us would make the night complete. — The bride’s family',
    story: [
      { when: 'First meeting', title: 'Around a friend’s table', text: '{partner1} and {partner2} met over a long dinner with friends; nobody wanted to leave that night.' },
      { when: 'The promise', title: 'A knock at our door', text: '{partner2} came to ask for her hand with family in tow. Coffee was made, chocolates were passed round, and the promise was given.' },
      { when: 'Kına', title: 'And tonight', text: 'Now it is time for henna: our grandmother’s brass tray will be filled with candles once more.' },
    ],
    schedule: [
      { time: '19:30', title: 'Welcome', text: 'Sherbet, Turkish delight and good company in the garden at {venue}.' },
      { time: '20:30', title: 'The bride arrives', text: 'In her bindallı and red veil, she walks between young women carrying candles.' },
      { time: '21:00', title: 'The henna', text: 'While “Yüksek Yüksek Tepelere” is sung, the henna is laid; her mother-in-law places gold in her palm.' },
      { time: '21:45', title: 'Dinner', text: 'Aegean meze, olive-oil dishes and homemade baklava.' },
      { time: '22:30', title: 'Halay and dancing', text: 'Frame drums and darbuka until midnight.' },
    ],
    venueNote:
      'An open-air evening among the vineyards of Urla. Bring a wrap for the evening breeze. A shuttle leaves Konak, İzmir, at 18:30 for guests coming from the city.',
    dressCode: {
      title: 'Bindallı welcome',
      text: 'Red belongs to the bride; choose wine, gold, cream and henna tones. If you own a bindallı, an embroidered waistcoat or your grandmother’s scarf, tonight is the night to wear it.',
      swatches: ['#3b0d11', '#7a3e1d', '#d4a24c', '#f3e1c7'],
    },
    gifts: {
      title: 'Your blessing is the gift',
      text: 'Your voice and your good wishes are the best gift tonight. If you would still like to bring something, a contribution to their new home can be sent to the account below.',
      holder: 'Jane & Joe',
      iban,
    },
    quote: 'May your henna be blessed and your road be open.',
    turku: {
      kicker: 'Songs of the night',
      title: 'We will sing them together',
      intro: 'We are sharing the list early so everyone knows the words. Tap one and let it play in your head all night.',
      listen: 'Listen',
      tracks: [
        { title: 'Yüksek Yüksek Tepelere', note: 'While the henna is laid' },
        { title: 'Kınayı Getir Aney', note: 'The tender song that makes the bride cry' },
        { title: 'Ah Bir Ataş Ver', note: 'As the candles circle the bride' },
        { title: 'Dere Geliyor Dere', note: 'Just before the halay' },
      ],
    },
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-06-25T19:30:00+03:00',
  venue: 'Urla Şarapçılık',
  city: 'Urla, İzmir',
  address: 'Urla Şarapçılık, Urla',
  rsvpDeadline: '14 Mayıs 2027',
}

const theme = {
  className: 'theme-kina',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Great+Vibes&family=Yeseva+One&display=swap',
  ornament,
  Hero,
}

export default function KinaPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
