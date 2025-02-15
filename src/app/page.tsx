import { redirect } from "next/navigation";

export default function Page() {
  // Generate a new UUID and redirect to the session-specific path
  redirect(`/~/chat?session=${crypto.randomUUID()}`);
}
