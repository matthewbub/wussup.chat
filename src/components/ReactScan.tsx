// path/to/ReactScanComponent
"use client";
import { JSX, useEffect } from "react";
import { scan } from "react-scan";

export function ReactScan(): JSX.Element {
  useEffect(() => {
    scan({
      enabled: process.env.NEXT_PUBLIC_REACT_SCAN_ENABLED === "true",
    });
  }, []);

  return <></>;
}
