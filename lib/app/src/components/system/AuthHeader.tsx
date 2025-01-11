"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { LogoutButton } from "./LogoutButton";
import { STRINGS } from "@/constants/strings";
import { useClickOutside } from "react-haiku";
import { useSidebarStore } from "@/stores/sidebarStore";

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className = "" }: AuthHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
  });

  if (!user) {
    return null;
  }

  return (
    <header
      className={`flex justify-between items-center py-4 px-6 md:px-10 bg-transparent text-base-content ${className}`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-base-200 rounded-md transition-colors"
        >
          ☰
        </button>
        <Link href="/">
          <h1 className="text-lg lg:text-2xl font-bold">{STRINGS.APP_NAME}</h1>
        </Link>
      </div>
      <div className="flex items-center gap-10">
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-sm text-base-content hover:text-primary"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            Me
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-base-200 border border-base-300 rounded-lg shadow-xl pt-2 z-50 w-48">
              <div className="border-b border-base-300 pb-2">
                <span className="px-4 whitespace-nowrap text-sm text-base-content">
                  {user.email}
                </span>
              </div>
              <Link
                href="/settings"
                className="w-full px-4 py-2 text-base-content hover:bg-base-300 hover:text-primary cursor-pointer text-left text-sm inline-block"
              >
                Settings
              </Link>
              <LogoutButton
                className="w-full px-4 py-2 text-base-content hover:bg-base-300 hover:text-primary cursor-pointer text-left text-sm"
                onLogoutError={(error) => {
                  console.error(STRINGS.LOGOUT_ERROR_GENERIC, error);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
