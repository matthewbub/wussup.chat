import { getUserId } from "@/lib/chat/chat-utils";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { tableNames } from "@/constants/tables";
import { z } from "zod";

/**
 * Update a thread's name or pin status
 */
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { threadId, name, pin } = await req.json();
  const updateSchema = z.object({
    threadId: z.string().min(1),
    name: z.string().min(1).optional(),
    pin: z.boolean().optional(),
  });
  const result = updateSchema.safeParse({ threadId, name, pin });
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }

  let updateData: { name?: string; updated_at: Date; pinned?: boolean } = {
    updated_at: new Date(),
  };
  if (name) {
    updateData = { ...updateData, name };
  }
  if (typeof pin === "boolean") {
    updateData = { ...updateData, pinned: pin };
  }

  if (!name && typeof pin !== "boolean") {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(tableNames.CHAT_SESSIONS)
    .update(updateData)
    .eq("id", threadId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * Delete a thread and all its messages
 */
export async function DELETE(req: Request) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const deleteSchema = z.object({
    threadIdArray: z.array(z.string().min(1)),
  });

  const result = deleteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        details: result.error.issues,
      },
      { status: 400 }
    );
  }

  const { threadIdArray } = result.data;

  // Delete all messages first due to foreign key constraint
  const { error: messagesError } = await supabase
    .from(tableNames.CHAT_MESSAGES)
    .delete()
    .in("chat_session_id", threadIdArray)
    .eq("user_id", userId);

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  const { error } = await supabase
    .from(tableNames.CHAT_SESSIONS)
    .delete()
    .in("id", threadIdArray)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
