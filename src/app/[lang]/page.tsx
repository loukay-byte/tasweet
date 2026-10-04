import { notFound } from "next/navigation";
import { TopicCard } from "@/components/TopicCard";
import { VotingNow } from "@/components/VotingNow";
import { hasLocale, plural } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
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
    getTrendingTopics(10),
    getRecentlyClosedTopics(4),
    getVotingNow(),
  ]);
  const trendingList = trending.filter((t) => t.id !== featured?.id);

  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-2">
        <VotingNow lang={lang} initial={votingNow} label={home.votingNow} />
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{home.tagline}</h1>
        <p className="max-w-xl text-muted">{home.intro}</p>
      </section>

      {featured && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-accent">{home.questionOfTheDay}</h2>
          <TopicCard lang={lang} topic={localize(featured, lang)} dict={dict} cta={home.voteNow} featured />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{home.trending}</h2>
        {trendingList.length === 0 && !featured ? (
          <p className="text-muted">{home.noTopics}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {trendingList.map((t) => (
              <li key={t.id}>
                <TopicCard
                  lang={lang}
                  topic={localize(t, lang)}
                  dict={dict}
                  cta={home.voteNow}
                  meta={t.recentVotes > 0 ? plural(lang, home.votesToday, t.recentVotes) : undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {closed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">{home.recentResults}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {closed.map((t) => (
              <li key={t.id}>
                <TopicCard lang={lang} topic={localize(t, lang)} dict={dict} cta={home.seeResults} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
