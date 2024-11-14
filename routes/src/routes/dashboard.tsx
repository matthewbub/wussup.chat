import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import ImportBankStatement from "@/components/ImportBankStatement";
import { Authorized } from "@/components/Authorized";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

export function DashboardComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Authorized>
      <div className="flex flex-col min-h-screen mx-auto">
        <header className="px-4 lg:px-6 h-14 flex items-center">
          <Link className="flex items-center justify-center" href="/">
            <span className="ml-2 text-lg font-semibold">ZCauldron</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
              href="/me"
            >
              Me
            </Link>
            <button
              className="text-sm font-medium hover:underline underline-offset-4 px-4 py-2"
              onClick={() => {
                useAuthStore.getState().useLogout();
              }}
            >
              Logout
            </button>
          </nav>
        </header>
        <main className="flex-1 mx-auto">
          <ImportBankStatement />
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 ZCauldron. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-xs hover:underline underline-offset-4"
              href="#"
            >
              Privacy
            </Link>
          </nav>
        </footer>
      </div>
    </Authorized>
  );
}
