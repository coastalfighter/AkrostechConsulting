# Akrostech Consulting — website

Marketing website for **Akrostech Consulting**: vetted professionals in India working U.S. business hours (virtual assistance, recruitment process outsourcing, accounting, legal process outsourcing and website development). Headquartered at 1207 Delaware Ave, Wilmington, DE 19806.

Structure and copy follow the Sample-3 site ([coastalfighter/Akrostech-Consulting-Sample-3](https://github.com/coastalfighter/Akrostech-Consulting-Sample-3)): home, services hub, five service pages, about, a blog of 18 guides, contact and the legal pages. The look uses the client palette: paper `#f3f2ee`, ink `#161110`, chartreuse `#dbde2e` and lavender `#c5baea` (light, the default) with violet `#6327c5` in the dark theme, set in Bricolage Grotesque and Figtree. **Every page hero is a real-time 3D signature object** (three.js) in the brand palette: a live Earth with the real day/night line and live clocks on Home, a glass recruitment funnel, a balancing ledger, an exploded browser and so on. The pointer tilts it, dragging turns it, a press sends a pulse. The site's working tools (live shift dial, comparison divider, service matrix, inbox triage, hiring funnel, reconciliation, clause abstractor, page builder, org chain, call week, article search and outline, data flow, clause index, page finder) live further down each page.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 7](https://astro.build) — static output, zero JS by default, per-page code splitting |
| Hosting | Vercel (`@astrojs/vercel`); static pages plus one serverless function (`/api/contact`) |
| Type | Bricolage Grotesque (display, variable with optical size) and Figtree (text), self-hosted WOFF2 with metric-matched fallbacks |
| Motion | Lenis smooth scroll (fine pointers), IntersectionObserver reveals, CSS transitions, cross-document View Transitions |
| Heroes | three.js scenes (`src/scripts/hero3d/`), one per page, loaded as separate chunks at idle after load and only on GPU WebGL, paused off-screen, one still frame under reduced motion |
| Instruments | One lazy-loaded module per tool in `src/scripts/instruments/`, loaded as its section nears the viewport, server-rendered in a working default state |
| Images | Stock photography (Unsplash License, `src/assets/photos/credits.json`) → Astro `<Picture>` (AVIF + WebP srcsets) |
| Tests | Vitest (time-zone maths, SEO metadata lengths and schema, contact validation, rate limiting) |

## Project structure

```
.
├── astro.config.mjs          # site URL, Vercel adapter, sitemap, env schema, CSS inlining
├── vercel.json               # security headers (CSP, HSTS…), caching, clean URLs
├── .env.example              # copy to .env for local development
├── scripts/
│   ├── generate-og.mjs       # npm run og → Open Graph cards and app icons
│   ├── generate-land-dots.mjs # npm run land → src/scripts/hero3d/land.json (globe land dots)
│   └── fetch-photos.mjs      # downloads the stock photographs and writes credits.json
├── public/                   # fonts, OG images, icons, manifest
├── src/
│   ├── config/site.ts        # NAP, hours, geo, socials — single source of truth
│   ├── data/                 # services, serviceMedia, home, about, company, page meta, photos, reviews
│   ├── content/blog/*.md     # articles (typed collection, see content.config.ts)
│   ├── lib/                  # seo.ts (JSON-LD), time.ts (shift maths), contact.ts, rate-limit.ts, blog.ts
│   ├── styles/               # tokens.css (design system), base.css (global components)
│   ├── assets/photos/        # stock photographs + credits.json (licence and source per photo)
│   ├── scripts/              # main.ts, hero3d/ (3D engine, geo, land dots, scenes/*.ts), instruments/*.ts (lazy), motion.ts (lazy), theme, menu, header
│   ├── components/           # Logo, Header, Footer, Hero3D, instruments/*, Photo, Compare, PostCard, GuideCard, TrailSteps, Faq, CtaBand…
│   ├── layouts/              # BaseLayout (SEO head, schema graph, shell), LegalLayout
│   └── pages/                # routes, incl. api/contact.ts, rss.xml.ts, robots.txt.ts
└── tests/                    # Vitest suites
```

### Routes

`/` · `/services` · `/services/{virtual-assistance, recruitment, accounting, legal, website-development}` · `/about` · `/blog` · `/blog/{slug}` · `/contact` · `/privacy` · `/terms` · `/404` · `/rss.xml` · `/sitemap-index.xml` · `/robots.txt` · `POST /api/contact`

Redirects (in `vercel.json`): the legacy WordPress URLs, the earlier long service URLs, the removed Work and Locations pages, and the earlier blog slugs all go permanently to their closest new page.

## Getting started

Requires **Node 22.12+**.

```bash
npm install
cp .env.example .env          # optional locally; the form shows a fallback without a key
npm run dev                   # http://localhost:4321
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` and `.vercel/output/` |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check `.astro` and `.ts` files |
| `npm run land` | Rebuild the globe's land dots from Natural Earth (world-atlas) |
| `npm test` | Run the Vitest suites |
| `npm run og` | Regenerate Open Graph cards and icons (after adding services or posts) |

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | recommended | Canonical origin (default `https://www.akrosstech.com`) for canonical URLs, sitemap, OG |
| `RESEND_API_KEY` | for the form | [Resend](https://resend.com) API key used to email enquiries |
| `CONTACT_TO_EMAIL` | optional | Inbox for enquiries (default `contact@akrostech.info`) |
| `CONTACT_FROM_EMAIL` | optional | Verified sender on your Resend domain |
| `ALLOWED_ORIGINS` | optional | Comma-separated extra origins allowed to POST to `/api/contact` |

Without `RESEND_API_KEY` the endpoint returns a 503 with the email address and phone number, so no enquiry is silently lost.

## Deployment (Vercel)

1. Import the repository in Vercel (framework preset: Astro; build `npm run build`).
2. Add the environment variables above for Production and Preview.
3. Add the domain (`akrosstech.com` and `www.akrosstech.com`) and redirect the apex to `www`.
4. In Resend, verify the sending domain and set `CONTACT_FROM_EMAIL` to an address on it.
5. Submit `https://www.akrosstech.com/sitemap-index.xml` in Google Search Console.

`vercel.json` sets HSTS, a Content-Security-Policy (allowing Google Maps and Calendly frames), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and immutable caching for hashed assets and fonts.

## Editing content

- **Business details (NAP, hours, phone, email, socials):** `src/config/site.ts`. Every page, the footer, maps and the LocalBusiness schema read from here.
- **Services:** `src/data/services.ts` (copy from Sample-3: benefits, offerings, process, FAQs, engagement models, tech stack); per-service hero extras and the instrument section copy in `src/data/serviceMedia.ts`.
- **Homepage and About:** `src/data/home.ts`, `src/data/about.ts`.
- **Testimonials and ratings:** `src/data/reviews.ts`. Empty on purpose. Add only real, permission-granted reviews; the homepage carousel switches to them and `AggregateRating` schema is emitted automatically.
- **Blog:** add a Markdown file to `src/content/blog/` with the Sample-3 frontmatter (`title`, `description`, `date`, `author`, `tags`, optional `service`, `keywords`, `faqs`, `draft`) plus `metaTitle`. Frontmatter is validated (see `src/content.config.ts`); `metaTitle` must be 50–60 characters with the brand and `description` 150–160 (enforced by `npm test`). FAQs render under the post with FAQPage schema. The cover photo follows the post's service (see `src/data/photos.ts`); run `npm run og` to create its social card.
- **Page titles and descriptions:** `src/data/pages.ts` (tests enforce lengths and uniqueness).

## Design system

Documented in `DESIGN.md` (with a machine-readable sidecar in `.impeccable/design.json`). In short:

- **Colour** (`src/styles/tokens.css`): the client palette as primitive scales (`--lime-*` = chartreuse, `--carbon-*` = ink/paper, `--violet-*`) mapped to semantic roles (`--ground`, `--plate`, `--ink`, `--ink-2`, `--rule`, `--accent`, `--mark`, `--field`, `--second`). Light is the default; `data-theme="dark"` is stored when chosen. `.lime` is a chartreuse field, `.violet` a lavender/violet field, `.ink-plate` an ink panel; a section containing a `.band` is painted ink edge to edge for instruments.
- **Type:** Bricolage Grotesque for headings and figures, Figtree for text; two-part headlines with a quieter second phrase.
- **Shape:** rounded panels, pill buttons and chips, round icon buttons.
- **Motion:** Emil Kowalski's curves, 160 ms press feedback, UI motion under 300 ms, one authored moment per view (the hero object); reduced motion keeps everything static and usable, and the hero renders one settled frame.

## SEO, local SEO and accessibility

- Unique 50–60 character titles and 150–160 character descriptions on every page (tested), canonical URLs, Open Graph and Twitter cards with a generated 1200×630 image per page.
- One JSON-LD `@graph` per page: Organization, WebSite, ProfessionalService/LocalBusiness (full NAP, geo, hours, service area), WebPage, BreadcrumbList, plus Service, FAQPage, Article/Blog and ItemList where relevant. AggregateRating appears only with real reviews.
- Semantic landmarks, one H1 per page, skip link, visible focus, 44 px targets, native `<dialog>` menu, `<details>` FAQs, accessible tabs, form errors shown after interaction, `prefers-reduced-motion` respected throughout (no smooth scroll, still hero frame), and a pause control on every moving hero graphic.

### Lighthouse (mobile, simulated throttling, production build behind gzip)

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 97 | 100 | 100 | 100 |
| Services | 99 | 100 | 100 | 100 |
| Virtual assistance | 99 | 100 | 100 | 100 |
| Website development | 99 | 100 | 100 | 100 |
| About | 98 | 100 | 100 | 100 |
| Blog | 99 | 100 | 100 | 100 |
| Guide (website cost) | 99 | 100 | 100 | 100 |
| Contact | 100 | 100 | 100 | 100 |

CLS 0; LCP 2.4–2.7 s; TBT 10–80 ms (the hero scene starts at idle after load, and only where WebGL runs on a GPU, so lab tools on software rendering measure the page without it). Scores vary a few points between runs; re-measure on the deployed site.

## Before launch: confirm with the business

These are written in, but need a human to confirm:

1. **Email address.** The live site uses both `contact@akrosstech.info` and `contact@akrostech.info`; this build uses `contact@akrostech.info` (from the redesign). Update `src/config/site.ts` if wrong.
2. **Office hours.** Set to Mon–Fri 9:00–18:00 ET; not published on either reference site.
3. **Geo coordinates** for 1207 Delaware Ave (approximate) — verify against your Google Business Profile.
4. **Savings claims** ("up to 70%", "60–70%", "up to 60%") come from the live and Sample-3 copy; confirm them. Pricing tiers were removed (Sample-3 shows engagement models instead).
5. **Team:** About describes roles with representative stock photography. Add real names and photos if you want them shown.
6. **New copy written for this build:** instrument section headings and intros, short Terms clause summaries, a few headline second phrases. Review them with the rest of the copy.
7. **Privacy policy and terms** are written for how this site works (updated for the removed Work and Locations pages); have them reviewed by counsel.
8. **Testimonials, client logos and case studies:** none are shown. Add real ones only with written permission.
9. **Security:** the current live site (akrosstech.com) contains injected casino spam pages and links, which suggests a compromised CMS. Clean it up and rotate credentials before or as part of this launch, then request removal of the spam URLs in Search Console.

## License

Code © Akrostech Consulting. Fonts: Bricolage Grotesque and Figtree, SIL Open Font License (see `public/fonts/`). Photographs: Unsplash License, credited in `src/assets/photos/credits.json`; they show people at work in general, not Akrostech staff or clients. Third-party Claude Code skills in `.claude/skills/` keep their own licenses.
