import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Pacifico } from "next/font/google";
import "../styles/globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/toaster";
import { PostHogProvider } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = Pacifico({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ZCauldron",
  description: "Unified AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} ${title.variable} antialiased h-full`}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PostHogProvider>
              <div className="h-full">
                {children}
                <Toaster />
              </div>
            </PostHogProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
