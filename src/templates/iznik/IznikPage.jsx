import Invitation from '../../engine/Invitation.jsx'
import IznikHero from './IznikHero.jsx'
import { izArt } from './motifs.js'
import './iznik.css'

// Tile images for the section styling (dividers, frames, countdown tiles).
function TileArt() {
  const art = izArt()
  const css = `.theme-iznik{--iz-field:${art.field};--iz-strip:${art.strip};--iz-frame:${art.frame};--iz-corner:${art.corner};--iz-rosette:${art.rosette};--iz-band:${art.kitabe};}`
  return <style>{css}</style>
}

function Hero({ partner1, partner2, dateLabel, place, c }) {
  return (
    <>
      <TileArt />
      <IznikHero partner1={partner1} partner2={partner2} dateLabel={dateLabel} place={place} tagline={c.tagline} />
    </>
  )
}

const ornament = (
  <svg viewBox="0 0 240 34" fill="none">
    <path d="M0 17H92M148 17H240" stroke="currentColor" strokeWidth="1" />
    <path d="M70 17c6-6 12-6 18 0-6 6-12 6-18 0ZM152 17c6-6 12-6 18 0-6 6-12 6-18 0Z" fill="#2ba6a4" stroke="#1b2130" strokeWidth=".8" />
    <path d="M120 31c-2-6-2-10 0-14 2 4 2 8 0 14Z" fill="#2e7d4f" stroke="#1b2130" strokeWidth=".8" />
    <path d="M120 22c-6-1-11-6-11-13 0-3 1-5 2-7 1 4 4 7 9 8 5-1 8-4 9-8 1 2 2 4 2 7 0 7-5 12-11 13Z" fill="#c8382e" stroke="#1b2130" strokeWidth=".8" />
    <path d="M120 21c-3-4-4-10 0-19 4 9 3 15 0 19Z" fill="currentColor" stroke="#1b2130" strokeWidth=".8" />
    <circle cx="100" cy="17" r="2" fill="#c8382e" />
    <circle cx="140" cy="17" r="2" fill="#c8382e" />
  </svg>
)

const content = {
  tr: {
    tagline: 'Bir çini gibi, el emeğiyle',
    welcome:
      'Yüzyıllardır aynı duvarı süsleyen çiniler gibi, birbirimizi tamamlayan iki parça olduk. Bu yolculuğun en güzel gününde, Sultanahmet’in kubbeleri altında sizi de yanımızda görmek istiyoruz.',
    story: [
      { when: '2019', title: 'İznik’te bir atölye', text: '{partner1} ve {partner2}, İznik’te bir çini atölyesinde aynı masada ilk lalelerini boyarken tanıştı. Biri kobaltı fazla kaçırdı, diğeri gülümsedi.' },
      { when: '2022', title: 'Aynı fırından', text: 'Birlikte boyadığımız ilk tabak fırından çıktığında çatlaktı; yine de evimizin en sevilen köşesinde duruyor.' },
      { when: '2026', title: 'Evet', text: 'Sarayburnu’nda, gün batımında vapurlar geçerken “evet” dedik.' },
    ],
    schedule: [
      { time: '17:30', title: 'Karşılama', text: 'Avluda şerbet, lokum ve hafif müzik eşliğinde.' },
      { time: '18:30', title: 'Nikâh', text: '{venue} bahçesinde, Ayasofya’nın kubbelerine karşı.' },
      { time: '19:30', title: 'Akşam yemeği', text: 'Saray mutfağından ilhamla hazırlanmış uzun bir sofra.' },
      { time: '21:30', title: 'İlk dans', text: 'Ardından sabaha kadar sürecek bir gece.' },
      { time: '00:30', title: 'Gece yarısı', text: 'Eve dönmeden önce sıcak bir çorba ve taze simit.' },
    ],
    venueNote: 'Sultanahmet tramvay durağına beş dakika yürüme mesafesindeyiz. Otopark kısıtlı olduğundan taksi ya da toplu taşımayı öneririz.',
    dressCode: {
      title: 'Çini renkleri',
      text: 'Kobalt, turkuaz, mercan ve zümrüt yeşili; ya da hepsini dengeleyen sade bir krem. Bahçe zemini için topuklarınıza dikkat.',
      swatches: ['#1f4e9c', '#2ba6a4', '#c8382e', '#2e7d4f', '#f7f3ea'],
    },
    gifts: {
      title: 'En güzel hediye, aramızda olmanız',
      text: 'Takı ya da hediye düşünürseniz, yeni evimiz için katkınızı aşağıdaki hesaba iletebilirsiniz.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Duvardaki çiniler gibi: her parça, ötekini tamamlar.',
  },
  en: {
    tagline: 'Handmade, like a painted tile',
    welcome:
      'Like the tiles that have graced the same walls for centuries, we have become two pieces that complete each other. On the most beautiful day of that journey, we would love to have you with us beneath the domes of Sultanahmet.',
    story: [
      { when: '2019', title: 'A workshop in İznik', text: '{partner1} and {partner2} met at the same table in an İznik tile workshop, painting their first tulips. One overdid the cobalt; the other smiled.' },
      { when: '2022', title: 'Out of the kiln', text: 'The first plate we painted together came out of the kiln cracked. It still has the best spot in our home.' },
      { when: '2026', title: 'Yes', text: 'At Sarayburnu, at sunset, with the ferries passing by, we said yes.' },
    ],
    schedule: [
      { time: '17:30', title: 'Welcome', text: 'Sherbet, Turkish delight and gentle music in the courtyard.' },
      { time: '18:30', title: 'Ceremony', text: 'In the garden of {venue}, facing the domes of Hagia Sophia.' },
      { time: '19:30', title: 'Dinner', text: 'One long table, inspired by the Ottoman palace kitchens.' },
      { time: '21:30', title: 'First dance', text: 'And then a night that runs until the small hours.' },
      { time: '00:30', title: 'Midnight', text: 'Hot soup and fresh simit before you head home.' },
    ],
    venueNote: 'We are a five-minute walk from the Sultanahmet tram stop. Parking is limited, so a taxi or public transport is best.',
    dressCode: {
      title: 'Tile colours',
      text: 'Cobalt, turquoise, coral and emerald, or a quiet cream that balances them all. Mind your heels on the garden paths.',
      swatches: ['#1f4e9c', '#2ba6a4', '#c8382e', '#2e7d4f', '#f7f3ea'],
    },
    gifts: {
      title: 'Your presence is our gift',
      text: 'If you would like to give something, a contribution to our new home can be sent to the account below.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Like tiles on a wall, each piece completes the other.',
  },
}

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-05-29T18:30:00+03:00',
  venue: 'Four Seasons Sultanahmet',
  city: 'Fatih, İstanbul',
  address: 'Tevkifhane Sokak No:1, Sultanahmet',
  rsvpDeadline: '17 Nisan 2027',
}

const theme = {
  className: 'theme-iznik',
  fontsHref: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap',
  ornament,
  Hero,
}

export default function IznikPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="tr" />
}
