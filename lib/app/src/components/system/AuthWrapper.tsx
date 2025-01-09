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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setUser, setLoading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}
