// Minimal stroke icons for navigation. Decorative; labels carry the meaning.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const HomeIcon = ({ className = "size-6" }) => (
  <svg {...base} className={className}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z" />
  </svg>
);

export const SearchIcon = ({ className = "size-6" }) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);

// A finished split: one pill divided off-center.
export const ResultsIcon = ({ className = "size-6" }) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="8" width="19" height="8" rx="4" />
    <path d="M9 8v8" />
    <path d="M6.5 12h0" strokeWidth={4} />
  </svg>
);

export const PlusIcon = ({ className = "size-5" }) => (
  <svg {...base} strokeWidth={2.2} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
