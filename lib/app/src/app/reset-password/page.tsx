import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

// this is the server component that wraps our client component in a suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
