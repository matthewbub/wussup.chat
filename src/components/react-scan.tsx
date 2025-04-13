// path/to/ReactScanComponent
"use client";
import { JSX, useEffect } from "react";
import { scan } from "react-scan";

export function ReactScan(): JSX.Element {
  useEffect(() => {
    const scanData: { enabled: boolean } = { enabled: false };
    scan(scanData);
  }, []);

  return <></>;
}
