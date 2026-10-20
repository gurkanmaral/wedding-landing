import { useEffect, useState } from 'react'
import Invitation from '../../engine/Invitation.jsx'
import { useWeddingCardFields } from '../../api/weddingCardContext'
import SkyHero from './SkyHero.jsx'
import SplitFlapBoard from './SplitFlapBoard.jsx'
import RouteMap from './RouteMap.jsx'
import './departures.css'

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-07-24T18:00:00+03:00',
  venue: 'Santo Wines',
  city: 'Pyrgos, Santorini',
  address: 'Santo Wines, Pyrgos Kallistis, Santorini 847 00, Greece',
  rsvpDeadline: '12 June 2027',
}

const boardCopy = {
  en: {
    title: 'DEPARTURES',
    clock: 'LOCAL',
    passengers: 'PASSENGERS',
    flight: 'FLIGHT',
    time: 'DEPARTS',
    destination: 'DESTINATION',
    date: 'DATE',
    gate: 'GATE',
    remarks: 'REMARKS',
    status: ['BOARDING', 'ON TIME', 'GATE OPEN'],
    summary: (names, dest, date, time) => `Flight of ${names} to ${dest}, ${date} at ${time}, gate B12 — now boarding.`,
    mapLabel: (dest) => `Route map: flights from across Europe converge on ${dest}.`,
  },
  tr: {
    title: 'KALKIŞ',
    clock: 'YEREL',
    passengers: 'YOLCULAR',
    flight: 'UÇUŞ',
    time: 'SAAT',
    destination: 'VARIŞ',
    date: 'TARİH',
    gate: 'KAPI',
    remarks: 'DURUM',
    status: ['BİNİŞ', 'ZAMANINDA', 'KAPI AÇIK'],
    summary: (names, dest, date, time) => `${names} uçuşu: ${dest}, ${date} saat ${time}, B12 kapısı — biniş başladı.`,
    mapLabel: (dest) => `Rota haritası: Avrupa’nın dört bir yanından uçuşlar ${dest} üzerinde buluşuyor.`,
  },
}

// Countdown tiles flip whenever their digits change.
function useFlipCountdown() {
  useEffect(() => {
    const seen = new WeakMap()
    const id = setInterval(() => {
      document.querySelectorAll('.theme-departures .inv-countdown-cell').forEach((cell) => {
        const value = cell.querySelector('.inv-countdown-value')?.textContent
        if (seen.has(cell) && seen.get(cell) !== value) cell.dataset.flip = cell.dataset.flip === 'a' ? 'b' : 'a'
        seen.set(cell, value)
      })
    }, 150)
    return () => clearInterval(id)
  }, [])
}

function Hero({ partner1, partner2, timeLabel, city, place, c, lang }) {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
  const { eventDate } = useWeddingCardFields(defaults, locale)
  const [status, setStatus] = useState(0)
  useFlipCountdown()
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = setInterval(() => setStatus((s) => (s + 1) % 3), 7000)
    return () => clearInterval(id)
  }, [])

  const b = boardCopy[lang] ?? boardCopy.en
  const up = (value) => String(value || '').toLocaleUpperCase(locale)
  const destination = up(String(city || '').split(',').pop().trim() || city)
  const names = `${up(partner1)} & ${up(partner2)}`
  const shortDate = up(eventDate.toLocaleDateString(locale, { day: '2-digit', month: 'short' }).replace('.', ''))
  const flight = `${up(partner1).charAt(0)}${up(partner2).charAt(0)} ${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}`
  const nameRows =
    names.length > 14
      ? [
          [{ label: b.passengers, text: `${up(partner1)} &`, cols: 12, big: true }],
          [{ label: ' ', text: up(partner2), cols: 12, big: true }],
        ]
      : [[{ label: b.passengers, text: names, cols: Math.max(12, names.length), big: true }]]
  const rows = [
    ...nameRows,
    [{ label: b.destination, text: destination, cols: Math.max(12, destination.length) }],
    [
      { label: b.flight, text: flight, cols: 7 },
      { label: b.time, text: timeLabel, cols: 5 },
    ],
    [
      { label: b.date, text: shortDate, cols: 6 },
      { label: b.gate, text: 'B12', cols: 3 },
    ],
    [{ label: b.remarks, text: b.status[status], cols: 12, accent: true }],
  ]

  return (
    <header className="dp-hero">
      <SkyHero />
      <div className="dp-hero-inner">
        <p className="dp-eyebrow">{c.tagline}</p>
        <h1 className="dp-sr">
          {partner1} &amp; {partner2}
        </h1>
        <SplitFlapBoard
          title={b.title}
          clockLabel={b.clock}
          rows={rows}
          summary={b.summary(`${partner1} & ${partner2}`, destination, shortDate, timeLabel)}
        />
        <p className="dp-place">{place}</p>
      </div>
      <RouteMap city={city} caption={c.route} label={b.mapLabel(destination)} />
    </header>
  )
}

const ornament = (
  <svg viewBox="0 0 220 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M2 18 Q60 -2 100 12" strokeDasharray="2 5" />
    <path d="M120 12 Q160 26 218 6" strokeDasharray="2 5" />
    <path d="M118 12 104 6.5l2.8 5.5-2.8 5.5Z" fill="currentColor" stroke="none" />
  </svg>
)

const swatches = ['#3a86ff', '#9cc7f6', '#ffffff', '#f4d35e', '#ee6c4d']

