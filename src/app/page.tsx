"use client";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import Hero from "@/components/marketing/hero";

export default function Page() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div>
      <Hero setActiveModal={setActiveModal} />
      <AuthModal isOpen={activeModal === "auth"} onClose={() => setActiveModal(null)} />
    </div>
  );
}
