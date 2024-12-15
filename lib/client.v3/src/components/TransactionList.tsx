import React, { useState } from "react";
import { Transaction } from "../../types/budget";
import { formatCurrency } from "../../utils/formatCurrency";
import { colors } from "../../utils/colors";
import { YearMonthToggle } from "./YearMonthToggle";

interface TransactionListProps {
  transactions: Transaction[];
  title: string;
  className?: string;
  colorScheme?: keyof typeof colors;
}

export function TransactionList({
  transactions,
  title,
  className = "",
  colorScheme = "primary",
}: TransactionListProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const color = colors[colorScheme];

  const filteredTransactions = transactions.filter((transaction) => {
    if (selectedMonth === "all") {
      return transaction.year === selectedYear;
    }
    return (
      transaction.year === selectedYear && transaction.month === selectedMonth
    );
  });

  const total = filteredTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const years = Array.from(
    new Set(transactions.map((transaction) => transaction.year))
  ).sort((a, b) => b - a);

  return (
    <div
      className={`${color.bg} p-4 rounded-lg shadow-sm ${className} border ${color.cardBorder}`}
    >
      <h2 className={`text-lg font-semibold mb-4 ${color.text}`}>{title}</h2>
      <YearMonthToggle
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        years={years}
      />
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${color.border}`}>
              <th className="text-left p-2 text-sm font-medium text-slate-600">
                Date
              </th>
              <th className="text-left p-2 text-sm font-medium text-slate-600">
                Description
              </th>
              <th className="text-right p-2 text-sm font-medium text-slate-600">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index} className={`border-b ${color.border}`}>
                <td className="p-2 text-sm">{transaction.date}</td>
                <td className="p-2 text-sm">{transaction.description}</td>
                <td className="text-right p-2 text-sm">
                  {formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={2} className="p-2 text-sm">
                Total
              </td>
              <td className={`text-right p-2 text-sm ${color.text}`}>
                {formatCurrency(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
