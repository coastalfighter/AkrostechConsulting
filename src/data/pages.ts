/**
 * Metadata for the fixed pages. Titles are 50-60 characters with the brand and descriptions
 * 150-160; `tests/seo.test.ts` enforces both for every page on the site.
 */
export const pages = {
  home: {
    title: 'Offshore Teams in India Working U.S. Hours',
    description:
      'Dedicated, vetted offshore teams in India for U.S. businesses: virtual assistants, recruiters, accountants, legal support and web developers. Live in 48 hours.',
    path: '/',
  },
  about: {
    title: 'About Akrostech: Offshore Teams for U.S. Businesses',
    description:
      'Akrostech is a Wilmington, Delaware company building dedicated, vetted offshore teams in India that work U.S. hours, from virtual assistance to web development.',
    path: '/about',
  },
  services: {
    title: 'Offshore Services: VA, RPO, Accounting, Legal',
    description:
      'Compare five offshore services: virtual assistants, recruitment outsourcing, accounting, legal process outsourcing and website development, all on U.S. hours.',
    path: '/services',
  },
  blog: {
    title: 'Offshore Staffing & Outsourcing Guides',
    description:
      'Practical guides on hiring virtual assistants, recruitment process outsourcing, offshore bookkeeping, legal process outsourcing and fast business websites.',
    path: '/blog',
  },
  contact: {
    title: 'Contact Akrostech: Get an Offshore Team Proposal Today',
    description:
      'Tell us what you need and we will match vetted, U.S.-hours talent to your workflow. Get a proposal within one business day or book a 30-minute discovery call.',
    path: '/contact',
  },
  privacy: {
    title: 'Privacy Policy: How We Handle Your Data',
    description:
      'How Akrostech Consulting collects, uses, protects and retains personal information from website visitors, enquiries and clients, and the choices you have.',
    path: '/privacy',
  },
  terms: {
    title: 'Website Terms and Conditions of Use and Access',
    description:
      'The terms that govern your use of the Akrostech Consulting website, including content ownership, acceptable use, third-party links, liability and governing law.',
    path: '/terms',
  },
  notFound: {
    title: 'Page Not Found: Let’s Get You Back on Track',
    description:
      'The page you were looking for has moved or no longer exists. Find our services, guides and contact details from here, or go back to the Akrostech homepage.',
    path: '/404',
  },
} as const;

export type PageKey = keyof typeof pages;
