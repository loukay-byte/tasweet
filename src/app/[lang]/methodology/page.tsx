import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/methodology">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { methodology } = await getDictionary(lang);
  return { title: methodology.title };
}

export default async function Methodology({ params }: PageProps<"/[lang]/methodology">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { methodology } = await getDictionary(lang);

  return (
    <article className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold">{methodology.title}</h1>
        <p className="text-muted">{methodology.body}</p>
      </header>
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{methodology.principlesTitle}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {methodology.principles.map((p) => (
            <li key={p.title} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
