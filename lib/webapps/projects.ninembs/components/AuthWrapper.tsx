"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchUserData, initialized } = useAuthStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (!initialized) {
    return <div>Loading...</div>; // Or your preferred loading component
  }

  return <>{children}</>;
}
