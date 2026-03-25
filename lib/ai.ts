import Groq from "groq-sdk";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }
  return new Groq({ apiKey });
}

type MemoryForAnswer = {
  title?: string;
  decision?: string;
  context?: string;
  summary?: string;
};

export type ProjectAnalysis = {
  summary: string;
  techStack: string[];
  architecture: string;
  apiEndpoints: string[];
};

function extractFirstJsonObject(text: string): string | null {
  // Best-effort: the model may wrap JSON in markdown/code fences.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : text;

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function answerQuestion(
  question: string,
  memories: MemoryForAnswer[]
): Promise<string> {
  const groq = getGroqClient();
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
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Summarize the provided decision text for future retrieval. Keep it concise and focused on rationale, constraints, and outcomes.",
      },
      {
        role: "user",
        content: `Summarize this decision:\n\n${text}`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "No summary generated";
}

export async function analyzeProject(projectText: string): Promise<ProjectAnalysis> {
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "You are a senior software engineer. Analyze the project and return STRICT JSON only.",
      },
      {
        role: "user",
        content: `
Analyze the following project code/text and produce:
{
  "summary": string,
  "techStack": string[],
  "architecture": string,
  "apiEndpoints": string[]
}

Rules:
- Return ONLY valid JSON (no markdown, no code fences).
- Detect likely frontend and backend technologies from filenames, imports, and structure.
- techStack should include frameworks/libraries (e.g., Next.js, React, Tailwind, Node, etc).

Project text:
${projectText}
        `.trim(),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content || "";
  const jsonText = extractFirstJsonObject(raw);
  const parsed = jsonText ? safeJsonParse<ProjectAnalysis>(jsonText) : null;

  if (!parsed) {
    // Fail safe: return minimal structure.
    return {
      summary: "Project analysis unavailable (model returned non-JSON output).",
      techStack: [],
      architecture: projectText.slice(0, 900),
      apiEndpoints: []
    };
  }

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    techStack: Array.isArray(parsed.techStack) ? parsed.techStack.filter((x) => typeof x === "string") : [],
    architecture: typeof parsed.architecture === "string" ? parsed.architecture : "",
    apiEndpoints: Array.isArray(parsed.apiEndpoints)
      ? parsed.apiEndpoints.filter((x) => typeof x === "string")
      : []
  };
}

export async function answerFromProjectAnalysis(
  analysis: ProjectAnalysis,
  question: string
): Promise<string> {
  const groq = getGroqClient();
  const analysisText = `
Project summary:
${analysis.summary}

Tech stack:
${analysis.techStack.map((t, i) => `${i + 1}. ${t}`).join(", ")}

Architecture:
${analysis.architecture}

API Endpoints:
${analysis.apiEndpoints.map((e, i) => `${i + 1}. ${e}`).join("\n")}
  `.trim();

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content:
          "Answer using ONLY the provided uploaded project analysis. If the answer is not present, say you do not know based on the uploaded summary.",
      },
      {
        role: "user",
        content: `Question: ${question}\n\nUploaded project analysis:\n${analysisText}`,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() || "No response";
}
