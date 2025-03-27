import { appName } from "@/constants/version";
import Link from "next/link";

export default function PublicHeader() {
  return (
    <>
      <div className="container mx-auto p-4">
        <Link
          href="/"
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold dark:text-white hover:opacity-80 transition-opacity"
        >
          {appName}
        </Link>
      </div>
    </>
  );
}
