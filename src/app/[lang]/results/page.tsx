import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicRow } from "@/components/TopicRow";
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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">{dict.results.title}</h1>
        <p className="text-muted">{dict.results.intro}</p>
      </header>
      {topics.length > 0 ? (
        <ul>
          {topics.map((t) => (
            <li key={t.id}>
              <TopicRow lang={lang} topic={localize(t, lang)} dict={dict} resultPctA={shares.get(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[1.75rem] border border-dashed border-border p-6 text-muted">
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
  );
}
