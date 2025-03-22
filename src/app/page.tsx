import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import ChatAppV3 from "./_components/ChatAppV3";
import { createClient } from "@/lib/supabase-server";

export default async function Page() {
  // if ur signed in we use ur user id
  const { userId } = await auth();

  // otherwise we snatch ur ip addy and make that the user id
  const headersList = await headers();
  const ip = getIpAddress(headersList);

  // thinking of the best way to do this...
  const you = await whoAreYou(userId, ip);

  return (
    <div>
      {/* Your IP address is: {ip} and your user id is: {userId}
      <pre>{JSON.stringify(you, null, 2)}</pre> */}
      <ChatAppV3 />
    </div>
  );
}

// Get IP address from X-Forwarded-For header or fall back to the direct connection IP
function getIpAddress(headersList: Headers) {
  return headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "Unknown";
}

async function whoAreYou(preferredId: string | null, ip: string) {
  if (preferredId) {
    return await userFromId(preferredId);
  }

  return await userFromIp(ip);
}

async function userFromId(id: string) {
  const supabase = await createClient();

  // Try to get existing user
  const { data } = await supabase.from("UserMetaData").select("*").eq("clerk_user_id", id).single();

  // If user exists, return it
  if (data) return data;

  // If user doesn't exist, create new record
  const { data: newUser, error: createError } = await supabase
    .from("UserMetaData")
    .insert([{ clerk_user_id: id }])
    .select()
    .single();

  if (createError) {
    throw new Error(createError?.message);
  }

  return newUser;
}

async function userFromIp(ip: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("UserMetaData").select("*").eq("user_ip", ip).single();

  if (data) return data;

  const { data: newUser, error: createError } = await supabase
    .from("UserMetaData")
    .insert([{ user_ip: ip }])
    .select()
    .single();

  if (createError) {
    throw new Error(createError?.message);
  }

  return newUser;
}
