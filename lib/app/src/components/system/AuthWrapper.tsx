"use client";

import { useEffect } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { subscriptionService } from "@/services/subscription";
import { useSubscriptionStore } from "@/stores/useSubscription";
import LoadingPulse from "../ui/Loading";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const { loading, setUser, setLoading } = useAuthStore();
  const { setSubscription, setLoading: setSubLoading } = useSubscriptionStore();

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      await authService.ensureUserExists(user);

      // Check subscription status
      const { active, expiresAt } =
        await subscriptionService.hasActiveSubscription(user.id);

      setSubscription({
        isSubscribed: active,
        active,
        expiresAt,
      });

      setUser(user);
    } catch (error) {
      console.error(error);
      router.push("/login");
    } finally {
      setLoading(false);
      setSubLoading(false);
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
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <LoadingPulse size="medium" />
        </div>
      </div>
    );
  }

  return children;
}
