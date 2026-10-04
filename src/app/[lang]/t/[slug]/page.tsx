import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryChip, StatusChip } from "@/components/CategoryChip";
import { HeroBand } from "@/components/HeroBand";
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
    <article>
      <HeroBand overlap>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/${lang}/explore?c=${topic.category}`}>
              <CategoryChip tone="band" category={topic.category} label={dict.categories[topic.category]} />
            </Link>
            <StatusChip
              live={topic.isOpen}
              label={topic.isOpen ? dict.status.open : dict.status[topic.status === "open" ? "closed" : topic.status]}
            />
            {topic.isSponsored && <StatusChip live={false} label={dict.topic.sponsored} />}
          </div>
          <h1 className="text-[2rem] leading-[1.25] font-bold text-balance sm:text-5xl">{topic.question}</h1>
          {topic.description && <p className="text-band-foreground/85">{topic.description}</p>}
        </div>
      </HeroBand>

      <div className="relative z-10 mx-auto -mt-24 max-w-3xl px-4">
        <VotePanel
          lang={lang}
          topicId={topic.id}
          optionA={topic.optionA}
          optionB={topic.optionB}
          labels={dict.topic}
          reasons={dict.reasons}
        />
      </div>
    </article>
  );
}
