"use client";
import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

const AccountPage = () => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <UserProfile
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />
    </div>
  );
};

export default AccountPage;
