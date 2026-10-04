// The Tasweet mark: one circle split into two choices.
export function SplitMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2a10 10 0 0 0 0 20Z" fill="var(--accent)" />
      <path d="M12 2a10 10 0 0 1 0 20Z" fill="var(--chart-b)" />
    </svg>
  );
}
