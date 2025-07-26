import type { Metadata } from "next";
import { Geist_Mono, Rubik } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { appConfig } from "@/constants/app-config";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full dark" suppressHydrationWarning>
        <body
          className={`${rubik.variable} ${geistMono.variable} antialiased h-full`}
        >
          {children}
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
