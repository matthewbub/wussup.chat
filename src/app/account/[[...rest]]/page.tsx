"use client";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const AccountPage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <UserProfile appearance={{ baseTheme: dark }} />
    </div>
  );
};

export default AccountPage;
