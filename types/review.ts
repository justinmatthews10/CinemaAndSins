export type Review = {
  id: string;
  pick_id: string;
  member_id: string;
  score: number;
  review_text: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};
