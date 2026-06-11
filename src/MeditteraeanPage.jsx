import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const storyCards = [
  {
    label: 'Names',
    value: 'Name & Name',
    note: 'Keep the couple names and invitation line clear and easy to replace.',
  },
  {
    label: 'Date',
    value: 'September 18, 2027',
    note: 'One clean date block makes the template feel more ceremonial and direct.',
  },
  {
    label: 'Venue',
    value: 'Ceremony venue',
    note: 'Leave space for the venue name, timing, and one short supporting note.',
  },
]

const showcaseMoments = [
  {
    name: 'Arrival',
    title: 'Start with the welcome, the first gathering, and the opening atmosphere.',
    description:
      'Use this scene for guest arrival, welcome drinks, a short reception note, or the first chapter of the day. The text stays generic so you only replace the details for each couple.',
    artwork: 'arrival',
    kicker: 'Order of the day',
  },
  {
    name: 'Ceremony',
    title: 'Keep the ceremony moment elegant, focused, and easy to understand.',
    description:
      'This panel can describe the vows, entrance time, seating note, or the most important ceremony instructions without locking the template to one specific story.',
    artwork: 'ceremony',
    kicker: 'Main moment',
  },
  {
    name: 'Celebration',
    title: 'End with dinner, dancing, and the celebration chapter of the invitation.',
    description:
      'Use the final scene for dinner, party details, after-party note, or a simple closing line. The layout stays the same even when the couple and venue change.',
    artwork: 'celebration',
    kicker: 'Final scene',
  },
]

const timelineItems = [
  {
    time: '16:30',
    title: 'Arrival & welcome',
    description: 'Guests arrive, welcome drinks are served, and the first photos begin.',
  },
  {
    time: '18:00',
    title: 'Ceremony',
    description: 'Main vows, entrance music, and the signature invitation moment.',
  },
  {
    time: '19:30',
    title: 'Dinner',
    description: 'Dinner service, speeches, table styling, and soft sunset lighting.',
  },
  {
    time: '21:00',
    title: 'Celebration',
    description: 'Cake, dancing, after party, and the night-time social moments.',
  },
]

const detailCards = [
  {
    label: 'Dress code',
    value: 'Formal attire',
    note: 'Replace with formal, cocktail, black tie, or a simple dress suggestion.',
  },
  {
    label: 'RSVP deadline',
    value: '01 July 2027',
    note: 'Use one clear date so guests know when to respond.',
  },
  {
    label: 'Transport',
    value: 'Travel details',
    note: 'This block works for parking, shuttle times, or arrival instructions.',
  },
  {
    label: 'Gentle note',
    value: 'No white attire',
    note: 'Use this for age policy, ceremony etiquette, or any brief guest reminder.',
  },
]

const faqItems = [
  {
    question: 'Can this section be used for gifts?',
    answer:
      'Yes. You can replace this answer with a gifts note, cash registry, or a simple message that the couple values presence above presents.',
  },
  {
    question: 'Can guests RSVP through this page later?',
    answer:
      'Yes. The countdown, final call to action, or a dedicated RSVP button can later connect to a real form, WhatsApp link, or external RSVP tool.',
  },
  {
    question: 'Can this include accommodation and travel notes?',
    answer:
      'Yes. This template is meant to stay generic while still holding hotel suggestions, transfer details, local tips, or family notes.',
  },
  {
    question: 'Can the same design work for multiple weddings?',
    answer:
      'Yes. That is the purpose of this page. You should only need to update names, date, venue, schedule, and images while keeping the design system intact.',
  },
]

const chapterMoments = [
  {
    label: 'First chapter',
    title: 'Guests arrive into a softer Mediterranean welcome.',
    note:
      'Use this chapter for arrival drinks, greeting notes, or the first atmosphere-setting moment of the invitation.',
    artwork: 'arrival',
  },
  {
    label: 'Second chapter',
    title: 'The ceremony becomes the calm centerpiece of the story.',
    note:
      'This pinned chapter is good for vows, the main venue frame, or the emotional heart of the celebration.',
    artwork: 'ceremony',
  },
  {
    label: 'Final chapter',
    title: 'The invitation ends in dinner, music, and celebration.',
    note:
      'Use the closing scene for the reception, after-party, or a final invitation note before guests reach RSVP details.',
    artwork: 'celebration',
  },
]

const templateDate = new Date('2027-08-12T18:00:00')

