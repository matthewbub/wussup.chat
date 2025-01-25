import { Suspense } from "react";
import EmailVerification from "@/components/system/EmailVerification";

// this is the server component that wraps our client component in a suspense boundary
export default function VerifyEmailPage() {
  // by adding suspense, we avoid the missing suspense warning
  return (
    <Suspense
      fallback={<div className="text-white">checking your email...</div>}
    >
      <div>
        <EmailVerification userEmail={null} />
      </div>
    </Suspense>
  );
}
