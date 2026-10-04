import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBand } from "@/components/PageBand";
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
    <>
      <PageBand title={submit.title} intro={submit.intro} />
      <div className="mx-auto max-w-3xl space-y-8 px-4 pt-2">
      <section className="card p-5">
        <h2 className="font-bold">{submit.policyTitle}</h2>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted marker:text-yes">
          {submit.policy.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <SubmitForm lang={lang} labels={submit} categoryNames={dict.categories} />
      </div>
    </>
  );
}
