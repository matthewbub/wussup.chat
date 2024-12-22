import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface YearMonthToggleProps {
  selectedYear: number;
  selectedMonth: number | "all";
  onYearChange: (year: number) => void;
  onMonthChange: (month: number | "all") => void;
  years: number[];
}

export function YearMonthToggle({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  years,
}: YearMonthToggleProps) {
  const months = [
    { value: "all", label: "All" },
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  return (
    <div className="flex space-x-4 mb-4">
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Years</SelectLabel>
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                onClick={() => onYearChange(year)}
              >
                {year}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a month" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Months</SelectLabel>
            {months.map((month) => (
              <SelectItem
                key={month.value}
                value={month.value.toString()}
                onClick={() => onMonthChange(month.value)}
              >
                {month.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
