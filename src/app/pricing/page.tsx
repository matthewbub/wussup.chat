"use client";
import { PricingTable } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { Header } from "@/components/HeadersAreCool";

const AccountPage = () => {
  const { theme } = useTheme();

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center mt-10 max-w-2xl mx-auto">
        <PricingTable
          appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
        />
      </div>
    </div>
  );
};

export default AccountPage;
