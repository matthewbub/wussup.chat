"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function Header() {
  const { user, client } = useAuthStore();

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Project Manager
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/boards" className="text-blue-500 hover:text-blue-700">
            All Boards
          </Link>
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">{user.email}</span>
              {client && (
                <span className="text-gray-600">| Team: {client?.name}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
