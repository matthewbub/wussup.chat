"use client";
import Footer from "@/components/footer";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Header } from "@/components/HeadersAreCool";

export default function Page() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex justify-center items-center">
        <SignUp
          appearance={{
            baseTheme: theme === "dark" ? dark : undefined,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
