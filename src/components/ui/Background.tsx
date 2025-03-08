interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function Background({ children }: BackgroundProps) {
  return <>{children}</>;
}
