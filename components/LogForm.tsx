"use client";

import { FormEvent, useState } from "react";

export function LogForm() {
  const [title, setTitle] = useState("");
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      const parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          decision,
          context,
          tags: parsedTags
        })
      });

      const data = (await response.json()) as { error?: string; memory?: { id?: string } };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to log decision");
      }

      setStatus(`Decision logged successfully. Memory ID: ${data.memory?.id ?? "created"}`);
      setTitle("");
      setDecision("");
      setContext("");
      setTags("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-xl max-w-2xl mx-auto mt-10 transition-all">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-green-400"><path d="M12 2v20m10-10H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        Log a Decision
      </h1>
      <p className="mt-3 text-base text-zinc-400">
        Save technical decisions with context so the team can query them later.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block text-base text-zinc-300 font-medium">Title</label>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base outline-none ring-green-400 placeholder:text-zinc-500 focus:ring-2 focus:border-green-400 transition"
            placeholder="Example: We chose PostgreSQL over MongoDB"
          />
        </div>

        <div>
          <label className="mb-2 block text-base text-zinc-300 font-medium">Decision</label>
          <textarea
            required
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            className="min-h-32 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base outline-none ring-green-400 placeholder:text-zinc-500 focus:ring-2 focus:border-green-400 transition"
            placeholder="Describe the decision and trade-offs..."
          />
        </div>

        <div>
          <label className="mb-2 block text-base text-zinc-300 font-medium">Context</label>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base outline-none ring-green-400 placeholder:text-zinc-500 focus:ring-2 focus:border-green-400 transition"
            placeholder="Optional: constraints, timeline, alternatives..."
          />
        </div>

        <div>
          <label className="mb-2 block text-base text-zinc-300 font-medium">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base outline-none ring-green-400 placeholder:text-zinc-500 focus:ring-2 focus:border-green-400 transition"
            placeholder="backend, infra, api"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-gradient-to-r from-green-500 to-green-400 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-green-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Saving...</span>
          ) : (
            <span>Save Decision</span>
          )}
        </button>
      </form>

      {status ? <p className="mt-6 text-base text-emerald-400 font-medium">{status}</p> : null}
      {error ? <p className="mt-6 text-base text-red-400 font-medium">{error}</p> : null}
    </section>
  );
}
