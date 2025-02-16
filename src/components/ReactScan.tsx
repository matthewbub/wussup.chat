// path/to/ReactScanComponent
"use client";
import { JSX, useEffect } from "react";
import { scan } from "react-scan";

export function ReactScan(): JSX.Element {
  useEffect(() => {
    const scanData: { enabled: boolean } = { enabled: false };

    if (process.env.NEXT_PUBLIC_REACT_SCAN_ENABLED === "true") {
      scanData.enabled = true;
    }
    scan(scanData);
  }, []);

  return <></>;
}
