import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { SessionManager } from "@/components/SessionManager";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
      <SessionManager />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  );
}
