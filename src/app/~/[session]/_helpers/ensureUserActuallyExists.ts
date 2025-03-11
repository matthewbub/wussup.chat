import { SupabaseClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

// ensures user exists in database and storage folders exist
export async function ensureUserActuallyExists(supabase: SupabaseClient<any, "public", any>, clerkUserId: string) {
  try {
    // Check if user exists in ChatBot_Users
    const { data: existingUser, error: userCheckError } = await supabase
      .from("ChatBot_Users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (userCheckError && userCheckError.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw new Error(`Failed to check user existence: ${userCheckError.message}`);
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      // Get Clerk user data
      const user = await currentUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error: createError } = await supabase.from("ChatBot_Users").insert({
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username,
        message_count: 0,
        chat_context: "You are a helpful assistant",
        clerk_user_id: clerkUserId,

        // this is needed for legacy behavior. (i think; idk why it was there to begin with)
        // we migrated from supabase auth to clerk auth; clerk auth uses a string for id's
        // can u just pretend this isn't here....? no? me either... fuck
        // NOTE: we use the `clerk_user_id` field for other tables; e.g. ChatBot_Messages.clerk_user_id and ChatBot_Sessions.clerk_user_id
        clerk_user_id: crypto.randomUUID(),
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    throw error;
  }
}
