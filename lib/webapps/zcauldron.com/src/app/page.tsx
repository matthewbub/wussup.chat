"use client";

import { Background } from "@/components/ui/Background";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <Background>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Welcome to ZCauldron 🔮
            </h1>
            <p className="text-white text-lg mb-8">
              Another glorified database, a digital notebook if you will
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link
                  href="/chat"
                  className="min-w-[120px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                >
                  Go to chats
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="min-w-[120px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                  >
                    Sign up now
                  </Link>
                  <Link
                    href="/login"
                    className="min-w-[120px] px-4 py-2 rounded-lg border border-white text-white hover:bg-white/10 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
        <footer className="p-6 text-center text-white">
          <p className="text-sm">&copy; 2025 ZCauldron. All rights reserved.</p>
        </footer>
      </div>
    </Background>
  );
}
