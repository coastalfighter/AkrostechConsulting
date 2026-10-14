import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = ['Outsourcing', 'Virtual assistance', 'Recruitment', 'Accounting', 'Legal', 'Web development'] as const;

export const BLOG_SERVICES = ['virtual-assistance', 'recruitment', 'accounting', 'legal', 'website-development'] as const;

const categoryFor: Record<(typeof BLOG_SERVICES)[number], (typeof CATEGORIES)[number]> = {
  'virtual-assistance': 'Virtual assistance',
  recruitment: 'Recruitment',
  accounting: 'Accounting',
  legal: 'Legal',
  'website-development': 'Web development',
};

const artFor = { 'virtual-assistance': 'va', recruitment: 'rpo', accounting: 'accounting', legal: 'legal', 'website-development': 'web' } as const;

/**
 * Articles carried over from the Sample-3 site. Frontmatter follows that site's format
 * (title, description, date, author, tags, service, keywords, faqs, draft) plus `metaTitle`;
 * derived fields (published, category, excerpt, art) keep older components working.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z
    .object({
      title: z.string().min(10).max(110),
      /** <title> tag, 50-60 characters including the brand (enforced in tests). */
      metaTitle: z.string(),
      description: z.string().min(150).max(160),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      author: z.string().default('Akrostech Team'),
      tags: z.array(z.string()).min(1).max(4),
      service: z.enum(BLOG_SERVICES).optional(),
      keywords: z.array(z.string()).default([]),
      faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
      draft: z.boolean().default(false),
    })
    .transform((d) => {
      const variant = [...d.title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % 4;
      return {
        ...d,
        published: d.date,
        category: d.service ? categoryFor[d.service] : ('Outsourcing' as const),
        excerpt: d.description,
        art: d.service ? artFor[d.service] : ('va' as const),
        artVariant: variant,
        featured: false,
        related: [] as string[],
      };
    }),
});

export const collections = { blog };
