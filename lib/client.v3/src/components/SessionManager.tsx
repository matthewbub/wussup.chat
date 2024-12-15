import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { SessionRenewalPrompt } from "./SessionRenewalPrompt";

export const SessionManager: React.FC = () => {
  const {
    isAuthenticated,
    isSessionExpiring,
    sessionTimeRemaining,
    renewSession,
    useLogout,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 1000 * 60); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAuth]);

  if (!isAuthenticated) return null;

  return (
    <SessionRenewalPrompt
      showPrompt={isSessionExpiring}
      remainingTime={sessionTimeRemaining}
      onRenew={renewSession}
      onLogout={useLogout}
    />
  );
};
