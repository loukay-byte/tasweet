import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBand } from "@/components/PageBand";
import { TopicCard } from "@/components/TopicCard";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getClosedResults, getRecentlyClosedTopics, localize } from "@/lib/topics";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[lang]/results">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { results } = await getDictionary(lang);
  return { title: results.title, description: results.intro };
}

export default async function Results({ params }: PageProps<"/[lang]/results">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const topics = await getRecentlyClosedTopics(30);
  const shares = await getClosedResults(topics.map((t) => t.id));

  return (
    <>
      <PageBand title={dict.results.title} intro={dict.results.intro} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-2">
      {topics.length > 0 ? (
        <ul className="space-y-3">
          {topics.map((t) => (
            <li key={t.id}>
              <TopicCard lang={lang} topic={localize(t, lang)} dict={dict} resultPctA={shares.get(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border border-dashed border-border p-6 text-muted">
          {dict.results.empty}{" "}
          <Link href={`/${lang}`} className="font-medium text-accent underline">
            {dict.results.voteOpen}
          </Link>
        </p>
      )}
      <p className="text-xs text-muted">
        {dict.topic.resultsNote}{" "}
        <Link href={`/${lang}/methodology`} className="underline hover:text-foreground">
          {dict.topic.methodologyLink}
        </Link>
      </p>
      </div>
    </>
  );
}
