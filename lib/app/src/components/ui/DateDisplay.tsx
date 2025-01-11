import { formatDistanceToNow, format } from "date-fns";
import { Tooltip } from "./Tooltip"; // Assuming you have a Tooltip component

interface DateDisplayProps {
  date: Date | string;
  className?: string;
}

export function DateDisplay({ date, className = "" }: DateDisplayProps) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
  const fullDateTime = format(dateObj, "PPpp zzz"); // e.g. "Mar 14, 2024, 2:40 PM EDT"

  return (
    <Tooltip content={fullDateTime}>
      <span className={className}>{relativeTime}</span>
    </Tooltip>
  );
}
