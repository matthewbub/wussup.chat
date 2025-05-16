import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { appConfig } from "@/constants/app-config";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProviderWrapper>
              <div className="h-full">
                {/* <Header /> */}
                {children}
                {/* <Footer /> */}
              </div>
            </SidebarProviderWrapper>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

function SidebarProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full relative" defaultOpen={false}>
      <AppSidebar />
      <SidebarTrigger className="mt-4 ml-4 sticky top-0 text-muted-foreground" />
      <div className="h-full w-full">{children}</div>
    </SidebarProvider>
  );
}
