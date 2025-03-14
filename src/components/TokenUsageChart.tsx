"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

interface TokenUsageData {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
}

interface TokenUsageChartProps {
  data: TokenUsageData[];
  initialTimeFilter?: string;
}

type TimeFilter = "all" | "day" | "week" | "month" | "year";

export function TokenUsageChart({ data, initialTimeFilter = "all" }: TokenUsageChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter as TimeFilter);

  const updateTimeFilter = (value: TimeFilter) => {
    setTimeFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeFilter", value);
    router.push(`/dashboard?${params.toString()}`);
  };

  const filteredData = useMemo(() => {
    if (timeFilter === "all") return data;

    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case "day":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter((item) => new Date(item.created_at) >= filterDate);
  }, [data, timeFilter]);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Select value={timeFilter} onValueChange={updateTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_tokens" fill="#8884d8" name="Total Tokens" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
