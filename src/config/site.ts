/**
 * Single source of truth for the business identity (NAP), contact routes and opening hours.
 * Every page, footer, schema block and map reads from here so NAP stays consistent site-wide.
 */

export interface OpeningHours {
  /** schema.org day names */
  days: readonly ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[];
  opens: string;
  closes: string;
}

export const site = {
  name: 'Akrostech Consulting',
  shortName: 'Akrostech',
  legalName: 'Akrostech Consulting',
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://www.akrosstech.com',
  tagline: 'Your team in India. Working your U.S. hours.',
  promise: 'Offshore talent. Onshore quality.',
  description:
    'Akrostech places vetted professionals in India on your U.S. business hours: virtual assistants, recruiters, accountants, legal support and web developers.',
  locale: 'en_US',
  language: 'en-US',

  email: 'contact@akrostech.info',
  phone: '+1 (332) 287-0846',
  phoneE164: '+13322870846',
  calendly: 'https://calendly.com/akrostech/30min',

  address: {
    street: '1207 Delaware Ave',
    locality: 'Wilmington',
    region: 'DE',
    regionName: 'Delaware',
    postalCode: '19806',
    country: 'US',
    countryName: 'United States',
  },
  geo: { latitude: 39.7563, longitude: -75.5634 },

  /** Office hours for the Wilmington headquarters, U.S. Eastern Time. */
  hours: [{ days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' }] as readonly OpeningHours[],
  hoursLabel: 'Monday to Friday, 9:00 am to 6:00 pm ET',
  timezone: 'America/New_York',

  deliveryCountry: 'India',
  deliveryTimezone: 'Asia/Kolkata',

  areaServed: ['United States', 'Canada'],
  serviceCities: ['Wilmington, DE', 'Philadelphia, PA', 'New York, NY'],

  socials: {
    linkedin: 'https://www.linkedin.com/company/akrostech-consulting/',
  },

  /** Visible proof figures. Only figures the business already publishes. */
  figures: {
    professionals: 100,
    projects: 100,
    accuracy: 98,
    onboardingHours: 48,
    matchHours: 24,
  },
} as const;

export type Site = typeof site;

export const fullAddress = `${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`;

export const mapsQuery = encodeURIComponent(`${site.name}, ${fullAddress}`);
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=15&output=embed`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
export const mapsPlaceUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

export const absoluteUrl = (path = '/'): string => {
  const clean = path === '/' ? '' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return `${site.url}${clean}`;
};
