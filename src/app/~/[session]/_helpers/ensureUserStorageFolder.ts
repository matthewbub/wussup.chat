import { SupabaseClient } from "@supabase/supabase-js";

// ensures user folder exists in storage bucket, creates if not present
export async function ensureUserStorageFolder(supabase: SupabaseClient<any, "public", any>, userId: string) {
  const { data: folderList, error: listError } = await supabase.storage.from("ChatBot_Images_Generated").list(userId);

  if (listError) {
    throw new Error(`Failed to check user folder: ${listError.message}`);
  }

  if (!folderList || folderList.length === 0) {
    const { error: createError } = await supabase.storage
      .from("ChatBot_Images_Generated")
      .upload(`${userId}/.keep`, new Blob([""]));

    if (createError) {
      throw new Error(`Failed to create user folder: ${createError.message}`);
    }
  }
}
