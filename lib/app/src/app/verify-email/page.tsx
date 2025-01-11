import { Suspense } from "react";
import { EmailVerification } from "@ninembs-studio/system-ui";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  return (
    <Suspense
      fallback={<div className="text-white">checking your email...</div>}
    >
      <div>
        <EmailVerification userEmail={null} history={router} />
      </div>
    </Suspense>
  );
}
