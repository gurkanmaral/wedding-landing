import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import illoDance from "./assets/illo-dance.png";
import illoTram from "./assets/illo-tram.png";
import illoTable from "./assets/illo-table.png";
import illoMasseria from "./assets/illo-masseria.png";
import illoSun from "./assets/illo-sun.png";
import illoWine from "./assets/illo-wine.png";
import illoEnvelope from "./assets/illo-envelope.png";
import illoMoon from "./assets/illo-moon.png";
import branch from "./assets/story-branch.png";

gsap.registerPlugin(ScrollTrigger);

// Saturday 12 June 2027, ceremony at 17:00 Puglia time (CEST).
const TARGET_DATE = new Date("2027-06-12T17:00:00+02:00").getTime();

const CHAPTERS = [
  { id: "01", label: "Hello" },
  { id: "02", label: "Us" },
  { id: "03", label: "When" },
  { id: "04", label: "Day" },
  { id: "05", label: "Place" },
  { id: "06", label: "RSVP" },
];

const PROGRAMME = [
  { t: "16:30", h: "Arrival", d: "Chilled vermouth on the terrace.", i: illoSun },
  { t: "17:00", h: "Ceremony", d: "In the olive grove. We’ll try not to cry.", i: illoDance },
  { t: "18:00", h: "Aperitivo", d: "Focaccia, oysters, a string quartet from Bari.", i: illoWine },
  { t: "20:00", h: "Dinner", d: "A long, loud, family-style table under strings of lights.", i: illoTable },
  { t: "22:00", h: "Dancing", d: "DJ Rosa from midnight onward. Bring second shoes.", i: illoMoon },
  { t: "02:00", h: "Late night", d: "Espresso, gelato, and a bonfire on the beach.", i: illoEnvelope },
];

// Component-scoped CSS (the theme file is owned elsewhere).
const STYLES = `
.theme-gilded-rome a:focus-visible,
.theme-gilded-rome button:focus-visible,
.theme-gilded-rome input:focus-visible,
.theme-gilded-rome textarea:focus-visible {
  outline: 2px solid var(--color-tomato);
  outline-offset: 3px;
}
.theme-gilded-rome label:has(> input[type="radio"]:focus-visible) {
  outline: 2px solid var(--color-tomato);
  outline-offset: 2px;
}
@media (min-width: 1024px) {
  .theme-gilded-rome .sb-wide.container-x { max-width: 54rem; }
}
`;

function getCountdown() {
  const diff = Math.max(0, TARGET_DATE - Date.now());
  return {
    dd: Math.floor(diff / 86400000),
    hh: Math.floor((diff % 86400000) / 3600000),
    mm: Math.floor((diff % 3600000) / 60000),
    ss: Math.floor((diff % 60000) / 1000),
  };
}

