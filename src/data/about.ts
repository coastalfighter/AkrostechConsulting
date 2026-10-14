/** About page content (from the Sample-3 site). Expands the headings that were empty on the legacy site. */

export const mission =
  "Give growing companies access to world-class talent and modern technology, without the overhead, so they can scale with confidence.";

export const pillars = [
  {
    title: "Framework",
    summary: "A repeatable engagement model.",
    detail:
      "Every engagement follows the same proven path: discovery, talent match, 48-hour onboarding, then structured reporting and quality checks. You always know what happens next.",
  },
  {
    title: "Client knowledge base",
    summary: "Your playbook, documented and secure.",
    detail:
      "We record your SOPs, tools and preferences in a secure, client-owned playbook, so work stays consistent and continuity survives holidays, growth and team changes.",
  },
  {
    title: "Talent hierarchy",
    summary: "Specialists backed by leads.",
    detail:
      "Your dedicated professional is supported by a team lead for day-to-day quality and an account manager who owns the relationship and your results.",
  },
] as const;

/** Vetting stages. Order matters: each stage filters the one before it. */
export const vettingStages = [
  { title: "Application", detail: "Experience and domain fit screened against the role." },
  { title: "Skills assessment", detail: "Practical, role-specific test in real tools." },
  { title: "Communication interview", detail: "Spoken and written English, clarity and judgment." },
  { title: "Background & references", detail: "Verification of history, references and conduct." },
  { title: "Matched to you", detail: "Shortlisted for your workflow, tools and time zone." },
] as const;

export const teamStructure = [
  { role: "Account manager", description: "Owns your relationship, goals and monthly reviews." },
  { role: "Team lead", description: "Runs quality checks, coaching and cover for absences." },
  { role: "Dedicated professional", description: "Works your hours, in your tools, only for you." },
] as const;

export const values = [
  { title: "Quality first, always", description: "Process-driven performance tracking and regular quality checks." },
  { title: "Clear collaboration", description: "Structured updates, easy reporting and real-time communication." },
  { title: "Secure & compliant", description: "Enterprise-grade security, NDAs and global compliance standards." },
  { title: "Flexible by design", description: "Agile, adaptive engagement models that change as you grow." },
] as const;
