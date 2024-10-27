import { useAuthStore } from "../stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
});

function ForgotPasswordComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <ForgotPasswordForm />
    </main>
  );
}
