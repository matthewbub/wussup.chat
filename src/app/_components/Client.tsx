"use client";
import { AuthModal } from "@/components/AuthModal";
import { useEffect, useState } from "react";
import Hero from "@/components/marketing/hero";
import Footer from "@/components/Footer";
import { Background } from "@/components/ui/Background";
import { useAuthStore } from "../_store/chat";

export function Client({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const setIsLoggedIn = useAuthStore((state) => state.setIsLoggedIn);

  useEffect(() => {
    setIsLoggedIn(isLoggedIn);
  }, [isLoggedIn]);

  return (
    <div>
      <Background>
        <Hero setActiveModal={setActiveModal} />
        <AuthModal isOpen={activeModal === "auth"} onClose={() => setActiveModal(null)} />
        <Footer />
      </Background>
    </div>
  );
}
