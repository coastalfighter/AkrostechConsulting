---
name: Akrostech Consulting, v3
description: Paper and ink with a chartreuse highlighter and lavender/violet fields; Sample-3 structure; a real-time 3D signature object in every hero and the interactive instruments in the page bodies.
colors:
  paper: "#f3f2ee"
  ink: "#161110"
  chartreuse: "#dbde2e"
  lavender: "#c5baea"
  violet: "#6327c5"
  plate-light: "#fbfaf8"
  plate-2-light: "#e9e7e1"
  ink-2-light: "#5c524d"
  ink-3-light: "#736963"
  plate-dark: "#1c1615"
  ink-2-dark: "#bfb8b1"
  chartreuse-text-light: "#4f510f"
  danger-light: "#c2361f"
  danger-dark: "#ff7a5c"
typography:
  h1:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.6rem, 1.3rem + 4.4vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.035em"
  h2:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2rem, 1.2rem + 2.6vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  h3:
    fontFamily: "'Bricolage Grotesque', 'Bricolage Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.3rem, 1.1rem + 0.7vw, 1.75rem)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Figtree', 'Figtree Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "'Figtree', 'Figtree Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.03rem + 0.4vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Figtree', 'Figtree Fallback', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  pill: "999px"
spacing:
  s-3: "0.75rem"
  s-4: "1rem"
  s-5: "1.5rem"
  s-6: "2rem"
  s-7: "3rem"
  s-8: "clamp(3rem, 2rem + 3vw, 4.5rem)"
  s-9: "clamp(4.5rem, 2.8rem + 5vw, 7.5rem)"
  margin: "clamp(1.25rem, 0.6rem + 3vw, 4rem)"
  gutter: "clamp(1rem, 0.6rem + 1.4vw, 2rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
  button-primary-dark:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  hero-glow:
    backgroundColor: "{colors.lavender}"
  hero-glow-dark:
    backgroundColor: "{colors.violet}"
  hero-label:
    backgroundColor: "{colors.plate-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  highlight-field:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  soft-field:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  soft-field-dark:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.paper}"
  panel:
    backgroundColor: "{colors.plate-light}"
    rounded: "{rounded.md}"
  badge-new:
    backgroundColor: "{colors.chartreuse}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
---

# Akrostech Consulting, v3

## Overview

Daylight paper, ink type, and one real object per page. Every page opens full-width: a large headline on the left and, behind and to the right of it, a **3D signature object** rendered live with three.js in the brand palette. The object tells the page's story and answers the hand: the pointer tilts it, dragging turns it, a press sends a pulse.

- **Home**: the live Earth. Land as dots, the real day/night terminator for this minute, Wilmington and the India delivery centre pinned with their live local times, and work travelling a great-circle arc between them.
- **Services**: a core with the five services on tilted orbits. **Virtual assistance**: task tiles sorting themselves into trays. **Recruitment**: a glass funnel that narrows a stream of candidates to a chartreuse shortlist. **Accounting**: a balance that levels coin stacks. **Legal**: a fan of paper with one clause highlighted. **Website development**: an exploded browser that assembles itself.
- **About**: a constellation of people. **Blog**: drifting pages, arranged differently for every article. **Contact**: the U.S. and India as two linked globes. **Privacy**: a glass vault with locking rings. **Terms**: a clause index of keys that lifts under the pointer. **404**: blocks that drift apart and find their way back to "404".

These are interactive graphics, not images or infographics.

The site's working **instruments** (live shift dial, comparison divider, service matrix, inbox triage, hiring funnel, bank reconciliation, clause abstractor, page builder, org chain, call week, article search, reading outline, data flow, clause index, page finder) sit further down each page in their own sections, usually on an edge-to-edge ink band.

Structure and copy follow the Sample-3 site: home (ten sections), services hub, five service pages at short URLs, about, blog with 18 guides, contact, privacy, terms, 404.

## Colors

- **Paper `#f3f2ee`** is the light ground (default theme); **ink `#161110`** is the text, the primary button and the hero/instrument panels.
- **Chartreuse `#dbde2e`** is the highlighter: the "New" badge, the CTA band, selected states, the comparison's Akrostech column, button hover, the `.mark` stroke behind a word. It is a fill, never text on paper (text on chartreuse is always ink). On ink panels chartreuse can be text.
- **Lavender `#c5baea`** (light) and **violet `#6327c5`** (dark) are the soft fields: a lead bento cell, the services-menu header, the mission panel, key-takeaway boxes, focus rings in light (`--focus` violet).
- **Dark theme**: ink ground, paper text, chartreuse primary buttons, violet hero glow and soft fields; ink bands lift to `#1c1615` with a hairline.
- Secondary text: `#5c524d` on paper (7:1), `#bfb8b1` on ink (9:1). All body text ≥ 4.5:1 in both themes.

