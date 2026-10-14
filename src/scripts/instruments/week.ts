/**
 * Call week interaction: switch the U.S. zone the week is drawn in, see the Wilmington office
 * hours translated into it, follow the live "now" line, and select an hour to read the same
 * moment in Wilmington and in India. Arrow keys move through the grid (roving tabindex).
 * All time-zone maths comes from lib/time (tested).
 */
import { US_ZONES, INDIA_ZONE, formatClock, wallClock, zonedTimeToUtc } from '@/lib/time';

const WILMINGTON = 'America/New_York';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const hourLabel = (h: number): string => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'am' : 'pm'}`;

interface YMD {
  year: number;
  month: number;
  day: number;
}

function addDays(d: YMD, days: number): YMD {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day + days));
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}

export default function initWeek(root: HTMLElement): void {
  const grid = root.querySelector<HTMLElement>('[data-grid]');
  const cells = Array.from(root.querySelectorAll<HTMLButtonElement>('.week__cell'));
  const zoneButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-zone-id]'));
  const status = root.querySelector<HTMLElement>('[data-status]');
  const nowLine = root.querySelector<HTMLElement>('[data-now]');
  const when = root.querySelector<HTMLElement>('[data-out="when"]');
  const sentence = root.querySelector<HTMLElement>('[data-out="sentence"]');
  if (!grid || !cells.length) return;

  const opens = Number(root.dataset.opens ?? 540);
  const closes = Number(root.dataset.closes ?? 1080);
  const first = Number(root.dataset.first ?? 6);
  const last = Number(root.dataset.last ?? 19);
  const cols = 5;

  let zone: string = root.dataset.zone ?? US_ZONES[0].id;
  let selected = cells.find((c) => c.classList.contains('is-selected')) ?? cells[0]!;
  let monday: YMD = { year: 1970, month: 1, day: 1 };
  let timer: number | undefined;

  const zoneInfo = () => US_ZONES.find((z) => z.id === zone) ?? US_ZONES[0];

  /** Monday of the week on show: this week on weekdays, next week at the weekend. */
  function weekStart(now: Date): YMD {
    const t = wallClock(zone, now);
    const shift = t.weekday === 0 ? 1 : t.weekday === 6 ? 2 : -(t.weekday - 1);
    return addDays(t, shift);
  }

  const instantFor = (day: number, hour: number): Date => {
    const d = addDays(monday, day - 1);
    return zonedTimeToUtc(zone, d.year, d.month, d.day, hour, 0);
  };

  const officeOpenAt = (instant: Date): boolean => {
    const w = wallClock(WILMINGTON, instant);
    const m = w.hour * 60 + w.minute;
    return w.weekday >= 1 && w.weekday <= 5 && m >= opens && m < closes;
  };

  function renderCells(): void {
    const z = zoneInfo();
    cells.forEach((c) => {
      const day = Number(c.dataset.day);
      const hour = Number(c.dataset.hour);
      const open = officeOpenAt(instantFor(day, hour));
      c.classList.toggle('is-open', open);
      c.setAttribute('aria-label', `${DAY_NAMES[day]} ${hourLabel(hour)} ${z.short}, ${open ? 'office open' : 'office closed'}`);
    });
    root.querySelectorAll<HTMLElement>('[data-day-head]').forEach((h) => {
      const d = addDays(monday, Number(h.dataset.dayHead) - 1);
      const date = h.querySelector<HTMLElement>('[data-date]');
      if (date) date.textContent = String(d.day);
    });
    root.querySelectorAll('[data-zone-short]').forEach((el) => (el.textContent = z.short));
    root.querySelectorAll('[data-zone-long]').forEach((el) => (el.textContent = z.label));
  }

  function renderSelection(): void {
    const day = Number(selected.dataset.day);
    const hour = Number(selected.dataset.hour);
    const instant = instantFor(day, hour);
    const india = wallClock(INDIA_ZONE, instant);
    const local = wallClock(zone, instant);
    const wil = wallClock(WILMINGTON, instant);
    const dayNote = (w: { weekday: number }) => (w.weekday !== local.weekday ? ` (${DAY_SHORT[w.weekday]})` : '');
    cells.forEach((c) => {
      const on = c === selected;
      c.classList.toggle('is-selected', on);
      c.setAttribute('aria-pressed', String(on));
      c.tabIndex = on ? 0 : -1;
    });
    if (when) when.textContent = `${DAY_NAMES[day]}, ${hourLabel(hour)} ${zoneInfo().short}`;
    if (sentence) {
      sentence.textContent = `That is ${formatClock(instant, WILMINGTON)}${dayNote(wil)} in Wilmington and ${formatClock(instant, INDIA_ZONE)}${dayNote(india)} in India.${officeOpenAt(instant) ? '' : ' The office is closed then.'}`;
    }
  }

  function renderNow(): void {
    const now = new Date();
    const t = wallClock(zone, now);
    const z = zoneInfo();
    root.querySelectorAll<HTMLElement>('[data-day-head]').forEach((h) => {
      const d = addDays(monday, Number(h.dataset.dayHead) - 1);
      h.classList.toggle('is-today', d.year === t.year && d.month === t.month && d.day === t.day);
    });
    root.querySelectorAll<HTMLElement>('[data-hour-head]').forEach((h) => h.classList.toggle('is-now', Number(h.dataset.hourHead) === t.hour && t.weekday >= 1 && t.weekday <= 5));
    const inGrid = t.weekday >= 1 && t.weekday <= 5 && t.hour >= first && t.hour <= last;
    if (nowLine) {
      nowLine.hidden = !inGrid;
      if (inGrid) {
        nowLine.style.setProperty('--col', String(t.weekday + 1));
        nowLine.style.setProperty('--r', String(t.hour - first + 2));
        nowLine.style.setProperty('--f', String(t.minute / 60));
      }
    }
    if (status) {
      const open = officeOpenAt(now);
      status.classList.toggle('is-off', !open);
      if (open) {
        status.textContent = `Open now in Wilmington. It is ${formatClock(now, zone)} ${z.short}`;
      } else {
        // Find the next opening, hour by hour, within the coming week.
        let next: Date | null = null;
        for (let i = 1; i <= 24 * 8 && !next; i++) {
          const probe = new Date(Math.ceil(now.getTime() / 3_600_000) * 3_600_000 + (i - 1) * 3_600_000);
          if (officeOpenAt(probe)) next = probe;
        }
        const nextLocal = next ? wallClock(zone, next) : null;
        status.textContent =
          next && nextLocal
            ? `Closed now. Opens ${DAY_SHORT[nextLocal.weekday]} ${formatClock(next, zone)} ${z.short}`
            : 'Closed now. We reply next business morning';
      }
    }
  }

  function renderAll(): void {
    monday = weekStart(new Date());
    renderCells();
    renderSelection();
    renderNow();
  }

  cells.forEach((c) =>
    c.addEventListener('click', () => {
      selected = c;
      renderSelection();
    }),
  );

  // Arrow-key movement: rows are hours, columns are days.
  grid.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('week__cell')) return;
    const i = cells.indexOf(target as HTMLButtonElement);
    if (i < 0) return;
    const rows = cells.length / cols;
    let r = Math.floor(i / cols);
    let c = i % cols;
    if (e.key === 'ArrowRight') c = Math.min(cols - 1, c + 1);
    else if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
    else if (e.key === 'ArrowDown') r = Math.min(rows - 1, r + 1);
    else if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
    else if (e.key === 'Home') c = 0;
    else if (e.key === 'End') c = cols - 1;
    else return;
    e.preventDefault();
    const next = cells[r * cols + c];
    if (!next) return;
    selected = next;
    renderSelection();
    next.focus();
  });

  zoneButtons.forEach((b) =>
    b.addEventListener('click', () => {
      zone = b.dataset.zoneId ?? zone;
      zoneButtons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      renderAll();
    }),
  );

  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = US_ZONES.find((z) => z.id === local);
  if (match) {
    zone = match.id;
    zoneButtons.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.zoneId === zone)));
  }

  renderAll();
  timer = window.setInterval(renderNow, 30_000);
  document.addEventListener('visibilitychange', () => {
    window.clearInterval(timer);
    if (!document.hidden) {
      renderAll();
      timer = window.setInterval(renderNow, 30_000);
    }
  });
}
