import { Clapperboard, Coins, Cpu, Gamepad2, Sparkles, Trophy, Users, type LucideProps } from "lucide-react";
import type { Category } from "@/lib/topics-shared";

const icons: Record<Category, React.ComponentType<LucideProps>> = {
  social: Users,
  entertainment: Clapperboard,
  gaming: Gamepad2,
  sports: Trophy,
  economy: Coins,
  technology: Cpu,
  other: Sparkles,
};

export function CategoryIcon({ category, ...props }: { category: Category } & LucideProps) {
  const Icon = icons[category];
  return <Icon aria-hidden="true" {...props} />;
}
