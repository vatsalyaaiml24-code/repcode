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
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-xl font-semibold">Log a Decision</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Save technical decisions with context so the team can query them later.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-300">Title</label>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-zinc-300 placeholder:text-zinc-500 focus:ring-1"
            placeholder="Example: We chose PostgreSQL over MongoDB"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Decision</label>
          <textarea
            required
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
            className="min-h-32 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-zinc-300 placeholder:text-zinc-500 focus:ring-1"
            placeholder="Describe the decision and trade-offs..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Context</label>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            className="min-h-24 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-zinc-300 placeholder:text-zinc-500 focus:ring-1"
            placeholder="Optional: constraints, timeline, alternatives..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-zinc-300 placeholder:text-zinc-500 focus:ring-1"
            placeholder="backend, infra, api"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
        >
          {isLoading ? "Saving..." : "Save Decision"}
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-emerald-400">{status}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
