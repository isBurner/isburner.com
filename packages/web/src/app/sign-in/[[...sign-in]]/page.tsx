import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — isBurner',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
