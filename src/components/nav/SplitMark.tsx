// The Sotak mark: one circle split into two choices, yes and no.
// Drawn in the bright tones so it reads on the teal header.
export function SplitMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2a10 10 0 0 0 0 20Z" fill="#6fd3bc" />
      <path d="M12 2a10 10 0 0 1 0 20Z" fill="#f29a4e" />
    </svg>
  );
}
