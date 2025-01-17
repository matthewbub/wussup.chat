interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function Background({ children, className = "" }: BackgroundProps) {
  return (
    <div
      className={`relative bg-slate-100 dark:bg-slate-900 h-full ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle,_rgb(15,23,42)_1px,_transparent_1px)] bg-[length:16px_16px] dark:bg-[radial-gradient(circle,_rgb(231,229,228)_1px,_transparent_1px)] dark:bg-[length:16px_16px]" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
