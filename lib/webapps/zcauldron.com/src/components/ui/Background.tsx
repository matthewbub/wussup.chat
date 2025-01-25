interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function Background({ children, className = "" }: BackgroundProps) {
  return (
    <div className={`relative bg-background h-full ${className}`}>
      <div className="absolute inset-0 opacity-[0.05] bg-grid" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
