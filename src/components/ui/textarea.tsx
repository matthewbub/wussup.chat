"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function AutoExpandingTextarea({
  value: propValue = "",
  onChange,
  onBlur,
  className = "",
  ...props
}: {
  value: string;
  onChange?: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  className: string;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "className" | "onBlur"
>) {
  const ref = React.useRef<null | HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = React.useState<string>("");

  const autoResize = React.useCallback(() => {
    const textarea = ref.current;

    if (textarea) {
      // temporarily reset height to auto - necessary for shrinking
      textarea.style.height = "auto";

      // set height to scrollHeight https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  React.useEffect(() => {
    // update internal value if prop value changes
    setInternalValue(propValue);

    // resize after state update
    requestAnimationFrame(autoResize);
  }, [propValue, autoResize]);

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = ev.target.value;
    setInternalValue(newValue);
    autoResize();
    if (onChange) {
      onChange(ev);
    }
  };

  const handleBlur = (ev: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) {
      onBlur(ev);
    }
  };

  return (
    <Textarea
      name="message"
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn(
        "overflow-y-hidden resize-none box-border min-h-[60px] max-h-[300px]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea, AutoExpandingTextarea };
