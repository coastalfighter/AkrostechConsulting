/**
 * Services matrix: which practice covers which task, and the smallest team that covers a chosen
 * set of tasks. Task labels are drawn from the `tasks`, `capabilities` and web sub-services in
 * the data files; the mapping lives here so the services hero and its script share one source.
 */
import type { ServiceSlug } from '@/data/services';

export interface MatrixTask {
  id: string;
  label: string;
  /** Practices whose written scope includes this task. */
  covers: ServiceSlug[];
}

export const PRACTICE_ORDER: ServiceSlug[] = [
  'virtual-assistance',
  'recruitment-process-outsourcing',
  'accounting-assistance',
  'legal-process-outsourcing',
  'website-development',
];

export const matrixTasks: MatrixTask[] = [
  { id: 'inbox', label: 'Inbox triage', covers: ['virtual-assistance'] },
  { id: 'calendar', label: 'Calendar and travel', covers: ['virtual-assistance'] },
  { id: 'crm', label: 'CRM updates', covers: ['virtual-assistance'] },
  { id: 'support', label: 'Support tickets', covers: ['virtual-assistance'] },
  { id: 'sourcing', label: 'Candidate sourcing', covers: ['recruitment-process-outsourcing'] },
  { id: 'interviews', label: 'Interview scheduling', covers: ['recruitment-process-outsourcing', 'virtual-assistance'] },
  { id: 'offers', label: 'Offer letters', covers: ['recruitment-process-outsourcing'] },
  { id: 'reconciliations', label: 'Bank reconciliations', covers: ['accounting-assistance'] },
  { id: 'invoices', label: 'Invoice chasing', covers: ['accounting-assistance', 'virtual-assistance'] },
  { id: 'close', label: 'Month-end close', covers: ['accounting-assistance'] },
  { id: 'contracts', label: 'Contract abstraction', covers: ['legal-process-outsourcing'] },
  { id: 'deadlines', label: 'Filing deadlines', covers: ['legal-process-outsourcing'] },
  { id: 'review', label: 'Document review', covers: ['legal-process-outsourcing'] },
  { id: 'listings', label: 'Shopify listings', covers: ['virtual-assistance', 'website-development'] },
  { id: 'landing', label: 'Landing pages', covers: ['website-development'] },
  { id: 'speed', label: 'Site speed fixes', covers: ['website-development'] },
];

export const DEFAULT_SELECTION = ['inbox', 'interviews', 'reconciliations'];

export interface PracticeCoverage {
  slug: ServiceSlug;
  /** Selected task ids this practice covers. */
  covered: string[];
  /** In the suggested team (minimal cover). */
  inTeam: boolean;
}

export interface MatrixResult {
  rows: PracticeCoverage[];
  team: ServiceSlug[];
  shape: 'none' | 'specialist' | 'pod';
}

/**
 * Coverage per practice, plus a small team that covers every chosen task: greedy set cover,
 * ties broken by which practice lists the task first (its specialist), then catalogue order.
 */
export function planMatrix(selected: readonly string[], tasks: readonly MatrixTask[] = matrixTasks): MatrixResult {
  const chosen = tasks.filter((t) => selected.includes(t.id));
  const coverage = new Map<ServiceSlug, string[]>(PRACTICE_ORDER.map((p) => [p, chosen.filter((t) => t.covers.includes(p)).map((t) => t.id)]));

  const team: ServiceSlug[] = [];
  const open = new Set(chosen.map((t) => t.id));
  while (open.size > 0) {
    let best: ServiceSlug | null = null;
    let bestScore = 0;
    for (const p of PRACTICE_ORDER) {
      if (team.includes(p)) continue;
      const mine = chosen.filter((t) => open.has(t.id) && t.covers.includes(p));
      const primary = mine.filter((t) => t.covers[0] === p).length;
      const score = mine.length + primary / 100;
      if (score > bestScore) {
        best = p;
        bestScore = score;
      }
    }
    if (!best) break;
    team.push(best);
    (coverage.get(best) ?? []).forEach((id) => open.delete(id));
  }

  return {
    rows: PRACTICE_ORDER.map((slug) => ({ slug, covered: coverage.get(slug) ?? [], inTeam: team.includes(slug) })),
    team: PRACTICE_ORDER.filter((p) => team.includes(p)),
    shape: team.length === 0 ? 'none' : team.length === 1 ? 'specialist' : 'pod',
  };
}
