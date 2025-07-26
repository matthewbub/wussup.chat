"use client";

import Footer from "@/components/footer";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Header } from "@/components/HeadersAreCool";

export default function Page() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex justify-center items-center">
        <SignIn
          appearance={{
            baseTheme: dark,
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
