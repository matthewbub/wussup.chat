"use server";

import { createClient } from "@/lib/supabase-server";
import { Resend } from "resend";
import { EmailTemplate, ConfirmationEmail } from "@/components/email/SupportRequestRecieved";
import { revalidatePath } from "next/cache";

const MAX_MESSAGE_LENGTH = 2000; // Reasonable limit for support messages
const MAX_SUBJECT_LENGTH = 200;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "6matbub@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const resend = new Resend(RESEND_API_KEY);

export async function submitSupportForm(formData: FormData): Promise<void> {
  // Validate input lengths
  const message = formData.get("message") as string;
  const subject = formData.get("subject") as string;
  const email = formData.get("email") as string;
  const category = formData.get("category") as string;

  if (message.length > MAX_MESSAGE_LENGTH || subject.length > MAX_SUBJECT_LENGTH) {
    return;
  }

  const supabase = await createClient();

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { error } = await supabase.from("ChatBot_SupportForm").insert({
      email: formData.get("email"),
      user_id: user?.id || null,
      category: formData.get("category"),
      subject: subject,
      message: message,
    });

    if (error) throw error;

    // Send notification email
    await resend.emails.send({
      from: "Wussup Support <support@ninembs.studio>",
      to: ADMIN_EMAIL,
      subject: `New Support Request: ${subject}`,
      react: EmailTemplate({
        email: formData.get("email") as string,
        category: formData.get("category") as string,
        subject: subject,
        message: message,
        userId: user?.id,
      }),
    });

    await resend.emails.send({
      from: "Wussup Support <support@ninembs.studio>",
      to: email,
      subject: `Support Request Received: ${subject}`,
      react: ConfirmationEmail({ email, category, subject }),
    });

    revalidatePath("/support");

    return;
  } catch (error) {
    console.error(error);
    return;
  }
}
