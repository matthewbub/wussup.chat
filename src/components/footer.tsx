"use client";
import { appConfig } from "@/constants/app-config";

export default function Footer() {
  return (
    <footer className="w-full py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            © {new Date().getFullYear()} {appConfig.name}. All rights reserved.
            v{appConfig.version}
          </div>
        </div>
      </div>
    </footer>
  );
}
