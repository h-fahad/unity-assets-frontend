import { Suspense } from "react";
import DemoPaymentSuccessContent from "./DemoPaymentSuccessContent";

export default function DemoPaymentSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DemoPaymentSuccessContent />
    </Suspense>
  );
}