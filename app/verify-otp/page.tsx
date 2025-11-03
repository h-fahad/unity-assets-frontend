import { Suspense } from 'react';
import OTPVerification from '@/components/auth/OTPVerification';

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerification />
    </Suspense>
  );
}

export const metadata = {
  title: 'Verify Email - Unity Assets Marketplace',
  description: 'Enter your verification code to activate your account',
};