export default function GildedRomeTemplatePage() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [d, setD] = useState(getCountdown);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setD(getCountdown()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // Chapter tracking works regardless of motion preference.
      gsap.utils.toArray("[data-chapter]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      // Reduced motion: nothing is hidden or tweened, content is simply there.
      if (reduceMotion) return;

      // clamp() keeps starts reachable near the page end; once:true never re-hides.
      // toggleActions also plays on leave: a fast scroll can jump past the whole trigger in one frame.
      const reveal = (trigger, start) => ({ trigger, start: `clamp(${start})`, once: true, toggleActions: 'play play none none' });
      const isSwaying = (el) => el.classList.contains("sway");

      // Hero entrance starts immediately (shared envelope intro plays before mount).
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-letter", { yPercent: 110, opacity: 0, stagger: 0.04, duration: 1.1 }, 0.05)
        .from(
          ".hero-illo",
          { opacity: 0, scale: 0.6, rotate: (_, el) => (isSwaying(el) ? 0 : -12), duration: 1.3, ease: "back.out(1.6)" },
          0.2,
        )
        .from(".hero-meta", { opacity: 0, y: 20, duration: 0.9, ease: "power2.out" }, 0.55);

      gsap.utils.toArray(".rise").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: reveal(el, "top 88%"),
        });
      });

      // Illustrations pop in with a wiggle (swaying ones keep their rotation for the sway loop).
      gsap.utils.toArray(".pop-illo").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          scale: 0.5,
          rotate: isSwaying(el) ? 0 : gsap.utils.random(-15, 15),
          duration: 1.1,
          ease: "back.out(2)",
          scrollTrigger: reveal(el, "top 85%"),
        });
      });

      // Infinite loops only tick while their section is on screen.
      const loopWhileVisible = (el, vars) => {
        const tween = gsap.to(el, { ...vars, paused: true });
        const scope = el.closest("header");
        if (scope) {
          tween.play();
          return;
        }
        ScrollTrigger.create({
          trigger: el.closest("section, footer, .sb-ticker") || el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
        });
      };

      gsap.utils.toArray(".sway").forEach((el, i) => {
        loopWhileVisible(el, {
          rotate: i % 2 === 0 ? 6 : -6,
          duration: 3 + (i % 3),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });
      gsap.utils.toArray(".ticker").forEach((el) =>
        loopWhileVisible(el, { xPercent: -50, duration: 35, ease: "none", repeat: -1 }),
      );
      gsap.utils.toArray(".spin-slow").forEach((el) =>
        loopWhileVisible(el, { rotation: 360, duration: 60, ease: "none", repeat: -1 }),
      );
      gsap.utils.toArray(".spin-sun").forEach((el) =>
        loopWhileVisible(el, { rotation: 360, duration: 40, ease: "none", repeat: -1 }),
      );
    }, rootEl);

    // Late-loading images / fonts shift layout; keep trigger positions accurate.
    let refreshTimer = 0;
    const scheduleRefresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    scheduleRefresh();
    const ro = new ResizeObserver(scheduleRefresh);
    ro.observe(rootEl);
    window.addEventListener("load", scheduleRefresh);

    return () => {
      clearTimeout(refreshTimer);
      ro.disconnect();
      window.removeEventListener("load", scheduleRefresh);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className="theme-gilded-rome relative min-h-screen bg-background text-foreground overflow-x-clip">
      <style>{STYLES}</style>

      {/* Fixed top chrome */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/85 backdrop-blur-md border-b border-ink/10">
        <div className="mx-auto w-full max-w-[84rem] px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-4 py-1">
          <a
            href="#c01"
            className="inline-flex min-h-11 items-center gap-2 font-display italic text-lg tracking-tight"
            aria-label="Sofia and Luca — back to top"
          >
            <img src={illoSun} alt="" aria-hidden="true" className="w-6 h-6 spin-sun" />
            S<span className="text-tomato">&amp;</span>L
          </a>
          <div aria-hidden="true" className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-right">
            {String(active + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} — {CHAPTERS[active].label}
          </div>
        </div>
        <div aria-hidden="true" className="h-[2px] bg-ink/10">
          <div
            className="h-full bg-tomato transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Fixed right chapter dots (desktop) */}
      <nav aria-label="Chapters" className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col">
        {CHAPTERS.map((c, i) => (
          <a
            key={c.id}
            href={`#c${c.id}`}
            className="group flex h-11 items-center gap-3 justify-end px-2"
            aria-label={`Chapter ${c.id}: ${c.label}`}
            aria-current={active === i ? "true" : undefined}
          >
            <span
              aria-hidden="true"
              className={`font-mono text-[10px] uppercase tracking-widest transition-opacity ${
                active === i
                  ? "opacity-100 text-tomato"
                  : "opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70 text-ink"
              }`}
            >
              {c.label}
            </span>
            <span
              aria-hidden="true"
              className={`h-px transition-[color,background-color,border-color,gap] ${active === i ? "w-10 bg-tomato" : "w-4 bg-ink/40 group-hover:w-6"}`}
            />
          </a>
        ))}
      </nav>

      <main>
        {/* ============= CH 01 · HELLO ============= */}
        <section id="c01" data-chapter aria-label="Hello" className="relative overflow-hidden">
          {/* floating decorative illos */}
          <img
            src={illoSun}
            alt=""
            aria-hidden="true"
            className="hero-illo sway absolute top-20 -right-6 w-28 md:w-40 lg:w-48 lg:right-[2vw] opacity-90 pointer-events-none"
          />
          <img
            src={illoMoon}
            alt=""
            aria-hidden="true"
            className="hero-illo sway absolute bottom-28 -left-4 w-24 md:w-36 lg:bottom-14 lg:left-[44%] lg:w-28 opacity-80 pointer-events-none"
          />

          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[84rem] flex-col justify-between gap-6 px-5 pt-24 pb-24 sm:px-8 md:pb-10 lg:px-12 lg:pr-28">
            <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground flex items-center gap-2">
              <span aria-hidden="true" className="text-tomato">●</span> Ch. 01 — Ciao!
            </div>

            <div className="grid flex-1 content-center items-center gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="min-w-0 lg:col-start-1 lg:row-start-1 lg:self-end">
                <p className="font-hand inline-block text-2xl md:text-3xl leading-tight text-tomato -rotate-2 mb-3">
                  you&rsquo;re invited to
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
                  the very sunny wedding of
                </p>
                <h1
                  aria-label="Sofia & Luca"
                  className="font-display text-[clamp(3.5rem,22vw,9rem)] lg:text-[clamp(6rem,9vw,10.5rem)] leading-[0.85] tracking-tight"
                >
                  <span aria-hidden="true" className="block overflow-hidden pb-[0.04em]">
                    {"Sofia".split("").map((c, i) => (
                      <span key={`s${i}`} className="hero-letter inline-block">{c}</span>
                    ))}
                  </span>
                  <span aria-hidden="true" className="block overflow-hidden pb-[0.04em] pr-[0.08em] italic text-tomato font-light">
                    {"& Luca".split("").map((c, i) => (
                      <span key={`l${i}`} className="hero-letter inline-block">{c === " " ? " " : c}</span>
                    ))}
                  </span>
                </h1>
              </div>

              <img
                src={illoDance}
                alt="Sofia and Luca dancing under olive branches"
                className="hero-illo mx-auto w-[min(78%,22rem)] md:w-[min(60%,26rem)] lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:w-full lg:max-w-[36rem] lg:self-center"
                width={1024}
                height={1024}
              />

              <dl className="hero-meta grid max-w-xl grid-cols-3 gap-3 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] lg:col-start-1 lg:row-start-2 lg:self-start">
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="mt-1">Sat 12.06.2027</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Place</dt>
                  <dd className="mt-1">Puglia, IT</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Dress</dt>
                  <dd className="mt-1">Sun-ready</dd>
                </div>
              </dl>
            </div>

            <div className="hero-meta flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              <span>Scroll ↓ to read</span>
              <span>Vol. 01 · Issue 01</span>
            </div>
          </div>
        </section>

        {/* Ticker with illustrations */}
        <div aria-hidden="true" className="sb-ticker border-y border-ink/15 bg-ink text-cream py-4 overflow-hidden">
          <div className="ticker flex w-max gap-6 whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] items-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 shrink-0">
                <span>Save the date</span>
                <img src={illoSun} alt="" className="w-8 h-8 shrink-0" />
                <span>12 · 06 · 2027</span>
                <img src={illoWine} alt="" className="w-8 h-8 shrink-0 invert" />
                <span>Masseria del Sole</span>
                <img src={illoMoon} alt="" className="w-8 h-8 shrink-0 invert" />
                <span>Puglia</span>
                <span className="text-tomato">✦</span>
              </div>
            ))}
          </div>
        </div>

        {/* ============= CH 02 · US ============= */}
        <section id="c02" data-chapter className="relative py-20 md:py-28 overflow-hidden">
          <img
            src={illoTram}
            alt=""
            aria-hidden="true"
            className="pop-illo absolute right-2 top-10 w-28 md:w-52 opacity-90 pointer-events-none"
            width={1024}
            height={1024}
          />

          <div className="sb-wide container-x relative">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">Ch. 02 · How it started</div>
            <h2 className="rise font-display text-4xl md:text-6xl leading-[0.95] mb-2 text-balance max-w-[80%]">
              Two strangers, one rainy tram,
              <span className="italic text-tomato"> and a very bad umbrella.</span>
            </h2>
            <p className="rise font-hand inline-block text-3xl text-tomato -rotate-1 mb-8">— Milano, 2019 —</p>

            <div className="rise relative bg-cream-2 border-2 border-ink p-6 md:p-8 max-w-xl shadow-[6px_6px_0_0_var(--ink)]">
              <img
                src={illoEnvelope}
                alt=""
                aria-hidden="true"
                className="sway absolute -top-8 -right-3 md:-right-8 w-16 md:w-20 pointer-events-none"
                width={1024}
                height={1024}
              />
              <p className="text-base md:text-lg leading-relaxed">
                <span className="float-left font-display text-6xl leading-[0.8] mr-2 mt-1 text-tomato">S</span>
                even years ago we shared an umbrella that broke halfway home. We
                argued about who spilled the espresso, then laughed until the tram
                doors opened. Since then: three cities, one very small apartment,
                and a mutual agreement that pineapple does not belong on pizza.
              </p>
            </div>

            {/* Timeline of us with illos */}
            <div className="rise mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { i: illoTram, y: "2019", t: "The tram", d: "A shared umbrella. A ruined coffee." },
                { i: illoTable, y: "2022", t: "The table", d: "Sunday dinners became a habit." },
                { i: illoDance, y: "2025", t: "The yes", d: "In a kitchen. With flour on our hands." },
              ].map((x) => (
                <div key={x.y} className="pop-illo text-center">
                  <div className="aspect-square max-w-xs mx-auto bg-cream-2 border-2 border-ink flex items-center justify-center p-4 shadow-[4px_4px_0_0_var(--tomato)]">
                    <img src={x.i} alt="" aria-hidden="true" className="max-h-full w-auto object-contain" loading="lazy" width={1024} height={1024} />
                  </div>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-tomato">{x.y}</div>
                  <h3 className="font-display text-2xl mt-1">{x.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
                </div>
              ))}
            </div>

            <p className="rise mt-10 font-hand text-2xl md:text-3xl text-ink flex items-center gap-3 -rotate-1 w-fit max-w-full">
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-tomato" /> and now — we&rsquo;d love you there for the next page.
            </p>
          </div>
        </section>

        {/* ============= CH 03 · WHEN ============= */}
        <section id="c03" data-chapter className="relative bg-ink text-cream py-20 md:py-28 overflow-hidden">
          <img src={illoSun} alt="" aria-hidden="true" className="spin-sun absolute -left-16 top-10 w-56 opacity-70" width={1024} height={1024} />
          <img src={illoMoon} alt="" aria-hidden="true" className="sway absolute right-4 bottom-16 w-24 md:w-32 invert opacity-80" width={1024} height={1024} />
          <img src={branch} alt="" aria-hidden="true" className="spin-slow absolute -right-20 top-24 w-64 opacity-20 invert" />

          <div className="sb-wide container-x relative">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">Ch. 03 · The date</div>

            <div className="rise flex items-baseline gap-4 mb-2">
              <span aria-hidden="true" className="font-display text-[clamp(6rem,28vw,14rem)] leading-[0.8] italic">12</span>
              <div aria-hidden="true" className="font-mono text-xs uppercase tracking-[0.3em] pb-4">
                <div>Sat</div>
                <div className="text-tomato">June</div>
                <div>2027</div>
              </div>
              <span className="sr-only">Saturday 12 June 2027</span>
            </div>

            <p className="rise font-hand text-3xl md:text-5xl italic max-w-md text-cream/90 mb-10 leading-tight">
              Ceremony at five,<br />
              dinner under the fig trees,<br />
              dancing until the sun forgets<br />
              what time it is.
            </p>

            <div role="timer" aria-label="Countdown to Saturday 12 June 2027" className="rise grid grid-cols-4 gap-2 max-w-md">
              {[
                { v: d.dd, l: "Days" },
                { v: d.hh, l: "Hrs" },
                { v: d.mm, l: "Min" },
                { v: d.ss, l: "Sec" },
              ].map((t) => (
                <div key={t.l} className="min-w-0 border border-cream/25 px-2 py-3 md:p-4 bg-ink/50 backdrop-blur">
                  <div className="font-display text-[clamp(1.5rem,7vw,3rem)] leading-tight tabular-nums">
                    {String(t.v).padStart(2, "0")}
                  </div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/75">{t.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============= CH 04 · PROGRAM ============= */}
        <section id="c04" data-chapter className="relative py-20 md:py-28 overflow-hidden">
          <img
            src={illoWine}
            alt=""
            aria-hidden="true"
            className="pop-illo sway absolute right-0 top-32 w-24 md:w-40 opacity-95 pointer-events-none"
            width={1024}
            height={1024}
          />

          <div className="sb-wide container-x relative">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">Ch. 04 · The programme</div>
            <h2 className="rise font-display text-4xl md:text-5xl mb-2 max-w-[80%]">
              A day in <span className="italic text-tomato">six acts.</span>
            </h2>
            <p className="rise font-hand inline-block text-2xl text-muted-foreground -rotate-1 mb-10">
              show up hungry <span aria-hidden="true">✿</span>
            </p>

            <ol className="space-y-0">
              {PROGRAMME.map((row, i) => (
                <li
                  key={row.t}
                  className="rise grid grid-cols-[44px_44px_minmax(0,1fr)] sm:grid-cols-[56px_48px_minmax(0,1fr)] gap-3 items-center py-5 border-t border-ink/15 last:border-b"
                >
                  <div className="font-mono text-xs md:text-sm">{row.t}</div>
                  <img src={row.i} alt="" aria-hidden="true" className="w-11 h-11 sm:w-12 sm:h-12 object-contain sway" loading="lazy" width={1024} height={1024} />
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl">
                      <span aria-hidden="true" className="text-muted-foreground text-sm font-mono align-top mr-2">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {row.h}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{row.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="rise mt-8 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
              <li className="border-2 border-ink px-3 py-1 bg-cream-2">Dress · Sun-ready</li>
              <li className="border-2 border-ink px-3 py-1 bg-cream-2">Kids · welcome</li>
              <li className="border-2 border-ink px-3 py-1 bg-cream-2">Vegan · yes</li>
            </ul>
          </div>
        </section>

        {/* ============= CH 05 · PLACE ============= */}
        <section id="c05" data-chapter className="relative py-20 md:py-28 bg-cream-2 overflow-hidden">
          <div className="sb-wide container-x relative">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">Ch. 05 · The place</div>
            <h2 className="rise font-display text-4xl md:text-5xl mb-2">Masseria del Sole</h2>
            <p className="rise font-hand inline-block text-2xl text-tomato -rotate-1 mb-6">between olive trees and the sea</p>

            <img
              src={illoMasseria}
              alt="Illustration of a stone farmhouse among olive trees in Puglia"
              className="pop-illo w-full max-w-lg mx-auto my-6"
              loading="lazy"
              width={1024}
              height={1024}
            />

            <p className="rise text-muted-foreground max-w-prose mb-6 mx-auto text-center md:text-left">
              A 17th-century stone farmhouse tucked between olive groves and the
              Adriatic. Bring flat shoes for the gravel path — and a jumper for
              after sundown.
            </p>

            <div className="rise ink-border overflow-hidden aspect-square md:aspect-[16/9] shadow-[6px_6px_0_0_var(--tomato)]">
              <iframe
                title="Map of Masseria del Sole near Ostuni, Puglia"
                src="https://www.google.com/maps?q=Ostuni+Puglia+Italy&output=embed"
                className="block w-full h-full border-0 grayscale contrast-110"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="rise mt-4 grid grid-cols-2 gap-3">
              <a
                href="https://maps.google.com/?q=Ostuni+Puglia"
                target="_blank"
                rel="noreferrer"
                className="ink-border bg-ink text-cream flex min-h-11 items-center justify-center px-2 py-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] shadow-[4px_4px_0_0_var(--tomato)]"
              >
                Open in Maps <span aria-hidden="true">&nbsp;↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href="#c06"
                className="ink-border bg-tomato text-cream flex min-h-11 items-center justify-center px-2 py-3 text-center font-mono text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] shadow-[4px_4px_0_0_var(--ink)]"
              >
                I&rsquo;ll be there <span aria-hidden="true">&nbsp;→</span>
              </a>
            </div>

            <dl className="rise mt-8 grid grid-cols-2 gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <div>
                <dt className="text-ink">Nearest airport</dt>
                <dd className="mt-1">Brindisi (BDS) · 35 min</dd>
              </div>
              <div>
                <dt className="text-ink">Stay</dt>
                <dd className="mt-1">Rooms held under &ldquo;S+L&rdquo;</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ============= CH 06 · RSVP ============= */}
        <section id="c06" data-chapter className="relative py-20 md:py-28 overflow-hidden">
          <img
            src={illoEnvelope}
            alt=""
            aria-hidden="true"
            className="pop-illo sway absolute -right-6 top-24 w-32 md:w-56 pointer-events-none"
            width={1024}
            height={1024}
          />

          <div className="sb-wide container-x relative">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">Ch. 06 · Kindly reply</div>
            <h2 className="rise font-display text-4xl md:text-5xl mb-3 max-w-[80%]">
              Will you write the next page <span className="italic text-tomato">with us?</span>
            </h2>
            <p className="rise font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
              Please reply by · Saturday 1 May 2027
            </p>

            {sent ? (
              <div role="status" className="rise bg-cream-2 border-2 border-ink p-6 md:p-8 shadow-[6px_6px_0_0_var(--tomato)] text-center">
                <p className="font-display italic text-4xl text-tomato">Grazie!</p>
                <p className="mt-2 text-muted-foreground">Your reply has been sent. See you in the sun.</p>
              </div>
            ) : (
              <form
                className="rise space-y-4 bg-cream-2 border-2 border-ink p-5 md:p-8 shadow-[6px_6px_0_0_var(--tomato)]"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your name</span>
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    className="w-full min-h-11 bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    className="w-full min-h-11 bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato"
                  />
                </label>

                <fieldset className="pt-2">
                  <legend className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                    Are you in?
                  </legend>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="ink-border min-h-11 p-3 flex items-center gap-2 has-[:checked]:bg-ink has-[:checked]:text-cream cursor-pointer bg-cream">
                      <input type="radio" name="rsvp" value="yes" defaultChecked className="accent-tomato w-4 h-4 shrink-0" />
                      <span className="font-mono text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em]">Joyfully yes</span>
                    </label>
                    <label className="ink-border min-h-11 p-3 flex items-center gap-2 has-[:checked]:bg-ink has-[:checked]:text-cream cursor-pointer bg-cream">
                      <input type="radio" name="rsvp" value="no" className="accent-tomato w-4 h-4 shrink-0" />
                      <span className="font-mono text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em]">Sadly no</span>
                    </label>
                  </div>
                </fieldset>

                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">A note to us</span>
                  <textarea
                    name="note"
                    rows={3}
                    className="w-full bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato resize-none"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full min-h-11 bg-tomato text-cream py-4 font-mono text-[11px] uppercase tracking-[0.35em] hover:bg-ink transition-colors"
                >
                  Send reply <span aria-hidden="true">→</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-ink/15 pt-12 pb-24 md:pb-12 overflow-hidden">
        <img
          src={illoDance}
          alt=""
          aria-hidden="true"
          className="sway absolute -right-10 -bottom-10 w-52 opacity-30 pointer-events-none"
          width={1024}
          height={1024}
        />
        <div className="sb-wide container-x grid grid-cols-2 gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground relative">
          <div>
            <div className="text-ink">Sofia &amp; Luca</div>
            <div className="mt-1">12.06.2027 · Puglia</div>
          </div>
          <div className="text-right">
            <div className="text-ink">Colophon</div>
            <div className="mt-1">Fraunces · Caveat · JetBrains Mono</div>
          </div>
        </div>
        <div aria-hidden="true" className="container-x mt-10 font-display italic text-5xl md:text-7xl text-tomato text-center relative">
          fin.
        </div>
      </footer>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur border-t border-ink/20 px-4 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
          <img src={illoSun} alt="" aria-hidden="true" className="w-5 h-5" />
          Sat 12·06·27 <span className="text-muted-foreground">· Puglia</span>
        </div>
        <a
          href="#c06"
          className="inline-flex min-h-11 items-center bg-tomato text-cream px-4 font-mono text-[10px] uppercase tracking-[0.35em]"
        >
          RSVP <span aria-hidden="true">&nbsp;→</span>
        </a>
      </div>
    </div>
  );
}
