import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps = {
  id?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const baseInputStyles = {
  wrapper: "relative",
  input: `
    w-full px-3 py-2 text-sm 
    border border-gray-300 dark:border-gray-600 
    rounded-md 
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-white
    placeholder:text-gray-500 dark:placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  `,
  icon: `
    absolute right-3 top-1/2 -translate-y-1/2 
    text-gray-500 dark:text-gray-400 
    hover:text-gray-700 dark:hover:text-gray-300 
    transition-colors duration-200
  `,
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        className={twMerge(clsx(baseInputStyles.input, className))}
      />
    );
  }
);

Input.displayName = "Input";

type PasswordInputProps = {
  id?: string;
  className?: string;
  autoComplete?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={baseInputStyles.wrapper}>
        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={twMerge(clsx(baseInputStyles.input, "pr-10", className))}
        />
        <button
          type="button"
          className={baseInputStyles.icon}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
