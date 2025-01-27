"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { STRINGS } from "@/constants/strings";

interface LogoutButtonProps {
  redirectTo?: string;
  className?: string;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: Error) => void;
  children?: React.ReactNode;
}

export function LogoutButton({
  redirectTo,
  className = "",
  onLogoutSuccess,
  onLogoutError,
  children,
}: LogoutButtonProps) {
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await logout({
        redirectTo,
        onSuccess: () => {
          onLogoutSuccess?.();
        },
        onError: (error) => {
          onLogoutError?.(error);
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
      type="button"
      aria-busy={isLoading}
    >
      {children || (isLoading ? STRINGS.LOGOUT_LOADING : STRINGS.LOGOUT_BUTTON)}
    </button>
  );
}
