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
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-xl font-semibold">Ask Project Memory</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Ask a question and get an answer grounded in stored project decisions.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex gap-3">
        <input
          required
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none ring-zinc-300 placeholder:text-zinc-500 focus:ring-1"
          placeholder="Why did we choose REST over GraphQL?"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 disabled:opacity-60"
        >
          {isLoading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      {answer ? (
        <div className="mt-6 rounded-md border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-300">Answer</h2>
          <p className="whitespace-pre-wrap text-sm text-zinc-200">{answer}</p>
        </div>
      ) : null}

      {memories.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Memories Used</h3>
          <ul className="space-y-2">
            {memories.map((memory) => (
              <li key={memory.id} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                <p className="text-sm font-medium text-zinc-100">{memory.title ?? "Untitled memory"}</p>
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
