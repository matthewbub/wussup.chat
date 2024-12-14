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

interface GlobalDateSelectorProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  years: number[];
}

export function GlobalDateSelector({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  years,
}: GlobalDateSelectorProps) {
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  return (
    <div className="flex space-x-4 mb-6">
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
