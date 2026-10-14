import { describe, expect, it } from 'vitest';
import { DEFAULT_SELECTION, PRACTICE_ORDER, matrixTasks, planMatrix } from '@/lib/matrix';
import { HIRES, RATE, clampRate, funnelRates, funnelStages, planFunnel } from '@/lib/funnel';

describe('services matrix', () => {
  it('covers every task with at least one practice', () => {
    for (const t of matrixTasks) {
      expect(t.covers.length).toBeGreaterThan(0);
      t.covers.forEach((p) => expect(PRACTICE_ORDER).toContain(p));
    }
  });

  it('suggests a two-practice pod for the default selection', () => {
    const plan = planMatrix(DEFAULT_SELECTION);
    expect(plan.shape).toBe('pod');
    expect(plan.team).toEqual(['virtual-assistance', 'accounting-assistance']);
    const rpo = plan.rows.find((r) => r.slug === 'recruitment-process-outsourcing');
    expect(rpo?.covered).toEqual(['interviews']);
    expect(rpo?.inTeam).toBe(false);
  });

  it('prefers the specialist practice on a tie', () => {
    expect(planMatrix(['interviews']).team).toEqual(['recruitment-process-outsourcing']);
    expect(planMatrix(['invoices']).team).toEqual(['accounting-assistance']);
  });

  it('suggests one specialist or nothing', () => {
    expect(planMatrix(['contracts', 'deadlines']).shape).toBe('specialist');
    expect(planMatrix([]).shape).toBe('none');
  });

  it('every chosen task is covered by the suggested team', () => {
    const all = matrixTasks.map((t) => t.id);
    const plan = planMatrix(all);
    for (const t of matrixTasks) expect(t.covers.some((p) => plan.team.includes(p))).toBe(true);
    expect(plan.team.length).toBeLessThanOrEqual(5);
  });
});

describe('hiring funnel model', () => {
  it('works backwards from hires through each rate, rounding up', () => {
    const counts = planFunnel(HIRES.default, funnelRates.map((r) => r.value));
    expect(counts).toHaveLength(funnelStages.length);
    expect(counts).toEqual([284, 85, 34, 20, 7, 5]);
  });

  it('never needs fewer candidates upstream', () => {
    const counts = planFunnel(25, [95, 95, 95, 95, 95]);
    for (let i = 1; i < counts.length; i++) expect(counts[i - 1]!).toBeGreaterThanOrEqual(counts[i]!);
  });

  it('clamps rates to the allowed range and step', () => {
    expect(clampRate(0)).toBe(RATE.min);
    expect(clampRate(100)).toBe(RATE.max);
    expect(clampRate(42)).toBe(40);
  });
});
