"use client";
import { Login, PublicHeader } from "@ninembs-studio/auth-ui";
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
