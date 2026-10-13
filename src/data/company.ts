/**
 * Company content: mission, vision, values, how the team is organised, the commitments every
 * engagement carries, general FAQs, and the story timeline used on the About page.
 */
import type { Faq } from './services';

export const mission =
  'Give growing U.S. companies the capacity of a larger team, by placing vetted professionals in India on their working hours and holding that work to an onshore standard.';

export const vision =
  'A world where where your team sits stops mattering, because the work arrives on time, done right, and in the hours you keep.';

export const values: { title: string; body: string }[] = [
  {
    title: 'Quality before speed',
    body: 'Every piece of work is checked by a team lead before it reaches you. Fast and wrong is still wrong.',
  },
  {
    title: 'Your hours, not ours',
    body: 'Our people work your time zone, so a question asked at 10 am is answered by 10:15, not tomorrow.',
  },
  {
    title: 'Written down',
    body: 'Every recurring task becomes a standard operating procedure you own, so knowledge stays with your company.',
  },
  {
    title: 'Confidential by default',
    body: 'NDAs, named accounts and least-privilege access on every engagement, removed the day it ends.',
  },
  {
    title: 'Plain reporting',
    body: 'A short written report every week: what was done, what is waiting on you, what changes next.',
  },
];

/** The promises every engagement carries. Shown where testimonials would otherwise sit. */
export const commitments: { title: string; body: string; figure: string }[] = [
  {
    figure: '48 h',
    title: 'Onboarded in two days',
    body: 'From discovery call to a specialist working in your tools within 48 hours for most roles.',
  },
  {
    figure: '5',
    title: 'Five-stage vetting',
    body: 'Skills tests, language assessment, background checks, a work sample and a final interview before you meet anyone.',
  },
  {
    figure: 'NDA',
    title: 'Signed before day one',
    body: 'Every professional signs a non-disclosure agreement covering your data, clients and systems.',
  },
  {
    figure: 'Lead',
    title: 'A team lead for every pod',
    body: 'A lead reviews work, covers absences and owns quality, so you manage outcomes, not people.',
  },
  {
    figure: '0',
    title: 'Zero restart on replacement',
    body: 'If someone leaves, a vetted replacement is trained on your written SOPs. Your work does not start over.',
  },
  {
    figure: '1',
    title: 'One monthly fee',
    body: 'A single predictable fee per person or project, confirmed after discovery. No placement fees.',
  },
];

/** How the delivery organisation is structured. Real names and photos can be added per role. */
export interface TeamRole {
  role: string;
  practice: string;
  body: string;
  name?: string;
  photo?: string;
}

export const teamRoles: TeamRole[] = [
  {
    role: 'Client partner',
    practice: 'Wilmington, Delaware',
    body: 'Your single point of contact in the U.S. Runs discovery, sets the scope and is accountable for the engagement.',
  },
  {
    role: 'Delivery lead',
    practice: 'All practices',
    body: 'Owns matching, onboarding and quality standards across every practice, and steps in when something needs fixing.',
  },
  {
    role: 'Team leads',
    practice: 'One per pod',
    body: 'Review work before it reaches you, cover absences and write the weekly report.',
  },
  {
    role: 'Specialists',
    practice: 'VA, recruiting, accounting, legal, web',
    body: 'Vetted professionals working your U.S. hours inside your tools, trained on your SOPs.',
  },
];

export const vetting: { title: string; body: string }[] = [
  { title: 'Skills test', body: 'A timed, role-specific test: a ledger to reconcile, a role to source, a contract to abstract, a page to build.' },
  { title: 'Language assessment', body: 'Written and spoken English assessed for clarity with U.S. clients and customers.' },
  { title: 'Background check', body: 'Identity, education and employment history verified.' },
  { title: 'Work sample', body: 'A paid sample task reviewed by the practice lead against a written standard.' },
  { title: 'Final interview', body: 'A conversation about judgment: what to do when instructions run out.' },
];

/** About page story: how an engagement grows over its first year. */
export const story: { when: string; title: string; body: string }[] = [
  {
    when: 'The problem',
    title: 'Growing companies run out of hours first',
    body: 'Founders, finance leads and partners do the work of three people long before they can justify hiring them locally. The work that slips is rarely the hard work; it is the recurring work nobody has time for.',
  },
  {
    when: 'The idea',
    title: 'Put the team in India and the hours in the U.S.',
    body: 'India has a deep bench of trained accountants, legal graduates, recruiters and engineers. Working U.S. shifts closes the time-zone gap, so the team feels down the hall rather than overnight.',
  },
  {
    when: 'The standard',
    title: 'Hold offshore work to an onshore standard',
    body: 'Five-stage vetting, a team lead on every pod, written SOPs and weekly reporting. Quality is a process, not a promise.',
  },
  {
    when: 'Today',
    title: 'Five practices, one way of working',
    body: 'Virtual assistance, recruitment, accounting, legal process outsourcing and now website development, all run from Wilmington, Delaware with delivery teams in India.',
  },
];

export const generalFaqs: Faq[] = [
  {
    q: 'Where are Akrostech professionals based?',
    a: 'Our delivery teams are in India, and our headquarters is at 1207 Delaware Ave, Wilmington, Delaware. Your client partner is based in the U.S.',
  },
  {
    q: 'Will my team really work U.S. hours?',
    a: 'Yes. Every specialist works a fixed shift aligned to Eastern, Central, Mountain or Pacific time, so they are online during your working day.',
  },
  {
    q: 'How quickly can someone start?',
    a: 'Most roles start within 48 hours of the discovery call: a shortlist within 24 hours, and onboarding within the next day.',
  },
  {
    q: 'How do you vet professionals?',
    a: 'Five stages: a role-specific skills test, an English assessment, a background check, a paid work sample and a final interview.',
  },
  {
    q: 'How much does it cost?',
    a: 'One predictable monthly fee per person or project, set by role, hours and seniority, and confirmed after the discovery call. Website projects are quoted at a fixed price after a one-week discovery.',
  },
  {
    q: 'Is there a long-term contract?',
    a: 'No long lock-in. Engagements run month to month after an initial period agreed at the start, and you can scale up or down with notice.',
  },
];

export const contactFaqs: Faq[] = [
  {
    q: 'What happens after I send the form?',
    a: 'A client partner replies within one business day with two or three times for a 30-minute discovery call, or you can book a time directly on our calendar.',
  },
  {
    q: 'What should I prepare for the discovery call?',
    a: 'A list of the tasks you want to hand off, the tools you use and the hours you need covered. Ten minutes of notes is plenty.',
  },
  {
    q: 'Do you sign an NDA before the call?',
    a: 'Yes, on request. We are happy to sign your mutual NDA before you share anything confidential.',
  },
  {
    q: 'Can I visit your office?',
    a: 'Yes, by appointment. Our headquarters is at 1207 Delaware Ave, Wilmington, DE 19806, with parking on Delaware Avenue and nearby streets.',
  },
];
