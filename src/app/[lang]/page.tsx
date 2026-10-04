import Link from "next/link";
import { notFound } from "next/navigation";
import { TopicRow } from "@/components/TopicRow";
import { VotePanel } from "@/components/VotePanel";
import { VotingNow } from "@/components/VotingNow";
import { hasLocale, plural } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getClosedResults,
  getQuestionOfTheDay,
  getRecentlyClosedTopics,
  getTrendingTopics,
  getVotingNow,
  localize,
} from "@/lib/topics";

export const revalidate = 60;

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { home } = dict;

  const [featured, trending, closed, votingNow] = await Promise.all([
    getQuestionOfTheDay(),
    getTrendingTopics(8),
    getRecentlyClosedTopics(3),
    getVotingNow(),
  ]);
  const closedResults = await getClosedResults(closed.map((t) => t.id));

  // The hero is a ballot you can vote on right here: today's question,
  // or the most active open topic when none is set.
  const heroTopic = featured && localize(featured, lang).isOpen ? featured : (trending[0] ?? null);
  const hero = heroTopic && localize(heroTopic, lang);
  const rest = trending.filter((t) => t.id !== heroTopic?.id).slice(0, 6);

  return (
    <div className="space-y-14">
      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <VotingNow lang={lang} initial={votingNow} label={home.votingNow} />
          {hero && (
            <span className="text-sm text-muted">
              {heroTopic === featured ? home.questionOfTheDay : home.mostActive}
            </span>
          )}
        </div>

        {hero ? (
          <>
            <Link href={`/${lang}/t/${hero.slug}`} className="block">
              <h1 className="text-[2.5rem] leading-[1.15] font-bold text-balance hover:text-accent sm:text-5xl">
                {hero.question}
              </h1>
            </Link>
            {hero.description && <p className="max-w-xl text-muted">{hero.description}</p>}
            <VotePanel
              lang={lang}
              topicId={hero.id}
              optionA={hero.optionA}
              optionB={hero.optionB}
              labels={dict.topic}
              reasons={dict.reasons}
            />
          </>
        ) : (
          <div className="space-y-4 py-10">
            <h1 className="text-4xl font-bold">{home.tagline}</h1>
            <p className="text-muted">{home.noTopics}</p>
            <Link href={`/${lang}/submit`} className="inline-block font-medium text-accent underline">
              {dict.nav.suggest}
            </Link>
          </div>
        )}
      </section>

      {rest.length > 0 && (
        <section>
          <SectionHeading title={home.trending} href={`/${lang}/explore`} linkLabel={home.exploreAll} />
          <ul>
            {rest.map((t) => (
              <li key={t.id}>
                <TopicRow
                  lang={lang}
                  topic={localize(t, lang)}
                  dict={dict}
                  meta={t.recentVotes > 0 ? plural(lang, home.votesToday, t.recentVotes) : undefined}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {closed.length > 0 && (
        <section>
          <SectionHeading title={home.recentResults} href={`/${lang}/results`} linkLabel={home.allResults} />
          <ul>
            {closed.map((t) => (
              <li key={t.id}>
                <TopicRow lang={lang} topic={localize(t, lang)} dict={dict} resultPctA={closedResults.get(t.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Link href={href} className="text-sm text-accent hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
