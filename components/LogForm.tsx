"use client";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Log a Decision</h1>
          <p className="mt-1 text-sm text-slate-400">
            Save technical decisions with context so the team can query them later.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex justify-center items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-purple-500/20 disabled:opacity-60 hover:bg-purple-600 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Decision"
            )}
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
            className="flex-1 flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            {searchLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-400" />
                Find similar memories
              </>
            )}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {status ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>{status}</p>
          </motion.div>
        ) : null}

        {error ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p>{error}</p>
          </motion.div>
        ) : null}

        {searchResults ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Similar memories</h2>
            {searchResults.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No similar memories found.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {searchResults.map((r: any, i: number) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    key={r.id} 
                    className="rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="text-base font-medium text-slate-100">{r.title ?? r.id}</div>
                    <div className="mt-2 text-sm leading-relaxed text-slate-400">{r.summary ?? r.decision ?? r.context}</div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
