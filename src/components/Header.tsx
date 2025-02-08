import Link from "next/link";
import { Pacifico } from "next/font/google";
import clsx from "clsx";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export default function Header() {
  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className={clsx(
              pacifico.className,
              "text-3xl font-bold text-primary"
            )}
          >
            Wussup.chat
          </Link>
        </nav>
      </div>
    </header>
  );
}
