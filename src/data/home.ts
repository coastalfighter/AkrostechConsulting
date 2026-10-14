import type { ServiceSlug } from './services';

/** Homepage content (from the Sample-3 site; copy drawn from the live akrosstech.com site). */

export const origin = { city: "India delivery centre", lat: 21.15, lng: 79.09 } as const;

/** One U.S. hub per time zone the teams cover. */
export const hubs = [
  { city: "New York", zone: "EST", lat: 40.71, lng: -74.01 },
  { city: "Chicago", zone: "CST", lat: 41.88, lng: -87.63 },
  { city: "Denver", zone: "MST", lat: 39.74, lng: -104.99 },
  { city: "Los Angeles", zone: "PST", lat: 34.05, lng: -118.24 },
] as const;

export const tools = [
  "QuickBooks",
  "Xero",
  "Zoho Books",
  "Clio",
  "HubSpot",
  "Salesforce",
  "Slack",
  "Google Workspace",
  "Microsoft 365",
  "WordPress",
  "Shopify",
  "Next.js",
  "React",
  "Figma",
] as const;

export const processSteps = [
  { title: "Discovery call", duration: "30 min", detail: "We map your tasks, tools, time zone and success metrics." },
  { title: "Talent match", duration: "24 h", detail: "We shortlist pre-vetted professionals from our network." },
  { title: "Onboard", duration: "48 h", detail: "Access, SOPs and a first-week plan are ready to go." },
  { title: "Scale & report", duration: "Ongoing", detail: "Structured updates, quality checks and room to grow." },
] as const;

export type Feature = {
  title: string;
  description: string;
  span: "wide" | "narrow";
};

export const features: readonly Feature[] = [
  {
    title: "Curated talent",
    description: "Every professional is vetted for domain expertise, communication and reliability before they meet you.",
    span: "wide",
  },
  {
    title: "US-aligned operations",
    description: "Teams trained in U.S. workflows and compliance, with real working-hour overlap.",
    span: "narrow",
  },
  {
    title: "Secure & compliant",
    description: "Enterprise-grade security, NDAs on every engagement and global compliance standards.",
    span: "narrow",
  },
  {
    title: "Quality first, always",
    description: "Process-driven performance tracking and regular quality checks keep accuracy at 98%.",
    span: "wide",
  },
  {
    title: "Clear collaboration",
    description: "Structured updates, easy reporting and real-time collaboration in your tools.",
    span: "narrow",
  },
  {
    title: "Flexible engagement",
    description: "Start with one specialist, add a team, or run a fixed-scope project. Change course as you grow.",
    span: "wide",
  },
];

export type ServiceSlugRef = ServiceSlug;

/** Who the teams are built for, each mapped to the service line that fits them. */
export const audiences: readonly { title: string; summary: string; tasks: readonly string[]; service: ServiceSlugRef }[] = [
  {
    title: "Founders & operators",
    summary: "Get hours back every week without adding headcount.",
    tasks: ["Inbox and calendar", "CRM hygiene", "Customer support", "Research and reporting"],
    service: "virtual-assistance",
  },
  {
    title: "Talent & HR leaders",
    summary: "Fill roles faster with sourcing and screening that never sleeps.",
    tasks: ["Sourcing and outreach", "Screening calls", "Interview scheduling", "ATS updates"],
    service: "recruitment",
  },
  {
    title: "Finance teams & CPA firms",
    summary: "Close the books on time, every month, in your accounting stack.",
    tasks: ["Bookkeeping", "AP and AR", "Reconciliations", "Month-end close support"],
    service: "accounting",
  },
  {
    title: "Law firms & in-house legal",
    summary: "Expand capacity under your attorneys' supervision.",
    tasks: ["Legal research", "Document review", "Drafting support", "Contract management"],
    service: "legal",
  },
  {
    title: "Marketing & e-commerce teams",
    summary: "Launch fast, accessible, search-ready websites and stores.",
    tasks: ["Website builds", "Shopify and WordPress", "Core Web Vitals", "Care plans"],
    service: "website-development",
  },
  {
    title: "Growing enterprises",
    summary: "Stand up a multi-role offshore team with one accountable partner.",
    tasks: ["Dedicated pods", "Team lead and QA", "Shared SOPs", "Scale on demand"],
    service: "virtual-assistance",
  },
];

/** Qualitative comparison of hiring options. Akrostech column uses only published facts. */
export const comparison = {
  columns: ["In-house hire", "Freelance marketplace", "Akrostech team"] as const,
  rows: [
    { label: "Time to start", values: ["Weeks to months of recruiting", "Days, but you do the vetting", "About 48 hours after the discovery call"] },
    { label: "Vetting", values: ["Your own interview process", "Profiles and reviews only", "Five-stage vetting before anyone meets you"] },
    { label: "U.S. working hours", values: ["Yes", "Depends on the individual", "Yes: EST, CST, MST or PST"] },
    { label: "Quality checks", values: ["Your managers", "None built in", "Team lead and regular QA reviews"] },
    { label: "If someone leaves", values: ["Start recruiting again", "Start searching again", "Replacement from a vetted bench"] },
    { label: "Confidentiality", values: ["Employment contract", "Varies by platform", "NDA on every engagement"] },
    { label: "Cost structure", values: ["Salary, benefits, payroll tax, equipment, office", "Hourly or per task, plus platform fees", "One predictable monthly fee"] },
  ],
} as const;

/** Home FAQs, also emitted as FAQPage structured data. Self-contained answers for AI search. */
export const homeFaqs = [
  {
    q: "What does Akrostech do?",
    a:
      "Akrostech Consulting builds dedicated offshore teams in India for U.S. businesses. Our vetted specialists cover virtual assistance, recruitment process outsourcing, accounting, legal process outsourcing and website development, and they work your U.S. business hours.",
  },
  {
    q: "How quickly can my offshore team start?",
    a: "Most roles are onboarded within about 48 hours of the discovery call, with tool access, SOPs and a first-week plan ready.",
  },
  {
    q: "Will my offshore team work U.S. hours?",
    a: "Yes. Every Akrostech specialist works your chosen U.S. time zone, EST, CST, MST or PST, so you get real-time collaboration instead of overnight handoffs.",
  },
  {
    q: "How do you protect my data?",
    a: "Every engagement starts with an NDA. Access is granted through your own accounts with least-privilege permissions and two-factor authentication, and work is reviewed by a team lead.",
  },
  {
    q: "How much can I save with an offshore team?",
    a:
      "Savings depend on the role, seniority and scope. Depending on the service, Akrostech teams cost up to 60-70% less than an equivalent onshore hire; we confirm exact pricing after a discovery call.",
  },
  {
    q: "Where is Akrostech located?",
    a: "Akrostech is headquartered at 1207 Delaware Ave, Wilmington, Delaware 19806, with delivery teams in India.",
  },
] as const;

/** A typical shared day, in hours after 9:00 ET (from the Sample-3 site). Illustrative, not a client log. */
export const sharedDay = [
  { at: 0, title: 'Stand-up with your team', detail: 'Live on your call, cameras on.' },
  { at: 1.5, title: 'Inbox triaged, calendar confirmed', detail: 'Tomorrow is already sorted.' },
  { at: 3, title: 'Candidate screens booked', detail: 'Shortlist in your ATS by lunch.' },
  { at: 5, title: 'Invoices sent, bills coded', detail: 'Books current to the day.' },
  { at: 6.5, title: 'Website update on preview', detail: 'Checked on mobile and desktop.' },
  { at: 8, title: 'End-of-day report in your inbox', detail: 'What shipped, what is next.' },
] as const;
