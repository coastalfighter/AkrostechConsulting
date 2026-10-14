---
name: Akrostech Consulting, Standards Manual
description: The site is Akrostech's own corporate identity manual. Black plates, whole lime fields, expanded grotesk capitals, a visible 12-column grid and a working diagram in every hero.
colors:
  lime: "#c9ff4a"
  lime-hover: "#d4fe6e"
  lime-deep: "#b2ec2b"
  lime-ink-light: "#4b6a0d"
  carbon-950: "#0b0c0a"
  carbon-900: "#13150f"
  carbon-850: "#1b1e17"
  carbon-800: "#24271f"
  carbon-600: "#555a4c"
  carbon-400: "#929787"
  carbon-300: "#b5b9ab"
  carbon-50: "#f4f5ef"
  field-ink-2: "#2c3a12"
  signal-red: "#ff5c45"
  signal-red-deep: "#b5321f"
typography:
  display:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.75rem, 1.25rem + 5vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  h1:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.5rem, 1.1rem + 4.2vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  h2:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.875rem, 1.1rem + 2.6vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  h3:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.02rem + 0.75vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.45vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
  figure:
    fontFamily: "Archivo, 'Archivo Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(3rem, 1.5rem + 5vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.03em"
rounded:
  none: "0"
  pill: "999px"
spacing:
  s-1: "0.25rem"
  s-2: "0.5rem"
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "clamp(3rem, 2rem + 3vw, 4.5rem)"
  s-9: "clamp(4rem, 2.5rem + 5vw, 7rem)"
  margin: "clamp(1.25rem, 0.6rem + 3vw, 4rem)"
  gutter: "clamp(1rem, 0.6rem + 1.4vw, 2rem)"
  module-pad: "clamp(1.25rem, 0.8rem + 1.6vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.carbon-950}"
    rounded: "{rounded.none}"
    padding: "0.85rem 1.15rem 0.85rem 1.35rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.lime-hover}"
    textColor: "{colors.carbon-950}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-50}"
    rounded: "{rounded.none}"
    height: "3.25rem"
  button-on-lime:
    backgroundColor: "{colors.carbon-950}"
    textColor: "{colors.lime}"
    rounded: "{rounded.none}"
  module:
    backgroundColor: "{colors.carbon-950}"
    textColor: "{colors.carbon-50}"
    rounded: "{rounded.none}"
    padding: "{spacing.module-pad}"
  module-plate:
    backgroundColor: "{colors.carbon-900}"
    textColor: "{colors.carbon-50}"
  lime-field:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.carbon-950}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.carbon-50}"
    rounded: "{rounded.none}"
    height: "44px"
  chip-pressed:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.carbon-950}"
  input:
    backgroundColor: "{colors.carbon-900}"
    textColor: "{colors.carbon-50}"
    rounded: "{rounded.none}"
    height: "3.25rem"
---

# Akrostech Consulting: Standards Manual

## Overview

The site is Akrostech's own corporate identity manual: every page reads like a plate from a Swiss standards book. Near-black plates carry white type; the brand lime from the M-wave mark arrives as **whole fields** (a module, a band, a table column), never as a tint or a gradient. Display type is Archivo pushed to its 125% width, bold, in capitals. A faint 12-column construction grid shows behind every hero, and content sits in modules separated by 1px hairlines.

Two things carry the brand promise, *offshore talent, onshore quality*:

1. **Every hero is a working instrument, unique to its page**, drawn like a diagram from the manual (hairlines, tabular figures, `.label` keys, lime as state): the shift dial (home), practice matrix, inbox triage, hiring funnel, bank reconciliation, clause abstractor, page builder with a Core Web Vitals gauge, org chain, blueprint board, engagement timeline, call week, live article search, reading outline, I-95 corridor, city route, privacy data flow, clause index and the 404 page finder. Each is server-rendered in a meaningful state and enhanced by a lazy module in `src/scripts/heroes/`.
2. **Real photography in grid modules**: stock photos of people at work (Unsplash License, `src/assets/photos/credits.json`), always generic, never captioned as Akrostech staff, clients or offices.

Mode: Persuade for marketing pages, Read for articles and legal pages, Operate inside the instruments.

## Colors

