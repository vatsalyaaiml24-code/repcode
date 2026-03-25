"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  readUploadedProjectSummary,
  type UploadedProjectSummary
} from "@/lib/uploadedProjectStorage";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Folder, Brain, Loader2 } from "lucide-react";

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
  const [mode, setMode] = useState<"memory" | "project">("memory");
  const [projectSummary, setProjectSummary] = useState<UploadedProjectSummary | null>(null);

  useEffect(() => {
    setProjectSummary(readUploadedProjectSummary());
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    setMemories([]);

    try {
      if (mode === "memory") {
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
      } else {
        if (!projectSummary) {
          throw new Error(
            "No uploaded project analysis found. Upload a project first, then ask from “uploaded project”."
          );
        }

        const response = await fetch("/api/ask/project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question,
            project: projectSummary
          })
        });

        const data = (await response.json()) as {
          error?: string;
          answer?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to answer from uploaded project");
        }

        setAnswer(data.answer ?? "No answer generated.");
        setMemories([]);
      }
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
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Ask the Project</h1>
          <p className="mt-1 text-sm text-slate-400">
            Ask from stored memory or from your latest uploaded project analysis.
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <div className="w-full">
          <div className="flex rounded-xl border border-white/5 bg-black/20 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setMode("memory")}
              className={[
                "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300",
                mode === "memory"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              ].join(" ")}
            >
              <Brain className="w-4 h-4" />
              Ask from memory
            </button>
            <button
              type="button"
              onClick={() => setMode("project")}
              disabled={!projectSummary}
              className={[
                "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300",
                mode === "project"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                !projectSummary ? "cursor-not-allowed opacity-40" : ""
              ].join(" ")}
            >
              <Folder className="w-4 h-4" />
              Ask from uploaded project
            </button>
          </div>

          {mode === "project" && !projectSummary ? (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-amber-400/80 flex items-center gap-1.5 px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Upload a project first to enable this mode.
            </motion.p>
          ) : null}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            required
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 py-3 text-sm text-white outline-none ring-indigo-500/50 placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 transition-all"
            placeholder="Why did we choose REST over GraphQL?"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60 hover:bg-indigo-600 transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </>
          ) : (
            "Ask"
          )}
        </button>
      </form>

      <AnimatePresence>
        {error ? (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            {error}
          </motion.p>
        ) : null}

        {answer ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-xl border border-white/10 bg-black/20 p-6 backdrop-blur-md">
            <h2 className="mb-3 text-sm font-semibold tracking-wider text-indigo-300 uppercase">Answer</h2>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-200">{answer}</p>
          </motion.div>
        ) : null}

        {memories.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-400 uppercase">Memories Used</h3>
            <ul className="space-y-3">
              {memories.map((memory, i) => (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={memory.id} 
                  className="rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 transition-colors"
                >
                  <p className="text-base font-medium text-slate-100">{memory.title ?? "Untitled memory"}</p>
                  {memory.summary ? <p className="mt-2 text-sm leading-relaxed text-slate-400">{memory.summary}</p> : null}
                  {typeof memory.score === "number" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-medium text-indigo-300 border border-indigo-500/20">
                        Score: {memory.score.toFixed(3)}
                      </span>
                    </div>
                  ) : null}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
