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
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);

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

        <button
          type="button"
          onClick={async () => {
            setSearchLoading(true);
            setSearchResults(null);
            setError(null);
            try {
              const q = (title || decision || "").trim();
              if (!q) {
                setError("Enter a title or decision to search memories");
                return;
              }

              const resp = await fetch("/api/memories/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, limit: 5 })
              });

              const json = await resp.json();
              if (!resp.ok) throw new Error(json.error || "Search failed");
              setSearchResults(Array.isArray(json.results) ? json.results : []);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setSearchLoading(false);
            }
          }}
          className="ml-3 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
        >
          {searchLoading ? "Searching..." : "Find similar memories"}
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-emerald-400">{status}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {searchResults ? (
        <section className="mt-6 rounded-md border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-medium text-zinc-100">Similar memories</h2>
          {searchResults.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-400">No similar memories found.</p>
          ) : (
            <ul className="mt-3 space-y-3 text-sm">
              {searchResults.map((r: any) => (
                <li key={r.id} className="rounded-md border border-zinc-800 p-3">
                  <div className="text-sm font-medium text-zinc-100">{r.title ?? r.id}</div>
                  <div className="mt-1 text-xs text-zinc-400">{r.summary ?? r.decision ?? r.context}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </section>
  );
}
