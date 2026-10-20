import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Invitation from '../../engine/Invitation.jsx'
import { fill } from '../../engine/i18n.js'
import { useWeddingCardFields } from '../../api/weddingCardContext'
import TurntableHero from './TurntableHero.jsx'
import { useSlot } from './useSlot.js'
import './b-side.css'

const defaults = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-08-21T18:30:00+03:00',
  venue: 'Moda Deniz Kulübü',
  city: 'Kadıköy, İstanbul',
  address: 'Moda Deniz Kulübü, Caferağa, Moda',
  rsvpDeadline: '10 July 2027',
}

const songCopy = {
  en: {
    label: 'Request a song',
    placeholder: 'Artist — song title',
    hint: 'We’ll make sure it gets played.',
    noted: '“{song}” is on the playlist.',
  },
  tr: {
    label: 'Bir şarkı isteyin',
    placeholder: 'Sanatçı — şarkı adı',
    hint: 'Çalınmasını biz sağlarız.',
    noted: '“{song}” çalma listesinde.',
  },
}

// "Request a song" lives inside the engine's RSVP form, just above the note.
function SongRequest({ lang }) {
  const fieldSlot = useSlot('.theme-bside form.inv-rsvp > label.inv-field:last-of-type', 'beforebegin', 'bs-song-slot')
  const noteSlot = useSlot('.theme-bside .inv-rsvp-thanks', 'afterend', 'bs-song-note-slot')
  const [song, setSong] = useState('')
  useEffect(() => {
    const onSubmit = (event) => {
      if (!event.target.matches?.('.theme-bside form.inv-rsvp')) return
      setSong(String(new FormData(event.target).get('song') || '').trim())
    }
    document.addEventListener('submit', onSubmit, true)
    return () => document.removeEventListener('submit', onSubmit, true)
  }, [])
  const copy = songCopy[lang] ?? songCopy.en
  return (
    <>
      {createPortal(
        <label className="inv-field bs-song">
          <span>{copy.label}</span>
          <input name="song" placeholder={copy.placeholder} autoComplete="off" maxLength={200} />
          <small>{copy.hint}</small>
        </label>,
        fieldSlot,
      )}
      {song ? createPortal(<p className="bs-song-note">{fill(copy.noted, { song })}</p>, noteSlot) : null}
    </>
  )
}

// Countdown as VU meters: each needle reads its own unit.
function useVuMeters() {
  useEffect(() => {
    const ranges = [365, 24, 60, 60]
    const id = setInterval(() => {
      document.querySelectorAll('.theme-bside .inv-countdown-cell').forEach((cell, i) => {
        const value = parseInt(cell.querySelector('.inv-countdown-value')?.textContent ?? '0', 10) || 0
        cell.style.setProperty('--level', Math.min(1, value / ranges[i % 4]).toFixed(3))
      })
    }, 250)
    return () => clearInterval(id)
  }, [])
}

function Hero({ partner1, partner2, dateLabel, place, c, lang }) {
  const { eventDate } = useWeddingCardFields(defaults, lang === 'tr' ? 'tr-TR' : 'en-GB')
  useVuMeters()
  return (
    <header className="bs-hero">
      <TurntableHero partner1={partner1} partner2={partner2} dateText={dateLabel} place={place} date={eventDate} lang={lang} />
      <div className="bs-hero-copy">
        <p className="bs-eyebrow">{c.tagline}</p>
        <h1 className="bs-names">
          <span>{partner1}</span>
          <span>
            <em>&amp;</em> {partner2}
          </span>
        </h1>
        <p className="bs-date">{dateLabel}</p>
        <p className="bs-place">{place}</p>
        <p className="bs-now">
          <span className="bs-eq" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          {c.nowPlaying}
        </p>
      </div>
      <div className="bs-hero-stripes" aria-hidden="true" />
      <SongRequest lang={lang} />
    </header>
  )
}

const ornament = (
  <svg viewBox="0 0 220 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M0 12 H70 M150 12 H220" />
    <path d="M78 10v4 M84 7v10 M90 4v16 M96 8v8 M102 2v20 M108 6v12 M114 9v6 M120 3v18 M126 7v10 M132 5v14 M138 9v6 M144 11v2" />
  </svg>
)

const swatches = ['#f2c14e', '#e4572e', '#3a6ea5', '#f7f1e3', '#1a1a1a']

