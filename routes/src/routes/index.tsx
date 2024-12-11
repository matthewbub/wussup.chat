import { createFileRoute } from "@tanstack/react-router";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";
import PrivateSecureFinancialAnalysis from "@/components/PrivateSecureFinancialAnalysis";
import { PublicLayout } from "@/components/PublicLayout";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LandingPageComponent,
});

export function LandingPageComponent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pagesProcessed = useAuthStore((state) => state.pagesProcessed);
  const setPagesProcessed = useAuthStore((state) => state.setPagesProcessed);

  useEffect(() => {
    setPagesProcessed();
  }, []);

  return (
    <PublicLayout>
      <div
        className={cn("pb-24 sm:pb-20", isAuthenticated ? "pt-10" : "sm:pt-40")}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          Pages {pagesProcessed}
          <PrivateSecureFinancialAnalysis />
          <div className="mt-16 flow-root">
            <ImportBankStatement
              labels={{
                title: "Import Bank Statement",
              }}
              displayLoginModalOnUnauthorized
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
