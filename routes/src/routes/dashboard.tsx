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
      <ImportBankStatement />
    </Authorized>
  );
}
