"use client";
import { Login, PublicHeader } from "@ninembs-studio/system-ui";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div>
      <PublicHeader />
      <Login history={router} />
    </div>
  );
}
