/**
 * Services matrix: toggle task chips, recompute coverage and the suggested team shape.
 * The planning logic lives in lib/matrix (tested); this file only reads and writes the DOM.
 */
import { matrixTasks, planMatrix } from '@/lib/matrix';

export default function initMatrix(root: HTMLElement): void {
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-task]'));
  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-row]'));
  const ticks = Array.from(root.querySelectorAll<HTMLElement>('[data-tick]'));
  const go = Array.from(root.querySelectorAll<HTMLElement>('[data-go]'));
  const chosenOut = root.querySelector<HTMLElement>('[data-out="chosen"]');
  const shapeOut = root.querySelector<HTMLElement>('[data-out="shape"]');
  const shapeBody = root.querySelector<HTMLElement>('[data-out="shape-body"]');
  if (!chips.length || !rows.length) return;

  const labelOf = (id: string): string => matrixTasks.find((t) => t.id === id)?.label ?? id;
  const names = new Map(rows.map((r) => [r.dataset.row ?? '', r.querySelector('.mx__link')?.textContent?.trim() ?? '']));
  const nameOf = (slug: string): string => names.get(slug) || slug;

  function selected(): string[] {
    return chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.task ?? '');
  }

  function render(): void {
    const sel = selected();
    const plan = planMatrix(sel);
    const total = sel.length;
    if (chosenOut) chosenOut.textContent = String(total);

    ticks.forEach((t) => t.classList.toggle('is-on', sel.includes(t.dataset.tick ?? '')));

    plan.rows.forEach((r) => {
      const row = rows.find((el) => el.dataset.row === r.slug);
      if (!row) return;
      const state = r.inTeam ? 'team' : r.covered.length ? 'also' : 'none';
      row.dataset.state = state;
      row.classList.toggle('lime', state === 'team');
      const tag = row.querySelector<HTMLElement>('[data-tag]');
      const list = row.querySelector<HTMLElement>('[data-covers-list]');
      const n = row.querySelector<HTMLElement>('[data-n]');
      const of = row.querySelector<HTMLElement>('[data-total]');
      const nLabel = row.querySelector<HTMLElement>('[data-n-label]');
      if (tag) tag.textContent = state === 'team' ? 'In your team' : state === 'also' ? 'Also covers' : 'Not needed';
      if (list) list.textContent = r.covered.length ? r.covered.map(labelOf).join(', ') : total ? 'None of the chosen tasks' : 'No tasks chosen';
      if (n) n.textContent = String(r.covered.length);
      if (of) of.textContent = String(total);
      if (nLabel) nLabel.setAttribute('aria-label', `Covers ${r.covered.length} of ${total} chosen tasks`);
      row.querySelectorAll<HTMLElement>('[data-cell]').forEach((cell) => cell.classList.toggle('is-on', sel.includes(cell.dataset.cell ?? '')));
    });

    if (shapeOut) {
      shapeOut.textContent =
        plan.shape === 'pod' ? `A pod across ${plan.team.length} practices` : plan.shape === 'specialist' ? 'One specialist' : 'Choose a task';
    }
    if (shapeBody) {
      shapeBody.textContent =
        plan.shape === 'pod'
          ? `${plan.team.map(nameOf).join(' + ')}, under one team lead and one weekly report.`
          : plan.shape === 'specialist'
            ? `A dedicated ${nameOf(plan.team[0] ?? '')} professional on your hours, with a team lead reviewing the work.`
            : 'Pick the work you want handed over and the matrix shows who covers it.';
    }
    go.forEach((li) => {
      li.hidden = !plan.team.some((slug) => slug === li.dataset.go);
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      render();
    });
  });

  render();
}
