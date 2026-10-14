/**
 * Per-service presentation for the service pages: the specialist's role and "today on shift"
 * list (from Sample-3 `content/serviceMedia.ts`), the hero headline split into its two parts,
 * section titles from Sample-3's service components, and the copy for each page's instrument.
 * Photographs show people at work in general and are never presented as Akrostech staff.
 */
import type { PhotoName } from '@/components/Photo.astro';
import type { ServiceSlug } from './services';

export interface ServiceMedia {
  /** Role shown on the specialist card. */
  role: string;
  /** What the dedicated specialist hands back on a typical day. Illustrative. */
  today: readonly string[];
  /** The service headline in two parts: the second steps back in tone. */
  title: readonly [string, string];
  /** Plural noun for "Why U.S. teams choose our …". */
  teamNoun: string;
  offeringsTitle: string;
  /** Existing Open Graph card for the page. */
  og: string;
  /** Photograph in the benefits layout. */
  benefitsPhoto: PhotoName;
  /** Photograph for the closing call to action. */
  ctaPhoto: PhotoName;
  /** The page's interactive instrument section. */
  instrument: { title: readonly [string, string]; intro: string };
}

export const serviceMedia: Record<ServiceSlug, ServiceMedia> = {
  'virtual-assistance': {
    role: 'Dedicated virtual assistant',
    today: ['Inbox triaged to zero', "Tomorrow's calendar confirmed", 'CRM records updated', 'Support tickets answered'],
    title: ['An extra pair of hands,', 'working your hours.'],
    teamNoun: 'virtual assistants',
    offeringsTitle: 'What our team can take on.',
    og: '/og/service-virtual-assistance.png',
    ctaPhoto: 'people-virtual-assistants',
    benefitsPhoto: 'two-women-laptop',
    instrument: {
      title: ['One morning’s inbox.', 'Sorted before you log in.'],
      intro: 'A sample inbox. Switch between before and with your VA, or move any message to another lane to see what stays on your desk.',
    },
  },
  recruitment: {
    role: 'Dedicated recruiting partner',
    today: ['Fresh profiles sourced', 'Screening calls completed', 'Interviews scheduled', 'ATS pipeline updated'],
    title: ['Hire faster', 'without lowering the bar.'],
    teamNoun: 'recruiters',
    offeringsTitle: 'Industries we recruit for.',
    og: '/og/service-recruitment-process-outsourcing.png',
    ctaPhoto: 'people-recruiters',
    benefitsPhoto: 'talking-hands',
    instrument: {
      title: ['Plan the funnel', 'backwards from your hires.'],
      intro: 'Set the hires you need and the pass-through rate between stages. The model shows how many candidates each stage must hold, and which stages your recruiter runs.',
    },
  },
  accounting: {
    role: 'Dedicated bookkeeper',
    today: ['Bank feeds reconciled', 'Bills coded and queued', 'Invoices sent and chased', 'Close checklist on track'],
    title: ['Books that are always current', 'and audit-ready.'],
    teamNoun: 'accountants',
    offeringsTitle: 'What our team can take on.',
    og: '/og/service-accounting-assistance.png',
    ctaPhoto: 'team-laptops',
    benefitsPhoto: 'desk-overhead',
    instrument: {
      title: ['Reconcile a month', 'down to $0.00.'],
      intro: 'Sample bank lines and ledger entries, in different orders and wording. Match them one at a time and watch the difference close and the close calendar move.',
    },
  },
  legal: {
    role: 'Dedicated legal assistant',
    today: ['Discovery set indexed', 'Case calendar updated', 'Research memo drafted for review', 'Client intake completed'],
    title: ['Free your attorneys', 'for the work only they can do.'],
    teamNoun: 'legal assistants',
    offeringsTitle: 'Practice areas we support.',
    og: '/og/service-legal-process-outsourcing.png',
    ctaPhoto: 'meeting-room',
    benefitsPhoto: 'office-hallway',
    instrument: {
      title: ['A contract, abstracted.', 'Ready for attorney review.'],
      intro: 'A sample agreement beside an abstraction sheet. Choose a field to find the clause it comes from, or abstract them all.',
    },
  },
  'website-development': {
    role: 'Dedicated web team',
    today: ['Homepage build deployed to preview', 'Core Web Vitals in the green', 'Accessibility checks passed', 'Content updates shipped'],
    title: ['Websites that work', 'as hard as your team.'],
    teamNoun: 'web team',
    offeringsTitle: 'What our team can take on.',
    og: '/og/service-website-development.png',
    ctaPhoto: 'people-developers',
    benefitsPhoto: 'code-desk',
    instrument: { title: ['', ''], intro: '' },
  },
};
