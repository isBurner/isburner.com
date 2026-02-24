import type { MetadataRoute } from 'next';
import { DOMAIN_META } from '@/data/domain-meta';

const SITE_URL = 'https://isburner.com';

const curatedDomains = Object.keys(DOMAIN_META);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: '2026-02-22',
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: '2026-02-22',
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: '2026-02-22',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified: '2026-02-22',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sign-in`,
      lastModified: '2026-02-22',
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: '2026-02-22',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: '2026-02-22',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const domainPages: MetadataRoute.Sitemap = curatedDomains.map((domain) => ({
    url: `${SITE_URL}/domain/${domain}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...domainPages];
}
