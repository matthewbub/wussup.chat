import { createFileRoute } from "@tanstack/react-router";
import ImportBankStatement from "@/components/ImportBankStatement";
import { Authorized } from "@/components/Authorized";

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
