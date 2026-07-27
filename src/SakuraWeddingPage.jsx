import { useEffect, useRef } from 'react'

const sakuraTree = '/assets/sakura/sakura-tree.png'
const couple1 = '/assets/sakura/couple-1.png'
const couple2 = '/assets/sakura/couple-2.png'
const couple3 = '/assets/sakura/couple-3.png'

const css = String.raw`
  /* ===== Design system ported from styles.css (oklch) ===== */
  :root{
    --background: oklch(0.972 0.018 85);
    --foreground: oklch(0.22 0.04 35);
    --card: oklch(0.965 0.022 80);
    --muted-foreground: oklch(0.45 0.04 50);
    --primary: oklch(0.62 0.12 75);
    --primary-foreground: oklch(0.98 0.01 85);
    --border: oklch(0.85 0.04 65);
    --ink: oklch(0.18 0.03 40);
    --gold: oklch(0.58 0.16 70);
    --gold-soft: oklch(0.7 0.13 75);
    --sakura: oklch(0.85 0.08 15);
    --sakura-deep: oklch(0.7 0.14 10);
    --font-display: "Yuji Syuku", "Shippori Mincho", serif;
    --font-serif: "Cormorant Garamond", "Shippori Mincho", serif;
    --font-brush: "Shippori Mincho", serif;
  }

  .sakura-page, .sakura-page *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-serif);
    -webkit-font-smoothing: antialiased;
    overflow-x:hidden;
  }
  ::selection{ background: var(--gold); color: var(--background); }

  /* utilities */
  .sakura-page .font-display{ font-family: var(--font-display); }
  .sakura-page .font-brush{ font-family: var(--font-brush); }
  .sakura-page .font-serif-soft{ font-family: var(--font-serif); }
  .sakura-page .text-gold{ color: var(--gold); }
  .sakura-page .text-ink{ color: var(--ink); }
  .sakura-page .italic{ font-style: italic; }

  .sakura-page .ink-divider{
    background: linear-gradient(90deg, transparent, var(--gold) 20%, var(--gold) 80%, transparent);
    height:1px; width:100%; opacity:.55;
  }

  /* fixed scroll-driven background gradient */
  #bgGradient{
    position:fixed; inset:0; z-index:0;
    background: linear-gradient(180deg, oklch(0.94 0.045 20) 0%, oklch(0.96 0.03 60) 100%);
  }
  #bgGradient::after{ /* paper grain */
    content:""; position:absolute; inset:0;
    background-image:
      radial-gradient(circle at 20% 30%, oklch(0.88 0.04 60 / 0.35) 0, transparent 50%),
      radial-gradient(circle at 80% 70%, oklch(0.86 0.05 30 / 0.25) 0, transparent 55%);
    background-blend-mode: multiply;
  }
  /* soft vignette */
  #vignette{
    position:fixed; inset:0; z-index:5; pointer-events:none;
    background: radial-gradient(ellipse at center, transparent 40%, oklch(0.2 0.03 40 / 0.25) 100%);
  }

  #bg{ position:fixed; inset:0; z-index:10; pointer-events:none; }

  .sakura-page main{ position:relative; z-index:20; }

  .sakura-page section{ position:relative; }
  .sakura-page .wrap{ margin:0 auto; width:100%; max-width:64rem; padding:8rem 1.5rem; }

  /* HERO */
  .sakura-page .hero{
    position:relative; min-height:100vh;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding:1.5rem; text-align:center;
  }
  .sakura-page .hero-inner{
    position:relative;
    display:flex; flex-direction:column; gap:2rem; align-items:center;
    text-shadow:
      0 2px 24px oklch(0.98 0.02 80 / 0.9),
      0 0 60px oklch(0.98 0.02 80 / 0.7);
  }
  .sakura-page .hero-inner::before{
    content:""; position:absolute; inset:-10% -14%; z-index:-1;
    background: radial-gradient(ellipse at center, oklch(0.98 0.02 80 / 0.6) 0%, oklch(0.98 0.02 80 / 0.28) 45%, transparent 72%);
  }
  .sakura-page .eyebrow{
    font-family: var(--font-display);
    font-size:.875rem; letter-spacing:.6em; color: var(--gold);
  }
  .sakura-page .hero h1{
    font-family: var(--font-display);
    font-weight:400;
    font-size: clamp(3.75rem, 12vw, 8rem);
    line-height:.95; color: var(--ink);
  }
  .sakura-page .hero h1 .amp{
    display:inline-block; vertical-align:middle;
    margin:0 1.5rem; font-size: clamp(1.875rem, 4vw, 2.5rem);
    color: var(--gold);
  }
  .sakura-page .hero .poem{
    font-family: var(--font-serif);
    font-style:italic; color: var(--muted-foreground);
    font-size: clamp(1.125rem, 2vw, 1.25rem); line-height:1.6;
  }
  .sakura-page .hero .when{
    font-family: var(--font-display);
    font-size:.875rem; letter-spacing:.4em; color: oklch(0.18 0.03 40 / .8);
  }
  .sakura-page .scroll-cue{
    position:absolute; bottom:2.5rem; left:50%; transform:translateX(-50%);
    font-family: var(--font-display); font-size:.75rem; letter-spacing:.4em; color: var(--gold);
    animation: floaty 2.4s ease-in-out infinite;
  }
  @keyframes floaty{ 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(10px)} }

  .sakura-page .center{ text-align:center; }
  .sakura-page .kicker{ font-family: var(--font-display); font-size:.75rem; letter-spacing:.5em; color: var(--gold); }
  .sakura-page .kicker.lg{ font-size:.875rem; }
  .sakura-page h2.section{
    margin-top:1.5rem; font-family: var(--font-display);
    font-size: clamp(2.25rem,5vw,3rem); color: var(--ink); font-weight:400;
  }
  .sakura-page .lede{
    margin:2.5rem auto 0; max-width:42rem;
    font-family: var(--font-serif); font-size: clamp(1.125rem,2vw,1.25rem);
    line-height:1.75; color: oklch(0.18 0.03 40 / .85);
  }
  .sakura-page .divider-sm{ margin:2rem auto 0; max-width:6rem; }

  /* COUNTDOWN */
  .sakura-page .cd-grid{
    display:grid; grid-template-columns: repeat(2,1fr); gap:1rem;
    margin-top:3.5rem;
  }
  @media(min-width:768px){ .sakura-page .cd-grid{ grid-template-columns: repeat(4,1fr); gap:1.5rem; } }
  .sakura-page .cd-cell-wrap{ display:flex; flex-direction:column; align-items:center; }
  .sakura-page .cd-cell{
    position:relative; width:100%; max-width:180px; aspect-ratio:1/1;
    overflow:hidden; border:1px solid oklch(0.58 0.16 70 / .4);
    background: oklch(0.972 0.018 85 / .7); backdrop-filter: blur(4px);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
  }
  .sakura-page .cd-cell .corner{ position:absolute; width:.75rem; height:.75rem; }
  .sakura-page .cd-cell .corner.tl{ top:0; left:0; border-left:1px solid var(--gold); border-top:1px solid var(--gold); }
  .sakura-page .cd-cell .corner.tr{ top:0; right:0; border-right:1px solid var(--gold); border-top:1px solid var(--gold); }
  .sakura-page .cd-cell .corner.bl{ bottom:0; left:0; border-left:1px solid var(--gold); border-bottom:1px solid var(--gold); }
  .sakura-page .cd-cell .corner.br{ bottom:0; right:0; border-right:1px solid var(--gold); border-bottom:1px solid var(--gold); }
  .sakura-page .cd-cell .jp{ position:absolute; top:.25rem; right:.5rem; font-family:var(--font-display); font-size:.75rem; color: oklch(0.58 0.16 70 / .8); }
  .sakura-page .cd-num{ font-family: var(--font-display); font-size: clamp(3rem,6vw,3.75rem); color: var(--ink); font-variant-numeric: lining-nums; line-height:1; }
  .sakura-page .cd-label{ margin-top:.25rem; font-size:.65rem; text-transform:uppercase; letter-spacing:.4em; color: var(--muted-foreground); }

  /* DETAILS */
  .sakura-page .details{ display:grid; gap:4rem; }
  @media(min-width:768px){ .sakura-page .details{ grid-template-columns: repeat(2,1fr); gap:5rem; } }
  .sakura-page .detail{ border-left:1px solid oklch(0.58 0.16 70 / .5); padding-left:2rem; }
  .sakura-page .detail .kicker{ display:block; }
  .sakura-page .detail h3{ margin-top:1rem; font-family: var(--font-display); font-size:1.875rem; color: var(--ink); font-weight:400; }
  .sakura-page .detail p{ margin-top:1rem; font-family: var(--font-serif); font-size:1rem; line-height:1.7; color: oklch(0.18 0.03 40 / .8); }
  .sakura-page .detail p .sub{ font-style:italic; color: var(--muted-foreground); }

  /* RSVP */
  .sakura-page form.rsvp{ margin:3.5rem auto 0; width:100%; max-width:36rem; display:flex; flex-direction:column; gap:1.75rem; text-align:left; }
  .sakura-page .rsvp label{ display:block; font-family: var(--font-display); font-size:.75rem; text-transform:uppercase; letter-spacing:.4em; color: var(--gold); margin-bottom:.25rem; }
  .sakura-page .field{
    width:100%; border:0; border-bottom:1px solid oklch(0.58 0.16 70 / .4);
    background:transparent; padding:.75rem .25rem; color: var(--ink);
    font-family: var(--font-serif); font-size:1.125rem;
    transition: border-color .3s ease; outline:none;
  }
  .sakura-page .field::placeholder{ color: oklch(0.45 0.04 50 / .7); }
  .sakura-page .field:focus{ border-color: var(--gold); }
  .sakura-page select.field{ appearance:none; }
  .sakura-page textarea.field{ resize:none; }
  .sakura-page .rsvp .two{ display:grid; gap:1.75rem; }
  @media(min-width:768px){ .sakura-page .rsvp .two{ grid-template-columns: repeat(2,1fr); } }
  .sakura-page .send-btn{
    display:inline-flex; align-items:center; gap:.75rem;
    border:1px solid var(--gold); background:transparent;
    padding:1rem 2.5rem; font-family: var(--font-display);
    font-size:.875rem; text-transform:uppercase; letter-spacing:.35em; color: var(--ink);
    cursor:pointer; transition: all .35s ease;
  }
  .sakura-page .send-btn:hover{ background: var(--gold); color: var(--primary-foreground); }
  .sakura-page .send-btn .jp{ font-family: var(--font-brush); font-size:1rem; text-transform:none; letter-spacing:0; }
  .sakura-page .send-btn:disabled{ opacity:.5; }

  .sakura-page footer{ position:relative; z-index:20; padding:5rem 1.5rem; text-align:center; }

  /* toast */
  #toast{
    position:fixed; left:50%; bottom:2rem; transform:translateX(-50%) translateY(20px);
    z-index:60; min-width:280px; max-width:90vw;
    background: var(--background); border:1px solid var(--gold); color: var(--ink);
    padding:1rem 1.25rem; font-family: var(--font-serif);
    box-shadow: 0 20px 50px -20px oklch(0.2 0.03 40 / .4);
    opacity:0; pointer-events:none; transition: opacity .4s ease, transform .4s ease;
  }
  #toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
  #toast .t-title{ font-family: var(--font-display); font-size:.95rem; letter-spacing:.06em; }
  #toast .t-desc{ margin-top:.25rem; font-style:italic; color: var(--muted-foreground); font-size:.95rem; }

  /* diffuse glow behind text — like the hero, no defined edge at all */
  /* oval frosted glow behind text — soft, no hard edge */
  .sakura-page .panel{
    position:relative; margin:0 auto; isolation:isolate;
    text-shadow: 0 1px 18px oklch(0.99 0.01 85 / 0.95), 0 0 38px oklch(0.99 0.01 85 / 0.8);
    padding: clamp(2.5rem, 6vw, 4.5rem) clamp(2rem, 6vw, 5rem);
  }
  .sakura-page .panel::before{
    content:""; position:absolute; inset:-8% -6%; z-index:-1; pointer-events:none;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.99 0.012 85 / 0.62) 0%, oklch(0.99 0.012 85 / 0.34) 38%, oklch(0.99 0.012 85 / 0.12) 62%, transparent 82%);
    backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px);
    transform: translateZ(0); will-change: backdrop-filter; backface-visibility: hidden;
    -webkit-mask: radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, rgba(0,0,0,0.5) 50%, transparent 82%);
            mask: radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, rgba(0,0,0,0.5) 50%, transparent 82%);
  }

  /* couple photo gallery */
  .sakura-page .photo-grid{ display:grid; grid-template-columns: repeat(3,1fr); gap:1.25rem; margin-top:3rem; }
  .sakura-page .photo{ display:block; width:100%; height:clamp(300px,32vw,420px); object-fit:cover; border:1px solid oklch(0.58 0.16 70 / .55); box-shadow:0 24px 50px -28px oklch(.2 .03 40 / .55); background: oklch(0.95 0.02 60); }
  .sakura-page .photo.mid{ transform:translateY(26px); }
  @media(max-width:768px){
    .sakura-page .photo-grid{ grid-template-columns:1fr; max-width:22rem; margin-left:auto; margin-right:auto; }
    .sakura-page .photo.mid{ transform:none; }
  }

  /* reveal (framer whileInView spring approximation) */
  .sakura-page .reveal{ opacity:0; transform:translateY(40px); transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  .sakura-page .reveal.in{ opacity:1; transform:translateY(0); }
  .sakura-page .stag > *{ opacity:0; transform:translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
  .sakura-page .stag.in > *{ opacity:1; transform:translateY(0); }
  .sakura-page .stag.in > *:nth-child(1){ transition-delay:.10s }
  .sakura-page .stag.in > *:nth-child(2){ transition-delay:.18s }
  .sakura-page .stag.in > *:nth-child(3){ transition-delay:.26s }
  .sakura-page .stag.in > *:nth-child(4){ transition-delay:.34s }
  .sakura-page .stag.in > *:nth-child(5){ transition-delay:.42s }

  /* ===== Added: hero entrance, photo reveal, rolling countdown, mobile polish ===== */
  @keyframes heroRise{ from{ opacity:0; translate:0 30px; } }
  .sakura-page .hero-inner > *{ animation: heroRise 1.1s cubic-bezier(.16,1,.3,1) backwards; }
  .sakura-page .hero-inner > *:nth-child(1){ animation-delay:.15s }
  .sakura-page .hero-inner > *:nth-child(2){ animation-delay:.32s }
  .sakura-page .hero-inner > *:nth-child(3){ animation-delay:.5s }
  .sakura-page .hero-inner > *:nth-child(4){ animation-delay:.66s }
  .sakura-page .hero-inner > *:nth-child(5){ animation-delay:.82s }
  @keyframes cueIn{ from{ opacity:0; } }
  .sakura-page .scroll-cue{ animation: floaty 2.4s ease-in-out infinite, cueIn 1s ease 1.25s backwards; }

  /* hero names: letters drift up one by one */
  .sakura-page .hero h1 .hl{ display:inline-block; animation:letterIn .95s cubic-bezier(.16,1,.3,1) calc(.45s + var(--i)*.07s) backwards; }
  @keyframes letterIn{ from{ opacity:0; translate:0 .55em; rotate:6deg; } }

  /* section headings: characters rise one by one when the section reveals */
  .sakura-page .section .w{ display:inline-block; white-space:nowrap; }
  .sakura-page .section .ch{ display:inline-block; }
  .sakura-page .reveal .section .ch{ opacity:0; translate:0 .6em; rotate:4deg;
    transition:opacity .6s cubic-bezier(.16,1,.3,1), translate .6s cubic-bezier(.16,1,.3,1), rotate .6s cubic-bezier(.16,1,.3,1);
    transition-delay:calc(.12s + var(--i)*.04s); }
  .sakura-page .reveal.in .section .ch{ opacity:1; translate:0 0; rotate:0deg; }

  /* panel content: staggered rise; kickers settle their letter-spacing */
  .sakura-page .reveal .panel > *{ opacity:0; translate:0 22px;
    transition:opacity .8s cubic-bezier(.16,1,.3,1), translate .8s cubic-bezier(.16,1,.3,1), letter-spacing 1.2s cubic-bezier(.16,1,.3,1); }
  .sakura-page .reveal.in .panel > *{ opacity:1; translate:0 0; }
  .sakura-page .reveal.in .panel > *:nth-child(2){ transition-delay:.1s }
  .sakura-page .reveal.in .panel > *:nth-child(3){ transition-delay:.2s }
  .sakura-page .reveal.in .panel > *:nth-child(4){ transition-delay:.3s }
  .sakura-page .reveal.in .panel > *:nth-child(5){ transition-delay:.4s }
  .sakura-page .reveal .panel > .kicker{ letter-spacing:.95em; }
  .sakura-page .reveal.in .panel > .kicker{ letter-spacing:.5em; }

  .sakura-page .reveal .photo{
    opacity:0; translate:0 36px; scale:1.06; clip-path:inset(0 0 56% 0);
    transition: opacity 1s cubic-bezier(.16,1,.3,1), translate 1s cubic-bezier(.16,1,.3,1),
      scale 1.25s cubic-bezier(.16,1,.3,1), clip-path 1.15s cubic-bezier(.16,1,.3,1);
  }
  .sakura-page .reveal.in .photo{ opacity:1; translate:0 0; scale:1; clip-path:inset(0 0 0% 0); }
  .sakura-page .reveal.in .photo:nth-child(2){ transition-delay:.16s; }
  .sakura-page .reveal.in .photo:nth-child(3){ transition-delay:.32s; }

  .sakura-page .cd-num{ display:inline-grid; overflow:hidden; justify-items:center; }
  .sakura-page .cd-num .roll{ grid-area:1/1; }
  .sakura-page .cd-num .roll.out{ animation: rollOut .5s cubic-bezier(.45,0,.55,1) forwards; }
  .sakura-page .cd-num .roll.in{ animation: rollIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes rollOut{ to{ translate:0 -85%; opacity:0; } }
  @keyframes rollIn{ from{ translate:0 85%; opacity:0; } }

  @media(prefers-reduced-motion:reduce){
    .sakura-page .hero-inner > *, .sakura-page .scroll-cue, .sakura-page .hero h1 .hl{ animation:none; }
    .sakura-page .reveal .photo{ opacity:1; translate:0 0; scale:1; clip-path:none; }
    .sakura-page .cd-num .roll.out, .sakura-page .cd-num .roll.in{ animation:none; }
    .sakura-page .reveal .section .ch{ opacity:1; translate:0 0; rotate:0deg; }
    .sakura-page .reveal .panel > *{ opacity:1; translate:0 0; }
    .sakura-page .reveal .panel > .kicker{ letter-spacing:.5em; }
  }

  @media(max-width:520px){
    .sakura-page .wrap{ padding:5.5rem 1.25rem; }
    .sakura-page .panel{ padding:2.4rem 1.4rem; }
    .sakura-page .hero h1{ font-size:clamp(2.8rem,15vw,3.75rem); }
    .sakura-page .hero h1 .amp{ margin:0 .8rem; }
    .sakura-page .eyebrow{ letter-spacing:.42em; }
    .sakura-page .hero .when{ letter-spacing:.28em; }
    .sakura-page .photo{ height:min(78vw,380px); }
    .sakura-page .lede{ font-size:1.05rem; line-height:1.7; }
  }
`

