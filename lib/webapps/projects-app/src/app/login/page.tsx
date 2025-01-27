"use client";
import { LoginFormV2 } from "@/components/system/LoginFormV2";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full max-w-sm md:max-w-3xl mx-auto">
      <LoginFormV2 />
    </div>
  );
}
