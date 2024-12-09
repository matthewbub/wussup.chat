import { createFileRoute } from "@tanstack/react-router";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";
import PrivateSecureFinancialAnalysis from "@/components/PrivateSecureFinancialAnalysis";
import { PublicLayout } from "@/components/PublicLayout";

export const Route = createFileRoute("/")({
  component: LandingPageComponent,
});

export function LandingPageComponent() {
  return (
    <PublicLayout>
      <div className="pb-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <PrivateSecureFinancialAnalysis />
          <div className="mt-16 flow-root sm:mt-24">
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
