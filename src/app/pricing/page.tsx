import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const AccountPage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-10 max-w-2xl mx-auto">
      <PricingTable appearance={{ baseTheme: dark }} />
    </div>
  );
};

export default AccountPage;
