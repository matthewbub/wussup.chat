import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";

/**
 * Get IP address from X-Forwarded-For header or fall back to the direct connection IP
 */
export async function getIpAddress(headersList: Headers | ReturnType<typeof headers>) {
  const headers = headersList instanceof Headers ? headersList : await headersList;
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
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
    type: "user_ip",
  };
}

/**
 * Get user from clerk or request headers (server component)
 */
export async function getUserFromHeaders(headersList: ReturnType<typeof headers>) {
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

/**
 * Upserts a user record in the database based on their identifier (Clerk ID or IP address)
 */
export async function upsertUserByIdentifier(user: {
  type: string;
  userId: string;
  email?: string;
}): Promise<{ id: string } | { error: string }> {
  try {
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
        Sentry.captureException(updateError, {
          extra: {
            action: "update_user_email",
            userId: user.userId,
            userType: user.type,
          },
        });
        return { error: "Failed to update user" };
      }

      return { id: updatedUser.id };
    }

    if (!userData) {
      // For user_ip type, generate a unique email by adding timestamp
      const uniqueEmail =
        user.type === "user_ip" ? `${user.userId}_${Date.now()}@anonymous.user` : user.email || user.userId;

      const { data: newUser, error: createError } = await supabase
        .from(tableNames.USERS)
        .insert([
          {
            ...initialUser,
            email: uniqueEmail,
          },
        ])
        .select()
        .single();

      if (createError) {
        Sentry.captureException(createError, {
          extra: {
            action: "create_user",
            userId: user.userId,
            userType: user.type,
          },
        });
        return { error: "Failed to create user" };
      }

      userData = newUser;
    }

    if (!userData) {
      const error = new Error("User data not found after successful operation");
      Sentry.captureException(error, {
        extra: {
          action: "verify_user_data",
          userId: user.userId,
          userType: user.type,
        },
      });
      return { error: "User data not found" };
    }

    return { id: userData.id };
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        action: "upsert_user",
        userId: user.userId,
        userType: user.type,
      },
    });
    return { error: "Failed to process user data" };
  }
}
