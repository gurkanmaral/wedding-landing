import { useEffect, useRef } from 'react'
import { useWeddingCardFields } from './api/weddingCardContext'

const autumnTree = '/assets/autumn/autumn-tree.png'
const couple1 = '/assets/autumn/couple-1.svg'
const couple2 = '/assets/autumn/couple-2.svg'
const couple3 = '/assets/autumn/couple-3.svg'

const css = String.raw`
  :root{
    --bg:        oklch(0.962 0.022 80);
    --bg-deep:   oklch(0.93 0.034 68);
    --ink:       oklch(0.28 0.045 50);
    --muted:     oklch(0.5 0.05 55);
    --accent:    oklch(0.55 0.16 50);
    --accent-2:  oklch(0.62 0.14 38);
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
  ::selection{ background:var(--accent); color:var(--bg); }

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
  .autumn-page .leaf-band{ position:absolute; left:0; right:0; bottom:0; height:150px; z-index:1; pointer-events:none; }
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
  .autumn-page .shell{ width:100%; max-width:72rem; margin:0 auto; padding:0 clamp(1.5rem,5vw,4.5rem); }

  /* small caps label */
  .autumn-page .label{ font-family:var(--display); font-size:.72rem; letter-spacing:.42em;
    text-transform:uppercase; color:var(--accent); }
  .autumn-page .rule{ height:1px; background:var(--line-soft); border:0; }
  .autumn-page .vrule{ width:1px; background:var(--line-soft); }
  .autumn-page em, .autumn-page .it{ font-family:var(--script); font-style:italic; }

  /* ====== HERO (asymmetric, left-anchored) ====== */
  .autumn-page .hero{ position:relative; z-index:2; min-height:100vh; min-height:100svh; display:flex; align-items:center; }
  .autumn-page .hero-tree{ position:absolute; top:0; right:-2%; height:100vh; height:100svh; width:auto; max-width:64%;
    object-fit:contain; object-position:top right; z-index:1; pointer-events:none; user-select:none;
    -webkit-user-drag:none; filter:drop-shadow(0 18px 40px oklch(.3 .06 50 / .18)); will-change:transform; }
  .autumn-page .hero .shell{ display:block; position:relative; z-index:2; }
  .autumn-page .hero-block{ max-width:34rem; }
  .autumn-page .hero .label{ display:block; margin-bottom:2.2rem; }
  .autumn-page .names{ font-family:var(--display); color:var(--ink); line-height:.92;
    font-size:clamp(3.4rem,13vw,9.5rem); letter-spacing:.01em;
    text-shadow:0 0 18px var(--bg),0 0 6px var(--bg); }
  /* tablet: slim the tree so it stops crowding the names */
  @media(max-width:1024px){ .autumn-page .hero-tree{ max-width:52%; right:-6%; } }
  /* phone: tree becomes a soft backdrop, content anchors low */
  @media(max-width:720px){
    .autumn-page .hero{ align-items:flex-end; padding:6rem 0 11.5rem; }
    .autumn-page .leaf-band{ height:120px; }
    .autumn-page .hero-tree{ height:78vh; height:78svh; width:120%; max-width:none; right:-32%; opacity:.45;
      -webkit-mask-image:linear-gradient(205deg,#000 30%,transparent 85%);
      mask-image:linear-gradient(205deg,#000 30%,transparent 85%); }
    .autumn-page .hero .label{ margin-bottom:1.5rem; }
    .autumn-page .hero .hero-meta{ margin-top:1.8rem; }
  }
  .autumn-page .names .amp{ display:block; font-family:var(--script); font-style:italic;
    font-size:clamp(2rem,5vw,3.2rem); color:var(--accent); line-height:1;
    margin:.18em 0 .1em .04em; }
  .autumn-page .hero-meta{ margin-top:2.4rem; display:flex; align-items:flex-start; gap:1.4rem; }
  .autumn-page .hero-meta .vrule{ align-self:stretch; }
  .autumn-page .hero-meta .when{ font-family:var(--display); font-size:1.05rem; letter-spacing:.04em; color:var(--ink); text-shadow:0 0 10px var(--bg),0 0 4px var(--bg),0 1px 2px var(--bg); }
  .autumn-page .hero-meta .where{ margin-top:.35rem; color:var(--muted); font-size:1rem; text-shadow:0 0 10px var(--bg),0 0 4px var(--bg),0 1px 2px var(--bg); }
  .autumn-page .hero-meta .vrule{ box-shadow:0 0 8px 2px var(--bg); }
  .autumn-page .hero-actions{ margin-top:1.7rem; display:flex; flex-wrap:wrap; align-items:center; gap:.9rem 1.1rem; }
  .autumn-page .hero-actions .dot{ color:var(--line); }
  .autumn-page .ghost{ font-family:var(--display); font-size:.68rem; letter-spacing:.26em; text-transform:uppercase;
    color:var(--accent); text-decoration:none; border-bottom:1px solid var(--line);
    padding-bottom:.3rem; transition:border-color .3s, color .3s;
    text-shadow:0 0 8px var(--bg),0 0 3px var(--bg); }
  .autumn-page .ghost:hover{ border-color:var(--accent); color:var(--accent-2); }
  .autumn-page .scroll-cue{ position:absolute; z-index:2; bottom:2.2rem; left:clamp(1.5rem,5vw,4.5rem);
    font-family:var(--display); font-size:.68rem; letter-spacing:.4em; text-transform:uppercase;
    color:oklch(0.3 0.06 45); display:flex; align-items:center; gap:.7rem;
    text-decoration:none; }
  @media(max-width:720px){ .autumn-page .scroll-cue{ display:none; } }
  .autumn-page .scroll-cue::after{ content:""; width:46px; height:1px; background:oklch(0.3 0.06 45);
    transform-origin:left; animation:grow 2.4s ease-in-out infinite; }
  @keyframes grow{ 0%,100%{transform:scaleX(.3);opacity:.5} 50%{transform:scaleX(1);opacity:1} }

  /* ====== generic section rhythm ====== */
  .autumn-page section.band{ padding:clamp(5rem,11vw,9rem) 0; }
  .autumn-page .eyrow{ display:flex; align-items:center; gap:1.1rem; margin-bottom:2.6rem; }
  .autumn-page .eyrow .rule{ flex:1; }
  .autumn-page h2.head{ font-family:var(--display); font-weight:400; color:var(--ink);
    font-size:clamp(2.1rem,4.6vw,3.1rem); line-height:1.08; }

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
  .autumn-page .stop .time{ font-family:var(--display); font-size:1rem; letter-spacing:.04em; color:var(--accent); }
  .autumn-page .stop .what h3{ font-family:var(--display); font-weight:400; font-size:1.35rem; color:var(--ink); }
  .autumn-page .stop .what p{ color:var(--muted); font-size:.98rem; margin-top:.25rem; }
  @media(max-width:560px){ .autumn-page .stop{ grid-template-columns:1fr; gap:.4rem; } }

  /* COUNTDOWN — minimal borderless inline */
  .autumn-page .count{ display:flex; flex-wrap:wrap; align-items:flex-end; gap:clamp(1.5rem,5vw,3.5rem); margin-top:2.6rem; }
  .autumn-page .cd-unit{ display:flex; flex-direction:column; }
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
  .autumn-page .frame{ display:flex; flex-direction:column; align-items:center; }
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
  .autumn-page form.rsvp{ display:flex; flex-direction:column; gap:1.7rem; }
  .autumn-page .rsvp label{ display:block; font-family:var(--display); font-size:.7rem; letter-spacing:.34em;
    text-transform:uppercase; color:var(--accent); margin-bottom:.45rem; }
  .autumn-page .field{ width:100%; border:0; border-bottom:1px solid var(--line); background:transparent;
    padding:.6rem .1rem; color:var(--ink); font-family:var(--serif); font-size:1.1rem;
    transition:border-color .3s; outline:none; }
  .autumn-page .field::placeholder{ color:oklch(0.5 0.05 55 / .6); }
  .autumn-page .field:focus{ border-color:var(--accent); }
  .autumn-page select.field{ appearance:none; padding-right:1.8rem; cursor:pointer;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%23a35a1e' stroke-width='1.4'/></svg>");
    background-repeat:no-repeat; background-position:right .3rem center; }
  .autumn-page textarea.field{ resize:none; }
  .autumn-page .two{ display:grid; gap:1.7rem; }
  @media(min-width:560px){ .autumn-page .two{ grid-template-columns:1fr 1fr; } }
  .autumn-page .send{ align-self:flex-start; display:inline-flex; align-items:center; gap:.8rem; margin-top:.4rem;
    border:1px solid var(--accent); background:transparent; padding:.95rem 2.4rem;
    font-family:var(--display); font-size:.78rem; letter-spacing:.3em; text-transform:uppercase;
    color:var(--ink); cursor:pointer; transition:all .35s; }
  .autumn-page .send::after{ content:"\2192"; font-family:var(--serif); font-size:1rem; line-height:1;
    transition:transform .35s; }
  .autumn-page .send:hover{ background:var(--accent); color:var(--bg); }
  .autumn-page .send:hover::after{ transform:translateX(5px); }
  .autumn-page .send:disabled{ opacity:.5; }
  .autumn-page .rsvp-aside .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.4vw,1.95rem);
    line-height:1.4; color:var(--ink); }
  .autumn-page .rsvp-aside p{ color:var(--muted); margin-top:1.1rem; }

  .autumn-page footer{ position:relative; z-index:5; text-align:center; padding:5.5rem 1.5rem 4rem;
    background:var(--bg-deep); border-top:1px solid var(--line-soft); }
  .autumn-page footer .mono{ font-family:var(--display); letter-spacing:.5em; color:var(--accent); font-size:.85rem; }
  .autumn-page footer .q{ font-family:var(--script); font-style:italic; color:var(--muted); font-size:1.15rem;
    max-width:30rem; margin:1.3rem auto 0; line-height:1.5; }

  /* toast */
  #toast{ position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
    z-index:60; min-width:280px; max-width:90vw; background:var(--bg); border:1px solid var(--accent);
    color:var(--ink); padding:1rem 1.25rem; box-shadow:0 24px 55px -24px oklch(.3 .06 50 / .5);
    opacity:0; pointer-events:none; transition:opacity .4s, transform .4s; }
  #toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  #toast .tt{ font-family:var(--display); letter-spacing:.04em; }
  #toast .td{ margin-top:.3rem; font-family:var(--script); font-style:italic; color:var(--muted); }

  /* reveal */
  .autumn-page .reveal{ opacity:0; transform:translateY(34px); transition:opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  .autumn-page .reveal.in{ opacity:1; transform:none; }
  @media(prefers-reduced-motion:reduce){ .autumn-page .reveal{ opacity:1; transform:none; } .autumn-page .scroll-cue::after{ animation:none; } }

  /* ===== Added: hero entrance, arched photo reveal, rolling countdown ===== */
  @keyframes heroRise{ from{ opacity:0; translate:0 26px; } }
  .autumn-page .hero-block > *{ animation:heroRise 1s cubic-bezier(.16,1,.3,1) backwards; }
  .autumn-page .hero-block > *:nth-child(1){ animation-delay:.12s }
  .autumn-page .hero-block > *:nth-child(2){ animation-delay:.28s }
  .autumn-page .hero-block > *:nth-child(3){ animation-delay:.48s }
  .autumn-page .hero-block > *:nth-child(4){ animation-delay:.64s }
  @keyframes treeIn{ from{ opacity:0; translate:34px 0; } }
  .autumn-page .hero-tree{ animation:treeIn 1.5s cubic-bezier(.16,1,.3,1) .15s backwards; }
  @keyframes cueIn{ from{ opacity:0; } }
  .autumn-page .scroll-cue{ animation:cueIn 1s ease 1.2s backwards; }

  .autumn-page .gallery.reveal .frame{ opacity:0; translate:0 30px;
    transition:opacity .9s cubic-bezier(.16,1,.3,1), translate .9s cubic-bezier(.16,1,.3,1); }
  .autumn-page .gallery.reveal .frame .arch{ clip-path:inset(88% 0 0 0 round 9999px 9999px 10px 10px);
    transition:clip-path 1.2s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s; }
  .autumn-page .gallery.reveal.in .frame{ opacity:1; translate:0 0; }
  .autumn-page .gallery.reveal.in .frame .arch{ clip-path:inset(0 0 0 0 round 9999px 9999px 10px 10px); }
  .autumn-page .gallery.reveal.in .frame:nth-child(2),
  .autumn-page .gallery.reveal.in .frame:nth-child(2) .arch{ transition-delay:.15s; }
  .autumn-page .gallery.reveal.in .frame:nth-child(3),
  .autumn-page .gallery.reveal.in .frame:nth-child(3) .arch{ transition-delay:.3s; }

  .autumn-page .count.reveal .cd-unit{ opacity:0; translate:0 18px;
    transition:opacity .7s cubic-bezier(.16,1,.3,1), translate .7s cubic-bezier(.16,1,.3,1); }
  .autumn-page .count.reveal.in .cd-unit{ opacity:1; translate:0 0; }
  .autumn-page .count.reveal.in .cd-unit:nth-child(2){ transition-delay:.08s; }
  .autumn-page .count.reveal.in .cd-unit:nth-child(3){ transition-delay:.16s; }
  .autumn-page .count.reveal.in .cd-unit:nth-child(4){ transition-delay:.24s; }

  .autumn-page .cd-unit .n{ display:inline-grid; overflow:hidden; justify-items:center; }
  .autumn-page .cd-unit .n .roll{ grid-area:1/1; }
  .autumn-page .cd-unit .n .roll.out{ animation:rollOut .5s cubic-bezier(.45,0,.55,1) forwards; }
  .autumn-page .cd-unit .n .roll.in{ animation:rollIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes rollOut{ to{ translate:0 -85%; opacity:0; } }
  @keyframes rollIn{ from{ translate:0 85%; opacity:0; } }

  @media(prefers-reduced-motion:reduce){
    .autumn-page .hero-block > *, .autumn-page .hero-tree, .autumn-page .scroll-cue{ animation:none; }
    .autumn-page .gallery.reveal .frame{ opacity:1; translate:0 0; }
    .autumn-page .gallery.reveal .frame .arch{ clip-path:none; }
    .autumn-page .count.reveal .cd-unit{ opacity:1; translate:0 0; }
    .autumn-page .cd-unit .n .roll.out, .autumn-page .cd-unit .n .roll.in{ animation:none; }
  }
`

