import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'Google-Extended'],
        allow: '/',
      },
    ],
    sitemap: 'https://isburner.com/sitemap.xml',
  };
}
