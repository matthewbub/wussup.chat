import { auth } from "@clerk/nextjs/server";
import { createClient } from "./supabase-server";

/**
 * Get IP address from X-Forwarded-For header or fall back to the direct connection IP
 */
export function getIpAddress(headersList: Headers) {
  return headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "Unknown";
}

/**
 * Get user from clerk or request headers
 */
export async function getUser(req: Request): Promise<{ userId: string; type: "clerk_user_id" | "user_ip" }> {
  const { userId } = await auth();
  const ip = getIpAddress(req.headers);

  const user = {
    userId: userId ?? ip,
    type: userId ? ("clerk_user_id" as const) : ("user_ip" as const),
  };

  return user;
}

/**
 * Get user from clerk or request headers (server component)
 */
export async function getUserFromHeaders(headersList: Headers) {
  const { userId } = await auth();
  const ip = getIpAddress(headersList);

  return {
    userId: userId ?? ip,
    type: userId ? ("clerk_user_id" as const) : ("user_ip" as const),
  };
}

export const supabaseFacade = {
  getOrMakeUser: async function (user: { type: string; userId: string }): Promise<{ id: string } | { error: string }> {
    const supabase = await createClient();

    let { data: userData } = await supabase.from("UserMetaData").select("id").eq(user.type, user.userId).single();

    if (!userData) {
      const { data: newUser, error: createError } = await supabase
        .from("UserMetaData")
        .insert([{ [user.type]: user.userId }])
        .select()
        .single();

      if (createError) {
        console.error("[Info API] Error creating user:", createError);
        return { error: "Failed to create user" };
      }

      userData = newUser;
    }

    if (!userData) {
      return { error: "User data not found" };
    }

    return { id: userData.id };
  },
};
