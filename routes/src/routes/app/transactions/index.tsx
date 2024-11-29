import { DashboardWrapper } from "@/components/DashboardWrapper";
import BankStatementDetailsTable from "@/components/ImportBankStatementApp/components/BankStatementDetailsTable";
import importBankStatementStore from "@/components/ImportBankStatementApp/ImportBankStatement.store";
import { toast } from "@/hooks/use-toast";
import { useToast } from "@/hooks/use-toast";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/transactions/")({
  component: BankStatements,
});

function BankStatements() {
  const getUserTransactions = importBankStatementStore(
    (state) => state.getUserTransactions
  );
  const error = importBankStatementStore((state) => state.error);
  const reset = importBankStatementStore((state) => state.reset);
  const toast = useToast();

  // Use useEffect only for cleanup
  useEffect(() => {
    return () => reset();
  }, [reset]);

  // Use a separate effect to watch for errors
  useEffect(() => {
    if (error) {
      toast.toast({
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Load data on mount using a self-executing async function
  useEffect(() => {
    (async () => {
      try {
        await getUserTransactions();
      } catch (err) {
        // This is a fallback in case the store's error handling fails
        toast.toast({
          title: "Error",
          description: "Failed to load transactions",
        });
      }
    })();
  }, [getUserTransactions, toast]);

  return (
    <DashboardWrapper>
      <BankStatementDetailsTable withImportStatementsButton />
    </DashboardWrapper>
  );
}
