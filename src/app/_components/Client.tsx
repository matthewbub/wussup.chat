"use client";

import { AuthModal } from "@/components/AuthModal";
import { useEffect, useState } from "react";
import { HeaderHero } from "@/app/_components/HeaderHero";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/app/_store/auth";

export function Client({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  useEffect(() => {
    setIsLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div>
      <HeaderHero setActiveModal={setActiveModal} />
      <AuthModal isOpen={activeModal === "auth"} onClose={() => setActiveModal(null)} />
      <Footer />
    </div>
  );
}
