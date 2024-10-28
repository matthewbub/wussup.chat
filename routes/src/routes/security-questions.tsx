import { useAuthStore } from "../stores/auth";
import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import SecurityQuestionsForm from "@/components/security-questions";

export const Route = createFileRoute("/security-questions")({
  component: SecurityQuestionsComponent,
});

function SecurityQuestionsComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <main className="flex justify-center items-center h-screen">
      <SecurityQuestionsForm />
    </main>
  );
}
