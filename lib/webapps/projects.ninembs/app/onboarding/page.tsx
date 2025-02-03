"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

export default function OnboardingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.user_metadata?.client_id) {
        router.push("/dashboard");
        return;
      }

      setUserId(user.id);
    };

    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: clientData, error: clientError } = await supabase
        .from("Application_Clients")
        .insert([{ name: clientName, created_by: userId }])
        .select()
        .single();

      if (clientError) throw clientError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { client_id: clientData.id },
      });

      if (updateError) throw updateError;

      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating organization:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome to Your Journey
            </h1>
            <p className="text-gray-300">
              Let's start by naming your organization
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Input
                placeholder="Organization Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-purple-900 transition-all duration-200 font-semibold py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-purple-900 rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>

          <div>
            <p className="mt-4 text-center text-sm text-gray-400">
              This will be the main workspace for all your projects.
            </p>
            <p className="text-xs text-center text-gray-400">
              (You can change this later)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
