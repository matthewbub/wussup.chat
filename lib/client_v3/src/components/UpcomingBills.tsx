import React, { useState } from "react";
import { Bill } from "../../types/budget";
import { formatCurrency } from "../../utils/formatCurrency";
import { colors } from "../../utils/colors";
import { YearMonthToggle } from "./YearMonthToggle";

interface UpcomingBillsProps {
  bills: Bill[];
  className?: string;
}

export function UpcomingBills({ bills, className = "" }: UpcomingBillsProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");

  const color = colors.accent;

  const filteredBills = bills.filter((bill) => {
    if (selectedMonth === "all") {
      return bill.year === selectedYear;
    }
    return bill.year === selectedYear && bill.month === selectedMonth;
  });

  const total = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);

  const years = Array.from(new Set(bills.map((bill) => bill.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className={`${color.bg} p-4 rounded-lg shadow-sm ${className}`}>
      <h2 className={`text-lg font-semibold mb-4 ${color.text}`}>
        Upcoming Bills
      </h2>
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
                Due Date
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
            {filteredBills.map((bill, index) => (
              <tr key={index} className={`border-b ${color.border}`}>
                <td className="p-2 text-sm">{bill.dueDate}</td>
                <td className="p-2 text-sm">{bill.description}</td>
                <td className="text-right p-2 text-sm">
                  {formatCurrency(bill.amount)}
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
