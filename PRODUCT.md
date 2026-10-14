# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Decision-makers at U.S. companies who are out of hours, not out of work, weighed equally on the homepage:

- Founders and owners of small and mid-size businesses who need a virtual assistant, a bookkeeper or a website.
- Operations and finance leaders at larger companies buying an outsourced team, who care about compliance, security, continuity and scale.
- Staffing agencies, CPA firms and law firms buying specialist back-office capacity (recruiting coordinators, accountants, legal assistants).

They are evaluating whether an offshore partner is trustworthy enough to touch their inbox, ledger, candidates or client files. Their job on the site: understand what Akrostech does, believe the quality and security, and book a 30-minute discovery call.

## Product Purpose

Akrostech Consulting places vetted professionals in India on U.S. working hours (Eastern, Central, Mountain or Pacific shifts) across five practices: Virtual Assistance, Recruitment Process Outsourcing, Accounting Assistance, Legal Process Outsourcing and Website Development (the newest practice). Success is a booked discovery call or a submitted enquiry.

## Positioning

Offshore talent, onshore quality. Specialists work the client's U.S. hours rather than overnight, every pod has a team lead reviewing work before it reaches the client, recurring work is written into SOPs the client owns, and replacements come from a vetted bench. Headquarters is in Wilmington, Delaware; delivery is in India.

## Operating Context

Buyers arrive from search, LinkedIn and referrals, often on a laptop during the working day, sometimes on a phone. They compare Akrostech with staffing agencies, freelancer marketplaces and local hires. The conversion path is a Calendly booking (https://calendly.com/akrostech/30min) or the contact form, then a discovery call, a shortlist within 24 hours and onboarding within 48 hours.

## Capabilities and Constraints

- Astro static site on Vercel with one serverless contact endpoint; content lives in `src/data/*` and `src/content/blog/*`.
- Pages: home, about, services hub, four staffing service pages, website development, blog and articles, contact, privacy, terms, 404 (Sample-3 sitemap). Former Work and Locations URLs redirect.
- Every page hero carries an interactive generative graphic with page-specific text; the interactive instruments sit further down each page (user requirement).
- Stock photography is used wherever imagery is needed (user requirement), credited and licensed for commercial use.
- Must stay fast (Core Web Vitals), accessible (WCAG 2.1 AA), SEO-complete (structured data, metadata) and respect reduced motion.
- Undecided: confirmed office hours (currently Mon–Fri 9:00–18:00 ET, assumed), the canonical email (akrostech.info vs akrosstech.info), website pricing tiers.

## Brand Commitments

- Use the akrosstech.com identity: the M-wave mark and the "Akrostech / CONSULTING" wordmark; logo files at `public/brand/`.
- Client-supplied palette (v3): light theme (default) paper `#f3f2ee`, chartreuse `#dbde2e`, ink `#161110`, lavender `#c5baea`; dark theme ink `#161110`, chartreuse `#dbde2e`, paper `#f3f2ee`, violet `#6327c5`. Chartreuse is a fill (highlights, CTA band, selected states), never text on paper.
- Taglines in use: "Your team in India. Working your U.S. hours." and "Offshore talent. Onshore quality." Secondary line: "Built for startups, scaled by enterprises, trusted by leaders."
- Structure and copy follow the Sample-3 site (github.com/coastalfighter/Akrostech-Consulting-Sample-3): home, services hub, five service pages (short URLs), about, blog (18 guides), contact, privacy, terms.
- Every page hero carries an interactive generative graphic (not an image, not an infographic). The interactive instruments (shift dial, comparison divider, service matrix, inbox triage, hiring funnel, reconciliation, clause abstractor, page builder, org chain, call week, article search and outline, data flow, clause index, page finder) live in page bodies.
- Real photography of professionals at work (stock, never presented as Akrostech staff).

## Evidence on Hand

- Business figures already published by the company: 100+ vetted professionals, 100+ projects running, 98% task accuracy, 48-hour onboarding, 24-hour shortlist, five-stage vetting.
- Contact: +1 (332) 287-0846, contact@akrostech.info, 1207 Delaware Ave, Wilmington, DE 19806; LinkedIn company page.
- No testimonials, client logos, named team members or client case studies exist. Do not fabricate them. Work is shown as clearly labelled engagement blueprints; reviews remain empty until real ones are supplied.
- The live site currently carries injected casino spam (a compromised CMS); never reuse its blog content.

## Product Principles

1. Earn trust before asking for the call: security, continuity and quality controls are shown, not asserted.
2. The U.S.-hours promise is the differentiator; make it tangible wherever it fits.
3. Five practices, one way of working: every service reads as part of one system.
4. Honest proof only: real figures, labelled blueprints, no invented clients.
5. Enterprise-credible and premium, never generic or empty.

## Accessibility & Inclusion

WCAG 2.1 AA: 4.5:1 text contrast, keyboard access, visible focus, 44px targets, reduced-motion alternatives for every animation and interactive hero.
