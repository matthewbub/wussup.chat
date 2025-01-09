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
    <header
      className={`flex justify-between items-center py-4 px-6 md:px-10  ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold">{STRINGS.APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 selection:text-white selection:bg-black">
            {user.email}
          </span>
        </div>
        <LogoutButton
          className="ch-button"
          onLogoutError={(error) => {
            console.error(STRINGS.LOGOUT_ERROR_GENERIC, error);
          }}
        />
      </div>
    </header>
  );
}
