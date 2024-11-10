import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useAuthStore } from "@/stores/auth";
import { DebugInfoBar } from "@/components/DebugInfoBar";
import { Toaster } from "@/components/ui/toaster";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return (
    <>
      <DebugInfoBar />
      {/* <div className="p-2 flex gap-2 justify-between">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{" "}
        <div className="flex gap-2">
          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                activeProps={{
                  className: "font-bold",
                }}
              >
                Login
              </Link>
              <Link
                to="/sign-up"
                activeProps={{
                  className: "font-bold",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
          {isAuthenticated && (
            <Link onClick={() => useAuthStore.getState().useLogout()}>
              Logout
            </Link>
          )}
        </div>
      </div> */}
      {/* <hr /> */}
      <Outlet />
      <Toaster />
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </>
  );
}
