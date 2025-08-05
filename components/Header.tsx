"use client";

import Link from 'next/link';
import { useUserStore } from '@/store/useUserStore';
import { User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useUserStore();

  // Determine where the account link should go
  const accountHref = user?.role === "ADMIN" ? "/admin" : "/account";

  return (
    <header className="w-full bg-white shadow-sm mb-8">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-black">UnityAssets</Link>
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/packages" className="hover:underline">Packages</Link>
          {user && (
            <Link href={accountHref} className="hover:underline">Account</Link>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-4">
              <Link href={accountHref} className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <span className="sr-only">Profile</span>
              </Link>
              <button
                onClick={logout}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-4">
              <Link href="/signin" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition">Sign In</Link>
              <Link href="/register" className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
} 