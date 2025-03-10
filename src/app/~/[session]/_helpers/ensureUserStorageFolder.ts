import { SupabaseClient } from "@supabase/supabase-js";

// ensures user folders exist in storage buckets, creates if not present
export async function ensureUserStorageFolder(supabase: SupabaseClient<any, "public", any>, userId: string) {
  // Ensure images folder exists
  const { data: imageFolderList, error: imageListError } = await supabase.storage
    .from("ChatBot_Images_Generated")
    .list(userId);

  if (imageListError) {
    throw new Error(`Failed to check user images folder: ${imageListError.message}`);
  }

  if (!imageFolderList || imageFolderList.length === 0) {
    const { error: createError } = await supabase.storage
      .from("ChatBot_Images_Generated")
      .upload(`${userId}/.keep`, new Blob([""]));

    if (createError) {
      throw new Error(`Failed to create user images folder: ${createError.message}`);
    }
  }

  // Ensure audio folder exists
  const { data: audioFolderList, error: audioListError } = await supabase.storage.from("ChatBot_Audio").list(userId);

  if (audioListError) {
    throw new Error(`Failed to check user audio folder: ${audioListError.message}`);
  }

  if (!audioFolderList || audioFolderList.length === 0) {
    const { error: createError } = await supabase.storage
      .from("ChatBot_Audio")
      .upload(`${userId}/.keep`, new Blob([""]));

    if (createError) {
      throw new Error(`Failed to create user audio folder: ${createError.message}`);
    }
  }
}
