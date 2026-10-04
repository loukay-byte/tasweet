import Link from "next/link";
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

// A topic in a list: the question, its two options, and either the final
// split (closed) or an even, unresolved one (open).
export function TopicRow({ lang, topic, dict, meta, resultPctA }: Props) {
  return (
    <Link
      href={`/${lang}/t/${topic.slug}`}
      className="group block border-b border-border py-5 transition-colors first:pt-2 hover:bg-surface/60"
    >
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="font-medium text-accent">{dict.categories[topic.category]}</span>
        {topic.isSponsored && <span>· {dict.topic.sponsored}</span>}
        {!topic.isOpen && <span>· {dict.status[topic.status === "open" ? "closed" : topic.status]}</span>}
        {meta && <span className="ms-auto">{meta}</span>}
      </div>
      <h3 className="mt-1.5 text-lg leading-snug font-semibold group-hover:text-accent">{topic.question}</h3>
      <div className="mt-3">
        <SplitBar
          lang={lang}
          pctA={resultPctA ?? null}
          labelA={topic.optionA}
          labelB={topic.optionB}
        />
      </div>
    </Link>
  );
}
