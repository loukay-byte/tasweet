"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { fill, formatNumber, formatPercent, numberLocale, plural, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { createClient } from "@/lib/supabase/client";
import { percentA, reasonTags, type Choice, type ReasonTag, type TopicResults } from "@/lib/votes";

const POLL_MS = 5_000;
const SWIPE_THRESHOLD = 90;

type Phase = "loading" | "choose" | "submitting" | "guess" | "results";

type Props = {
  lang: Locale;
  topicId: string;
  optionA: string;
  optionB: string;
  labels: Dictionary["topic"];
  reasons: Dictionary["reasons"];
};

export function VotePanel({ lang, topicId, optionA, optionB, labels, reasons }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [results, setResults] = useState<TopicResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useRef(createClient()).current;

  const loadResults = useCallback(async () => {
    const { data, error } = await supabase.rpc("topic_results", { p_topic_id: topicId });
    if (error) throw error;
    const next = data as TopicResults | null;
    setResults(next);
    return next;
  }, [supabase, topicId]);

  // Initial state: results if already voted or closed, otherwise the choice.
  useEffect(() => {
    loadResults()
      .then((r) => setPhase(!r || r.my_vote || !r.is_open ? "results" : "choose"))
      .catch(() => {
        setError(labels.errors.generic);
        setPhase("choose");
      });
  }, [loadResults, labels.errors.generic]);

  // Live results while the results are on screen.
  useEffect(() => {
    if (phase !== "results" || !results?.is_open) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") loadResults().catch(() => {});
    }, POLL_MS);
    return () => clearInterval(id);
  }, [phase, results?.is_open, loadResults]);

  const errorMessage = (message: string | undefined) =>
    message && message in labels.errors
      ? labels.errors[message as keyof typeof labels.errors]
      : labels.errors.generic;

  async function vote(choice: Choice) {
    const previous = phase;
    setError(null);
    setPhase("submitting");

    // Phase 2: voters get an anonymous session on their first vote.
    // Phase 3 replaces this with Google, Apple, and email sign-in.
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setError(labels.errors.sign_in_failed);
        setPhase(previous);
        return;
      }
    }

    const { error } = await supabase.rpc("cast_vote", { p_topic_id: topicId, p_choice: choice });
    if (error) {
      setError(errorMessage(error.message));
      setPhase(previous === "results" ? "results" : "choose");
      if (error.message === "topic_not_open") await loadResults().then(() => setPhase("results"));
      return;
    }

    const next = await loadResults().catch(() => null);
    setPhase(previous === "results" || next?.my_vote?.guess_pct_a != null ? "results" : "guess");
  }

  async function submitGuess(guess: number | null, tags: ReasonTag[]) {
    setError(null);
    if (guess !== null || tags.length > 0) {
      const { error } = await supabase.rpc("submit_guess", {
        p_topic_id: topicId,
        p_guess_pct_a: guess ?? (null as unknown as number),
        p_reason_tags: tags,
      });
      if (error) setError(errorMessage(error.message));
    }
    await loadResults().catch(() => {});
    setPhase("results");
  }

  return (
    <section aria-live="polite" className="space-y-4">
      {error && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {phase === "loading" && <div className="h-48 animate-pulse rounded-2xl bg-surface" />}

      {(phase === "choose" || phase === "submitting") && (
        <ChooseCard
          optionA={optionA}
          optionB={optionB}
          disabled={phase === "submitting"}
          hint={phase === "submitting" ? labels.voting : labels.swipeHint}
          totalLabel={results ? plural(lang, labels.totalVotes, results.total) : null}
          onChoose={vote}
        />
      )}

      {phase === "guess" && (
        <GuessStep optionA={optionA} labels={labels} reasons={reasons} lang={lang} onSubmit={submitGuess} />
      )}

      {phase === "results" && results && (
        <ResultsView lang={lang} results={results} optionA={optionA} optionB={optionB} labels={labels} onChange={vote} />
      )}

      <p className="text-xs text-muted">
        {labels.resultsNote}{" "}
        <Link href={`/${lang}/methodology`} className="underline hover:text-foreground">
          {labels.methodologyLink}
        </Link>
      </p>
    </section>
  );
}

