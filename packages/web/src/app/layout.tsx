import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'isBurner — Disposable Email Detection API',
    template: '%s | isBurner',
  },
  description:
    'Is this email trash? One API call to find out. Fast, affordable disposable email detection for developers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
