import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pages } from '@/data/pages';
import { services } from '@/data/services';
import {
  aggregateRatingSchema,
  breadcrumbSchema,
  DESCRIPTION_RANGE,
  faqSchema,
  graph,
  localBusinessSchema,
  pageTitle,
  serviceSchema,
  TITLE_RANGE,
} from '@/lib/seo';

interface Meta {
  title: string;
  description: string;
}

function blogMeta(): (Meta & { id: string })[] {
  const dir = join(process.cwd(), 'src/content/blog');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(join(dir, f), 'utf8');
      const fm = src.split('---')[1] ?? '';
      const pick = (key: string): string => {
        const m = fm.match(new RegExp(`^${key}:\\s*(?:"|')?(.*?)(?:"|')?\\s*$`, 'm'));
        return m?.[1] ?? '';
      };
      return { id: f, title: pick('metaTitle'), description: pick('description') };
    });
}

const all: [string, Meta][] = [
  ...Object.entries(pages).map(([k, v]) => [`page:${k}`, v] as [string, Meta]),
  ...services.map((s) => [`service:${s.slug}`, s.meta] as [string, Meta]),
  ...blogMeta().map((b) => [`blog:${b.id}`, b] as [string, Meta]),
];

describe('page metadata', () => {
  it.each(all)('%s has a 50-60 character title', (_, meta) => {
    const len = pageTitle(meta.title).length;
    expect(len, pageTitle(meta.title)).toBeGreaterThanOrEqual(TITLE_RANGE[0]);
    expect(len, pageTitle(meta.title)).toBeLessThanOrEqual(TITLE_RANGE[1]);
  });

  it.each(all)('%s has a 150-160 character description', (_, meta) => {
    expect(meta.description.length, meta.description).toBeGreaterThanOrEqual(DESCRIPTION_RANGE[0]);
    expect(meta.description.length, meta.description).toBeLessThanOrEqual(DESCRIPTION_RANGE[1]);
  });

  it('never repeats a title or description', () => {
    const titles = all.map(([, m]) => m.title);
    const descriptions = all.map(([, m]) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });
});

describe('structured data', () => {
  it('builds a LocalBusiness with full NAP, geo and hours', () => {
    const lb = localBusinessSchema();
    expect(lb).toMatchObject({
      telephone: '+13322870846',
      address: { streetAddress: '1207 Delaware Ave', addressLocality: 'Wilmington', postalCode: '19806' },
      geo: { '@type': 'GeoCoordinates' },
    });
    expect(lb.openingHoursSpecification).toBeInstanceOf(Array);
    expect(lb).not.toHaveProperty('aggregateRating');
  });

  it('omits AggregateRating without verified reviews', () => {
    expect(aggregateRatingSchema([])).toBeNull();
    expect(aggregateRatingSchema([{ author: 'A', rating: 5, body: 'x', date: '2026-01-01', verified: true }])).toMatchObject({
      ratingValue: 5,
      reviewCount: 1,
    });
  });

  it('builds breadcrumbs with absolute URLs', () => {
    const bc = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]) as { itemListElement: { item: string; position: number }[] };
    expect(bc.itemListElement[1]).toMatchObject({ position: 2, item: 'https://www.akrosstech.com/services' });
  });

  it('builds a Service node for every practice, linked to the business', () => {
    for (const s of services) {
      expect(serviceSchema(s)).toMatchObject({ '@type': 'Service', url: `https://www.akrosstech.com/services/${s.slug}`, provider: { '@id': 'https://www.akrosstech.com/#business' } });
    }
  });

  it('escapes markup inside JSON-LD', () => {
    const out = graph(faqSchema([{ q: '</script><script>alert(1)</script>', a: 'x' }]));
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out)['@graph'][0]['@type']).toBe('FAQPage');
  });

  it('has FAQ content for every service', () => {
    for (const s of services) expect(s.faqs.length, s.slug).toBeGreaterThanOrEqual(3);
  });

  it('uses the short service URLs', () => {
    expect(services.map((s) => s.slug)).toEqual(['virtual-assistance', 'recruitment', 'accounting', 'legal', 'website-development']);
  });
});
