import type { APIRoute } from 'astro';
import { products } from '../data/products';

/**
 * public/robots.txt advertises /sitemap.xml, which did not exist — crawlers
 * following it got a 404. Generated here so it stays in step with the
 * catalogue instead of being maintained by hand.
 */
const SITE = 'https://redwanmart.com';

const staticPages: Array<{ path: string; priority: string; changefreq: string }> = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/products', priority: '0.9', changefreq: 'weekly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/search', priority: '0.4', changefreq: 'monthly' },
];

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];

  const urls = [
    ...staticPages.map((p) => ({ loc: `${SITE}${p.path}`, priority: p.priority, changefreq: p.changefreq })),
    ...products.map((p) => ({
      loc: `${SITE}/products/${p.id}`,
      priority: '0.8',
      changefreq: 'weekly',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
