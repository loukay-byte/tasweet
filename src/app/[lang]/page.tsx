import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { home } = await getDictionary(lang);

  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-6">
        <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {home.comingSoon}
        </span>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{home.tagline}</h1>
        <p className="max-w-xl text-lg text-muted">{home.intro}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">{home.principlesTitle}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {home.principles.map((p) => (
            <li key={p.title} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
