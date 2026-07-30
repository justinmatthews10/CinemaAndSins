export type Member = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_approved: boolean;
  created_at: string;
};
