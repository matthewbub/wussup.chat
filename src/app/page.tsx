"use client";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import Hero from "@/components/marketing/hero";
import Footer from "@/components/Footer";
import { Background } from "@/components/ui/Background";

export default function Page() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

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
