import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PageBand } from "@/components/PageBand";

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
    <article>
      <PageBand title={methodology.title} intro={methodology.body} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-2">
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{methodology.principlesTitle}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {methodology.principles.map((p) => (
            <li key={p.title} className="card p-4">
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
      </div>
    </article>
  );
}
