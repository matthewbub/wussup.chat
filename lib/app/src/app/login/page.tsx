"use client";
import Login from "@ninembs-studio/auth-ui/login";
import PublicHeader from "@/components/system/PublicHeader";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div>
      <PublicHeader />
      <Login history={router} />
    </div>
  );
}
