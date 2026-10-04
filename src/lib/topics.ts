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

const pick = (lang: Locale, ar: string | null, en: string | null) =>
  (lang === "en" ? (en ?? ar) : (ar ?? en)) ?? "";

// Each topic may be missing one language (suggestions arrive in one);
// fall back to the other.
export function localize(topic: Topic, lang: Locale): LocalizedTopic {
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
    question: pick(lang, topic.question_ar, topic.question_en),
    description: pick(lang, topic.description_ar, topic.description_en) || null,
    optionA: pick(lang, topic.option_a_ar, topic.option_a_en),
    optionB: pick(lang, topic.option_b_ar, topic.option_b_en),
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

export async function searchTopics(query: string, category: Topic["category"] | null): Promise<Topic[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("search_topics", {
    p_query: query,
    p_category: category ?? undefined,
    p_limit: 40,
  });
  if (error) throw error;
  return data;
}

// Final A share (0–100) for closed or archived topics, keyed by topic id.
// Topics with no counted votes are left out.
export async function getClosedResults(topicIds: string[]): Promise<Map<string, number>> {
  const supabase = createPublicClient();
  if (!supabase || topicIds.length === 0) return new Map();
  const { data, error } = await supabase.rpc("closed_results", { p_topic_ids: topicIds });
  if (error) throw error;
  return new Map(
    data.filter((r) => r.a + r.b > 0).map((r) => [r.topic_id, Math.round((r.a / (r.a + r.b)) * 100)]),
  );
}
