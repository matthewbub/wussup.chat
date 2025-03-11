type User = {
  id: string;
  email: string;
  email_verified: boolean;
  expires_at: string;
  username?: string;
  chat_context?: string;
  subscriptionStatus?: string;
  subscriptionPeriodEnd?: string;
  subscriptionPlan?: string;
  clerk_user_id?: string;
};

type SupabaseUser = {
  id: string;
  email: string;
};
export type { User, SupabaseUser };
