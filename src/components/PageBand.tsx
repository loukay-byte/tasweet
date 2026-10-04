import { HeroBand } from "@/components/HeroBand";

// Short band carrying a page's title and one-line intro.
export function PageBand({ title, intro }: { title: string; intro?: string }) {
  return (
    <HeroBand>
      <h1 className="text-3xl font-bold">{title}</h1>
      {intro && <p className="mt-2 text-band-foreground/85">{intro}</p>}
    </HeroBand>
  );
}
