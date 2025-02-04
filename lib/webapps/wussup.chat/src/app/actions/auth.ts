"use server";

import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function registerUser(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  console.log("[Register User] Form Data:", formData);
  const supabase = await createClient();

  const { error, data: signUpData } = await supabase.auth.signUp({
    email: formData.email as string,
    password: formData.password as string,
  });

  if (error) {
    console.error("[Register User] Error signing up:", error);
    // redirect("/error");
  }

  console.log("[Register User] Sign Up Data:", signUpData);

  return { success: true, error: null };
}
