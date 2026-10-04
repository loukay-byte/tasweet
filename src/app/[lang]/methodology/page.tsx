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
    <article className="space-y-4">
      <h1 className="text-3xl font-bold">{methodology.title}</h1>
      <p className="text-muted">{methodology.body}</p>
    </article>
  );
}
