import { NextResponse } from "next/server";
import { analyzeProject, type ProjectAnalysis } from "@/lib/ai";
import { storeMemory } from "@/lib/membrain";

type UploadPayloadFile = {
  fileName?: string;
  content?: string;
};

function normalizePath(input: string): string {
  return input.replaceAll("\\", "/").trim();
}

function getExtension(fileName: string): string {
  const normalized = normalizePath(fileName);
  const lastDot = normalized.lastIndexOf(".");
  if (lastDot === -1) return "";
  return normalized.slice(lastDot).toLowerCase();
}

function shouldIgnorePath(filePath: string): boolean {
  const p = normalizePath(filePath).toLowerCase();
  if (p.includes("/node_modules/") || p.includes("\\node_modules\\")) return true;
  if (p.includes("/.next/") || p.includes(".next/")) return true;
  if (p.includes("/dist/") || p.includes("/build/")) return true;
  if (p.includes("/images/")) return true;
  if (p.includes("node_modules/")) return true;
  if (p.includes(".next/")) return true;
  if (p.includes("/dist/")) return true;
  if (p.includes("/build/")) return true;
  if (p.includes("/images/")) return true;

  // Keep things small: these files are often huge and usually not useful for structure+sample analysis.
  if (p.endsWith("package-lock.json")) return true;

  return false;
}

function scoreImportance(filePath: string): number {
  const p = normalizePath(filePath).toLowerCase();
  let score = 0;

  if (p.includes("/src/")) score += 6;
  if (p.includes("/app/")) score += 6;
  if (p.includes("/components/")) score += 5;
  if (p.includes("/lib/")) score += 5;
  if (p.includes("/pages/")) score += 4;

  if (p.endsWith("/package.json") || p.endsWith("package.json")) score += 3;
  if (p.includes("next.config")) score += 3;
  if (p.includes("tsconfig")) score += 3;

  if (p.includes("/demo-project/")) score += 2;

  // Prefer smaller, more human-readable source files.
  // (We can't know size here reliably beyond content, but file path hints are still helpful.)
  if (p.endsWith(".ts") || p.endsWith(".tsx")) score += 1;
  if (p.endsWith(".js")) score += 1;
  if (p.endsWith(".py")) score += 1;

  return score;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { files?: UploadPayloadFile[] };
    const files = body.files;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files received" },
        { status: 400 }
      );
    }

    const normalized = files.filter(
      (f): f is { fileName: string; content: string } =>
        typeof f?.fileName === "string" && typeof f?.content === "string"
    );

    if (normalized.length === 0) {
      return NextResponse.json(
        { error: "files must include { fileName: string, content: string } entries" },
        { status: 400 }
      );
    }

    const allowedExtensions = new Set([".js", ".ts", ".tsx", ".json", ".py"]);

    // 1) Filter files aggressively to reduce token usage.
    const candidates = normalized
      .map((f) => ({
        fileName: f.fileName,
        content: f.content
      }))
      .filter((f) => allowedExtensions.has(getExtension(f.fileName)))
      .filter((f) => !shouldIgnorePath(f.fileName));

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No supported code files found in upload selection" },
        { status: 400 }
      );
    }

    // 2) Limit files to the most important ones.
    const scored = candidates
      .map((f) => ({
        ...f,
        score: scoreImportance(f.fileName)
      }))
      .sort((a, b) => b.score - a.score || a.fileName.length - b.fileName.length);

    // requirement: use first 5–8 important files
    const targetCount = Math.min(8, Math.max(5, scored.length));
    const selected = scored.slice(0, targetCount);

    // 3) Truncate content per file to avoid token overflow.
    const truncatedFiles = selected.map((f) => ({
      fileName: f.fileName,
      content: f.content.slice(0, 300)
    }));

    // 4) Extract project structure + sample code.
    const structure = truncatedFiles.map((f) => f.fileName).join("\n");

    const limitedContent = truncatedFiles
      .map((f) => `// File: ${f.fileName}\n${f.content}`)
      .join("\n\n");

    const input = `Project Structure:\n${structure}\n\nSample Code:\n${limitedContent}`;

    let analysis: ProjectAnalysis;
    try {
      analysis = await analyzeProject(input);
    } catch (aiError) {
      console.error("[api/upload] analyzeProject failed; returning fallback analysis", aiError);
      analysis = {
        summary: input.slice(0, 900),
        techStack: [],
        architecture: "Project analysis failed; showing fallback structure summary.",
        apiEndpoints: []
      };
    }

    // 5) Store the generated summary in Membrain.
    const projectId = process.env.DEFAULT_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: "DEFAULT_PROJECT_ID is not configured" }, { status: 500 });
    }

    try {
      const contextWithEndpoints = analysis.architecture
        ? `${analysis.architecture}\n\nAPI Endpoints:\n${analysis.apiEndpoints.join("\n")}`
        : "";

      const memory = await storeMemory({
        projectId,
        title: "Project Code Summary",
        decision: analysis.summary || "Uploaded project analysis",
        context: contextWithEndpoints,
        tags: ["code_summary"]
      });

      return NextResponse.json(
        {
          ...analysis,
          storedMemoryId: memory.id
        },
        { status: 200 }
      );
    } catch (storeError) {
      console.error("[api/upload] Membrain storeMemory failed; returning analysis anyway", storeError);
      return NextResponse.json(analysis, { status: 200 });
    }
  } catch (error) {
    console.error("[api/upload] Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}