import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Authorized } from "@/components/Authorized";

export const Route = createFileRoute("/account/reset-password")({
  component: ResetPasswordForAuthenticatedUsers,
});

function ResetPasswordForAuthenticatedUsers() {
  return (
    <Authorized>
      <AuthenticatedResetPasswordForm />
    </Authorized>
  );
}

function AuthenticatedResetPasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setMessage({ type: "error", content: "Please fill in all fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", content: "Passwords do not match." });
      return;
    }

    try {
      const data = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await data.json();
      if (!json.ok) {
        throw new Error("Failed to reset password.");
      }

      setMessage({
        type: "success",
        content: "Password reset successfully.",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage({
        type: "error",
        content: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>
          Enter your current password and a new password to reset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>
          {message.content && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertDescription>{message.content}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <button
          onClick={() => {
            history.back();
          }}
          className="text-sm text-primary hover:underline"
        >
          Go Back
        </button>
      </CardFooter>
    </Card>
  );
}