## Typography

- **Bricolage Grotesque** (variable, optical size) for every heading and figure, 700, tight tracking, sentence case. Headlines are two phrases; the second steps back in tone (`.quiet`).
- **Figtree** for text, labels and controls.
- Body 1.0625rem / 1.6; prose measure 38rem (about 75 characters).

## Layout

- `.wrap` (max 1600px) + `.grid` (4 / 8 / 12 columns; `.c-N` spans, `.s-N` starts that keep the span).
- `Hero3D`: full-bleed, at least the viewport tall on wide screens. Words take the left (about 46% of the width, 50% with `wide`); the scene spans the whole section behind them and its projection is shifted right (`shift`), so the object sits beside the words without a box around it. On phones the scene follows the words in a square-ish stage and the camera pulls back to keep the object whole.
- Section heads: h2 left, supporting paragraph right. Sections alternate paper, bands of ink (instruments) and one chartreuse CTA band per page.
- Compositions vary by section: hover-photo service index, ink band with the dial and a shared-day timeline, a step track, a bento, tabs, the comparison divider, a sticky-heading FAQ.

## Elevation & Depth

Flat UI with hairlines (`--rule`) and plate steps; shadows only for floating UI (the services menu, the hero's 3D labels). Depth lives in the hero objects: physical materials lit by a studio environment, a soft lavender (violet in dark) glow behind them. Instrument bands are full-width section colour, so the instruments' own panels are first-level (no cards in cards).

## Shapes

Rounded: panels `1.25rem`, large panels `2rem`, inputs `0.75rem`, buttons and chips pills, icon buttons round. Icons are drawn with round caps and joins, matching the logo's line.

## Components

- **Buttons**: `.btn--primary` (ink → chartreuse on hover; chartreuse in dark), `.btn--ghost` (outline), press `scale(.97)` at 160ms, hover only on fine pointers, `aria-busy` spinner.
- **Header**: logo, Services disclosure menu (all services & comparison, then five services with "New"), About, Blog, Contact, New York and India clocks (wide screens), theme switch, Book a call. Mobile: full-screen dialog menu.
- **Footer**: ink panel with brand column, Services, Company, Contact, legal line.
- **Hero3D**: WebGL canvas + hint + pause button (WCAG 2.2.2). three.js and the scene load as separate chunks after the page has painted, only when the device draws WebGL on a GPU (software rasterisers keep the glow backdrop, as do browsers without WebGL or JavaScript). One settled still frame under reduced motion; pauses off-screen and in hidden tabs; re-colours on theme change without rebuilding. Scenes may pin live HTML labels to the object (`.h3d__label`: plate pill, small title, tabular figure).
- **Scene craft**: one composed object filling about two thirds of the stage height; physical glossy/glass materials for solids, crisp unlit lines and dots for data; chartreuse only for the one thing that matters (the shortlist, the reconciling coin, the travelling work); slow purposeful idle loops with damped responses; seeded randomness so still frames are stable.
- **Compare**: draggable divider, option switch (in-house hire / freelance marketplace), keyboard slider.
- **Photo**: AVIF/WebP via Astro, rounded, clip reveal; stock photography never presented as Akrostech people.

## Do's and Don'ts

**Do**
- Keep chartreuse as a fill; let lavender/violet carry the soft emphasis.
- Give every new page a 3D object of its own (a scene in `src/scripts/hero3d/scenes/`) and put any working tool in the body, on an ink band.
- Use the Sample-3 copy and the published figures only.
- Keep motion purposeful: one authored moment per view, ease-out curves, under 300ms for UI, everything usable with reduced motion and without JavaScript.

**Don't**
- No chartreuse text on paper, no gradient text, no glassmorphism UI (glass is a material for 3D objects only), no side-stripe borders, no eyebrows above headings, no decorative numbering, no cards inside cards, no logo walls or invented proof.
- No images or infographics in hero sections, and no boxed widget: the hero graphic is the page's 3D object, free on the ground.
