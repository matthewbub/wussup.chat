import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "../../types/budget";
import { formatCurrency } from "../../utils/formatCurrency";
import { Cell as RechartsCell } from "recharts"; // Added import

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  income: number;
  expenses: number;
}

interface BudgetChartsProps {
  transactions: Transaction[];
}

export function BudgetCharts({ transactions }: BudgetChartsProps) {
  // Prepare data for Expense Distribution Pie Chart
  const expenseDistribution = transactions
    .filter((t) => t.category !== "Income")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

  const pieChartData: ChartData[] = Object.entries(expenseDistribution).map(
    ([name, value]) => ({ name, value })
  );

  // Prepare data for Income vs Expenses Bar Chart
  const timeSeriesData: TimeSeriesData[] = transactions
    .reduce((acc, t) => {
      const date = `${t.year}-${t.month.toString().padStart(2, "0")}`;
      const existingEntry = acc.find((entry) => entry.date === date);
      if (existingEntry) {
        if (t.category === "Income") {
          existingEntry.income += t.amount;
        } else {
          existingEntry.expenses += t.amount;
        }
      } else {
        acc.push({
          date,
          income: t.category === "Income" ? t.amount : 0,
          expenses: t.category === "Income" ? 0 : t.amount,
        });
      }
      return acc;
    }, [] as TimeSeriesData[])
    .sort((a, b) => a.date.localeCompare(b.date));

  // Prepare data for Balance Over Time Line Chart
  const balanceData = timeSeriesData.reduce(
    (acc, entry) => {
      const balance = entry.income - entry.expenses;
      const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({
        date: entry.date,
        balance: lastBalance + balance,
      });
      return acc;
    },
    [] as { date: string; balance: number }[]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Distribution</CardTitle>
          <CardDescription>Breakdown of expenses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Amount",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <RechartsCell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 45}, 70%, 60%)`}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>
            Monthly comparison of income and expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              income: {
                label: "Income",
                color: "#FF5733", // example hex value for income
              },
              expenses: {
                label: "Expenses",
                color: "#33FF57", // example hex value for expenses
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Bar dataKey="income" fill="var(--color-income)" name="Income">
                  {timeSeriesData.map((entry, index) => (
                    <RechartsCell key={`income-${index}`} fillOpacity={1} />
                  ))}
                </Bar>
                <Bar dataKey="expenses" fill="#33FF57" name="Expenses">
                  {timeSeriesData.map((entry, index) => (
                    <RechartsCell key={`expenses-${index}`} fillOpacity={1} />
                  ))}
                </Bar>
                <ChartTooltip
                  cursor={{ fill: "rgba(0, 0, 0.1)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-stone-200 rounded shadow dark:border-stone-800">
                          <p className="font-bold">{label}</p>
                          {payload.map((pld) => (
                            <p key={pld.name} style={{ color: pld.color }}>
                              {pld.name}: {formatCurrency(pld.value as number)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Balance Over Time</CardTitle>
          <CardDescription>Cumulative balance trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              balance: {
                label: "Balance",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="var(--color-balance)"
                  name="Balance"
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border border-stone-200 border-gray-300 rounded shadow dark:border-stone-800">
                          <p>Date: {payload[0].payload.date}</p>
                          <p>
                            Balance:{" "}
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
