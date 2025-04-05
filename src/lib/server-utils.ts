import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "./supabase-server";
import { tableNames } from "@/constants/tables";

/**
 * Get IP address from X-Forwarded-For header or fall back to the direct connection IP
 */
export async function getIpAddress(headersList: Headers) {
  const forwardedFor = await headersList.get("x-forwarded-for");
  const realIp = await headersList.get("x-real-ip");
  return forwardedFor ?? realIp ?? "Unknown";
}

/**
 * Get user from clerk or request headers
 */
export async function getUser(
  req: Request
): Promise<{ userId: string; type: "clerk_user_id" | "user_ip"; email?: string }> {
  const { userId } = await auth();
  const ip = await getIpAddress(req.headers);

  if (userId) {
    const user = await currentUser();
    return {
      userId,
      type: "clerk_user_id",
      email: user?.emailAddresses[0]?.emailAddress,
    };
  }

  return {
    userId: ip,
    type: "user_ip", // For non-authenticated users, we use IP as email as before
  };
}

/**
 * Get user from clerk or request headers (server component)
 */
export async function getUserFromHeaders(headersList: Headers) {
  const { userId } = await auth();
  const ip = await getIpAddress(headersList);

  if (userId) {
    const user = await currentUser();

    return {
      userId,
      type: "clerk_user_id",
      email: user?.emailAddresses[0]?.emailAddress,
    };
  }
  return {
    userId: userId ?? ip,
    type: userId ? ("clerk_user_id" as const) : ("user_ip" as const),
  };
}

export const supabaseFacade = {
  getOrMakeUser: async function (user: {
    type: string;
    userId: string;
    email?: string;
  }): Promise<{ id: string } | { error: string }> {
    const supabase = await createClient();

    let { data: userData } = await supabase
      .from(tableNames.USERS)
      .select("id, email")
      .eq(user.type, user.userId)
      .single();

    const userNeedsUpdateToAddEmail = user.type === "clerk_user_id" && userData?.email === null;

    const initialUser = {
      [user.type]: user.userId,
    };

    if (userNeedsUpdateToAddEmail) {
      const withUpdates = {
        ...initialUser,
        email: user.email as string,
      };
      const { data: updatedUser, error: updateError } = await supabase
        .from(tableNames.USERS)
        .update(withUpdates)
        .eq(user.type, user.userId)
        .select()
        .single();

      if (updateError) {
        console.error("[Info API] Error updating user:", updateError);
        return { error: "Failed to update user" };
      }

      return { id: updatedUser.id };
    }

    if (!userData) {
      const { data: newUser, error: createError } = await supabase
        .from(tableNames.USERS)
        .insert([
          {
            ...initialUser,
            email: user.email || user.userId,
          },
        ])
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
