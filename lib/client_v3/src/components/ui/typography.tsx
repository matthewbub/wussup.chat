import React from "react";
import { cn } from "@/lib/utils";

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div";
}

export function Text({
  children,
  className,
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn("text-sm text-stone-500 dark:text-stone-400", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export default function Heading({
  children,
  className,
  level = 2,
  as,
  ...props
}: HeadingProps) {
  const Component =
    as || (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");

  return (
    <Component
      className={cn(
        "tracking-tight font-semibold leading-none text-md",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
