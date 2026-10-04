// The deep teal band that opens each page. Content sits on the band; a card
// placed right after it can overlap the curved bottom edge.
export function HeroBand({
  children,
  overlap = false,
}: {
  children: React.ReactNode;
  // Leave room at the bottom for a card that overlaps the band.
  overlap?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-band text-band-foreground">
      <BandShapes />
      <div className={`relative mx-auto max-w-3xl px-4 pt-4 ${overlap ? "pb-32" : "pb-14"}`}>{children}</div>
      {/* Curved lower edge: the page background rises from start to end. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 400 48"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-px h-12 w-full rtl:-scale-x-100"
      >
        <path d="M0 48 L0 40 C 140 46, 300 30, 400 0 L400 48 Z" fill="var(--background)" />
      </svg>
    </section>
  );
}

function BandShapes() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 320"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 size-full"
    >
      <defs>
        <linearGradient id="band-fold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--band-2)" />
          <stop offset="1" stopColor="var(--band)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* A soft fold sweeping in from the end side, edged with a hairline. */}
      <path d="M260 -20 C 330 40, 420 60, 440 140 L440 -20 Z" fill="url(#band-fold)" />
      <path d="M-40 90 C 40 110, 90 200, 170 330 L-40 330 Z" fill="url(#band-fold)" opacity="0.8" />
      <path d="M-40 90 C 40 110, 90 200, 170 330" fill="none" stroke="#d9c08a" strokeOpacity="0.35" strokeWidth="1" />
    </svg>
  );
}
