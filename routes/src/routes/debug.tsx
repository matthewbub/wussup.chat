import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fetchSecureTest } from "@/utils/auth-helpers";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Authorized } from "@/components/Authorized";
import { DashboardWrapper } from "@/components/DashboardWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/debug")({
  component: DebugComponent,
});

function DebugComponent() {
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
    <Authorized>
      <DashboardWrapper>
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
              <Card>
                <CardHeader>
                  <CardTitle>User</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Field</TableHeader>
                        <TableHeader>Value</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>{user.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>{user.username}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Application Environment Role</TableCell>
                        <TableCell>{user.applicationEnvironmentRole}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Security Questions Answered</TableCell>
                        <TableCell>
                          {user.securityQuestionsAnswered ? "Yes" : "No"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
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
      </DashboardWrapper>
    </Authorized>
  );
}
