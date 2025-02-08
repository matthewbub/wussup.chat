import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function LegalPage() {
  return (
    <div className="container max-w-4xl py-12 mx-auto">
      <h1 className="text-3xl font-bold mb-8">Legal Documents</h1>

      <div className="grid gap-4">
        <Link href="/legal/terms">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Terms of Service</h2>
            <p className="text-muted-foreground">
              Our terms of service and conditions for using Wussup.chat
            </p>
          </Card>
        </Link>

        <Link href="/legal/privacy">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Privacy Policy</h2>
            <p className="text-muted-foreground">
              How we collect, use, and protect your personal information
            </p>
          </Card>
        </Link>

        <Link href="/legal/disclaimer">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Disclaimer</h2>
            <p className="text-muted-foreground">Disclaimer for Wussup.chat</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
