import { Suspense } from 'react';
import EmailVerification from '@/components/auth/EmailVerification';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerification />
    </Suspense>
  );
}

export const metadata = {
  title: 'Verify Email - Unity Assets Marketplace',
  description: 'Verify your email address to activate your account',
};
