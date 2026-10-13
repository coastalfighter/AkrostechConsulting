# Akrostech Consulting — website

Marketing website for **Akrostech Consulting**: vetted professionals in India working U.S. business hours (virtual assistance, recruitment process outsourcing, accounting, legal process outsourcing and website development). Headquartered at 1207 Delaware Ave, Wilmington, DE 19806.

The design is built around one idea from the business itself: **your team in India, working your U.S. hours**. The 24-hour band (one cell per hour of the client's day, the India shift lit in moss) appears in the preloader, the artwork, the favicon and the 404, and the homepage's **shift planner** lets a visitor pick their time zone and see their specialist's India shift live.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 7](https://astro.build) — static output, zero JS by default, per-page code splitting |
| Hosting | Vercel (`@astrojs/vercel`); static pages plus one serverless function (`/api/contact`) |
| Type | Space Grotesk (display) + Inter (text), self-hosted variable WOFF2 with metric-matched fallbacks |
| Motion | GSAP 3 (ScrollTrigger, SplitText), Lenis smooth scroll, native cross-document View Transitions |
| 3D | Three.js particle globe (lazy-loaded, desktop / capable devices only, static SVG poster otherwise) |
| Images | Generated artwork → Astro `<Picture>` (AVIF + WebP srcsets) with blur-up placeholders |
| Tests | Vitest (time-zone maths, SEO metadata lengths and schema, contact validation, rate limiting) |

## Project structure

```
.
├── astro.config.mjs          # site URL, Vercel adapter, sitemap, env schema, CSS inlining
├── vercel.json               # security headers (CSP, HSTS…), caching, clean URLs
├── .env.example              # copy to .env for local development
├── scripts/
│   └── generate-art.mjs      # npm run art → artwork, OG cards, icons
├── public/                   # fonts, OG images, icons, manifest
├── src/
│   ├── config/site.ts        # NAP, hours, geo, socials — single source of truth
│   ├── data/                 # services, web dev tiers, work blueprints, company, locations, page meta, reviews
│   ├── content/blog/*.md     # articles (typed collection, see content.config.ts)
│   ├── lib/                  # seo.ts (JSON-LD), time.ts (shift maths), contact.ts, rate-limit.ts, blog.ts
│   ├── styles/               # tokens.css (design system), base.css (global components)
│   ├── scripts/              # main.ts (always), motion.ts + hero3d.ts (lazy), theme, menu, favicon…
│   ├── components/           # Header, Footer, PageHero, Media, ShiftPlanner, Carousel3D, Faq, CtaBand…
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
| `npm run art` | Regenerate artwork, OG cards and icons (after adding services, blueprints, posts or locations) |

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
- **Blog:** add a Markdown file to `src/content/blog/`. Frontmatter is validated (see `src/content.config.ts`); `metaTitle` must be 50–60 characters and `description` 150–160 (enforced by `npm test`). Run `npm run art` to create its cover and OG card.
- **Page titles and descriptions:** `src/data/pages.ts` (tests enforce lengths and uniqueness).

## Design system

`src/styles/tokens.css` defines:

- **Colour:** full 50–950 scales for *sand* (neutral), *moss* (accent), *char* (ink) and *clay* (errors), mapped to semantic roles with `light-dark()` so light and dark themes come from one set of tokens. All text pairs meet WCAG AA in both themes.
- **Type:** fluid `clamp()` scale from 320 px to 1920 px, display tracking and leading.
- **Space, elevation, radius, motion** (easing curves, durations, stagger) and z-index layers.

The theme toggle follows the platform pattern (system by default, a stored override only when it differs from the system) and switches with a circular View Transition from the toggle.

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
| Website development | 99 | 100 | 100 | 100 |
| About | 99 | 100 | 100 | 100 |
| Work | 99 | 100 | 100 | 100 |
| Blog | 100 | 100 | 100 | 100 |
| Contact | 99 | 100 | 100 | 100 |
| Wilmington | 99 | 100 | 100 | 100 |

CLS 0 on all pages; LCP 1.7–2.2 s. Scores vary a few points between runs; re-measure on the deployed site.

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

Code © Akrostech Consulting. Fonts: Space Grotesk and Inter, SIL Open Font License (see `public/fonts/`). Third-party Claude Code skills in `.claude/skills/` keep their own licenses.
