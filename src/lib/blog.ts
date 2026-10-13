import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export function wordCount(body: string | undefined): number {
  return (body ?? '').replace(/[#>*_`|[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(body: string | undefined): number {
  return Math.max(1, Math.round(wordCount(body) / 230));
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

export const postHref = (post: Post): string => `/blog/${post.id}`;

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d);

export const categorySlug = (c: string): string => c.toLowerCase().replace(/[^a-z]+/g, '-');
