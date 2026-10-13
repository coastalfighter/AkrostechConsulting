/**
 * Service catalogue. Copy, metadata, FAQs and process for every service page.
 * Website Development carries extra detail in `webdev.ts` and has its own page template.
 */

export type ServiceSlug =
  | 'virtual-assistance'
  | 'recruitment-process-outsourcing'
  | 'accounting-assistance'
  | 'legal-process-outsourcing'
  | 'website-development';

export type ArtKey = 'va' | 'rpo' | 'accounting' | 'legal' | 'web';

export interface Faq {
  q: string;
  a: string;
}

export interface Capability {
  title: string;
  body: string;
  items: [string, string, string];
}

export interface ProcessStep {
  title: string;
  body: string;
  when: string;
}

export interface Service {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  meta: { title: string; description: string };
  /** Hero headline, authored as two lines. */
  headline: [string, string];
  summary: string;
  intro: string;
  startsIn: string;
  saving: string;
  audience: string;
  capabilities: Capability[];
  tasks: string[];
  process: ProcessStep[];
  tools: string[];
  engagement: { title: string; body: string }[];
  faqs: Faq[];
  related: ServiceSlug[];
  geo: string;
  art: ArtKey;
  isNew?: boolean;
}

const sharedEngagement = [
  {
    title: 'One specialist',
    body: 'A dedicated professional on your hours, full-time or part-time, managed by an Akrostech team lead.',
  },
  {
    title: 'A pod',
    body: 'Two to ten people with a lead who owns quality checks, coverage and reporting back to you.',
  },
  {
    title: 'A fixed-scope project',
    body: 'A defined deliverable, a fixed fee and a finish date, for clean-ups, backlogs and migrations.',
  },
];

