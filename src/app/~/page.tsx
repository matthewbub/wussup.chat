import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return redirect("/~/" + crypto.randomUUID());
}
