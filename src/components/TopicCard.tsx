import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CategoryArt } from "@/components/CategoryArt";
import { CategoryChip } from "@/components/CategoryChip";
import { SplitBar } from "@/components/SplitBar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { LocalizedTopic } from "@/lib/topics";

type Props = {
  lang: Locale;
  topic: LocalizedTopic;
  dict: Pick<Dictionary, "categories" | "status" | "topic">;
  meta?: string;
  // Final A share for closed topics; open topics never pass one.
  resultPctA?: number;
};

// A topic in a list: artwork, the question and its options, and a round
// call to action. Closed topics also show their final split.
export function TopicCard({ lang, topic, dict, meta, resultPctA }: Props) {
  const cta = topic.isOpen ? dict.topic.voteNow : dict.topic.seeResult;
  return (
    <Link href={`/${lang}/t/${topic.slug}`} className="card group flex overflow-hidden transition hover:-translate-y-0.5">
      <CategoryArt category={topic.category} className="w-24 shrink-0 sm:w-32" />
      <div className="min-w-0 flex-1 space-y-2 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <CategoryChip category={topic.category} label={dict.categories[topic.category]} />
          {topic.isSponsored && <span>{dict.topic.sponsored}</span>}
          {meta && <span>{meta}</span>}
        </div>
        <h3 className="leading-snug font-bold group-hover:text-yes">{topic.question}</h3>
        {resultPctA !== undefined ? (
          <SplitBar lang={lang} pctA={resultPctA} labelA={topic.optionA} labelB={topic.optionB} />
        ) : (
          <p className="truncate text-sm text-muted">
            {topic.optionA} · {topic.optionB}
          </p>
        )}
      </div>
      <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-1.5 border-s border-border px-2 text-center text-xs font-medium">
        <span className="flex size-10 items-center justify-center rounded-full bg-yes text-yes-foreground transition group-hover:scale-105">
          <ChevronLeft className="size-5 ltr:-scale-x-100" aria-hidden="true" />
        </span>
        {cta}
      </div>
    </Link>
  );
}
