import { User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBand } from "@/components/PageBand";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata({ params }: PageProps<"/[lang]/account">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { account } = await getDictionary(lang);
  return { title: account.title, robots: { index: false } };
}

// Placeholder until sign-in arrives in Phase 3.
export default async function Account({ params }: PageProps<"/[lang]/account">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { account } = await getDictionary(lang);

  return (
    <>
      <PageBand title={account.title} />
      <div className="mx-auto max-w-3xl px-4 pt-2">
        <section className="card space-y-3 p-6">
          <span className="flex size-12 items-center justify-center rounded-full bg-yes/10 text-yes">
            <User className="size-6" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold">{account.comingTitle}</h2>
          <p className="text-muted">{account.comingBody}</p>
          <Link href={`/${lang}/methodology`} className="inline-block text-sm font-medium text-yes underline">
            {account.howVerified}
          </Link>
        </section>
      </div>
    </>
  );
}
