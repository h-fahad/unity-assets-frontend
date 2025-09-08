"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function DemoPaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(searchParams.get('session_id'));
    setPlanId(searchParams.get('plan'));
    setBillingCycle(searchParams.get('cycle'));
  }, [searchParams]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-green-600">
            Payment Successful (Demo)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-gray-600">
            This is a demo payment success page. In production, this would be a real Stripe checkout success.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Demo Transaction Details:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Session ID:</strong> {sessionId || 'N/A'}</p>
              <p><strong>Plan ID:</strong> {planId || 'N/A'}</p>
              <p><strong>Billing Cycle:</strong> {billingCycle || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              💡 <strong>Note:</strong> This is a demonstration. No actual payment was processed. 
              In a production environment, this would integrate with real Stripe checkout sessions.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/packages">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Packages
              </Button>
            </Link>
            <Link href="/">
              <Button>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}