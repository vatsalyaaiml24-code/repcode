import { DashboardCards } from "@/components/DashboardCards";

export default function HomePage() {
  return (
    <div className="relative">
      <div className="absolute -inset-20 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.18),transparent_35%)]" />
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-10 shadow-sm">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-semibold text-zinc-100">REPCODE Dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            Upload a project for an AI summary, ask questions from memory or from the uploaded
            summary, and log decisions with reasoning so your team can learn faster.
          </p>
        </header>

        <div className="mt-8">
          <DashboardCards />
        </div>
      </section>
    </div>
  );
}
