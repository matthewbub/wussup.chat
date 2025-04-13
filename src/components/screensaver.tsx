"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";

import { cn } from "@/lib/utils";
import { useDimensions } from "@/hooks/use-dimensions";

type ScreensaverProps = {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement>;
  speed?: number;
  startPosition?: { x: number; y: number }; // x,y as percentages (0-100)
  startAngle?: number; // in degrees
  className?: string;
};

const Screensaver: React.FC<ScreensaverProps> = ({
  children,
  speed = 3,
  startPosition = { x: 0, y: 0 },
  startAngle = 45,
  containerRef,
  className,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const angle = useRef((startAngle * Math.PI) / 180);

  const containerDimensions = useDimensions(containerRef);
  const elementDimensions = useDimensions(elementRef);

  // Set initial position based on container dimensions and percentage
  useEffect(() => {
    if (containerDimensions.width && containerDimensions.height) {
      const initialX = (startPosition.x / 100) * (containerDimensions.width - (elementDimensions.width || 0));
      const initialY = (startPosition.y / 100) * (containerDimensions.height - (elementDimensions.height || 0));
      x.set(initialX);
      y.set(initialY);
    }
  }, [containerDimensions, elementDimensions, startPosition]);

  useAnimationFrame(() => {
    const velocity = speed;
    const dx = Math.cos(angle.current) * velocity;
    const dy = Math.sin(angle.current) * velocity;

    let newX = x.get() + dx;
    let newY = y.get() + dy;

    // Check for collisions with container boundaries
    if (newX <= 0 || newX + elementDimensions.width >= containerDimensions.width) {
      angle.current = Math.PI - angle.current;
      newX = Math.max(0, Math.min(newX, containerDimensions.width - elementDimensions.width));
    }
    if (newY <= 0 || newY + elementDimensions.height >= containerDimensions.height) {
      angle.current = -angle.current;
      newY = Math.max(0, Math.min(newY, containerDimensions.height - elementDimensions.height));
    }

    x.set(newX);
    y.set(newY);
  });

  return (
    <motion.div
      ref={elementRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        x,
        y,
      }}
      className={cn("transform will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
};

const images = [
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3Mz0UkaEUIwTlWSOmkcAN1BhnX9rzjLF67KxYvq",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3MzHah4dbBKtSLv7rCFdTOb4mWNk6yYJinpV9le",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3Mzr52xGXaK2kMBKx5PYmojXypVCsU9R7nTewQD",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3MzXNjPHJRG74njotm18qvlbMA0R5NZzW9UwrFx",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3MzzHtc5NyPuSHMVrGp0BN5gdhykxcqFAmQKIWn",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3Mz7YY1zZbT6weP4yYBURXfkMT9zs7ILmjQJ2Kt",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3MzO1BmhCCs4uQ7q0PZITcRh6jlsna5fEBgHboM",
  "https://ywua85ya54.ufs.sh/f/5DbNgXh2h3Mz5OUzSR2h3Mzl2y40bOVgY9cLGHWfZ7DPN6ad",
];

const shuffleArray = (array: string[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export function QuickScreensaver({ message }: { message: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="w-dvw h-dvh overflow-hidden flex items-center justify-center relative" ref={containerRef}>
      <h1 className="z-30 text-3xl md:text-6xl font-overused-grotesk">{message}</h1>
      {shuffleArray(images).map((image, index) => (
        <Screensaver
          key={index}
          speed={1}
          startPosition={{ x: index * 3, y: index * 3 }}
          startAngle={40}
          containerRef={containerRef as React.RefObject<HTMLElement>}
        >
          <div className="w-20 h-20 md:w-48 md:h-48 overflow-hidden">
            <img src={image} alt={`Example ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        </Screensaver>
      ))}
    </div>
  );
}

export default Screensaver;
