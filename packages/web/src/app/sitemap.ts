import type { MetadataRoute } from 'next';

const SITE_URL = 'https://isburner.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: '2025-02-22',
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: '2025-02-22',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: '2025-02-22',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
