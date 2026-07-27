import { useEffect, useRef } from 'react'

const couple1 = '/assets/aegean/couple-1.svg'
const couple2 = '/assets/aegean/couple-2.svg'
const couple3 = '/assets/aegean/couple-3.svg'

const css = String.raw`
  :root{
    --bg:        oklch(0.977 0.008 85);
    --bg-deep:   oklch(0.947 0.016 80);
    --ink:       oklch(0.3 0.045 255);
    --muted:     oklch(0.49 0.04 250);
    --accent:    oklch(0.5 0.12 245);
    --accent-2:  oklch(0.56 0.19 350);
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
  ::selection{ background:var(--accent-2); color:var(--bg); }

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

  /* ---- bougainvillea petals ---- */
  #leaves{ position:fixed; inset:0; z-index:3; pointer-events:none; overflow:hidden; }
  .aegean-page .dom-leaf{ position:absolute; top:0; left:0; transform-origin:50% 45%; will-change:transform; }
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

  /* ---- the sea at the foot of the hero ---- */
  #sea{ position:absolute; left:0; right:0; bottom:0; height:clamp(84px,15vh,150px);
    z-index:1; overflow:hidden; }
  #sea svg.wl{ position:absolute; bottom:0; left:0; width:200%; height:100%; }
  .aegean-page .wl.w1{ height:100%; animation:driftr 17s linear infinite; }
  .aegean-page .wl.w2{ height:74%; animation:driftl 11s linear infinite; }
  .aegean-page .wl.w3{ height:52%; animation:driftr 8s linear infinite; }
  .aegean-page .wl.w1 path{ fill:oklch(0.78 0.05 240 / .4); }
  .aegean-page .wl.w2 path{ fill:oklch(0.64 0.08 244 / .55); }
  .aegean-page .wl.w3 path{ fill:oklch(0.52 0.1 247 / .75); }
  @keyframes driftr{ from{ transform:translateX(-50%); } to{ transform:translateX(0); } }
  @keyframes driftl{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
  #boat{ position:absolute; bottom:44%; left:0; animation:sail 70s linear infinite; opacity:.85; }
  #boat .bob{ animation:bob 3.4s ease-in-out infinite alternate; transform-origin:50% 100%; }
  @keyframes sail{ from{ transform:translateX(-90px); } to{ transform:translateX(calc(100vw + 90px)); } }
  @keyframes bob{ from{ transform:rotate(-2.2deg) translateY(0); } to{ transform:rotate(2.4deg) translateY(3px); } }
  .aegean-page .ripple{ position:absolute; width:150px; height:150px; margin:-75px 0 0 -75px;
    border-radius:50%; border:1.5px solid oklch(0.99 0.005 240 / .95);
    transform:scale(0); opacity:.9; animation:rip 1.25s ease-out forwards; pointer-events:none; }
  @keyframes rip{ to{ transform:scale(1); opacity:0; } }
  @media(prefers-reduced-motion:reduce){
    .aegean-page .wl.w1,.aegean-page .wl.w2,.aegean-page .wl.w3{ animation:none; }
    #boat{ animation:none; left:18%; }
    #boat .bob{ animation:none; }
  }

  .aegean-page main{ position:relative; }
  .aegean-page .band{ position:relative; z-index:4; }
  .aegean-page .band .shell{ position:relative; z-index:2; }
  .aegean-page .shell{ width:100%; max-width:72rem; margin:0 auto; padding:0 clamp(1.5rem,5vw,4.5rem); }

  .aegean-page .label{ font-family:var(--display); font-size:.72rem; letter-spacing:.42em;
    text-transform:uppercase; color:var(--accent); }
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
    padding-top:4rem; padding-bottom:8.5rem; }
  .aegean-page .arch-frame{ position:relative; width:min(34rem,88vw);
    padding:clamp(3rem,7vw,4.6rem) clamp(1.4rem,4vw,3rem) clamp(2.2rem,5vw,3.2rem);
    border:1.5px solid var(--line); border-radius:999px 999px 16px 16px;
    background:oklch(0.985 0.006 90 / .6); backdrop-filter:blur(3px);
    box-shadow:inset 0 0 0 7px var(--bg), inset 0 0 0 8.5px var(--line-soft),
      0 40px 80px -50px oklch(.3 .06 250 / .5); }
  .aegean-page .hero .label{ display:block; margin-bottom:1.8rem; color:var(--accent-2); }
  .aegean-page .names{ font-family:var(--display); color:var(--ink); line-height:.95;
    font-size:clamp(2.9rem,10vw,5.6rem); letter-spacing:.01em; }
  .aegean-page .names .amp{ display:block; font-family:var(--script); font-style:italic;
    font-size:clamp(1.6rem,4vw,2.4rem); color:var(--accent-2); line-height:1.1;
    margin:.14em 0 .08em; }
  .aegean-page .hero-meta{ margin-top:2rem; }
  .aegean-page .hero-meta .when{ font-family:var(--display); font-size:1.02rem; letter-spacing:.05em; color:var(--ink); }
  .aegean-page .hero-meta .where{ margin-top:.3rem; color:var(--muted); font-size:.98rem; }
  .aegean-page .hero-meta::before{ content:""; display:block; width:52px; height:1.5px;
    background:var(--accent); margin:0 auto 1.1rem; opacity:.55; }
  .aegean-page .hero-actions{ margin-top:2rem; display:flex; flex-wrap:wrap; justify-content:center;
    align-items:center; gap:.9rem 1.1rem; }
  .aegean-page .hero-actions .dot{ color:var(--line); }
  .aegean-page .ghost{ font-family:var(--display); font-size:.68rem; letter-spacing:.26em; text-transform:uppercase;
    color:var(--accent); text-decoration:none; border-bottom:1px solid var(--line);
    padding-bottom:.3rem; transition:border-color .3s, color .3s;
    text-shadow:0 0 8px var(--bg),0 0 3px var(--bg); }
  .aegean-page .ghost:hover{ border-color:var(--accent); color:var(--accent-2); }
  .aegean-page .scroll-cue{ position:absolute; z-index:2; bottom:calc(clamp(84px,15vh,150px) + 1.3rem); left:50%; transform:translateX(-50%);
    font-family:var(--display); font-size:.68rem; letter-spacing:.4em; text-transform:uppercase;
    color:oklch(0.3 0.05 255); display:flex; align-items:center; gap:.7rem; text-decoration:none; }
  .aegean-page .scroll-cue::after{ content:""; width:46px; height:1px; background:oklch(0.3 0.05 255);
    transform-origin:left; animation:grow 2.4s ease-in-out infinite; }
  @keyframes grow{ 0%,100%{transform:scaleX(.3);opacity:.5} 50%{transform:scaleX(1);opacity:1} }
  @media(max-width:720px){
    .aegean-page .scroll-cue{ display:none; }
    .aegean-page .hero .shell{ padding-bottom:8.5rem; }
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
    font-size:clamp(2rem,4.4vw,3rem); line-height:1.1; }

  .aegean-page .invite{ max-width:44rem; margin:0 auto; text-align:center; }
  .aegean-page .invite .lead{ font-family:var(--script); font-style:italic; font-size:clamp(1.5rem,2.6vw,2rem);
    line-height:1.4; color:var(--ink); }
  .aegean-page .invite p.body{ color:var(--muted); margin-top:1.6rem; }
  .aegean-page .invite p.body + p.body{ margin-top:1rem; }

  /* ---- coastal route timeline ---- */
  .aegean-page .route{ position:relative; display:grid; grid-template-columns:repeat(5,1fr);
    gap:clamp(1rem,2.4vw,2rem); margin-top:3.4rem; }
  .aegean-page .route::before{ content:""; position:absolute; top:5px; left:1.5%; right:1.5%;
    border-top:2px dashed var(--line); }
  .aegean-page .rstop{ position:relative; padding-top:2.1rem; }
  .aegean-page .rstop::before{ content:""; position:absolute; top:0; left:2px; width:12px; height:12px;
    border-radius:50%; background:var(--accent-2);
    box-shadow:0 0 0 4px color-mix(in oklab, var(--accent-2) 18%, transparent); }
  .aegean-page .rstop .time{ font-family:var(--display); font-size:.95rem; letter-spacing:.06em; color:var(--accent-2); }
  .aegean-page .rstop h3{ font-family:var(--display); font-weight:400; font-size:1.25rem; color:var(--ink); margin-top:.5rem; }
  .aegean-page .rstop p{ color:var(--muted); font-size:.95rem; margin-top:.35rem; }
  @media(max-width:820px){
    .aegean-page .route{ grid-template-columns:1fr; gap:2rem; max-width:26rem; margin-left:auto; margin-right:auto; }
    .aegean-page .route::before{ top:8px; bottom:8px; left:7px; right:auto; border-top:0; border-left:2px dashed var(--line); }
    .aegean-page .rstop{ padding:0 0 0 2.4rem; }
    .aegean-page .rstop::before{ top:6px; left:1px; }
  }

  /* ---- countdown at sea ---- */
  .aegean-page .sea-band .label{ color:oklch(0.84 0.05 240); }
  .aegean-page .sea-band h2.head{ color:#fff; }
  .aegean-page .count{ display:flex; flex-wrap:wrap; justify-content:center; align-items:flex-end;
    gap:clamp(1.5rem,5vw,3.5rem); margin-top:2.6rem; }
  .aegean-page .cd-unit{ display:flex; flex-direction:column; align-items:center; }
  .aegean-page .cd-unit .n{ font-family:var(--display); font-size:clamp(2.6rem,6vw,3.6rem); line-height:1; color:#fff;
    font-variant-numeric:lining-nums tabular-nums; }
  .aegean-page .cd-unit .l{ margin-top:.6rem; font-size:.7rem; letter-spacing:.34em; text-transform:uppercase;
    color:oklch(0.8 0.045 240); }
  @media(max-width:560px){
    .aegean-page .count{ display:grid; grid-template-columns:1fr 1fr; gap:2.4rem 1rem;
      justify-items:center; text-align:center; max-width:20rem; margin:2.2rem auto 0; }
  }

  /* ---- washing-line gallery ---- */
  .aegean-page .washline{ position:relative; margin-top:3.6rem; }
  .aegean-page .rope{ position:absolute; z-index:1; top:0; left:-2%; right:-2%; height:44px; pointer-events:none; }
  .aegean-page .rope svg{ width:100%; height:100%; display:block; }
  .aegean-page .rope path{ stroke:oklch(0.55 0.05 70); stroke-width:2.5; fill:none; }
  .aegean-page .pins{ position:relative; z-index:2; display:grid; grid-template-columns:repeat(3,1fr);
    gap:clamp(1.2rem,3vw,2.6rem); padding-top:10px; }
  .aegean-page .pin{ position:relative; }
  .aegean-page .pin:nth-child(2){ margin-top:22px; }
  .aegean-page .peg{ position:absolute; z-index:3; top:-4px; left:50%; width:11px; height:24px; margin-left:-5.5px;
    border-radius:3px; background:linear-gradient(180deg,#cfa46c,#9a7444);
    box-shadow:0 1px 3px oklch(0.3 0.05 250 / .35); }
  .aegean-page .polar{ background:#fffdf9; border:1px solid var(--line); padding:10px 10px 0; margin-top:8px;
    box-shadow:0 28px 50px -30px oklch(.3 .06 250 / .55);
    transform:rotate(var(--tilt,0deg)); transform-origin:50% -14px; }
  .aegean-page .pin:hover .polar{ animation:swing 1.5s ease-in-out; }
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
    display:grid; grid-template-columns:1.15fr .85fr; }
  .aegean-page .pc-left{ padding:clamp(1.6rem,4vw,2.6rem); }
  .aegean-page .pc-right{ position:relative; border-left:1.5px dashed var(--line);
    padding:clamp(1.6rem,4vw,2.6rem); display:flex; flex-direction:column; gap:1.4rem; }
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
    .aegean-page .postcard{ grid-template-columns:1fr; }
    .aegean-page .pc-right{ border-left:0; border-top:1.5px dashed var(--line); }
    .aegean-page .postmark{ right:auto; left:22px; }
  }
  .aegean-page form.rsvp{ display:flex; flex-direction:column; gap:1.55rem; }
  .aegean-page .rsvp label{ display:block; font-family:var(--display); font-size:.68rem; letter-spacing:.32em;
    text-transform:uppercase; color:var(--accent); margin-bottom:.4rem; }
  .aegean-page .field{ width:100%; border:0; border-bottom:1px solid var(--line); background:transparent;
    padding:.55rem .1rem; color:var(--ink); font-family:var(--serif); font-size:1.08rem;
    transition:border-color .3s; outline:none; }
  .aegean-page .field::placeholder{ color:oklch(0.49 0.04 250 / .6); }
  .aegean-page .field:focus{ border-color:var(--accent-2); }
  .aegean-page select.field{ appearance:none; padding-right:1.8rem; cursor:pointer;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5l5 5 5-5' fill='none' stroke='%233a6ea5' stroke-width='1.4'/></svg>");
    background-repeat:no-repeat; background-position:right .3rem center; }
  .aegean-page textarea.field{ resize:none; }
  .aegean-page .two{ display:grid; gap:1.55rem; }
  @media(min-width:560px){ .aegean-page .two{ grid-template-columns:1fr 1fr; } }
  .aegean-page .send{ align-self:flex-start; display:inline-flex; align-items:center; gap:.8rem; margin-top:.3rem;
    border:1px solid var(--accent); background:transparent; padding:.9rem 2.2rem;
    font-family:var(--display); font-size:.76rem; letter-spacing:.3em; text-transform:uppercase;
    color:var(--ink); cursor:pointer; transition:all .35s; }
  .aegean-page .send::after{ content:"\2192"; font-family:var(--serif); font-size:1rem; line-height:1;
    transition:transform .35s; }
  .aegean-page .send:hover{ background:var(--accent); color:var(--bg); }
  .aegean-page .send:hover::after{ transform:translateX(5px); }
  .aegean-page .send:disabled{ opacity:.5; }

  .aegean-page footer{ position:relative; z-index:5; text-align:center; padding:5rem 1.5rem 4rem;
    background:var(--bg-deep); }
  .aegean-page footer .mono{ font-family:var(--display); letter-spacing:.5em; color:var(--accent); font-size:.85rem; }
  .aegean-page footer .q{ font-family:var(--script); font-style:italic; color:var(--muted); font-size:1.15rem;
    max-width:30rem; margin:1.3rem auto 0; line-height:1.5; }
  .aegean-page footer .nazar{ margin-top:1.6rem; display:flex; justify-content:center; opacity:.9; }

  #toast{ position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
    z-index:60; min-width:280px; max-width:90vw; background:var(--bg); border:1px solid var(--accent);
    color:var(--ink); padding:1rem 1.25rem; box-shadow:0 24px 55px -24px oklch(.32 .06 250 / .5);
    opacity:0; pointer-events:none; transition:opacity .4s, transform .4s; }
  #toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  #toast .tt{ font-family:var(--display); letter-spacing:.04em; }
  #toast .td{ margin-top:.3rem; font-family:var(--script); font-style:italic; color:var(--muted); }

  .aegean-page .reveal{ opacity:0; transform:translateY(34px); transition:opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  .aegean-page .reveal.in{ opacity:1; transform:none; }
  @media(prefers-reduced-motion:reduce){
    .aegean-page .reveal{ opacity:1; transform:none; }
    .aegean-page .scroll-cue::after{ animation:none; }
    .aegean-page .vinner{ animation:none; }
    .aegean-page .pin:hover .polar{ animation:none; }
  }

  /* ===== Added: hero entrance, polaroid develop reveal, rolling countdown ===== */
  @keyframes archIn{ from{ opacity:0; translate:0 34px; scale:.96; } }
  .aegean-page .arch-frame{ animation:archIn 1.15s cubic-bezier(.16,1,.3,1) .1s backwards; }
  @keyframes heroRise{ from{ opacity:0; translate:0 18px; } }
  .aegean-page .arch-frame .label{ animation:heroRise .9s cubic-bezier(.16,1,.3,1) .5s backwards; }
  .aegean-page .arch-frame .names{ animation:heroRise .9s cubic-bezier(.16,1,.3,1) .64s backwards; }
  .aegean-page .arch-frame .hero-meta{ animation:heroRise .9s cubic-bezier(.16,1,.3,1) .8s backwards; }
  .aegean-page .hero-actions{ animation:heroRise .9s cubic-bezier(.16,1,.3,1) .95s backwards; }

  .aegean-page .washline.reveal .pin{ opacity:0; translate:0 30px;
    transition:opacity .9s cubic-bezier(.16,1,.3,1), translate .9s cubic-bezier(.16,1,.3,1); }
  .aegean-page .washline.reveal .polar img{ filter:blur(10px) saturate(.5) brightness(1.18);
    transition:filter 1.5s ease .15s; }
  .aegean-page .washline.reveal.in .pin{ opacity:1; translate:0 0; }
  .aegean-page .washline.reveal.in .polar img{ filter:blur(0) saturate(1) brightness(1); }
  .aegean-page .washline.reveal.in .pin:nth-child(2){ transition-delay:.15s; }
  .aegean-page .washline.reveal.in .pin:nth-child(3){ transition-delay:.3s; }
  .aegean-page .washline.reveal.in .pin:nth-child(2) .polar img{ transition-delay:.35s; }
  .aegean-page .washline.reveal.in .pin:nth-child(3) .polar img{ transition-delay:.5s; }

  .aegean-page .count.reveal .cd-unit{ opacity:0; translate:0 18px;
    transition:opacity .7s cubic-bezier(.16,1,.3,1), translate .7s cubic-bezier(.16,1,.3,1); }
  .aegean-page .count.reveal.in .cd-unit{ opacity:1; translate:0 0; }
  .aegean-page .count.reveal.in .cd-unit:nth-child(2){ transition-delay:.08s; }
  .aegean-page .count.reveal.in .cd-unit:nth-child(3){ transition-delay:.16s; }
  .aegean-page .count.reveal.in .cd-unit:nth-child(4){ transition-delay:.24s; }

  .aegean-page .cd-unit .n{ display:inline-grid; overflow:hidden; justify-items:center; }
  .aegean-page .cd-unit .n .roll{ grid-area:1/1; }
  .aegean-page .cd-unit .n .roll.out{ animation:rollOut .5s cubic-bezier(.45,0,.55,1) forwards; }
  .aegean-page .cd-unit .n .roll.in{ animation:rollIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes rollOut{ to{ translate:0 -85%; opacity:0; } }
  @keyframes rollIn{ from{ translate:0 85%; opacity:0; } }

  @media(prefers-reduced-motion:reduce){
    .aegean-page .arch-frame, .aegean-page .arch-frame .label, .aegean-page .arch-frame .names,
    .aegean-page .arch-frame .hero-meta, .aegean-page .hero-actions{ animation:none; }
    .aegean-page .washline.reveal .pin{ opacity:1; translate:0 0; }
    .aegean-page .washline.reveal .polar img{ filter:none; }
    .aegean-page .count.reveal .cd-unit{ opacity:1; translate:0 0; }
    .aegean-page .cd-unit .n .roll.out, .aegean-page .cd-unit .n .roll.in{ animation:none; }
  }
`

