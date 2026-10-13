/**
 * Website Development: the service that is new to Akrostech. Sub-services, stack, process,
 * pricing tiers and FAQs for /services/website-development.
 *
 * Pricing tiers are "starting from" figures for the website build only. Confirm them with the
 * business before launch; they are rendered verbatim and also emitted in Service/Offer schema.
 */
import type { Faq } from './services';

export interface WebSubService {
  id: string;
  title: string;
  summary: string;
  body: string;
  deliverables: string[];
  stack: string[];
}

export const webSubServices: WebSubService[] = [
  {
    id: 'custom-web-design',
    title: 'Custom web design and development',
    summary: 'A site designed for your buyers, not adapted from a theme.',
    body: 'We start from your sales conversation: what buyers ask, what convinces them, what they need to see before they call. The design follows from that, built as a component system your team can extend without breaking it.',
    deliverables: ['Content and page architecture', 'Design system and page designs', 'Hand-built, accessible front end', 'Analytics and conversion tracking'],
    stack: ['Astro', 'Next.js', 'Tailwind CSS', 'Figma'],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce: Shopify, WooCommerce and custom',
    summary: 'Stores that load fast, check out cleanly and are simple to run day to day.',
    body: 'Shopify for brands that want to sell, not maintain servers. WooCommerce when content and commerce share one WordPress site. Custom headless storefronts when catalogue size, B2B pricing or performance demand it.',
    deliverables: ['Theme or headless storefront build', 'Product data migration', 'Payment, shipping and tax setup', 'Apps and integration configuration'],
    stack: ['Shopify', 'Shopify Hydrogen', 'WooCommerce', 'Stripe'],
  },
  {
    id: 'cms-development',
    title: 'CMS development: WordPress and headless',
    summary: 'Editing your own site should take minutes, not a developer ticket.',
    body: 'Custom WordPress themes built with blocks your editors can actually use, or a headless CMS such as Sanity, Contentful or Strapi feeding a fast static front end. Either way, editors get structured fields, previews and guardrails.',
    deliverables: ['Content model and editor roles', 'Custom blocks and templates', 'Preview and publishing workflow', 'Editor training and documentation'],
    stack: ['WordPress', 'Sanity', 'Contentful', 'Strapi'],
  },
  {
    id: 'web-applications',
    title: 'Web applications',
    summary: 'Portals, dashboards and internal tools that replace the spreadsheet.',
    body: 'Client portals, booking systems, quoting tools and internal dashboards, built on typed, tested code with authentication, role-based access and audit logs from the first release.',
    deliverables: ['Product scoping and user flows', 'Authentication and roles', 'API and database design', 'Automated tests and CI'],
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 'landing-pages',
    title: 'Landing pages',
    summary: 'One page, one offer, one action, shipped in days.',
    body: 'Campaign and product landing pages built to a single conversion goal, wired to your ads and CRM, and set up for A/B testing so the second version beats the first.',
    deliverables: ['Conversion copy structure', 'Responsive build', 'Form and CRM integration', 'A/B testing setup'],
    stack: ['Astro', 'Webflow', 'HubSpot', 'Google Tag Manager'],
  },
  {
    id: 'redesign-migration',
    title: 'Website redesign and migration',
    summary: 'A new site that keeps every ranking the old one earned.',
    body: 'We crawl the current site, map every URL that earns traffic or links, and ship with redirects, metadata and structured data intact. Platform moves include WordPress to headless, Wix or Squarespace to custom, and Magento to Shopify.',
    deliverables: ['Full-site crawl and URL map', '301 redirect plan', 'Content migration', 'Post-launch ranking monitoring'],
    stack: ['Screaming Frog', 'Google Search Console', 'WordPress', 'Shopify'],
  },
  {
    id: 'pwa',
    title: 'Progressive web apps',
    summary: 'App-like speed and offline support, without the app store.',
    body: 'Installable web apps with offline caching, background sync and push notifications, for field teams, ordering flows and repeat-use tools where a native app would be overkill.',
    deliverables: ['Service worker and caching strategy', 'Install experience', 'Offline-first data sync', 'Push notifications'],
    stack: ['Workbox', 'React', 'IndexedDB', 'Web Push'],
  },
  {
    id: 'maintenance-support',
    title: 'Maintenance and support',
    summary: 'Updates, backups and fixes handled before you notice them.',
    body: 'Monthly plans covering platform and plugin updates, uptime monitoring, backups, security patches and a block of development hours for the small changes every site needs.',
    deliverables: ['Updates and security patches', 'Uptime and error monitoring', 'Daily backups with restore tests', 'Monthly change hours'],
    stack: ['Sentry', 'UptimeRobot', 'GitHub', 'Cloudflare'],
  },
  {
    id: 'performance-optimization',
    title: 'Performance optimisation',
    summary: 'Pass Core Web Vitals and stop losing visitors to the back button.',
    body: 'We measure real-user LCP, INP and CLS, find what is slowing the page (images, fonts, third-party scripts, render-blocking code) and fix it in order of impact, with before-and-after numbers.',
    deliverables: ['Core Web Vitals audit', 'Image and font pipeline', 'Script and third-party budget', 'Before-and-after report'],
    stack: ['Lighthouse', 'PageSpeed Insights', 'WebPageTest', 'Chrome UX Report'],
  },
  {
    id: 'api-integration',
    title: 'API integration',
    summary: 'Your site, CRM, payments and back office talking to each other.',
    body: 'Forms that create CRM records, orders that reach the ERP, payments that reconcile in the ledger. We build integrations with retries, logging and alerts, so failures are noticed and fixed, not discovered.',
    deliverables: ['Integration design', 'Webhooks and middleware', 'Error handling and retries', 'Monitoring and alerts'],
    stack: ['REST', 'GraphQL', 'Zapier', 'Make'],
  },
];

