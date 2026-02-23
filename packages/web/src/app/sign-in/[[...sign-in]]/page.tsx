import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