function ChooseCard({
  optionA,
  optionB,
  disabled,
  hint,
  totalLabel,
  onChoose,
}: {
  optionA: string;
  optionB: string;
  disabled: boolean;
  hint: string;
  totalLabel: string | null;
  onChoose: (choice: Choice) => void;
}) {
  const [dx, setDx] = useState(0);
  const drag = useRef<{ startX: number; pointerId: number; captured: boolean } | null>(null);

  // Option A sits on the start side (right in Arabic, left in English).
  // Swiping the card toward an option chooses it.
  const choiceFor = (offset: number): Choice => {
    const rtl = document.documentElement.dir === "rtl";
    const towardStart = rtl ? offset > 0 : offset < 0;
    return towardStart ? "a" : "b";
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    drag.current = { startX: e.clientX, pointerId: e.pointerId, captured: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const offset = e.clientX - d.startX;
    // Capture only once it's clearly a drag, so plain taps still click the buttons.
    if (!d.captured && Math.abs(offset) > 8) {
      e.currentTarget.setPointerCapture(e.pointerId);
      d.captured = true;
    }
    if (d.captured) setDx(offset);
  };

  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.captured) return;
    const offset = e.clientX - d.startX;
    setDx(0);
    if (Math.abs(offset) >= SWIPE_THRESHOLD) onChoose(choiceFor(offset));
  };

  // dx is only non-zero after a client-side drag, so choiceFor never runs on the server.
  const leaning: Choice | null = Math.abs(dx) > 30 ? choiceFor(dx) : null;

  return (
    <div className="space-y-3">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          transform: `translateX(${dx}px) rotate(${dx / 25}deg)`,
          transition: dx === 0 ? "transform 200ms ease" : "none",
        }}
        data-testid="vote-card"
        className="touch-pan-y select-none rounded-2xl border border-border bg-surface p-4 shadow-sm"
      >
        <div className="grid grid-cols-2 gap-3">
          {(["a", "b"] as const).map((choice) => {
            const label = choice === "a" ? optionA : optionB;
            const highlighted = leaning === choice;
            return (
              <button
                key={choice}
                type="button"
                disabled={disabled}
                onClick={() => onChoose(choice)}
                className={`min-h-28 rounded-xl border-2 px-3 py-6 text-lg font-bold transition disabled:opacity-60 ${
                  highlighted
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border hover:border-accent hover:bg-accent/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{hint}</span>
        {totalLabel && <span>{totalLabel}</span>}
      </div>
    </div>
  );
}

function GuessStep({
  optionA,
  labels,
  reasons,
  lang,
  onSubmit,
}: {
  optionA: string;
  labels: Dictionary["topic"];
  reasons: Dictionary["reasons"];
  lang: Locale;
  onSubmit: (guess: number | null, tags: ReasonTag[]) => Promise<void>;
}) {
  const [guess, setGuess] = useState(50);
  const [tags, setTags] = useState<ReasonTag[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (withGuess: boolean) => {
    setBusy(true);
    await onSubmit(withGuess ? guess : null, tags);
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-surface p-5">
      <div className="space-y-4">
        <label htmlFor="guess" className="block font-medium">
          {fill(labels.guessTitle, { option: optionA })}
        </label>
        <div className="flex items-center gap-4">
          <input
            id="guess"
            type="range"
            min={0}
            max={100}
            value={guess}
            onChange={(e) => setGuess(Number(e.target.value))}
            style={{ "--fill": `${guess}%` } as CSSProperties}
            className="range w-full"
          />
          <output htmlFor="guess" className="w-14 shrink-0 text-end text-2xl font-bold tabular-nums">
            {formatNumber(lang, guess)}%
          </output>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">{labels.reasonsTitle}</legend>
        <div className="flex flex-wrap gap-2">
          {reasonTags.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((t) => (on ? t.filter((x) => x !== tag) : [...t, tag]))}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  on ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"
                }`}
              >
                {reasons[tag]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(true)}
          className="flex-1 rounded-xl bg-accent px-4 py-3 font-bold text-accent-foreground disabled:opacity-60"
        >
          {labels.guessSubmit}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit(false)}
          className="rounded-xl px-4 py-3 text-sm text-muted hover:text-foreground disabled:opacity-60"
        >
          {labels.skip}
        </button>
      </div>
    </div>
  );
}

function ResultsView({
  lang,
  results,
  optionA,
  optionB,
  labels,
  onChange,
}: {
  lang: Locale;
  results: TopicResults;
  optionA: string;
  optionB: string;
  labels: Dictionary["topic"];
  onChange: (choice: Choice) => void;
}) {
  const pctA = percentA(results);
  const total = (results.a ?? 0) + (results.b ?? 0);
  const mine = results.my_vote;
  const canChangeAt = mine ? Date.parse(mine.can_change_at) : null;
  const [now, setNow] = useState(() => Date.now());

  // Re-render when the change cooldown ends.
  useEffect(() => {
    if (!canChangeAt || canChangeAt <= now) return;
    const id = setTimeout(() => setNow(Date.now()), canChangeAt - now + 500);
    return () => clearTimeout(id);
  }, [canChangeAt, now]);

  const rows = [
    { choice: "a" as const, label: optionA, pct: total ? pctA : 0, count: results.a ?? 0 },
    { choice: "b" as const, label: optionB, pct: total ? 100 - pctA : 0, count: results.b ?? 0 },
  ];

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5">
      {!results.is_open && <p className="text-sm text-muted">{labels.closedNotice}</p>}

      <div className="flex items-center justify-between text-sm text-muted">
        <span>{plural(lang, labels.totalVotes, results.total)}</span>
        {results.is_open && (
          <span className="inline-flex items-center gap-1.5 text-accent">
            <span className="size-1.5 rounded-full bg-accent" />
            {labels.live}
          </span>
        )}
      </div>

      {total > 0 && (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.choice} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex flex-wrap items-center gap-2 font-medium">
                  <span>{row.label}</span>
                  {mine?.choice === row.choice && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs leading-5 text-accent">
                      {labels.yourVote}
                    </span>
                  )}
                </span>
                <span className="text-xl font-bold tabular-nums">{formatNumber(lang, row.pct)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ${
                    row.choice === "a" ? "bg-accent" : "bg-chart-b"
                  }`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {mine?.guess_pct_a != null && total > 0 && (
        <p className="text-sm">
          {fill(labels.guessResult, {
            guess: formatPercent(lang, mine.guess_pct_a),
            actual: formatPercent(lang, pctA),
          })}
        </p>
      )}

      {mine && results.is_open && (
        <div className="border-t border-border pt-4">
          {canChangeAt && canChangeAt > now ? (
            <p className="text-xs text-muted">
              {fill(labels.changeAvailable, {
                time: new Intl.DateTimeFormat(numberLocale[lang], { hour: "numeric", minute: "2-digit" }).format(
                  canChangeAt,
                ),
              })}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => onChange(mine.choice === "a" ? "b" : "a")}
              className="text-sm font-medium text-accent hover:underline"
            >
              {labels.changeVote}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
