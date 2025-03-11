import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon, Mail } from "lucide-react";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createClient } from "@/lib/supabase-client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = {
  email: string;
  password: string;
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, mode }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      if (result.user) {
        onClose();
      }
    } catch (err: unknown) {
      setError((err as { message: string }).message);
    } finally {
      setIsLoading(false);
      router.push("/~");
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
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="font-title text-3xl text-center pt-2 pb-8">Wussup</DialogTitle>
          <DialogDescription className="p-4 border-t text-center text-sm text-muted-foreground">
            {mode === "login"
              ? "Multi-Model Unified AI assistant"
              : "Create a free account and try Wussup's Multi-Model Unified AI assistant."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter your email" {...register("email", { required: true })} />
          </div>
          <div className="space-y-1">
            <Label>Password</Label>
            <Input type="password" placeholder="Enter your password" {...register("password", { required: true })} />
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
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleGithubAuth} className="w-full">
          <GithubIcon className="h-4 w-4" />
          Github
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
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
