# Wedfolio — wedding invitation websites

React 19 + Vite + Tailwind v4 + GSAP + three.js.

```
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## Structure

```
src/
  main.jsx                 entry
  app/
    Router.jsx             path → template; lazy-loads each page, plays the 3D intro first
    ErrorBoundary.jsx      fallback if a page crashes
    openedFlag.js          skips the intro when the landing page already opened the envelope
  landing/                 the Wedfolio landing page (hero envelope, collection, how it works)
    previews/<slug>.jpg    hero screenshots used on the collection cards
  shared/intro/            the 3D envelope intro shared by every template
    InvitationIntro.jsx    full-screen overlay + buttons
    envelopeScene.js       three.js scene: envelope, wax seal, card, particles, open timeline
    textures.js            canvas-drawn paper, liner patterns, card, seal and particles
    fonts.js               waits for the card/seal fonts before drawing
  templates/
    registry.js            every template: route, couple, date, price, landing copy, intro colours
    <slug>/<Name>Page.jsx  one folder per template, with its own assets/
  styles/index.css         Tailwind + the Art Deco and Storybook themes
public/assets/<slug>/      large images loaded by URL (trees, couple photos, moon textures)
archive/                   old drafts and unused images, kept out of the build and lint
```

## Routes

| Route | Template |
| --- | --- |
| `/` | Landing |
| `/celestial` | Celestial — Aurora & Elias |
| `/artdeco` | Art Deco — Elena & Marcus |
| `/gilded-rome` | Sunny Storybook — Sofia & Luca |
| `/sakura` | Sakura — Hiro & Aiko |
| `/autumn` | Autumn Falls — Nazlı & Bahadır |
| `/aegean` | Ege Zeytin — Elif & Deniz (Turkish) |
| `/spark` (also `/sole-mare`, `/meditteraean`) | Sole & Mare (Turkish) |
| `/royal` | Royal Garden — Charlotte & Henry |

Add `?intro=off` to any template URL to skip the envelope while working on a page.
The intro is also skipped for visitors with reduced motion turned on.

## Adding a template

1. Create `src/templates/<slug>/<Name>Page.jsx` with a default export.
2. Add an entry to `src/templates/registry.js` (route, couple, date, `load`, and the `intro` colours:
   paper, liner + pattern, card, ink, seal, particles, font).
3. Add a hero screenshot as `src/landing/previews/<slug>.jpg`.

The router, intro and landing page pick it up from the registry.
