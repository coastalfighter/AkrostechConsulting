/**
 * Service catalogue. Copy and structure follow the Akrostech Sample-3 site (carried over from
 * the live akrosstech.com copy); "website-development" is the new service line.
 * Every service page, the services hub, the header menu, the footer and the schema read
 * from here.
 */

export type ServiceSlug = 'virtual-assistance' | 'recruitment' | 'accounting' | 'legal' | 'website-development';

export interface Faq {
  q: string;
  a: string;
}

export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ProcessStep {
  title: string;
  duration: string;
  detail: string;
}

export interface EngagementModel {
  name: string;
  bestFor: string;
  includes: readonly string[];
  featured?: boolean;
}

export interface Service {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  /** <title> (50-60 characters with the brand) and meta description (150-160). Tested. */
  meta: { title: string; description: string };
  /** One-line summary used on cards and in navigation. */
  summary: string;
  /** Hero headline on the detail page. */
  headline: string;
  intro: string;
  isNew?: boolean;
  /** Comparison facts for the services hub. */
  facts: { bestFor: string; startsIn: string; savings: string };
  benefits: readonly ServiceFeature[];
  offerings: readonly ServiceFeature[];
  process: readonly ProcessStep[];
  faqs: readonly Faq[];
  engagementModels?: readonly EngagementModel[];
  techStack?: readonly { category: string; items: readonly string[] }[];
}

