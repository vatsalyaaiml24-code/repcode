import { NextResponse } from "next/server";
import { searchMemories } from "@/lib/membrain";
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
    const answer = await answerQuestion(question, memories);

    return NextResponse.json({
      answer,
      memoriesUsed: memories
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
