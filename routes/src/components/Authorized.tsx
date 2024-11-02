import * as React from "react";
import { useAuthStore } from "@/stores/auth";
import { Navigate } from "@tanstack/react-router";
import { config } from "@/app_config";
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
      // TODO: Make this configurable
      config.AUTH_CHECK_INTERVAL
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