const WAVE_PATH = 'M0,30 C120,16 240,16 360,30 C480,44 600,44 720,30 C840,16 960,16 1080,30 C1200,44 1320,44 1440,30 C1560,16 1680,16 1800,30 C1920,44 2040,44 2160,30 C2280,16 2400,16 2520,30 C2640,44 2760,44 2880,30 L2880,100 L0,100 Z'
const DIVIDER_PATH = 'M0,26 C240,44 480,4 720,20 C960,36 1200,10 1440,26 L1440,44 L0,44 Z'

function NazarSvg({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="12" fill="#1d4e89" />
      <circle cx="13" cy="13" r="8" fill="#eaf3fb" />
      <circle cx="13" cy="13" r="5" fill="#3f8ac9" />
      <circle cx="13" cy="13" r="2.4" fill="#12233c" />
    </svg>
  )
}

export default function AegeanWeddingPage() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac
    let alive = true
    const timers = []

    /* ===== Twin bougainvillea vines, grown in JS ===== */
    ;(function () {
      const hosts = [...document.querySelectorAll('.vinehost .vinner')]; if (!hosts.length) return
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
              host.appendChild(l)
            }
            if (t > 0.22 && Math.random() < 0.85) {
              const cx = pt.x + rnd(-10, 10), cy = pt.y + rnd(-10, 10)
              const n = 3 + (Math.random() * 3 | 0), base = PET[(Math.random() * PET.length) | 0]
              const swell = 0.8 + t * 0.5 /* clusters swell toward the branch tip */
              for (let k = 0; k < n; k++) {
                const p = document.createElement('i'); p.className = 'petal-shape'
                p.style.position = 'absolute'
                p.style.setProperty('--p0', base)
                p.style.left = (cx + rnd(-10, 10)).toFixed(1) + 'px'; p.style.top = (cy + rnd(-9, 9)).toFixed(1) + 'px'
                p.style.transform = `rotate(${rnd(0, 360).toFixed(0)}deg) scale(${(rnd(.85, 1.5) * swell).toFixed(2)})`
                host.appendChild(p)
              }
              const c = document.createElement('i'); c.className = 'vheart'
              c.style.left = cx.toFixed(1) + 'px'; c.style.top = cy.toFixed(1) + 'px'
              host.appendChild(c)
            }
          }
        }
      }
      hosts.forEach(grow)
      let rt = 0
      addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (alive) hosts.forEach(grow) }, 250) }, { signal })
      timers.push({ clear: () => clearTimeout(rt) })
    })()

    /* ===== Falling petals ===== */
    ;(function () {
      const layer = document.getElementById('leaves'); if (!layer) return
      layer.innerHTML = ''
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      const COLORS = ['#d81b7f', '#e5399b', '#c2186f', '#f06bb4', '#ee4f9e', '#b1135f', '#f78cc2']
      const N = reduce ? 22 : Math.min(95, Math.round(innerWidth / 17))
      const leaves = []
      function makeEl(color) {
        const w = document.createElement('div'); w.className = 'dom-leaf'
        const i = document.createElement('i'); i.className = 'petal-shape'
        i.style.setProperty('--p0', color); w.appendChild(i)
        return w
      }
      function reset(p, initial) {
        p.x = Math.random() * innerWidth
        p.y = initial ? Math.random() * innerHeight : -60 - Math.random() * 120
        p.depth = .45 + Math.random() * .55
        p.vy = (24 + Math.random() * 40) * p.depth
        p.sway = 20 + Math.random() * 42
        p.swPhase = Math.random() * Math.PI * 2
        p.swSpeed = .4 + Math.random() * 1.1
        p.rot = Math.random() * 360
        p.vr = (Math.random() - .5) * (reduce ? 14 : 80)
        p.scale = (0.7 + Math.random() * 0.9) * p.depth
      }
      for (let i = 0; i < N; i++) {
        const el = makeEl(COLORS[i % COLORS.length])
        const a = (0.72 + Math.random() * 0.28)
        el.style.opacity = a.toFixed(2)
        layer.appendChild(el)
        const p = { el, alpha0: a, float: false, fvx: 0, ft: 0, bob: 0 }; reset(p, true); leaves.push(p)
      }
      const sea = document.getElementById('sea')
      let last = performance.now()
      let wind = 0, px = -9999, py = -9999
      function blow(x, y) { wind = (x / innerWidth - 0.5); px = x; py = y }
      addEventListener('pointermove', e => blow(e.clientX, e.clientY), { passive: true, signal })
      addEventListener('touchmove', e => { const t = e.touches[0]; if (t) blow(t.clientX, t.clientY) }, { passive: true, signal })
      addEventListener('touchend', () => { px = -9999; py = -9999 }, { passive: true, signal })
      addEventListener('touchcancel', () => { px = -9999; py = -9999 }, { passive: true, signal })
      /* tap the water: a ripple spreads and nudges whatever floats there */
      addEventListener('pointerdown', e => {
        if (!sea) return
        const r = sea.getBoundingClientRect()
        if (e.clientY < r.top - 6 || e.clientY > r.bottom + 6 || r.top > innerHeight || r.bottom < 0) return
        const el = document.createElement('span'); el.className = 'ripple'
        el.style.left = (e.clientX - r.left) + 'px'; el.style.top = (e.clientY - r.top) + 'px'
        sea.appendChild(el); setTimeout(() => el.remove(), 1350)
        for (const p of leaves) {
          if (!p.float) continue
          const dx = p.x - e.clientX
          if (Math.abs(dx) < 160) { p.fvx += (dx >= 0 ? 1 : -1) * (60 + Math.random() * 110); p.bob = 9 }
        }
      }, { passive: true, signal })
      function frame(now) {
        if (!alive) return
        const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000
        wind *= Math.max(0, 1 - 0.6 * dt)
        const sr = sea ? sea.getBoundingClientRect() : null
        const seaOn = sr && sr.top < innerHeight && sr.bottom > 0
        const waterY = seaOn ? sr.bottom - Math.min(46, sr.height * 0.42) : Infinity
        for (const p of leaves) {
          if (p.float) {
            if (!seaOn) { p.float = false; p.el.style.opacity = p.alpha0.toFixed(2); reset(p, false); continue }
            p.ft += dt; p.fvx *= Math.pow(0.5, dt); p.bob *= Math.pow(0.35, dt)
            p.x += (13 + wind * 34) * dt + p.fvx * dt
            p.rot += Math.sin(t * 1.2 + p.swPhase) * 22 * dt
            const y = waterY + Math.sin(t * 1.7 + p.swPhase) * (3.5 + p.bob)
            p.el.style.opacity = Math.max(0, p.alpha0 * (1 - p.ft / 7)).toFixed(2)
            p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})`
            if (p.ft > 7 || p.x > innerWidth + 70 || p.x < -70) { p.float = false; p.el.style.opacity = p.alpha0.toFixed(2); reset(p, false) }
            continue
          }
          p.y += p.vy * dt; p.rot += p.vr * dt
          p.x += wind * 46 * p.depth * dt * 60 * 0.016
          const dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy
          if (d2 < 14000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 118) * 60 * dt; p.x += dx / d * f; p.y += dy / d * f * 0.5; p.rot += f * 2 }
          if (p.y >= waterY) { p.float = true; p.ft = 0; p.fvx = 0; p.bob = 0; continue }
          if (p.y > innerHeight + 40 || p.x < -120 || p.x > innerWidth + 120) reset(p, false)
          const sx = Math.sin(t * p.swSpeed + p.swPhase) * p.sway
          p.el.style.transform = `translate3d(${(p.x + sx).toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg) scale(${p.scale.toFixed(2)})`
        }
        requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })()

    /* ===== Vine parallax ===== */
    ;(function () {
      const vines = [...document.querySelectorAll('.vinehost')]; if (!vines.length) return
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
      let ticking = false
      addEventListener('scroll', () => {
        if (ticking) return; ticking = true
        requestAnimationFrame(() => {
          const y = (scrollY * 0.12).toFixed(1)
          vines.forEach(v => { v.style.translate = `0 ${y}px` })
          ticking = false
        })
      }, { passive: true, signal })
    })()

    /* ===== Geri sayım (rakamlar kayarak değişir) ===== */
    ;(function () {
      const TARGET = new Date('2027-06-19T17:00:00+03:00').getTime()
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

    /* ===== Galeri slider noktaları (mobil) ===== */
    ;(function () {
      const gal = document.querySelector('.pins'), dots = document.getElementById('galleryDots')
      if (!gal || !dots) return
      const frames = [...gal.querySelectorAll('.pin')], pips = [...dots.children]
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

    /* ===== Takvime ekle (.ics) ===== */
    ;(function () {
      const btn = document.getElementById('icsBtn'); if (!btn) return
      btn.addEventListener('click', e => {
        e.preventDefault()
        const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elif & Deniz//Dugun//TR',
          'BEGIN:VEVENT', 'UID:elif-deniz-20270619@dugun', 'DTSTAMP:20260101T000000Z',
          'DTSTART:20270619T140000Z', 'DTEND:20270619T210000Z',
          'SUMMARY:Elif & Deniz — Bir Ege Düğünü',
          'LOCATION:Zeytinlik Koyu\\, Alaçatı\\, Çeşme\\, İzmir',
          'DESCRIPTION:Nikâh saat 17.00 zeytinlerin altında\\; ardından gün batımı kokteyli ve uzun masa.',
          'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
        const a = document.createElement('a'); a.href = url; a.download = 'elif-deniz-dugun.ics'
        document.body.appendChild(a); a.click(); a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }, { signal })
    })()

    /* ===== Reveals + LCV ===== */
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }, { threshold: .18 })
    document.querySelectorAll('.aegean-page .reveal').forEach(el => io.observe(el))
    const form = document.getElementById('rsvpForm'), toast = document.getElementById('toast')
    const btn = form.querySelector('.send'), lbl = form.querySelector('.btn-label'); let tm = 0
    form.addEventListener('submit', e => {
      e.preventDefault()
      const name = new FormData(form).get('name') || 'dostumuz'
      btn.disabled = true; lbl.textContent = 'Gönderiliyor…'
      setTimeout(() => {
        if (!alive) return
        btn.disabled = false; lbl.textContent = 'Gönder'
        toast.querySelector('.tt').textContent = 'Teşekkürler — kartpostalınız yola çıktı'
        toast.querySelector('.td').textContent = `Seninle kutlamak için sabırsızlanıyoruz, ${name}.`
        toast.classList.add('show'); clearTimeout(tm); tm = setTimeout(() => toast.classList.remove('show'), 5000); form.reset()
      }, 800)
    }, { signal })

    return () => {
      alive = false
      ac.abort()
      io.disconnect()
      timers.forEach(t => (typeof t === 'number' ? clearInterval(t) : t.clear()))
      clearTimeout(tm)
    }
  }, [])

  return (
    <div ref={rootRef} className="aegean-page">
      <title>Elif &amp; Deniz — Bir Ege Düğünü</title>
      <meta name="description" content="Elif & Deniz'in Alaçatı'daki Ege düğününe davetlisiniz." />
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
          <div id="vine-r" className="vinehost" aria-hidden="true"><div className="vinner"></div></div>
          <div id="vine-l" className="vinehost" aria-hidden="true"><div className="vinner"></div></div>
          <div id="sea" aria-hidden="true">
            <svg className="wl w1" viewBox="0 0 2880 100" preserveAspectRatio="none"><path d={WAVE_PATH} /></svg>
            <div id="boat"><div className="bob"><svg width="54" height="46" viewBox="0 0 54 46"><path d="M28 4 v28" stroke="#20344d" strokeWidth="2" /><path d="M28 6 C41 14 43 25 28 31 Z" fill="#f7f3ea" /><path d="M26 9 C16 16 15 25 26 31 Z" fill="#e9e2d2" /><path d="M6 34 h42 l-8 8 H14 Z" fill="#20344d" /></svg></div></div>
            <svg className="wl w2" viewBox="0 0 2880 100" preserveAspectRatio="none"><path d={WAVE_PATH} /></svg>
            <svg className="wl w3" viewBox="0 0 2880 100" preserveAspectRatio="none"><path d={WAVE_PATH} /></svg>
          </div>
          <div className="shell">
            <div className="arch-frame">
              <span className="label">Bir Ege Düğünü</span>
              <h1 className="names">Elif<span className="amp">ve</span>Deniz</h1>
              <div className="hero-meta">
                <p className="when">Cumartesi · 19 Haziran 2027</p>
                <p className="where">Zeytinlik Koyu — Alaçatı, Çeşme</p>
              </div>
            </div>
            <div className="hero-actions">
              <a className="ghost" href="#" id="icsBtn">Takvime Ekle</a>
              <span className="dot">·</span>
              <a className="ghost" href="https://maps.google.com/?q=Ala%C3%A7at%C4%B1,+%C3%87e%C5%9Fme,+%C4%B0zmir" target="_blank" rel="noopener noreferrer">Yol Tarifi</a>
            </div>
          </div>
          <a className="scroll-cue" href="#davet">Kaydır</a>
        </section>

        {/* DAVET */}
        <div className="wave deep" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d={DIVIDER_PATH} /></svg></div>
        <section className="band order" id="davet" data-screen-label="02 Davet" style={{ marginTop: '-1px' }}>
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Davet</span></div>
            <div className="invite reveal">
              <p className="lead">Begonvillerin gölgesinde, denize karşı —<br />iki hayat tek yaza karışıyor.</p>
              <p className="body">Ailelerimizin sevinci ve duasıyla, <strong>Elif</strong> ile <strong>Deniz</strong>'in nikâhına davetlisiniz — zeytin ağaçlarının altında bir ikindi, ardından deniz kenarında uzun bir yaz gecesi.</p>
              <p className="body">En beyaz keteninizi giyin, en güzel anılarınızı getirin. Limonata, uzun masa ve gün doğana dek dans bizden.</p>
            </div>
          </div>
        </section>
        <div className="wave deep flip" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d={DIVIDER_PATH} /></svg></div>

        {/* GÜNÜN AKIŞI — sahil rotası */}
        <section className="band" data-screen-label="03 Günün Akışı">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">Günün Akışı</span></div>
            <h2 className="head reveal">Ağır bir yaz ikindisi,<br />masmavi bir geceye.</h2>
            <div className="route">
              <div className="rstop reveal"><span className="time">16:30</span><h3>Karşılama</h3><p>Ev yapımı limonata &amp; zeytinlikte gölge keyfi.</p></div>
              <div className="rstop reveal"><span className="time">17:00</span><h3>Nikâh</h3><p>Asırlık zeytinin altında, denize karşı.</p></div>
              <div className="rstop reveal"><span className="time">18:30</span><h3>Gün Batımı</h3><p>Kokteyl, fotoğraflar ve ufka batan güneş.</p></div>
              <div className="rstop reveal"><span className="time">20:00</span><h3>Akşam Yemeği</h3><p>Taş avluda mum ışığında uzun masa.</p></div>
              <div className="rstop reveal"><span className="time">Gece</span><h3>Dans &amp; Yıldızlar</h3><p>Deniz sesi eşliğinde, yıldızların altında.</p></div>
            </div>
          </div>
        </section>

        {/* GERİ SAYIM — denizde */}
        <div className="wave sea" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d={DIVIDER_PATH} /></svg></div>
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
        <div className="wave sea2 flip" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d={DIVIDER_PATH} /></svg></div>

        {/* FOTOĞRAFLAR — çamaşır ipi */}
        <section className="band" data-screen-label="05 İkimiz">
          <div className="shell">
            <div className="eyrow reveal"><span className="label">İkimiz</span></div>
            <h2 className="head reveal">Avluda kurusun<br />birkaç güzel yaz.</h2>
            <div className="washline reveal">
              <div className="rope" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d="M0,8 Q720,44 1440,8" /></svg></div>
              <div className="pins">
                {/* Kendi fotoğrafını eklemek için src="..." değerini değiştir */}
                <figure className="pin" style={{ '--tilt': '-2.4deg' }}><span className="peg"></span><div className="polar"><img src={couple1} alt="" /><figcaption className="cap">her şeyin başladığı yer</figcaption></div></figure>
                <figure className="pin" style={{ '--tilt': '1.8deg' }}><span className="peg"></span><div className="polar"><img src={couple2} alt="" /><figcaption className="cap">o soru</figcaption></div></figure>
                <figure className="pin" style={{ '--tilt': '-1.4deg' }}><span className="peg"></span><div className="polar"><img src={couple3} alt="" /><figcaption className="cap">geçen eylül</figcaption></div></figure>
              </div>
            </div>
            <div className="gallery-dots" id="galleryDots" aria-hidden="true"><i className="on"></i><i></i><i></i></div>
          </div>
        </section>

        {/* LCV — kartpostal */}
        <div className="wave deep" aria-hidden="true"><svg viewBox="0 0 1440 44" preserveAspectRatio="none"><path d={DIVIDER_PATH} /></svg></div>
        <section className="band order" id="rsvp" data-screen-label="06 LCV" style={{ marginTop: '-1px' }}>
          <div className="shell">
            <div className="eyrow reveal"><span className="label">LCV</span></div>
            <div className="rsvp-lead reveal">
              <p className="lead">Bizimle denize karşı kadeh kaldırır mısınız?</p>
              <p>Sofranızı ayırabilmemiz için lütfen 15 Mayıs 2027'ye kadar haber verin.</p>
            </div>
            <div className="postcard reveal">
              <div className="pc-left">
                <form className="rsvp" id="rsvpForm">
                  <div>
                    <label>Adınız</label>
                    <input className="field" name="name" required placeholder="Size nasıl seslenelim?" autoComplete="off" />
                  </div>
                  <div className="two">
                    <div>
                      <label>Katılım</label>
                      <select className="field" name="attendance" required defaultValue="">
                        <option value="">— seçiniz —</option>
                        <option value="geliyorum">Seve seve geliyorum</option>
                        <option value="gelemiyorum">Ne yazık ki gelemiyorum</option>
                      </select>
                    </div>
                    <div>
                      <label>Yemek</label>
                      <select className="field" name="meal" defaultValue="">
                        <option value="">— seçiniz —</option>
                        <option>Izgara deniz mahsulleri</option>
                        <option>Zeytinlikten (vejetaryen)</option>
                        <option>Vegan</option>
                        <option>Izgara et</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label>Çifte notunuz</label>
                    <textarea className="field" name="message" rows={3} placeholder="Bir dilek, bir anı, bir şarkı isteği…"></textarea>
                  </div>
                  <button type="submit" className="send"><span className="btn-label">Gönder</span></button>
                </form>
              </div>
              <div className="pc-right">
                <div className="stamp" aria-hidden="true">
                  <NazarSvg size={34} />
                  <span className="val">EGE · 2027</span>
                </div>
                <div className="postmark" aria-hidden="true"><span>Alaçatı<br />19 · 06 · 2027<br />Çeşme</span></div>
                <div className="addr">
                  <p className="to">Kime:</p>
                  <div className="ln name">Elif &amp; Deniz</div>
                  <div className="ln"></div>
                  <div className="ln"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer>
          <p className="mono">E &middot; D</p>
          <p className="q">“İki kıyı, tek deniz — iki kalp, tek ömür.”</p>
          <div className="nazar" aria-hidden="true">
            <NazarSvg />
          </div>
        </footer>
      </main>

      <div id="toast"><div className="tt"></div><div className="td"></div></div>
    </div>
  )
}
