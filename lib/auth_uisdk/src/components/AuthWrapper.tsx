import React, { useEffect } from "react";
import { authService } from "../services/auth";
import { useAuthStore } from "../stores/authStore";

interface AuthWrapperProps {
  children: React.ReactNode;
  history: any; // You can use any custom history object here
}

export function AuthWrapper({ children, history }: AuthWrapperProps) {
  const { loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error(error);
        history.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [history, setUser, setLoading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
