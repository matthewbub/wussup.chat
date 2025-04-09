"use client";

import React from "react";

import Screensaver from "@/components/screensaver";

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

export default function GeneralFullScreenError({ message }: { message: string }) {
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
