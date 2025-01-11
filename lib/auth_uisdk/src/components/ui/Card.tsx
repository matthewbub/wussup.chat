import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-base-200 rounded-lg shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export default Card;
