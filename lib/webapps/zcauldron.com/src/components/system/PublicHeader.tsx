"use client";
import { STRINGS } from "@/constants/strings";

interface PublicHeaderProps {
  className?: string;
}

export function PublicHeader({ className = "" }: PublicHeaderProps) {
  return (
    <header
      className={`flex justify-between items-center py-4 px-6 md:px-10 bg-white dark:bg-gray-800 shadow-sm ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {STRINGS.APP_NAME}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="/login"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 
          border border-gray-300 dark:border-gray-600 rounded-md 
          hover:bg-gray-50 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200"
        >
          Sign in
        </a>
        <a
          href="/register"
          className="px-4 py-2 text-sm font-medium text-white 
          bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 
          rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors duration-200"
        >
          Register
        </a>
      </div>
    </header>
  );
}
