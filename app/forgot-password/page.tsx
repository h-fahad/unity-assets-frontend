import { Suspense } from 'react';
import ForgotPassword from '@/components/auth/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPassword />
    </Suspense>
  );
}

export const metadata = {
  title: 'Reset Password - Unity Assets Marketplace',
  description: 'Reset your Unity Assets Marketplace account password',
};
