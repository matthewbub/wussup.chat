"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        console.log("user", user);
        setUserData(user);
      } catch (error) {
        console.log("error", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {userData?.email}</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}
