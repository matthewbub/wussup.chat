"use client";

import GeneralFullScreenError from "@/components/error";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <GeneralFullScreenError message={error.message} />
      </body>
    </html>
  );
}
