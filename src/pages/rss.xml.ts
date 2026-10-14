import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { site } from '@/config/site';
import { getPosts, postHref } from '@/lib/blog';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  return rss({
    title: `${site.name} guides`,
    description: 'Practical guides on offshore talent, operations, hiring and websites, from the team that does the work every day.',
    site: context.site ?? site.url,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postHref(p),
      categories: [...new Set([p.data.category, ...p.data.tags])],
      author: `${site.email} (${p.data.author})`,
    })),
    customData: '<language>en-us</language>',
  });
};
