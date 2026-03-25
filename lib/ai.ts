import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type MemoryForAnswer = {
  title?: string;
  decision?: string;
  context?: string;
  summary?: string;
};

export async function answerQuestion(
  question: string,
  memories: MemoryForAnswer[]
): Promise<string> {
  const memoryContext = memories
    .map((m, i) => {
      return `
Memory ${i + 1}
Title: ${m.title ?? "N/A"}
Decision: ${m.decision ?? "N/A"}
Context: ${m.context ?? "N/A"}
Summary: ${m.summary ?? "N/A"}
      `;
    })
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "Answer only using given memories.",
      },
      {
        role: "user",
        content: `Question: ${question}\n\nMemories:\n${memoryContext}`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "No response";
}

export async function summarizeDecision(text: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: "Generate a concise 1-2 sentence summary of the decision and its context. Focus on the key takeaway.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "No summary generated";
}