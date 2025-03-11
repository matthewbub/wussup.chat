import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-title text-3xl font-bold text-primary">
            Wussup
          </Link>
        </nav>
      </div>
    </header>
  );
}
