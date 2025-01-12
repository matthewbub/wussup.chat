"use client";

import { Background } from "@/components/ui/Background";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <Background>
      <div className="hero min-h-[calc(100vh-100px)]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              Welcome to ZCauldron 🔮
            </h1>
            <p className="py-6 text-white">Another glorified database</p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn btn-primary">
                    Sign up now
                  </Link>
                  <Link href="/login" className="btn btn-ghost text-white">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="footer footer-center p-4 text-white">
        <p className="text-sm">&copy; 2025 ZCauldron. All rights reserved.</p>
      </footer>
    </Background>
  );
}
