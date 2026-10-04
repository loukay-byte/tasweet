import "server-only";
import type { Locale } from "@/i18n/config";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";

export type Topic = Database["public"]["Tables"]["topics"]["Row"];

export type LocalizedTopic = {
  id: string;
  slug: string;
  category: Topic["category"];
  status: Topic["status"];
  isSponsored: boolean;
  isOpen: boolean;
  closesAt: string | null;
  question: string;
  description: string | null;
  optionA: string;
  optionB: string;
};

// English fields are optional; fall back to Arabic when missing.
export function localize(topic: Topic, lang: Locale): LocalizedTopic {
  const en = lang === "en";
  const now = Date.now();
  return {
    id: topic.id,
    slug: topic.slug,
    category: topic.category,
    status: topic.status,
    isSponsored: topic.is_sponsored,
    isOpen:
      topic.status === "open" &&
      (!topic.opens_at || Date.parse(topic.opens_at) <= now) &&
      (!topic.closes_at || Date.parse(topic.closes_at) > now),
    closesAt: topic.closes_at,
    question: (en && topic.question_en) || topic.question_ar,
    description: (en && topic.description_en) || topic.description_ar,
    optionA: (en && topic.option_a_en) || topic.option_a_ar,
    optionB: (en && topic.option_b_en) || topic.option_b_ar,
  };
}

function riyadhToday() {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("topics").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getQuestionOfTheDay(): Promise<Topic | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("featured_on", riyadhToday())
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getTrendingTopics(limit = 10): Promise<(Topic & { recentVotes: number })[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data: ranked, error } = await supabase.rpc("trending_topics", { p_limit: limit });
  if (error) throw error;
  if (!ranked?.length) return [];

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("*")
    .in("id", ranked.map((r) => r.topic_id));
  if (topicsError) throw topicsError;

  const byId = new Map(topics.map((t) => [t.id, t]));
  return ranked.flatMap((r) => {
    const topic = byId.get(r.topic_id);
    return topic ? [{ ...topic, recentVotes: r.recent_votes }] : [];
  });
}

export async function getRecentlyClosedTopics(limit = 5): Promise<Topic[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .in("status", ["closed", "archived"])
    .order("closes_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getVotingNow(): Promise<number> {
  const supabase = createPublicClient();
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("voting_now");
  if (error) throw error;
  return data ?? 0;
}
