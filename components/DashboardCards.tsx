import Link from "next/link";

type DashboardCard = {
  href: string;
  icon: string;
  title: string;
  description: string;
};

const cards: DashboardCard[] = [
  {
    href: "/upload",
    icon: "📂",
    title: "Upload Project",
    description: "Upload a folder and get an AI summary of the codebase."
  },
  {
    href: "/ask",
    icon: "💬",
    title: "Ask Questions",
    description: "Ask from memory or from your uploaded project summary."
  },
  {
    href: "/log",
    icon: "🧠",
    title: "Log Decisions",
    description: "Store decisions with summaries so your team can query later."
  },
  
];

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-xl">
              {card.icon}
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{card.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{card.description}</p>
              <p className="mt-4 text-xs font-medium text-indigo-300 opacity-0 transition group-hover:opacity-100">
                Open →
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

