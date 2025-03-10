import { auth } from "@clerk/nextjs/server";
import { Client } from "./_components/Client";

export default async function Page() {
  const { userId } = await auth();
  return <Client isLoggedIn={!!userId} />;
}
