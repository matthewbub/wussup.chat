import { createFileRoute } from "@tanstack/react-router";
import ImportBankStatementMVP from "@/components/ImportBankStatement";
import { Authorized } from "@/components/Authorized";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";
import { Toaster } from "@/components/ui/toaster";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

export function DashboardComponent() {
  return (
    <Authorized>
      {/* <ImportBankStatementMVP /> */}
      <ImportBankStatement />
      {/* <Toaster /> */}
    </Authorized>
  );
}
