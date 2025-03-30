import { getUserFromHeaders, supabaseFacade } from "@/lib/server-utils";
import { headers } from "next/headers";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";

export default async function Page() {
  const headersList = await headers();
  const userInfo = await getUserFromHeaders(headersList);
  const user = await supabaseFacade.getOrMakeUser(userInfo);
  if ("error" in user) {
    return <div>Error: {user.error}</div>;
  }

  return (
    <div className="mx-auto py-10 px-4">
      <PublicHeader />

      <Footer />
    </div>
  );
}
