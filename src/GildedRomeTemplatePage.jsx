import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import illoDance from "./assets/med-dream-spark/illo-dance.png";
import illoTram from "./assets/med-dream-spark/illo-tram.png";
import illoTable from "./assets/med-dream-spark/illo-table.png";
import illoMasseria from "./assets/med-dream-spark/illo-masseria.png";
import illoSun from "./assets/med-dream-spark/illo-sun.png";
import illoWine from "./assets/med-dream-spark/illo-wine.png";
import illoEnvelope from "./assets/med-dream-spark/illo-envelope.png";
import illoMoon from "./assets/med-dream-spark/illo-moon.png";
import branch from "./assets/med-dream-spark/story-branch.png";

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  { id: "01", label: "Hello" },
  { id: "02", label: "Us" },
  { id: "03", label: "When" },
  { id: "04", label: "Day" },
  { id: "05", label: "Place" },
  { id: "06", label: "RSVP" },
];

export default function GildedRomeTemplatePage() {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [d, setD] = useState({ dd: 0, hh: 0, mm: 0, ss: 0 });

  useEffect(() => {
    const target = new Date("2026-06-12T17:00:00+02:00").getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setD({
        dd: Math.floor(diff / 86400000),
        hh: Math.floor((diff % 86400000) / 3600000),
        mm: Math.floor((diff % 3600000) / 60000),
        ss: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-letter", {
        yPercent: 110,
        opacity: 0,
        stagger: 0.04,
        duration: 1.1,
        delay: 0.2,
        ease: "expo.out",
      });
      gsap.from(".hero-meta", { opacity: 0, y: 20, duration: 1, delay: 1, ease: "power2.out" });
      gsap.from(".hero-illo", {
        opacity: 0,
        scale: 0.6,
        rotate: -12,
        duration: 1.4,
        delay: 0.6,
        ease: "back.out(1.6)",
      });

      gsap.utils.toArray("[data-chapter]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      gsap.utils.toArray(".rise").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });

      // Illustrations pop in with a wiggle
      gsap.utils.toArray(".pop-illo").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          scale: 0.5,
          rotate: gsap.utils.random(-15, 15),
          duration: 1.1,
          ease: "back.out(2)",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Gentle sway on decorative illos
      gsap.utils.toArray(".sway").forEach((el, i) => {
        gsap.to(el, {
          rotate: i % 2 === 0 ? 6 : -6,
          duration: 3 + (i % 3),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      });

      gsap.to(".ticker", {
        xPercent: -50,
        duration: 35,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".spin-slow", { rotation: 360, duration: 60, ease: "none", repeat: -1 });
      gsap.to(".spin-sun", { rotation: 360, duration: 40, ease: "none", repeat: -1 });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="theme-gilded-rome relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Fixed top chrome */}
      <header className="fixed top-0 inset-x-0 z-40 bg-background/85 backdrop-blur-md border-b border-ink/10">
        <div className="container-x flex items-center justify-between py-3">
          <a href="#c01" className="font-display italic text-lg tracking-tight flex items-center gap-2">
            <img src={illoSun} alt="" className="w-6 h-6 spin-sun" />
            S<span className="text-tomato">&</span>L
          </a>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {String(active + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} — {CHAPTERS[active].label}
          </div>
        </div>
        <div className="h-[2px] bg-ink/10">
          <div
            className="h-full bg-tomato transition-all duration-500 ease-out"
            style={{ width: `${((active + 1) / CHAPTERS.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Fixed right chapter dots (desktop) */}
      <nav className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3">
        {CHAPTERS.map((c, i) => (
          <a
            key={c.id}
            href={`#c${c.id}`}
            className="group flex items-center gap-3 justify-end"
            aria-label={`Go to chapter ${c.id} ${c.label}`}
          >
            <span
              className={`font-mono text-[10px] uppercase tracking-widest transition-all ${
                active === i ? "opacity-100 text-tomato" : "opacity-0 group-hover:opacity-70 text-ink"
              }`}
            >
              {c.label}
            </span>
            <span
              className={`h-px transition-all ${
                active === i ? "w-10 bg-tomato" : "w-4 bg-ink/40 group-hover:w-6"
              }`}
            />
          </a>
        ))}
      </nav>

      {/* ============= CH 01 · HELLO ============= */}
      <section
        id="c01"
        data-chapter
        className="relative min-h-[100svh] flex flex-col justify-between px-5 pt-24 pb-8 overflow-hidden"
      >
        {/* floating decorative illos */}
        <img src={illoSun} alt="" className="hero-illo sway absolute top-24 -right-6 w-32 md:w-44 opacity-90 pointer-events-none" />
        <img src={illoMoon} alt="" className="hero-illo sway absolute bottom-32 -left-4 w-28 md:w-36 opacity-80 pointer-events-none" />

        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground flex items-center gap-2 relative">
          <span className="text-tomato">●</span> Ch. 01 — Ciao!
        </div>

        <div className="flex-1 flex flex-col justify-center relative">
          <div className="font-hand text-2xl md:text-3xl text-tomato -rotate-2 mb-2">
            you&rsquo;re invited to
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
            the very sunny wedding of
          </div>
          <h1 className="font-display text-[22vw] md:text-[9rem] leading-[0.85] tracking-tight">
            <div className="overflow-hidden">
              {"Sofia".split("").map((c, i) => (
                <span key={`s${i}`} className="hero-letter inline-block">{c}</span>
              ))}
            </div>
            <div className="overflow-hidden italic text-tomato font-light">
              {"& Luca".split("").map((c, i) => (
                <span key={`l${i}`} className="hero-letter inline-block">{c === " " ? "\u00A0" : c}</span>
              ))}
            </div>
          </h1>

          <img
            src={illoDance}
            alt="Sofia and Luca dancing under olive branches"
            className="hero-illo mt-6 w-[70%] max-w-sm mx-auto md:mx-0"
            width={1024}
            height={1024}
          />

          <div className="hero-meta mt-8 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
            <div>
              <div className="text-muted-foreground">Date</div>
              <div className="mt-1">12.06.2026</div>
            </div>
            <div>
              <div className="text-muted-foreground">Place</div>
              <div className="mt-1">Puglia, IT</div>
            </div>
            <div>
              <div className="text-muted-foreground">Dress</div>
              <div className="mt-1">Sun-ready</div>
            </div>
          </div>
        </div>

        <div className="hero-meta flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>Scroll ↓ to read</span>
          <span>Vol. 01 · Issue 01</span>
        </div>
      </section>

      {/* Ticker with illustrations */}
      <div className="border-y border-ink/15 bg-ink text-cream py-4 overflow-hidden">
        <div className="ticker flex gap-6 whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] items-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 shrink-0">
              <span>Save the date</span>
              <img src={illoSun} alt="" className="w-8 h-8 shrink-0" />
              <span>12 · 06 · 2026</span>
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
      <section id="c02" data-chapter className="relative px-5 py-20 md:py-28 overflow-hidden">
        <img src={illoTram} alt="" className="pop-illo absolute right-2 top-10 w-32 md:w-52 opacity-90 pointer-events-none" width={1024} height={1024} />

        <div className="container-x relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">
            Ch. 02 · How it started
          </div>
          <h2 className="rise font-display text-4xl md:text-6xl leading-[0.95] mb-2 text-balance max-w-[80%]">
            Two strangers, one rainy tram,
            <span className="italic text-tomato"> and a very bad umbrella.</span>
          </h2>
          <div className="rise font-hand text-3xl text-tomato -rotate-1 mb-8">— Milano, 2019 —</div>

          <div className="rise relative bg-cream-2 border-2 border-ink p-6 md:p-8 max-w-xl shadow-[6px_6px_0_0_var(--ink)]">
            <img
              src={illoEnvelope}
              alt=""
              className="sway absolute -top-8 -right-8 w-20 pointer-events-none"
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
          <div className="rise mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { i: illoTram, y: "2019", t: "The tram", d: "A shared umbrella. A ruined coffee." },
              { i: illoTable, y: "2022", t: "The table", d: "Sunday dinners became a habit." },
              { i: illoDance, y: "2025", t: "The yes", d: "In a kitchen. With flour on our hands." },
            ].map((x) => (
              <div key={x.y} className="pop-illo text-center">
                <div className="aspect-square bg-cream-2 border-2 border-ink flex items-center justify-center p-4 shadow-[4px_4px_0_0_var(--tomato)]">
                  <img src={x.i} alt="" className="max-h-full w-auto object-contain" loading="lazy" width={1024} height={1024} />
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-tomato">{x.y}</div>
                <div className="font-display text-2xl mt-1">{x.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="rise mt-10 font-hand text-2xl md:text-3xl text-ink flex items-center gap-3 -rotate-1">
            <span className="h-px w-8 bg-tomato" /> and now — we&rsquo;d love you there for the next page.
          </div>
        </div>
      </section>

      {/* ============= CH 03 · WHEN ============= */}
      <section
        id="c03"
        data-chapter
        className="relative bg-ink text-cream px-5 py-20 md:py-28 overflow-hidden"
      >
        <img src={illoSun} alt="" className="spin-sun absolute -left-16 top-10 w-56 opacity-70" width={1024} height={1024} />
        <img src={illoMoon} alt="" className="sway absolute right-4 bottom-16 w-32 invert opacity-80" width={1024} height={1024} />
        <img src={branch} alt="" className="spin-slow absolute -right-20 top-24 w-64 opacity-20 invert" />

        <div className="container-x relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">
            Ch. 03 · The date
          </div>

          <div className="rise flex items-baseline gap-4 mb-2">
            <span className="font-display text-[28vw] md:text-[14rem] leading-[0.8] italic">12</span>
            <div className="font-mono text-xs uppercase tracking-[0.3em] pb-4">
              <div>Fri</div>
              <div className="text-tomato">June</div>
              <div>2026</div>
            </div>
          </div>

          <p className="rise font-hand text-3xl md:text-5xl italic max-w-md text-cream/90 mb-10 leading-tight">
            Ceremony at five,<br/>
            dinner under the fig trees,<br/>
            dancing until the sun forgets<br/>
            what time it is.
          </p>

          <div className="rise grid grid-cols-4 gap-2 max-w-md">
            {[
              { v: d.dd, l: "Days" },
              { v: d.hh, l: "Hrs" },
              { v: d.mm, l: "Min" },
              { v: d.ss, l: "Sec" },
            ].map((t) => (
              <div key={t.l} className="border border-cream/25 p-3 md:p-4 bg-ink/50 backdrop-blur">
                <div className="font-display text-3xl md:text-5xl tabular-nums">
                  {String(t.v).padStart(2, "0")}
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-cream/60">
                  {t.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= CH 04 · PROGRAM ============= */}
      <section id="c04" data-chapter className="relative px-5 py-20 md:py-28 overflow-hidden">
        <img src={illoWine} alt="" className="pop-illo sway absolute right-0 top-32 w-28 md:w-40 opacity-95" width={1024} height={1024} />

        <div className="container-x relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">
            Ch. 04 · The programme
          </div>
          <h2 className="rise font-display text-4xl md:text-5xl mb-2 max-w-[80%]">
            A day in <span className="italic text-tomato">six acts.</span>
          </h2>
          <div className="rise font-hand text-2xl text-muted-foreground -rotate-1 mb-10">show up hungry ✿</div>

          <ol className="space-y-0">
            {[
              { t: "16:30", h: "Arrival", d: "Chilled vermouth on the terrace.", i: illoSun },
              { t: "17:00", h: "Ceremony", d: "In the olive grove. We&rsquo;ll try not to cry.", i: illoDance },
              { t: "18:00", h: "Aperitivo", d: "Focaccia, oysters, a string quartet from Bari.", i: illoWine },
              { t: "20:00", h: "Dinner", d: "A long, loud, family-style table under strings of lights.", i: illoTable },
              { t: "22:00", h: "Dancing", d: "DJ Rosa from midnight onward. Bring second shoes.", i: illoMoon },
              { t: "02:00", h: "Late night", d: "Espresso, gelato, and a bonfire on the beach.", i: illoEnvelope },
            ].map((row, i) => (
              <li
                key={row.t}
                className="rise grid grid-cols-[48px_48px_1fr] gap-3 items-center py-5 border-t border-ink/15 last:border-b"
              >
                <div className="font-mono text-xs md:text-sm">{row.t}</div>
                <img src={row.i} alt="" className="w-12 h-12 object-contain sway" loading="lazy" width={1024} height={1024} />
                <div>
                  <div className="font-display text-2xl md:text-3xl">
                    <span className="text-muted-foreground text-sm font-mono align-top mr-2">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {row.h}
                  </div>
                  <div
                    className="text-sm text-muted-foreground mt-1"
                    dangerouslySetInnerHTML={{ __html: row.d }}
                  />
                </div>
              </li>
            ))}
          </ol>

          <div className="rise mt-8 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="border-2 border-ink px-3 py-1 bg-cream-2">Dress · Sun-ready</span>
            <span className="border-2 border-ink px-3 py-1 bg-cream-2">Kids · welcome</span>
            <span className="border-2 border-ink px-3 py-1 bg-cream-2">Vegan · yes</span>
          </div>
        </div>
      </section>

      {/* ============= CH 05 · PLACE ============= */}
      <section id="c05" data-chapter className="relative px-5 py-20 md:py-28 bg-cream-2 overflow-hidden">
        <div className="container-x relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">
            Ch. 05 · The place
          </div>
          <h2 className="rise font-display text-4xl md:text-5xl mb-2">
            Masseria del Sole
          </h2>
          <div className="rise font-hand text-2xl text-tomato -rotate-1 mb-6">between olive trees and the sea</div>

          <img
            src={illoMasseria}
            alt="Stone farmhouse in Puglia"
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
              title="Masseria del Sole map"
              src="https://www.google.com/maps?q=Ostuni+Puglia+Italy&output=embed"
              className="w-full h-full grayscale contrast-110"
              loading="lazy"
            />
          </div>

          <div className="rise mt-4 grid grid-cols-2 gap-3">
            <a
              href="https://maps.google.com/?q=Ostuni+Puglia"
              target="_blank"
              rel="noreferrer"
              className="ink-border bg-ink text-cream text-center py-3 font-mono text-[11px] uppercase tracking-[0.25em] shadow-[4px_4px_0_0_var(--tomato)]"
            >
              Open in Maps ↗
            </a>
            <a
              href="#c06"
              className="ink-border bg-tomato text-cream text-center py-3 font-mono text-[11px] uppercase tracking-[0.25em] shadow-[4px_4px_0_0_var(--ink)]"
            >
              I&rsquo;ll be there →
            </a>
          </div>

          <div className="rise mt-8 grid grid-cols-2 gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <div>
              <div className="text-ink">Nearest airport</div>
              <div className="mt-1">Brindisi (BDS) · 35 min</div>
            </div>
            <div>
              <div className="text-ink">Stay</div>
              <div className="mt-1">Rooms held under &ldquo;S+L&rdquo;</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= CH 06 · RSVP ============= */}
      <section id="c06" data-chapter className="relative px-5 py-20 md:py-28 overflow-hidden">
        <img src={illoEnvelope} alt="" className="pop-illo sway absolute -right-6 top-24 w-40 md:w-56 pointer-events-none" width={1024} height={1024} />

        <div className="container-x relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-tomato mb-8">
            Ch. 06 · Kindly reply
          </div>
          <h2 className="rise font-display text-4xl md:text-5xl mb-3 max-w-[80%]">
            Will you write the next page <span className="italic text-tomato">with us?</span>
          </h2>
          <p className="rise font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-8">
            Please reply by · 15 April 2026
          </p>

          <form
            className="rise space-y-4 bg-cream-2 border-2 border-ink p-6 md:p-8 shadow-[6px_6px_0_0_var(--tomato)]"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Grazie! Your reply has been sent.");
            }}
          >
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Your name</span>
              <input
                required
                className="w-full bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Email</span>
              <input
                type="email"
                required
                className="w-full bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato"
              />
            </label>

            <fieldset className="pt-2">
              <legend className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Are you in?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <label className="ink-border p-3 flex items-center gap-2 has-[:checked]:bg-ink has-[:checked]:text-cream cursor-pointer bg-cream">
                  <input type="radio" name="rsvp" defaultChecked className="accent-tomato" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">Joyfully yes</span>
                </label>
                <label className="ink-border p-3 flex items-center gap-2 has-[:checked]:bg-ink has-[:checked]:text-cream cursor-pointer bg-cream">
                  <input type="radio" name="rsvp" className="accent-tomato" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">Sadly no</span>
                </label>
              </div>
            </fieldset>

            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">A note to us</span>
              <textarea
                rows={3}
                className="w-full bg-transparent border-b border-ink py-2 focus:outline-none focus:border-tomato resize-none"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-tomato text-cream py-4 font-mono text-[11px] uppercase tracking-[0.35em] hover:bg-ink transition"
            >
              Send reply →
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-ink/15 px-5 py-12 overflow-hidden">
        <img src={illoDance} alt="" className="sway absolute -right-10 -bottom-10 w-52 opacity-30 pointer-events-none" width={1024} height={1024} />
        <div className="container-x grid grid-cols-2 gap-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground relative">
          <div>
            <div className="text-ink">Sofia & Luca</div>
            <div className="mt-1">12.06.2026 · Puglia</div>
          </div>
          <div className="text-right">
            <div className="text-ink">Colophon</div>
            <div className="mt-1">Fraunces · Caveat · JetBrains Mono</div>
          </div>
        </div>
        <div className="container-x mt-10 font-display italic text-5xl md:text-7xl text-tomato text-center relative">
          fin.
        </div>
      </footer>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur border-t border-ink/20 px-4 py-3 flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
          <img src={illoSun} alt="" className="w-5 h-5" />
          12·06·26 <span className="text-muted-foreground">· Puglia</span>
        </div>
        <a
          href="#c06"
          className="bg-tomato text-cream px-4 py-2 font-mono text-[10px] uppercase tracking-[0.35em]"
        >
          RSVP →
        </a>
      </div>
    </div>
  );
}
