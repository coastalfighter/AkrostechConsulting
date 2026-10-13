/**
 * Service-area pages. Each carries unique, locally relevant copy (not a doorway template):
 * the time zone, the industries that hire offshore support there, and how to reach the HQ.
 */
import type { Faq } from './services';

export interface Location {
  slug: string;
  city: string;
  region: string;
  regionName: string;
  isHeadquarters: boolean;
  geo: { latitude: number; longitude: number };
  meta: { title: string; description: string };
  headline: [string, string];
  intro: string;
  industries: { name: string; body: string }[];
  distance: string;
  body: string[];
  faqs: Faq[];
}

export const locations: Location[] = [
  {
    slug: 'wilmington-de',
    city: 'Wilmington',
    region: 'DE',
    regionName: 'Delaware',
    isHeadquarters: true,
    geo: { latitude: 39.7447, longitude: -75.5484 },
    meta: {
      title: 'Offshore Staffing & Outsourcing, Wilmington DE | Akrostech',
      description:
        'Akrostech is headquartered on Delaware Avenue in Wilmington. Virtual assistants, recruiters, accountants, legal support and web developers on Eastern hours.',
    },
    headline: ['Headquartered', 'in Wilmington.'],
    intro:
      'Our U.S. office is at 1207 Delaware Ave, a few minutes from Rodney Square and the Market Street business district. Wilmington clients get a client partner they can meet in person and a delivery team in India working Eastern time.',
    industries: [
      { name: 'Corporate and legal services', body: 'Registered agents, corporate service providers and law firms that live on Delaware entity work hand us entity records, filing calendars and document preparation.' },
      { name: 'Financial services', body: 'Banks, fund administrators and fintechs along the Wilmington riverfront use our accountants for reconciliations, reporting packs and back-office support.' },
      { name: 'Healthcare and life sciences', body: 'Practices and research suppliers in New Castle County use our assistants for scheduling, billing follow-up and vendor administration.' },
    ],
    distance: 'On Delaware Avenue (DE-52), five minutes from I-95 exit 7 and the Wilmington Amtrak station.',
    body: [
      'Wilmington is home to more registered corporations than almost anywhere in the country, and the firms that serve them run on precise, deadline-driven paperwork. That is the kind of recurring work our legal and accounting teams are built for.',
      'Because our specialists work Eastern time, a Wilmington team gets same-day answers: a reconciliation question asked at 10 am is answered before lunch, and filings due this afternoon are prepared this morning.',
      'Visits are by appointment. If you would rather meet at your office in Wilmington, Newark or Greenville, your client partner will come to you.',
    ],
    faqs: [
      { q: 'Can I meet the Akrostech team in Wilmington?', a: 'Yes. Book a visit to our office at 1207 Delaware Ave, or your client partner can meet you at your office in New Castle County.' },
      { q: 'Do you support Delaware corporate and registered-agent firms?', a: 'Yes. Our legal assistants handle entity records, annual report calendars and document preparation under your supervision.' },
      { q: 'What hours does a Wilmington client’s team work?', a: 'Eastern time, on the shift you choose, typically 9 am to 5 pm or 8 am to 4 pm ET.' },
    ],
  },
  {
    slug: 'philadelphia-pa',
    city: 'Philadelphia',
    region: 'PA',
    regionName: 'Pennsylvania',
    isHeadquarters: false,
    geo: { latitude: 39.9526, longitude: -75.1652 },
    meta: {
      title: 'Virtual Assistants & Outsourcing in Philadelphia | Akrostech',
      description:
        'Offshore virtual assistants, recruiters, bookkeepers and legal assistants for Philadelphia businesses, on Eastern hours, thirty minutes from our Wilmington HQ.',
    },
    headline: ['Philadelphia teams,', 'more hours.'],
    intro:
      'Philadelphia is thirty minutes up I-95 from our Wilmington headquarters. Center City firms, University City startups and suburban practices use Akrostech for the recurring work that keeps growing teams stretched.',
    industries: [
      { name: 'Healthcare and life sciences', body: 'Biotech startups and medical groups use our assistants for scheduling, credentialing paperwork and vendor coordination.' },
      { name: 'Law firms', body: 'Center City firms use our legal assistants for document preparation, deposition summaries and calendaring.' },
      { name: 'Professional services and startups', body: 'Accounting firms and University City startups use our bookkeepers, recruiters and web developers to scale without adding local headcount.' },
    ],
    distance: 'Thirty minutes from Center City via I-95 South; a short Amtrak or SEPTA ride to Wilmington station.',
    body: [
      'Philadelphia’s healthcare, legal and education economy produces a steady stream of administrative and documentation work. Our teams take that work on Eastern hours, so it moves during your working day rather than overnight.',
      'Many Philadelphia clients start with one virtual assistant or bookkeeper, then add a recruiter when hiring picks up. Each specialist is managed by a team lead who reports to you weekly.',
      'Your client partner is based in Wilmington and can meet in Center City or at your office.',
    ],
    faqs: [
      { q: 'Do you have an office in Philadelphia?', a: 'Our headquarters is thirty minutes away in Wilmington, Delaware. Your client partner meets Philadelphia clients in person on request.' },
      { q: 'Can your team support Philadelphia healthcare practices?', a: 'Yes, for administrative and back-office work such as scheduling, billing follow-up and vendor coordination, under your policies and access controls.' },
      { q: 'How fast can a Philadelphia business get started?', a: 'Most roles start within 48 hours of the discovery call.' },
    ],
  },
  {
    slug: 'new-york-ny',
    city: 'New York',
    region: 'NY',
    regionName: 'New York',
    isHeadquarters: false,
    geo: { latitude: 40.7128, longitude: -74.006 },
    meta: {
      title: 'Offshore Staffing for New York City Businesses | Akrostech',
      description:
        'Vetted offshore assistants, recruiters, accountants, legal support and web developers for New York companies, working Eastern time with no placement fees.',
    },
    headline: ['New York pace,', 'India bench.'],
    intro:
      'New York runs long days. Our specialists work them with you on Eastern time, from a founder’s inbox in Flatiron to a law firm’s document review in Midtown and an agency’s back office in Brooklyn.',
    industries: [
      { name: 'Startups and venture-backed companies', body: 'Founders use our executive assistants and recruiters to keep hiring and investor updates moving between raises.' },
      { name: 'Staffing and recruiting agencies', body: 'Agencies use our recruiting pods for sourcing, resume formatting, submittals and onboarding paperwork.' },
      { name: 'Law and financial firms', body: 'Firms use our legal and accounting teams for document preparation, reconciliations and reporting packs.' },
    ],
    distance: 'Our Wilmington HQ is about 90 minutes from Penn Station by Amtrak; our phone line is a 332 New York number.',
    body: [
      'Office space and salaries in New York make every local hire expensive. An Akrostech specialist costs a fraction of that, works your Eastern-time day and is replaced from a vetted bench if they ever move on.',
      'New York clients often run several specialists across practices: an executive assistant for the founders, a bookkeeper for the controller and a recruiter during growth quarters, each with one team lead and one weekly report.',
      'Call us on our New York number, +1 (332) 287-0846, or book a 30-minute discovery call.',
    ],
    faqs: [
      { q: 'Do you work with New York startups?', a: 'Yes. Founders use our executive assistants, recruiters and web developers to add capacity without the cost of New York hires.' },
      { q: 'Are your specialists available during New York business hours?', a: 'Yes. They work Eastern time on a fixed shift that you choose.' },
      { q: 'Can I meet someone in person in New York?', a: 'Your client partner can meet in Manhattan by appointment; our headquarters is in Wilmington, Delaware.' },
    ],
  },
];

export const locationBySlug = (slug: string): Location | undefined => locations.find((l) => l.slug === slug);
