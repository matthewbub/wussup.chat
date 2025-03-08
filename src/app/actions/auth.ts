"use server";

import { createClient } from "@/lib/supabase-server";

export async function registerUser(formData: { email: string; password: string; confirmPassword: string }) {
  const supabase = await createClient();

  const { error, data: signUpData } = await supabase.auth.signUp({
    email: formData.email as string,
    password: formData.password as string,
  });

  if (error) {
    console.error("[Register User] Error signing up:", error);
    // redirect("/error");
  }

  return { success: true, error: null };
}
