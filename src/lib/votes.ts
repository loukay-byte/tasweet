// Shapes returned by the topic_results and cast_vote database functions.
export type Choice = "a" | "b";

export const reasonTags = ["cost", "culture", "safety", "quality", "convenience", "experience"] as const;
export type ReasonTag = (typeof reasonTags)[number];

export type MyVote = {
  choice: Choice;
  guess_pct_a: number | null;
  reason_tags: ReasonTag[];
  can_change_at: string;
};

export type TopicResults = {
  is_open: boolean;
  total: number;
  a: number | null;
  b: number | null;
  my_vote: MyVote | null;
};

export const percentA = (r: Pick<TopicResults, "a" | "b">) => {
  const total = (r.a ?? 0) + (r.b ?? 0);
  return total === 0 ? 0 : Math.round(((r.a ?? 0) / total) * 100);
};
