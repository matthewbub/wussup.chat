import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon, Mail } from "lucide-react";
import { Label } from "./ui/label";
import { useChatStore } from "@/stores/chatStore";
import { useSearchParams } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user } = useChatStore();
  const { init } = useChatStore();

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) throw error;

      if (data.user) {
        onClose();
        init(sessionId as string);
      }
    } catch (err: unknown) {
      setError((err as { message: string }).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const { error, data } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${baseUrl}/auth/confirm`,
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.url) {
      window.location.href = data.url;
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && user) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="font-title text-3xl text-center pt-2 pb-8">
            Wussup
          </DialogTitle>
          <DialogDescription className="p-4 border-t text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Multi-Model Unified AI assistant"
              : "Create a free account and try Wussup's Multi-Model Unified AI assistant."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="h-4 w-4" />
            {mode === "login" ? "Sign In" : "Sign Up"} with Email
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button variant="outline" onClick={handleGithubAuth} className="w-full">
          <GithubIcon className="h-4 w-4" />
          Github
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="underline hover:text-primary"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};
