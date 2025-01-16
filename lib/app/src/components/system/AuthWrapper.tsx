"use client";

import { useEffect } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const { loading, setUser, setLoading } = useAuthStore();

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error(error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkAuth();

    // Set up periodic authentication check every 5 minutes
    const intervalId = setInterval(checkAuth, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [router, setUser, setLoading]);

  // Add listener for visibility changes to check auth when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}
