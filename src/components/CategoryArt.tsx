import { CategoryIcon } from "@/components/CategoryIcon";
import type { Category } from "@/lib/topics-shared";

// Optional artwork per category. Drop an image in public/categories/ and add
// it here, e.g. sports: "/categories/sports.webp". Without one, an abstract
// composition built from the category icon is drawn instead.
const images: Partial<Record<Category, string>> = {};

export function CategoryArt({ category, className = "" }: { category: Category; className?: string }) {
  const src = images[category];
  return (
    <div aria-hidden="true" className={`relative overflow-hidden bg-yes/10 ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <>
          <span className="absolute -end-6 -top-6 size-24 rounded-full bg-yes/15" />
          <span className="absolute -start-4 bottom-2 size-16 rounded-[45%] bg-surface/60" />
          <CategoryIcon category={category} className="absolute inset-0 m-auto size-12 text-yes/45" strokeWidth={1.25} />
        </>
      )}
    </div>
  );
}
