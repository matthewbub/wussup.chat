import { createFileRoute } from "@tanstack/react-router";
import { Authorized } from "@/components/Authorized";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";
import { DashboardWrapper } from "@/components/DashboardWrapper";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

export function DashboardComponent() {
  return (
    <Authorized>
      <DashboardWrapper>
        <ImportBankStatement />
      </DashboardWrapper>
    </Authorized>
  );
}
