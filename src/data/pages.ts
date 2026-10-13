/**
 * Metadata for the fixed pages. Titles are 50-60 characters and descriptions 150-160;
 * `tests/seo.test.ts` enforces both for every page on the site.
 */
export const pages = {
  home: {
    title: 'Offshore Talent on U.S. Hours | Akrostech Consulting',
    description:
      'Vetted professionals in India working your U.S. hours: virtual assistants, recruiters, accountants, legal support and web developers. Onboarded within 48 hours.',
    path: '/',
  },
  about: {
    title: 'About Akrostech: Offshore Teams, Onshore Standards',
    description:
      'Akrostech places vetted professionals in India on U.S. working hours, from our headquarters in Wilmington, Delaware. Our mission, values, standards and people.',
    path: '/about',
  },
  services: {
    title: 'Outsourcing Services for Growing U.S. Teams | Akrostech',
    description:
      'Virtual assistance, recruitment process outsourcing, accounting, legal process outsourcing and website development, delivered from India on your U.S. hours.',
    path: '/services',
  },
  work: {
    title: 'Work & Engagement Blueprints by Practice | Akrostech',
    description:
      'How Akrostech staffs and runs real engagements: executive assistants, hiring pods, month-end close, contract backlogs, Shopify rebuilds and client portals.',
    path: '/work',
  },
  blog: {
    title: 'Outsourcing, Hiring & Web Insights Blog | Akrostech',
    description:
      'Practical guides on virtual assistants, recruitment outsourcing, offshore accounting, legal process outsourcing and building fast business websites that rank.',
    path: '/blog',
  },
  contact: {
    title: 'Contact Akrostech: Book a 30-Minute Discovery Call',
    description:
      'Talk to Akrostech about offshore virtual assistants, recruiters, accountants, legal support or a new website. Wilmington, DE office. Reply in one business day.',
    path: '/contact',
  },
  privacy: {
    title: 'Privacy Policy: How We Handle Your Data | Akrostech',
    description:
      'How Akrostech Consulting collects, uses, protects and retains personal information from website visitors, enquiries and clients, and the choices you have.',
    path: '/privacy',
  },
  terms: {
    title: 'Website Terms and Conditions of Use and Access | Akrostech',
    description:
      'The terms that govern your use of the Akrostech Consulting website, including content ownership, acceptable use, third-party links, liability and governing law.',
    path: '/terms',
  },
  notFound: {
    title: 'Page Not Found: Let’s Get You Back on Track | Akrostech',
    description:
      'The page you were looking for has moved or no longer exists. Find our services, blueprints, articles and contact details from here, or go back to the homepage.',
    path: '/404',
  },
  locations: {
    title: 'Service Areas: Wilmington, Philadelphia & NYC | Akrostech',
    description:
      'Akrostech serves businesses across the United States from Wilmington, Delaware, with dedicated support for Wilmington, Philadelphia and New York City teams.',
    path: '/locations',
  },
} as const;

export type PageKey = keyof typeof pages;
