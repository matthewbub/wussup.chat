"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { ResetPassword } from "@ninembs-studio/system-ui";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const appId = searchParams.get("appId");

  if (!token || !appId) {
    return (
      <Card className="p-6">
        <p className="text-red-500">invalid reset password link</p>
      </Card>
    );
  }

  return <ResetPassword token={token} appId={appId} history={router} />;
}
