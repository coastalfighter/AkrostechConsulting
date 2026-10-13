/**
 * SEO helpers: page metadata and JSON-LD builders.
 * All schema is emitted as one @graph per page so entities can reference each other by @id.
 */
import { absoluteUrl, fullAddress, site } from '@/config/site';
import type { Faq, Service } from '@/data/services';
import type { PricingTier } from '@/data/webdev';

export type JsonLd = Record<string, unknown>;

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

export const TITLE_RANGE = [50, 60] as const;
export const DESCRIPTION_RANGE = [150, 160] as const;

export const ids = {
  organization: `${site.url}/#organization`,
  business: `${site.url}/#business`,
  website: `${site.url}/#website`,
  logo: `${site.url}/#logo`,
};

export function canonical(path: string): string {
  return absoluteUrl(path);
}

/** Ensures every title carries the brand once. Titles are authored at 50-60 characters. */
export function pageTitle(title: string): string {
  return /akrostech/i.test(title) ? title : `${title} | ${site.shortName}`;
}

export function organizationSchema(): JsonLd {
  return {
    '@type': 'Organization',
    '@id': ids.organization,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    slogan: site.tagline,
    description: site.description,
    email: site.email,
    telephone: site.phoneE164,
    logo: {
      '@type': 'ImageObject',
      '@id': ids.logo,
      url: absoluteUrl('/logo.png'),
      width: 512,
      height: 512,
      caption: site.name,
    },
    image: { '@id': ids.logo },
    sameAs: Object.values(site.socials),
    address: postalAddress(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: site.phoneE164,
        email: site.email,
        areaServed: ['US', 'CA'],
        availableLanguage: ['English'],
      },
    ],
  };
}

export function postalAddress(): JsonLd {
  return {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  };
}

export function openingHoursSchema(): JsonLd[] {
  return site.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes,
  }));
}

export function localBusinessSchema(options: { rating?: JsonLd | null } = {}): JsonLd {
  const schema: JsonLd = {
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': ids.business,
    name: site.name,
    url: site.url,
    description: site.description,
    image: absoluteUrl('/og/default.png'),
    logo: { '@id': ids.logo },
    telephone: site.phoneE164,
    email: site.email,
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Bank transfer, ACH, credit card',
    address: postalAddress(),
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.latitude, longitude: site.geo.longitude },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
    openingHoursSpecification: openingHoursSchema(),
    areaServed: [
      ...site.areaServed.map((name) => ({ '@type': 'Country', name })),
      ...site.serviceCities.map((name) => ({ '@type': 'City', name })),
    ],
    parentOrganization: { '@id': ids.organization },
    sameAs: Object.values(site.socials),
    knowsLanguage: ['en'],
  };
  if (options.rating) schema.aggregateRating = options.rating;
  return schema;
}

export function websiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { '@id': ids.organization },
    inLanguage: site.language,
  };
}

export function webPageSchema(meta: PageMeta, extra: JsonLd = {}): JsonLd {
  const url = canonical(meta.path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: pageTitle(meta.title),
    description: meta.description,
    isPartOf: { '@id': ids.website },
    about: { '@id': ids.organization },
    inLanguage: site.language,
    ...(meta.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(meta.image) } } : {}),
    ...extra,
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: canonical(c.path),
    })),
  };
}

export function faqSchema(faqs: Faq[]): JsonLd | null {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function serviceSchema(service: Pick<Service, 'name' | 'slug' | 'summary' | 'meta'>, tiers: PricingTier[] = []): JsonLd {
  const url = canonical(`/services/${service.slug}`);
  const schema: JsonLd = {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.meta.description,
    url,
    provider: { '@id': ids.business },
    areaServed: site.areaServed.map((name) => ({ '@type': 'Country', name })),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: canonical('/contact'),
      servicePhone: site.phoneE164,
    },
  };
  if (tiers.length) {
    schema.offers = tiers.map((t) => ({
      '@type': 'Offer',
      name: t.name,
      description: t.bestFor,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: t.from,
        priceCurrency: t.currency,
      },
      url: `${url}#pricing`,
    }));
  }
  return schema;
}

export interface ArticleInput {
  title: string;
  description: string;
  path: string;
  image: string;
  published: Date;
  updated?: Date;
  author: string;
  category: string;
  wordCount: number;
}

export function articleSchema(a: ArticleInput): JsonLd {
  const url = canonical(a.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: a.title,
    description: a.description,
    image: [absoluteUrl(a.image)],
    datePublished: a.published.toISOString(),
    dateModified: (a.updated ?? a.published).toISOString(),
    author: { '@type': 'Organization', name: a.author, url: site.url },
    publisher: { '@id': ids.organization },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    articleSection: a.category,
    wordCount: a.wordCount,
    inLanguage: site.language,
  };
}

export interface Review {
  author: string;
  rating: number;
  body: string;
  date: string;
  /** Must be true: only reviews collected from real, named clients may be published. */
  verified: true;
}

/** AggregateRating is emitted only when real, verified reviews exist. */
export function aggregateRatingSchema(reviews: Review[]): JsonLd | null {
  const real = reviews.filter((r) => r.verified && r.rating >= 1 && r.rating <= 5);
  if (real.length === 0) return null;
  const avg = real.reduce((sum, r) => sum + r.rating, 0) / real.length;
  return {
    '@type': 'AggregateRating',
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: real.length,
    bestRating: 5,
    worstRating: 1,
  };
}

export function graph(...nodes: (JsonLd | null | undefined | false)[]): string {
  const clean = nodes.filter(Boolean) as JsonLd[];
  // Escape "<" so content can never close the surrounding <script> element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': clean }).replace(/</g, '\\u003c');
}
