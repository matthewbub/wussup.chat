export default function Footer() {
  return (
    <footer className="w-full py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            © {new Date().getFullYear()} Wussup.chat. All rights reserved.
          </div>
          <div className="space-x-4">
            <a href="/legal" className="text-sm">
              Legal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
