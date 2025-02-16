import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Pacifico } from "next/font/google";
import { Background } from "@/components/ui/Background";
import "../styles/globals.css";
import "katex/dist/katex.min.css";
import { Toaster } from "@/components/ui/toaster";
import { PostHogProvider } from "./providers";
// import { ReactScan } from "@/components/ReactScan";

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
  title: "Wussup Chat",
  description: "Unified AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      {/* <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head> */}
      {/* <ReactScan /> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${title.variable} antialiased h-full`}
      >
        <PostHogProvider>
          <Background>{children}</Background>
          <Toaster />
        </PostHogProvider>
      </body>
    </html>
  );
}