export default function SakuraWeddingPage() {
  const rootRef = useRef(null)

  useEffect(() => {
    const ac = new AbortController()
    const { signal } = ac
    let alive = true
    const timers = []

    /* =====================================================================
       SakuraCanvas — ported from src/components/SakuraCanvas.tsx
       Tree is an uploaded watercolor image; petals are physics-driven.
       ===================================================================== */
    const canvas = document.getElementById('bg')
    const ctx = canvas.getContext('2d')
    const mouse = { x: 0.5, y: 0.5 }
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0
    const petals = []

    const treeImg = new Image()
    treeImg.src = sakuraTree
    let treeReady = false
    treeImg.onload = () => { treeReady = true }

    function spawnPetal(initial) {
      const depth = 0.3 + Math.random() * 0.7
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -20 - Math.random() * 100,
        vx: (Math.random() - 0.3) * 0.4,
        vy: 0.3 + Math.random() * 0.8,
        size: (5 + Math.random() * 7) * depth,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.04,
        opacity: 0.55 + Math.random() * 0.45,
        depth,
        hue: 350 + Math.random() * 18,
        upGust: 0,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.5 + Math.random() * 1.2,
      }
    }
    function buildPetals() {
      petals.length = 0
      const count = Math.floor((W * H) / 14000) + 80
      for (let i = 0; i < count; i++) petals.push(spawnPetal(true))
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; H = window.innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildPetals()
    }

    function drawPetal(x, y, size, rot, hue, opacity) {
      ctx.save()
      ctx.translate(x, y); ctx.rotate(rot)
      ctx.globalAlpha = opacity
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
      grd.addColorStop(0, `hsla(${hue}, 85%, 92%, 1)`)
      grd.addColorStop(0.7, `hsla(${hue}, 75%, 80%, 1)`)
      grd.addColorStop(1, `hsla(${hue - 8}, 65%, 70%, 0.7)`)
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.moveTo(0, -size)
      ctx.bezierCurveTo(size * 0.9, -size * 0.5, size * 0.5, size * 0.6, 0, size)
      ctx.bezierCurveTo(-size * 0.5, size * 0.6, -size * 0.9, -size * 0.5, 0, -size)
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.ellipse(0, size * 0.85, size * 0.25, size * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawTree(t) {
      if (!treeReady) return
      const reveal = Math.min(1, t / 1.4)
      const iw = treeImg.naturalWidth, ih = treeImg.naturalHeight
      const scale = Math.max((W * 0.7) / iw, H / ih)
      const dw = iw * scale, dh = ih * scale
      const dx = -dw * 0.04, dy = 0
      ctx.save()
      ctx.globalAlpha = reveal
      ctx.drawImage(treeImg, dx, dy, dw, dh)
      ctx.restore()
    }

    let start = performance.now()
    let lastT = start
    let gustTimer = 0, gustStrength = 0

    function updateAndDraw(p, dt, t) {
      const windMouse = (mouse.x - 0.5) * 1.4
      const sway = Math.sin(t * p.swaySpeed + p.swayPhase) * 0.6
      p.x += (p.vx + sway * 0.4 + windMouse * p.depth + gustStrength * 0.3 * p.depth) * 60 * dt
      if (p.upGust > 0) {
        p.y -= (40 + Math.random() * 30) * dt * p.depth
        p.upGust -= dt
      } else {
        p.y += p.vy * 60 * dt * p.depth
      }
      p.rot += p.vr + sway * 0.02
      if (p.y > H + 30 || p.x < -40 || p.x > W + 40) {
        Object.assign(p, spawnPetal(false))
        p.x = Math.random() * W
      }
      drawPetal(p.x, p.y, p.size, p.rot, p.hue, p.opacity * (0.5 + p.depth * 0.5))
    }

    function frame(now) {
      if (!alive) return
      const t = (now - start) / 1000
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now
      ctx.clearRect(0, 0, W, H)
      for (const p of petals) if (p.depth < 0.5) updateAndDraw(p, dt, t)
      drawTree(t)
      for (const p of petals) if (p.depth >= 0.5) updateAndDraw(p, dt, t)
      gustTimer -= dt
      if (gustTimer <= 0) {
        gustTimer = 6 + Math.random() * 8
        gustStrength = (Math.random() - 0.4) * 2.2
        if (Math.random() > 0.4) {
          const n = Math.floor(petals.length * 0.15)
          for (let i = 0; i < n; i++) {
            const p = petals[Math.floor(Math.random() * petals.length)]
            p.upGust = 1.2 + Math.random() * 1.5
          }
        }
      }
      requestAnimationFrame(frame)
    }

    window.addEventListener('resize', resize, { signal })
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }, { signal })
    resize()
    requestAnimationFrame(frame)

    /* =====================================================================
       Scroll-driven background gradient (dawn → ivory → golden dusk)
       ===================================================================== */
    const bgEl = document.getElementById('bgGradient')
    // [topL,topC,topH, botL,botC,botH] for three keyframes at 0, 0.45, 1
    const KF = [
      [0.94, 0.045, 20, 0.96, 0.03, 60],
      [0.97, 0.02, 80, 0.95, 0.035, 70],
      [0.88, 0.09, 65, 0.72, 0.13, 45],
    ]
    const stops = [0, 0.45, 1]
    function lerp(a, b, t) { return a + (b - a) * t }
    function mix(p) {
      let i = 0
      while (i < stops.length - 2 && p > stops[i + 1]) i++
      const t = (p - stops[i]) / (stops[i + 1] - stops[i])
      const a = KF[i], b = KF[i + 1]
      const v = a.map((x, k) => lerp(x, b[k], Math.max(0, Math.min(1, t))))
      return `linear-gradient(180deg, oklch(${v[0].toFixed(3)} ${v[1].toFixed(3)} ${v[2].toFixed(1)}) 0%, oklch(${v[3].toFixed(3)} ${v[4].toFixed(3)} ${v[5].toFixed(1)}) 100%)`
    }
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      bgEl.style.background = mix(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true, signal })
    window.addEventListener('resize', onScroll, { signal })
    onScroll()

    /* =====================================================================
       Countdown — ported from Countdown.tsx (digits roll on change)
       ===================================================================== */
    // Original target was 2026-04-12; kept the date, advanced the year so the
    // countdown stays live. Change freely.
    const TARGET = new Date('2027-04-12T16:00:00+09:00').getTime()
    const d = document.getElementById('cd-d'), h = document.getElementById('cd-h'),
      m = document.getElementById('cd-m'), s = document.getElementById('cd-s')
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
      roll(d, pad(Math.floor(diff / 86400000)))
      roll(h, pad(Math.floor((diff % 86400000) / 3600000)))
      roll(m, pad(Math.floor((diff % 3600000) / 60000)))
      roll(s, pad(Math.floor((diff % 60000) / 1000)))
    }
    tick(); timers.push(setInterval(tick, 1000))

    /* =====================================================================
       Scroll reveals (framer whileInView) + RSVP form
       ===================================================================== */
    // Split section headings into characters so they can rise one by one
    document.querySelectorAll('.sakura-page h2.section').forEach((heading) => {
      if (heading.dataset.split) return
      heading.dataset.split = '1'
      heading.setAttribute('aria-label', heading.textContent)
      let index = 0
      heading.innerHTML = heading.textContent
        .split(' ')
        .map((word) =>
          '<span class="w" aria-hidden="true">' +
          [...word].map((c) => `<span class="ch" style="--i:${index++}">${c}</span>`).join('') +
          '</span>',
        )
        .join(' ')
    })

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }
    }, { threshold: 0.25 })
    document.querySelectorAll('.sakura-page .reveal, .sakura-page .stag').forEach((el) => io.observe(el))

    const form = document.getElementById('rsvpForm')
    const toast = document.getElementById('toast')
    const btn = form.querySelector('.send-btn')
    const btnLabel = form.querySelector('.btn-label')
    let toastTimer = 0
    form.addEventListener('submit', (e) => {
      e.preventDefault()
      const name = new FormData(form).get('name') || 'friend'
      btn.disabled = true; btnLabel.textContent = 'Sending…'
      setTimeout(() => {
        if (!alive) return
        btn.disabled = false; btnLabel.textContent = 'Send Reply'
        toast.querySelector('.t-title').textContent = 'ありがとう — your reply has been received'
        toast.querySelector('.t-desc').textContent = `We can't wait to celebrate with you, ${name}.`
        toast.classList.add('show')
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => toast.classList.remove('show'), 5000)
        form.reset()
      }, 900)
    }, { signal })

    return () => {
      alive = false
      ac.abort()
      io.disconnect()
      timers.forEach(clearInterval)
      clearTimeout(toastTimer)
    }
  }, [])

  return (
    <div ref={rootRef} className="sakura-page">
      <title>Hiro &amp; Aiko — A Sakura Wedding</title>
      <meta name="description" content="Join us beneath the cherry blossoms — an invitation to the wedding of Hiro & Aiko." />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Shippori+Mincho:wght@400;500;700&family=Yuji+Syuku&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <style>{css}</style>

      <div id="bgGradient"></div>
      <div id="vignette"></div>
      <canvas id="bg" aria-hidden="true"></canvas>

      <main>
        {/* HERO */}
        <section className="hero" data-screen-label="01 Hero">
          <div className="hero-inner">
            <p className="eyebrow">· 結 婚 式 ·</p>
            <h1 className="font-display" aria-label="Hiro & Aiko">
              {'Hiro'.split('').map((c, i) => (
                <span key={`h${i}`} className="hl" aria-hidden="true" style={{ '--i': i }}>{c}</span>
              ))}
              <span className="amp hl" aria-hidden="true" style={{ '--i': 4 }}>&amp;</span>
              {'Aiko'.split('').map((c, i) => (
                <span key={`a${i}`} className="hl" aria-hidden="true" style={{ '--i': i + 5 }}>{c}</span>
              ))}
            </h1>
            <div className="ink-divider" style={{ maxWidth: '18rem', margin: '0 auto' }}></div>
            <p className="poem">Beneath a thousand falling blossoms,<br />two paths become one.</p>
            <p className="when">12 · APRIL · 2026 &nbsp;·&nbsp; KYOTO</p>
          </div>
          <div className="scroll-cue font-display">scroll · 下へ</div>
        </section>

        {/* INVITATION */}
        <section className="wrap center reveal" data-screen-label="02 Invitation">
          <div className="panel">
            <p className="kicker">ご 招 待</p>
            <h2 className="section">An Invitation</h2>
            <div className="ink-divider divider-sm"></div>
            <p className="lede">
              With the warmth of the season and the blessing of our families, we invite you
              to witness the joining of our lives. Come walk with us beneath the cherry trees,
              share in our vows, and stay for the sake, the laughter, and the long evening.
            </p>
          </div>
        </section>

        {/* COUNTDOWN */}
        <section className="wrap center reveal" data-screen-label="03 Countdown">
          <div className="panel">
            <p className="kicker">残 り 時 間</p>
            <h2 className="section">Until the Blossoms Fall</h2>
            <div className="ink-divider divider-sm"></div>
            <div className="cd-grid" id="cd">
              <div className="cd-cell-wrap"><div className="cd-cell"><span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span><span className="jp">日</span><span className="cd-num" id="cd-d">00</span><span className="cd-label">Days</span></div></div>
              <div className="cd-cell-wrap"><div className="cd-cell"><span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span><span className="jp">時</span><span className="cd-num" id="cd-h">00</span><span className="cd-label">Hours</span></div></div>
              <div className="cd-cell-wrap"><div className="cd-cell"><span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span><span className="jp">分</span><span className="cd-num" id="cd-m">00</span><span className="cd-label">Minutes</span></div></div>
              <div className="cd-cell-wrap"><div className="cd-cell"><span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span><span className="jp">秒</span><span className="cd-num" id="cd-s">00</span><span className="cd-label">Seconds</span></div></div>
            </div>
          </div>
        </section>

        {/* PHOTOS */}
        <section className="wrap center reveal" data-screen-label="04 Our Story">
          <div className="panel">
            <p className="kicker">思 い 出</p>
            <h2 className="section">The Two of Us</h2>
            <div className="ink-divider divider-sm"></div>
            <div className="photo-grid">
              {/* Kendi fotoğrafını eklemek için src="..." değerini değiştir */}
              <img className="photo" src={couple1} alt="" />
              <img className="photo mid" src={couple2} alt="" />
              <img className="photo" src={couple3} alt="" />
            </div>
          </div>
        </section>

        {/* DETAILS */}
        <section className="wrap reveal" data-screen-label="05 Details">
          <div className="panel">
            <div className="details stag">
              <div className="detail">
                <span className="kicker">式 · CEREMONY</span>
                <h3>Heian Shrine</h3>
                <p>平安神宮 · Sakyō-ku, Kyoto<br />Four o'clock in the afternoon<br /><span className="sub">arrive in soft colors</span></p>
              </div>
              <div className="detail">
                <span className="kicker">宴 · RECEPTION</span>
                <h3>Murin-an Garden</h3>
                <p>無鄰菴 · a lantern-lit kaiseki dinner<br />Following the ceremony<br /><span className="sub">dancing under the moon to follow</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* RSVP */}
        <section className="wrap center reveal" id="rsvp" data-screen-label="06 RSVP">
          <div className="panel">
            <p className="kicker">お 返 事</p>
            <h2 className="section">Reply by the First Bloom</h2>
            <p className="lede" style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>kindly respond before March 1st, 2026</p>
            <div className="ink-divider divider-sm"></div>

            <form className="rsvp stag" id="rsvpForm">
              <div>
                <label>Your Name · 御名前</label>
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
                  <label>Meal Preference</label>
                  <select className="field" name="meal" defaultValue="">
                    <option value="">— select —</option>
                    <option>Kaiseki (omnivore)</option>
                    <option>Shōjin ryōri (vegetarian)</option>
                    <option>Vegan</option>
                    <option>Pescatarian</option>
                  </select>
                </div>
              </div>
              <div>
                <label>A message for the couple</label>
                <textarea className="field" name="message" rows={4} placeholder="A wish, a memory, a verse…"></textarea>
              </div>
              <div style={{ paddingTop: '.5rem' }}>
                <button type="submit" className="send-btn"><span className="btn-label">Send Reply</span><span className="jp">送る</span></button>
              </div>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="ink-divider" style={{ maxWidth: '4rem', margin: '0 auto' }}></div>
          <p className="kicker" style={{ marginTop: '2rem' }}>H · &amp; · A</p>
          <p className="lede" style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--muted-foreground)', fontSize: '.95rem' }}>“The cherry blossoms remind us — beauty lives in the brief.”</p>
        </footer>
      </main>

      <div id="toast"><div className="t-title"></div><div className="t-desc"></div></div>
    </div>
  )
}
