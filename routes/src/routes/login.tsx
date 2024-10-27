import { useAuthStore } from "../stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { LoginFormComponent } from "@/components/login-form";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <LoginFormComponent />
    </main>
  );
}