export default function AutumnFallsPage() {
  const rootRef = useRef(null)
  const {
    partner1, partner2, eventDate, dateLabel, venue, city, address, rsvpDeadline, description,
  } = useWeddingCardFields({
    partner1: 'Nazlı',
    partner2: 'Bahadır',
    eventDate: '2026-10-17T16:00:00-04:00',
    venue: 'Maplewood Estate',
    city: 'Hudson Valley, New York',
    address: 'Maplewood Estate, Hudson Valley, New York',
    rsvpDeadline: '15 September 2026',
    description: 'Come gather where the maples burn gold, and watch two lives grow into one.',
  })
  const mapQuery = encodeURIComponent(`${venue}, ${address}, ${city}`)
  const calendarStart = eventDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const calendarEnd = new Date(eventDate.getTime() + 7 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac
    let alive = true
    const timers = []

    /* ===== Falling CSS maple leaves ===== */
    ;(function () {
      const layer = document.getElementById('leaves'); if (!layer) return
      layer.innerHTML = ''
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      const COLORS = ['#ff7a3c', '#ff9442', '#ffb347', '#e8602c', '#f6a623', '#d9531e', '#ffc861', '#c2451a']
      const N = reduce ? 28 : Math.min(120, Math.round(innerWidth / 15))
      const leaves = []
      function makeEl() {
        const w = document.createElement('div'); w.className = 'dom-leaf'
        w.innerHTML = '<div class="maple-leaf"><div class="top trapezium"></div><div class="mid"><div class="left trapezium"></div><div class="center"></div><div class="right trapezium"></div></div><div class="branch"></div></div>'
        return w
      }
      function reset(p, initial) {
        p.x = Math.random() * innerWidth
        p.y = initial ? Math.random() * innerHeight : -90 - Math.random() * 140
        p.depth = .45 + Math.random() * .55
        p.vy = (34 + Math.random() * 48) * p.depth
        p.sway = 16 + Math.random() * 36
        p.swPhase = Math.random() * Math.PI * 2
        p.swSpeed = .4 + Math.random() * 1.1
        p.rot = Math.random() * 360
        p.vr = (Math.random() - .5) * (reduce ? 16 : 70)
        p.scale = (0.5 + Math.random() * 0.85) * p.depth
      }
      for (let i = 0; i < N; i++) {
        const el = makeEl()
        el.querySelector('.maple-leaf').style.setProperty('--leaf-color', COLORS[i % COLORS.length])
        el.style.opacity = (0.72 + Math.random() * 0.28).toFixed(2)
        layer.appendChild(el)
        const p = { el }; reset(p, true); leaves.push(p)
      }
      let last = performance.now()
      let wind = 0, px = -9999, py = -9999
      function blow(x, y) { wind = (x / innerWidth - 0.5); px = x; py = y }
      addEventListener('pointermove', e => blow(e.clientX, e.clientY), { passive: true, signal })
      addEventListener('touchmove', e => { const t = e.touches[0]; if (t) blow(t.clientX, t.clientY) }, { passive: true, signal })
      addEventListener('touchend', () => { px = -9999; py = -9999 }, { passive: true, signal })
      addEventListener('touchcancel', () => { px = -9999; py = -9999 }, { passive: true, signal })
      function frame(now) {
        if (!alive) return
        const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000
        wind *= Math.max(0, 1 - 0.6 * dt) /* breeze dies down when the pointer rests */
        for (const p of leaves) {
          p.y += p.vy * dt; p.rot += p.vr * dt
          // wind drift follows the cursor's side of the screen
          p.x += wind * 46 * p.depth * dt * 60 * 0.016
          // gentle repel when the cursor passes through
          const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy
          if (d2 < 14000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 118) * 60 * dt; p.x += dx / d * f; p.y += dy / d * f * 0.5; p.rot += f * 2 }
          if (p.y > innerHeight + 40 || p.x < -120 || p.x > innerWidth + 120) reset(p, false)
          const sx = Math.sin(t * p.swSpeed + p.swPhase) * p.sway
          p.el.style.transform = `translate3d(${(p.x + sx).toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})`
        }
        requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })()

    /* ===== Piles of leaves that scatter under the cursor ===== */
    ;(function () {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      const COLORS = ['#ff7a3c', '#ff9442', '#ffb347', '#e8602c', '#f6a623', '#d9531e', '#ffc861', '#c2451a', '#b8430f']
      const rnd = (a, b) => a + Math.random() * (b - a)
      function makeGround(id, count) {
        const g = document.getElementById(id); if (!g) return
        g.innerHTML = ''
        const M = reduce ? Math.round(count * 0.5) : count
        for (let i = 0; i < M; i++) {
          const w = document.createElement('div'); w.className = 'dom-leaf'
          w.innerHTML = '<div class="maple-leaf"><div class="top trapezium"></div><div class="mid"><div class="left trapezium"></div><div class="center"></div><div class="right trapezium"></div></div><div class="branch"></div></div>'
          w.querySelector('.maple-leaf').style.setProperty('--leaf-color', COLORS[(Math.random() * COLORS.length) | 0])
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
        addEventListener('resize', place, { signal })
      }
      function makePile(id, count, hyMin, hyMax) {
        const pile = document.getElementById(id); if (!pile) return
        pile.innerHTML = ''
        const M = reduce ? Math.round(count * 0.4) : count
        const items = []
        function writeT(p) { p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px,0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})` }
        function makeEl(color) {
          const w = document.createElement('div'); w.className = 'dom-leaf'
          w.innerHTML = '<div class="maple-leaf"><div class="top trapezium"></div><div class="mid"><div class="left trapezium"></div><div class="center"></div><div class="right trapezium"></div></div><div class="branch"></div></div>'
          w.querySelector('.maple-leaf').style.setProperty('--leaf-color', color)
          pile.appendChild(w); return w
        }
        function layout() {
          const w = pile.clientWidth || innerWidth
          items.forEach((p, i) => { p.hx = (i + 0.5) / M * w + rnd(-24, 24); p.hy = rnd(hyMin, hyMax); p.hrot = rnd(-60, 60); p.hscale = rnd(0.85, 1.7) })
        }
        for (let i = 0; i < M; i++) {
          const p = { el: makeEl(COLORS[i % COLORS.length]), x: 0, y: 0, rot: 0, scale: 1, vx: 0, vy: 0, vr: 0, flying: false }
          p.el.style.opacity = (0.85 + Math.random() * 0.15).toFixed(2)
          items.push(p)
        }
        layout()
        items.forEach(p => { p.x = p.hx; p.y = p.hy; p.rot = p.hrot; p.scale = p.hscale; writeT(p) })
        addEventListener('resize', () => { layout(); items.forEach(p => { if (!p.flying) { p.x = p.hx; p.y = p.hy; p.rot = p.hrot; p.scale = p.hscale; writeT(p) } }) }, { signal })
        let pxr = -9999, pyr = -9999, active = false
        function track(x, y) { const r = pile.getBoundingClientRect(); pxr = x - r.left; pyr = y - r.top; active = true }
        addEventListener('pointermove', e => track(e.clientX, e.clientY), { passive: true, signal })
        addEventListener('touchmove', e => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY) }, { passive: true, signal })
        addEventListener('touchend', () => { active = false; pxr = -9999; pyr = -9999 }, { passive: true, signal })
        addEventListener('touchcancel', () => { active = false; pxr = -9999; pyr = -9999 }, { passive: true, signal })
        let last = performance.now()
        const g = 1100
        function frame(now) {
          if (!alive) return
          const dt = Math.min(.05, (now - last) / 1000); last = now
          const r = pile.getBoundingClientRect()
          const onScreen = r.top < innerHeight + 80 && r.bottom > -80
          const w = pile.clientWidth || innerWidth
          for (const p of items) {
            if (!p.flying) {
              if (onScreen && active) {
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
              if (!p.flying) continue /* resting leaves: skip writes, keep last transform */
            }
            p.vy += g * dt; p.vx *= 0.99
            p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt
            if (p.x < -24) { p.x = -24; p.vx *= -0.4 }
            if (p.x > w + 24) { p.x = w + 24; p.vx *= -0.4 }
            if (p.vy > 0 && p.y >= p.hy) { p.flying = false; p.y = p.hy; p.vx = 0; p.vy = 0 }
            writeT(p)
          }
          active = false /* scatter only on frames with a fresh pointer event */
          requestAnimationFrame(frame)
        }
        requestAnimationFrame(frame)
      }
      /* scale the leaf litter to the viewport so phones don't choke */
      const density = Math.min(1, innerWidth / 1200)
      makeGround('ground-leaves', Math.round(400 * density) || 120)
      makePile('pile-hero', Math.round(150 * density) || 45, -8, 60)
    })()

    /* ===== Hero tree parallax ===== */
    ;(function () {
      const tree = document.querySelector('.hero-tree'); if (!tree) return
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      let ticking = false
      addEventListener('scroll', () => {
        if (ticking) return; ticking = true
        requestAnimationFrame(() => { tree.style.transform = `translateY(${(scrollY * 0.14).toFixed(1)}px)`; ticking = false })
      }, { passive: true, signal })
    })()

    /* ===== Add to Calendar (.ics) ===== */
    ;(function () {
      const btn = document.getElementById('icsBtn'); if (!btn) return
      btn.addEventListener('click', e => {
        e.preventDefault()
        const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${partner1} & ${partner2}//Wedding//EN`,
          'BEGIN:VEVENT', `UID:${eventDate.getTime()}@weddingcard`, `DTSTAMP:${calendarStart}`,
          `DTSTART:${calendarStart}`, `DTEND:${calendarEnd}`,
          `SUMMARY:${partner1} & ${partner2} — An Autumn Wedding`,
          `LOCATION:${address.replaceAll(',', '\\,')}`,
          `DESCRIPTION:${description.replaceAll(',', '\\,')}`,
          'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
        const a = document.createElement('a'); a.href = url; a.download = `${partner1}-${partner2}-wedding.ics`.toLowerCase().replaceAll(' ', '-')
        document.body.appendChild(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }, { signal })
    })()

    /* ===== Gallery slider dots (mobile) ===== */
    ;(function () {
      const gal = document.querySelector('.gallery'), dots = document.getElementById('galleryDots')
      if (!gal || !dots) return
      const frames = [...gal.querySelectorAll('.frame')], pips = [...dots.children]
      let ticking = false
      gal.addEventListener('scroll', () => {
        if (ticking) return; ticking = true
        requestAnimationFrame(() => {
          const mid = gal.scrollLeft + gal.clientWidth / 2
          let best = 0, bd = Infinity
          frames.forEach((f, i) => { const c = f.offsetLeft + f.offsetWidth / 2, d = Math.abs(c - mid); if (d < bd) { bd = d; best = i } })
          pips.forEach((p, i) => p.classList.toggle('on', i === best))
          ticking = false
        })
      }, { passive: true, signal })
    })()

    /* ===== Countdown (digits roll on change) ===== */
    ;(function () {
      const TARGET = eventDate.getTime()
      const d = cd('cd-d'), h = cd('cd-h'), m = cd('cd-m'), s = cd('cd-s')
      function cd(id) { return document.getElementById(id) }
      function pad(n) { return String(Math.max(0, n)).padStart(2, '0') }
      function roll(el, v) {
        if (el.dataset.v === v) return
        const old = el.dataset.v
        el.dataset.v = v
        if (old === undefined) { el.textContent = v; return }
        el.innerHTML = `<span class="roll out">${old}</span><span class="roll in">${v}</span>`
      }
      function tick() {
        const diff = Math.max(0, TARGET - Date.now())
        roll(d, pad(Math.floor(diff / 864e5))); roll(h, pad(Math.floor(diff % 864e5 / 36e5)))
        roll(m, pad(Math.floor(diff % 36e5 / 6e4))); roll(s, pad(Math.floor(diff % 6e4 / 1e3)))
      }
      tick(); timers.push(setInterval(tick, 1000))
    })()

    /* ===== Reveals + RSVP ===== */
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }, { threshold: .18 })
    document.querySelectorAll('.autumn-page .reveal').forEach(el => io.observe(el))
    const form = document.getElementById('rsvpForm'), toast = document.getElementById('toast')
    const btn = form.querySelector('.send'), lbl = form.querySelector('.btn-label'); let tm = 0
    form.addEventListener('submit', e => {
      e.preventDefault()
      const name = new FormData(form).get('name') || 'friend'
      btn.disabled = true; lbl.textContent = 'Sending…'
      setTimeout(() => {
        if (!alive) return
        btn.disabled = false; lbl.textContent = 'Send Reply'
        toast.querySelector('.tt').textContent = 'Thank you — your reply is received'
        toast.querySelector('.td').textContent = `We can't wait to celebrate with you, ${name}.`
        toast.classList.add('show'); clearTimeout(tm); tm = setTimeout(() => toast.classList.remove('show'), 5000); form.reset()
      }, 800)
    }, { signal })

    return () => {
      alive = false
      ac.abort()
      io.disconnect()
      timers.forEach(clearInterval)
      clearTimeout(tm)
    }
  }, [address, calendarEnd, calendarStart, description, eventDate, partner1, partner2])

  return (
    <div ref={rootRef} className="autumn-page">
      <title>{partner1} &amp; {partner2} — An Autumn Wedding</title>
      <meta name="description" content={description} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <style>{css}</style>

      <div id="ground"></div>
      <div id="grain"></div>
      <div id="leaves" aria-hidden="true"></div>

      <main>
        {/* HERO */}
        <section className="hero" data-screen-label="01 Hero">
          <img className="hero-tree" src={autumnTree} alt="" aria-hidden="true" />
          <div id="ground-leaves" className="leaf-band carpet" aria-hidden="true"></div>
          <div id="pile-hero" className="leaf-band" aria-hidden="true"></div>
          <div className="shell">
            <div className="hero-block">
              <span className="label">An Autumn Wedding</span>
              <h1 className="names">{partner1}<span className="amp">and</span>{partner2}</h1>
              <div className="hero-meta">
                <div className="vrule"></div>
                <div>
                  <p className="when">{dateLabel}</p>
                  <p className="where">{venue} — {city}</p>
                </div>
              </div>
              <div className="hero-actions">
                <a className="ghost" href="#" id="icsBtn">Add to Calendar</a>
                <span className="dot">·</span>
                <a className="ghost" href={`https://maps.google.com/?q=${mapQuery}`} target="_blank" rel="noopener noreferrer">Getting There</a>
              </div>
            </div>
          </div>
          <a className="scroll-cue" href="#invitation">Scroll</a>
        </section>

        {/* INVITATION */}
        <section className="band order" id="invitation" data-screen-label="02 Invitation">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">The Invitation</span><hr className="rule" /></div>
            <div className="invite">
              <p className="lead reveal">{description}</p>
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
            <div className="eyrow reveal"><span className="label">The Order of the Day</span><hr className="rule" /></div>
            <h2 className="head reveal" style={{ marginBottom: '2.4rem' }}>A slow afternoon<br />into a golden night.</h2>
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
            <div className="eyrow reveal"><span className="label">Counting Down</span><hr className="rule" /></div>
            <h2 className="head reveal">Until the leaves fall.</h2>
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
            <div className="eyrow reveal"><span className="label">The Two of Us</span><hr className="rule" /></div>
            <h2 className="head reveal">A few of our<br />favourite seasons.</h2>
            <div className="gallery reveal">
              {/* Kendi fotoğrafını eklemek için src="..." değerini değiştir */}
              <figure className="frame"><img className="arch" src={couple1} alt="" /><figcaption className="cap">where it began</figcaption></figure>
              <figure className="frame up"><img className="arch" src={couple2} alt="" /><figcaption className="cap">the question</figcaption></figure>
              <figure className="frame"><img className="arch" src={couple3} alt="" /><figcaption className="cap">last october</figcaption></figure>
            </div>
            <div className="gallery-dots" id="galleryDots" aria-hidden="true"><i className="on"></i><i></i><i></i></div>
          </div>
        </section>

        {/* RSVP */}
        <section className="band order" id="rsvp" data-screen-label="06 RSVP">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Reply</span><hr className="rule" /></div>
            <div className="rsvp-wrap">
              <div className="rsvp-aside reveal">
                <p className="lead">Will you join us by the fire?</p>
                <p>Kindly send word before {rsvpDeadline}, so we may set your place at the table.</p>
              </div>
              <form className="rsvp reveal" id="rsvpForm">
                <div>
                  <label>Your Name</label>
                  <input className="field" name="name" required placeholder="As you wish to be greeted" autoComplete="off" />
                </div>
                <div className="two">
                  <div>
                    <label>Attendance</label>
                    <select className="field" name="attendance" required defaultValue="">
                      <option value="">— select —</option>
                      <option value="joyfully">Joyfully attending</option>
                      <option value="regret">Regretfully unable</option>
                    </select>
                  </div>
                  <div>
                    <label>Meal</label>
                    <select className="field" name="meal" defaultValue="">
                      <option value="">— select —</option>
                      <option>Harvest roast (omnivore)</option>
                      <option>Garden harvest (vegetarian)</option>
                      <option>Vegan</option>
                      <option>Pescatarian</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>A note for the couple</label>
                  <textarea className="field" name="message" rows={3} placeholder="A wish, a memory, a song request…"></textarea>
                </div>
                <button type="submit" className="send"><span className="btn-label">Send Reply</span></button>
              </form>
            </div>
          </div>
        </section>

        <footer>
          <p className="mono">{partner1.charAt(0)} &middot; {partner2.charAt(0)}</p>
          <p className="q">“The falling leaves remind us — every ending is the seed of a new beginning.”</p>
        </footer>
      </main>

      <div id="toast"><div className="tt"></div><div className="td"></div></div>
    </div>
  )
}
