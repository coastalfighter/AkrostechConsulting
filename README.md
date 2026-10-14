# Akrostech Consulting — website

Marketing website for **Akrostech Consulting**: vetted professionals in India working U.S. business hours (virtual assistance, recruitment process outsourcing, accounting, legal process outsourcing and website development). Headquartered at 1207 Delaware Ave, Wilmington, DE 19806.

The visual world is a **standards manual**: the site reads as Akrostech's own corporate identity manual. Near-black plates, whole lime (`#C9FF4A`) fields, the M-wave mark from the akrosstech.com logo, Archivo set expanded for display, a visible 12-column grid with ruled modules, and real photography in grid modules. **Every page hero is a live, interactive diagram unique to that page**: the homepage shift dial (drag your U.S. working day, see the India shift and whether it's live right now), a practice matrix, an inbox triage, a hiring funnel model, a bank reconciliation, a clause abstractor, a page builder with a performance gauge, an org chain, a blueprint board, a timeline scrubber, a call-week grid, live article search, a reading outline, an I-95 corridor, city routes, a privacy data-flow, a terms clause index and a 404 page finder.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 7](https://astro.build) — static output, zero JS by default, per-page code splitting |
| Hosting | Vercel (`@astrojs/vercel`); static pages plus one serverless function (`/api/contact`) |
| Type | Archivo variable (weight 100–900, width 62–125%), self-hosted WOFF2 with a metric-matched fallback |
| Motion | Lenis smooth scroll (fine pointers), IntersectionObserver reveals, CSS transitions, cross-document View Transitions |
| Heroes | One lazy-loaded TypeScript module per page in `src/scripts/heroes/`, server-rendered in a working default state |
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
│   └── fetch-photos.mjs      # downloads the stock photographs and writes credits.json
├── public/                   # fonts, OG images, icons, manifest
├── src/
│   ├── config/site.ts        # NAP, hours, geo, socials — single source of truth
│   ├── data/                 # services, web dev tiers, work blueprints, company, locations, page meta, reviews
│   ├── content/blog/*.md     # articles (typed collection, see content.config.ts)
│   ├── lib/                  # seo.ts (JSON-LD), time.ts (shift maths), contact.ts, rate-limit.ts, blog.ts
│   ├── styles/               # tokens.css (design system), base.css (global components)
│   ├── assets/photos/        # stock photographs + credits.json (licence and source per photo)
│   ├── scripts/              # main.ts (always), motion.ts (lazy), heroes/*.ts (lazy, per page), theme, menu, header
│   ├── components/           # Logo, Header, Footer, Hero, heroes/*, Photo, Compare, PostCard, WorkCard, Faq, CtaBand…
│   ├── layouts/              # BaseLayout (SEO head, schema graph, shell), LegalLayout
│   └── pages/                # routes, incl. api/contact.ts, rss.xml.ts, robots.txt.ts
└── tests/                    # Vitest suites
```

### Routes

`/` · `/about` · `/services` · `/services/{virtual-assistance, recruitment-process-outsourcing, accounting-assistance, legal-process-outsourcing}` · `/services/website-development` · `/work` · `/work/{slug}` · `/blog` · `/blog/{slug}` · `/contact` · `/locations` · `/locations/{wilmington-de, philadelphia-pa, new-york-ny}` · `/privacy` · `/terms` · `/404` · `/rss.xml` · `/sitemap-index.xml` · `/robots.txt` · `POST /api/contact`

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
| `npm test` | Run the Vitest suites |
| `npm run og` | Regenerate Open Graph cards and icons (after adding services, blueprints, posts or locations) |

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
- **Services:** `src/data/services.ts`; Website Development extras (sub-services, stack, pricing tiers, FAQ) in `src/data/webdev.ts`.
- **Work:** `src/data/work.ts`. Entries are *engagement blueprints* (worked plans). For a real, approved case study set `kind: 'case-study'` and fill `client`, `outcomes` and `quote`; the template renders them.
- **Testimonials and ratings:** `src/data/reviews.ts`. Empty on purpose. Add only real, permission-granted reviews; the homepage carousel switches to them and `AggregateRating` schema is emitted automatically.
- **Blog:** add a Markdown file to `src/content/blog/`. Frontmatter is validated (see `src/content.config.ts`); `metaTitle` must be 50–60 characters and `description` 150–160 (enforced by `npm test`). Its cover photo is picked from `art`/`artVariant` (see `src/data/photos.ts`); run `npm run og` to create its social card.
- **Page titles and descriptions:** `src/data/pages.ts` (tests enforce lengths and uniqueness).

## Design system

The full system is documented in `DESIGN.md`. In short, `src/styles/tokens.css` defines:

- **Colour:** *lime* (brand, 50–950) and *carbon* (neutral, 0–950) scales mapped to semantic roles: `--ground`, `--plate`, `--ink`, `--ink-2`, `--rule`, `--accent`, `--field`. Dark is the brand default; `data-theme="light"` is the "printed manual" variant. The `.lime` class turns any module into a lime field and re-maps ink, rules, focus and buttons for it.
- **Type:** one family at two widths: expanded (125%) bold capitals for display, normal width for text, fluid `clamp()` sizes.
- **Grid:** `.grid` is 4 / 8 / 12 columns; `.c-N` spans and `.s-N` start columns; `.ruled` draws hairlines between modules.
- **Motion:** Emil Kowalski's curves (`--ease-out`, `--ease-in-out`, `--ease-drawer`), 160 ms press feedback, UI motion under 300 ms; reduced motion keeps everything visible and static.

`src/styles/base.css` holds the global components (buttons, links, chips, forms, photo modules, prose, reveal states). The theme switch stores the light choice only; the brand dark is the default.

## SEO, local SEO and accessibility

- Unique 50–60 character titles and 150–160 character descriptions on every page (tested), canonical URLs, Open Graph and Twitter cards with a generated 1200×630 image per page.
- One JSON-LD `@graph` per page: Organization, WebSite, ProfessionalService/LocalBusiness (full NAP, geo, hours, service area), WebPage, BreadcrumbList, plus Service (with Offer pricing), FAQPage, Article/Blog, ItemList and per-city Service nodes where relevant. AggregateRating appears only with real reviews.
- Service-area pages for Wilmington, Philadelphia and New York with unique copy, map embed and driving directions.
- Semantic landmarks, one H1 per page, skip link, visible focus, 44 px targets, native `<dialog>` menu, `<details>` FAQs, accessible tabs, form errors shown after interaction, `prefers-reduced-motion` respected throughout (no smooth scroll, no WebGL animation, static carousel), pausable marquee and carousel.

### Lighthouse (mobile, simulated throttling, production build behind gzip)

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 99 | 100 | 100 | 100 |
| Services | 99 | 100 | 100 | 100 |
| Virtual assistance | 99 | 100 | 100 | 100 |
| Website development | 99 | 100 | 100 | 100 |
| About | 100 | 100 | 100 | 100 |
| Work | 99 | 100 | 100 | 100 |
| Blog | 100 | 100 | 100 | 100 |
| Contact | 100 | 100 | 100 | 100 |
| Wilmington | 100 | 100 | 100 | 100 |

CLS 0 (0.002 on Contact); LCP 1.5–2.0 s; TBT 0–10 ms. Scores vary a few points between runs; re-measure on the deployed site.

## Before launch: confirm with the business

These are written in, but need a human to confirm:

1. **Email address.** The live site uses both `contact@akrosstech.info` and `contact@akrostech.info`; this build uses `contact@akrostech.info` (from the redesign). Update `src/config/site.ts` if wrong.
2. **Office hours.** Set to Mon–Fri 9:00–18:00 ET; not published on either reference site.
3. **Geo coordinates** for 1207 Delaware Ave (approximate) — verify against your Google Business Profile.
4. **Website pricing tiers** ($2,500 / $6,500 / $15,000 "from") and savings claims (from the redesign site).
5. **Team:** the team section describes roles. Add real names and photos in `src/data/company.ts` if you want them shown.
6. **Privacy policy and terms** are written for how this site works; have them reviewed by counsel.
7. **Testimonials and case studies** — add real ones with written permission (see above).
8. **Security:** the current live site (akrosstech.com) contains injected casino spam pages and links, which suggests a compromised CMS. Clean it up and rotate credentials before or as part of this launch, then request removal of the spam URLs in Search Console.

## License

Code © Akrostech Consulting. Font: Archivo, SIL Open Font License (see `public/fonts/`). Photographs: Unsplash License, credited in `src/assets/photos/credits.json`; they show people at work in general, not Akrostech staff or clients. Third-party Claude Code skills in `.claude/skills/` keep their own licenses.