const content = {
  en: {
    tagline: 'Side A · our love song',
    nowPlaying: 'Now playing — I Do (Forever Mix)',
    welcome:
      'Some songs you hear once and carry for the rest of your life. Ours started quietly, on a Tuesday, and hasn’t stopped playing since. Come and hear the best part with us.',
    story: [
      { when: '2018', title: 'The first listen', text: '{partner1} and {partner2} reached for the same Fleetwood Mac record at a Kadıköy flea market. Neither let go — we split the price, then the coffee after.' },
      { when: '2021', title: 'The long-player', text: 'A tiny flat in Moda, one turntable and two record collections that somehow never doubled up.' },
      { when: '2026', title: 'The B-side', text: 'On the ferry to Büyükada, between two songs on a borrowed cassette player, came the question — and the yes.' },
    ],
    schedule: [
      { time: '17:30', title: 'Doors & welcome drinks', text: 'Lemonade, rakı and a warm-up playlist on the terrace at {venue}.' },
      { time: '18:30', title: 'The vows', text: 'A short ceremony by the water as the light turns gold over Moda.' },
      { time: '19:15', title: 'Golden hour', text: 'Photos, toasts and a moment to catch your breath.' },
      { time: '20:00', title: 'Dinner', text: 'Long tables, meze and stories from the people who knew us first.' },
      { time: '21:30', title: 'First dance', text: 'We’ve practised. Please be kind.' },
      { time: '22:00', title: 'The dance floor', text: 'Your song requests, on vinyl, until late.' },
    ],
    venueNote:
      'The club sits right on the water in Moda. From the European side, take the ferry to Kadıköy and walk ten minutes along the shore — there is no better way to arrive.',
    dressCode: {
      title: 'Seventies, but make it summer',
      text: 'Warm tones, wide collars, flowing dresses, a sharp suit — whatever makes you want to dance. Flat shoes are wise for the seaside garden.',
      swatches,
    },
    gifts: {
      title: 'Your company is the gift',
      text: 'If you would like to add something, a contribution to our honeymoon — and the record shops we will certainly get lost in — would mean a lot.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Play it again — forever.',
  },
  tr: {
    tagline: 'A yüzü · aşk şarkımız',
    nowPlaying: 'Şimdi çalıyor — Evet (Sonsuz Versiyon)',
    welcome:
      'Bazı şarkıları bir kez duyar, ömür boyu yanınızda taşırsınız. Bizimki bir salı günü sessizce başladı ve o günden beri hiç susmadı. En güzel kısmını bizimle dinlemeye gelin.',
    story: [
      { when: '2018', title: 'İlk dinleyiş', text: '{partner1} ve {partner2}, Kadıköy’deki bir bit pazarında aynı Fleetwood Mac plağına uzandı. İkisi de bırakmadı; plağın parasını da ardından içilen kahveyi de paylaştılar.' },
      { when: '2021', title: 'Uzunçalar', text: 'Moda’da küçücük bir daire, tek bir pikap ve nasılsa hiç çakışmayan iki plak koleksiyonu.' },
      { when: '2026', title: 'B yüzü', text: 'Büyükada vapurunda, ödünç bir kasetçalarda iki şarkının arasında soru geldi — cevap da: evet.' },
    ],
    schedule: [
      { time: '17:30', title: 'Kapılar ve karşılama', text: '{venue} terasında limonata, rakı ve ısınma listesi.' },
      { time: '18:30', title: 'Nikâh', text: 'Moda’da ışık altın rengine dönerken, deniz kıyısında kısa bir tören.' },
      { time: '19:15', title: 'Altın saat', text: 'Fotoğraflar, kadehler ve biraz soluklanma.' },
      { time: '20:00', title: 'Akşam yemeği', text: 'Uzun masalar, mezeler ve bizi ilk tanıyanlardan hikâyeler.' },
      { time: '21:30', title: 'İlk dans', text: 'Çalıştık. Lütfen anlayışlı olun.' },
      { time: '22:00', title: 'Dans pisti', text: 'İstediğiniz şarkılar, plaktan, gece geç saatlere kadar.' },
    ],
    venueNote:
      'Kulüp, Moda’da tam denizin kıyısında. Avrupa yakasından vapurla Kadıköy’e geçip sahil boyunca on dakika yürüyebilirsiniz — bundan güzel bir varış yok.',
    dressCode: {
      title: 'Yetmişler, ama yaz hâli',
      text: 'Sıcak tonlar, geniş yakalar, uçuşan elbiseler, keskin bir takım — sizi dansa kaldıracak ne varsa. Deniz kenarındaki bahçe için düz ayakkabı iyi fikir.',
      swatches,
    },
    gifts: {
      title: 'En güzel hediye sizsiniz',
      text: 'Yine de bir katkıda bulunmak isterseniz, balayımıza — ve orada mutlaka kaybolacağımız plakçılara — katkınız bizi çok mutlu eder.',
      holder: 'Jane & Joe',
      iban: 'TR00 0000 0000 0000 0000 0000 00',
    },
    quote: 'Bir kez daha çal — sonsuza dek.',
  },
}

const theme = {
  className: 'theme-bside',
  fontsHref:
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap',
  ornament,
  Hero,
}

export default function BSidePage() {
  return <Invitation theme={theme} defaults={defaults} content={content} lang="en" />
}
