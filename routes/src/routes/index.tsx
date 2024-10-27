import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fetchSecureTest } from "@/utils/auth-helpers";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const useLogin = useAuthStore((state) => state.useLogin);
  const useLogout = useAuthStore((state) => state.useLogout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="p-2 mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold pb-4">
        {isAuthenticated ? "Logged in" : "Logged out"}
      </h1>

      <div className="flex gap-2">
        {isAuthenticated && (
          <Button onClick={fetchSecureTest}>Test Example</Button>
        )}

        {isAuthenticated && (
          <Button
            onClick={async () => {
              await useLogout();
            }}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
