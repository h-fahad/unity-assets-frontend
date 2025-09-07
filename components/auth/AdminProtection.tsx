"use client";

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home } from 'lucide-react';

interface AdminProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtection({ children, fallback }: AdminProtectionProps) {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Load user if not already loaded
    if (!user && !isLoading) {
      useUserStore.getState().loadUser();
    }
  }, [user, isLoading]);

  // Show loading while checking authentication
  if (isLoading || !user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Checking permissions...</h2>
            <p className="text-gray-600">Please wait while we verify your access.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Check if user is admin
  if (user.role !== 'ADMIN') {
    return fallback || (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-red-600">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You need administrator privileges to access this page.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/')} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // User is admin, render children
  return <>{children}</>;
}