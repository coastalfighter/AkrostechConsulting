---
name: Akrostech Consulting, v3
description: Paper and ink with a chartreuse highlighter and lavender/violet fields; Sample-3 structure; a live generative field in every hero and the interactive instruments in the page bodies.
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
  field-hero-panel:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  field-hero-panel-dark:
    backgroundColor: "{colors.violet}"
    rounded: "{rounded.lg}"
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

Daylight paper with an ink night window. The visitor reads on warm paper (`#f3f2ee`); each page opens beside a rounded ink panel (violet in the dark theme) holding a **generative field**: a canvas of particles that forms a page-specific shape (the M-wave mark on Home, five orbits on Services, sorting lanes for virtual assistance, a narrowing funnel for recruitment, balancing columns for accounting, lines of a page for legal, a wireframe for web, a team network on About, wave-line currents on the blog, two linked clusters on Contact, a boundary on Privacy, an index grid on Terms, a scattered "404"). The pointer parts the field and a press sends a ripple. These are interactive graphics, not images or infographics.

The site's working **instruments** (live shift dial, comparison divider, service matrix, inbox triage, hiring funnel, bank reconciliation, clause abstractor, page builder, org chain, call week, article search, reading outline, data flow, clause index, page finder) sit further down each page in their own sections, usually on an edge-to-edge ink band.

Structure and copy follow the Sample-3 site: home (ten sections), services hub, five service pages at short URLs, about, blog with 18 guides, contact, privacy, terms, 404.

## Colors

- **Paper `#f3f2ee`** is the light ground (default theme); **ink `#161110`** is the text, the primary button and the hero/instrument panels.
- **Chartreuse `#dbde2e`** is the highlighter: the "New" badge, the CTA band, selected states, the comparison's Akrostech column, button hover, the `.mark` stroke behind a word. It is a fill, never text on paper (text on chartreuse is always ink). On ink panels chartreuse can be text.
- **Lavender `#c5baea`** (light) and **violet `#6327c5`** (dark) are the soft fields: a lead bento cell, the services-menu header, the mission panel, key-takeaway boxes, focus rings in light (`--focus` violet).
- **Dark theme**: ink ground, paper text, chartreuse primary buttons, violet hero panels and soft fields; ink bands lift to `#1c1615` with a hairline.
- Secondary text: `#5c524d` on paper (7:1), `#bfb8b1` on ink (9:1). All body text ≥ 4.5:1 in both themes.

## Typography

- **Bricolage Grotesque** (variable, optical size) for every heading and figure, 700, tight tracking, sentence case. Headlines are two phrases; the second steps back in tone (`.quiet`).
- **Figtree** for text, labels and controls.
- Body 1.0625rem / 1.6; prose measure 38rem (about 75 characters).

## Layout

- `.wrap` (max 1600px) + `.grid` (4 / 8 / 12 columns; `.c-N` spans, `.s-N` starts that keep the span).
- `FieldHero`: words on 5 columns, field panel on 6 (switches with `wide` for long headlines); stacks on phones.
- Section heads: h2 left, supporting paragraph right. Sections alternate paper, bands of ink (instruments) and one chartreuse CTA band per page.
- Compositions vary by section: hover-photo service index, ink band with the dial and a shared-day timeline, a step track, a bento, tabs, the comparison divider, a sticky-heading FAQ.

## Elevation & Depth

Flat with hairlines (`--rule`) and plate steps. Shadows only for floating UI (the services menu). Instrument bands are full-width section colour, so the instruments' own panels are first-level (no cards in cards).

## Shapes

Rounded: panels `1.25rem`, large panels and the field window `2rem`, inputs `0.75rem`, buttons and chips pills, icon buttons round. Icons are drawn with round caps and joins, matching the logo's line.

## Components

- **Buttons**: `.btn--primary` (ink → chartreuse on hover; chartreuse in dark), `.btn--ghost` (outline), press `scale(.97)` at 160ms, hover only on fine pointers, `aria-busy` spinner.
- **Header**: logo, Services disclosure menu (all services & comparison, then five services with "New"), About, Blog, Contact, New York and India clocks (wide screens), theme switch, Book a call. Mobile: full-screen dialog menu.
- **Footer**: ink panel with brand column, Services, Company, Contact, legal line.
- **FieldHero**: canvas field + caption + pause button (WCAG 2.2.2); static settled frame under reduced motion; starts after first paint at idle; pauses off-screen.
- **Compare**: draggable divider, option switch (in-house hire / freelance marketplace), keyboard slider.
- **Photo**: AVIF/WebP via Astro, rounded, clip reveal; stock photography never presented as Akrostech people.

## Do's and Don'ts

**Do**
- Keep chartreuse as a fill; let lavender/violet carry the soft emphasis.
- Give every new page a field formation of its own and put any working tool in the body, on an ink band.
- Use the Sample-3 copy and the published figures only.
- Keep motion purposeful: one authored moment per view, ease-out curves, under 300ms for UI, everything usable with reduced motion and without JavaScript.

**Don't**
- No chartreuse text on paper, no gradient text, no glass, no side-stripe borders, no eyebrows above headings, no decorative numbering, no cards inside cards, no logo walls or invented proof.
- No images or infographics in hero sections; the hero graphic is the field.