- **Ground `carbon-950` #0B0C0A** is the page. **Plates** step up: `carbon-900` (#13150F) and `carbon-850` (#1B1E17) for instrument panels and alternating sections; `carbon-800` for tracks and disabled fills.
- **Ink**: `carbon-50` (#F4F5EF) primary, `carbon-300` (#B5B9AB) secondary (`--ink-2`), `carbon-400` (#929787) tertiary. Hairlines are ink at 14% (`--rule`) and 32% (`--rule-strong`).
- **Lime #C9FF4A** is the only action colour and the only state colour: primary buttons, pressed chips, the selected node, the lit arc, the featured pricing tier. Lime text (`.accent`) is reserved for the second line of a headline, data keys and figures.
- **`.lime` fields** re-map the cascade inside them: ink becomes carbon-950, secondary ink `#2C3A12`, rules carbon at 18%, focus and buttons invert (black button, lime text).
- **Signal red** (#FF5C45; #B5321F in light) only for errors, the absent specialist, the 404 break and "Poor" performance.
- **Light theme** (`data-theme="light"`, the printed-manual variant): paper `carbon-50`, white plates, black ink, black primary buttons with lime text, lime text darkened to `#4B6A0D`. Dark is the default and the brand.

## Typography

One family, **Archivo variable** (wght 100–900, wdth 62–125%), self-hosted with a metric-matched Arial fallback.

- `.display` / `.h1`: 125% width, 700, uppercase, leading 0.94, tracking −0.025em, max 6rem. Headlines are written as two short sentences; the second goes lime (`<span class="accent">`).
- `.h2`: 125% width, sentence case, leading 1.02. Sits on a strong rule in `.section-head`, with the supporting paragraph on columns 9–12.
- `.h3`: 112% width. `.label`: 0.8125rem, 600, 112% width, tracked 0.08em, uppercase; used for data keys and captions **inside** modules, never as an eyebrow above a heading.
- `.figure`: tabular lining numerals for proof numbers (48h, 100+, 98%).
- Body 1.0625rem / 1.6; prose measure 60ch (≈75 characters in Archivo).

## Layout

- `.wrap` (max 1680px, fluid margin) + `.grid`: 4 columns on phones, 8 from 40rem, 12 from 64rem. Children are full width by default; `.c-N` sets the desktop span and `.s-N` the start column while keeping the span (`class="c-7 s-6"`).
- **Hero frame** (`Hero.astro`): construction lines, breadcrumbs, words on the left columns (`split="5-7"` by default), the instrument on the right, an optional ruled `strip` of modules below. Instruments stack under the words on phones, with no horizontal scroll at 360px.
- **Ruled modules** (`.ruled`): a rule-coloured container with 1px gaps, so every hairline is drawn once. `.module` pads; `.module--flex` stacks.
- **Signature compositions**: the photo-and-headline *seam* (a headline module overlapping the corner of an 8-column photo on a 6px lime top rule), the *compare* divider (local hire vs Akrostech, draggable), the lime closing band with a photo bleeding into the footer.
- Section rhythm: `.section` uses `s-9` vertical padding; alternate plates (`.plate`) break long pages.

## Elevation & Depth

Flat. Depth comes from plate steps and hairlines, never shadows on cards. `--shadow-float` exists only for floating UI (menus, the builder's chat widget). No glass, no blur, no gradients except the hatched "placeholder" stripes in instruments.

## Shapes

Square everything (`--radius: 0`): buttons, chips, inputs, modules, photos, markers. Only status dots (`.live`) and the dial's handles are round. The M-wave mark is the one curve, and it is the line that draws on in the preloader.

## Components

- **Buttons**: `.btn--primary` lime / `.btn--ghost` outline / `.btn--small` / `.btn--block`; square, 3.25rem tall, label plus arrow icon that nudges on hover; `:active` scales to 0.97 over 160ms; disabled uses plate-3; `aria-busy` spins the arrow.
- **Links**: `.link` drawn underline that retracts on hover; `.more` arrow link at module feet; `.stretch` makes a whole card the target.
- **Chips**: 44px buttons with `aria-pressed`; pressed = lime field.
- **Photo** (`Photo.astro`): AVIF/WebP via Astro `<Picture>`, ratio or fill, optional clip reveal and square caption tab.
- **Cards**: `WorkCard` (labelled "Blueprint") and `PostCard`; photo, meta line, title link; image scales 1.03 on hover.
- **FAQ**: native `<details name>` accordion; sticky heading column; the icon square fills lime when open.
- **Header**: logo, primary nav with a lime underline for the current page, a two-city clock (DE / IN) at wide sizes, theme switch, lime "Book a call"; becomes solid on scroll and hides on scroll down. Mobile: full-screen `<dialog>` menu with expanded capitals.
- **Footer**: black plate, tagline in display capitals, four ruled columns, legal line.
- **Forms**: `.input` with label, hint, error; invalid state turns the border signal red; errors appear after interaction.

## Do's and Don'ts

**Do**
- Use lime as a whole field or as state. One lime field per viewport is usually enough.
- Give every new page hero its own working instrument that renders meaningfully without JavaScript and is keyboard operable.
- Use `.label` keys, tabular numbers and hairlines for anything that is data.
- Use real photography in grid modules, alt text describing the scene, and keep it generic.
- Keep UI motion under 300ms with `--ease-out`; reserve longer motion (900ms clip reveals, the dial's zone turn) for one authored moment per view. Everything must hold under `prefers-reduced-motion`.

**Don't**
- No eyebrow or kicker text above headings, no decorative section numbers ("01"), no grids of same-size icon cards.
- No gradients on text or surfaces, no glassmorphism, no drop shadows on cards, no rounded corners, no side-stripe borders thicker than 1px.
- No display text above 6rem or tracking tighter than −0.04em.
- No invented clients, testimonials, logos, names, quotes or statistics. Only figures in `src/config/site.ts`. Work stays labelled as blueprints until a real case study is approved.
- Never present stock photographs as Akrostech's people, clients or offices.
