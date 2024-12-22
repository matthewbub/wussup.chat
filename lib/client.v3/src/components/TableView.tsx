import React from "react";
import { Transaction } from "@/types/budget";
import { formatCurrency } from "../../utils/formatCurrency";

interface TableViewProps {
  transactions: Transaction[];
}

export function TableView({ transactions }: TableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 text-sm font-medium text-gray-600">
              Date
            </th>
            <th className="text-left p-2 text-sm font-medium text-gray-600">
              Category
            </th>
            <th className="text-left p-2 text-sm font-medium text-gray-600">
              Description
            </th>
            <th className="text-right p-2 text-sm font-medium text-gray-600">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-sm">{transaction.date}</td>
              <td className="p-2 text-sm">{transaction.category}</td>
              <td className="p-2 text-sm">{transaction.description}</td>
              <td className="text-right p-2 text-sm">
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
