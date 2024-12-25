import * as React from "react";

import { cn } from "@/lib/utils";
import { config } from "@/app_config";
import ReactCurrencyInputField, {
  CurrencyInputProps,
} from "react-currency-input-field";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-950 placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:file:text-stone-50 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
          className
        )}
        ref={ref}
        maxLength={props.maxLength ?? config.__PRIVATE__.MAX_TEXT_INPUT_LENGTH}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <ReactCurrencyInputField
        className={cn(
          "text-right flex h-9 w-full border border-stone-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-950 placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:file:text-stone-50 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300",
          className
        )}
        ref={ref}
        decimalsLimit={2}
        prefix="$"
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { Input, CurrencyInput };
