import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { PageBand } from "@/components/PageBand";
import { TopicCard } from "@/components/TopicCard";
import { fill, hasLocale, plural } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getClosedResults, localize, searchTopics, type Topic } from "@/lib/topics";

const categories = ["social", "entertainment", "gaming", "sports", "economy", "technology", "other"] as const;

export async function generateMetadata({ params }: PageProps<"/[lang]/explore">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { explore } = await getDictionary(lang);
  return { title: explore.title };
}

export default async function Explore({ params, searchParams }: PageProps<"/[lang]/explore">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { explore } = dict;

  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").slice(0, 100);
  const c = typeof sp.c === "string" && (categories as readonly string[]).includes(sp.c)
    ? (sp.c as Topic["category"])
    : null;

  const topics = await searchTopics(q, c);
  const results = await getClosedResults(topics.filter((t) => t.status !== "open").map((t) => t.id));
  const hrefFor = (category: string | null) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("c", category);
    const qs = next.toString();
    return `/${lang}/explore${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageBand title={explore.title} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-2">

      <form action={`/${lang}/explore`} role="search" className="relative">
        <label htmlFor="q" className="sr-only">
          {explore.searchLabel}
        </label>
        <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          autoFocus={!q && !c}
          placeholder={explore.searchPlaceholder}
          enterKeyHint="search"
          className="card w-full rounded-full! py-3.5 ps-12 pe-4 text-base outline-none placeholder:text-muted focus:border-yes"
        />
        {c && <input type="hidden" name="c" value={c} />}
      </form>

      <nav aria-label={explore.categoriesLabel} className="-mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2 whitespace-nowrap">
          {[null, ...categories].map((cat) => {
            const active = cat === c;
            return (
              <li key={cat ?? "all"}>
                <Link
                  href={hrefFor(cat)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-block rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {cat ? dict.categories[cat] : explore.allCategories}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <p className="text-sm text-muted" aria-live="polite">
        {plural(lang, explore.topicCount, topics.length)}
      </p>

      {topics.length > 0 ? (
        <ul className="space-y-3">
          {topics.map((t) => (
            <li key={t.id}>
              <TopicCard lang={lang} topic={localize(t, lang)} dict={dict} resultPctA={results.get(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2 rounded-3xl border border-dashed border-border p-6">
          <p className="font-medium">{q ? fill(explore.noMatches, { q }) : explore.noTopics}</p>
          <p className="text-sm text-muted">
            {explore.noMatchesHint}{" "}
            <Link href={`/${lang}/submit`} className="font-medium text-accent underline">
              {dict.nav.suggest}
            </Link>
          </p>
        </div>
      )}
      </div>
    </>
  );
}
