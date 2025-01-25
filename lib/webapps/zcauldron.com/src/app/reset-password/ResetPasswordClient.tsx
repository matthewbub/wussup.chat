"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/cards";
import { ResetPassword } from "@/components/system/ResetPassword";

// this is the client component that actually uses useSearchParams
// all comments are in lowercase for consistency

export default function ResetPasswordClient() {
  // we must access searchparams in a client component
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

  return <ResetPassword />;
}
