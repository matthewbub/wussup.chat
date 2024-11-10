import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  FileText,
  Layout,
  List,
  Eye,
  Plus,
  Search,
  SortAsc,
  Printer,
  Download,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";

export const Route = createFileRoute("/")({
  component: LandingPageComponent,
});

export function LandingPageComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex flex-col min-h-screen mx-auto">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <a className="flex items-center justify-center" href="#">
          <FileText className="h-6 w-6" />
          <span className="ml-2 text-lg font-semibold">DocuMaster</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {!isAuthenticated ? (
            <>
              <a
                className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
                href="#features"
              >
                Sign up
              </a>
              <a
                className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
                href="/login"
              >
                Login
              </a>
            </>
          ) : (
            <>
              <a
                className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
                href="/me"
              >
                Me
              </a>
              <a
                className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
                href="/logout"
              >
                Logout
              </a>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1 mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Manage Your Documents with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create, edit, organize, and share multi-sheet documents in one
                  place. Navigate your document collection effortlessly.
                </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
              Key Features
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 items-start justify-center">
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Layout className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Multi-Sheet Documents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Create and manage documents with multiple sheets
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Eye className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Flexible Viewing Modes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Switch between Web View and Pages View
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <List className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Table of Contents</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Easy navigation with a dynamic table of contents
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <FileText className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Markdown Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Write in Markdown and preview rendered content
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Download className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Export Functionality</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Export your documents in various formats
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border-gray-800 p-4">
                <Printer className="h-12 w-12 mb-4 text-stone-900 dark:text-stone-50" />
                <h3 className="text-xl font-bold">Print Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Easily print your documents and sheets
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="get-started" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Start Managing Your Documents Today
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Experience the power of our comprehensive document management
                  tool. Create, edit, organize, and share your documents with
                  ease.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input
                    className="max-w-lg flex-1"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign up for free and start organizing your documents.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 DocuMaster. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
