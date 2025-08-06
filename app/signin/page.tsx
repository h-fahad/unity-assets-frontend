"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === 'ADMIN' ? '/admin' : '/');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      setError(errorMessage);
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-12 rounded-xl shadow w-100">
        <label className="flex flex-col gap-1">
          Email
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
          />
        </label>
        <label className="flex flex-col gap-1">
          Password
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>
        {error && <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>}
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
        <div className="text-sm text-center mt-2">
          Don&apos;t have an account? <a href="/register" className="underline">Register</a>
        </div>
        <div className="text-sm text-center mt-2">
          <a href="/reset-password" className="text-blue-600 hover:underline">Forgot your password?</a>
        </div>
      </form>
      <div className="mt-6 text-center text-xs text-gray-500">
        <div>Demo Admin Account:</div>
        <div>Email: <span className="font-mono">admin@example.com</span></div>
        <div>Password: <span className="font-mono">admin123</span></div>
      </div>
    </main>
  );
} 