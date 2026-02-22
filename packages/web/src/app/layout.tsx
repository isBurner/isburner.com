import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

const SITE_URL = 'https://isburner.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'isBurner — Disposable Email Detection API',
    template: '%s | isBurner',
  },
  description:
    'Is this email trash? One API call to find out. Fast, affordable disposable email detection for developers. 30,000+ known domains, MX heuristics, sub-5ms response.',
  keywords: [
    'disposable email API',
    'burner email detection',
    'temporary email checker',
    'throwaway email API',
    'block fake signups',
    'email validation API',
    'disposable email domains',
  ],
  authors: [{ name: 'isBurner' }],
  creator: 'isBurner',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'isBurner',
    title: 'isBurner — Disposable Email Detection API',
    description:
      'Is this email trash? One API call to find out. 30,000+ known domains, MX heuristics, sub-5ms response.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'isBurner — Disposable Email Detection API',
    description:
      'Is this email trash? One API call to find out. 30,000+ known domains, MX heuristics, sub-5ms response.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
