"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading, user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if user is already logged in when component mounts
    if (user && !isLoading) {
      router.push(user.role === 'ADMIN' ? '/admin' : '/');
    }
  }, []); // Remove dependencies to only run on mount

  async function handleSubmit() {
    setError("");
    
    // Basic validation
    if (!email || !password) {
      const errorMsg = "Please enter both email and password";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    try {
      await login(email, password);
      toast.success("Login successful! Redirecting...");
      
      // Small delay to show the toast before redirect
      setTimeout(() => {
        const user = useUserStore.getState().user;
        router.push(user?.role === 'ADMIN' ? '/admin' : '/');
      }, 1000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      <div className="flex flex-col gap-4 bg-white p-12 rounded-xl shadow w-100">
        <label className="flex flex-col gap-1">
          Email
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
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
            onKeyDown={handleKeyDown}
            required
            placeholder="••••••••"
          />
        </label>
        {error && <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>}
        <Button 
          type="button" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleSubmit();
          }} 
          className="mt-2" 
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
        <div className="text-sm text-center mt-2">
          Don&apos;t have an account? <span onClick={() => router.push('/register')} className="underline cursor-pointer">Register</span>
        </div>
        <div className="text-sm text-center mt-2">
          <span onClick={() => router.push('/reset-password')} className="text-blue-600 hover:underline cursor-pointer">Forgot your password?</span>
        </div>
      </div>
    </main>
  );
} 