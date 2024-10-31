import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fetchSecureTest } from "@/utils/auth-helpers";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const useLogout = useAuthStore((state) => state.useLogout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSecurityQuestionsAnswered = useAuthStore(
    (state) => state.isSecurityQuestionsAnswered
  );
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  React.useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="p-2 mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold pb-4">Debugger</h1>
      <ol>
        <li>
          <strong>Authenticated:</strong>{" "}
          {isAuthenticated ? "Logged in" : "Logged out"}
        </li>
        <li>
          <strong>Security questions answered:</strong>{" "}
          {isSecurityQuestionsAnswered ? "Yes" : "No"}
          {isAuthenticated && !isSecurityQuestionsAnswered && (
            <a
              href="/security-questions"
              className="pl-1 text-blue-500 dark:text-blue-400 hover:underline"
            >
              Answer security questions
            </a>
          )}
        </li>
        {user && (
          <li>
            <strong>User:</strong>
            <ul className="pl-4">
              <li>ID: {user.id}</li>
              <li>Username: {user.username}</li>
              <li>Email: {user.email}</li>
            </ul>
          </li>
        )}
      </ol>

      {isAuthenticated && (
        <div className="flex space-x-2 mt-4">
          <Button onClick={fetchSecureTest}>Test Example</Button>
          <Button
            onClick={async () => {
              await useLogout();
            }}
          >
            Logout
          </Button>
          <Link href="/account/reset-password">Reset Password</Link>
        </div>
      )}
    </div>
  );
}
