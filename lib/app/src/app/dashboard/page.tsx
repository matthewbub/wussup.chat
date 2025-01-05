"use client";

import { AuthWrapper } from "@/components/AuthWrapper";
import { AuthHeader } from "@/components/AuthHeader";

export default function Dashboard() {
  return (
    <AuthWrapper>
      <div>
        <AuthHeader />
        {/* Rest of your dashboard content */}
      </div>
    </AuthWrapper>
  );
}
