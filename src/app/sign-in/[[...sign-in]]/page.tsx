"use client";

import { appConfig } from "@/constants/app-config";
import Footer from "@/components/footer";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Page() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col h-screen">
      <div className="container mx-auto p-4">
        <Link
          href="/"
          className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
        >
          {appConfig.name}
        </Link>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <SignIn
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
