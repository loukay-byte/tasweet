import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedTopic } from "@/lib/topics";

type Props = {
  lang: Locale;
  topic: LocalizedTopic;
  dict: Pick<Dictionary, "categories" | "status" | "topic">;
  meta?: string;
  cta: string;
  featured?: boolean;
};

export function TopicCard({ lang, topic, dict, meta, cta, featured }: Props) {
  return (
    <Link
      href={`/${lang}/t/${topic.slug}`}
      className={`group block rounded-2xl border border-border bg-surface p-5 transition hover:border-accent ${
        featured ? "sm:p-7" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-medium text-accent">
          {dict.categories[topic.category]}
        </span>
        {topic.isSponsored && (
          <span className="rounded-full border border-border px-2.5 py-0.5">{dict.topic.sponsored}</span>
        )}
        {!topic.isOpen && <span>{dict.status[topic.status]}</span>}
        {meta && <span className="ms-auto">{meta}</span>}
      </div>
      <h3 className={`mt-3 font-bold leading-snug ${featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
        {topic.question}
      </h3>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">
          {topic.optionA} · {topic.optionB}
        </span>
        <span className="shrink-0 font-medium text-accent group-hover:underline">{cta}</span>
      </div>
    </Link>
  );
}
