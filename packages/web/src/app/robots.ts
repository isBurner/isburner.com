import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/dashboard',
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended'],
        allow: '/',
        disallow: '/dashboard',
      },
    ],
    sitemap: 'https://isburner.com/sitemap.xml',
  };
}
