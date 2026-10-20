import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cardDetail, useWeddingCardFields } from '../../api/weddingCardContext'
import { useRsvp } from '../../api/useRsvp'

const couple1 = '/assets/aegean/couple-1.svg'
const couple2 = '/assets/aegean/couple-2.svg'
const couple3 = '/assets/aegean/couple-3.svg'

/* ===== Örnek çift — API (useWeddingCardFields) bunların herhangi birini ezebilir =====
   Cumartesi 19 Haziran 2027, nikâh 17.00 (TSİ, UTC+3). */
const DEFAULTS = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-06-19T17:00:00+03:00', // nikâh saati, geri sayım hedefi
  venue: 'Zeytinlik Koyu',
  city: 'Alaçatı, Çeşme',
  address: 'Zeytinlik Koyu, Alaçatı, Çeşme, İzmir',
  rsvpDeadline: '8 Mayıs 2027 Cumartesi',
}
const LOCALE = 'tr-TR'
const EVENT_TZ = 'Europe/Istanbul' // tarihler mekânın saat diliminde gösterilir
const EVENT_HOURS = 7 // nikâhtan gece yarısına (17.00 – 24.00)

const dateParts = (date, opts) => Object.fromEntries(
  new Intl.DateTimeFormat(LOCALE, { ...opts, timeZone: EVENT_TZ }).formatToParts(date).map(p => [p.type, p.value]),
)
/** "Cumartesi · 19 Haziran 2027" */
function formatHeroDate(date) {
  const p = dateParts(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${p.weekday} · ${p.day} ${p.month} ${p.year}`
}
/** "19 · 06 · 2027" (posta damgası) */
function formatPostmark(date) {
  const p = dateParts(date, { day: '2-digit', month: '2-digit', year: 'numeric' })
  return `${p.day} · ${p.month} · ${p.year}`
}

const icsStamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x'
const initial = s => ([...String(s).trim()][0] || '').toLocaleUpperCase(LOCALE)
/** mekân + adres + şehir; diğerlerinde zaten geçen parçayı tekrarlamaz */
function placeQuery(venue, address, city) {
  let q = address || ''
  if (venue && !q.includes(venue)) q = q ? `${venue}, ${q}` : venue
  if (city && !q.includes(city)) q = q ? `${q}, ${city}` : city
  return q
}

const css = String.raw`
  :root{
    --bg:        oklch(0.977 0.008 85);
    --bg-deep:   oklch(0.947 0.016 80);
    --ink:       oklch(0.3 0.045 255);
    --muted:     oklch(0.45 0.04 250);
    --accent:    oklch(0.5 0.12 245);
    --accent-2:  oklch(0.56 0.19 350);
    /* darker tones for small letter-spaced labels (AA on whitewash) */
    --label:     oklch(0.43 0.11 248);
    --label-2:   oklch(0.48 0.18 352);
    --olive:     oklch(0.53 0.08 125);
    --sea:       oklch(0.42 0.1 247);
    --sea-2:     oklch(0.34 0.09 252);
    --line:      oklch(0.82 0.028 250);
    --line-soft: oklch(0.82 0.026 250 / .5);
    --display: "Marcellus", serif;
    --serif:   "EB Garamond", serif;
    --script:  "Cormorant Garamond", serif;
  }
  .aegean-page, .aegean-page *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth; overflow-x:clip;}
  body{
    background:var(--bg); color:var(--ink);
    font-family:var(--serif); font-size:18px; line-height:1.7;
    -webkit-font-smoothing:antialiased; overflow-x:clip;
  }
  .aegean-page{ overflow-x:clip; }
  ::selection{ background:var(--accent-2); color:var(--bg); }
  .aegean-page .sr-only{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap; }

  /* visible keyboard focus */
  .aegean-page a:focus-visible, .aegean-page button:focus-visible{
    outline:2px solid var(--label); outline-offset:4px; border-radius:2px; }

  /* ---- whitewashed wall + sea light ---- */
  #ground{ position:fixed; inset:0; z-index:0;
    background:
      radial-gradient(120% 80% at 12% 6%, oklch(0.99 0.005 90) 0%, transparent 55%),
      radial-gradient(150% 90% at 90% 104%, oklch(0.9 0.045 240 / .5) 0%, transparent 62%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg) 58%, var(--bg-deep) 100%);
  }
  #grain{ position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.45;
    background-image:radial-gradient(oklch(0.55 0.03 250 / .05) 1px, transparent 1px);
    background-size:4px 4px; }

  /* offscreen sections pause their looping CSS animations */
  .aegean-page .is-off, .aegean-page .is-off *{ animation-play-state:paused !important; }

  /* ---- bougainvillea petals (vine clusters) ---- */
  .aegean-page .petal-shape{ --p0:#d81b7f; display:block; width:14px; height:11px;
    border-radius:65% 35% 70% 30% / 55% 45% 60% 40%;
    background:radial-gradient(130% 130% at 30% 25%,
      color-mix(in oklab, var(--p0) 55%, white) 0%, var(--p0) 68%);
    box-shadow:0 2px 3px oklch(0.35 0.14 350 / .2); }

  /* ---- twin bougainvillea vines, draped over both shoulders of the page ---- */
  .aegean-page .vinehost{ position:absolute; top:0; right:0; z-index:1;
    width:min(460px,38vw); height:min(430px,52vh); pointer-events:none; }
  #vine-l{ right:auto; left:0; transform:scaleX(-1); }
  .aegean-page .vinner{ position:absolute; inset:0; transform-origin:top right;
    animation:vinesway 7s ease-in-out infinite alternate;
    filter:drop-shadow(0 14px 30px oklch(.35 .1 340 / .14)); will-change:transform; }
  #vine-l .vinner{ animation-delay:-3.5s; }
  @keyframes vinesway{ from{ rotate:0deg; } to{ rotate:.7deg; } }
  .aegean-page .vinner svg{ position:absolute; inset:0; }
  .aegean-page .vinner i{ position:absolute; }
  .aegean-page .vleaf{ display:block; width:17px; height:8px;
    border-radius:50% 50% 50% 50% / 65% 65% 35% 35%;
    background:linear-gradient(160deg, oklch(0.58 0.09 125), oklch(0.42 0.08 130)); }
  .aegean-page .vheart{ display:block; width:4px; height:4px; border-radius:50%;
    background:#ffedb0; margin:-2px 0 0 -2px; }

  /* ---- the aegean shore at the foot of the hero — a cove seen at an angle ---- */
  .aegean-page{ --shoreH: clamp(190px, 30vh, 320px); }
  #sea{ position:absolute; left:0; right:0; bottom:0; height:var(--shoreH);
    z-index:1; overflow:hidden;
    background:
      radial-gradient(1.5px 1.5px at 12% 34%, oklch(0.72 0.06 70 / .7) 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 34% 68%, oklch(0.7 0.07 65 / .6) 50%, transparent 51%),
      radial-gradient(2px 2px at 8% 78%, oklch(0.75 0.05 75 / .5) 50%, transparent 51%),
      radial-gradient(1.5px 1.5px at 23% 15%, oklch(0.68 0.07 60 / .6) 50%, transparent 51%),
      radial-gradient(2px 2px at 42% 45%, oklch(0.78 0.05 80 / .55) 50%, transparent 51%),
      linear-gradient(105deg, oklch(0.9 0.05 80) 0%, oklch(0.87 0.06 78) 55%, oklch(0.84 0.065 74) 100%);
    background-size:90px 70px, 120px 90px, 140px 110px, 110px 80px, 100px 60px, 100% 100%;
  }
  #sea .shoreSvg{ position:absolute; inset:0; width:100%; height:100%; display:block; }
  #sea .tide{ animation:tide 7s ease-in-out infinite alternate; will-change:transform; }
  @keyframes tide{ from{ transform:translate(0,0); } to{ transform:translate(-18px,-8px); } }
  #sea .foam.f2{ animation:foamlag 7s ease-in-out infinite alternate; }
  @keyframes foamlag{ from{ transform:translate(6px,3px); opacity:.55; } to{ transform:translate(-34px,-14px); opacity:.12; } }
  #sparkle{ position:absolute; inset:0; pointer-events:none; opacity:.5;
    clip-path:polygon(45% 0, 100% 0, 100% 100%, 31% 100%);
    background-image:
      radial-gradient(3px 1.6px at 30px 22px, rgba(255,255,255,.8), transparent 70%),
      radial-gradient(2.4px 1.3px at 90px 60px, rgba(255,255,255,.55), transparent 70%),
      radial-gradient(3.6px 1.8px at 150px 38px, rgba(255,255,255,.65), transparent 70%);
    background-size:180px 90px, 220px 120px, 260px 140px;
    animation:glint 9s linear infinite;
  }
  @keyframes glint{ from{ background-position:0 0, 0 0, 0 0; } to{ background-position:180px 90px, -220px 120px, 260px -140px; } }
  #sea::before{ content:""; position:absolute; left:0; right:0; top:0; height:20px; z-index:2;
    background:linear-gradient(180deg, var(--bg), transparent); pointer-events:none; }
  #boat{ position:absolute; top:14%; left:71%; opacity:.9; animation:drift 12s ease-in-out infinite alternate; }
  #boat .bob{ animation:bob 3.4s ease-in-out infinite alternate; transform-origin:50% 100%; }
  @keyframes drift{ from{ transform:translateX(-28px); } to{ transform:translateX(28px); } }
  @keyframes bob{ from{ transform:rotate(-2.2deg) translateY(0); } to{ transform:rotate(2.4deg) translateY(3px); } }
  .aegean-page .ripple{ position:absolute; width:150px; height:150px; margin:-75px 0 0 -75px;
    border-radius:50%; border:1.5px solid oklch(0.99 0.005 240 / .95);
    transform:scale(0); opacity:.9; animation:rip 1.25s ease-out forwards; pointer-events:none; }
  .aegean-page .ripple.mini{ width:60px; height:60px; margin:-30px 0 0 -30px;
    border-width:1.2px; opacity:.7; animation:rip .9s ease-out forwards; }
  @keyframes rip{ to{ transform:scale(1); opacity:0; } }

  .aegean-page main{ position:relative; }
  .aegean-page .band{ position:relative; z-index:4; }
  .aegean-page .band .shell{ position:relative; z-index:2; }
  .aegean-page .shell{ width:100%; max-width:72rem; margin:0 auto; padding:0 clamp(1.25rem,5vw,4.5rem); }

  .aegean-page .label{ font-family:var(--display); font-size:.72rem; letter-spacing:.42em;
    text-transform:uppercase; color:var(--label); }
  .aegean-page em, .aegean-page .it{ font-family:var(--script); font-style:italic; }

  /* ---- wave section dividers ---- */
  .aegean-page .wave{ position:relative; z-index:4; height:36px; margin:-1px 0; }
  .aegean-page .wave svg{ display:block; width:100%; height:100%; }
  .aegean-page .wave.flip{ transform:scaleY(-1); }
  .aegean-page .wave.deep path{ fill:var(--bg-deep); }
  .aegean-page .wave.sea path{ fill:var(--sea); }
  .aegean-page .wave.sea2 path{ fill:var(--sea-2); }

  /* ====== HERO — centered whitewashed arch ====== */
  .aegean-page .hero{ position:relative; z-index:2; min-height:100vh; min-height:100svh;
    display:flex; align-items:center; justify-content:center; text-align:center; }
  .aegean-page .hero .shell{ display:flex; flex-direction:column; align-items:center; position:relative; z-index:2;
    padding-top:4rem; padding-bottom:calc(var(--shoreH) + 2.5rem); }
  .aegean-page .arch-frame{ position:relative; width:min(34rem,100%);
    padding:clamp(3rem,7vw,4.6rem) clamp(1.2rem,4vw,3rem) clamp(2.2rem,5vw,3.2rem);
    border:1.5px solid var(--line); border-radius:999px 999px 16px 16px;
    background:oklch(0.985 0.006 90 / .6); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
    box-shadow:inset 0 0 0 7px var(--bg), inset 0 0 0 8.5px var(--line-soft),
      0 40px 80px -50px oklch(.3 .06 250 / .5); }
  .aegean-page .hero .label{ display:block; margin-bottom:1.8rem; color:var(--label-2); }
  .aegean-page .names{ font-family:var(--display); font-weight:400; color:var(--ink); line-height:.95;
    font-size:clamp(2.7rem,10vw,5.6rem); letter-spacing:.01em; overflow-wrap:anywhere; }
  .aegean-page .names .amp{ display:block; font-family:var(--script); font-style:italic;
    font-size:clamp(1.6rem,4vw,2.4rem); color:var(--accent-2); line-height:1.1;
    margin:.14em 0 .08em; }
  .aegean-page .hero-meta{ margin-top:2rem; }
  .aegean-page .hero-meta .when{ font-family:var(--display); font-size:1.02rem; letter-spacing:.05em; color:var(--ink); }
  .aegean-page .hero-meta .where{ margin-top:.3rem; color:var(--muted); font-size:.98rem; }
  .aegean-page .hero-meta::before{ content:""; display:block; width:52px; height:1.5px;
    background:var(--accent); margin:0 auto 1.1rem; opacity:.55; }
  .aegean-page .hero-actions{ margin-top:1.4rem; display:flex; flex-wrap:wrap; justify-content:center;
    align-items:center; gap:.2rem 1.1rem; }
  .aegean-page .hero-actions .dot{ color:var(--line); }
  /* ghost links/buttons: hairline underline, 44px tall tap area */
  .aegean-page .ghost{ display:inline-flex; align-items:flex-end; min-height:44px;
    font-family:var(--display); font-size:.68rem; letter-spacing:.26em; text-transform:uppercase;
    color:var(--label); text-decoration:none; background:none; border:0; border-bottom:1px solid var(--line);
    padding:0 0 .3rem; cursor:pointer; transition:border-color .3s, color .3s;
    text-shadow:0 0 8px var(--bg),0 0 3px var(--bg); }
  .aegean-page .ghost:hover{ border-color:var(--accent); color:var(--label-2); }
  .aegean-page .scroll-cue{ position:absolute; z-index:2; bottom:calc(var(--shoreH) + .8rem); left:50%; transform:translateX(-50%);
    min-height:44px; font-family:var(--display); font-size:.68rem; letter-spacing:.4em; text-transform:uppercase;
    color:oklch(0.3 0.05 255); display:flex; align-items:center; gap:.7rem; text-decoration:none; }
  .aegean-page .scroll-cue::after{ content:""; width:46px; height:1px; background:oklch(0.3 0.05 255);
    transform-origin:left; animation:grow 2.4s ease-in-out infinite; }
  @keyframes grow{ 0%,100%{transform:scaleX(.3);opacity:.5} 50%{transform:scaleX(1);opacity:1} }
  /* short screens: the cue would collide with the hero links */
  @media(max-height:960px){ .aegean-page .scroll-cue{ display:none; } }
  @media(max-width:720px){
    .aegean-page{ --shoreH: clamp(140px, 22vh, 210px); }
    .aegean-page .scroll-cue{ display:none; }
    .aegean-page .hero .shell{ padding-bottom:calc(var(--shoreH) + 1.5rem); }
    .aegean-page .vinehost{ width:52vw; height:30vh; opacity:.9;
      -webkit-mask-image:linear-gradient(185deg,#000 55%,transparent 96%);
      mask-image:linear-gradient(185deg,#000 55%,transparent 96%); }
  }

  /* ====== sections ====== */
  .aegean-page section.band{ padding:clamp(5rem,10vw,8.5rem) 0; }
  .aegean-page .order{ position:relative; background:var(--bg-deep); }
  .aegean-page .sea-band{ position:relative; background:linear-gradient(180deg, var(--sea) 0%, var(--sea-2) 100%); }
  .aegean-page .eyrow{ display:flex; flex-direction:column; align-items:center; gap:1rem; margin-bottom:2.4rem; text-align:center; }
  .aegean-page h2.head{ font-family:var(--display); font-weight:400; color:var(--ink); text-align:center;
    font-size:clamp(1.9rem,4.4vw,3rem); line-height:1.1; overflow-wrap:break-word; }

  .aegean-page .invite{ max-width:44rem; margin:0 auto; text-align:center; }
  .aegean-page .invite .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.6vw,2rem);
    line-height:1.4; color:var(--ink); }
  .aegean-page .invite p.body{ color:var(--muted); margin-top:1.6rem; }
  .aegean-page .invite p.body + p.body{ margin-top:1rem; }

  /* ---- coastal route timeline ---- */
  .aegean-page .route{ position:relative; display:grid; grid-template-columns:repeat(5,minmax(0,1fr));
    gap:clamp(1rem,2.4vw,2rem); margin-top:3.4rem; }
  .aegean-page .route::before{ content:""; position:absolute; top:5px; left:1.5%; right:1.5%;
    border-top:2px dashed var(--line); }
  .aegean-page .rstop{ position:relative; padding-top:2.1rem; }
  .aegean-page .rstop::before{ content:""; position:absolute; top:0; left:2px; width:12px; height:12px;
    border-radius:50%; background:var(--accent-2);
    box-shadow:0 0 0 4px color-mix(in oklab, var(--accent-2) 18%, transparent); }
  .aegean-page .rstop .time{ font-family:var(--display); font-size:.95rem; letter-spacing:.06em; color:var(--label-2); }
  .aegean-page .rstop h3{ font-family:var(--display); font-weight:400; font-size:1.25rem; color:var(--ink); margin-top:.5rem; }
  .aegean-page .rstop p{ color:var(--muted); font-size:.95rem; margin-top:.35rem; }
  @media(max-width:820px){
    .aegean-page .route{ grid-template-columns:1fr; gap:2rem; max-width:26rem; margin-left:auto; margin-right:auto; }
    .aegean-page .route::before{ top:8px; bottom:8px; left:7px; right:auto; border-top:0; border-left:2px dashed var(--line); }
    .aegean-page .rstop{ padding:0 0 0 2.4rem; }
    .aegean-page .rstop::before{ top:6px; left:1px; }
  }

  /* ---- countdown at sea ---- */
  .aegean-page .sea-band .label{ color:oklch(0.88 0.04 240); }
  .aegean-page .sea-band h2.head{ color:#fff; }
  .aegean-page .count{ display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end;
    gap:clamp(1.5rem,5vw,3.5rem); margin-top:2.6rem; }
  .aegean-page .cd-unit{ display:flex; flex-direction:column; align-items:center; min-width:0; }
  .aegean-page .cd-unit .n{ font-family:var(--display); font-size:clamp(2.6rem,6vw,3.6rem); line-height:1; color:#fff;
    font-variant-numeric:lining-nums tabular-nums; }
  .aegean-page .cd-unit .l{ margin-top:.6rem; font-size:.7rem; letter-spacing:.34em; text-transform:uppercase;
    color:oklch(0.88 0.035 240); }
  @media(max-width:560px){
    .aegean-page .count{ display:grid; grid-template-columns:1fr 1fr; gap:2.4rem 1rem;
      justify-items:center; text-align:center; max-width:20rem; margin:2.2rem auto 0; }
  }

  /* ---- washing-line gallery ---- */
  .aegean-page .washline{ position:relative; margin-top:3.6rem; }
  .aegean-page .rope{ position:absolute; z-index:1; top:0; left:-2%; right:-2%; height:44px; pointer-events:none; }
  .aegean-page .rope svg{ width:100%; height:100%; display:block; }
  .aegean-page .rope path{ stroke:oklch(0.55 0.05 70); stroke-width:2.5; fill:none; }
  .aegean-page .pins{ position:relative; z-index:2; display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
    gap:clamp(1.2rem,3vw,2.6rem); padding-top:10px; }
  .aegean-page .pin{ position:relative; }
  .aegean-page .pin:nth-child(2){ margin-top:22px; }
  .aegean-page .peg{ position:absolute; z-index:3; top:-4px; left:50%; width:11px; height:24px; margin-left:-5.5px;
    border-radius:3px; background:linear-gradient(180deg,#cfa46c,#9a7444);
    box-shadow:0 1px 3px oklch(0.3 0.05 250 / .35); }
  .aegean-page .polar{ background:#fffdf9; border:1px solid var(--line); padding:10px 10px 0; margin-top:8px;
    box-shadow:0 28px 50px -30px oklch(.3 .06 250 / .55);
    transform:rotate(var(--tilt,0deg)); transform-origin:50% -14px; }
  /* polaroids idle-sway on the line all the time; hovering swings them harder */
  .aegean-page .polar{ animation:idlesway 6.5s ease-in-out infinite; }
  .aegean-page .pin:nth-child(1) .polar{ animation-delay:-1.1s; }
  .aegean-page .pin:nth-child(2) .polar{ animation-delay:-3.6s; }
  .aegean-page .pin:nth-child(3) .polar{ animation-delay:-5.2s; }
  @keyframes idlesway{
    0%,100%{ transform:rotate(calc(var(--tilt,0deg) - .9deg)); }
    50%{ transform:rotate(calc(var(--tilt,0deg) + .9deg)); } }
  .aegean-page .pin:hover .polar{ animation:swing 1.5s ease-in-out infinite; animation-delay:0s; }
  @keyframes swing{
    0%,100%{ transform:rotate(var(--tilt,0deg)); }
    30%{ transform:rotate(calc(var(--tilt,0deg) + 2.6deg)); }
    65%{ transform:rotate(calc(var(--tilt,0deg) - 2deg)); } }
  .aegean-page .polar img{ width:100%; aspect-ratio:3/3.3; object-fit:cover; display:block;
    background:oklch(.93 .015 245); }
  .aegean-page .polar .cap{ text-align:center; padding:.75rem 0 .95rem; font-family:var(--script);
    font-style:italic; color:var(--muted); font-size:1.02rem; }
  @media(max-width:640px){
    .aegean-page .pins{ display:flex; overflow-x:auto; scroll-snap-type:x mandatory;
      gap:1.2rem; padding:10px .1rem 1.2rem;
      -webkit-overflow-scrolling:touch; scrollbar-width:none; }
    .aegean-page .pins::-webkit-scrollbar{ display:none; }
    .aegean-page .pin{ flex:0 0 76%; scroll-snap-align:center; }
    .aegean-page .pin:nth-child(2){ margin-top:14px; }
    .aegean-page .gallery-dots{ display:flex; justify-content:center; gap:.55rem; margin-top:1.1rem; }
    .aegean-page .gallery-dots i{ width:7px; height:7px; border-radius:50%; background:var(--line);
      transition:background .3s, transform .3s; }
    .aegean-page .gallery-dots i.on{ background:var(--accent-2); transform:scale(1.25); }
  }
  @media(min-width:641px){ .aegean-page .gallery-dots{ display:none; } }

  /* ---- postcard RSVP ---- */
  .aegean-page .rsvp-lead{ max-width:40rem; margin:0 auto 2.8rem; text-align:center; }
  .aegean-page .rsvp-lead .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.5vw,1.95rem);
    line-height:1.4; color:var(--ink); }
  .aegean-page .rsvp-lead p{ color:var(--muted); margin-top:.9rem; }
  .aegean-page .postcard{ position:relative; max-width:56rem; margin:0 auto; background:#fffdf8;
    border:1px solid var(--line); border-radius:6px;
    box-shadow:0 40px 70px -42px oklch(.3 .06 250 / .6);
    display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr); }
  .aegean-page .pc-left{ padding:clamp(1.3rem,4vw,2.6rem); min-width:0; }
  .aegean-page .pc-right{ position:relative; border-left:1.5px dashed var(--line);
    padding:clamp(1.3rem,4vw,2.6rem); display:flex; flex-direction:column; gap:1.4rem; }
  .aegean-page .stamp{ align-self:flex-end; width:78px; padding:8px; background:#fff;
    border:1px dashed var(--line); text-align:center; }
  .aegean-page .stamp .val{ display:block; font-family:var(--display); font-size:.6rem; letter-spacing:.14em;
    color:var(--muted); margin-top:.35rem; }
  .aegean-page .postmark{ position:absolute; top:22px; right:96px; width:96px; height:96px;
    border:1.5px solid oklch(0.6 0.04 250 / .55); border-radius:50%;
    display:flex; align-items:center; justify-content:center; text-align:center;
    transform:rotate(-12deg); pointer-events:none; }
  .aegean-page .postmark span{ font-family:var(--display); font-size:.56rem; letter-spacing:.18em;
    text-transform:uppercase; color:oklch(0.6 0.04 250 / .8); line-height:1.7; }
  .aegean-page .addr{ margin-top:auto; }
  .aegean-page .addr .to{ font-family:var(--script); font-style:italic; color:var(--muted); font-size:1rem; }
  .aegean-page .addr .ln{ border-bottom:1px solid var(--line-soft); height:2.1rem; }
  .aegean-page .addr .ln.name{ font-family:var(--display); color:var(--ink); font-size:1.05rem;
    display:flex; align-items:flex-end; padding-bottom:.3rem; }
  @media(max-width:820px){
    .aegean-page .postcard{ grid-template-columns:minmax(0,1fr); }
    .aegean-page .pc-right{ border-left:0; border-top:1.5px dashed var(--line); }
    .aegean-page .postmark{ right:auto; left:22px; }
  }
  .aegean-page form.rsvp{ display:flex; flex-direction:column; gap:1.55rem; }
  .aegean-page .rsvp label{ display:block; font-family:var(--display); font-size:.68rem; letter-spacing:.32em;
    text-transform:uppercase; color:var(--label); margin-bottom:.4rem; }
  .aegean-page .field{ width:100%; min-height:44px; border:0; border-bottom:1px solid var(--line); background:transparent;
    padding:.55rem .1rem; color:var(--ink); font-family:var(--serif); font-size:1.08rem;
    transition:border-color .3s, box-shadow .3s; outline:none; border-radius:0; }
  .aegean-page .field::placeholder{ color:oklch(0.45 0.04 250 / .75); }
  .aegean-page .field:focus{ border-color:var(--accent-2); }
  .aegean-page .field:focus-visible{ border-color:var(--label-2); box-shadow:0 1px 0 0 var(--label-2); }
  .aegean-page select.field{ appearance:none; padding-right:1.8rem; cursor:pointer;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%233a6ea5' stroke-width='1.4'/></svg>");
    background-repeat:no-repeat; background-position:right .3rem center; }
  .aegean-page textarea.field{ resize:none; }
  .aegean-page .two{ display:grid; gap:1.55rem; }
  @media(min-width:560px){ .aegean-page .two{ grid-template-columns:1fr 1fr; } }
  .aegean-page .send{ align-self:flex-start; display:inline-flex; align-items:center; gap:.8rem; margin-top:.3rem;
    min-height:48px; border:1px solid var(--accent); background:transparent; padding:.9rem 2.2rem;
    font-family:var(--display); font-size:.76rem; letter-spacing:.3em; text-transform:uppercase;
    color:var(--ink); cursor:pointer; transition:all .35s; }
  .aegean-page .send::after{ content:"\2192"; font-family:var(--serif); font-size:1rem; line-height:1;
    transition:transform .35s; }
  .aegean-page .send:hover{ background:var(--accent); color:var(--bg); }
  .aegean-page .send:hover::after{ transform:translateX(5px); }
  .aegean-page .send:disabled{ opacity:.5; cursor:progress; }
  .aegean-page .send-error{ margin:.2rem 0 0; padding-left:.9rem; border-left:2px solid oklch(0.52 0.17 25); font-family:var(--serif); font-style:italic; font-size:1rem; line-height:1.5; color:oklch(0.45 0.15 25); }
  @media(max-width:420px){ .aegean-page .send{ align-self:stretch; justify-content:center; padding:.9rem 1.2rem; } }

  .aegean-page footer{ position:relative; z-index:5; text-align:center; padding:5rem 1.5rem 4rem;
    background:var(--bg-deep); }
  .aegean-page footer .mono{ font-family:var(--display); letter-spacing:.5em; color:var(--label); font-size:.85rem; }
  .aegean-page footer .q{ font-family:var(--script); font-style:italic; color:var(--muted); font-size:1.15rem;
    max-width:30rem; margin:1.3rem auto 0; line-height:1.5; }
  .aegean-page footer .nazar{ margin-top:1.6rem; display:flex; justify-content:center; opacity:.9; }

  #toast{ position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
    z-index:60; width:max-content; min-width:min(280px, calc(100vw - 2rem)); max-width:calc(100vw - 2rem); background:var(--bg); border:1px solid var(--accent);
    color:var(--ink); padding:1rem 1.25rem; box-shadow:0 24px 55px -24px oklch(.32 .06 250 / .5);
    opacity:0; pointer-events:none; transition:opacity .4s, transform .4s; }
  #toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  #toast .tt{ font-family:var(--display); letter-spacing:.04em; }
  #toast .td{ margin-top:.3rem; font-family:var(--script); font-style:italic; color:var(--muted); }

  /* ===== Scroll reveals =====
     Content is only hidden once JS has armed the observer (.rv on the root),
     so a script failure can never leave text invisible. */
  .aegean-page .reveal{ transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
  .aegean-page.rv .reveal{ opacity:0; transform:translateY(34px); }
  .aegean-page.rv .reveal.in{ opacity:1; transform:none; }

  /* ===== Hero entrance (starts on mount, settles within ~1.2s) ===== */
  @keyframes archIn{ from{ opacity:0; translate:0 30px; scale:.97; } }
  .aegean-page .arch-frame{ animation:archIn .9s cubic-bezier(.16,1,.3,1) backwards; }
  @keyframes heroRise{ from{ opacity:0; translate:0 18px; } }
  .aegean-page .arch-frame .label{ animation:heroRise .7s cubic-bezier(.16,1,.3,1) .12s backwards; }
  .aegean-page .arch-frame .names{ animation:heroRise .7s cubic-bezier(.16,1,.3,1) .22s backwards; }
  .aegean-page .arch-frame .hero-meta{ animation:heroRise .7s cubic-bezier(.16,1,.3,1) .34s backwards; }
  .aegean-page .hero-actions{ animation:heroRise .7s cubic-bezier(.16,1,.3,1) .45s backwards; }
  /* the intro ends on the bare wall, so the vines and the shore fade in over it */
  @keyframes wallIn{ from{ opacity:0; } }
  .aegean-page .hero .vinehost, #sea{ animation:wallIn 1.2s ease backwards; }

  .aegean-page.rv .washline.reveal{ opacity:1; transform:none; }
  .aegean-page.rv .washline.reveal .pin{ opacity:0; translate:0 30px;
    transition:opacity .8s cubic-bezier(.16,1,.3,1), translate .8s cubic-bezier(.16,1,.3,1); }
  .aegean-page.rv .washline.reveal .polar img{ filter:blur(10px) saturate(.5) brightness(1.18);
    transition:filter 1.1s ease .1s; }
  .aegean-page.rv .washline.reveal.in .pin{ opacity:1; translate:0 0; }
  .aegean-page.rv .washline.reveal.in .polar img{ filter:none; }
  .aegean-page.rv .washline.reveal.in .pin:nth-child(2){ transition-delay:.12s; }
  .aegean-page.rv .washline.reveal.in .pin:nth-child(3){ transition-delay:.24s; }
  .aegean-page.rv .washline.reveal.in .pin:nth-child(2) .polar img{ transition-delay:.25s; }
  .aegean-page.rv .washline.reveal.in .pin:nth-child(3) .polar img{ transition-delay:.38s; }

  .aegean-page.rv .count.reveal{ opacity:1; transform:none; }
  .aegean-page.rv .count.reveal .cd-unit{ opacity:0; translate:0 18px;
    transition:opacity .7s cubic-bezier(.16,1,.3,1), translate .7s cubic-bezier(.16,1,.3,1); }
  .aegean-page.rv .count.reveal.in .cd-unit{ opacity:1; translate:0 0; }
  .aegean-page.rv .count.reveal.in .cd-unit:nth-child(2){ transition-delay:.08s; }
  .aegean-page.rv .count.reveal.in .cd-unit:nth-child(3){ transition-delay:.16s; }
  .aegean-page.rv .count.reveal.in .cd-unit:nth-child(4){ transition-delay:.24s; }

  .aegean-page .cd-unit .n{ display:inline-grid; overflow:hidden; justify-items:center; }
  .aegean-page .cd-unit .n .roll{ grid-area:1/1; }
  .aegean-page .cd-unit .n .roll.out{ animation:rollOut .5s cubic-bezier(.45,0,.55,1) forwards; }
  .aegean-page .cd-unit .n .roll.in{ animation:rollIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes rollOut{ to{ translate:0 -85%; opacity:0; } }
  @keyframes rollIn{ from{ translate:0 85%; opacity:0; } }

  /* reduced motion: everything is shown immediately, nothing loops */
  @media(prefers-reduced-motion:reduce){
    html{ scroll-behavior:auto; }
    .aegean-page .reveal, .aegean-page .reveal *{ transition:none !important; }
    .aegean-page.rv .reveal, .aegean-page.rv .washline.reveal .pin, .aegean-page.rv .count.reveal .cd-unit{ opacity:1; transform:none; translate:0 0; }
    .aegean-page.rv .washline.reveal .polar img{ filter:none; }
    .aegean-page .arch-frame, .aegean-page .arch-frame .label, .aegean-page .arch-frame .names,
    .aegean-page .arch-frame .hero-meta, .aegean-page .hero-actions,
    .aegean-page .hero .vinehost, #sea{ animation:none; }
    .aegean-page .scroll-cue::after, .aegean-page .vinner, .aegean-page .polar, .aegean-page .pin:hover .polar{ animation:none; }
    #sea .tide, #sea .foam.f2, #sparkle, #boat, #boat .bob{ animation:none; }
    .aegean-page .cd-unit .n .roll.out, .aegean-page .cd-unit .n .roll.in{ animation:none; }
    .aegean-page .cd-unit .n .roll.out{ display:none; }
  }
`

const DIVIDER_PATH = 'M0,26 C240,44 480,4 720,20 C960,36 1200,10 1440,26 L1440,44 L0,44 Z'

/* ---------- helpers ---------- */

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Robust scroll reveal: IntersectionObserver plus a scroll/resize sweep that
 *  reveals anything already at or above the viewport (fast scrolls, anchor
 *  jumps, late IO callbacks). Reduced motion or no IO → show everything. */
function setupReveals(root, signal) {
  const els = [...root.querySelectorAll('.reveal')]
  const showAll = () => els.forEach(el => el.classList.add('in'))
  if (reducedMotion() || !('IntersectionObserver' in window)) { showAll(); return }
  root.classList.add('rv')
  const pending = new Set(els)
  let raf = 0
  const reveal = el => {
    if (!pending.delete(el)) return
    el.classList.add('in'); io.unobserve(el)
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) reveal(e.target)
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 })
  els.forEach(el => io.observe(el))
  const sweep = () => {
    raf = 0
    const limit = window.innerHeight * 0.96
    for (const el of pending) if (el.getBoundingClientRect().top < limit) reveal(el)
  }
  const queue = () => { if (!raf && pending.size) raf = requestAnimationFrame(sweep) }
  window.addEventListener('scroll', queue, { passive: true, signal })
  window.addEventListener('resize', queue, { signal })
  queue()
  signal.addEventListener('abort', () => {
    io.disconnect(); cancelAnimationFrame(raf)
    root.classList.remove('rv')
  })
}

function downloadIcs(w) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${icsText(w.couple)}//Dugun//TR`, 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${w.uid}`, `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${w.icsStart}`, `DTEND:${w.icsEnd}`,
    `SUMMARY:${icsText(`${w.couple} — Bir Ege Düğünü`)}`,
    `LOCATION:${icsText(w.place)}`,
    'DESCRIPTION:Zeytinlerin altında nikâh\\; ardından gün batımı kokteyli ve uzun masa.',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = w.icsFile
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function NazarSvg({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true" focusable="false">
      <circle cx="13" cy="13" r="12" fill="#1d4e89" />
      <circle cx="13" cy="13" r="8" fill="#eaf3fb" />
      <circle cx="13" cy="13" r="5" fill="#3f8ac9" />
      <circle cx="13" cy="13" r="2.4" fill="#12233c" />
    </svg>
  )
}

/* ---------- page ---------- */

export default function AegeanWeddingPage() {
  const rootRef = useRef(null)
  const timersRef = useRef([])
  const rsvp = useRsvp('tr')
  const sending = rsvp.status === 'sending'
  const [toast, setToast] = useState({ show: false, title: '', text: '' })

  /* ===== Düğün günü — sayfadaki tüm isim, tarih ve yerler buradan ===== */
  const {
    card, partner1, partner2, eventDate, venue, city, address, rsvpDeadline,
  } = useWeddingCardFields(DEFAULTS, LOCALE)
  const targetMs = eventDate.getTime()
  const day = icsStamp(eventDate).slice(0, 8)
  const place = placeQuery(venue, address, city)
  // posta damgası: şehrin ilk parçası üstte, kalanı altta ("Alaçatı" / "Çeşme")
  const [pmTop, ...pmRest] = city.split(',').map(s => s.trim()).filter(Boolean)
  const WEDDING = {
    partner1,
    partner2,
    couple: `${partner1} & ${partner2}`,
    icsStart: icsStamp(eventDate),
    icsEnd: icsStamp(new Date(targetMs + EVENT_HOURS * 36e5)),
    uid: `${slug(partner1)}-${slug(partner2)}-${day}@dugun`,
    icsFile: `${slug(partner1)}-${slug(partner2)}-dugun.ics`,
    // API'den gelen etiket öncelikli; yoksa etkinlik tarihinin Türkçe biçimi
    heroLine: cardDetail(card, 'dateLabel', formatHeroDate(eventDate)),
    where: `${venue} — ${city}`,
    place,
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(place)}`,
    postmarkTop: pmTop || '',
    postmarkBottom: pmRest.join(', '),
    postmark: formatPostmark(eventDate),
    year: dateParts(eventDate, { year: 'numeric' }).year,
    rsvpBy: rsvpDeadline,
    mono: `${initial(partner1)} · ${initial(partner2)}`,
  }

  // Arm reveals before first paint so nothing flashes in then hides.
  useLayoutEffect(() => {
    const root = rootRef.current; if (!root) return
    const ac = new AbortController()
    setupReveals(root, ac.signal)
    return () => ac.abort()
  }, [])

  useEffect(() => {
    const root = rootRef.current; if (!root) return
    const ac = new AbortController()
    const { signal } = ac
    const $ = sel => root.querySelector(sel)
    const reduce = reducedMotion()

    /* ===== Twin bougainvillea vines, grown in JS ===== */
    ;(function () {
      const hosts = [...root.querySelectorAll('.vinehost .vinner')]; if (!hosts.length) return
      const PET = ['#d81b7f', '#e5399b', '#c2186f', '#f06bb4', '#ee4f9e', '#b1135f']
      const rnd = (a, b) => a + Math.random() * (b - a)
      function grow(host) {
        host.innerHTML = ''
        const W = host.clientWidth || 460, H = host.clientHeight || 430
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
        svg.setAttribute('width', W); svg.setAttribute('height', H)
        host.appendChild(svg)
        const density = Math.min(1, innerWidth / 1200)
        const NB = Math.max(5, Math.round(8 * Math.max(.6, density)))
        const frag = document.createDocumentFragment()
        for (let b = 0; b < NB; b++) {
          const x0 = rnd(W * 0.7, W * 0.99), y0 = rnd(-24, 4)
          const x2 = rnd(W * 0.02, W * 0.74), y2 = rnd(H * 0.26, H * 0.97)
          const x1 = (x0 + x2) / 2 + rnd(-W * 0.2, W * 0.08), y1 = (y0 + y2) / 2 + rnd(-H * 0.22, H * 0.06)
          const path = document.createElementNS(svg.namespaceURI, 'path')
          path.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`)
          path.setAttribute('fill', 'none')
          path.setAttribute('stroke', Math.random() < 0.5 ? '#6d4f3d' : '#5c6b3e')
          path.setAttribute('stroke-width', rnd(2, 3.6).toFixed(1))
          path.setAttribute('stroke-linecap', 'round')
          path.setAttribute('opacity', '.9')
          svg.appendChild(path)
          const q = t => ({ x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2, y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2 })
          for (let t = 0.1; t <= 1.001; t += rnd(0.045, 0.075)) {
            const pt = q(t)
            const nl = Math.random() < 0.85 ? (Math.random() < 0.35 ? 2 : 1) : 0
            for (let j = 0; j < nl; j++) {
              const l = document.createElement('i'); l.className = 'vleaf'
              l.style.left = (pt.x + rnd(-11, 11)).toFixed(1) + 'px'; l.style.top = (pt.y + rnd(-11, 11)).toFixed(1) + 'px'
              l.style.transform = `rotate(${rnd(0, 360).toFixed(0)}deg) scale(${rnd(.7, 1.35).toFixed(2)})`
              frag.appendChild(l)
            }
            if (t > 0.22 && Math.random() < 0.85) {
              const cx = pt.x + rnd(-10, 10), cy = pt.y + rnd(-10, 10)
              const n = 3 + (Math.random() * 3 | 0), base = PET[(Math.random() * PET.length) | 0]
              const swell = 0.8 + t * 0.5 /* clusters swell toward the branch tip */
              for (let k = 0; k < n; k++) {
                const p = document.createElement('i'); p.className = 'petal-shape'
                p.style.setProperty('--p0', base)
                p.style.left = (cx + rnd(-10, 10)).toFixed(1) + 'px'; p.style.top = (cy + rnd(-9, 9)).toFixed(1) + 'px'
                p.style.transform = `rotate(${rnd(0, 360).toFixed(0)}deg) scale(${(rnd(.85, 1.5) * swell).toFixed(2)})`
                frag.appendChild(p)
              }
              const c = document.createElement('i'); c.className = 'vheart'
              c.style.left = cx.toFixed(1) + 'px'; c.style.top = cy.toFixed(1) + 'px'
              frag.appendChild(c)
            }
          }
        }
        host.appendChild(frag)
      }
      hosts.forEach(grow)
      // regrow only when the width really changes (mobile URL-bar resizes keep the same vines)
      let rt = 0, lastW = innerWidth
      addEventListener('resize', () => {
        clearTimeout(rt)
        rt = setTimeout(() => { if (innerWidth !== lastW) { lastW = innerWidth; hosts.forEach(grow) } }, 250)
      }, { signal })
      signal.addEventListener('abort', () => { clearTimeout(rt); hosts.forEach(h => { h.innerHTML = '' }) })
    })()

    /* ===== Kıyı etkileşimi: suyun üstünde gezinince dalgacıklar yayılır ===== */
    ;(function () {
      const sea = $('#sea'); if (!sea || reduce) return
      /* shoreline runs diagonally from ~43.5% (top) to ~29.7% (bottom) of the width */
      const inWater = (x, y, r) => {
        const yf = (y - r.top) / r.height
        const xf = (x - r.left) / r.width
        return xf > 0.435 + (0.297 - 0.435) * yf
      }
      const spawn = (x, y, cls) => {
        const r = sea.getBoundingClientRect()
        const el = document.createElement('span'); el.className = cls
        el.style.left = (x - r.left) + 'px'; el.style.top = (y - r.top) + 'px'
        el.addEventListener('animationend', () => el.remove(), { once: true })
        sea.appendChild(el)
      }
      let lastRip = 0
      addEventListener('pointermove', e => {
        const r = sea.getBoundingClientRect()
        if (r.top > innerHeight || r.bottom < 0) return
        if (e.clientY < r.top || e.clientY > r.bottom) return
        if (!inWater(e.clientX, e.clientY, r)) return
        const now = performance.now()
        if (now - lastRip < 130) return
        lastRip = now
        spawn(e.clientX, e.clientY, 'ripple mini')
      }, { passive: true, signal })
      /* tap the water: a bigger ripple spreads */
      addEventListener('pointerdown', e => {
        const r = sea.getBoundingClientRect()
        if (e.clientY < r.top - 6 || e.clientY > r.bottom + 6 || r.top > innerHeight || r.bottom < 0) return
        if (!inWater(e.clientX, e.clientY, r)) return
        spawn(e.clientX, e.clientY, 'ripple')
      }, { passive: true, signal })
      signal.addEventListener('abort', () => sea.querySelectorAll('.ripple').forEach(el => el.remove()))
    })()

    /* ===== Ekran dışındaki bölümlerin döngüsel animasyonlarını duraklat ===== */
    ;(function () {
      const targets = [$('.hero'), $('.washline')].filter(Boolean)
      if (!targets.length || !('IntersectionObserver' in window)) return
      const io = new IntersectionObserver(entries => {
        for (const e of entries) e.target.classList.toggle('is-off', !e.isIntersecting)
      }, { rootMargin: '60px 0px' })
      targets.forEach(t => io.observe(t))
      signal.addEventListener('abort', () => { io.disconnect(); targets.forEach(t => t.classList.remove('is-off')) })
    })()

    /* ===== Vine parallax (only while the hero is in view) ===== */
    ;(function () {
      const vines = [...root.querySelectorAll('.vinehost')]; if (!vines.length || reduce) return
      let raf = 0
      const update = () => {
        raf = 0
        if (scrollY > innerHeight * 1.5) return
        const y = (scrollY * 0.12).toFixed(1)
        vines.forEach(v => { v.style.translate = `0 ${y}px` })
      }
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update) }, { passive: true, signal })
      signal.addEventListener('abort', () => cancelAnimationFrame(raf))
    })()

    /* ===== Galeri slider noktaları (mobil) ===== */
    ;(function () {
      const gal = $('.pins'), dots = $('#galleryDots')
      if (!gal || !dots) return
      const frames = [...gal.querySelectorAll('.pin')], pips = [...dots.children]
      let raf = 0
      gal.addEventListener('scroll', () => {
        if (raf) return
        raf = requestAnimationFrame(() => {
          raf = 0
          const mid = gal.scrollLeft + gal.clientWidth / 2
          let best = 0, bd = Infinity
          frames.forEach((f, i) => { const c = f.offsetLeft + f.offsetWidth / 2, d = Math.abs(c - mid); if (d < bd) { bd = d; best = i } })
          pips.forEach((p, i) => p.classList.toggle('on', i === best))
        })
      }, { passive: true, signal })
      signal.addEventListener('abort', () => cancelAnimationFrame(raf))
    })()

    return () => ac.abort()
  }, [])

  /* ===== Geri sayım (rakamlar kayarak değişir) — ayrı effect: API tarihi
     değişirse yalnızca saat yeniden kurulur, asmalar değil ===== */
  useEffect(() => {
    const root = rootRef.current; if (!root) return
    const ac = new AbortController()
    const { signal } = ac
    const $ = sel => root.querySelector(sel)
    ;(function () {
      const TARGET = targetMs
      const els = ['#cd-d', '#cd-h', '#cd-m', '#cd-s'].map($)
      if (els.some(el => !el)) return
      const [d, h, m, s] = els
      const pad = n => String(Math.max(0, n)).padStart(2, '0')
      function roll(el, v) {
        if (el.dataset.v === v) return
        const old = el.dataset.v
        el.dataset.v = v
        if (old === undefined || document.hidden) { el.textContent = v; return }
        el.innerHTML = `<span class="roll out" aria-hidden="true">${old}</span><span class="roll in">${v}</span>`
      }
      function tick() {
        const diff = Math.max(0, TARGET - Date.now())
        roll(d, pad(Math.floor(diff / 864e5))); roll(h, pad(Math.floor(diff % 864e5 / 36e5)))
        roll(m, pad(Math.floor(diff % 36e5 / 6e4))); roll(s, pad(Math.floor(diff % 6e4 / 1e3)))
      }
      tick()
      const id = setInterval(tick, 1000)
      signal.addEventListener('abort', () => clearInterval(id))
    })()

    return () => ac.abort()
  }, [targetMs])

  useEffect(() => {
    const timers = timersRef.current
    return () => { timers.forEach(clearTimeout); timers.length = 0 }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (sending) return
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const attending = data.get('attendance') === 'geliyorum'
    const meal = attending ? String(data.get('meal') || '').trim() : ''
    // yanıtın ayrı bir yemek alanı yok; seçim nota eklenir
    const note = [String(data.get('message') || '').trim(), meal ? `Yemek: ${meal}` : '']
      .filter(Boolean)
      .join('\n')
      .slice(0, 1000)
    if (!(await rsvp.submit({ name, attending, guests: 1, note }))) return
    setToast({
      show: true,
      title: 'Teşekkürler — kartpostalınız yola çıktı',
      text: name ? `Sizinle kutlamak için sabırsızlanıyoruz, ${name}.` : 'Sizinle kutlamak için sabırsızlanıyoruz.',
    })
    form.reset()
    timersRef.current.push(setTimeout(() => setToast(t => ({ ...t, show: false })), 5000))
  }


  return (
    <div ref={rootRef} className="aegean-page" lang="tr">
      <meta name="description" content={`${partner1} ve ${partner2} sizi Ege düğünlerine davet ediyor — ${WEDDING.where}.`} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <style>{css}</style>

      <div id="ground" aria-hidden="true"></div>
      <div id="grain" aria-hidden="true"></div>

      <main>
        {/* HERO */}
        <section className="hero" data-screen-label="01 Hero">
          <div id="vine-r" className="vinehost" aria-hidden="true"><div className="vinner"></div></div>
          <div id="vine-l" className="vinehost" aria-hidden="true"><div className="vinner"></div></div>
          <div id="sea" aria-hidden="true">
            <svg className="shoreSvg" viewBox="0 0 1440 360" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id="agWater" x1="0" y1="0.1" x2="1" y2="0">
                  <stop offset="0" stopColor="#c9efe9" />
                  <stop offset="0.16" stopColor="#8fd8d2" />
                  <stop offset="0.42" stopColor="#3fa4c6" />
                  <stop offset="0.72" stopColor="#1d7ac2" />
                  <stop offset="1" stopColor="#14549b" />
                </linearGradient>
              </defs>
              {/* wet sand left behind by the retreating wave */}
              <path className="wetline" d="M626,-12 C548,110 496,235 428,372" fill="none" stroke="oklch(0.74 0.065 70)" strokeWidth="48" opacity=".45" />
              {/* foam trace fading on the sand */}
              <path className="foam f2" d="M604,-12 C526,110 474,235 406,372" fill="none" stroke="#ffffff" strokeWidth="4.5" opacity=".5" />
              {/* the sea itself washes in and out */}
              <g className="tide">
                <path className="water" d="M626,-12 C548,110 496,235 428,372 L1500,372 L1500,-12 Z" fill="url(#agWater)" />
                <path className="foam f1" d="M626,-12 C548,110 496,235 428,372" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity=".85" />
                <path className="foam f3" d="M668,-12 C590,110 538,235 470,372" fill="none" stroke="#eafcf8" strokeWidth="3.5" opacity=".35" />
              </g>
            </svg>
            <div id="sparkle"></div>
            <div id="boat"><div className="bob"><svg width="54" height="46" viewBox="0 0 54 46" focusable="false"><path d="M28 4 v28" stroke="#20344d" strokeWidth="2" /><path d="M28 6 C41 14 43 25 28 31 Z" fill="#f7f3ea" /><path d="M26 9 C16 16 15 25 26 31 Z" fill="#e9e2d2" /><path d="M6 34 h42 l-8 8 H14 Z" fill="#20344d" /></svg></div></div>
          </div>
          <div className="shell">
            <div className="arch-frame">
              <span className="label">Bir Ege Düğünü</span>
              <h1 className="names">{partner1}<span className="amp"> ve </span>{partner2}</h1>
              <div className="hero-meta">
                <p className="when">{WEDDING.heroLine}</p>
                <p className="where">{WEDDING.where}</p>
              </div>
            </div>
            <div className="hero-actions">
              <button type="button" className="ghost" onClick={() => downloadIcs(WEDDING)}>Takvime Ekle</button>
              <span className="dot" aria-hidden="true">·</span>
              <a className="ghost" href={WEDDING.mapUrl} target="_blank" rel="noopener noreferrer">Yol Tarifi<span className="sr-only"> (yeni sekmede açılır)</span></a>
            </div>
          </div>
          <a className="scroll-cue" href="#davet">Kaydır</a>
        </section>

        {/* DAVET */}
        <div className="wave deep" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d={DIVIDER_PATH} /></svg></div>
        <section className="band order" id="davet" data-screen-label="02 Davet" style={{ marginTop: '-1px' }}>
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Davet</span></div>
            <div className="invite reveal">
              <p className="lead">Begonvillerin gölgesinde, denize karşı —<br />iki hayat tek yaza karışıyor.</p>
              <p className="body">Ailelerimizin sevinci ve duasıyla <strong>{partner1}</strong> ile <strong>{partner2}</strong> evleniyor; sizi de nikâhımıza bekliyoruz — zeytin ağaçlarının altında bir ikindi, ardından deniz kenarında uzun bir yaz gecesi.</p>
              <p className="body">En beyaz keteninizi giyin, en güzel anılarınızı getirin. Limonata, uzun masa ve gün doğana dek dans bizden.</p>
            </div>
          </div>
        </section>
        <div className="wave deep flip" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d={DIVIDER_PATH} /></svg></div>

        {/* GÜNÜN AKIŞI — sahil rotası */}
        <section className="band" data-screen-label="03 Günün Akışı">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Günün Akışı</span></div>
            <h2 className="head reveal">Ağır bir yaz ikindisi,<br />masmavi bir geceye.</h2>
            <div className="route">
              <div className="rstop reveal"><span className="time">16.30</span><h3>Karşılama</h3><p>Ev yapımı limonata &amp; zeytinlikte gölge keyfi.</p></div>
              <div className="rstop reveal"><span className="time">17.00</span><h3>Nikâh</h3><p>Asırlık zeytinin altında, denize karşı.</p></div>
              <div className="rstop reveal"><span className="time">18.30</span><h3>Gün Batımı</h3><p>Kokteyl, fotoğraflar ve ufka batan güneş.</p></div>
              <div className="rstop reveal"><span className="time">20.00</span><h3>Akşam Yemeği</h3><p>Taş avluda mum ışığında uzun masa.</p></div>
              <div className="rstop reveal"><span className="time">Gece</span><h3>Dans &amp; Yıldızlar</h3><p>Deniz sesi eşliğinde, yıldızların altında.</p></div>
            </div>
          </div>
        </section>

        {/* GERİ SAYIM — denizde */}
        <div className="wave sea" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d={DIVIDER_PATH} /></svg></div>
        <section className="band sea-band" data-screen-label="04 Geri Sayım" style={{ marginTop: '-1px' }}>
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Geri Sayım</span></div>
            <h2 className="head reveal">Deniz bizi bekliyor.</h2>
            <div className="count reveal" id="cd">
              <div className="cd-unit"><span className="n" id="cd-d">00</span><span className="l">Gün</span></div>
              <div className="cd-unit"><span className="n" id="cd-h">00</span><span className="l">Saat</span></div>
              <div className="cd-unit"><span className="n" id="cd-m">00</span><span className="l">Dakika</span></div>
              <div className="cd-unit"><span className="n" id="cd-s">00</span><span className="l">Saniye</span></div>
            </div>
          </div>
        </section>
        <div className="wave sea2 flip" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d={DIVIDER_PATH} /></svg></div>

        {/* FOTOĞRAFLAR — çamaşır ipi */}
        <section className="band" data-screen-label="05 İkimiz">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">İkimiz</span></div>
            <h2 className="head reveal">Avluda kurusun<br />birkaç güzel yaz.</h2>
            <div className="washline reveal">
              <div className="rope" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d="M0,8 Q720,44 1440,8" /></svg></div>
              <div className="pins">
                {/* Kendi fotoğrafını eklemek için src="..." değerini değiştir */}
                <div className="pin" style={{ '--tilt': '-2.4deg' }}><span className="peg" aria-hidden="true"></span><figure className="polar"><img src={couple1} alt={`${partner1} ile ${partner2}, her şeyin başladığı yerde`} loading="lazy" decoding="async" /><figcaption className="cap">her şeyin başladığı yer</figcaption></figure></div>
                <div className="pin" style={{ '--tilt': '1.8deg' }}><span className="peg" aria-hidden="true"></span><figure className="polar"><img src={couple2} alt={`${partner1} ile ${partner2}, evlilik teklifi günü`} loading="lazy" decoding="async" /><figcaption className="cap">o soru</figcaption></figure></div>
                <div className="pin" style={{ '--tilt': '-1.4deg' }}><span className="peg" aria-hidden="true"></span><figure className="polar"><img src={couple3} alt={`${partner1} ile ${partner2}, geçen eylül`} loading="lazy" decoding="async" /><figcaption className="cap">geçen eylül</figcaption></figure></div>
              </div>
            </div>
            <div className="gallery-dots" id="galleryDots" aria-hidden="true"><i className="on"></i><i></i><i></i></div>
          </div>
        </section>

        {/* LCV — kartpostal */}
        <div className="wave deep" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none" focusable="false"><path d={DIVIDER_PATH} /></svg></div>
        <section className="band order" id="rsvp" data-screen-label="06 LCV" style={{ marginTop: '-1px' }}>
          <div className="shell">
            <div className="eyrow reveal"><span className="label">LCV</span></div>
            <div className="rsvp-lead reveal">
              <p className="lead">Bizimle denize karşı kadeh kaldırır mısınız?</p>
              <p>Sofranızı ayırabilmemiz için lütfen en geç {WEDDING.rsvpBy} gününe kadar haber verin.</p>
            </div>
            <div className="postcard reveal">
              <div className="pc-left">
                <form className="rsvp" onSubmit={handleSubmit} aria-busy={sending}>
                  <div>
                    <label htmlFor="ag-name">Adınız</label>
                    <input className="field" id="ag-name" name="name" required maxLength={120} placeholder="Size nasıl seslenelim?" autoComplete="name" />
                  </div>
                  <div className="two">
                    <div>
                      <label htmlFor="ag-attendance">Katılım</label>
                      <select className="field" id="ag-attendance" name="attendance" required defaultValue="">
                        <option value="" disabled>— seçiniz —</option>
                        <option value="geliyorum">Seve seve geliyorum</option>
                        <option value="gelemiyorum">Ne yazık ki gelemiyorum</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ag-meal">Yemek</label>
                      <select className="field" id="ag-meal" name="meal" defaultValue="">
                        <option value="">— seçiniz —</option>
                        <option>Izgara deniz mahsulleri</option>
                        <option>Zeytinlikten (vejetaryen)</option>
                        <option>Vegan</option>
                        <option>Izgara et</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ag-message">Çifte notunuz</label>
                    <textarea className="field" id="ag-message" name="message" rows={3} maxLength={1000} placeholder="Bir dilek, bir anı, bir şarkı isteği…"></textarea>
                  </div>
                  {rsvp.error ? <p className="send-error" role="alert">{rsvp.error}</p> : null}
                  <button type="submit" className="send" disabled={sending}><span className="btn-label">{sending ? 'Gönderiliyor…' : 'Gönder'}</span></button>
                </form>
              </div>
              <div className="pc-right" aria-hidden="true">
                <div className="stamp">
                  <NazarSvg size={34} />
                  <span className="val">EGE · {WEDDING.year}</span>
                </div>
                <div className="postmark"><span>{WEDDING.postmarkTop}<br />{WEDDING.postmark}{WEDDING.postmarkBottom && <><br />{WEDDING.postmarkBottom}</>}</span></div>
                <div className="addr">
                  <p className="to">Kime:</p>
                  <div className="ln name">{partner1} &amp; {partner2}</div>
                  <div className="ln"></div>
                  <div className="ln"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <p className="mono">{WEDDING.mono}</p>
          <p className="q">“İki kıyı, tek deniz — iki kalp, tek ömür.”</p>
          <div className="nazar" aria-hidden="true">
            <NazarSvg />
          </div>
        </footer>
      </main>

      <div id="toast" className={toast.show ? 'show' : ''} role="status" aria-live="polite">
        <div className="tt">{toast.title}</div><div className="td">{toast.text}</div>
      </div>
    </div>
  )
}
