import { SignUp } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <SignUp appearance={clerkAppearance} />
    </div>
  );
}
