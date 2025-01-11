import React from "react";
import { STRINGS } from "../constants/strings";

interface PublicHeaderProps {
  className?: string;
}

export default function PublicHeader({ className = "" }: PublicHeaderProps) {
  return (
    <header
      className={`flex justify-between items-center py-4 px-6 md:px-10 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold">{STRINGS.APP_NAME}</h1>
      </div>
      <div className="flex items-center gap-6">
        <a className="btn btn-outline">Sign in</a>
        <a className="btn btn-primary">Register</a>
      </div>
    </header>
  );
}
