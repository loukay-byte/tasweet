import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryChip, StatusChip } from "@/components/CategoryChip";
import { HeroBand } from "@/components/HeroBand";
import { SectionHeading } from "@/components/SectionHeading";
import { TopicCard } from "@/components/TopicCard";
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

  // The hero is a ballot you vote on right here: today's question, or the
  // most active open topic when none is set.
  const heroTopic = featured && localize(featured, lang).isOpen ? featured : (trending[0] ?? null);
  const hero = heroTopic && localize(heroTopic, lang);
  const rest = trending.filter((t) => t.id !== heroTopic?.id).slice(0, 6);

  return (
    <>
      <HeroBand overlap={!!hero}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {hero && <CategoryChip tone="band" category={hero.category} label={dict.categories[hero.category]} />}
            {hero && <StatusChip live label={heroTopic === featured ? home.questionOfTheDay : dict.status.open} />}
            <span className="ms-auto">
              <VotingNow lang={lang} initial={votingNow} label={home.votingNow} />
            </span>
          </div>
          {hero ? (
            <>
              <Link href={`/${lang}/t/${hero.slug}`} className="block">
                <h1 className="text-[2rem] leading-[1.25] font-bold text-balance sm:text-5xl">{hero.question}</h1>
              </Link>
              {hero.description && <p className="text-band-foreground/85">{hero.description}</p>}
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold">{home.tagline}</h1>
              <p className="text-band-foreground/85">{home.noTopics}</p>
            </>
          )}
        </div>
      </HeroBand>

      <div className="mx-auto max-w-3xl space-y-12 px-4">
        {hero ? (
          <div className="relative z-10 -mt-24">
            <VotePanel
              lang={lang}
              topicId={hero.id}
              optionA={hero.optionA}
              optionB={hero.optionB}
              labels={dict.topic}
              reasons={dict.reasons}
            />
          </div>
        ) : (
          <Link href={`/${lang}/submit`} className="mt-6 inline-block font-medium text-yes underline">
            {dict.nav.suggest}
          </Link>
        )}

        {rest.length > 0 && (
          <section>
            <SectionHeading title={home.trending} href={`/${lang}/explore`} linkLabel={home.seeAll} />
            <ul className="space-y-3">
              {rest.map((t) => (
                <li key={t.id}>
                  <TopicCard
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
            <SectionHeading title={home.recentResults} href={`/${lang}/results`} linkLabel={home.seeAll} />
            <ul className="space-y-3">
              {closed.map((t) => (
                <li key={t.id}>
                  <TopicCard lang={lang} topic={localize(t, lang)} dict={dict} resultPctA={closedResults.get(t.id)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
