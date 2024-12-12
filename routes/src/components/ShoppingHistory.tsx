import React, { useState } from "react";
import { GroceryItem } from "../../types/budget";
import { formatCurrency } from "../../utils/formatCurrency";
import { colors } from "../../utils/colors";
import { YearMonthToggle } from "./YearMonthToggle";
import { Input } from "./ui/input";

interface ShoppingHistoryProps {
  groceries: GroceryItem[];
  className?: string;
}

export function ShoppingHistory({
  groceries,
  className = "",
}: ShoppingHistoryProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const color = colors.secondary;

  const filteredGroceries = groceries.filter((item) => {
    const matchesYearMonth =
      (selectedMonth === "all" && item.year === selectedYear) ||
      (item.year === selectedYear && item.month === selectedMonth);

    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.store.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesYearMonth && matchesSearch;
  });

  const total = filteredGroceries.reduce((sum, item) => sum + item.amount, 0);
  const estimatedTotal = filteredGroceries.reduce(
    (sum, item) => sum + item.estimatedNextAmount,
    0
  );

  const years = Array.from(new Set(groceries.map((item) => item.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className={`${color.bg} p-4 rounded-lg shadow-sm ${className}`}>
      <h2 className={`text-lg font-semibold mb-4 ${color.text}`}>
        Shopping History
      </h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <YearMonthToggle
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          years={years}
        />
        <Input
          type="text"
          placeholder="Search items or stores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${color.border}`}>
              <th className="text-left p-2 text-sm font-medium text-slate-600">
                Date
              </th>
              <th className="text-left p-2 text-sm font-medium text-slate-600">
                Store
              </th>
              <th className="text-left p-2 text-sm font-medium text-slate-600">
                Item
              </th>
              <th className="text-right p-2 text-sm font-medium text-slate-600">
                Actual
              </th>
              <th className="text-right p-2 text-sm font-medium text-slate-600">
                Estimate
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGroceries.map((item, index) => (
              <tr key={index} className={`border-b ${color.border}`}>
                <td className="p-2 text-sm">{item.date}</td>
                <td className="p-2 text-sm">{item.store}</td>
                <td className="p-2 text-sm">{item.description}</td>
                <td className="text-right p-2 text-sm">
                  {formatCurrency(item.amount)}
                </td>
                <td className="text-right p-2 text-sm">
                  {formatCurrency(item.estimatedNextAmount)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="p-2 text-sm">
                Total
              </td>
              <td className={`text-right p-2 text-sm ${color.text}`}>
                {formatCurrency(total)}
              </td>
              <td className={`text-right p-2 text-sm ${color.text}`}>
                {formatCurrency(estimatedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
