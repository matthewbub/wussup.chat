type User = {
  id: string;
  email: string;
  email_verified: boolean;
  expires_at: string;
  username?: string;
};

type SupabaseUser = {
  id: string;
  email: string;
};
export type { User, SupabaseUser };
