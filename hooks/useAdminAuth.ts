"use client";

import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAdminAuth(redirectOnFailure = true) {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  useEffect(() => {
    // Load user if not already loaded
    if (!user && !isLoading) {
      useUserStore.getState().loadUser();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && redirectOnFailure) {
      if (!isAuthenticated) {
        router.push('/signin?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [user, isLoading, isAuthenticated, isAdmin, redirectOnFailure, router]);

  return {
    user,
    isAdmin,
    isAuthenticated,
    isLoading,
  };
}

export function useRequireAdmin() {
  return useAdminAuth(true);
}