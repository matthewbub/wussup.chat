"use client";

import { useState } from "react";
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
import { Link } from "@tanstack/react-router";

export function ForgotPasswordForm() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", content: "" });

    if (!username.trim()) {
      setMessage({ type: "error", content: "Please enter your username." });
      return;
    }

    try {
      // Here you would typically make an API call to initiate the password reset process
      // For this example, we'll simulate a successful request
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating API call
      setMessage({
        type: "success",
        content:
          "If a matching account was found, we have sent a password reset link to the associated email address.",
      });
      setUsername("");
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
        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
        <CardDescription>
          Enter your username to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
        <Link href="/login" className="text-sm text-primary hover:underline">
          Back to Login
        </Link>
        <Link href="/signup" className="text-sm text-primary hover:underline">
          Create Account
        </Link>
      </CardFooter>
    </Card>
  );
}
