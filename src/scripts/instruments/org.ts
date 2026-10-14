/**
 * Org chain interaction: select a role to isolate its node and read out what it owns; switch
 * "Specialist out today" to mark one specialist absent and draw the cover path to the bench.
 */
interface Role {
  key: string;
  name: string;
  where: string;
  body: string;
  owns: string[];
}

function parseRoles(root: HTMLElement): Role[] {
  const raw = root.querySelector<HTMLScriptElement>('[data-roles]')?.textContent ?? '[]';
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((r): r is Role => typeof r === 'object' && r !== null && 'key' in r && 'owns' in r);
  } catch {
    return [];
  }
}

export default function initOrg(root: HTMLElement): void {
  const roles = parseRoles(root);
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-role]'));
  const name = root.querySelector<HTMLElement>('[data-out="name"]');
  const where = root.querySelector<HTMLElement>('[data-out="where"]');
  const body = root.querySelector<HTMLElement>('[data-out="body"]');
  const owns = root.querySelector<HTMLUListElement>('[data-out="owns"]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-absence]');
  const cover = root.querySelector<HTMLElement>('[data-cover]');
  const absent = root.querySelector<HTMLElement>('[data-absent="candidate"]');
  const absentState = absent?.querySelector<HTMLElement>('[data-state]') ?? null;
  const benchState = root.querySelector<HTMLElement>('[data-bench-state]');
  const absentName = (root.dataset.absentName ?? 'Accountant').toLowerCase();
  if (!roles.length || !name || !where || !body || !owns) return;

  function select(key: string): void {
    const role = roles.find((r) => r.key === key);
    if (!role) return;
    root.dataset.selected = key;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === key)));
    name!.textContent = role.name;
    where!.textContent = role.where;
    body!.textContent = role.body;
    owns!.replaceChildren(
      ...role.owns.map((o) => {
        const li = document.createElement('li');
        li.textContent = o;
        return li;
      }),
    );
  }

  buttons.forEach((b) => b.addEventListener('click', () => select(b.dataset.role ?? 'partner')));

  // Arrow keys move between the role buttons, like a toolbar.
  buttons.forEach((b, i) =>
    b.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      const next = buttons[(i + step + buttons.length) % buttons.length];
      next?.focus();
      if (next) select(next.dataset.role ?? 'partner');
    }),
  );

  toggle?.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-checked') !== 'true';
    toggle.setAttribute('aria-checked', String(on));
    root.classList.toggle('is-covering', on);
    absent?.classList.toggle('is-absent', on);
    if (absentState) absentState.textContent = on ? 'Out today' : 'In';
    if (benchState) benchState.textContent = on ? 'Covering' : 'Standby';
    if (cover) {
      cover.textContent = on
        ? `The ${absentName} is out today. The team lead reassigns the queue to a vetted bench ${absentName} trained on your SOPs, then reviews the work as usual, so it still reaches you checked and on time.`
        : 'Full pod in. Every piece of work goes from a specialist, through the team lead, to you.';
    }
  });
}
