"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SplitBar } from "@/components/SplitBar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/client";
import type { Topic } from "@/lib/topics";

const categories = ["social", "entertainment", "gaming", "sports", "economy", "technology", "other"] as const;

type Props = {
  lang: Locale;
  labels: Dictionary["submit"];
  categoryNames: Dictionary["categories"];
};

export function SubmitForm({ lang, labels, categoryNames }: Props) {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [category, setCategory] = useState<Topic["category"] | null>(null);
  const [description, setDescription] = useState("");
  const [state, setState] = useState<"editing" | "sending" | "sent">("editing");
  const [error, setError] = useState<string | null>(null);

  const errorMessage = (message: string) =>
    message in labels.errors ? labels.errors[message as keyof typeof labels.errors] : labels.errors.generic;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) {
      setError(labels.errors.invalid_category);
      return;
    }
    setError(null);
    setState("sending");
    const supabase = createClient();

    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setError(labels.errors.sign_in_failed);
        setState("editing");
        return;
      }
    }

    const { error } = await supabase.rpc("submit_topic", {
      p_lang: lang,
      p_question: question,
      p_option_a: optionA,
      p_option_b: optionB,
      p_category: category,
      p_description: description || undefined,
    });
    if (error) {
      setError(errorMessage(error.message));
      setState("editing");
      return;
    }
    setState("sent");
  }

  function reset() {
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setCategory(null);
    setDescription("");
    setState("editing");
  }

  if (state === "sent") {
    return (
      <div role="status" className="space-y-4 rounded-[1.75rem] border border-border bg-surface p-6">
        <h2 className="font-display text-2xl font-bold">{labels.sentTitle}</h2>
        <p className="text-muted">{labels.sentBody}</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-foreground"
          >
            {labels.another}
          </button>
          <Link href={`/${lang}`} className="rounded-full px-5 py-2.5 text-muted hover:text-foreground">
            {labels.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-2xl border border-border bg-surface px-4 py-3 outline-none focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {error && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <Field id="question" label={labels.questionLabel} hint={labels.questionHint} count={question.length} max={200}>
        <textarea
          id="question"
          required
          minLength={10}
          maxLength={200}
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={labels.questionPlaceholder}
          className={`${field} resize-none text-lg font-medium`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="option-a" label={labels.optionA} count={optionA.length} max={60}>
          <input id="option-a" required maxLength={60} value={optionA} onChange={(e) => setOptionA(e.target.value)} className={field} />
        </Field>
        <Field id="option-b" label={labels.optionB} count={optionB.length} max={60}>
          <input id="option-b" required maxLength={60} value={optionB} onChange={(e) => setOptionB(e.target.value)} className={field} />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">{labels.categoryLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label key={cat} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-border px-4 py-1.5 text-sm transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {categoryNames[cat]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="description" label={labels.descriptionLabel} count={description.length} max={500}>
        <textarea
          id="description"
          maxLength={500}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${field} resize-none`}
        />
      </Field>

      <section aria-label={labels.previewLabel} className="space-y-2">
        <p className="text-sm text-muted">{labels.previewLabel}</p>
        <div className="rounded-[1.75rem] border border-dashed border-border p-5">
          <p className={`text-lg font-semibold leading-snug ${question ? "" : "text-muted"}`}>
            {question || labels.questionPlaceholder}
          </p>
          <div className="mt-3">
            <SplitBar lang={lang} pctA={null} labelA={optionA || labels.optionA} labelB={optionB || labels.optionB} />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-full bg-accent px-5 py-3.5 font-medium text-accent-foreground transition active:scale-[.98] disabled:opacity-60"
      >
        {state === "sending" ? labels.sending : labels.send}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  hint,
  count,
  max,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  count: number;
  max: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className={`text-xs tabular-nums ${count > max * 0.9 ? "text-accent" : "text-muted"}`}>
          {count}/{max}
        </span>
      </div>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
