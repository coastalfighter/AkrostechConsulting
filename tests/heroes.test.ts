import { describe, expect, it } from 'vitest';
import { bandOf, DEFAULT_ON, estimate, layout } from '@/lib/pagebuilder';
import { dice, pathWords, score, search, type SearchEntry } from '@/lib/fuzzy';

describe('page-builder estimate', () => {
  it('uses Google’s LCP thresholds', () => {
    expect(bandOf(2.5)).toBe('good');
    expect(bandOf(2.6)).toBe('ni');
    expect(bandOf(4)).toBe('ni');
    expect(bandOf(4.1)).toBe('poor');
  });

  it('starts lean and good', () => {
    const e = estimate(DEFAULT_ON);
    expect(e.band).toBe('good');
    expect(e.kb).toBeLessThan(500);
  });

  it('heavy blocks push the page toward poor', () => {
    expect(estimate([...DEFAULT_ON, 'tracking', 'chat']).band).toBe('ni');
    const all = estimate(['hero', 'services', 'proof', 'pricing', 'blog', 'contact', 'chat', 'video', 'tracking']);
    expect(all.band).toBe('poor');
    expect(all.heaviest?.id).toBe('video');
  });

  it('lays blocks out in order and grows with each block', () => {
    const a = layout(['hero']);
    const b = layout(['hero', 'services']);
    expect(b.height).toBeGreaterThan(a.height);
    expect(b.y.services).toBeGreaterThan(b.y.hero ?? 0);
  });
});

describe('fuzzy page finder', () => {
  const entries: SearchEntry[] = [
    { title: 'Accounting Assistance', path: '/services/accounting', group: 'Practices', keywords: 'bookkeeping QuickBooks' },
    { title: 'Website Development', path: '/services/website-development', group: 'Practices', keywords: 'Shopify WordPress' },
    { title: 'Contact', path: '/contact', group: 'Company' },
    { title: 'New York, NY', path: '/locations/new-york-ny', group: 'Locations' },
  ];

  it('turns a broken path into search words', () => {
    expect(pathWords('/servics/acounting-help.html')).toBe('servics acounting help');
    expect(pathWords('/blog/2024/')).toBe('blog');
  });

  it('scores similar words', () => {
    expect(dice('acounting', 'accounting')).toBeGreaterThan(0.8);
    expect(score('xyzzy', entries[0]!)).toBe(0);
  });

  it('finds pages by prefix, keyword and typo', () => {
    expect(search('web', entries)[0]?.path).toBe('/services/website-development');
    expect(search('shopify', entries)[0]?.path).toBe('/services/website-development');
    expect(search('acounting', entries)[0]?.path).toBe('/services/accounting');
    expect(search('conatct', entries)[0]?.path).toBe('/contact');
    expect(search('new york', entries)[0]?.path).toBe('/locations/new-york-ny');
  });
});

import { bestMatch as confidentMatch } from '@/lib/fuzzy';

describe('404 closest page', () => {
  const entries = [
    { title: 'Website Development', path: '/services/website-development', group: 'Practices', keywords: 'landing pages shopify' },
    { title: 'Virtual Assistance', path: '/services/virtual-assistance', group: 'Practices' },
  ];
  it('suggests a page only for a confident match', () => {
    expect(confidentMatch('nope page', entries)).toBeUndefined();
    expect(confidentMatch('virtual assistant', entries)?.path).toBe('/services/virtual-assistance');
  });
});
