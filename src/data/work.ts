/**
 * Work: engagement blueprints.
 *
 * These are worked plans showing how Akrostech staffs and runs a typical engagement of each kind.
 * They are deliberately NOT presented as client case studies: no client names, quotes or results
 * are claimed. When a client approves a real case study, add it with `kind: 'case-study'` and the
 * page template renders the client, outcome figures and quote fields instead.
 */
import type { ArtKey, ServiceSlug } from './services';

export interface WorkItem {
  slug: string;
  kind: 'blueprint' | 'case-study';
  title: string;
  service: ServiceSlug;
  industry: string;
  format: 'Specialist' | 'Pod' | 'Project';
  team: string;
  duration: string;
  summary: string;
  situation: string;
  approach: { title: string; body: string }[];
  deliverables: string[];
  measures: string[];
  tools: string[];
  art: ArtKey;
  /** Visual variant for generated cover art. */
  variant: number;
  meta: { title: string; description: string };
  /** Only for real, approved case studies. */
  client?: string;
  outcomes?: { figure: string; label: string }[];
  quote?: { text: string; name: string; role: string };
}

export const work: WorkItem[] = [
  {
    slug: 'executive-assistant-saas-founders',
    kind: 'blueprint',
    title: 'An executive assistant for two SaaS founders',
    service: 'virtual-assistance',
    industry: 'Software',
    format: 'Specialist',
    team: 'One executive assistant, one team lead',
    duration: 'Ongoing, full-time on Eastern hours',
    summary: 'Two founders, one shared inbox problem. How one assistant takes back ten hours a week from each of them.',
    situation:
      'Two co-founders of a 25-person software company split investor updates, hiring calls and customer escalations between them. Each spends two hours a day in email and scheduling, and follow-ups slip when travel starts.',
    approach: [
      { title: 'Week one: map the inbox', body: 'The assistant shadows both inboxes read-only, labels every thread for a week and drafts triage rules with the founders.' },
      { title: 'Week two: take the calendar', body: 'Scheduling moves to the assistant with written rules: protected focus blocks, meeting caps and a buffer around travel.' },
      { title: 'Week three: drafts in their voice', body: 'Routine replies are drafted for approval, then sent directly once the founders sign off on tone.' },
      { title: 'Month two: own the follow-up', body: 'A shared tracker holds every open loop; the assistant chases them and reports what is waiting on whom.' },
    ],
    deliverables: ['Inbox triage rules and labels', 'Scheduling policy document', 'Reply templates in each founder’s voice', 'Weekly open-loops report'],
    measures: ['Hours of founder time in email per week', 'Response time to customer escalations', 'Follow-ups closed on time'],
    tools: ['Google Workspace', 'Superhuman', 'Calendly', 'Notion', 'HubSpot'],
    art: 'va',
    variant: 0,
    meta: {
      title: 'An Executive Assistant for SaaS Founders | Akrostech',
      description:
        'How Akrostech sets up a dedicated executive assistant for two SaaS founders: inbox triage, calendar rules, drafts in their voice and a weekly open-loops report.',
    },
  },
  {
    slug: 'high-volume-hiring-pod-staffing-agency',
    kind: 'blueprint',
    title: 'A hiring pod for a high-volume staffing agency',
    service: 'recruitment-process-outsourcing',
    industry: 'Staffing',
    format: 'Pod',
    team: 'Three sourcers, two coordinators, one lead',
    duration: 'Ongoing, Central hours',
    summary: 'Forty open requisitions, one recruiter per desk. A six-person pod that keeps every requisition moving.',
    situation:
      'A light-industrial staffing agency carries forty open requisitions at a time. Its recruiters spend most of the day formatting resumes and chasing interview times instead of talking to candidates.',
    approach: [
      { title: 'Split the desk', body: 'Sourcing, screening and coordination become separate queues with clear handoffs between them.' },
      { title: 'Scorecards per role', body: 'Every requisition gets a five-question screening scorecard, so submittals are comparable and quick to approve.' },
      { title: 'Same-day scheduling', body: 'Coordinators book interviews within hours of approval and send reminders that cut no-shows.' },
      { title: 'Daily funnel stand-up', body: 'The pod lead reports volume and conversion per requisition every morning, Central time.' },
    ],
    deliverables: ['Role scorecards', 'Submittal template', 'Candidate communication scripts', 'Daily funnel dashboard'],
    measures: ['Time from requisition to first submittal', 'Interview no-show rate', 'Submittal-to-placement ratio'],
    tools: ['Bullhorn', 'LinkedIn Recruiter', 'Indeed', 'Calendly', 'Google Sheets'],
    art: 'rpo',
    variant: 1,
    meta: {
      title: 'High-Volume Hiring Pod for a Staffing Agency | Akrostech',
      description:
        'A six-person recruiting pod blueprint for staffing agencies: split sourcing, screening and scheduling, scorecards for each role and a daily funnel report.',
    },
  },
  {
    slug: 'month-end-close-ecommerce-brand',
    kind: 'blueprint',
    title: 'A five-day close for a multi-entity e-commerce brand',
    service: 'accounting-assistance',
    industry: 'E-commerce',
    format: 'Pod',
    team: 'Two bookkeepers, one senior accountant',
    duration: 'Ongoing, Eastern hours',
    summary: 'Three entities, four sales channels, a close that took three weeks. The plan to close by business day five.',
    situation:
      'A direct-to-consumer brand sells through Shopify, Amazon and two wholesale accounts across three legal entities. Payouts, fees and returns land in different places and the books close three weeks after month-end.',
    approach: [
      { title: 'Clean the clearing accounts', body: 'A one-off project reconciles marketplace clearing accounts back to payout reports for the last six months.' },
      { title: 'Daily rather than monthly', body: 'Payouts, fees and refunds are booked daily from settlement reports, so month-end starts mostly done.' },
      { title: 'A written close calendar', body: 'Every close task has an owner, a day and a reviewer, from accruals to intercompany eliminations.' },
      { title: 'Controller review pack', body: 'A reconciliation pack and variance notes reach the controller on business day four.' },
    ],
    deliverables: ['Clearing account reconciliations', 'Close checklist with owners and days', 'Intercompany schedule', 'Monthly review pack'],
    measures: ['Business days to close', 'Unreconciled balance at month-end', 'Review notes per close'],
    tools: ['QuickBooks Online', 'A2X', 'Shopify', 'Amazon Seller Central', 'Bill.com'],
    art: 'accounting',
    variant: 2,
    meta: {
      title: 'Five-Day Month-End Close for E-commerce | Akrostech',
      description:
        'Closing the books of a multi-entity e-commerce brand by business day five: daily payout booking, clearing reconciliations and a written close calendar.',
    },
  },
  {
    slug: 'contract-abstraction-in-house-legal',
    kind: 'blueprint',
    title: 'Clearing a contract backlog for an in-house legal team',
    service: 'legal-process-outsourcing',
    industry: 'Healthcare services',
    format: 'Project',
    team: 'Two legal assistants, one reviewer',
    duration: 'Eight-week project, then ongoing intake',
    summary: 'Twelve hundred vendor contracts and no renewal calendar. An eight-week abstraction project and the intake process that follows.',
    situation:
      'A two-attorney legal team at a healthcare services company inherits around 1,200 vendor agreements in shared drives with no central record of renewal dates, notice periods or data-protection terms.',
    approach: [
      { title: 'Agree the abstraction sheet', body: 'Counsel signs off the fields to capture: parties, term, renewal, notice, liability caps, data-protection clauses.' },
      { title: 'Abstract in batches', body: 'Contracts are abstracted in batches of 100, with a 10% sample second-checked by the reviewer.' },
      { title: 'Flag what matters', body: 'Auto-renewals inside 90 days and missing data-protection terms are flagged to counsel weekly.' },
      { title: 'Hand over an intake process', body: 'New contracts are abstracted within two business days of signature from then on.' },
    ],
    deliverables: ['Contract register', 'Renewal and notice calendar', 'Weekly risk flags for counsel', 'Intake procedure'],
    measures: ['Contracts abstracted per week', 'Second-check error rate', 'Renewals actioned before notice deadline'],
    tools: ['Microsoft 365', 'SharePoint', 'Ironclad', 'Excel'],
    art: 'legal',
    variant: 3,
    meta: {
      title: 'Contract Abstraction for In-House Legal | Akrostech',
      description:
        'Clearing a 1,200-contract backlog for an in-house legal team: an abstraction sheet, batch quality checks, renewal calendars and ongoing contract intake.',
    },
  },
  {
    slug: 'shopify-rebuild-dtc-brand',
    kind: 'blueprint',
    title: 'A Shopify rebuild for a direct-to-consumer brand',
    service: 'website-development',
    industry: 'Retail',
    format: 'Project',
    team: 'Designer, two developers, project lead',
    duration: 'Ten weeks',
    summary: 'A slow theme stacked with apps. A rebuild that keeps the catalogue and the rankings and drops the weight.',
    situation:
      'A home-goods brand runs a heavily customised Shopify theme with nineteen apps. Mobile pages take over four seconds to show the product, and every app update risks breaking checkout.',
    approach: [
      { title: 'Audit apps and speed', body: 'Every app is measured for its cost in script weight and kept, replaced with native features, or removed.' },
      { title: 'Design the product page first', body: 'The product page carries most revenue, so it is designed and tested before anything else.' },
      { title: 'Build on Online Store 2.0', body: 'Sections and blocks the merchandising team can rearrange without a developer.' },
      { title: 'Launch without losing search', body: 'Every URL mapped, redirects tested and rankings watched for six weeks after launch.' },
    ],
    deliverables: ['App and performance audit', 'Design system and templates', 'Online Store 2.0 theme', 'Redirect map and launch checklist'],
    measures: ['Mobile LCP on product pages', 'Conversion rate on mobile', 'Organic sessions after launch'],
    tools: ['Shopify', 'Figma', 'Liquid', 'Klaviyo', 'Google Search Console'],
    art: 'web',
    variant: 4,
    meta: {
      title: 'Shopify Rebuild for a DTC Brand: Blueprint | Akrostech',
      description:
        'How Akrostech plans a Shopify rebuild for a direct-to-consumer brand: an app and speed audit, product-page-first design, a 2.0 theme and an SEO-safe launch.',
    },
  },
  {
    slug: 'client-portal-accounting-firm',
    kind: 'blueprint',
    title: 'A client portal for a regional accounting firm',
    service: 'website-development',
    industry: 'Professional services',
    format: 'Project',
    team: 'Product lead, two developers, QA',
    duration: 'Twelve weeks',
    summary: 'Documents by email, status by phone call. A secure portal where clients upload, sign and see where their return stands.',
    situation:
      'A CPA firm with 900 individual and small-business clients collects documents over email and answers status calls all season. Staff spend hours each week matching attachments to client files.',
    approach: [
      { title: 'Map the season', body: 'Interviews with partners and staff turn the tax season into a set of client states and tasks.' },
      { title: 'Secure by default', body: 'Multi-factor sign-in, encrypted storage, role-based access and an audit log of every document action.' },
      { title: 'Status without a call', body: 'Clients see a checklist of what is received, what is missing and where their return stands.' },
      { title: 'Connect the back office', body: 'Uploads land in the practice-management system automatically, named and filed.' },
    ],
    deliverables: ['User flows and prototype', 'Portal web application', 'Integration with practice management', 'Security and access documentation'],
    measures: ['Status calls per week in season', 'Documents filed without manual matching', 'Client sign-in adoption'],
    tools: ['Next.js', 'PostgreSQL', 'AWS S3', 'Auth0', 'DocuSign'],
    art: 'web',
    variant: 5,
    meta: {
      title: 'Secure Client Portal for a CPA Firm: Blueprint | Akrostech',
      description:
        'Blueprint: a secure client portal for an accounting firm: document upload and e-signature, status checklists, audit logs and practice-management integration.',
    },
  },
  {
    slug: 'support-desk-pacific-hours',
    kind: 'blueprint',
    title: 'A customer support desk on Pacific hours',
    service: 'virtual-assistance',
    industry: 'Consumer subscriptions',
    format: 'Pod',
    team: 'Four support assistants, one lead',
    duration: 'Ongoing, Pacific hours, seven days',
    summary: 'A West Coast subscription brand with a weekend ticket spike. A support pod that answers inside the hour.',
    situation:
      'A subscription box company in California gets a third of its tickets on weekends, when the in-house team is off. Monday starts with a backlog of 400 tickets and angry cancellations.',
    approach: [
      { title: 'Write the macros', body: 'The top forty ticket types get written answers, refund rules and escalation thresholds.' },
      { title: 'Cover the weekend', body: 'Shifts are staggered across seven days on Pacific time, with the lead on call for escalations.' },
      { title: 'Save the cancellation', body: 'Cancellation requests follow a retention script with pause and skip offers approved by the brand.' },
      { title: 'Report the reasons', body: 'A weekly report groups ticket reasons, so product and fulfilment teams fix causes, not symptoms.' },
    ],
    deliverables: ['Macro library', 'Escalation matrix', 'Retention script', 'Weekly ticket-reason report'],
    measures: ['First response time', 'Monday backlog size', 'Cancellations saved by pause or skip'],
    tools: ['Gorgias', 'Shopify', 'Recharge', 'Slack'],
    art: 'va',
    variant: 6,
    meta: {
      title: 'Customer Support Desk on Pacific Hours | Akrostech',
      description:
        'A seven-day customer support pod on Pacific time for a subscription brand: macros, escalation rules, a retention script and weekly ticket-reason reports.',
    },
  },
  {
    slug: 'wordpress-headless-migration-b2b',
    kind: 'blueprint',
    title: 'Moving a B2B services site from WordPress to headless',
    service: 'website-development',
    industry: 'B2B services',
    format: 'Project',
    team: 'Designer, two developers, SEO lead',
    duration: 'Seven weeks',
    summary: 'Eight years of posts, forty plugins and a failing speed score. A headless rebuild that keeps the content and the search traffic.',
    situation:
      'An engineering services firm publishes weekly and has eight years of articles on WordPress. Forty plugins, a page builder and shared hosting leave it failing Core Web Vitals on most templates.',
    approach: [
      { title: 'Model the content', body: 'Posts, case studies and service pages become structured types in a headless CMS, with editors trained on day one.' },
      { title: 'Migrate with scripts', body: 'Every post, image and author is migrated by script, so the import can be re-run until it is clean.' },
      { title: 'Static front end', body: 'Pages are pre-rendered and served from a global CDN, with images resized and served in modern formats.' },
      { title: 'Keep every URL', body: 'Permalinks are preserved; anything that must change gets a tested 301 redirect.' },
    ],
    deliverables: ['Content model', 'Migration scripts', 'Static front end on a CDN', 'Redirect map and SEO checklist'],
    measures: ['Templates passing Core Web Vitals', 'Organic sessions before and after', 'Time to publish an article'],
    tools: ['Sanity', 'Astro', 'Vercel', 'Screaming Frog', 'Google Search Console'],
    art: 'web',
    variant: 7,
    meta: {
      title: 'WordPress to Headless Migration Blueprint | Akrostech',
      description:
        'Moving a B2B services website from WordPress to a headless CMS and static front end without losing content, URLs or organic search traffic at the launch.',
    },
  },
];

export const workBySlug = (slug: string): WorkItem | undefined => work.find((w) => w.slug === slug);
