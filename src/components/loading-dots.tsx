import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  /**
   * The color of the dots
   * @default "bg-current"
   */
  color?: string;
  /**
   * The size of the dots
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * The number of dots to display
   * @default 3
   */
  count?: number;
  /**
   * The className to apply to the container
   */
  className?: string;
}

export function LoadingDots({ color = "bg-current", size = "md", count = 3, className }: LoadingDotsProps) {
  const dots = Array.from({ length: count }, (_, i) => i);

  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  const dotSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {dots.map((i) => (
        <div
          key={i}
          className={cn("rounded-full animate-bounce", dotSize, color)}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "0.6s",
          }}
        />
      ))}
    </div>
  );
}
