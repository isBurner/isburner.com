import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up — isBurner',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
