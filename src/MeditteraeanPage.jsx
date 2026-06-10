import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import hero from './assets/med-dream-spark/hero-mediterranean.jpg'
import olive from './assets/med-dream-spark/olive-branch.png'
import lemons from './assets/med-dream-spark/lemons.jpg'
import table from './assets/med-dream-spark/table.jpg'
import boat from './assets/med-dream-spark/boat.jpg'
import door from './assets/med-dream-spark/door.jpg'

gsap.registerPlugin(ScrollTrigger)

const experiences = [
  {
    n: '01',
    img: lemons,
    title: 'Citrus at dawn',
    description:
      'Pick lemons in the grove behind the house while the sea is still grey.',
  },
  {
    n: '02',
    img: table,
    title: 'The long table',
    description:
      'Bread, oil, tomatoes. Lunch that begins at one and ends with the stars.',
  },
  {
    n: '03',
    img: boat,
    title: 'A quiet sail',
    description:
      "Wooden gulet, no schedule, anchored above coves you'll never name.",
  },
]

const marqueeItems = [
  'Santorini',
  'Amalfi',
  'Mallorca',
  'Crete',
  'Sicily',
  'Mykonos',
  'Ibiza',
]

function MeditteraeanPage() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.8 })
        .from(
          '.hero-word',
          { y: 80, opacity: 0, duration: 1, stagger: 0.12 },
          '-=0.4',
        )
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.8 }, '-=0.5')
        .from('.hero-cta', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-meta', { opacity: 0, duration: 0.8, stagger: 0.1 }, '-=0.3')

      gsap.to('.hero-img', {
        yPercent: 18,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      gsap.to('.float-olive', {
        y: -22,
        rotation: 4,
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.utils.toArray('.reveal').forEach((element) => {
        gsap.from(element, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          },
        })
      })

      gsap.to('.marquee-track', {
        xPercent: -50,
        ease: 'none',
        duration: 30,
        repeat: -1,
      })

      gsap.utils.toArray('.parallax-img').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: -8 },
          {
            yPercent: 8,
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
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={root}
      className="overflow-x-hidden bg-[#faf6ed] text-[#4d433b]"
    >
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#top" className="font-display text-xl tracking-wide text-white">
            Costa<span className="text-[#c96a4b]">·</span>Sole
          </a>
          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <a href="#about" className="transition hover:text-white">
              Story
            </a>
            <a href="#experiences" className="transition hover:text-white">
              Experiences
            </a>
            <a href="#gallery" className="transition hover:text-white">
              Places
            </a>
            <a href="#journal" className="transition hover:text-white">
              Journal
            </a>
          </nav>
          <a
            href="#book"
            className="rounded-full bg-[#2f2a25] px-5 py-2.5 text-sm text-[#faf6ed] transition-colors hover:bg-[#c96a4b]"
          >
            Reserve
          </a>
        </div>
      </header>

      <section
        id="top"
        className="hero relative min-h-[720px] w-full overflow-hidden"
      >
        <div className="hero-img absolute inset-0 will-change-transform">
          <img
            src={hero}
            alt="Mediterranean coastal village at golden hour"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#faf6ed]" />
        </div>

        <img
          src={olive}
          alt=""
          aria-hidden="true"
          className="float-olive pointer-events-none absolute -left-10 top-24 w-72 opacity-80 mix-blend-multiply"
        />
        <img
          src={olive}
          alt=""
          aria-hidden="true"
          className="float-olive pointer-events-none absolute -right-20 bottom-32 w-96 rotate-180 opacity-70 mix-blend-multiply"
        />

        <div className="relative z-10 mx-auto flex h-full min-h-[720px] w-full max-w-7xl flex-col justify-end px-6 pb-24 lg:px-10">
          <p className="hero-eyebrow mb-6 text-xs uppercase tracking-[0.4em] text-white/80">
            Est. 1978 · Aegean Coast
          </p>
          <h1 className="font-display text-balance text-[clamp(3.5rem,11vw,11rem)] leading-[0.95] text-white">
            <span className="hero-word mr-4 inline-block">Sun,</span>
            <span className="hero-word mr-4 inline-block italic">salt</span>
            <span className="hero-word mr-4 inline-block">&amp;</span>
            <span className="hero-word inline-block text-[#d77a59]">slow time.</span>
          </h1>

          <div className="mt-10 flex max-w-5xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="hero-sub max-w-md text-lg text-white/90">
              A handful of hidden villas along the Aegean, where mornings smell
              of citrus and evenings dissolve into the sea.
            </p>
            <a
              href="#about"
              className="hero-cta inline-flex items-center gap-3 border-b border-white/60 pb-2 text-sm uppercase tracking-widest text-white transition-all hover:gap-5"
            >
              Wander with us
              <span>→</span>
            </a>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-3 gap-6 text-white/85">
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="14">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">
                Coastal villas
              </div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                <span data-count="6">0</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">
                Islands
              </div>
            </div>
            <div className="hero-meta">
              <div className="font-display text-3xl">
                48<span className="text-[#d77a59]">°</span>
              </div>
              <div className="text-xs uppercase tracking-widest opacity-70">
                Avg. summer
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#e5dccf] bg-[#f2ede4]">
        <div className="marquee-track flex whitespace-nowrap py-6 font-display text-3xl italic md:text-5xl">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex shrink-0 items-center gap-12 pr-12">
              {marqueeItems.map((item) => (
                <span key={`${index}-${item}`} className="contents">
                  <span>{item}</span>
                  <span className="text-[#c96a4b]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-start gap-12 md:grid-cols-12">
          <div className="reveal md:col-span-5">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[#c96a4b]">
              Our philosophy
            </p>
            <h2 className="font-display text-balance text-5xl leading-[1.05] md:text-6xl">
              A return to the <em className="text-[#c96a4b]">slow</em> Mediterranean.
            </h2>
          </div>
          <div className="reveal space-y-6 text-lg leading-relaxed text-[#76685d] md:col-span-6 md:col-start-7">
            <p>
              For three generations our family has cared for stone houses tucked
              into cliffsides, places where time keeps a different rhythm,
              measured in cicadas and crusts of warm bread.
            </p>
            <p>
              We do not sell rooms. We hand you a key, a bicycle, a basket of
              figs, and a map drawn by hand. The rest is yours.
            </p>
            <div className="flex items-center gap-4 pt-6">
              <img src={olive} alt="" className="-ml-2 w-16" />
              <div>
                <div className="font-display text-xl italic">Elena Marinou</div>
                <div className="text-xs uppercase tracking-widest">
                  Keeper of keys
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="experiences" className="bg-[#f2ede4] py-32">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="reveal mb-16 flex items-end justify-between">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c96a4b]">
                The days
              </p>
              <h2 className="font-display text-balance max-w-2xl text-5xl md:text-6xl">
                Small rituals, repeated <em>devoutly</em>.
              </h2>
            </div>
            <a
              href="#book"
              className="hidden text-sm uppercase tracking-widest transition hover:text-[#c96a4b] md:inline"
            >
              All experiences →
            </a>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {experiences.map((card) => (
              <article key={card.n} className="reveal group">
                <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-md">
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="parallax-img h-[120%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="font-display absolute left-4 top-4 text-sm text-[#faf6ed]">
                    {card.n}
                  </div>
                </div>
                <h3 className="font-display mb-2 text-2xl">{card.title}</h3>
                <p className="text-[#76685d]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto w-full max-w-7xl px-6 py-32 lg:px-10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="reveal relative md:col-span-7">
            <div className="aspect-[4/5] overflow-hidden rounded-md">
              <img
                src={door}
                alt="Whitewashed staircase with blue door and bougainvillea"
                loading="lazy"
                className="parallax-img h-[115%] w-full object-cover"
              />
            </div>
            <img
              src={olive}
              alt=""
              className="float-olive absolute -bottom-10 -right-8 w-44 opacity-80 mix-blend-multiply"
            />
          </div>
          <div className="reveal md:col-span-4 md:col-start-9">
            <p className="mb-6 text-xs uppercase tracking-[0.4em] text-[#c96a4b]">
              Casa No. 7
            </p>
            <h2 className="font-display text-balance mb-6 text-5xl leading-[1.05]">
              Behind a blue door in <em>Oia</em>.
            </h2>
            <p className="mb-8 leading-relaxed text-[#76685d]">
              Two bedrooms, a fig tree courtyard, and a terrace that watches the
              caldera fall into the sea each evening. Sleeps four, barely.
            </p>
            <dl className="grid grid-cols-2 gap-6 border-t border-[#e5dccf] pt-6 text-sm">
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#8a7b6d]">
                  From
                </dt>
                <dd className="font-display text-2xl">EUR 420 / night</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs uppercase tracking-widest text-[#8a7b6d]">
                  Season
                </dt>
                <dd className="font-display text-2xl">May - Oct</dd>
              </div>
            </dl>
            <a
              href="#book"
              className="mt-10 inline-block rounded-full bg-[#c96a4b] px-7 py-3 text-sm uppercase tracking-widest text-[#faf6ed] transition-colors hover:bg-[#2f2a25]"
            >
              Enquire
            </a>
          </div>
        </div>
      </section>

      <section id="journal" className="relative overflow-hidden py-40">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f2c86d_0%,#c96a4b_60%,#754134_100%)]" />
        <img
          src={olive}
          alt=""
          className="float-olive absolute left-10 top-10 w-40 opacity-50"
        />
        <img
          src={olive}
          alt=""
          className="float-olive absolute bottom-10 right-10 w-56 rotate-180 opacity-40"
        />
        <div className="reveal mx-auto w-full max-w-7xl px-6 text-center lg:px-10">
          <p className="mb-8 text-xs uppercase tracking-[0.4em] text-white/80">
            — Journal, July
          </p>
          <blockquote className="font-display text-balance mx-auto max-w-4xl text-4xl leading-[1.1] text-white md:text-6xl">
            "Some afternoons here are so still you can hear the lemons drop.
            <em>
              {' '}
              One forgets which day it is, and then forgets that one has
              forgotten.
            </em>
            "
          </blockquote>
          <div className="mt-10 text-sm uppercase tracking-widest text-white/80">
            Elena, from the terrace
          </div>
        </div>
      </section>

      <footer id="book" className="bg-[#2f2a25] pb-12 pt-28 text-[#faf6ed]">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 border-b border-white/15 pb-20 md:grid-cols-12">
            <div className="reveal md:col-span-7">
              <h2 className="font-display text-balance text-5xl leading-[1.02] md:text-7xl">
                Come for a week.
                <br />
                <em className="text-[#d77a59]">Stay for the summer.</em>
              </h2>
            </div>
            <div className="reveal flex flex-col justify-end md:col-span-4 md:col-start-9">
              <p className="mb-6 text-white/70">
                We open the houses each March. Reservations are by letter, email,
                or a long phone call.
              </p>
              <form className="flex border-b border-white/40 pb-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-[#faf6ed] outline-none placeholder:text-white/50"
                />
                <button
                  type="button"
                  className="text-sm uppercase tracking-widest transition hover:text-[#d77a59]"
                >
                  Send →
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-10 text-sm text-white/60 md:flex-row md:justify-between">
            <div className="font-display text-xl text-[#faf6ed]">
              Costa<span className="text-[#c96a4b]">·</span>Sole
            </div>
            <div className="flex gap-8">
              <a href="#top" className="transition hover:text-white">
                Instagram
              </a>
              <a href="#journal" className="transition hover:text-white">
                Journal
              </a>
              <a href="#book" className="transition hover:text-white">
                Contact
              </a>
            </div>
            <div>© Costa Sole, Cyclades</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MeditteraeanPage
