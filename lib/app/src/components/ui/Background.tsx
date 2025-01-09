interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function Background({ children, className = "" }: BackgroundProps) {
  return (
    <div className={`relative bg-stone-900 h-full ${className}`}>
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, rgb(231, 229, 228) 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
