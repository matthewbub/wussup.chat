"use client";

import { Background } from "@/components/ui/Background";

export default function Home() {
  return (
    <Background>
      <div className="text-white p-8 md:p-16 md:flex md:items-center container mx-auto h-[calc(100vh-100px)]">
        <div className="flex flex-col md:items-center w-full">
          <h1 className="text-3xl md:text-5xl font-black">
            Welcome to ZCauldron 🔮
          </h1>
          <p className="mt-4 text-sm md:text-xl">Another glorified database</p>
          <div className="mt-8 flex gap-4">
            <a href="/register" className="ch-button">
              Sign up now
            </a>
            <a href="/login" className="ch-button-secondary text-white">
              Login
            </a>
          </div>
        </div>
      </div>
      <footer className="text-white p-8 text-center h-[100px] flex items-end">
        <div className="container mx-auto">
          <p className="text-sm">&copy; 2025 ZCauldron. All rights reserved.</p>
        </div>
      </footer>
    </Background>
  );
}