export const services: Service[] = [
  {
    slug: "virtual-assistance",
    meta: {
      title: "Virtual Assistant Services for U.S. Businesses",
      description:
        "Hire a dedicated virtual assistant in India who works your U.S. hours: inbox, calendar, CRM, support and admin. Vetted, under NDA, onboarded in about 48 hours.",
    },
    name: "Virtual Assistance",
    shortName: "VA",
    summary: "Dedicated remote assistants who run your daily operations as an extension of your team.",
    headline: "An extra pair of hands, working your hours.",
    intro:
      "Skilled, India-based Virtual Assistants for U.S. businesses that want to cut costs and move faster. Our VAs are professionally trained, cost-effective and available across U.S. time zones, handling everything from inbox management to your digital presence.",
    facts: { bestFor: "Founders and teams buried in admin", startsIn: "48 hours", savings: "Up to 70%" },
    benefits: [
      { title: "Time-zone alignment", description: "Work during EST, CST, MST or PST hours." },
      { title: "Up to 70% cost savings", description: "Compared with U.S.-based employees in the same role." },
      { title: "Dedicated resources", description: "Your VA is never shared. They work only for you." },
      { title: "48-hour onboarding", description: "Go from first call to a working assistant in two days." },
      { title: "Vetted talent", description: "English-speaking, tech-savvy and college-educated." },
      { title: "Scalable support", description: "Start with one VA and grow the team as you need." },
    ],
    offerings: [
      { title: "Administrative tasks", description: "Calendar management, scheduling, document handling and task tracking." },
      { title: "Customer support", description: "Live chat, phone and email support in your brand voice." },
      { title: "Social media management", description: "Post scheduling, moderation, engagement tracking and insights reporting." },
      { title: "Content creation", description: "Blog drafts, newsletters, product descriptions and marketing copy." },
      { title: "Data entry & management", description: "CRM updates, spreadsheets, databases and data formatting." },
      { title: "Personal assistance", description: "To-dos, errands, reservations and reminders." },
    ],
    process: [
      { title: "Discovery call", duration: "30 min", detail: "We map your tasks, tools and working hours." },
      { title: "Talent match", duration: "24 h", detail: "We shortlist vetted VAs who fit your workflow." },
      { title: "Onboard", duration: "48 h", detail: "Access, SOPs and a first-week plan are set up." },
      { title: "Scale & report", duration: "Ongoing", detail: "Weekly reporting and quality checks; add VAs any time." },
    ],
    faqs: [
      { q: "How quickly can a VA start?", a: "Most clients have a dedicated VA working within 48 hours of the discovery call." },
      { q: "Will my VA work my business hours?", a: "Yes. VAs work your chosen U.S. time zone: EST, CST, MST or PST." },
      { q: "Is my VA shared with other clients?", a: "No. Every VA is dedicated to a single client." },
    ],
  },
  {
    slug: "recruitment",
    meta: {
      title: "Recruitment Process Outsourcing (RPO) Services",
      description:
        "Recruitment process outsourcing for U.S. startups, agencies and enterprises: sourcing, screening, scheduling and full-cycle hiring by a dedicated offshore team.",
    },
    name: "Recruitment Process Outsourcing",
    shortName: "RPO",
    summary: "Full-cycle hiring support from sourcing to onboarding for startups, agencies and enterprises.",
    headline: "Hire faster without lowering the bar.",
    intro:
      "RPO is a long-term partnership where Akrostech acts as an extension of your talent acquisition team, taking full or partial ownership of recruiting. You get faster, more cost-effective hiring without compromising on quality, which is ideal when you need to build or scale teams quickly.",
    facts: { bestFor: "Teams hiring at volume or speed", startsIn: "1-day intake", savings: "Lower cost-per-hire" },
    benefits: [
      { title: "Significant cost savings", description: "Lower cost-per-hire than in-house or agency recruiting." },
      { title: "U.S. time-zone alignment", description: "Recruiters work in real time with your hiring managers." },
      { title: "Domain-specific expertise", description: "Specialist recruiters for each industry vertical." },
      { title: "Scalability on demand", description: "Ramp recruiter capacity up or down with hiring plans." },
      { title: "Performance transparency", description: "Clear SLAs and pipeline visibility at every stage." },
      { title: "Analytics & reporting", description: "Time-to-fill, source quality and funnel conversion reports." },
    ],
    offerings: [
      { title: "Technology & IT", description: "Software developers, cloud engineers, DevOps and IT support." },
      { title: "Healthcare & life sciences", description: "Medical professionals, caregivers, clinical staff and sales reps." },
      { title: "Banking, finance & accounting", description: "Accountants, analysts, bookkeepers, tax preparers and banking staff." },
      { title: "Engineering & manufacturing", description: "Engineers, project managers, technicians and skilled trades." },
      { title: "Corporate & administrative", description: "Executive assistants, office managers, HR and admin staff." },
      { title: "Sales & customer service", description: "Sales professionals and customer support agents." },
    ],
    process: [
      { title: "Intake", duration: "1 day", detail: "Role profiles, scorecards and hiring SLAs agreed." },
      { title: "Source & screen", duration: "3-7 days", detail: "Multi-channel sourcing with structured screening." },
      { title: "Interview & offer", duration: "1-2 weeks", detail: "Scheduling, feedback loops and offer management." },
      { title: "Onboard & report", duration: "Ongoing", detail: "Onboarding support and funnel analytics." },
    ],
    faqs: [
      { q: "Can you handle part of the process only?", a: "Yes. Engage us for sourcing and screening only, or for the full hiring cycle." },
      { q: "Which industries do you recruit for?", a: "IT, healthcare, BFSI, engineering, corporate/admin, sales, customer service, construction, e-commerce and education." },
      { q: "Do you work with staffing agencies?", a: "Yes. Many agencies use us as white-label recruiting capacity." },
    ],
  },
  {
    slug: "accounting",
    meta: {
      title: "Outsourced Accounting & Bookkeeping Services",
      description:
        "Offshore bookkeeping for U.S. SMBs and CPA firms: AP, AR, reconciliations, payroll and month-end close in QuickBooks, Xero or Zoho Books, on your U.S. hours.",
    },
    name: "Accounting Assistance",
    shortName: "Accounting",
    summary: "Accountants and bookkeepers for accurate, compliant, audit-ready financial operations.",
    headline: "Books that are always current and audit-ready.",
    intro:
      "Outsourced accounting for U.S. businesses. Our India-based accountants cover payroll, taxation, AR/AP and invoicing with a focus on accuracy, compliance and cost efficiency, delivering work that meets the expectations of your CPA or internal finance team.",
    facts: { bestFor: "SMBs and CPA firms that need clean books", startsIn: "2-day books review", savings: "Significant" },
    benefits: [
      { title: "U.S. standards compliance", description: "Trained on U.S. accounting systems and compliance standards." },
      { title: "Expertise in leading tools", description: "QuickBooks, Xero and Zoho Books." },
      { title: "Significant cost savings", description: "Senior-level output at a fraction of onshore cost." },
      { title: "Data security", description: "NDAs, access controls and confidential handling of financials." },
      { title: "Dedicated & scalable", description: "A named accountant, with more capacity at month-end." },
      { title: "Timely reporting", description: "Accurate, on-schedule monthly closes and reports." },
    ],
    offerings: [
      { title: "Payroll processing", description: "Payroll runs, tax deductions, direct deposit setup and reporting." },
      { title: "Taxation support", description: "Filing preparation, 1099 processing and sales tax reconciliation." },
      { title: "Accounts receivable", description: "Invoice generation, payment tracking, aging reports and follow-ups." },
      { title: "Accounts payable", description: "Vendor bill processing, due-date tracking and timely payments." },
      { title: "Invoicing & billing", description: "Custom invoices, recurring billing and error-free entries." },
      { title: "CPA coordination", description: "Clean handoffs to your CPA or tax advisor at year-end." },
    ],
    process: [
      { title: "Books review", duration: "2 days", detail: "We audit your ledger, tools and close calendar." },
      { title: "Clean-up", duration: "1-2 weeks", detail: "Reconciliations and catch-up bookkeeping if needed." },
      { title: "Monthly cadence", duration: "Ongoing", detail: "AR/AP, payroll and a monthly close checklist." },
      { title: "Report", duration: "Monthly", detail: "P&L, balance sheet and cash-flow summaries." },
    ],
    faqs: [
      { q: "Which accounting software do you support?", a: "QuickBooks, Xero and Zoho Books, plus most payroll platforms." },
      { q: "Do you file taxes?", a: "We prepare filings and 1099s and coordinate with your CPA, who signs and files." },
      { q: "How is my financial data protected?", a: "Every engagement is under NDA with role-based access and secure systems." },
    ],
  },
  {
    slug: "legal",
    meta: {
      title: "Legal Process Outsourcing (LPO) & Paralegals",
      description:
        "Legal process outsourcing for U.S. law firms and in-house teams: legal research, document review, drafting and case support, supervised by your own attorneys.",
    },
    name: "Legal Process Outsourcing",
    shortName: "Legal",
    summary: "Trained legal assistants for documentation, research and compliance support.",
    headline: "Free your attorneys for the work only they can do.",
    intro:
      "Reliable and confidential Legal Process Outsourcing for U.S. law firms and legal departments. Our India-based staff are trained in U.S. legal systems to reduce overhead, accelerate turnaround and free your lawyers to focus on core legal work.",
    facts: { bestFor: "Law firms and in-house legal teams", startsIn: "48 hours", savings: "60-70%" },
    benefits: [
      { title: "U.S. legal standards", description: "Fluent in U.S. legal terminology, compliance and protocols." },
      { title: "60-70% lower cost", description: "Compared with equivalent in-house legal support." },
      { title: "Confidential & secure", description: "Strong NDAs, secure data systems and ethical compliance." },
      { title: "24/7 availability", description: "Support outside your local business hours." },
      { title: "Scalable model", description: "Project-based or long-term dedicated legal assistants." },
      { title: "Seamless integration", description: "We work inside your case management tools and workflows." },
    ],
    offerings: [
      { title: "Family law", description: "Case documentation, scheduling and client communication." },
      { title: "Personal injury & medical", description: "Intake, insurance coordination, record retrieval and demand letters." },
      { title: "Criminal & civil litigation", description: "Calendar coordination, discovery support and case filing." },
      { title: "Immigration law", description: "Form preparation, case tracking and document verification." },
      { title: "Bankruptcy & insolvency", description: "Petition prep, file organization and compliance checks." },
      { title: "Real estate law", description: "Title reviews, contract prep and document management." },
    ],
    process: [
      { title: "Scoping", duration: "1 day", detail: "Practice areas, tools and confidentiality terms agreed." },
      { title: "Assign", duration: "48 h", detail: "A trained legal assistant is matched to your firm." },
      { title: "Integrate", duration: "1 week", detail: "Access to your case management and SOPs." },
      { title: "Deliver", duration: "Ongoing", detail: "Tracked turnaround with attorney review checkpoints." },
    ],
    faqs: [
      { q: "Are your assistants practising attorneys?", a: "No. They are trained paralegal-level staff who work under your attorneys' supervision." },
      { q: "How do you protect privileged information?", a: "NDAs, secure systems and access limited to the assigned assistant." },
      { q: "Can you cover after-hours work?", a: "Yes. Our model supports 24/7 availability." },
    ],
  },
  {
    slug: "website-development",
    meta: {
      title: "Website Development: Next.js, WordPress, Shopify",
      description:
        "Custom website development by a dedicated offshore team: fast, accessible, search-ready Next.js, WordPress and Shopify sites with care plans, on your U.S. hours",
    },
    name: "Website Development",
    shortName: "Web Dev",
    isNew: true,
    summary: "High-performance websites, stores and web apps, designed and built by a dedicated offshore team.",
    headline: "Websites that work as hard as your team.",
    intro:
      "The same offshore-talent, onshore-quality model, applied to your web presence. Our designers and engineers build fast, accessible, secure websites and web apps, managed by U.S.-aligned project leads and backed by long-term care plans.",
    facts: { bestFor: "Brands that need a faster, modern site", startsIn: "1-week discovery", savings: "Up to 60%" },
    benefits: [
      { title: "U.S.-aligned project leads", description: "Daily overlap with your team and a single point of contact." },
      { title: "Up to 60% lower cost", description: "Agency-grade output without U.S. agency rates." },
      { title: "Performance guarantee", description: "Lighthouse 90+ on launch, measured on mobile." },
      { title: "Accessible by default", description: "Built to WCAG 2.2 AA standards." },
      { title: "You own everything", description: "NDA, full IP transfer and your own hosting accounts." },
      { title: "Support after launch", description: "Care plans for updates, security and SEO." },
    ],
    offerings: [
      { title: "Custom websites", description: "Next.js and React marketing sites with a headless CMS." },
      { title: "WordPress & CMS", description: "Theme builds, migrations, hardening and malware clean-up." },
      { title: "E-commerce", description: "Shopify and WooCommerce stores, catalogs and payments." },
      { title: "Web apps & dashboards", description: "Client portals, internal tools and API integrations." },
      { title: "UI/UX design", description: "Wireframes, Figma prototypes and design systems." },
      { title: "Care, security & SEO", description: "Updates, monitoring, backups, Core Web Vitals and technical SEO." },
    ],
    process: [
      { title: "Discover", duration: "1 week", detail: "Goals, audience, sitemap and success metrics." },
      { title: "Design", duration: "1-2 weeks", detail: "Wireframes, then high-fidelity Figma designs." },
      { title: "Develop", duration: "2-6 weeks", detail: "Sprint-based build with weekly preview links." },
      { title: "Test", duration: "1 week", detail: "Cross-device QA, accessibility and performance audits." },
      { title: "Launch", duration: "1 day", detail: "DNS, redirects, analytics and search console set up." },
      { title: "Grow", duration: "Ongoing", detail: "Care plan, CRO experiments and content updates." },
    ],
    faqs: [
      { q: "How much does a website cost?", a: "It depends on scope. Marketing sites usually start as a fixed-scope project; ongoing roadmaps suit a dedicated developer billed monthly." },
      { q: "How long does a build take?", a: "Most marketing sites launch in 5-10 weeks from discovery." },
      { q: "Do I own the code and design?", a: "Yes. All work is under NDA with full IP transfer on payment." },
      { q: "Can you fix or migrate my existing WordPress site?", a: "Yes, including security clean-ups after a compromise and migrations to modern stacks." },
      { q: "Which technologies do you use?", a: "Next.js, React, TypeScript, WordPress, Shopify, WooCommerce, Tailwind and headless CMSs." },
      { q: "What happens after launch?", a: "Choose a care plan covering updates, monitoring, backups, security patches and SEO." },
    ],
    engagementModels: [
      {
        name: "Fixed-scope project",
        bestFor: "A new website or redesign with a clear brief.",
        includes: ["Discovery workshop and sitemap", "Figma designs with two revision rounds", "Build, QA and launch", "30 days of post-launch support"],
      },
      {
        name: "Dedicated developer",
        bestFor: "A steady roadmap of features, pages and integrations.",
        includes: ["A full-time developer on your hours", "Weekly sprint planning and demos", "Code reviews by a senior lead", "Scale up or down monthly"],
        featured: true,
      },
      {
        name: "Care plan",
        bestFor: "Keeping a live site fast, secure and current.",
        includes: ["Core, plugin and dependency updates", "Uptime monitoring and daily backups", "Security patching and malware scans", "Monthly performance and SEO report"],
      },
    ],
    techStack: [
      { category: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js"] },
      { category: "CMS & commerce", items: ["WordPress", "WooCommerce", "Shopify", "Sanity", "Contentful"] },
      { category: "Backend", items: ["Node.js", "Python", "PostgreSQL", "REST & GraphQL", "Stripe"] },
      { category: "Design & delivery", items: ["Figma", "GitHub Actions", "Vercel", "AWS", "Docker"] },
    ],
  },
];


export const serviceBySlug = (slug: string): Service | undefined => services.find((s) => s.slug === slug);

export const serviceHref = (slug: ServiceSlug): string => `/services/${slug}`;

/** The four staffing practices (website development has its own page template). */
export const staffingServices = services.filter((s) => s.slug !== 'website-development');
