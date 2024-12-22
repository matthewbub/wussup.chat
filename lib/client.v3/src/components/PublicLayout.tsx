import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicLayout({
  children,
  noRegister,
}: {
  children: React.ReactNode;
  noRegister?: boolean;
}) {
  return (
    <div className="flex flex-col min-h-screen mx-auto">
      <header className="px-4 md:px-6 lg:px-12 h-24 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="ml-2 text-lg font-semibold">ZCauldron</span>
        </Link>
        <nav className="ml-auto flex gap-8">
          {!noRegister && (
            <>
              <Link
                className="text-[16px] font-medium hover:underline underline-offset-4 h-9 px-4 py-2"
                href="/login"
              >
                Login
              </Link>

              <Button
                variant="outline"
                className="text-[16px] font-medium"
                asChild
              >
                <Link to="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
          {isAuthenticated && (
            <>
              <a
                className="text-[16px] font-medium hover:underline underline-offset-4 h-9 px-4 py-2"
                href="/me"
              >
                Me
              </a>
              <Button
                variant="outline"
                className="text-[16px] font-medium hover:underline underline-offset-4"
              >
                Logout
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1 mx-auto">{children}</main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 ZCauldron. All rights reserved.
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
