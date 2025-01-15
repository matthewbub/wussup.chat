import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useState } from "react";

type InputProps = {
  id?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        className={`input input-bordered ${className || ""}`}
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
      <div className="relative">
        <input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`input input-bordered ${className || ""} pr-10`}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
