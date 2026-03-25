"use client";

import { FormEvent, useState } from "react";

type MemoryItem = {
  id: string;
  title?: string;
  summary?: string;
  score?: number;
};

export function AskInterface() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    setMemories([]);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      });

      const data = (await response.json()) as {
        error?: string;
        answer?: string;
        memoriesUsed?: MemoryItem[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to answer question");
      }

      setAnswer(data.answer ?? "No answer generated.");
      setMemories(data.memoriesUsed ?? []);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-xl max-w-2xl mx-auto mt-10 transition-all">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-blue-400"><path d="M12 2v20m10-10H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        Ask Project Memory
      </h1>
      <p className="mt-3 text-base text-zinc-400">
        Ask a question and get an answer grounded in stored project decisions.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch">
        <input
          required
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-base outline-none ring-blue-400 placeholder:text-zinc-500 focus:ring-2 focus:border-blue-400 transition"
          placeholder="Why did we choose REST over GraphQL?"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-3 text-base font-semibold text-white shadow-md hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>Thinking...</span>
          ) : (
            <span>Ask</span>
          )}
        </button>
      </form>

      {error ? <p className="mt-6 text-base text-red-400 font-medium">{error}</p> : null}

      {answer ? (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-blue-300 flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20" className="text-blue-300"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/></svg>
            Answer
          </h2>
          <p className="whitespace-pre-wrap text-base text-zinc-100 leading-relaxed">{answer}</p>
        </div>
      ) : null}

      {memories.length > 0 ? (
        <div className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-blue-300 flex items-center gap-2">
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18" className="text-blue-300"><rect x="2" y="2" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="2"/></svg>
            Memories Used
          </h3>
          <ul className="space-y-3">
            {memories.map((memory) => (
              <li key={memory.id} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 shadow-sm transition hover:border-blue-400">
                <p className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16" className="text-blue-400"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/></svg>
                  {memory.title ?? "Untitled memory"}
                </p>
                {memory.summary ? <p className="mt-1 text-sm text-zinc-400">{memory.summary}</p> : null}
                {typeof memory.score === "number" ? (
                  <p className="mt-1 text-xs text-zinc-500">Score: {memory.score.toFixed(3)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
