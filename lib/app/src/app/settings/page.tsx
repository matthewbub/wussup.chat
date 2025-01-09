"use client";

import { AuthWrapper } from "@/components/system/AuthWrapper";
import { AuthHeader } from "@/components/system/AuthHeader";

export default function Dashboard() {
  return (
    <AuthWrapper>
      <div className="max-w-6xl mx-auto p-4 h-full">
        <AuthHeader />
      </div>
    </AuthWrapper>
  );
}
