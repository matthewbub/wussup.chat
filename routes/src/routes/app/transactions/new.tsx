import { Authorized } from "@/components/Authorized";
import { DashboardWrapper } from "@/components/DashboardWrapper";
import ImportBankStatement from "@/components/ImportBankStatementApp/ImportBankStatement";
import importBankStatementStore from "@/components/ImportBankStatementApp/ImportBankStatement.store";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/transactions/new")({
  component: ImportNewBankStatement,
});

function ImportNewBankStatement() {
  const reset = importBankStatementStore((state) => state.reset);

  useEffect(() => {
    reset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Authorized>
      <DashboardWrapper>
        <ImportBankStatement />
      </DashboardWrapper>
    </Authorized>
  );
}
