"use client";

export default function GraphPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">Knowledge Graph (removed)</h1>
            <p className="mt-2 text-sm text-zinc-400">The interactive graph viewer has been removed. You can still work with memories using the other tools in the app.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a href="/upload" className="block rounded-lg border border-zinc-800 bg-zinc-950/30 p-4 hover:scale-[1.01] transition">
            <div className="text-sm font-medium text-zinc-100">Upload</div>
            <p className="mt-1 text-xs text-zinc-400">Add projects and logs to populate memories.</p>
          </a>
          <a href="/ask" className="block rounded-lg border border-zinc-800 bg-zinc-950/30 p-4 hover:scale-[1.01] transition">
            <div className="text-sm font-medium text-zinc-100">Ask</div>
            <p className="mt-1 text-xs text-zinc-400">Query memories and get grounded answers.</p>
          </a>
          <a href="/log" className="block rounded-lg border border-zinc-800 bg-zinc-950/30 p-4 hover:scale-[1.01] transition">
            <div className="text-sm font-medium text-zinc-100">Log</div>
            <p className="mt-1 text-xs text-zinc-400">Review and manage logged memories.</p>
          </a>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/30 p-4">
          <h3 className="text-sm font-medium text-zinc-100">Want a new UI here?</h3>
          <p className="mt-2 text-xs text-zinc-400">I can build a replacement visual — e.g., a searchable list, timeline, or an alternative graph using a lightweight, embed-only viewer. Tell me which you&apos;d prefer and I&apos;ll implement it.</p>
        </div>
      </section>
    </main>
  );
}

