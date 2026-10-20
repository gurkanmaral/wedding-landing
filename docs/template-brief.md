# Brief: building a Wedfolio template

Wedfolio sells premium digital wedding invitations (a link guests open on their phone). Competitor: thedigitalyes.com (€175–€975). Ours must look more expensive than theirs and be genuinely interactive. Every visual is made in code (three.js, GSAP, canvas, SVG, CSS) — no photos, no external images.

## Read first
- `docs/creative-direction.md` — your template's concept, palette and intro idea.
- `src/engine/Invitation.jsx`, `src/engine/engine.css`, `src/engine/i18n.js` — the shared invitation page.
- `src/templates/kapadokya/` — the reference template: `KapadokyaPage.jsx` (engine usage, content in TR+EN, defaults), `kapadokya.css` (theme), `ValleyHero.jsx` + `valleyScene.js` (a live 3D hero shared with the intro).
- `src/shared/intro/core.js`, `src/shared/intro/scenes/celestial.js`, `src/shared/intro/scenes/kapadokya.js` — intro scene contract and quality bar.
- `src/templates/registry.js` — your template's entry already exists (slug, path, date, place, lang, intro colours). Do NOT edit registry.js; if something there must change, say so in your report.

## What to build for each template `<slug>`
1. `src/templates/<slug>/<Component>.jsx` (component name from the registry `load`), default export, rendering `<Invitation theme defaults content lang />`.
   - `defaults`: partner1 'Jane', partner2 'Joe', eventDate (ISO with timezone, the registry date + a sensible time), a real plausible venue, city, address, rsvpDeadline (~6 weeks before, written in the template language).
   - `content`: BOTH `tr` and `en` — tagline, welcome, story (3 items), schedule (4–6 items), venueNote, dressCode (with swatches), gifts (TR templates: IBAN placeholder `TR00 0000 0000 0000 0000 0000 00`), quote. Natural, warm, specific copy — no filler, no "template" talk. Turkish must be correct Turkish.
   - `theme.Hero`: a full-viewport hero that is the template's signature visual — live three.js or rich animated SVG/canvas, layered, lit, alive (subtle motion, pointer/gyro parallax). It must be beautiful at 390×844 (main target) and 1568×703. The couple's names, date and place sit on it, perfectly legible. Pause rendering when off screen (IntersectionObserver + `stage.setPaused`) and respect prefers-reduced-motion.
   - `theme.ornament`: an SVG divider in the template's language.
   - `theme.className` + `<slug>.css`: set the engine tokens AND restyle the sections so the page has a distinct identity matching the concept (e.g. schedule as a ferry timetable / tile grid / tracklist / split-flap board, countdown as tiles / film frames / flip cards, RSVP as a ticket / postcard). Change backgrounds, borders, heading treatments, spacing. Engine-only defaults are not enough.
   - Fonts: Google Fonts in `theme.fontsHref`; every font must include Turkish glyphs (ğ ş ı İ ç ö ü) — use `&subset=latin-ext` friendly families and check.
2. `src/shared/intro/scenes/<slug>.js` — the signature intro (contract below). Ideally reuse your hero's 3D module so the intro's last frame flows into the hero.

## Intro scene contract
- `export const fonts = (template) => [{ family, weight?, style?, google? }]`
- `export const copy = { en: { prompt }, tr: { prompt } }` — a short, inviting hint.
- `export default function create(host, template, { onOpened, setCaption })` → `{ open, skip, setPointer(x, y), dispose }`.
  - `template.couple` = [name1, name2] (from the API — never hardcode), `template.dateLabel`, `template.lang`.
  - Full screen from the first frame at any aspect ratio; idle state alive; open() plays 3–6 s and calls onOpened(); skip() jumps to the end and calls onOpened(); `setCaption('date', 'top' | 'bottom')` shows the date in HTML; dispose() frees everything (`stage.dispose()`).
  - Names appear inside the 3D moment. Rich materials and light. No per-frame allocations; fewer particles on small screens.

## Rules
- Edit only your own folders/files listed in your task. Do not touch git, do not start a dev server or browser.
- `npx eslint src/templates/<slug> src/shared/intro/scenes/<slug>.js` must pass. `npm run build` may fail only because other templates are still being written by other people; if so, say which missing files it reported.
- Report: what the hero and intro look like beat by beat, how each section is restyled, any risks.
