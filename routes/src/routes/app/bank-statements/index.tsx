import { DashboardWrapper } from "@/components/DashboardWrapper";
import BankStatementDetailsTable from "@/components/ImportBankStatementApp/components/BankStatementDetailsTable";
import importBankStatementStore from "@/components/ImportBankStatementApp/ImportBankStatement.store";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/bank-statements/")({
  component: BankStatements,
});

function BankStatements() {
  const getUserTransactions = importBankStatementStore(
    (state) => state.getUserTransactions
  );
  const reset = importBankStatementStore((state) => state.reset);

  useEffect(() => {
    reset();

    // Fetch transactions from the database
    getUserTransactions();
  }, []);

  return (
    <DashboardWrapper>
      <BankStatementDetailsTable withImportStatementsButton />
    </DashboardWrapper>
  );
}