const content = {
  en: {
    tagline: 'Gate B12 · destination: forever',
    route:
      'Fly into Santorini (JTR): direct in summer from most European hubs, or 45 minutes from Athens. The ferry from Piraeus takes five to eight hours and is beautiful. We’ll meet you at arrivals.',
    welcome:
      'Pack light, bring sunglasses and leave room for a very long dinner. We’re getting married on a caldera at sunset, and our favourite people are on the passenger list.',
    story: [
      { when: '2019', title: 'Seats 14A & 14B', text: '{partner1} and {partner2} met on a delayed flight to Lisbon. Four hours on the tarmac, one shared bag of almonds, and a conversation that never landed.' },
      { when: '2022', title: 'Long haul', text: 'Two cities, one time difference and a lot of boarding passes. We learned every airport lounge between us by heart.' },
      { when: '2026', title: 'Final destination', text: 'On a terrace in Oia, as the sun dropped into the sea, one question and no hesitation.' },
    ],
    schedule: [
      { time: '16:30', title: 'Shuttle departs', text: 'Coaches leave Fira bus station for {venue}. Look for the yellow sign.' },
      { time: '17:30', title: 'Welcome drinks', text: 'Assyrtiko and cold lemonade on the terrace, high above the caldera.' },
      { time: '18:00', title: 'Ceremony', text: 'A short, sunlit ceremony facing the volcano.' },
      { time: '19:30', title: 'Dinner', text: 'Island cooking at long tables, as the sky turns pink.' },
      { time: '21:00', title: 'First dance', text: 'Then the dance floor is yours.' },
      { time: '00:30', title: 'Last shuttle', text: 'Back to Fira and Oia — no one gets left at the gate.' },
    ],
    venueNote:
      'Santo Wines sits on the caldera cliffs at Pyrgos, about fifteen minutes from Fira. Shuttles run from Fira before the ceremony and after midnight; taxis on the island are scarce in July, so book ahead.',
    dressCode: {
      title: 'Summer formal, island light',
      text: 'Linen, light suits, flowing dresses in sky and sunset colours. The terrace is stone — leave the stilettos at home and bring a layer for the sea breeze.',
      swatches,
    },
    gifts: {
      title: 'Your journey is the gift',
      text: 'You are flying a long way to be with us, and that means everything. If you would still like to give something, a contribution to our honeymoon fund would be lovely.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Thank you for flying with us — next stop, forever.',
  },
  tr: {
    tagline: 'B12 kapısı · varış: sonsuza dek',
    route:
      'Santorini’ye (JTR) uçun: yazın çoğu Avrupa merkezinden direkt sefer var, Atina’dan ise 45 dakika. Pire’den feribot beş ila sekiz saat sürer ve çok güzeldir. Sizi gelen yolcu çıkışında karşılayacağız.',
    welcome:
      'Valizinizi hafif tutun, güneş gözlüğünüzü alın ve çok uzun bir akşam yemeğine yer bırakın. Gün batımında, bir kalderanın üstünde evleniyoruz ve en sevdiklerimiz yolcu listemizde.',
    story: [
      { when: '2019', title: 'Koltuk 14A ve 14B', text: '{partner1} ve {partner2}, Lizbon’a giden rötarlı bir uçakta tanıştı. Pistte dört saat, paylaşılan bir paket badem ve hiç inmeyen bir sohbet.' },
      { when: '2022', title: 'Uzun yol', text: 'İki şehir, bir saat farkı ve sayısız biniş kartı. Aramızdaki her havalimanı salonunu ezberledik.' },
      { when: '2026', title: 'Son durak', text: 'Oia’da bir terasta, güneş denize batarken tek bir soru ve hiç tereddüt yok.' },
    ],
    schedule: [
      { time: '16:30', title: 'Servis kalkışı', text: 'Otobüsler Fira terminalinden {venue} için kalkıyor. Sarı tabelayı arayın.' },
      { time: '17:30', title: 'Karşılama', text: 'Kalderanın tepesinde, terasta Assyrtiko ve buz gibi limonata.' },
      { time: '18:00', title: 'Nikâh', text: 'Volkana karşı, güneşli ve kısa bir tören.' },
      { time: '19:30', title: 'Akşam yemeği', text: 'Gökyüzü pembeye dönerken uzun masalarda ada mutfağı.' },
      { time: '21:00', title: 'İlk dans', text: 'Sonra dans pisti sizin.' },
      { time: '00:30', title: 'Son servis', text: 'Fira ve Oia’ya dönüş — kimse kapıda kalmıyor.' },
    ],
    venueNote:
      'Santo Wines, Pyrgos’ta kaldera yamaçlarında, Fira’ya yaklaşık on beş dakika uzaklıkta. Servisler törenden önce Fira’dan ve gece yarısından sonra geri kalkıyor; temmuzda adada taksi bulmak zor, önceden ayırtın.',
    dressCode: {
      title: 'Yaz şıklığı, ada ışığı',
      text: 'Keten, açık renk takımlar, gökyüzü ve gün batımı renklerinde uçuşan elbiseler. Teras taş zeminli — ince topukluları evde bırakın, deniz meltemi için yanınıza bir hırka alın.',
      swatches,
    },
    gifts: {
      title: 'En güzel hediye yolculuğunuz',
      text: 'Bizimle olmak için uzun bir yol geliyorsunuz ve bu bizim için her şey. Yine de bir şey yapmak isterseniz balayı fonumuza katkınız bizi çok mutlu eder.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Bizimle uçtuğunuz için teşekkürler — sıradaki durak: sonsuzluk.',
  },
}

const theme = {
  className: 'theme-departures',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@500;600;700&display=swap',
  ornament,
  Hero,
}

export default function DeparturesPage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="en" />
}