export const services: Service[] = [
  {
    slug: 'virtual-assistance',
    name: 'Virtual Assistance',
    shortName: 'Virtual assistants',
    meta: {
      title: 'Virtual Assistant Services on U.S. Hours | Akrostech',
      description:
        'Dedicated virtual assistants in India who work your U.S. hours: inbox, calendar, CRM, research and admin. Vetted, under NDA, and starting within 48 hours.',
    },
    headline: ['Your inbox,', 'off your desk.'],
    summary: 'Remote executive and operations assistants who run the daily work so your team can do the work only it can do.',
    intro:
      'A good assistant does not wait to be told. Ours learn your tools, your tone and your priorities in the first week, then take the inbox, the calendar and the follow-ups off your desk for good.',
    startsIn: 'Starts within 48 hours',
    saving: 'Up to 70% less than a local hire',
    audience: 'Founders, executives, sales teams and operations leads',
    capabilities: [
      {
        title: 'Executive support',
        body: 'Inbox triage, calendar management and meeting prep, so the first hour of your day is decisions, not email.',
        items: ['Inbox zero routines', 'Travel and scheduling', 'Meeting briefs'],
      },
      {
        title: 'Sales and CRM operations',
        body: 'Lead research, list building and pipeline hygiene, so your sellers sell and the CRM tells the truth.',
        items: ['Prospect research', 'CRM data entry', 'Follow-up sequences'],
      },
      {
        title: 'Customer support',
        body: 'Tickets, chat and order questions answered on your hours, with written macros and an escalation path.',
        items: ['Help desk queues', 'Order and refund handling', 'Review responses'],
      },
      {
        title: 'Operations and admin',
        body: 'The recurring work that keeps a company running, written into SOPs and done the same way every time.',
        items: ['Vendor coordination', 'Document management', 'Reporting packs'],
      },
      {
        title: 'E-commerce operations',
        body: 'Listings, inventory updates and marketplace upkeep for Shopify, Amazon and wholesale portals.',
        items: ['Product listings', 'Inventory sync', 'Order processing'],
      },
    ],
    tasks: [
      'Inbox triage and drafting replies in your voice',
      'Calendar management across time zones',
      'CRM updates in HubSpot or Salesforce',
      'Lead lists and prospect research',
      'Invoice chasing and vendor follow-up',
      'Travel booking and itineraries',
      'Meeting notes and action-item tracking',
      'Social media scheduling',
      'Customer support tickets and live chat',
      'Data entry, clean-up and de-duplication',
      'Slide decks and report formatting',
      'Shopify and Amazon listing updates',
    ],
    process: [
      { title: 'We learn the job', body: 'A 30-minute call to list the tasks, the tools and what a good week looks like for you.', when: 'Day 0' },
      { title: 'We send a shortlist', body: 'Two or three pre-vetted assistants who have done this exact work, with sample output.', when: 'Within 24 hours' },
      { title: 'Your assistant starts', body: 'Access set up, an SOP drafted for every recurring task, and the first tasks closed on day one.', when: 'Within 48 hours' },
      { title: 'Weekly reporting', body: 'A written weekly report from the team lead: what was done, what is waiting on you, what changes next.', when: 'Every week' },
    ],
    tools: ['Google Workspace', 'Microsoft 365', 'HubSpot', 'Salesforce', 'Slack', 'Asana', 'Notion', 'Zendesk', 'Shopify'],
    engagement: sharedEngagement,
    faqs: [
      {
        q: 'What hours will my virtual assistant work?',
        a: 'Your hours. Assistants work a fixed shift aligned to Eastern, Central, Mountain or Pacific time, so they are online when you are and replies arrive while your day is still running.',
      },
      {
        q: 'How do you protect access to my email and accounts?',
        a: 'Every assistant signs an NDA before day one. We recommend delegated access instead of shared passwords, use a password manager for anything shared, and remove access the same day an engagement ends.',
      },
      {
        q: 'Can I start part-time?',
        a: 'Yes. Many clients start with a half-day shift, add hours as the SOPs settle in, and move to full-time once the assistant owns a whole function.',
      },
      {
        q: 'What happens if my assistant leaves or is out sick?',
        a: 'Your team lead covers short absences from the same pod. If an assistant leaves, a replacement from our vetted bench is trained on your written SOPs, so the work does not restart from zero.',
      },
      {
        q: 'How is a virtual assistant priced?',
        a: 'One predictable monthly fee per assistant, set by hours and seniority and confirmed after the discovery call. There are no placement fees and no long lock-in.',
      },
    ],
    related: ['recruitment-process-outsourcing', 'accounting-assistance', 'website-development'],
    geo: 'Virtual assistants for founders and teams in Wilmington, Philadelphia, New York and across the United States.',
    art: 'va',
  },
  {
    slug: 'recruitment-process-outsourcing',
    name: 'Recruitment Process Outsourcing',
    shortName: 'Recruitment (RPO)',
    meta: {
      title: 'Recruitment Process Outsourcing (RPO) Services | Akrostech',
      description:
        'Offshore recruiters who run your hiring from sourcing to onboarding on U.S. hours. Lower cost per hire, faster shortlists and clean ATS data from day one.',
    },
    headline: ['Hiring, run', 'like a funnel.'],
    summary: 'Sourcers, screeners and recruiting coordinators who take the full hiring cycle off your team, from first search to signed offer.',
    intro:
      'Most hiring delays are not a talent shortage. They are unanswered applicants, unscheduled interviews and a pipeline nobody has time to work. We put recruiters on those hours and keep every stage moving.',
    startsIn: 'One-day intake',
    saving: 'Lower cost per hire',
    audience: 'Startups, staffing agencies, talent teams and HR leaders',
    capabilities: [
      {
        title: 'Sourcing',
        body: 'Boolean and LinkedIn sourcing against a written profile, with candidate notes your hiring manager can read in a minute.',
        items: ['LinkedIn Recruiter', 'Job board mining', 'Talent mapping'],
      },
      {
        title: 'Screening',
        body: 'Structured phone screens against a scorecard you approve, so every shortlist is comparable.',
        items: ['Screening scorecards', 'Skills pre-checks', 'Candidate summaries'],
      },
      {
        title: 'Coordination',
        body: 'Interview scheduling, reminders and candidate updates handled the same day, inside your hours.',
        items: ['Panel scheduling', 'Candidate communication', 'Offer paperwork'],
      },
      {
        title: 'ATS and reporting',
        body: 'Clean records in your applicant tracking system and a weekly funnel report: volume, conversion and time in stage.',
        items: ['Greenhouse, Lever, Workable', 'Funnel metrics', 'Weekly hiring report'],
      },
      {
        title: 'Staffing agency support',
        body: 'Back-office recruiters for agencies: resume formatting, job posting, submittals and onboarding paperwork.',
        items: ['Resume formatting', 'Submittal packs', 'Onboarding documents'],
      },
    ],
    tasks: [
      'Writing and posting job descriptions',
      'Boolean and LinkedIn sourcing',
      'Resume screening against a scorecard',
      'First-round phone screens',
      'Interview scheduling and reminders',
      'Candidate status emails',
      'Reference checks',
      'Offer letters and onboarding packets',
      'ATS hygiene and data entry',
      'Weekly funnel and time-to-hire reporting',
    ],
    process: [
      { title: 'Intake', body: 'One working session per role: the profile, the scorecard, the interview loop and who decides.', when: 'Day 1' },
      { title: 'Recruiter assigned', body: 'A recruiter with experience in your roles is set up in your ATS, inbox and calendar.', when: 'Within 48 hours' },
      { title: 'First shortlist', body: 'Screened candidates with written notes, ranked against the scorecard you approved.', when: 'Within 5 working days' },
      { title: 'Run and report', body: 'Scheduling, follow-up and a weekly funnel report until the offer is signed.', when: 'Every week' },
    ],
    tools: ['LinkedIn Recruiter', 'Greenhouse', 'Lever', 'Workable', 'BambooHR', 'Bullhorn', 'Calendly', 'Google Workspace'],
    engagement: sharedEngagement,
    faqs: [
      {
        q: 'What is recruitment process outsourcing?',
        a: 'RPO means a partner runs some or all of your hiring process on your behalf: sourcing, screening, scheduling and reporting. Unlike a staffing agency, the recruiters work inside your brand, your ATS and your process.',
      },
      {
        q: 'How is RPO different from a staffing agency?',
        a: 'An agency charges a fee per placement and owns the candidate relationship. With RPO you pay for recruiting capacity, the candidates stay in your system and the process improves over time.',
      },
      {
        q: 'Which roles can your recruiters hire for?',
        a: 'Most business, operations, sales, support and technical roles in the U.S. We are strongest in high-volume hiring and in agency back-office support.',
      },
      {
        q: 'Will candidates know they are talking to an outsourced recruiter?',
        a: 'Recruiters represent your company using your email domain and your templates. How you introduce them is your choice; we never misrepresent who the employer is.',
      },
      {
        q: 'How do you measure results?',
        a: 'Time to first shortlist, interview-to-offer ratio, time in each stage and cost per hire, reported every week from your own ATS data.',
      },
    ],
    related: ['virtual-assistance', 'legal-process-outsourcing', 'accounting-assistance'],
    geo: 'Recruitment support for hiring teams and staffing agencies in Wilmington, Philadelphia, New York and nationwide.',
    art: 'rpo',
  },
  {
    slug: 'accounting-assistance',
    name: 'Accounting Assistance',
    shortName: 'Accounting',
    meta: {
      title: 'Offshore Bookkeeping & Accounting Support | Akrostech',
      description:
        'Offshore bookkeepers and accountants who keep your books current, reconciled and audit-ready. U.S. GAAP trained, QuickBooks and Xero fluent, on your U.S. hours.',
    },
    headline: ['Books closed', 'by the fifth.'],
    summary: 'Qualified bookkeepers and accountants for accurate, compliant financial operations, working inside your ledger on your schedule.',
    intro:
      'A late close is usually a capacity problem wearing a process costume. We add trained hands to the ledger, write down how your close works, and keep it on the same calendar every month.',
    startsIn: 'Two-day books review',
    saving: 'Up to 60% less than local staff',
    audience: 'Finance teams, CPA firms, controllers and founders',
    capabilities: [
      {
        title: 'Bookkeeping',
        body: 'Daily transaction coding, bank and card reconciliations, and a ledger you can trust on any day of the month.',
        items: ['Transaction categorisation', 'Bank reconciliations', 'Receipt matching'],
      },
      {
        title: 'Accounts payable',
        body: 'Bills entered, approved and paid on schedule, with vendor statements reconciled and no duplicate payments.',
        items: ['Bill entry and approvals', 'Payment runs', 'Vendor reconciliations'],
      },
      {
        title: 'Accounts receivable',
        body: 'Invoices out on time, payments applied the same day and a collections cadence that stays polite and persistent.',
        items: ['Invoicing', 'Cash application', 'Collections follow-up'],
      },
      {
        title: 'Month-end close',
        body: 'Accruals, prepaid schedules and reconciliations completed to a written checklist and handed to your controller for review.',
        items: ['Close checklists', 'Accruals and prepaids', 'Balance sheet reconciliations'],
      },
      {
        title: 'CPA firm support',
        body: 'Seasonal and year-round capacity for firms: workpapers, tax-prep data, client bookkeeping and review-ready files.',
        items: ['Workpaper preparation', '1099 preparation support', 'Client ledger clean-ups'],
      },
    ],
    tasks: [
      'Daily transaction coding',
      'Bank and credit card reconciliations',
      'Bill entry and payment runs',
      'Customer invoicing and cash application',
      'Collections reminders',
      'Expense report review',
      'Month-end close checklist',
      'Accruals and prepaid schedules',
      'Fixed asset register upkeep',
      'Management reporting packs',
      'Catch-up and clean-up bookkeeping',
      'Audit and tax-prep document gathering',
    ],
    process: [
      { title: 'Books review', body: 'We review your ledger, chart of accounts and open items, then send a written findings note.', when: 'Two days' },
      { title: 'Team assigned', body: 'A bookkeeper or accountant matched to your software and industry, with a senior reviewer.', when: 'Within 48 hours' },
      { title: 'Close calendar', body: 'A written close checklist with owners and dates, agreed with your controller or CPA.', when: 'First month' },
      { title: 'Monthly review', body: 'A close summary, open questions and a reconciliation pack on the same day every month.', when: 'Every month' },
    ],
    tools: ['QuickBooks Online', 'Xero', 'NetSuite', 'Bill.com', 'Expensify', 'Ramp', 'Gusto', 'Excel', 'Google Sheets'],
    engagement: sharedEngagement,
    faqs: [
      {
        q: 'Are your accountants trained in U.S. accounting standards?',
        a: 'Yes. Our accountants work to U.S. GAAP and to your firm’s own policies, and every close is reviewed by a senior before it reaches you.',
      },
      {
        q: 'Which accounting software do you use?',
        a: 'Whatever you already run. Most clients use QuickBooks Online, Xero or NetSuite, alongside Bill.com, Ramp, Expensify and Gusto.',
      },
      {
        q: 'How do you keep financial data secure?',
        a: 'NDAs on every engagement, named user accounts instead of shared logins, multi-factor authentication, and least-privilege access that you approve and can revoke at any time.',
      },
      {
        q: 'Do you file taxes or sign financial statements?',
        a: 'No. We prepare the books and the supporting files. Filing, attestation and sign-off stay with your licensed CPA or controller.',
      },
      {
        q: 'Can you clean up books that are months behind?',
        a: 'Yes. Catch-up work runs as a fixed-scope project with a finish date, then moves to a monthly engagement if you want one.',
      },
    ],
    related: ['legal-process-outsourcing', 'virtual-assistance', 'recruitment-process-outsourcing'],
    geo: 'Bookkeeping and accounting support for businesses and CPA firms in Wilmington, Philadelphia, New York and across the U.S.',
    art: 'accounting',
  },
  {
    slug: 'legal-process-outsourcing',
    name: 'Legal Process Outsourcing',
    shortName: 'Legal (LPO)',
    meta: {
      title: 'Legal Process Outsourcing for U.S. Firms | Akrostech',
      description:
        'Trained legal assistants for documentation, research, contract and compliance work, supervised by your attorneys, under NDA and on your U.S. business hours.',
    },
    headline: ['Your files,', 'never behind.'],
    summary: 'Trained legal assistants and paralegal support for documentation, research and compliance, working under your attorneys’ supervision.',
    intro:
      'Attorneys should spend their hours on judgment. We take the drafting, the indexing, the summaries and the deadline tracking that surround it, and return them checked, formatted and on time.',
    startsIn: 'Starts within 48 hours',
    saving: '60–70% lower cost',
    audience: 'Law firms, in-house legal teams and compliance departments',
    capabilities: [
      {
        title: 'Document preparation',
        body: 'First drafts from your templates and precedents, formatted to your style and ready for attorney review.',
        items: ['Template drafting', 'Formatting and proofing', 'Exhibit preparation'],
      },
      {
        title: 'Contract management',
        body: 'Intake, abstraction and renewal tracking, so no obligation or auto-renewal goes unnoticed.',
        items: ['Contract abstraction', 'Renewal calendars', 'Clause libraries'],
      },
      {
        title: 'Legal research support',
        body: 'Case and statute research summaries prepared to a written brief, cited and handed to counsel to verify.',
        items: ['Research memos', 'Citation checks', 'Case summaries'],
      },
      {
        title: 'Litigation support',
        body: 'Document review, indexing and chronologies prepared under quality and confidentiality controls.',
        items: ['First-pass review', 'Deposition summaries', 'Chronologies'],
      },
      {
        title: 'Compliance operations',
        body: 'Policy tracking, entity records and filing calendars kept current and auditable.',
        items: ['Entity management', 'Filing calendars', 'Policy registers'],
      },
    ],
    tasks: [
      'Drafting from firm templates',
      'Contract abstraction and summaries',
      'Renewal and obligation tracking',
      'Legal research summaries',
      'Citation and cite-checking',
      'Deposition and transcript summaries',
      'First-pass document review',
      'Exhibit and binder preparation',
      'Entity and corporate records',
      'Court and filing deadline calendars',
    ],
    process: [
      { title: 'Scoping call', body: 'Matter types, systems, supervision and confidentiality requirements agreed in writing.', when: 'Day 0' },
      { title: 'Assistant matched', body: 'A legal assistant with experience in your practice area, cleared and set up in your systems.', when: 'Within 48 hours' },
      { title: 'Supervised start', body: 'Work begins on low-risk tasks with attorney review, then widens as quality is proven.', when: 'First two weeks' },
      { title: 'Quality reporting', body: 'Error rates, turnaround times and open items reported to the supervising attorney.', when: 'Every week' },
    ],
    tools: ['Clio', 'NetDocuments', 'iManage', 'Relativity', 'DocuSign', 'Ironclad', 'Microsoft 365', 'Westlaw (client-provided)'],
    engagement: sharedEngagement,
    faqs: [
      {
        q: 'What legal work can be safely outsourced?',
        a: 'Work that is reviewed by a licensed attorney before it is relied on: drafting from templates, research summaries, document review, contract abstraction, indexing and calendaring.',
      },
      {
        q: 'Do your assistants give legal advice?',
        a: 'No. Our team prepares work product under your attorneys’ supervision. Legal advice and final decisions always stay with licensed counsel.',
      },
      {
        q: 'How is client confidentiality protected?',
        a: 'NDAs, named accounts in your document management system, matter-level access, no local downloads unless you allow them, and access removed the day a matter closes.',
      },
      {
        q: 'Can you work inside our document management system?',
        a: 'Yes. We work inside Clio, NetDocuments, iManage and Relativity using accounts you issue, so the record of work stays on your side.',
      },
      {
        q: 'How quickly can a legal assistant start?',
        a: 'Usually within 48 hours of the scoping call, starting with supervised, low-risk work.',
      },
    ],
    related: ['accounting-assistance', 'virtual-assistance', 'recruitment-process-outsourcing'],
    geo: 'Legal process outsourcing for law firms and in-house teams in Wilmington, Philadelphia, New York and nationwide.',
    art: 'legal',
  },
  {
    slug: 'website-development',
    name: 'Website Development',
    shortName: 'Website development',
    meta: {
      title: 'Website Design & Development Services | Akrostech Consulting',
      description:
        'Custom websites, Shopify and WooCommerce stores, headless CMS builds and web apps from a senior team on your U.S. hours. Fast, accessible and built to rank.',
    },
    headline: ['Websites that', 'load before you blink.'],
    summary: 'Custom websites, online stores and web applications, designed and built by a senior team that works your hours.',
    intro:
      'A business website has two jobs: be found, and turn the visit into a conversation. We design for the second and engineer for the first, then stay on to keep it fast.',
    startsIn: 'One-week discovery',
    saving: 'Up to 60% less than a U.S. agency',
    audience: 'Founders, marketing teams, e-commerce brands and product teams',
    capabilities: [],
    tasks: [],
    process: [],
    tools: [],
    engagement: [],
    faqs: [],
    related: ['virtual-assistance', 'recruitment-process-outsourcing', 'accounting-assistance'],
    geo: 'Web design and development for businesses in Wilmington, Philadelphia, New York and across the United States.',
    art: 'web',
    isNew: true,
  },
];

export const serviceBySlug = (slug: string): Service | undefined => services.find((s) => s.slug === slug);

export const staffingServices = services.filter((s) => s.slug !== 'website-development');

export const serviceHref = (slug: ServiceSlug): string => `/services/${slug}`;
