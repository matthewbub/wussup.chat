"use client";

import { SignIn } from "@clerk/nextjs";
import { ReactNode } from "react";

type AuthOverlayProps = {
  children?: ReactNode;
  signInComponent?: React.ReactNode;
};

export function AuthOverlay({ children, signInComponent }: AuthOverlayProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        {signInComponent || <SignIn />}
      </div>
      {children}
    </>
  );
}
