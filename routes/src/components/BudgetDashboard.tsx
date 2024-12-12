import React, { useState, useMemo } from "react";
import { TransactionList } from "./TransactionList";
import { UpcomingBills } from "./UpcomingBills";
import { ShoppingHistory } from "./ShoppingHistory";
import { GlobalDateSelector } from "./GlobalDateSelector";
import { AddTransactionModal } from "./AddTransactionModal";
import { BudgetCharts } from "./BudgetCharts";
import { Transaction, Bill, Income, GroceryItem } from "../../types/budget";
import { formatCurrency } from "../../utils/formatCurrency";
import { TableView } from "./TableView";

interface BudgetDashboardProps {
  fastFood: Transaction[];
  businessExpenses: Transaction[];
  generalExpenses: Transaction[];
  groceries: GroceryItem[];
  upcomingBills: Bill[];
  income: Income[];
}

export function BudgetDashboard({
  fastFood: initialFastFood,
  businessExpenses: initialBusinessExpenses,
  generalExpenses: initialGeneralExpenses,
  groceries: initialGroceries,
  upcomingBills: initialUpcomingBills,
  income: initialIncome,
}: BudgetDashboardProps) {
  const [fastFood, setFastFood] = useState(initialFastFood);
  const [businessExpenses, setBusinessExpenses] = useState(
    initialBusinessExpenses
  );
  const [generalExpenses, setGeneralExpenses] = useState(
    initialGeneralExpenses
  );
  const [groceries, setGroceries] = useState(initialGroceries);
  const [upcomingBills, setUpcomingBills] = useState(initialUpcomingBills);
  const [income, setIncome] = useState(initialIncome);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [activeExpensesTab, setActiveExpensesTab] = useState<
    "categories" | "table"
  >("categories");

  const allTransactions = [
    ...fastFood,
    ...businessExpenses,
    ...generalExpenses,
    ...groceries,
    ...income,
  ];
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(allTransactions.map((t) => t.year)));
    return uniqueYears.sort((a, b) => b - a);
  }, [allTransactions]);

  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const filteredTransactions = allTransactions.filter(
    (t) => t.year === selectedYear && t.month === selectedMonth
  );

  const totalIncome = filteredTransactions
    .filter((t) => t.category === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.category !== "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleAddTransaction = (newTransaction: Transaction) => {
    switch (newTransaction.category) {
      case "Fast Food":
        setFastFood([...fastFood, newTransaction]);
        break;
      case "Business":
        setBusinessExpenses([...businessExpenses, newTransaction]);
        break;
      case "General":
        setGeneralExpenses([...generalExpenses, newTransaction]);
        break;
      case "Grocery":
        setGroceries([...groceries, newTransaction as GroceryItem]);
        break;
      case "Income":
        setIncome([...income, newTransaction as Income]);
        break;
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">
        Personal Budget Dashboard
      </h1>

      <GlobalDateSelector
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        years={years}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-semibold mb-2">Total Income</h2>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-400 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-semibold mb-2">Total Expenses</h2>
          <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-semibold mb-2">Current Balance</h2>
          <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <BudgetCharts transactions={allTransactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TransactionList
          transactions={income.filter(
            (t) => t.year === selectedYear && t.month === selectedMonth
          )}
          title="Income"
          className="lg:col-span-2"
          colorScheme="primary"
        />
        <UpcomingBills
          bills={upcomingBills.filter(
            (b) => b.year === selectedYear && b.month === selectedMonth
          )}
          className="lg:row-span-2"
        />
        <ShoppingHistory
          groceries={groceries.filter(
            (g) => g.year === selectedYear && g.month === selectedMonth
          )}
          className="lg:col-span-2"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Expenses</h2>
          <button
            onClick={() => setIsAddTransactionModalOpen(true)}
            className="py-2 px-4 border border-stone-200 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-stone-800"
          >
            Add Transaction
          </button>
        </div>

        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveExpensesTab("categories")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeExpensesTab === "categories"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveExpensesTab("table")}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeExpensesTab === "table"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Table View
              </button>
            </nav>
          </div>
        </div>

        {activeExpensesTab === "categories" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionList
              transactions={fastFood.filter(
                (t) => t.year === selectedYear && t.month === selectedMonth
              )}
              title="Fast Food Expenses"
              colorScheme="primary"
            />
            <TransactionList
              transactions={businessExpenses.filter(
                (t) => t.year === selectedYear && t.month === selectedMonth
              )}
              title="Business Expenses"
              colorScheme="primary"
            />
            <TransactionList
              transactions={generalExpenses.filter(
                (t) => t.year === selectedYear && t.month === selectedMonth
              )}
              title="General Expenses"
              colorScheme="primary"
            />
          </div>
        ) : (
          <TableView
            transactions={[
              ...fastFood,
              ...businessExpenses,
              ...generalExpenses,
            ].filter(
              (t) => t.year === selectedYear && t.month === selectedMonth
            )}
          />
        )}
      </div>
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        categories={["Fast Food", "Business", "General", "Grocery", "Income"]}
      />
    </div>
  );
}
