export type PickStatus = "upcoming" | "current" | "locked";

export type Pick = {
  id: string;
  movie_id: string;
  picker_member_id: string;
  month: number;
  year: number;
  watch_date: string | null;
  picker_note: string | null;
  status: PickStatus;
  created_at: string;
};
