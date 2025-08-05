"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, isLoading } = useUserStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    
    try {
      await register(email, password, name);
      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration failed");
    }
  }

  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-white p-8 rounded-xl shadow  w-100"
      >
        <label className="flex flex-col gap-1">
          Name
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your Name"
          />
        </label>
        <label className="flex flex-col gap-1">
          Email
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
          />
        </label>
        <label className="flex flex-col gap-1">
          Password
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Registration successful! Redirecting to sign in...</div>}
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </Button>
        <div className="text-sm text-center mt-2">
          Already have an account?{" "}
          <a href="/signin" className="underline">
            Sign In
          </a>
        </div>
      </form>
    </main>
  );
}
