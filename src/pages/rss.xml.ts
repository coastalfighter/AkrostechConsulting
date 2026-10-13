import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { getPosts, postHref } from '@/lib/blog';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  return rss({
    title: `${site.name} Insights`,
    description: 'Practical guides on outsourcing, hiring, finance operations, legal support and building fast business websites.',
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.published,
      link: postHref(p),
      categories: [p.data.category, ...p.data.tags],
      author: `${site.email} (${p.data.author})`,
    })),
    customData: '<language>en-us</language>',
  });
};
