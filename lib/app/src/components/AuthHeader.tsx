"use client";

import { useAuthStore } from "@/stores/authStore";
import { LogoutButton } from "./LogoutButton";
import { STRINGS } from "@/constants/strings";

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className = "" }: AuthHeaderProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <header className={`flex justify-between items-center p-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{user.email}</span>
      </div>
      <LogoutButton
        className="ch-button"
        onLogoutError={(error) => {
          console.error(STRINGS.LOGOUT_ERROR_GENERIC, error);
        }}
      />
    </header>
  );
}
