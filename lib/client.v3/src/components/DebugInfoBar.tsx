"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/auth";

export function DebugInfoBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, isSecurityQuestionsAnswered, user } = useAuthStore();

  // Only show authenticated user data if available, otherwise use placeholder values
  const debugInfo = {
    isAuthenticated,
    isSecurityQuestionsAnswered,
    userId: user?.id ?? "not authenticated",
    username: user?.username ?? "not authenticated",
    email: user?.email ?? "not authenticated",
    applicationEnvironmentRole: user?.applicationEnvironmentRole ?? "none",
    securityQuestionsAnswered: user?.securityQuestionsAnswered ?? false,
    sessionId: "sess_123456789",
    lastLogin: "2023-04-01T12:34:56Z",
    userAgent: window.navigator.userAgent,
    currentUrl: window.location.pathname,
    apiVersion: "v1.2.3",
    buildNumber: "1234",
    environment: process.env.NODE_ENV,
  };

  if (!isVisible) return null;
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Card className="rounded-none border-b bg-yellow-100 dark:bg-yellow-900">
      <CardContent className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <span className="font-bold">Debug Info:</span>
            <span>Auth: {debugInfo?.isAuthenticated?.toString()}</span>
            <span>
              Security Q: {debugInfo?.isSecurityQuestionsAnswered?.toString()}
            </span>
            <span>User ID: {debugInfo?.userId}</span>
            <span>Username: {debugInfo?.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="ml-2">
                {isExpanded ? "View Less" : "View More"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        {isExpanded && (
          <ScrollArea className="h-[200px] mt-2">
            <div className="space-y-2 text-xs">
              <p>
                <strong>Email:</strong> {debugInfo?.email}
              </p>
              <p>
                <strong>Application Environment Role:</strong>{" "}
                {debugInfo?.applicationEnvironmentRole}
              </p>
              <p>
                <strong>Security Questions Answered:</strong>{" "}
                {debugInfo?.securityQuestionsAnswered?.toString()}
              </p>
              <p>
                <strong>Session ID:</strong> {debugInfo?.sessionId}
              </p>
              <p>
                <strong>Last Login:</strong> {debugInfo?.lastLogin}
              </p>
              <p>
                <strong>User Agent:</strong> {debugInfo?.userAgent}
              </p>
              <p>
                <strong>Current URL:</strong> {debugInfo?.currentUrl}
              </p>
              <p>
                <strong>API Version:</strong> {debugInfo?.apiVersion}
              </p>
              <p>
                <strong>Build Number:</strong> {debugInfo?.buildNumber}
              </p>
              <p>
                <strong>Environment:</strong> {debugInfo?.environment}
              </p>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