export const techStack: { group: string; items: string[] }[] = [
  { group: 'Front end', items: ['Astro', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'GSAP'] },
  { group: 'Commerce', items: ['Shopify', 'Hydrogen', 'WooCommerce', 'Stripe', 'Klaviyo'] },
  { group: 'Content', items: ['WordPress', 'Sanity', 'Contentful', 'Strapi', 'Webflow'] },
  { group: 'Back end', items: ['Node.js', 'PostgreSQL', 'Supabase', 'Prisma', 'REST and GraphQL'] },
  { group: 'Hosting and ops', items: ['Vercel', 'Netlify', 'AWS', 'Cloudflare', 'GitHub Actions'] },
];

export const webProcess: { title: string; body: string; when: string }[] = [
  { title: 'Discovery', body: 'Goals, audience, competitors, content audit and a written scope with a fixed price.', when: 'Week 1' },
  { title: 'Architecture and content', body: 'Sitemap, page structure, SEO keyword map and the copy each page needs.', when: 'Weeks 1–2' },
  { title: 'Design', body: 'A design system and key page designs in Figma, reviewed with you in two rounds.', when: 'Weeks 2–4' },
  { title: 'Build', body: 'Accessible, typed, tested code on a staging URL you can click through every week.', when: 'Weeks 4–8' },
  { title: 'Launch', body: 'Redirects, analytics, Search Console, performance checks and a launch-day watch.', when: 'Launch week' },
  { title: 'Care', body: 'Monitoring, updates and monthly improvement hours, if you want us to stay on.', when: 'Ongoing' },
];

export interface PricingTier {
  name: string;
  from: number;
  /** ISO 4217 */
  currency: 'USD';
  timeline: string;
  bestFor: string;
  includes: string[];
  featured?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Launch',
    from: 2500,
    currency: 'USD',
    timeline: '1–2 weeks',
    bestFor: 'A focused landing page or a five-page site for a new business or campaign.',
    includes: ['Up to 5 pages', 'Responsive, accessible build', 'On-page SEO and schema', 'Contact form and analytics', '30 days of post-launch fixes'],
  },
  {
    name: 'Growth',
    from: 6500,
    currency: 'USD',
    timeline: '4–6 weeks',
    bestFor: 'A full business website with a CMS your team can edit.',
    includes: ['Up to 20 templates and pages', 'Custom design system', 'WordPress or headless CMS', 'Blog and resources section', 'Migration and redirects', 'Core Web Vitals pass'],
    featured: true,
  },
  {
    name: 'Commerce and apps',
    from: 15000,
    currency: 'USD',
    timeline: '8–14 weeks',
    bestFor: 'Online stores, customer portals and web applications.',
    includes: ['Shopify, WooCommerce or custom', 'Integrations with CRM, ERP and payments', 'Authentication and user roles', 'Automated tests and CI', 'Launch support and monitoring'],
  },
];

export const webFaqs: Faq[] = [
  {
    q: 'How much does a business website cost?',
    a: 'A focused five-page site starts at $2,500, a full business site with a CMS from $6,500, and online stores or web applications from $15,000. The fixed price for your project is set at the end of the one-week discovery.',
  },
  {
    q: 'How long does a website take to build?',
    a: 'One to two weeks for a landing page or small site, four to six weeks for a full business website, and eight to fourteen weeks for e-commerce and web applications.',
  },
  {
    q: 'Should I choose WordPress, Shopify or a custom build?',
    a: 'Shopify if selling products is the main job. WordPress if your team publishes often and wants a familiar editor. A custom or headless build when speed, security or unusual functionality matter more than plugins.',
  },
  {
    q: 'Will my site be optimised for search engines?',
    a: 'Yes. Every build ships with semantic HTML, metadata, structured data, an XML sitemap, clean URLs, redirects from the old site and Core Web Vitals checked before launch.',
  },
  {
    q: 'Do I own the code and content?',
    a: 'Yes. The code lives in your repository, the hosting and domain are in your name, and you can take the site to any other team at any time.',
  },
  {
    q: 'Can you redesign my site without losing Google rankings?',
    a: 'Yes. We crawl the existing site, map every URL that earns traffic, keep or redirect each one and monitor rankings after launch so any drop is caught early.',
  },
  {
    q: 'Do you offer ongoing maintenance?',
    a: 'Yes. Monthly care plans cover updates, backups, uptime and security monitoring, plus a block of hours for content changes and improvements.',
  },
];
