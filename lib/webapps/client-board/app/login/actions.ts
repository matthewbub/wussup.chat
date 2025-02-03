"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  console.log("[Login Action] Starting login process");

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("[Login Action] Data:", data);

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("[Login Action] Error signing in with password:", error);
    redirect("/error");
  }

  console.log("[Login Action] Successfully signed in");

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error, data: signUpData } = await supabase.auth.signUp(data);

  if (error) {
    console.error("[Signup Action] Error signing up:", error);
    redirect("/error");
  }

  if (signUpData?.user) {
    // Instead of redirecting to home, redirect to a page that shows the team creation modal
    redirect("/onboarding");
  }

  console.log("[Signup Action] Successfully signed up");
  revalidatePath("/", "layout");
  redirect("/");
}
