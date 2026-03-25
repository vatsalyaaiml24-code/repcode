import { NextResponse } from "next/server";
import { searchMemories, searchMemoriesByTag, type SearchMemoryResult } from "@/lib/membrain";
import { answerQuestion } from "@/lib/ai";

type AskBody = {
  question?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AskBody;
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const projectId = process.env.DEFAULT_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: "DEFAULT_PROJECT_ID is not configured" }, { status: 500 });
    }

    const memories = await searchMemories(projectId, question, 6);

    // Extend context with code summaries stored under tag `code_summary`.
    // If tag search fails or returns nothing, we fall back to the original memory logic.
    let codeSummaries: SearchMemoryResult[] = [];
    try {
      codeSummaries = await searchMemoriesByTag(projectId, "code_summary", question, 4);
    } catch (codeError) {
      console.error("[api/ask] code_summary search failed; continuing with memory-only", codeError);
    }

    const merged = [...memories, ...codeSummaries].slice(0, 8);

    const answer = await answerQuestion(question, merged);

    return NextResponse.json({
      answer,
      memoriesUsed: merged
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
