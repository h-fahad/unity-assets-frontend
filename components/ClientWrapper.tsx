"use client";

import { useUserStore } from '@/store/useUserStore';
import { useEffect } from 'react';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { loadUser } = useUserStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return <>{children}</>;
}