function getCountdownParts(targetDate) {
  const difference = Math.max(targetDate.getTime() - Date.now(), 0)
  const totalSeconds = Math.floor(difference / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [
    { label: 'Days', value: String(days).padStart(2, '0') },
    { label: 'Hours', value: String(hours).padStart(2, '0') },
    { label: 'Minutes', value: String(minutes).padStart(2, '0') },
    { label: 'Seconds', value: String(seconds).padStart(2, '0') },
  ]
}

function CountdownDigit({ value }) {
  const wrapperRef = useRef(null)
  const currentRef = useRef(null)
  const previousRef = useRef(null)
  const [displayValue, setDisplayValue] = useState(value)
  const [previousValue, setPreviousValue] = useState(null)

  useEffect(() => {
    if (value === displayValue) return

    setPreviousValue(displayValue)
    setDisplayValue(value)
  }, [value, displayValue])

  useEffect(() => {
    if (!previousValue || !currentRef.current || !previousRef.current) return

    const ctx = gsap.context(() => {
      gsap.set(currentRef.current, { yPercent: -100, opacity: 0 })

      gsap.to(previousRef.current, {
        yPercent: 110,
        opacity: 0,
        duration: 0.42,
        ease: 'power2.in',
      })

      gsap.to(currentRef.current, {
        yPercent: 0,
        opacity: 1,
        duration: 0.42,
        ease: 'power2.out',
        onComplete: () => {
          setPreviousValue(null)
          gsap.set(currentRef.current, { clearProps: 'all' })
        },
      })
    }, wrapperRef)

    return () => ctx.revert()
  }, [previousValue, displayValue])

  return (
    <div
      ref={wrapperRef}
      className="relative h-[1.1em] w-[0.75em] overflow-hidden"
      aria-hidden="true"
    >
      {previousValue !== null && (
        <span
          ref={previousRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          {previousValue}
        </span>
      )}
      <span
        ref={currentRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {displayValue}
      </span>
    </div>
  )
}

function SectionIllustration({ variant = 'sun', className = '' }) {
  if (variant === 'shell') {
    return (
      <svg
        viewBox="0 0 180 180"
        className={`${className} illustration illustration-shell`}
        aria-hidden="true"
        fill="none"
      >
        <path
          className="draw-stroke"
          d="M90 146C122.033 146 148 120.033 148 88C148 66.5 133.5 44.5 112 35"
          stroke="#F1D4AF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="draw-stroke"
          d="M90 146C57.9675 146 32 120.033 32 88C32 66.5 46.5 44.5 68 35"
          stroke="#B8D8E1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path className="draw-stroke" d="M90 36V146" stroke="#E9F3F6" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M68 48L90 146L112 48" stroke="#E9F3F6" strokeWidth="3" strokeLinecap="round" />
        <path className="draw-stroke" d="M50 67L90 146L130 67" stroke="#E9F3F6" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  if (variant === 'wave') {
    return (
      <svg
        viewBox="0 0 220 120"
        className={`${className} illustration illustration-wave`}
        aria-hidden="true"
        fill="none"
      >
        <path
          className="draw-stroke"
          d="M6 72C28 52 44 52 66 72C88 92 104 92 126 72C148 52 164 52 186 72C198 83 207 87 214 88"
          stroke="#B8D8E1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="draw-stroke"
          d="M6 48C28 28 44 28 66 48C88 68 104 68 126 48C148 28 164 28 186 48C198 59 207 63 214 64"
          stroke="#F1D4AF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle className="draw-fill" cx="168" cy="22" r="10" fill="#F1D4AF" fillOpacity="0.9" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 180 180"
      className={`${className} illustration illustration-sun`}
      aria-hidden="true"
      fill="none"
    >
      <circle className="draw-fill" cx="90" cy="90" r="28" fill="#F1D4AF" fillOpacity="0.95" />
      <path className="draw-stroke" d="M90 20V46" stroke="#F1D4AF" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M90 134V160" stroke="#F1D4AF" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M20 90H46" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M134 90H160" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M40 40L58 58" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M122 122L140 140" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M40 140L58 122" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
      <path className="draw-stroke" d="M122 58L140 40" stroke="#B8D8E1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function OrnateDivider({ className = '', tone = 'light' }) {
  const stroke = tone === 'light' ? '#E9F3F6' : '#224C59'
  const accent = tone === 'light' ? '#F1D4AF' : '#86C5D8'

  return (
    <svg
      viewBox="0 0 320 70"
      className={`${className} illustration illustration-divider`}
      aria-hidden="true"
      fill="none"
    >
      <path
        className="draw-stroke"
        d="M12 35H98C118 35 126 23 136 23C146 23 150 35 160 35"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M308 35H222C202 35 194 23 184 23C174 23 170 35 160 35"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M136 23C140 36 148 45 160 47C172 45 180 36 184 23"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        className="draw-stroke"
        d="M142 20C148 14 154 12 160 12C166 12 172 14 178 20"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle className="draw-fill" cx="160" cy="35" r="4.5" fill={accent} />
      <circle className="draw-fill" cx="126" cy="23" r="3.5" fill={accent} fillOpacity="0.9" />
      <circle className="draw-fill" cx="194" cy="23" r="3.5" fill={accent} fillOpacity="0.9" />
    </svg>
  )
}

function MediterraneanArtwork({ variant = 'hero', className = '' }) {
  if (variant === 'hero') {
    return (
      <div
        className={`${className} relative overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,213,163,0.45),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(158,209,223,0.3),transparent_26%),linear-gradient(180deg,#86c5d8_0%,#59aac2_30%,#2f6f85_58%,#163847_100%)]`}
      >
        <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_24%_28%,rgba(255,255,255,0.32),transparent_24%),radial-gradient(circle_at_78%_26%,rgba(255,213,163,0.24),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_58%)] opacity-80 mix-blend-screen" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(250,246,237,0)_0%,rgba(250,246,237,0.08)_32%,rgba(22,56,71,0.74)_100%)]" />
        <div className="art-float absolute left-[10%] top-[16%] h-32 w-32 rounded-full border border-white/30 bg-white/12 backdrop-blur-sm" />
        <div className="art-float absolute right-[12%] top-[12%] h-24 w-24 rounded-full border border-[#ffd5a3]/45 bg-[#ffd5a3]/18 backdrop-blur-sm" />
        <svg viewBox="0 0 1200 800" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path
            className="draw-stroke"
            d="M0 536C112 516 214 500 338 516C458 532 576 584 704 578C858 570 940 484 1076 474C1126 470 1168 474 1200 482"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="draw-stroke"
            d="M0 586C92 566 212 560 324 580C434 600 532 656 654 654C810 650 932 570 1044 558C1108 550 1158 556 1200 566"
            stroke="rgba(255,213,163,0.7)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className="draw-stroke"
            d="M86 318C160 252 238 214 314 194C436 162 534 188 640 240C710 274 798 328 888 328C968 328 1046 288 1116 232"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute bottom-[18%] left-[8%] h-52 w-80 rounded-[60%_40%_20%_80%/50%_55%_45%_50%] bg-[linear-gradient(180deg,rgba(247,250,252,0.95),rgba(236,244,246,0.42))]" />
        <div className="absolute bottom-[13%] left-[26%] h-60 w-56 rounded-[45%_55%_0%_100%/35%_35%_65%_65%] bg-[linear-gradient(180deg,rgba(250,246,237,0.88),rgba(250,246,237,0.46))]" />
        <div className="absolute bottom-[10%] right-[18%] h-56 w-44 rounded-[48%_52%_0%_100%/28%_28%_72%_72%] bg-[linear-gradient(180deg,rgba(247,250,252,0.84),rgba(247,250,252,0.38))]" />
        <div className="absolute bottom-[9%] right-[7%] h-40 w-28 rounded-[45%_55%_0%_100%/24%_24%_76%_76%] bg-[linear-gradient(180deg,rgba(255,241,217,0.9),rgba(255,241,217,0.42))]" />
      </div>
    )
  }

  if (variant === 'arrival') {
    return (
      <div className={`${className} relative overflow-hidden bg-[linear-gradient(180deg,#9ad2e0_0%,#4ea0b7_46%,#163847_100%)]`}>
        <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(255,255,255,0.24),transparent_22%),radial-gradient(circle_at_76%_22%,rgba(255,213,163,0.26),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_70%)] opacity-85 mix-blend-screen" />
        <div className="art-float absolute left-8 top-8 h-16 w-16 rounded-full border border-white/35 bg-white/15" />
        <div className="art-float absolute right-10 top-12 h-10 w-10 rounded-full border border-[#ffd5a3]/40 bg-[#ffd5a3]/22" />
        <div className="absolute inset-x-8 top-10 rounded-full border border-white/18 bg-white/8 px-4 py-2 text-center text-[10px] uppercase tracking-[0.34em] text-white/80 backdrop-blur-sm">
          Welcome drinks
        </div>
        <svg viewBox="0 0 700 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path className="draw-stroke" d="M0 286C108 244 180 242 268 272C336 296 404 332 486 320C564 308 614 258 700 236" stroke="rgba(255,255,255,0.34)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path className="draw-stroke" d="M0 342C116 310 192 308 286 338C352 360 420 392 506 388C592 384 636 344 700 322" stroke="rgba(255,213,163,0.72)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 h-[46%] bg-[linear-gradient(180deg,transparent,rgba(12,32,40,0.78))]" />
        <div className="art-card absolute bottom-10 left-10 right-10 rounded-[2rem] border border-white/14 bg-white/10 p-5 backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.3em] text-[#d8eef5]">Arrival moment</div>
          <div className="mt-3 font-display text-4xl text-white">Set the mood gently.</div>
        </div>
      </div>
    )
  }

  if (variant === 'ceremony') {
    return (
      <div className={`${className} relative overflow-hidden bg-[linear-gradient(180deg,#f4e3c7_0%,#e9cfa7_28%,#94c3d1_56%,#173b48_100%)]`}>
        <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_20%_26%,rgba(255,255,255,0.26),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(34,76,89,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_72%)] opacity-80 mix-blend-screen" />
        <div className="art-float absolute left-[14%] top-[12%] h-14 w-14 rounded-full border border-white/40 bg-white/14" />
        <div className="art-float absolute right-[12%] top-[18%] h-24 w-24 rounded-full border border-[#224c59]/15 bg-[#224c59]/10" />
        <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,rgba(250,246,237,0),rgba(22,56,71,0.78))]" />
        <div className="absolute bottom-[15%] left-[14%] h-[48%] w-[32%] rounded-t-[10rem] bg-[linear-gradient(180deg,rgba(247,250,252,0.96),rgba(247,250,252,0.52))]" />
        <div className="absolute bottom-[15%] left-[35%] h-[38%] w-[12%] rounded-t-[5rem] bg-[linear-gradient(180deg,rgba(255,244,227,0.96),rgba(255,244,227,0.56))]" />
        <div className="absolute bottom-[15%] right-[14%] h-[40%] w-[22%] rounded-t-[6rem] bg-[linear-gradient(180deg,rgba(247,250,252,0.92),rgba(247,250,252,0.48))]" />
        <svg viewBox="0 0 700 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path className="draw-stroke" d="M158 408V202C158 164 190 132 230 132H470C510 132 542 164 542 202V408" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="draw-stroke" d="M258 132V88C258 66 276 48 298 48H402C424 48 442 66 442 88V132" stroke="rgba(34,76,89,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  if (variant === 'celebration') {
    return (
      <div className={`${className} relative overflow-hidden bg-[linear-gradient(180deg,#173847_0%,#224c59_48%,#102a34_100%)]`}>
        <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,213,163,0.22),transparent_18%),radial-gradient(circle_at_74%_24%,rgba(184,216,225,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_72%)] opacity-90 mix-blend-screen" />
        <div className="art-float absolute left-[12%] top-[16%] h-20 w-20 rounded-full border border-[#ffd5a3]/40 bg-[#ffd5a3]/16" />
        <div className="art-float absolute right-[10%] top-[12%] h-12 w-12 rounded-full border border-white/30 bg-white/10" />
        <div className="absolute inset-x-10 top-10 flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-white/70">
          <span>Dinner</span>
          <span>Dancing</span>
          <span>After party</span>
        </div>
        <svg viewBox="0 0 700 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path className="draw-stroke" d="M102 372C138 310 200 250 276 220C352 190 418 196 498 222C560 242 616 274 654 310" stroke="rgba(255,213,163,0.72)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path className="draw-stroke" d="M112 412C166 334 248 286 332 274C416 262 496 284 588 342" stroke="rgba(184,216,225,0.48)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <div className="absolute bottom-14 left-[12%] right-[12%] grid grid-cols-3 gap-4">
          {['Toast', 'Cake', 'Music'].map((item) => (
            <div
              key={item}
              className="art-card rounded-[1.6rem] border border-white/14 bg-white/10 px-4 py-5 text-center text-white backdrop-blur-sm"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#d8eef5]">{item}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'gallery') {
    return (
      <div className={`${className} relative overflow-hidden bg-[linear-gradient(135deg,#173847_0%,#2e7288_34%,#8ac6d8_62%,#f2dcc0_100%)]`}>
        <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.28),transparent_22%),radial-gradient(circle_at_80%_26%,rgba(255,213,163,0.22),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_62%)] opacity-90 mix-blend-screen" />
        <div className="art-float absolute left-[8%] top-[10%] h-24 w-24 rounded-full border border-white/32 bg-white/12" />
        <div className="art-float absolute right-[14%] top-[14%] h-16 w-16 rounded-full border border-[#ffd5a3]/36 bg-[#ffd5a3]/18" />
        <div className="absolute left-[9%] top-[24%] h-[52%] w-[26%] rounded-[3rem] bg-[linear-gradient(180deg,rgba(248,250,251,0.95),rgba(248,250,251,0.54))]" />
        <div className="absolute left-[38%] top-[18%] h-[64%] w-[23%] rounded-[8rem] bg-[linear-gradient(180deg,rgba(245,230,205,0.94),rgba(245,230,205,0.44))]" />
        <div className="absolute right-[10%] top-[26%] h-[48%] w-[28%] rounded-[2.4rem] bg-[linear-gradient(180deg,rgba(20,55,69,0.92),rgba(20,55,69,0.42))]" />
        <svg viewBox="0 0 1200 700" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path className="draw-stroke" d="M80 580C252 520 416 504 580 540C708 568 822 622 960 610C1044 602 1112 578 1160 546" stroke="rgba(255,255,255,0.34)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="draw-stroke" d="M112 110C182 78 276 74 350 116C406 148 458 204 530 212C594 218 654 184 712 154C820 98 942 82 1068 116" stroke="rgba(255,213,163,0.72)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`${className} relative overflow-hidden bg-[linear-gradient(180deg,#a7d7e4_0%,#6db5c7_38%,#224c59_100%)]`}>
      <div className="art-gradient absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(255,255,255,0.24),transparent_22%),radial-gradient(circle_at_80%_22%,rgba(255,213,163,0.18),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.12),transparent_72%)] opacity-85 mix-blend-screen" />
      <div className="art-float absolute left-8 top-8 h-16 w-16 rounded-full border border-white/30 bg-white/12" />
      <div className="art-float absolute right-8 top-12 h-12 w-12 rounded-full border border-[#ffd5a3]/40 bg-[#ffd5a3]/18" />
      <div className="absolute inset-x-8 bottom-8 rounded-[2rem] border border-white/14 bg-white/10 p-6 backdrop-blur-md">
        <div className="text-xs uppercase tracking-[0.3em] text-[#d8eef5]">Guest details</div>
        <div className="mt-3 font-display text-4xl text-white">Useful notes, softly framed.</div>
      </div>
      <svg viewBox="0 0 700 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path className="draw-stroke" d="M0 296C118 242 202 232 308 262C390 286 466 336 566 330C618 326 662 312 700 290" stroke="rgba(255,255,255,0.34)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path className="draw-stroke" d="M0 348C122 312 208 306 314 340C388 364 468 406 570 404C626 402 668 388 700 372" stroke="rgba(255,213,163,0.72)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function MeditteraeanPage() {
  const root = useRef(null)
  const faqRefs = useRef([])
  const sceneCopyRef = useRef(null)
  const sceneMediaRef = useRef(null)
  const [countdown, setCountdown] = useState(() => getCountdownParts(templateDate))
  const [activeScene, setActiveScene] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownParts(templateDate))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const hoverCleanups = []

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      gsap.set('.hero-mask', {
        clipPath: 'inset(12% 8% 18% 8% round 3rem)',
        transformOrigin: 'center center',
      })
      gsap.set('.hero-main-card', { y: 32, opacity: 0, rotateX: 8, transformOrigin: 'center bottom' })
      gsap.set('.hero-side-stack', { x: 28, opacity: 0 })

      timeline
        .to('.hero-mask', {
          clipPath: 'inset(0% 0% 0% 0% round 0rem)',
          duration: 1.2,
          ease: 'power3.out',
        })
        .to(
          '.hero-main-card',
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.95,
            ease: 'power3.out',
          },
          '-=0.8',
        )
        .to(
          '.hero-side-stack',
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.62',
        )
        .from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.7 }, '-=0.55')
        .from(
          '.hero-word',
          { yPercent: 115, opacity: 0, rotate: 3, duration: 0.95, stagger: 0.08 },
          '-=0.48',
        )
        .from('.hero-sub', { y: 16, opacity: 0, duration: 0.7 }, '-=0.45')
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.55 }, '-=0.35')
        .from('.hero-meta', { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 }, '-=0.28')
        .from('.hero-panel', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.35')

      gsap.to('.hero-img', {
        yPercent: 10,
        scale: 1.04,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to('.hero-orb', {
        y: (index) => (index % 2 === 0 ? -26 : 22),
        x: (index) => (index % 2 === 0 ? 16 : -18),
        scale: (index) => (index % 2 === 0 ? 1.08 : 0.94),
        duration: (index) => 5 + index * 0.6,
        ease: 'sine.inOut',
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
      })

      gsap.to('.journal-orb', {
        y: (index) => (index % 2 === 0 ? -22 : 18),
        x: (index) => (index % 2 === 0 ? 12 : -14),
        scale: (index) => (index % 2 === 0 ? 1.05 : 0.96),
        duration: (index) => 6 + index * 0.5,
        ease: 'sine.inOut',
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
      })

      gsap.utils.toArray('.art-gradient').forEach((element, index) => {
        gsap.to(element, {
          scale: index % 2 === 0 ? 1.08 : 1.04,
          xPercent: index % 2 === 0 ? 4 : -4,
          yPercent: index % 2 === 0 ? -3 : 3,
          duration: 7 + index * 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      gsap.utils.toArray('.art-float').forEach((element, index) => {
        gsap.to(element, {
          y: index % 2 === 0 ? -18 : 16,
          x: index % 2 === 0 ? 12 : -10,
          rotate: index % 2 === 0 ? 8 : -7,
          duration: 4.6 + (index % 5) * 0.45,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      gsap.utils.toArray('.art-card').forEach((element, index) => {
        gsap.to(element, {
          y: index % 2 === 0 ? -8 : 8,
          duration: 3.8 + index * 0.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      })

      gsap.utils.toArray('.illustration').forEach((svg) => {
        const strokes = svg.querySelectorAll('.draw-stroke')
        const fills = svg.querySelectorAll('.draw-fill')

        strokes.forEach((path) => {
          const length = path.getTotalLength()
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          })
        })

        gsap.set(fills, { scale: 0.6, opacity: 0, transformOrigin: '50% 50%' })

        const illustrationTl = gsap.timeline({
          scrollTrigger: {
            trigger: svg,
            start: 'top 88%',
          },
        })

        illustrationTl
          .to(strokes, {
            strokeDashoffset: 0,
            duration: 1.15,
            stagger: 0.08,
            ease: 'power2.out',
          })
          .to(
            fills,
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: 'back.out(1.8)',
            },
            '-=0.5',
          )

        if (svg.classList.contains('illustration-sun')) {
          gsap.to(svg, {
            rotate: 8,
            duration: 6.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            transformOrigin: '50% 50%',
          })
        }

        if (svg.classList.contains('illustration-wave')) {
          gsap.to(svg.querySelectorAll('.draw-stroke'), {
            y: (index) => (index === 0 ? -3 : 3),
            duration: 2.6,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
            stagger: 0.08,
          })
        }
      })

      gsap.from('.countdown-shell', {
        scale: 0.94,
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#countdown-section',
          start: 'top 78%',
        },
      })

      gsap.from('.countdown-note', {
        x: (index) => (index === 0 ? -36 : 36),
        rotation: (index) => (index === 0 ? -4 : 4),
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#countdown-section',
          start: 'top 78%',
        },
      })

      gsap.from('.countdown-card', {
        y: (index) => (index % 2 === 0 ? 30 : 18),
        rotation: (index) => (index % 2 === 0 ? -5 : 5),
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.countdown-grid',
          start: 'top 82%',
        },
      })

      const aboutTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#about',
          start: 'top 72%',
        },
      })

      aboutTl
        .from('.about-copy [data-text-item]', {
          y: 24,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.about-chip',
          {
            y: 26,
            opacity: 0,
            scale: 0.95,
            rotation: (index) => (index - 1) * 3,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.35',
        )
        .from(
          '.mosaic-card',
          {
            clipPath: 'inset(18% 12% 18% 12% round 1.8rem)',
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power2.out',
          },
          '-=0.38',
        )

      const promiseTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#promise',
          start: 'top 74%',
        },
      })

      promiseTl
        .from('#promise .overflow-hidden', {
          opacity: 0,
          duration: 0.15,
          stagger: 0.05,
        })
        .from(
          '.mask-line',
          {
            yPercent: 112,
            skewY: 4,
            duration: 1,
            stagger: 0.12,
            ease: 'power4.out',
          },
          0.02,
        )
        .from(
          '#promise .illustration-divider',
          {
            opacity: 0,
            scaleX: 0.6,
            transformOrigin: 'left center',
            duration: 0.8,
            ease: 'power2.out',
          },
          0,
        )

      const showcaseTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#experiences',
          start: 'top 74%',
        },
      })

      showcaseTl
        .from('.showcase-head [data-text-item]', {
          y: 24,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.showcase-tabs button',
          {
            y: 14,
            opacity: 0,
            scale: 0.95,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power2.out',
          },
          '-=0.35',
        )
        .from(
          '.scene-copy',
          {
            x: -34,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.2',
        )
        .from(
          '.scene-media',
          {
            x: 42,
            opacity: 0,
            scale: 0.97,
            duration: 0.8,
            ease: 'power2.out',
          },
          '<',
        )

      const timelineTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#timeline-section',
          start: 'top 74%',
        },
      })

      timelineTl
        .from('.timeline-copy [data-text-item]', {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.timeline-line',
          {
            scaleX: 0,
            transformOrigin: 'left center',
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.15',
        )
        .from(
          '.timeline-card',
          {
            y: (index) => (index % 2 === 0 ? 28 : -28),
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
          },
          '-=0.3',
        )
        .from(
          '.timeline-dot',
          {
            scale: 0,
            duration: 0.35,
            stagger: 0.12,
            ease: 'back.out(2)',
          },
          '-=0.5',
        )

      gsap.from('.chapter-copy-panel', {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#chapters',
          start: 'top 72%',
        },
      })

      const chapterCards = gsap.utils.toArray('.chapter-card')
      const chapterVisuals = gsap.utils.toArray('.chapter-visual')
      const chapterProgress = gsap.utils.toArray('.chapter-progress')

      if (chapterCards.length && chapterVisuals.length) {
        gsap.set(chapterVisuals, {
          autoAlpha: (index) => (index === 0 ? 1 : 0),
          scale: (index) => (index === 0 ? 1 : 1.1),
          rotate: (index) => (index === 0 ? 0 : 2),
          clipPath: (index) =>
            index === 0
              ? 'inset(0% 0% 0% 0% round 2.2rem)'
              : 'inset(12% 10% 14% 10% round 2.2rem)',
        })
        gsap.set(chapterCards, {
          opacity: (index) => (index === 0 ? 1 : 0.35),
          y: (index) => (index === 0 ? 0 : 26),
          scale: (index) => (index === 0 ? 1 : 0.97),
        })
        gsap.set(chapterProgress, {
          scaleX: (index) => (index === 0 ? 1 : 0),
          transformOrigin: 'left center',
        })

        const chapterTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.chapter-shell',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.9,
          },
        })

        chapterTl.fromTo(
          '.chapter-stage',
          { scale: 0.94, rotate: -2, yPercent: 6 },
          { scale: 1, rotate: 0, yPercent: 0, duration: 0.8, ease: 'none' },
          0,
        )

        chapterCards.slice(1).forEach((_, index) => {
          const activeIndex = index + 1

          chapterTl
            .to(
              chapterCards[activeIndex - 1],
              {
                opacity: 0.28,
                y: -18,
                scale: 0.96,
                duration: 0.6,
                ease: 'none',
              },
              '+=0.65',
            )
            .to(
              chapterProgress[activeIndex - 1],
              {
                scaleX: 0.3,
                duration: 0.4,
                ease: 'none',
              },
              '<',
            )
            .to(
              chapterVisuals[activeIndex - 1],
              {
                autoAlpha: 0,
                scale: 0.88,
                rotate: -4,
                yPercent: -8,
                clipPath: 'inset(20% 14% 22% 14% round 2.2rem)',
                duration: 0.72,
                ease: 'none',
              },
              '<',
            )
            .to(
              chapterCards[activeIndex],
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.72,
                ease: 'none',
              },
              '<0.05',
            )
            .to(
              chapterProgress[activeIndex],
              {
                scaleX: 1,
                duration: 0.5,
                ease: 'none',
              },
              '<',
            )
            .to(
              chapterVisuals[activeIndex],
              {
                autoAlpha: 1,
                scale: 1,
                rotate: 0,
                yPercent: 0,
                clipPath: 'inset(0% 0% 0% 0% round 2.2rem)',
                duration: 0.8,
                ease: 'none',
              },
              '<',
            )
        })
      }

      const infoTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#info-section',
          start: 'top 72%',
        },
      })

      infoTl
        .from('.info-visual', {
          clipPath: 'inset(10% 0 10% 0 round 2.5rem)',
          opacity: 0,
          duration: 0.95,
          ease: 'power2.out',
        })
        .from(
          '.info-overlay',
          {
            y: 34,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
          },
          '-=0.45',
        )
        .from(
          '.info-copy [data-text-item]',
          {
            x: 26,
            opacity: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.55',
        )
        .from(
          '.info-strip',
          {
            x: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.35',
        )

      const galleryTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#gallery',
          start: 'top 78%',
          end: 'bottom top',
          scrub: 0.8,
        },
      })

      galleryTl
        .fromTo(
          '.gallery-stage',
          {
            clipPath: 'inset(8% 5% 8% 5% round 2.8rem)',
            opacity: 0.3,
          },
          {
            clipPath: 'inset(0% 0% 0% 0% round 2.8rem)',
            opacity: 1,
            duration: 0.9,
            ease: 'none',
          },
        )
        .fromTo(
          '.gallery-art',
          { scale: 1.14, xPercent: 6 },
          { scale: 1, xPercent: 0, duration: 1, ease: 'none' },
          0,
        )
        .fromTo(
          '.gallery-content-wrap',
          { yPercent: 12 },
          { yPercent: -4, duration: 1, ease: 'none' },
          0,
        )
        .fromTo(
          '.gallery-panel',
          { xPercent: -18, opacity: 0.4, rotate: -2 },
          { xPercent: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'none' },
          0.05,
        )
        .fromTo(
          '.gallery-chip',
          { y: 24, opacity: 0.2, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.55, stagger: 0.08, ease: 'none' },
          0.15,
        )

      const faqTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#faq-section',
          start: 'top 74%',
        },
      })

      faqTl
        .from('.faq-copy [data-text-item]', {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        })
        .from(
          '.faq-item',
          {
            x: 34,
            opacity: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: 'power2.out',
          },
          '-=0.25',
        )

      const journalTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#journal',
          start: 'top 76%',
        },
      })

      journalTl
        .from('.journal-copy [data-text-item]', {
          y: 28,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
        })
        .from(
          '.journal-copy blockquote',
          {
            filter: 'blur(12px)',
            letterSpacing: '0.09em',
            yPercent: 18,
            duration: 0.9,
            ease: 'power2.out',
          },
          '-=0.55',
        )
        .fromTo(
          '.journal-stage',
          { backgroundPosition: '50% 0%' },
          { backgroundPosition: '50% 100%', duration: 1, ease: 'none' },
          0,
        )
        .from(
          '.journal-quote',
          {
            scale: 0.94,
            duration: 0.9,
            ease: 'power2.out',
          },
          '<0.05',
        )

      const mapTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#map-section',
          start: 'top 74%',
          end: 'bottom top',
          scrub: 0.65,
        },
      })

      mapTl
        .fromTo(
          '.map-frame',
          {
            xPercent: -8,
            opacity: 0.35,
            clipPath: 'inset(0 0 20% 0 round 2.4rem)',
            rotate: -1.5,
          },
          {
            xPercent: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0 round 2.4rem)',
            rotate: 0,
            duration: 0.95,
            ease: 'none',
          },
        )
        .fromTo(
          '.map-copy',
          { xPercent: 10, opacity: 0.4 },
          { xPercent: 0, opacity: 1, duration: 0.8, ease: 'none' },
          0.02,
        )
        .fromTo(
          '.map-detail',
          { x: 36, opacity: 0.25, rotate: 2 },
          { x: 0, opacity: 1, rotate: 0, duration: 0.55, stagger: 0.08, ease: 'none' },
          0.12,
        )

      gsap.utils.toArray('.parallax-img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: 'none',
            scrollTrigger: {
              trigger: element,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      })

      gsap.utils.toArray('[data-count]').forEach((element) => {
        const target = Number(element.dataset.count || '0')
        const counter = { value: 0 }

        gsap.to(counter, {
          value: target,
          duration: 2,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
          onUpdate: () => {
            element.textContent = Math.round(counter.value).toLocaleString()
          },
        })
      })

      gsap.utils.toArray('.interactive-card').forEach((element) => {
        const enter = () =>
          gsap.to(element, {
            y: -10,
            rotateX: 2.5,
            rotateY: -2.5,
            scale: 1.02,
            boxShadow: '0 34px 70px -42px rgba(16,55,66,0.38)',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        const leave = () =>
          gsap.to(element, {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            boxShadow: '0 24px 50px -40px rgba(34,76,89,0.22)',
            duration: 0.34,
            ease: 'power2.out',
            overwrite: 'auto',
          })

        element.addEventListener('mouseenter', enter)
        element.addEventListener('mouseleave', leave)
        hoverCleanups.push(() => {
          element.removeEventListener('mouseenter', enter)
          element.removeEventListener('mouseleave', leave)
        })
      })

      gsap.utils.toArray('.hover-button').forEach((element) => {
        const enter = () =>
          gsap.to(element, {
            y: -4,
            scale: 1.03,
            rotate: -1,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        const leave = () =>
          gsap.to(element, {
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.28,
            ease: 'power2.out',
            overwrite: 'auto',
          })

        element.addEventListener('mouseenter', enter)
        element.addEventListener('mouseleave', leave)
        hoverCleanups.push(() => {
          element.removeEventListener('mouseenter', enter)
          element.removeEventListener('mouseleave', leave)
        })
      })
    }, root)

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup())
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    if (!sceneCopyRef.current || !sceneMediaRef.current) return

    const ctx = gsap.context(() => {
      gsap.killTweensOf(sceneCopyRef.current.children)
      gsap.killTweensOf(sceneMediaRef.current)
      gsap.killTweensOf(sceneMediaRef.current.querySelectorAll('.draw-stroke'))
      gsap.killTweensOf(sceneMediaRef.current.querySelectorAll('.art-float'))
      gsap.killTweensOf(sceneMediaRef.current.querySelectorAll('.art-card'))

      gsap.fromTo(
        sceneCopyRef.current.children,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out', stagger: 0.06 },
      )

      gsap.fromTo(
        sceneMediaRef.current,
        { x: 24, opacity: 0, scale: 0.985 },
        { x: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'power2.out' },
      )

      const mediaStrokes = sceneMediaRef.current.querySelectorAll('.draw-stroke')
      mediaStrokes.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      })

      gsap.to(mediaStrokes, {
        strokeDashoffset: 0,
        duration: 1.05,
        stagger: 0.06,
        ease: 'power2.out',
      })

      gsap.fromTo(
        sceneMediaRef.current.querySelectorAll('.art-float'),
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'back.out(1.7)',
        },
      )

      gsap.fromTo(
        sceneMediaRef.current.querySelectorAll('.art-card'),
        { y: 24, opacity: 0, rotate: -2 },
        { y: 0, opacity: 1, rotate: 0, duration: 0.75, stagger: 0.08, ease: 'power2.out' },
      )
    }, root)

    return () => ctx.revert()
  }, [activeScene])

  useEffect(() => {
    faqRefs.current.forEach((element, index) => {
      if (!element) return

      const contentHeight = element.scrollHeight

      gsap.to(element, {
        height: openFaq === index ? contentHeight : 0,
        opacity: openFaq === index ? 1 : 0,
        duration: 0.45,
        ease: 'power2.out',
      })
    })
  }, [openFaq])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined

    const cursorRing = root.current?.querySelector('.cursor-ring')
    const cursorDot = root.current?.querySelector('.cursor-dot')
    if (!cursorRing || !cursorDot) return undefined

    const quickRingX = gsap.quickTo(cursorRing, 'x', { duration: 0.22, ease: 'power3.out' })
    const quickRingY = gsap.quickTo(cursorRing, 'y', { duration: 0.22, ease: 'power3.out' })
    const quickDotX = gsap.quickTo(cursorDot, 'x', { duration: 0.08, ease: 'power2.out' })
    const quickDotY = gsap.quickTo(cursorDot, 'y', { duration: 0.08, ease: 'power2.out' })
    const followers = Array.from(root.current?.querySelectorAll('.mouse-follow') || [])

    const handleMove = (event) => {
      const x = event.clientX
      const y = event.clientY
      quickRingX(x)
      quickRingY(y)
      quickDotX(x)
      quickDotY(y)

      followers.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (!rect.width || !rect.height) return

        const strength = Number(element.getAttribute('data-follow-strength') || '0.03')
        const offsetX = (x - (rect.left + rect.width / 2)) * strength
        const offsetY = (y - (rect.top + rect.height / 2)) * strength

        gsap.to(element, {
          x: offsetX,
          y: offsetY,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }

    const handleLeaveWindow = () => {
      gsap.to([cursorRing, cursorDot], { opacity: 0, duration: 0.2, ease: 'power2.out' })
      followers.forEach((element) => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      })
    }

    const handleEnterWindow = () => {
      gsap.to([cursorRing, cursorDot], { opacity: 1, duration: 0.2, ease: 'power2.out' })
    }

    const interactiveTargets = Array.from(
      root.current?.querySelectorAll('.hover-button, .interactive-card') || [],
    )

    const enterInteractive = () => {
      gsap.to(cursorRing, {
        scale: 1.5,
        borderColor: 'rgba(241, 212, 175, 1)',
        backgroundColor: 'rgba(255,255,255,0.16)',
        duration: 0.22,
        ease: 'power2.out',
      })
      cursorRing.textContent = 'View'
    }

    const leaveInteractive = () => {
      gsap.to(cursorRing, {
        scale: 1,
        borderColor: 'rgba(241, 212, 175, 0.7)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        duration: 0.22,
        ease: 'power2.out',
      })
      cursorRing.textContent = 'Move'
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseleave', handleLeaveWindow)
    window.addEventListener('mouseenter', handleEnterWindow)

    interactiveTargets.forEach((element) => {
      element.addEventListener('mouseenter', enterInteractive)
      element.addEventListener('mouseleave', leaveInteractive)
    })

    gsap.set([cursorRing, cursorDot], { opacity: 1 })
    document.body.style.cursor = 'none'

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeaveWindow)
      window.removeEventListener('mouseenter', handleEnterWindow)
      interactiveTargets.forEach((element) => {
        element.removeEventListener('mouseenter', enterInteractive)
        element.removeEventListener('mouseleave', leaveInteractive)
      })
      document.body.style.cursor = ''
    }
  }, [])

  const activeMoment = showcaseMoments[activeScene]

  return (
    <div ref={root} className="overflow-x-hidden bg-[#faf6ed] text-[#4d433b]">
      <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block" aria-hidden="true">
        <div className="cursor-ring absolute left-0 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#f1d4af]/70 bg-white/8 text-[9px] uppercase tracking-[0.28em] text-[#173847] opacity-0 backdrop-blur-sm">
          Move
        </div>
        <div className="cursor-dot absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f1d4af] opacity-0" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            Med<span className="text-[#ffd5a3]">·</span>Template
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <a href="#about" className="transition hover:text-white">
              Intro
            </a>
            <a href="#experiences" className="transition hover:text-white">
              Showcase
            </a>
            <a href="#gallery" className="transition hover:text-white">
              Gallery
            </a>
            <a href="#journal" className="transition hover:text-white">
              Quote
            </a>
          </nav>
          <a
            href="#book"
            className="nav-cta hover-button rounded-full border border-white/20 bg-[#163847]/80 px-5 py-2.5 text-sm text-[#f7fcfd] backdrop-blur-sm transition-colors hover:bg-[#224c59]"
          >
            Contact
          </a>
        </div>
      </header>

      <section id="top" className="hero relative min-h-[720px] w-full overflow-hidden">
        <div className="hero-img hero-mask absolute inset-0 will-change-transform">
          <MediterraneanArtwork variant="hero" className="h-full w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,28,37,0.38)_0%,rgba(8,28,37,0.18)_34%,rgba(8,28,37,0.28)_62%,rgba(250,246,237,0.95)_100%)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="ambient-orb hero-orb absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-[#9ed1df]/18 blur-3xl" />
          <div className="ambient-orb hero-orb absolute right-[10%] top-[14%] h-52 w-52 rounded-full bg-[#ffd5a3]/16 blur-3xl" />
          <div className="ambient-orb hero-orb absolute bottom-[22%] left-[20%] h-32 w-32 rounded-full bg-white/12 blur-3xl" />
          <div className="ambient-orb hero-orb absolute bottom-[16%] right-[18%] h-36 w-36 rounded-full bg-[#9ed1df]/14 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex h-full min-h-[720px] w-full max-w-7xl flex-col justify-end px-6 pb-18 pt-32 lg:px-10 lg:pb-24">
          <div className="grid items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div
              data-follow-strength="0.03"
              className="hero-main-card mouse-follow max-w-4xl rounded-[2.3rem] border border-white/25 bg-white/12 p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.45)] backdrop-blur-md lg:p-8"
            >
              <p className="hero-eyebrow mb-5 text-xs uppercase tracking-[0.4em] text-white/75">
                Mediterranean Invitation Collection
              </p>
              <OrnateDivider className="mb-6 h-8 w-40 opacity-90" />
              <h1 className="font-display text-balance text-[clamp(3.2rem,9vw,8rem)] leading-[0.95] tracking-[-0.045em] text-white">
                <span className="hero-word mr-4 inline-block">Seaside</span>
                <span className="hero-word mr-4 inline-block italic">vows</span>
                <span className="hero-word mr-4 inline-block">with</span>
                <span className="hero-word inline-block text-[#ffd5a3]">a softer entrance.</span>
              </h1>

              <div className="mt-8 flex max-w-3xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <p className="hero-sub max-w-xl text-lg leading-8 text-white/88">
                  A premium invitation hero with calmer colors, stronger typography,
                  and room for names, dates, and venue details to feel special from
                  the first screen.
                </p>
                <a
                  href="#about"
                  className="hero-cta hover-button inline-flex items-center gap-3 rounded-full border border-white/35 bg-white/10 px-5 py-3 text-sm uppercase tracking-[0.28em] text-white transition-all hover:bg-white/18 hover:gap-5"
                >
                  View invitation
                  <span>→</span>
                </a>
              </div>
            </div>

            <div
              data-follow-strength="0.02"
              className="hero-side-stack mouse-follow grid gap-4 lg:justify-self-end lg:max-w-[360px]"
            >
              <SectionIllustration
                variant="sun"
                className="mx-auto hidden h-20 w-20 opacity-90 lg:block"
              />
              <div className="hero-panel rounded-[1.9rem] border border-white/18 bg-[#163847]/70 p-5 text-white shadow-[0_24px_70px_-36px_rgba(11,31,40,0.8)] backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.32em] text-[#b8d8e1]">
                  Template mood
                </div>
                <div className="mt-3 font-display text-4xl text-white">
                  Coastal romance
                </div>
                <p className="mt-3 leading-7 text-white/72">
                  Best for elegant seaside weddings, destination celebrations, and
                  warm evening ceremonies.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-white/92">
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    <span data-count="8">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Sections
                  </div>
                </div>
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    <span data-count="3">0</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Layouts
                  </div>
                </div>
                <div className="hero-meta hero-panel rounded-[1.5rem] border border-white/18 bg-white/12 px-4 py-4 text-center backdrop-blur-sm">
                  <div className="font-display text-3xl">
                    100<span className="text-[#ffd5a3]">%</span>
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-[0.28em] text-white/68">
                    Editable
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="countdown-section"
        className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="countdown-shell relative mx-auto max-w-5xl text-center">
          <SectionIllustration
            variant="wave"
            className="mx-auto mb-8 h-20 w-40 opacity-85"
          />
          <div className="countdown-note absolute left-0 top-10 hidden w-44 rounded-[1.5rem] border border-[#b8d8e1]/18 bg-white/45 p-4 text-left shadow-[0_24px_60px_-42px_rgba(34,76,89,0.35)] backdrop-blur md:block">
            <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
              Event note
            </div>
            <div className="mt-3 font-display text-2xl text-[#224c59]">
              Countdown focus
            </div>
            <p className="mt-3 text-sm leading-7 text-[#5f7680]">
              A strong middle section gives the page more purpose before guests reach
              the details.
            </p>
          </div>

          <div className="countdown-note absolute right-0 top-20 hidden w-44 rounded-[1.5rem] border border-[#f1d4af]/40 bg-[#fff7ed]/70 p-4 text-left shadow-[0_24px_60px_-42px_rgba(175,124,82,0.34)] backdrop-blur md:block">
            <div className="text-xs uppercase tracking-[0.3em] text-[#8b7358]">
              Template use
            </div>
            <div className="mt-3 font-display text-2xl text-[#224c59]">
              Replace date
            </div>
            <p className="mt-3 text-sm leading-7 text-[#6c6257]">
              Keep this animation and only update the actual wedding date per couple.
            </p>
          </div>

          <div className="countdown-grid flex flex-wrap justify-center gap-4">
            {countdown.map((item) => (
              <article
                key={item.label}
                className="countdown-card relative w-[112px] overflow-hidden rounded-[1.6rem] border border-[#b8d8e1]/30 bg-[linear-gradient(180deg,rgba(22,56,71,0.92),rgba(34,76,89,0.88))] px-4 py-5 text-center shadow-[0_28px_56px_-34px_rgba(16,55,66,0.72)] backdrop-blur-sm"
              >
                <div
                  className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#72b6c8] to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f1d4af] to-transparent"
                  aria-hidden="true"
                />
                <div className="overflow-hidden">
                  <div className="font-display flex items-center justify-center gap-0.5 text-4xl leading-none text-white md:text-5xl">
                    {item.value.split('').map((digit, index) => (
                      <CountdownDigit key={`${item.label}-${index}`} value={digit} />
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#c7dfe6]">
                  {item.label}
                </div>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-sm uppercase tracking-[0.32em] text-[#6a8790]">
            We are getting married
          </p>
        </div>
      </section>

      <section
        id="about"
        className="mx-auto w-full max-w-7xl rounded-[2.8rem] border border-[#b8d8e1]/22 bg-[linear-gradient(145deg,rgba(22,56,71,0.98),rgba(34,76,89,0.94))] px-6 py-16 shadow-[0_34px_90px_-46px_rgba(16,55,66,0.78)] lg:px-10 lg:py-20"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="about-copy flex flex-col justify-between" data-text-group>
            <div>
              <SectionIllustration variant="shell" className="mb-6 h-20 w-20 opacity-90" />
              <p
                data-text-item
                className="mb-6 text-xs uppercase tracking-[0.4em] text-[#b8d8e1]"
              >
                The details
              </p>
              <h2
                data-text-item
                className="font-display text-balance text-5xl leading-[1.03] tracking-[-0.04em] text-white md:text-6xl"
              >
                Everything you need to personalize this invitation.
              </h2>
              <p
                data-text-item
                className="mt-6 max-w-xl text-lg leading-8 text-white/72"
              >
                Inspired by the cleaner wedding-template reference, this section is
                written more generically so you can reuse it for different couples,
                venues, and celebration styles.
              </p>
            </div>

            <div data-text-item className="mt-10 grid gap-4 sm:grid-cols-3">
              {storyCards.map((item) => (
                <div
                  key={item.label}
                  className="about-chip interactive-card rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-[#b8d8e1]">
                    {item.label}
                  </div>
                  <div className="mt-3 font-display text-2xl text-white">{item.value}</div>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about-mosaic grid gap-4 md:grid-cols-12" data-card-grid>
            <article
              data-card-item
              className="mosaic-card relative overflow-hidden rounded-[1.8rem] border border-white/12 md:col-span-4"
            >
              <MediterraneanArtwork variant="arrival" className="h-full min-h-[240px] w-full" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Mood
                </div>
                <div className="mt-2 font-display text-3xl">Warm palette</div>
              </div>
            </article>

            <article
              data-card-item
              className="mosaic-card interactive-card relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/8 p-6 text-white backdrop-blur-sm md:col-span-8"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                Invitation note
              </div>
              <h3 className="mt-4 font-display text-4xl leading-tight">
                Keep the essentials elegant and easy to replace.
              </h3>
              <p className="mt-4 max-w-2xl leading-8 text-white/72">
                Names, date, venue, timing, and RSVP details should feel premium
                without being too specific to one story or one couple.
              </p>
            </article>

            <article
              data-card-item
              className="mosaic-card interactive-card relative overflow-hidden rounded-[1.8rem] border border-white/12 md:col-span-7"
            >
              <MediterraneanArtwork
                variant="ceremony"
                className="h-full min-h-[260px] w-full"
              />
              <div className="absolute bottom-0 left-0 max-w-md p-6 text-white">
                <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Venue block
                </div>
                <div className="mt-2 font-display text-3xl">Ceremony setting</div>
              </div>
            </article>

            <article
              data-card-item
              className="mosaic-card interactive-card rounded-[1.8rem] border border-white/12 bg-[#fff7ed]/10 p-6 text-white backdrop-blur-sm md:col-span-5"
            >
              <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                Editable notes
              </div>
              <ul className="mt-5 space-y-4">
                <li className="border-b border-white/10 pb-4">Change names and date</li>
                <li className="border-b border-white/10 pb-4">Update venue and timing</li>
                <li className="border-b border-white/10 pb-4">Replace images and map</li>
                <li>Keep the same design and animation system</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="promise" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="relative overflow-hidden rounded-[2.8rem] border border-[#b8d8e1]/24 bg-[linear-gradient(135deg,#163847_0%,#224c59_56%,#102a34_100%)] px-8 py-16 shadow-[0_34px_90px_-48px_rgba(16,55,66,0.72)] lg:px-14 lg:py-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="mouse-follow absolute left-[8%] top-[14%] h-36 w-36 rounded-full bg-[#9ed1df]/12 blur-3xl" data-follow-strength="0.06" />
            <div className="mouse-follow absolute right-[10%] top-[18%] h-28 w-28 rounded-full bg-[#ffd5a3]/14 blur-3xl" data-follow-strength="0.08" />
            <div className="mouse-follow absolute bottom-[14%] left-[22%] h-24 w-24 rounded-full bg-white/10 blur-3xl" data-follow-strength="0.05" />
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#b8d8e1]">
                Invitation message
              </p>
              <OrnateDivider className="mb-6 h-9 w-44 opacity-90" />
              <p className="max-w-md text-lg leading-8 text-white/72">
                This chapter uses a real masked text reveal so the message feels
                intentionally staged instead of simply fading in.
              </p>
            </div>

            <div className="space-y-4 text-white">
              <div className="overflow-hidden">
                <span className="mask-line font-display inline-block text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.05em]">
                  Join us by the sea
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="mask-line font-display inline-block text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.05em] text-[#ffd5a3]">
                  for a ceremony,
                </span>
              </div>
              <div className="overflow-hidden">
                <span className="mask-line font-display inline-block text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.95] tracking-[-0.05em]">
                  dinner, and celebration.
                </span>
              </div>
              <div className="overflow-hidden pt-4">
                <span className="mask-line inline-block max-w-2xl text-lg leading-8 text-white/72">
                  Keep this wording generic for any couple, or replace it with a
                  custom wedding invitation note for each version of the template.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experiences" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="showcase-head mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-text-group>
          <div>
            <p
              data-text-item
              className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
            >
                Order of the day
            </p>
            <h2
              data-text-item
              className="font-display text-balance max-w-3xl text-5xl leading-[1.04] tracking-[-0.04em] text-[#224c59] md:text-6xl"
            >
                Show the key moments of the celebration in a more graceful way.
            </h2>
          </div>
          <div data-text-item className="showcase-tabs flex flex-wrap gap-3">
            {showcaseMoments.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveScene(index)}
                className={`hover-button rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                  activeScene === index
                    ? 'bg-[#224c59] text-[#f7fcfd]'
                    : 'border border-[#d7e6eb] bg-white/70 text-[#6a8790]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div
            ref={sceneCopyRef}
            className="scene-copy rounded-[2rem] border border-[#dbe8ec] bg-white/75 p-7 shadow-[0_28px_56px_-40px_rgba(34,76,89,0.2)] backdrop-blur-sm"
          >
            <div className="text-xs uppercase tracking-[0.35em] text-[#6a8790]">
              {activeMoment.kicker}
            </div>
            <h3 className="mt-4 font-display text-5xl leading-[1.04] text-[#224c59]">
              {activeMoment.title}
            </h3>
            <p className="mt-5 leading-8 text-[#5f7680]">{activeMoment.description}</p>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setActiveScene(
                    (activeScene - 1 + showcaseMoments.length) % showcaseMoments.length,
                  )
                }
                className="scene-nav-btn hover-button rounded-full border border-[#d7e6eb] bg-white px-4 py-3 text-sm uppercase tracking-[0.28em] text-[#224c59]"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setActiveScene((activeScene + 1) % showcaseMoments.length)}
                className="scene-nav-btn hover-button rounded-full bg-[#224c59] px-4 py-3 text-sm uppercase tracking-[0.28em] text-[#f7fcfd]"
              >
                Next
              </button>
            </div>
          </div>

          <div
            ref={sceneMediaRef}
            data-follow-strength="0.03"
            className="scene-media mouse-follow relative overflow-hidden rounded-[2.4rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.94),rgba(34,76,89,0.9))] p-4 shadow-[0_30px_70px_-42px_rgba(16,55,66,0.64)]"
          >
            <div className="relative overflow-hidden rounded-[2rem]">
              <MediterraneanArtwork
                variant={activeMoment.artwork}
                className="h-[520px] w-full"
              />
            </div>

            <div className="pointer-events-none absolute left-8 top-8 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white backdrop-blur-sm">
              {activeMoment.name}
            </div>

            <div className="absolute bottom-8 left-8 right-8 rounded-[1.7rem] border border-white/14 bg-white/10 p-5 text-white backdrop-blur-md">
              <div className="text-xs uppercase tracking-[0.32em] text-[#b8d8e1]">
                Template scene
              </div>
              <div className="mt-3 font-display text-4xl">{activeMoment.name}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline-section" className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
        <div className="timeline-copy mb-10 max-w-2xl" data-text-group>
          <p
            data-text-item
            className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
          >
                Celebration flow
          </p>
          <h2
            data-text-item
            className="font-display text-5xl leading-[1.04] tracking-[-0.04em] text-[#224c59] md:text-6xl"
          >
                A simple order of the day should still feel beautifully designed.
          </h2>
        </div>

        <div className="relative">
          <div className="timeline-line absolute left-0 right-0 top-11 hidden h-px bg-[#d7e6eb] lg:block" />
          <div className="grid gap-5 lg:grid-cols-4">
            {timelineItems.map((item, index) => (
              <article
                key={item.time}
                className={`timeline-card interactive-card rounded-[1.8rem] border border-[#d7e6eb] bg-white/80 p-6 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] backdrop-blur-sm ${
                  index % 2 === 1 ? 'lg:mt-12' : ''
                }`}
              >
                <div className="timeline-dot mb-5 h-3 w-3 rounded-full bg-[#224c59]" />
                <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
                  {item.time}
                </div>
                <h3 className="mt-4 font-display text-3xl text-[#224c59]">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[#5f7680]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="chapters" className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <div className="chapter-shell relative h-[260vh]">
          <div className="sticky top-20 grid min-h-[calc(100vh-5rem)] items-center gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="chapter-copy-panel rounded-[2.4rem] border border-[#d7e6eb] bg-white/82 p-7 shadow-[0_30px_70px_-44px_rgba(34,76,89,0.22)] backdrop-blur-sm lg:p-9">
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]">
                Wedding story
              </p>
              <OrnateDivider className="mb-6 h-9 w-44" tone="dark" />
              <h2 className="font-display text-balance text-5xl leading-[1.02] tracking-[-0.045em] text-[#173847] md:text-6xl">
                A pinned chapter turns the invitation into a slow reveal.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f7680]">
                This section stays generic, but it gives the template a more cinematic
                rhythm by revealing the wedding day in three elegant stages.
              </p>

              <div className="mt-10 space-y-4">
                {chapterMoments.map((item) => (
                  <article
                    key={item.label}
                    className="chapter-card interactive-card rounded-[1.8rem] border border-[#d7e6eb] bg-[#f8fbfc] p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <span className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                        {item.label}
                      </span>
                      <div className="chapter-progress h-px w-16 origin-left bg-[linear-gradient(90deg,#86c5d8,#f1d4af)]" />
                    </div>
                    <h3 className="font-display text-3xl leading-[1.08] text-[#173847]">
                      {item.title}
                    </h3>
                    <p className="mt-4 leading-7 text-[#5f7680]">{item.note}</p>
                  </article>
                ))}
              </div>
            </div>

            <div
              data-follow-strength="0.025"
              className="chapter-stage interactive-card mouse-follow relative min-h-[620px] overflow-hidden rounded-[2.7rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-4 shadow-[0_34px_90px_-46px_rgba(16,55,66,0.7)]"
            >
              {chapterMoments.map((item) => (
                <div key={item.label} className="chapter-visual absolute inset-4">
                  <MediterraneanArtwork
                    variant={item.artwork}
                    className="h-full w-full rounded-[2.2rem]"
                  />
                  <div className="absolute inset-x-8 top-8 flex items-start justify-between gap-4">
                    <div className="rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white backdrop-blur-sm">
                      {item.label}
                    </div>
                    <OrnateDivider className="hidden h-8 w-40 opacity-90 md:block" />
                  </div>
                  <div className="absolute bottom-8 left-8 max-w-md rounded-[1.8rem] border border-white/14 bg-white/10 p-6 text-white backdrop-blur-md">
                    <div className="text-xs uppercase tracking-[0.32em] text-[#d9eef3]">
                      Invitation chapter
                    </div>
                    <div className="mt-3 font-display text-4xl leading-[1.06]">
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="info-section" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="info-visual relative overflow-hidden rounded-[2.5rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-4 shadow-[0_28px_56px_-36px_rgba(16,55,66,0.68)]">
            <div className="overflow-hidden rounded-[2rem]">
              <MediterraneanArtwork variant="info" className="h-[560px] w-full" />
            </div>
            <div className="info-overlay absolute bottom-8 left-8 right-8 rounded-[1.8rem] border border-white/14 bg-white/10 p-6 text-white backdrop-blur-md">
              <SectionIllustration variant="wave" className="mb-4 h-12 w-24 opacity-90" />
              <div className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]">
                Dress code
              </div>
              <div className="mt-3 font-display text-4xl">
                Gentle reminders can still feel elegant.
              </div>
            </div>
          </div>

          <div>
            <div className="info-copy mb-8" data-text-group>
              <p
                data-text-item
                className="mb-4 text-xs uppercase tracking-[0.4em] text-[#6a8790]"
              >
                Guest notes
              </p>
              <h2
                data-text-item
                className="font-display text-5xl leading-[1.04] tracking-[-0.04em] text-[#224c59] md:text-6xl"
              >
                Add dress code, RSVP, and guest notes without losing elegance.
              </h2>
            </div>

            <div className="grid gap-4">
              {detailCards.map((card, index) => (
                <article
                  key={card.label}
                  className={`info-strip interactive-card rounded-[1.7rem] border p-5 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.22)] ${
                    index === 1
                      ? 'border-[#f1d4af]/60 bg-[#fff7ed]'
                      : 'border-[#d7e6eb] bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#224c59] font-display text-lg text-white">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-[#6a8790]">
                        {card.label}
                      </div>
                      <div className="mt-2 font-display text-3xl text-[#224c59]">
                        {card.value}
                      </div>
                      <p className="mt-3 leading-7 text-[#5f7680]">{card.note}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
        <div className="gallery-stage relative overflow-hidden rounded-[2.8rem] border border-[#b8d8e1]/24 shadow-[0_32px_70px_-44px_rgba(16,55,66,0.44)]">
          <MediterraneanArtwork variant="gallery" className="gallery-art h-[720px] w-full" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,28,37,0.62)_0%,rgba(8,28,37,0.32)_34%,rgba(8,28,37,0.08)_100%)]" />

          <div className="gallery-content-wrap absolute inset-x-0 bottom-0 top-0 flex items-end p-6 md:p-10">
            <div
              data-follow-strength="0.025"
              className="gallery-panel mouse-follow max-w-xl rounded-[2rem] border border-white/16 bg-white/10 p-7 text-white backdrop-blur-md"
              data-text-group
            >
              <p
                data-text-item
                className="mb-4 text-xs uppercase tracking-[0.35em] text-[#b8d8e1]"
              >
                Highlighted moment
              </p>
              <OrnateDivider className="mb-6 h-8 w-40 opacity-90" />
              <h2
                data-text-item
                className="font-display text-5xl leading-[1.04] tracking-[-0.04em] md:text-6xl"
              >
                Use one large image for the venue, a portrait, or the ceremony mood.
              </h2>
              <p data-text-item className="mt-5 max-w-lg leading-8 text-white/74">
                This section stays intentionally generic. It can be used for the main
                venue image, a favorite couple photo, or a calm transition before the
                final information blocks.
              </p>

              <div data-text-item className="mt-7 flex flex-wrap gap-3">
                <div className="gallery-chip rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#d9eef3]">
                  Event date
                </div>
                <div className="gallery-chip rounded-full border border-white/16 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#d9eef3]">
                  Venue note
                </div>
                <div className="gallery-chip rounded-full border border-[#f1d4af]/26 bg-[#fff7ed]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Save the date
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq-section" className="mx-auto w-full max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="faq-copy rounded-[2rem] border border-[#d7e6eb] bg-white/80 p-7 shadow-[0_24px_50px_-40px_rgba(34,76,89,0.2)]" data-text-group>
            <p
              data-text-item
              className="mb-4 text-xs uppercase tracking-[0.35em] text-[#6a8790]"
            >
                Gifts & RSVP
            </p>
            <h2
              data-text-item
              className="font-display text-5xl leading-[1.04] text-[#224c59] md:text-6xl"
            >
                Use this area for gifts, RSVP notes, and practical questions.
            </h2>
            <p data-text-item className="mt-5 leading-8 text-[#5f7680]">
                A short FAQ block keeps the invitation clean while still giving guests
                helpful answers when they need them.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <article
                key={item.question}
                className={`faq-item interactive-card overflow-hidden rounded-[1.7rem] border transition-colors ${
                  openFaq === index
                    ? 'border-[#224c59] bg-[linear-gradient(180deg,#163847,#224c59)] text-white'
                    : 'border-[#d7e6eb] bg-white/80 text-[#224c59]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-3xl">{item.question}</span>
                  <span className="text-xs uppercase tracking-[0.3em]">
                    {openFaq === index ? 'Close' : 'Open'}
                  </span>
                </button>
                <div
                  ref={(element) => {
                    faqRefs.current[index] = element
                  }}
                  className="h-0 overflow-hidden px-6"
                >
                  <p
                    className={`pb-6 leading-7 ${
                      openFaq === index ? 'text-white/72' : 'text-[#5f7680]'
                    }`}
                  >
                    {item.answer}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="journal" className="journal-stage relative overflow-hidden py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#163847_0%,#224c59_58%,#0d2430_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(184,216,225,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,213,163,0.14),transparent_35%)]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="ambient-orb journal-orb absolute left-[12%] top-[18%] h-44 w-44 rounded-full bg-[#9ed1df]/14 blur-3xl" />
          <div className="ambient-orb journal-orb absolute right-[16%] top-[26%] h-32 w-32 rounded-full bg-[#ffd5a3]/16 blur-3xl" />
          <div className="ambient-orb journal-orb absolute bottom-[16%] left-[50%] h-40 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div
          className="journal-copy mx-auto w-full max-w-7xl px-6 text-center lg:px-10"
          data-text-group
        >
          <p
            data-text-item
            className="mb-8 text-xs uppercase tracking-[0.4em] text-white/80"
          >
            RSVP
          </p>
          <OrnateDivider className="mx-auto mb-8 h-8 w-44 opacity-90" />
          <blockquote
            data-text-item
            className="journal-quote font-display text-balance mx-auto max-w-4xl text-4xl leading-[1.1] tracking-[-0.04em] text-white md:text-6xl"
          >
            "We hope you can join us for a beautiful day of love, celebration,
            and unforgettable memories."
          </blockquote>
          <div
            data-text-item
            className="mt-10 text-sm uppercase tracking-widest text-white/80"
          >
            A reusable wedding invitation template
          </div>
        </div>
      </section>

      <section id="map-section" className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="map-frame overflow-hidden rounded-[2.4rem] border border-[#d7e6eb] bg-white shadow-[0_30px_60px_-40px_rgba(34,76,89,0.24)]">
            <div className="border-b border-[#d7e6eb] bg-[linear-gradient(145deg,#f4fafb,#eef5f7)] px-5 py-4">
              <div className="text-xs uppercase tracking-[0.32em] text-[#6a8790]">
                Google Maps placeholder
              </div>
            </div>
            <iframe
              title="Placeholder wedding venue map"
              src="https://www.google.com/maps?q=Bodrum%20Turkey&z=12&output=embed"
              className="h-[520px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="map-copy rounded-[2rem] border border-[#b8d8e1]/24 bg-[linear-gradient(180deg,rgba(22,56,71,0.96),rgba(34,76,89,0.92))] p-7 text-white shadow-[0_28px_56px_-36px_rgba(16,55,66,0.68)]" data-text-group>
            <p
              data-text-item
              className="text-xs uppercase tracking-[0.35em] text-[#b8d8e1]"
            >
              Location
            </p>
            <h2
              data-text-item
              className="mt-4 font-display text-5xl leading-[1.05] tracking-[-0.04em]"
            >
              Finish with the venue map and a few clear arrival details.
            </h2>
            <p data-text-item className="mt-5 leading-8 text-white/72">
              This ending keeps the template practical. Replace the placeholder with
              the real venue link, address, and travel information for each couple.
            </p>

            <div data-text-item className="mt-7 space-y-4">
              <div className="map-detail interactive-card rounded-[1.4rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Venue
                </div>
                <div className="mt-2 font-display text-2xl text-white">
                  Placeholder Beach Club
                </div>
              </div>
              <div className="map-detail interactive-card rounded-[1.4rem] border border-[#f1d4af]/30 bg-[#fff5e8]/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#f1d4af]">
                  Address
                </div>
                <div className="mt-2 font-display text-2xl text-white">
                  Seaside Road 12
                </div>
              </div>
              <div className="map-detail interactive-card rounded-[1.4rem] border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.28em] text-[#b8d8e1]">
                  Travel note
                </div>
                <div className="mt-2 text-white/72">
                  Add parking, shuttle, or nearby hotel guidance in this block.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        id="book"
        className="bg-[linear-gradient(180deg,#102c38,#163847_42%,#0d2430_100%)] pb-12 pt-28 text-[#f7fcfd]"
      >
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div
            className="grid gap-12 border-b border-white/15 pb-20 md:grid-cols-12"
            data-text-group
          >
            <div className="reveal md:col-span-7">
              <h2
                data-text-item
                className="font-display text-balance text-5xl leading-[1.02] tracking-[-0.045em] md:text-7xl"
              >
                Ready for names,
                <br />
                <em className="text-[#ffd5a3]">date, venue, and RSVP edits.</em>
              </h2>
            </div>
            <div className="reveal flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p data-text-item className="mb-6 text-white/70">
                Use this final area for RSVP, contact, booking, pricing, or a client
                inquiry form when someone wants this template customized.
              </p>
              <form data-text-item className="flex border-b border-white/40 pb-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-[#faf6ed] outline-none placeholder:text-white/50"
                />
                <button
                  type="button"
                  className="hover-button text-sm uppercase tracking-widest transition hover:text-[#ffd5a3]"
                >
                  Send →
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 text-sm text-white/60 md:flex-row md:justify-between">
            <div className="font-display text-xl text-[#faf6ed]">
              Med<span className="text-[#ffd5a3]">·</span>Template
            </div>
            <div className="flex gap-8">
              <a href="#top" className="transition hover:text-white">
                Hero
              </a>
              <a href="#journal" className="transition hover:text-white">
                Quote
              </a>
              <a href="#book" className="transition hover:text-white">
                Contact
              </a>
            </div>
            <div>Reusable Mediterranean invitation page</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MeditteraeanPage
