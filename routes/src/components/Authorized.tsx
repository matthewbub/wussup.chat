import * as React from "react";
import { useAuthStore } from "@/stores/auth";
import { Navigate } from "@tanstack/react-router";

export function useAuthCheck() {
  const { checkAuth } = useAuthStore();

  React.useEffect(() => {
    // Initial auth check
    checkAuth();

    // Set up periodic auth check (every 5 minutes)
    const intervalId = setInterval(
      () => {
        checkAuth();
      },
      5 * 60 * 1000 // 5 minutes
    );

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [checkAuth, useAuthCheck]);
}

export function Authorized({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  useAuthCheck();

  // Optional: Show loading state while checking authentication
  // if (isLoading) {
  //   return <div>Loading...</div>; // Or your loading component
  // }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}
