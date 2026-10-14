/**
 * Small fuzzy matcher for the 404 page finder. Scores each query word against the words of a
 * page's title, path and keywords: prefix beats substring, substring beats an in-order
 * subsequence, and a bigram similarity catches typos ("acounting", "conatct").
 */

export interface SearchEntry {
  title: string;
  path: string;
  group: string;
  /** Extra words that should find the page. */
  keywords?: string;
  body?: string;
}

export const normalise = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Words worth searching for in a URL path: no ids, no file extensions, no one-letter scraps. */
export function pathWords(pathname: string): string {
  return normalise(
    decodeURIComponent(pathname)
      .replace(/\.(html?|php|aspx?)$/i, '')
      .replace(/[-_/.]+/g, ' '),
  )
    .split(' ')
    .filter((w) => w.length > 1 && !/^\d+$/.test(w))
    .join(' ');
}

const bigrams = (w: string): string[] => {
  const out: string[] = [];
  for (let i = 0; i < w.length - 1; i++) out.push(w.slice(i, i + 2));
  return out;
};

/** Sørensen–Dice similarity on character bigrams, 0..1. */
export function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const A = bigrams(a);
  const B = bigrams(b);
  const pool = new Map<string, number>();
  B.forEach((g) => pool.set(g, (pool.get(g) ?? 0) + 1));
  let hits = 0;
  for (const g of A) {
    const n = pool.get(g) ?? 0;
    if (n > 0) {
      hits++;
      pool.set(g, n - 1);
    }
  }
  return (2 * hits) / (A.length + B.length);
}

/** Optimal string alignment distance: edits, counting a swap of two neighbours as one. */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2]![j - 2]! + 1);
      d[i]![j] = v;
    }
  }
  return d[a.length]![b.length]!;
}

const isSubsequence = (needle: string, hay: string): boolean => {
  let i = 0;
  for (const ch of hay) if (ch === needle[i]) i++;
  return i === needle.length;
};

function wordScore(token: string, word: string): number {
  if (word === token) return 4;
  if (word.startsWith(token)) return 3 + token.length / word.length;
  if (token.length >= 3 && word.includes(token)) return 2;
  if (token.length >= 3 && isSubsequence(token, word) && token.length / word.length >= 0.6) return 1.5 * (token.length / word.length);
  if (token.length >= 4 && Math.abs(token.length - word.length) <= 2) {
    const dist = editDistance(token, word);
    if (dist <= (token.length >= 7 ? 2 : 1)) return 2 - 0.3 * dist;
  }
  const d = dice(token, word);
  return d >= 0.55 ? 2 * d : 0;
}

/** Score an entry against a query. 0 means no match. Title words weigh more than path words. */
export function score(query: string, entry: SearchEntry): number {
  const tokens = normalise(query).split(' ').filter(Boolean);
  if (!tokens.length) return 0;
  const title = normalise(entry.title).split(' ');
  const rest = normalise(`${entry.path} ${entry.keywords ?? ''} ${entry.group}`).split(' ');
  let total = 0;
  let matched = 0;
  for (const t of tokens) {
    let best = 0;
    for (const w of title) best = Math.max(best, wordScore(t, w) * 1.25);
    for (const w of rest) best = Math.max(best, wordScore(t, w));
    if (best > 0) matched++;
    total += best;
  }
  if (!matched) return 0;
  // Reward entries that match every word of the query.
  return (total / tokens.length) * (matched / tokens.length);
}

export function search(query: string, entries: SearchEntry[], limit = 6): SearchEntry[] {
  return entries
    .map((e, i) => ({ e, s: score(query, e), i }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((r) => r.e);
}

/**
 * The single best entry, only when it is a confident match: every query word must match well
 * (an average word score of at least `min`). Used to suggest a page for a broken address,
 * where a weak partial match ("nope-page" → any page mentioning "pages") would mislead.
 */
export function bestMatch(query: string, entries: SearchEntry[], min = 2): SearchEntry | undefined {
  const [top] = search(query, entries, 1);
  return top && score(query, top) >= min ? top : undefined;
}
