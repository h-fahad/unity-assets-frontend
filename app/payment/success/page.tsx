"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home } from "lucide-react";
import toast from 'react-hot-toast';
import { useUserStore } from "@/store/useUserStore";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useUserStore();

  useEffect(() => {
    if (sessionId) {
      // You could verify the session here if needed
      setLoading(false);
      toast.success('Payment successful! Your subscription is now active.');
      
      // Refresh user data to get updated subscription info
      setTimeout(() => {
        refreshUser();
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId, refreshUser]);

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Processing...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-600">
            Thank you for your subscription! Your account has been upgraded and you now have access to premium Unity assets.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Browse our premium asset library</li>
              <li>• Download assets up to your daily limit</li>
              <li>• Access exclusive content</li>
              <li>• Manage your subscription from your account page</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/assets')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Browse Assets
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 