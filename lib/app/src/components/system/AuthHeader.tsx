"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { LogoutButton } from "./LogoutButton";
import { STRINGS } from "@/constants/strings";
import { useClickOutside } from "react-haiku";

interface AuthHeaderProps {
  className?: string;
}

export function AuthHeader({ className = "" }: AuthHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => {
    setIsDropdownOpen(false);
  });

  if (!user) {
    return null;
  }

  return (
    <header
      className={`flex justify-between items-center py-4 px-6 md:px-10 bg-stone-900 text-stone-200 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold">{STRINGS.APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-10">
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-sm text-stone-200 selection:text-stone-50 selection:bg-stone-800"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            My Account
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-stone-800 border border-stone-700 rounded shadow-lg pt-2 z-50">
              <div className="border-b border-stone-700 pb-2">
                <span className="px-4 whitespace-nowrap text-sm text-white selection:text-stone-50 selection:bg-stone-700">
                  {user.email}
                </span>
              </div>
              <Link
                href="/settings"
                className="w-full px-4 py-2 text-stone-200 hover:text-stone-50 hover:bg-stone-700 cursor-pointer text-left text-sm inline-block"
              >
                Settings
              </Link>
              <LogoutButton
                className="w-full px-4 py-2 text-stone-200 hover:text-stone-50 hover:bg-stone-700 cursor-pointer text-left text-sm"
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
