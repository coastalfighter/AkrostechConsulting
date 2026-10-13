import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = ['Outsourcing', 'Virtual assistance', 'Recruitment', 'Accounting', 'Legal', 'Web development'] as const;

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(10).max(110),
    /** <title> tag, 50-60 characters including the brand (enforced in tests). */
    metaTitle: z.string(),
    description: z.string().min(150).max(160),
    excerpt: z.string().max(240),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(CATEGORIES),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Akrostech Editorial Team'),
    art: z.enum(['va', 'rpo', 'accounting', 'legal', 'web']),
    artVariant: z.number().int().min(0).max(7).default(0),
    featured: z.boolean().default(false),
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
