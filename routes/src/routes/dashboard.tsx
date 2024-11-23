import { createFileRoute } from "@tanstack/react-router";
import { Authorized } from "@/components/Authorized";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

export function DashboardComponent() {
  return (
    <Authorized>
      <ImportBankStatement />
    </Authorized>
  );
}
