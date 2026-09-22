"use client";

import { cn } from "@/lib/utils";

const GRADIENT_MAP: Record<string, string> = {
  "from-violet-500 to-purple-500": "bg-gradient-to-br from-violet-500 to-purple-500",
  "from-fuchsia-500 to-pink-500": "bg-gradient-to-br from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-blue-500": "bg-gradient-to-br from-cyan-500 to-blue-500",
  "from-amber-500 to-orange-500": "bg-gradient-to-br from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500": "bg-gradient-to-br from-emerald-500 to-teal-500",
  "from-blue-500 to-indigo-500": "bg-gradient-to-br from-blue-500 to-indigo-500",
  "from-red-500 to-rose-500": "bg-gradient-to-br from-red-500 to-rose-500",
  "from-yellow-500 to-amber-500": "bg-gradient-to-br from-yellow-500 to-amber-500",
};

export function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-muted/50 border border-border hover:bg-muted transition-[background-color,transform,box-shadow] duration-300 hover:scale-[1.02]">
      <div className={cn(
        "inline-flex p-3 rounded-xl mb-4 text-white",
        GRADIENT_MAP[gradient] ?? "bg-gradient-to-br from-violet-500 to-purple-500"
      )}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function UseCaseCard({
  title,
  emoji,
  items,
}: {
  title: string;
  emoji: string;
  items: string[];
}) {
  return (
    <div className="p-8 rounded-2xl bg-muted/50 border border-border">
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
