import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// i hate reading this

/**
 * debounce
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => void>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      clearTimeout(timeout as NodeJS.Timeout);
      func(...args);
    };

    clearTimeout(timeout as NodeJS.Timeout);
    timeout = setTimeout(later, wait);
  };
}
