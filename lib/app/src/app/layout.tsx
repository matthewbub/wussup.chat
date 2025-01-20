import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Background } from "@/components/ui/Background";
import "../styles/globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZCauldron",
  description: "A glorified database of knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <Background>{children}</Background>
        <Toaster />
      </body>
    </html>
  );
}
