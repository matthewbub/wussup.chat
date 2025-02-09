import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import GithubMarkWhite from "./ui/icons/GithubMarkWhite";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) throw error;
      onClose();
    } catch (err: unknown) {
      setError((err as { message: string }).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${baseUrl}/auth/confirm`,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
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
          <GithubMarkWhite />
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
