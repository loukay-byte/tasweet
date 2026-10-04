import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VotePanel } from "@/components/VotePanel";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getTopicBySlug, localize } from "@/lib/topics";

export const revalidate = 60;

// Topic pages render on first request, then stay cached.
export function generateStaticParams() {
  return [];
}

const PUBLIC_STATUSES = new Set(["open", "closed", "archived"]);

async function load(params: PageProps<"/[lang]/t/[slug]">["params"]) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const topic = await getTopicBySlug(slug);
  if (!topic || !PUBLIC_STATUSES.has(topic.status)) notFound();
  return { lang, topic: localize(topic, lang) };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/t/[slug]">): Promise<Metadata> {
  const { lang, topic } = await load(params);
  return {
    title: topic.question,
    description: topic.description ?? `${topic.optionA} / ${topic.optionB}`,
    alternates: {
      canonical: `/${lang}/t/${topic.slug}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/t/${topic.slug}`])),
    },
    openGraph: { title: topic.question, type: "article" },
  };
}

export default async function TopicPage({ params }: PageProps<"/[lang]/t/[slug]">) {
  const { lang, topic } = await load(params);
  const dict = await getDictionary(lang);

  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 font-medium text-accent">
            {dict.categories[topic.category]}
          </span>
          {topic.isSponsored && (
            <span className="rounded-full border border-border px-2.5 py-0.5">{dict.topic.sponsored}</span>
          )}
          <span>{topic.isOpen ? dict.status.open : dict.status[topic.status === "open" ? "closed" : topic.status]}</span>
        </div>
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{topic.question}</h1>
        {topic.description && <p className="text-muted">{topic.description}</p>}
      </header>

      <VotePanel
        lang={lang}
        topicId={topic.id}
        optionA={topic.optionA}
        optionB={topic.optionB}
        labels={dict.topic}
        reasons={dict.reasons}
      />
    </article>
  );
}
