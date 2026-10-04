import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubmitForm } from "@/components/SubmitForm";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/submit">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { submit } = await getDictionary(lang);
  return { title: submit.title, robots: { index: false } };
}

export default async function Submit({ params }: PageProps<"/[lang]/submit">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { submit } = dict;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">{submit.title}</h1>
        <p className="text-muted">{submit.intro}</p>
      </header>

      <section className="rounded-[1.75rem] bg-accent p-5 text-accent-foreground">
        <h2 className="text-lg font-bold">{submit.policyTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
          {submit.policy.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <SubmitForm lang={lang} labels={submit} categoryNames={dict.categories} />
    </div>
  );
}
