interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-stone-800/50 rounded-lg ${className}`}>{children}</div>
  );
}

export default Card;
