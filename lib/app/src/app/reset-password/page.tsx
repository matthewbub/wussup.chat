"use client";
import { ResetPassword } from "@/components/system/ResetPassword";
import { Card } from "@/components/ui/Card";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const appId = searchParams.get("appId");

  if (!token || !appId) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Invalid reset password link</p>
      </Card>
    );
  }

  return <ResetPassword token={token} appId={appId} />;
}
