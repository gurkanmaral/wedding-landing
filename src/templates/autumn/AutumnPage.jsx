import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cardDetail, useWeddingCardFields } from '../../api/weddingCardContext'
import { useRsvp } from '../../api/useRsvp'

const autumnTree = '/assets/autumn/autumn-tree.png'
const couple1 = '/assets/autumn/couple-1.svg'
const couple2 = '/assets/autumn/couple-2.svg'
const couple3 = '/assets/autumn/couple-3.svg'

/* ===== Demo couple — the API (useWeddingCardFields) overrides any of these =====
   Saturday 16 October 2027, ceremony 4:00 PM Eastern (EDT, UTC-4). */
const DEFAULTS = {
  partner1: 'Jane',
  partner2: 'Joe',
  eventDate: '2027-10-16T16:00:00-04:00', // ceremony start, countdown target
  venue: 'Maplewood Estate',
  city: 'Hudson Valley, New York',
  address: 'Maplewood Estate, Hudson Valley, New York',
  rsvpDeadline: 'the 4th of September, 2027',
}
const LOCALE = 'en-GB'
const EVENT_TZ = 'America/New_York' // dates are shown in the venue's time zone
const EVENT_HOURS = 7 // ceremony to last dance (4:00 PM – 11:00 PM)

const ordinal = n => {
  const v = n % 100
  if (v >= 11 && v <= 13) return `${n}th`
  return `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' })[n % 10] || 'th'}`
}

