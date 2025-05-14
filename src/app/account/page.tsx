import { UserProfile } from "@clerk/nextjs";

const AccountPage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <UserProfile />
    </div>
  );
};

export default AccountPage;
