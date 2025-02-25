import React from "react";

interface LoadingPulseProps {
  size?: "small" | "medium" | "large";
}

const LoadingPulse: React.FC<LoadingPulseProps> = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "w-2 h-2",
    medium: "w-3 h-3",
    large: "w-4 h-4",
  };

  return (
    <div className="flex justify-center items-center h-full" role="status" aria-live="polite">
      <span className="sr-only">Loading, please wait...</span>
      <div className="flex space-x-2 motion-safe:animate-pulse">
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full`}></div>
        <div
          className={`${sizeClasses[size]} bg-blue-600 rounded-full motion-safe:animate-pulse motion-safe:delay-75`}
        ></div>
        <div
          className={`${sizeClasses[size]} bg-blue-600 rounded-full motion-safe:animate-pulse motion-safe:delay-150`}
        ></div>
      </div>
    </div>
  );
};

export default LoadingPulse;