/** "Saturday · the 16th of October · 2027" — the hero's own date style. */
function formatHeroDate(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: EVENT_TZ,
  }).formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.weekday} · the ${ordinal(Number(parts.day))} of ${parts.month} · ${parts.year}`
}

const icsStamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const slug = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'x'
const initial = s => ([...String(s).trim()][0] || '').toLocaleUpperCase(LOCALE)
/** venue + address + city without repeating a part the others already contain */
function placeQuery(venue, address, city) {
  let q = address || ''
  if (venue && !q.includes(venue)) q = q ? `${venue}, ${q}` : venue
  if (city && !q.includes(city)) q = q ? `${q}, ${city}` : city
  return q
}

const LEAF_HTML = '<div class="maple-leaf"><div class="top trapezium"></div><div class="mid"><div class="left trapezium"></div><div class="center"></div><div class="right trapezium"></div></div><div class="branch"></div></div>'

const css = String.raw`
  :root{
    --bg:        oklch(0.962 0.022 80);
    --bg-deep:   oklch(0.93 0.034 68);
    --ink:       oklch(0.28 0.045 50);
    --muted:     oklch(0.45 0.05 55);
    --accent:    oklch(0.55 0.16 50);
    --accent-2:  oklch(0.62 0.14 38);
    /* darker burnt orange for small letter-spaced labels (AA on cream) */
    --label:     oklch(0.47 0.13 46);
    --line:      oklch(0.78 0.055 60);
    --line-soft: oklch(0.78 0.05 60 / .45);
    --display: "Marcellus", serif;
    --serif:   "EB Garamond", serif;
    --script:  "Cormorant Garamond", serif;
  }
  .autumn-page, .autumn-page *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{
    background:var(--bg); color:var(--ink);
    font-family:var(--serif); font-size:18px; line-height:1.7;
    -webkit-font-smoothing:antialiased; overflow-x:clip;
  }
  html{ overflow-x:clip; }
  .autumn-page{ overflow-x:clip; }
  ::selection{ background:var(--accent); color:var(--bg); }
  .autumn-page .sr-only{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap; }

  /* visible keyboard focus */
  .autumn-page a:focus-visible, .autumn-page button:focus-visible{
    outline:2px solid var(--label); outline-offset:4px; border-radius:2px; }

  /* ---- static warm ground (no scroll recolor) ---- */
  #ground{ position:fixed; inset:0; z-index:0;
    background:
      radial-gradient(120% 80% at 15% 8%, oklch(0.97 0.02 85) 0%, transparent 55%),
      radial-gradient(140% 90% at 92% 100%, oklch(0.9 0.06 50 / .55) 0%, transparent 60%),
      linear-gradient(180deg, var(--bg) 0%, var(--bg) 60%, var(--bg-deep) 100%);
  }
  #grain{ position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.5;
    background-image:radial-gradient(oklch(0.6 0.05 50 / .05) 1px, transparent 1px);
    background-size:4px 4px; }
  /* ---- CSS maple leaves (trapezium build) ---- */
  #leaves{ position:fixed; inset:0; z-index:3; pointer-events:none; overflow:hidden; }
  .autumn-page .leaf-band{ position:absolute; left:0; right:0; bottom:0; height:150px; z-index:1; pointer-events:none; overflow:hidden; }
  .autumn-page #pile-hero{ overflow:visible; }
  .autumn-page .carpet .maple-leaf{ filter:none; }
  .autumn-page .dom-leaf{ position:absolute; top:0; left:0; transform-origin:50% 45%; will-change:transform; }
  .autumn-page .maple-leaf{
    --leaf-width:13px; --leaf-larger-width:19px; --leaf-larger-height:46px;
    --leaf-color:#ff9442;
    display:flex; flex-direction:column; align-items:center;
    filter:drop-shadow(0 3px 3px rgba(110,45,10,.18));
  }
  .autumn-page .maple-leaf .top{ margin-top:var(--leaf-width); }
  .autumn-page .maple-leaf .trapezium{ width:var(--leaf-width); height:var(--leaf-width);
    background-color:var(--leaf-color); position:relative; }
  .autumn-page .maple-leaf .trapezium::before{ content:''; position:absolute; height:var(--leaf-width); width:0; bottom:var(--leaf-width);
    border-top:calc(var(--leaf-width)/2) solid transparent;
    border-left:calc(var(--leaf-width)/2) solid transparent;
    border-right:calc(var(--leaf-width)/2) solid transparent;
    border-bottom:calc(var(--leaf-width)/2) solid var(--leaf-color); }
  .autumn-page .maple-leaf .trapezium::after{ content:''; position:absolute; left:-20%; top:45%;
    border-bottom:calc(var(--leaf-larger-height)/2) solid transparent;
    border-left:calc(var(--leaf-larger-width)/2) solid transparent;
    border-right:calc(var(--leaf-larger-width)/2) solid transparent;
    border-top:calc(var(--leaf-larger-height)/2) solid var(--leaf-color); }
  .autumn-page .maple-leaf .center{ width:var(--leaf-width); height:var(--leaf-width); background-color:var(--leaf-color); }
  .autumn-page .maple-leaf .mid{ display:flex; }
  .autumn-page .maple-leaf .left{ transform:rotate(-56deg) translate(0, calc(var(--leaf-width)*0.1)); }
  .autumn-page .maple-leaf .right{ transform:rotate(56deg) translate(0, calc(var(--leaf-width)*0.1)); }
  /* torn stem line */
  .autumn-page .maple-leaf .branch{ width:2px; height:calc(var(--leaf-width)*1.35); margin-top:-1px;
    background:linear-gradient(#9a6328,#67390f); border-radius:0 0 2px 2px; }

  .autumn-page main{ position:relative; }
  .autumn-page .band{ position:relative; z-index:4; }
  .autumn-page .band .shell{ position:relative; z-index:2; }
  .autumn-page .shell{ width:100%; max-width:72rem; margin:0 auto; padding:0 clamp(1.25rem,5vw,4.5rem); }

  /* small caps label */
  .autumn-page .label{ font-family:var(--display); font-size:.72rem; letter-spacing:.42em;
    text-transform:uppercase; color:var(--label); }
  .autumn-page .rule{ height:1px; background:var(--line-soft); border:0; }
  .autumn-page .vrule{ width:1px; background:var(--line-soft); }
  .autumn-page em, .autumn-page .it{ font-family:var(--script); font-style:italic; }

  /* ====== HERO (asymmetric, left-anchored) ====== */
  .autumn-page .hero{ position:relative; z-index:2; min-height:100vh; min-height:100svh; display:flex; align-items:center; overflow-x:clip; }
  .autumn-page .hero-tree{ position:absolute; top:0; right:-2%; height:100vh; height:100svh; width:auto; max-width:64%;
    object-fit:contain; object-position:top right; z-index:1; pointer-events:none; user-select:none;
    -webkit-user-drag:none; filter:drop-shadow(0 18px 40px oklch(.3 .06 50 / .18)); will-change:transform; }
  .autumn-page .hero .shell{ display:block; position:relative; z-index:2; }
  .autumn-page .hero-block{ max-width:34rem; }
  .autumn-page .hero .label{ display:block; margin-bottom:2.2rem; }
  .autumn-page .names{ font-family:var(--display); font-weight:400; color:var(--ink); line-height:.92;
    font-size:clamp(3.2rem,13vw,9.5rem); letter-spacing:.01em;
    text-shadow:0 0 18px var(--bg),0 0 6px var(--bg); }
  /* each name stays on one line — letters are inline-blocks and would otherwise wrap */
  .autumn-page .names .nm{ display:block; white-space:nowrap; }
  /* tablet: slim the tree so it stops crowding the names */
  @media(max-width:1024px){ .autumn-page .hero-tree{ max-width:52%; right:-6%; } }
  /* phone: tree becomes a soft backdrop, content anchors low */
  @media(max-width:720px){
    .autumn-page .hero{ align-items:flex-end; padding:6rem 0 11.5rem; }
    .autumn-page .leaf-band{ height:120px; }
    .autumn-page .hero-tree{ height:78vh; height:78svh; width:120%; max-width:none; right:-32%; opacity:.4;
      -webkit-mask-image:linear-gradient(205deg,#000 30%,transparent 85%);
      mask-image:linear-gradient(205deg,#000 30%,transparent 85%); }
    .autumn-page .hero .label{ margin-bottom:1.5rem; }
    .autumn-page .hero .hero-meta{ margin-top:1.8rem; }
  }
  .autumn-page .names .amp{ display:block; font-family:var(--script); font-style:italic;
    font-size:clamp(2rem,5vw,3.2rem); color:var(--accent); line-height:1;
    margin:.18em 0 .1em .04em; }
  .autumn-page .hero-meta{ margin-top:2.4rem; display:flex; align-items:flex-start; gap:1.4rem; }
  .autumn-page .hero-meta .vrule{ align-self:stretch; flex:none; }
  .autumn-page .hero-meta .when{ font-family:var(--display); font-size:1.05rem; letter-spacing:.04em; color:var(--ink); text-shadow:0 0 10px var(--bg),0 0 4px var(--bg),0 1px 2px var(--bg); }
  .autumn-page .hero-meta .where{ margin-top:.35rem; color:var(--muted); font-size:1rem; text-shadow:0 0 10px var(--bg),0 0 4px var(--bg),0 1px 2px var(--bg); }
  .autumn-page .hero-meta .vrule{ box-shadow:0 0 8px 2px var(--bg); }
  .autumn-page .hero-actions{ margin-top:1.4rem; display:flex; flex-wrap:wrap; align-items:center; gap:.2rem 1.1rem; }
  .autumn-page .hero-actions .dot{ color:var(--line); }
  /* ghost links/buttons: hairline underline, 44px tall tap area */
  .autumn-page .ghost{ display:inline-flex; align-items:flex-end; min-height:44px;
    font-family:var(--display); font-size:.68rem; letter-spacing:.26em; text-transform:uppercase;
    color:var(--label); text-decoration:none; background:none; border:0; border-bottom:1px solid var(--line);
    padding:0 0 .3rem; cursor:pointer; transition:border-color .3s, color .3s;
    text-shadow:0 0 8px var(--bg),0 0 3px var(--bg); }
  .autumn-page .ghost:hover{ border-color:var(--accent); color:var(--accent-2); }
  .autumn-page .scroll-cue{ position:absolute; z-index:2; bottom:1.6rem; left:clamp(1.25rem,5vw,4.5rem);
    min-height:44px; font-family:var(--display); font-size:.68rem; letter-spacing:.4em; text-transform:uppercase;
    color:oklch(0.3 0.06 45); display:flex; align-items:center; gap:.7rem;
    text-decoration:none; }
  @media(max-width:720px){ .autumn-page .scroll-cue{ display:none; } }
  .autumn-page .scroll-cue::after{ content:""; width:46px; height:1px; background:oklch(0.3 0.06 45);
    transform-origin:left; animation:grow 2.4s ease-in-out infinite; }
  @keyframes grow{ 0%,100%{transform:scaleX(.3);opacity:.5} 50%{transform:scaleX(1);opacity:1} }

  /* ====== generic section rhythm ====== */
  .autumn-page section.band{ padding:clamp(5rem,11vw,9rem) 0; }
  .autumn-page .eyrow{ display:flex; align-items:center; gap:1.1rem; margin-bottom:2.6rem; }
  .autumn-page .eyrow .rule{ flex:1; min-width:2rem; }
  .autumn-page h2.head{ font-family:var(--display); font-weight:400; color:var(--ink);
    font-size:clamp(2rem,4.6vw,3.1rem); line-height:1.08; overflow-wrap:break-word; }

  /* INVITATION — editorial two columns */
  .autumn-page .invite{ display:grid; grid-template-columns:1fr; gap:2.4rem; }
  @media(min-width:820px){ .autumn-page .invite{ grid-template-columns:0.8fr 1.2fr; gap:clamp(3rem,6vw,6rem); align-items:start; } }
  .autumn-page .invite .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.4vw,1.9rem);
    line-height:1.4; color:var(--ink); text-shadow:0 0 9px var(--bg),0 1px 2px var(--bg); }
  .autumn-page .invite p.body{ color:var(--muted); max-width:34rem; text-shadow:0 0 9px var(--bg),0 0 3px var(--bg); }
  .autumn-page .invite p.body + p.body{ margin-top:1.2rem; }

  /* ITINERARY — vertical timeline */
  .autumn-page .order{ position:relative; background:var(--bg-deep); border-top:1px solid var(--line-soft); border-bottom:1px solid var(--line-soft); }
  .autumn-page .order + .order{ border-top:0; }
  .autumn-page .order:has(+ .order){ border-bottom:0; }
  .autumn-page .timeline{ display:grid; gap:0; max-width:46rem; }
  .autumn-page .stop{ display:grid; grid-template-columns:8.5rem 1fr; gap:1.6rem; align-items:baseline;
    padding:1.6rem 0; border-top:1px solid var(--line-soft); }
  .autumn-page .stop:last-child{ border-bottom:1px solid var(--line-soft); }
  .autumn-page .stop .time{ font-family:var(--display); font-size:1rem; letter-spacing:.04em; color:var(--label); }
  .autumn-page .stop .what h3{ font-family:var(--display); font-weight:400; font-size:1.35rem; color:var(--ink); }
  .autumn-page .stop .what p{ color:var(--muted); font-size:.98rem; margin-top:.25rem; }
  @media(max-width:560px){ .autumn-page .stop{ grid-template-columns:1fr; gap:.4rem; } }

  /* COUNTDOWN — minimal borderless inline */
  .autumn-page .count{ display:flex; flex-wrap:wrap; align-items:flex-end; gap:clamp(1.5rem,5vw,3.5rem); margin-top:2.6rem; }
  .autumn-page .cd-unit{ display:flex; flex-direction:column; min-width:0; }
  .autumn-page .cd-unit .n{ font-family:var(--display); font-size:clamp(2.6rem,6vw,3.6rem); line-height:1; color:var(--ink);
    font-variant-numeric:lining-nums tabular-nums; }
  .autumn-page .cd-unit .l{ margin-top:.6rem; font-size:.7rem; letter-spacing:.34em; text-transform:uppercase; color:var(--muted); }
  @media(max-width:560px){
    .autumn-page .count{ display:grid; grid-template-columns:1fr 1fr; gap:2.4rem 1rem;
      justify-items:center; text-align:center; max-width:20rem; margin:2.2rem auto 0; }
    .autumn-page .cd-unit{ align-items:center; }
  }

  /* PHOTOS — arched gallery */
  .autumn-page .gallery{ display:grid; grid-template-columns:repeat(3,1fr); gap:clamp(1rem,3vw,2.2rem); margin-top:2.8rem; }
  .autumn-page .frame{ display:flex; flex-direction:column; align-items:center; min-width:0; }
  .autumn-page .arch{ width:100%; aspect-ratio:3/4.2; object-fit:cover;
    border-radius:9999px 9999px 10px 10px; border:1px solid var(--line);
    background:oklch(0.9 0.04 60); box-shadow:0 30px 55px -34px oklch(.3 .06 50 / .6);
    padding:7px; transition:transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s; }
  .autumn-page .frame:hover .arch{ transform:translateY(-8px); box-shadow:0 44px 70px -34px oklch(.3 .06 50 / .75); }
  .autumn-page .frame.up{ transform:translateY(-28px); }
  .autumn-page .frame .cap{ margin-top:1.1rem; font-family:var(--script); font-style:italic; color:var(--muted); font-size:1.05rem; }
  /* phone: swipeable snap slider with a peek of the next photo */
  @media(max-width:640px){
    .autumn-page .gallery{ display:flex; overflow-x:auto; scroll-snap-type:x mandatory;
      gap:1.1rem; margin-top:2.2rem; padding:.5rem .1rem 1.2rem;
      -webkit-overflow-scrolling:touch; scrollbar-width:none; }
    .autumn-page .gallery::-webkit-scrollbar{ display:none; }
    .autumn-page .frame{ flex:0 0 80%; scroll-snap-align:center; }
    .autumn-page .frame.up{ transform:none; }
    .autumn-page .frame .cap{ margin-top:.7rem; }
    .autumn-page .gallery-dots{ display:flex; justify-content:center; gap:.55rem; margin-top:1.1rem; }
    .autumn-page .gallery-dots i{ width:7px; height:7px; border-radius:50%; background:var(--line);
      transition:background .3s, transform .3s; }
    .autumn-page .gallery-dots i.on{ background:var(--accent); transform:scale(1.25); }
  }
  @media(min-width:641px){ .autumn-page .gallery-dots{ display:none; } }

  /* RSVP */
  .autumn-page .rsvp-wrap{ display:grid; grid-template-columns:1fr; gap:2.4rem; }
  @media(min-width:820px){ .autumn-page .rsvp-wrap{ grid-template-columns:0.85fr 1.15fr; gap:clamp(3rem,6vw,6rem); } }
  .autumn-page form.rsvp{ display:flex; flex-direction:column; gap:1.7rem; min-width:0; }
  .autumn-page .rsvp label{ display:block; font-family:var(--display); font-size:.7rem; letter-spacing:.34em;
    text-transform:uppercase; color:var(--label); margin-bottom:.45rem; }
  .autumn-page .field{ width:100%; min-height:44px; border:0; border-bottom:1px solid var(--line); background:transparent;
    padding:.6rem .1rem; color:var(--ink); font-family:var(--serif); font-size:1.1rem;
    transition:border-color .3s, box-shadow .3s; outline:none; border-radius:0; }
  .autumn-page .field::placeholder{ color:oklch(0.45 0.05 55 / .75); }
  .autumn-page .field:focus{ border-color:var(--accent); }
  .autumn-page .field:focus-visible{ border-color:var(--label); box-shadow:0 1px 0 0 var(--label); }
  .autumn-page select.field{ appearance:none; padding-right:1.8rem; cursor:pointer;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%23a35a1e' stroke-width='1.4'/></svg>");
    background-repeat:no-repeat; background-position:right .3rem center; }
  .autumn-page textarea.field{ resize:none; }
  .autumn-page .two{ display:grid; gap:1.7rem; }
  @media(min-width:560px){ .autumn-page .two{ grid-template-columns:1fr 1fr; } }
  .autumn-page .send{ align-self:flex-start; display:inline-flex; align-items:center; gap:.8rem; margin-top:.4rem;
    min-height:48px; border:1px solid var(--accent); background:transparent; padding:.95rem 2.4rem;
    font-family:var(--display); font-size:.78rem; letter-spacing:.3em; text-transform:uppercase;
    color:var(--ink); cursor:pointer; transition:all .35s; }
  .autumn-page .send::after{ content:"\2192"; font-family:var(--serif); font-size:1rem; line-height:1;
    transition:transform .35s; }
  .autumn-page .send:hover{ background:var(--accent); color:var(--bg); }
  .autumn-page .send:hover::after{ transform:translateX(5px); }
  .autumn-page .send:disabled{ opacity:.5; cursor:progress; }
  .autumn-page .send-error{ margin:.2rem 0 0; padding-left:.9rem; border-left:2px solid oklch(0.5 0.17 32); font-family:var(--serif); font-style:italic; font-size:1rem; line-height:1.5; color:oklch(0.43 0.15 32); }
  @media(max-width:420px){ .autumn-page .send{ align-self:stretch; justify-content:center; padding:.95rem 1.2rem; } }
  .autumn-page .rsvp-aside .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.4vw,1.95rem);
    line-height:1.4; color:var(--ink); }
  .autumn-page .rsvp-aside p{ color:var(--muted); margin-top:1.1rem; }

  .autumn-page footer{ position:relative; z-index:5; text-align:center; padding:5.5rem 1.5rem 4rem;
    background:var(--bg-deep); border-top:1px solid var(--line-soft); }
  .autumn-page footer .mono{ font-family:var(--display); letter-spacing:.5em; color:var(--label); font-size:.85rem; }
  .autumn-page footer .q{ font-family:var(--script); font-style:italic; color:var(--muted); font-size:1.15rem;
    max-width:30rem; margin:1.3rem auto 0; line-height:1.5; }

  /* toast */
  #toast{ position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
    z-index:60; width:max-content; min-width:min(280px, calc(100vw - 2rem)); max-width:calc(100vw - 2rem); background:var(--bg); border:1px solid var(--accent);
    color:var(--ink); padding:1rem 1.25rem; box-shadow:0 24px 55px -24px oklch(.3 .06 50 / .5);
    opacity:0; pointer-events:none; transition:opacity .4s, transform .4s; }
  #toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  #toast .tt{ font-family:var(--display); letter-spacing:.04em; }
  #toast .td{ margin-top:.3rem; font-family:var(--script); font-style:italic; color:var(--muted); }

  /* ===== Scroll reveals =====
     Content is only hidden once JS has armed the observer (.rv on the root),
     so a script failure can never leave text invisible. */
  .autumn-page.rv .reveal{ opacity:0; transform:translateY(34px); }
  .autumn-page .reveal{ transition:opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
  .autumn-page.rv .reveal.in{ opacity:1; transform:none; }

  /* ===== Hero entrance (starts on mount, settles within ~1.2s) ===== */
  @keyframes heroRise{ from{ opacity:0; translate:0 22px; } }
  .autumn-page .hero-block > *{ animation:heroRise .75s cubic-bezier(.16,1,.3,1) backwards; }
  .autumn-page .hero-block > *:nth-child(1){ animation-delay:.05s }
  .autumn-page .hero-block > *:nth-child(2){ animation:none; }
  .autumn-page .hero-block > *:nth-child(3){ animation-delay:.32s }
  .autumn-page .hero-block > *:nth-child(4){ animation-delay:.42s }
  @keyframes treeIn{ from{ opacity:0; translate:34px 0; } }
  .autumn-page .hero-tree{ animation:treeIn 1.1s cubic-bezier(.16,1,.3,1) backwards; }
  @keyframes cueIn{ from{ opacity:0; } }
  .autumn-page .scroll-cue{ animation:cueIn .8s ease .7s backwards; }

  /* hero names: letters drift up one by one */
  .autumn-page .names .hl{ display:inline-block; animation:letterIn .65s cubic-bezier(.16,1,.3,1) calc(.08s + var(--i)*.035s) backwards; }
  .autumn-page .names .amp.hl{ display:block; }
  @keyframes letterIn{ from{ opacity:0; translate:0 .55em; rotate:6deg; } }

  /* section headings: characters rise one by one when the heading reveals */
  .autumn-page .head .w{ display:inline-block; white-space:nowrap; }
  .autumn-page .head .ch{ display:inline-block; }
  .autumn-page.rv .head.reveal .ch{ opacity:0; translate:0 .6em; rotate:4deg;
    transition:opacity .55s cubic-bezier(.16,1,.3,1), translate .55s cubic-bezier(.16,1,.3,1), rotate .55s cubic-bezier(.16,1,.3,1);
    transition-delay:var(--d,0s); }
  .autumn-page.rv .head.reveal.in .ch{ opacity:1; translate:0 0; rotate:0deg; }
  /* the heading itself doesn't fade — its letters do */
  .autumn-page.rv .head.reveal{ opacity:1; }

  /* eyebrow labels settle their letter-spacing as they appear */
  .autumn-page.rv .eyrow.reveal .label{ letter-spacing:.85em; opacity:0;
    transition:letter-spacing 1s cubic-bezier(.16,1,.3,1), opacity .7s cubic-bezier(.16,1,.3,1); }
  .autumn-page.rv .eyrow.reveal.in .label{ letter-spacing:.42em; opacity:1; }

  .autumn-page.rv .gallery.reveal{ opacity:1; transform:none; }
  .autumn-page.rv .gallery.reveal .frame{ opacity:0; translate:0 30px;
    transition:opacity .8s cubic-bezier(.16,1,.3,1), translate .8s cubic-bezier(.16,1,.3,1); }
  .autumn-page.rv .gallery.reveal .frame .arch{ clip-path:inset(88% 0 0 0 round 9999px 9999px 10px 10px);
    transition:clip-path 1s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s; }
  .autumn-page.rv .gallery.reveal.in .frame{ opacity:1; translate:0 0; }
  .autumn-page.rv .gallery.reveal.in .frame .arch{ clip-path:inset(0 0 0 0 round 9999px 9999px 10px 10px); }
  .autumn-page.rv .gallery.reveal.in .frame:nth-child(2),
  .autumn-page.rv .gallery.reveal.in .frame:nth-child(2) .arch{ transition-delay:.12s; }
  .autumn-page.rv .gallery.reveal.in .frame:nth-child(3),
  .autumn-page.rv .gallery.reveal.in .frame:nth-child(3) .arch{ transition-delay:.24s; }
  /* hover lift must not inherit the reveal stagger */
  .autumn-page.rv .gallery.reveal.in .frame:hover .arch{ transition-delay:0s; }

  .autumn-page.rv .count.reveal{ opacity:1; transform:none; }
  .autumn-page.rv .count.reveal .cd-unit{ opacity:0; translate:0 18px;
    transition:opacity .7s cubic-bezier(.16,1,.3,1), translate .7s cubic-bezier(.16,1,.3,1); }
  .autumn-page.rv .count.reveal.in .cd-unit{ opacity:1; translate:0 0; }
  .autumn-page.rv .count.reveal.in .cd-unit:nth-child(2){ transition-delay:.08s; }
  .autumn-page.rv .count.reveal.in .cd-unit:nth-child(3){ transition-delay:.16s; }
  .autumn-page.rv .count.reveal.in .cd-unit:nth-child(4){ transition-delay:.24s; }

  .autumn-page .cd-unit .n{ display:inline-grid; overflow:hidden; justify-items:center; }
  .autumn-page .cd-unit .n .roll{ grid-area:1/1; }
  .autumn-page .cd-unit .n .roll.out{ animation:rollOut .5s cubic-bezier(.45,0,.55,1) forwards; }
  .autumn-page .cd-unit .n .roll.in{ animation:rollIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes rollOut{ to{ translate:0 -85%; opacity:0; } }
  @keyframes rollIn{ from{ translate:0 85%; opacity:0; } }

  /* reduced motion: everything is shown immediately, nothing loops */
  @media(prefers-reduced-motion:reduce){
    html{ scroll-behavior:auto; }
    .autumn-page .reveal, .autumn-page.rv .reveal, .autumn-page .reveal *{ transition:none !important; }
    .autumn-page.rv .reveal, .autumn-page.rv .gallery.reveal .frame, .autumn-page.rv .count.reveal .cd-unit,
    .autumn-page.rv .head.reveal .ch, .autumn-page.rv .eyrow.reveal .label{ opacity:1; transform:none; translate:0 0; rotate:0deg; }
    .autumn-page.rv .eyrow.reveal .label{ letter-spacing:.42em; }
    .autumn-page.rv .gallery.reveal .frame .arch{ clip-path:none; }
    .autumn-page .hero-block > *, .autumn-page .hero-tree, .autumn-page .scroll-cue,
    .autumn-page .names .hl{ animation:none; }
    .autumn-page .scroll-cue::after{ animation:none; }
    .autumn-page .cd-unit .n .roll.out, .autumn-page .cd-unit .n .roll.in{ animation:none; }
    .autumn-page .cd-unit .n .roll.out{ display:none; }
  }
`

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

/** Splits a heading into per-character spans (React-owned, no DOM surgery). */
function splitLines(lines) {
  let i = 0
  return lines.map(line => line.split(' ').map(word => [...word].map(c => {
    const delay = Math.min(0.05 + i * 0.028, 0.6)
    i += 1
    return { c, delay }
  })))
}

function SplitHead({ lines, style }) {
  const parts = splitLines(lines)
  return (
    <h2 className="head reveal" style={style}>
      <span className="sr-only">{lines.join(' ')}</span>
      {parts.map((words, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {words.map((chars, wi) => (
            <Fragment key={wi}>
              {wi > 0 && ' '}
              <span className="w" aria-hidden="true">
                {chars.map(({ c, delay }, ci) => (
                  <span key={ci} className="ch" style={{ '--d': `${delay.toFixed(3)}s` }}>{c}</span>
                ))}
              </span>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </h2>
  )
}

function HeroName({ text, offset }) {
  return (
    <span className="nm" aria-hidden="true">
      {[...text].map((c, i) => (
        <span key={i} className="hl" style={{ '--i': i + offset }}>{c}</span>
      ))}
    </span>
  )
}

function downloadIcs(w) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${icsText(w.couple)}//Wedding//EN`, 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${w.uid}`, `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${w.icsStart}`, `DTEND:${w.icsEnd}`,
    `SUMMARY:${icsText(`${w.couple} — An Autumn Wedding`)}`,
    `LOCATION:${icsText(w.place)}`,
    'DESCRIPTION:Ceremony beneath the maples\\, followed by a harvest dinner and bonfire.',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = w.icsFile
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------- page ---------- */

export default function AutumnFallsPage() {
  const rootRef = useRef(null)
  const timersRef = useRef([])
  const rsvp = useRsvp('en')
  const sending = rsvp.status === 'sending'
  const [toast, setToast] = useState({ show: false, title: '', text: '' })

  /* ===== The day itself — every name, date and place on the page derives from here ===== */
  const {
    card, partner1, partner2, eventDate, venue, city, address, rsvpDeadline,
  } = useWeddingCardFields(DEFAULTS, LOCALE)
  const targetMs = eventDate.getTime()
  const day = icsStamp(eventDate).slice(0, 8)
  const place = placeQuery(venue, address, city)
  const WEDDING = {
    partner1,
    partner2,
    couple: `${partner1} & ${partner2}`,
    icsStart: icsStamp(eventDate),
    icsEnd: icsStamp(new Date(targetMs + EVENT_HOURS * 36e5)),
    uid: `${slug(partner1)}-${slug(partner2)}-${day}@wedding`,
    icsFile: `${slug(partner1)}-${slug(partner2)}-wedding.ics`,
    // an API-supplied label wins; otherwise our English hero format of the event date
    heroLine: cardDetail(card, 'dateLabel', formatHeroDate(eventDate)),
    venue,
    where: `${venue} — ${city}`,
    place,
    mapUrl: `https://maps.google.com/?q=${encodeURIComponent(place)}`,
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
    const small = window.innerWidth <= 720

    /* ===== Falling CSS maple leaves (fixed layer; paused while the tab is hidden) ===== */
    ;(function () {
      const layer = $('#leaves'); if (!layer) return
      layer.innerHTML = ''
      const COLORS = ['#ff7a3c', '#ff9442', '#ffb347', '#e8602c', '#f6a623', '#d9531e', '#ffc861', '#c2451a']
      const N = reduce ? (small ? 10 : 20) : small ? Math.min(22, Math.round(innerWidth / 16)) : Math.min(100, Math.round(innerWidth / 15))
      const leaves = []
      function reset(p, initial) {
        p.x = Math.random() * innerWidth
        p.y = initial ? Math.random() * innerHeight : -90 - Math.random() * 140
        p.depth = .45 + Math.random() * .55
        p.vy = (34 + Math.random() * 48) * p.depth * (reduce ? 0.4 : 1)
        p.sway = 16 + Math.random() * 36
        p.swPhase = Math.random() * Math.PI * 2
        p.swSpeed = .4 + Math.random() * 1.1
        p.rot = Math.random() * 360
        p.vr = (Math.random() - .5) * (reduce ? 16 : 70)
        p.scale = (0.5 + Math.random() * 0.85) * p.depth
      }
      for (let i = 0; i < N; i++) {
        const el = document.createElement('div'); el.className = 'dom-leaf'
        el.innerHTML = LEAF_HTML
        el.firstChild.style.setProperty('--leaf-color', COLORS[i % COLORS.length])
        el.style.opacity = (0.72 + Math.random() * 0.28).toFixed(2)
        layer.appendChild(el)
        const p = { el }; reset(p, true); leaves.push(p)
      }
      let last = 0, raf = 0
      let wind = 0, px = -9999, py = -9999
      const blow = (x, y) => { wind = (x / innerWidth - 0.5); px = x; py = y }
      const clear = () => { px = -9999; py = -9999 }
      addEventListener('pointermove', e => blow(e.clientX, e.clientY), { passive: true, signal })
      addEventListener('touchmove', e => { const t = e.touches[0]; if (t) blow(t.clientX, t.clientY) }, { passive: true, signal })
      addEventListener('touchend', clear, { passive: true, signal })
      addEventListener('touchcancel', clear, { passive: true, signal })
      function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000
        wind *= Math.max(0, 1 - 0.6 * dt) /* breeze dies down when the pointer rests */
        for (const p of leaves) {
          p.y += p.vy * dt; p.rot += p.vr * dt
          p.x += wind * 46 * p.depth * dt * 60 * 0.016
          const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy
          if (d2 < 14000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 118) * 60 * dt; p.x += dx / d * f; p.y += dy / d * f * 0.5; p.rot += f * 2 }
          if (p.y > innerHeight + 40 || p.x < -120 || p.x > innerWidth + 120) reset(p, false)
          const sx = Math.sin(t * p.swSpeed + p.swPhase) * p.sway
          p.el.style.transform = `translate3d(${(p.x + sx).toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})`
        }
        raf = requestAnimationFrame(frame)
      }
      const start = () => { if (raf || document.hidden) return; last = performance.now(); raf = requestAnimationFrame(frame) }
      const stop = () => { cancelAnimationFrame(raf); raf = 0 }
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (!reduce) start() }, { signal })
      signal.addEventListener('abort', () => { stop(); layer.innerHTML = '' })
      if (reduce) { last = performance.now(); frame(last); stop(); return } /* reduced motion: a still scatter */
      start()
    })()

    /* ===== Piles of leaves that scatter under the cursor (run only while the hero is on screen) ===== */
    ;(function () {
      const COLORS = ['#ff7a3c', '#ff9442', '#ffb347', '#e8602c', '#f6a623', '#d9531e', '#ffc861', '#c2451a', '#b8430f']
      const rnd = (a, b) => a + Math.random() * (b - a)
      const onWidthChange = fn => {
        let w = innerWidth, t = 0
        addEventListener('resize', () => {
          clearTimeout(t)
          t = setTimeout(() => { if (innerWidth !== w) { w = innerWidth; fn() } }, 150)
        }, { signal })
        signal.addEventListener('abort', () => clearTimeout(t))
      }
      function makeGround(g, count) {
        g.innerHTML = ''
        const M = reduce ? Math.round(count * 0.5) : count
        for (let i = 0; i < M; i++) {
          const w = document.createElement('div'); w.className = 'dom-leaf'
          w.innerHTML = LEAF_HTML
          w.firstChild.style.setProperty('--leaf-color', COLORS[(Math.random() * COLORS.length) | 0])
          w.style.opacity = (0.8 + Math.random() * 0.2).toFixed(2)
          g.appendChild(w)
        }
        function place() {
          const w = g.clientWidth || innerWidth, h = g.clientHeight || 150
          for (const el of g.children) {
            const x = rnd(-14, w + 14), y = rnd(4, h), rot = rnd(0, 360), sc = rnd(0.8, 1.85)
            el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(2)})`
          }
        }
        place()
        onWidthChange(place)
        signal.addEventListener('abort', () => { g.innerHTML = '' })
      }
      function makePile(pile, count, hyMin, hyMax) {
        pile.innerHTML = ''
        const M = reduce ? Math.round(count * 0.4) : count
        const items = []
        const writeT = p => { p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px,0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})` }
        const home = p => { p.x = p.hx; p.y = p.hy; p.rot = p.hrot; p.scale = p.hscale; writeT(p) }
        function layout() {
          const w = pile.clientWidth || innerWidth
          items.forEach((p, i) => { p.hx = (i + 0.5) / M * w + rnd(-24, 24); p.hy = rnd(hyMin, hyMax); p.hrot = rnd(-60, 60); p.hscale = rnd(0.85, 1.7) })
        }
        for (let i = 0; i < M; i++) {
          const el = document.createElement('div'); el.className = 'dom-leaf'
          el.innerHTML = LEAF_HTML
          el.firstChild.style.setProperty('--leaf-color', COLORS[i % COLORS.length])
          el.style.opacity = (0.85 + Math.random() * 0.15).toFixed(2)
          pile.appendChild(el)
          items.push({ el, x: 0, y: 0, rot: 0, scale: 1, vx: 0, vy: 0, vr: 0, flying: false })
        }
        layout(); items.forEach(home)
        onWidthChange(() => { layout(); items.forEach(p => { if (!p.flying) home(p) }) })
        signal.addEventListener('abort', () => { pile.innerHTML = '' })
        if (reduce) return /* a resting pile; no physics */

        let pxr = -9999, pyr = -9999, active = false, visible = true, raf = 0, last = 0
        const g = 1100
        function frame(now) {
          raf = 0
          const dt = Math.min(.05, (now - last) / 1000); last = now
          const w = pile.clientWidth || innerWidth
          let flying = 0
          for (const p of items) {
            if (!p.flying) {
              if (active) {
                const dx = p.x - pxr, dy = p.y - pyr
                if (dx * dx + dy * dy < 120 * 120) {
                  p.flying = true
                  const a = Math.atan2(dy, dx) || (-Math.PI / 2)
                  const pw = rnd(220, 440)
                  p.vx = Math.cos(a) * pw * 0.6 + rnd(-70, 70)
                  p.vy = -rnd(300, 540)
                  p.vr = rnd(-440, 440)
                }
              }
              if (!p.flying) continue /* resting leaves: keep last transform */
            }
            flying++
            p.vy += g * dt; p.vx *= 0.99
            p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt
            if (p.x < -24) { p.x = -24; p.vx *= -0.4 }
            if (p.x > w + 24) { p.x = w + 24; p.vx *= -0.4 }
            if (p.vy > 0 && p.y >= p.hy) { p.flying = false; p.y = p.hy; p.vx = 0; p.vy = 0 }
            writeT(p)
          }
          active = false /* scatter only on frames with a fresh pointer event */
          // keep looping only while leaves are airborne; pointer events restart it
          if (flying && !document.hidden) raf = requestAnimationFrame(frame)
        }
        const kick = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
        function track(x, y) {
          if (!visible) return
          const r = pile.getBoundingClientRect(); pxr = x - r.left; pyr = y - r.top
          if (pyr < -160 || pyr > r.height + 160) return
          active = true; kick()
        }
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { rootMargin: '80px 0px' })
        io.observe(pile)
        addEventListener('pointermove', e => track(e.clientX, e.clientY), { passive: true, signal })
        addEventListener('touchmove', e => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY) }, { passive: true, signal })
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) return
          cancelAnimationFrame(raf); raf = 0
          items.forEach(p => { if (p.flying) { p.flying = false; p.vx = p.vy = 0; home(p) } })
        }, { signal })
        signal.addEventListener('abort', () => { io.disconnect(); cancelAnimationFrame(raf); raf = 0 })
      }
      /* scale the leaf litter to the viewport so phones don't choke */
      const density = Math.min(1, innerWidth / 1200)
      const ground = $('#ground-leaves'), pile = $('#pile-hero')
      if (ground) makeGround(ground, Math.max(60, Math.round((small ? 260 : 400) * density)))
      if (pile) makePile(pile, Math.max(30, Math.round(150 * density)), -8, 60)
    })()

    /* ===== Hero tree parallax (only while the hero is in view) ===== */
    ;(function () {
      const tree = $('.hero-tree'); if (!tree || reduce) return
      let raf = 0
      const update = () => {
        raf = 0
        const y = scrollY
        if (y > innerHeight * 1.5) return
        tree.style.transform = `translateY(${(y * 0.14).toFixed(1)}px)`
      }
      addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update) }, { passive: true, signal })
      signal.addEventListener('abort', () => cancelAnimationFrame(raf))
    })()

    /* ===== Gallery slider dots (mobile) ===== */
    ;(function () {
      const gal = $('.gallery'), dots = $('#galleryDots')
      if (!gal || !dots) return
      const frames = [...gal.querySelectorAll('.frame')], pips = [...dots.children]
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

  /* ===== Countdown (digits roll on change) — own effect so an API date change
     only restarts the clock, not the leaves ===== */
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
    const attending = data.get('attendance') === 'joyfully'
    const meal = attending ? String(data.get('meal') || '').trim() : ''
    // the reply has no meal field of its own, so it travels in the note
    const note = [String(data.get('message') || '').trim(), meal ? `Meal: ${meal}` : '']
      .filter(Boolean)
      .join('\n')
      .slice(0, 1000)
    if (!(await rsvp.submit({ name, attending, guests: 1, note }))) return
    setToast({ show: true, title: 'Thank you — your reply is received', text: `We can't wait to celebrate with you, ${name || 'friend'}.` })
    form.reset()
    timersRef.current.push(setTimeout(() => setToast(t => ({ ...t, show: false })), 5000))
  }


  return (
    <div ref={rootRef} className="autumn-page">
      <meta name="description" content={`An invitation to the autumn wedding of ${WEDDING.couple} at ${WEDDING.venue}.`} />
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
      <div id="leaves" aria-hidden="true"></div>

      <main>
        {/* HERO */}
        <section className="hero" data-screen-label="01 Hero">
          <img className="hero-tree" src={autumnTree} alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
          <div id="ground-leaves" className="leaf-band carpet" aria-hidden="true"></div>
          <div id="pile-hero" className="leaf-band" aria-hidden="true"></div>
          <div className="shell">
            <div className="hero-block">
              <span className="label">An Autumn Wedding</span>
              <h1 className="names">
                <span className="sr-only">{partner1} and {partner2}</span>
                <HeroName text={partner1} offset={0} />
                <span className="amp hl" aria-hidden="true" style={{ '--i': [...partner1].length }}>and</span>
                <HeroName text={partner2} offset={[...partner1].length + 1} />
              </h1>
              <div className="hero-meta">
                <div className="vrule" aria-hidden="true"></div>
                <div>
                  <p className="when">{WEDDING.heroLine}</p>
                  <p className="where">{WEDDING.where}</p>
                </div>
              </div>
              <div className="hero-actions">
                <button type="button" className="ghost" onClick={() => downloadIcs(WEDDING)}>Add to Calendar</button>
                <span className="dot" aria-hidden="true">·</span>
                <a className="ghost" href={WEDDING.mapUrl} target="_blank" rel="noopener noreferrer">Getting There<span className="sr-only"> (opens in a new tab)</span></a>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#invitation">Scroll</a>
        </section>

        {/* INVITATION */}
        <section className="band order" id="invitation" data-screen-label="02 Invitation">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">The Invitation</span><hr className="rule" aria-hidden="true" /></div>
            <div className="invite">
              <p className="lead reveal">Come gather where the maples burn gold, and watch two lives grow into one.</p>
              <div className="reveal">
                <p className="body">With the blessing of our families, we invite you to the marriage of <strong>{partner1}</strong> and <strong>{partner2}</strong> — an afternoon among the turning leaves, followed by an evening of warmth, harvest, and firelight.</p>
                <p className="body">Bring your softest knit and your fondest stories. Stay for the cider, the long table, and the dancing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ORDER OF THE DAY */}
        <section className="band order" data-screen-label="03 Order of the Day">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">The Order of the Day</span><hr className="rule" aria-hidden="true" /></div>
            <SplitHead lines={['A slow afternoon', 'into a golden night.']} style={{ marginBottom: '2.4rem' }} />
            <div className="timeline">
              <div className="stop reveal"><span className="time">3 : 30 PM</span><div className="what"><h3>Guests Arrive</h3><p>Mulled cider &amp; a wander through the orchard.</p></div></div>
              <div className="stop reveal"><span className="time">4 : 00 PM</span><div className="what"><h3>The Ceremony</h3><p>Vows beneath the old maples at the Maplewood Chapel.</p></div></div>
              <div className="stop reveal"><span className="time">5 : 00 PM</span><div className="what"><h3>Golden Hour</h3><p>Photographs, toasts, and the last warm light.</p></div></div>
              <div className="stop reveal"><span className="time">7 : 00 PM</span><div className="what"><h3>Harvest Dinner</h3><p>A candlelit long-table feast at the Orchard Pavilion.</p></div></div>
              <div className="stop reveal"><span className="time">Nightfall</span><div className="what"><h3>Bonfire &amp; Dancing</h3><p>Music under the stars until the embers fade.</p></div></div>
            </div>
          </div>
        </section>

        {/* COUNTDOWN */}
        <section className="band" data-screen-label="04 Countdown">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Counting Down</span><hr className="rule" aria-hidden="true" /></div>
            <SplitHead lines={['Until the leaves fall.']} />
            <div className="count reveal" id="cd">
              <div className="cd-unit"><span className="n" id="cd-d">00</span><span className="l">Days</span></div>
              <div className="cd-unit"><span className="n" id="cd-h">00</span><span className="l">Hours</span></div>
              <div className="cd-unit"><span className="n" id="cd-m">00</span><span className="l">Minutes</span></div>
              <div className="cd-unit"><span className="n" id="cd-s">00</span><span className="l">Seconds</span></div>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="band" data-screen-label="05 Moments">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">The Two of Us</span><hr className="rule" aria-hidden="true" /></div>
            <SplitHead lines={['A few of our', 'favourite seasons.']} />
            <div className="gallery reveal">
              {/* Kendi fotoğrafını eklemek için src="..." değerini değiştir */}
              <figure className="frame"><img className="arch" src={couple1} alt={`${partner1} and ${partner2}, where it began`} loading="lazy" decoding="async" /><figcaption className="cap">where it began</figcaption></figure>
              <figure className="frame up"><img className="arch" src={couple2} alt={`${partner1} and ${partner2} on the day of the proposal`} loading="lazy" decoding="async" /><figcaption className="cap">the question</figcaption></figure>
              <figure className="frame"><img className="arch" src={couple3} alt={`${partner1} and ${partner2} last October`} loading="lazy" decoding="async" /><figcaption className="cap">last october</figcaption></figure>
            </div>
            <div className="gallery-dots" id="galleryDots" aria-hidden="true"><i className="on"></i><i></i><i></i></div>
          </div>
        </section>

        {/* RSVP */}
        <section className="band order" id="rsvp" data-screen-label="06 RSVP">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Reply</span><hr className="rule" aria-hidden="true" /></div>
            <div className="rsvp-wrap">
              <div className="rsvp-aside reveal">
                <p className="lead">Will you join us by the fire?</p>
                <p>Kindly send word before {WEDDING.rsvpBy}, so we may set your place at the table.</p>
              </div>
              <form className="rsvp reveal" onSubmit={handleSubmit} aria-busy={sending}>
                <div>
                  <label htmlFor="au-name">Your Name</label>
                  <input className="field" id="au-name" name="name" required maxLength={120} placeholder="As you wish to be greeted" autoComplete="name" />
                </div>
                <div className="two">
                  <div>
                    <label htmlFor="au-attendance">Attendance</label>
                    <select className="field" id="au-attendance" name="attendance" required defaultValue="">
                      <option value="" disabled>— select —</option>
                      <option value="joyfully">Joyfully attending</option>
                      <option value="regret">Regretfully unable</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="au-meal">Meal</label>
                    <select className="field" id="au-meal" name="meal" defaultValue="">
                      <option value="">— select —</option>
                      <option>Harvest roast (omnivore)</option>
                      <option>Garden harvest (vegetarian)</option>
                      <option>Vegan</option>
                      <option>Pescatarian</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="au-message">A note for the couple</label>
                  <textarea className="field" id="au-message" name="message" rows={3} maxLength={1000} placeholder="A wish, a memory, a song request…"></textarea>
                </div>
                {rsvp.error ? <p className="send-error" role="alert">{rsvp.error}</p> : null}
                <button type="submit" className="send" disabled={sending}><span className="btn-label">{sending ? 'Sending…' : 'Send Reply'}</span></button>
              </form>
            </div>
          </div>
        </section>

        <footer>
          <p className="mono">{WEDDING.mono}</p>
          <p className="q">“The falling leaves remind us — every ending is the seed of a new beginning.”</p>
        </footer>
      </main>

      <div id="toast" className={toast.show ? 'show' : ''} role="status" aria-live="polite">
        <div className="tt">{toast.title}</div><div className="td">{toast.text}</div>
      </div>
    </div>
  )
}
