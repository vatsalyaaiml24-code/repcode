import { NextResponse } from "next/server";
import { answerFromProjectAnalysis, ProjectAnalysis } from "@/lib/ai";

type AskProjectBody = {
  question?: string;
  project?: ProjectAnalysis;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AskProjectBody;
    const question = body.question?.trim();
    const project = body.project;

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    if (
      !project ||
      typeof project.summary !== "string" ||
      typeof project.architecture !== "string" ||
      !Array.isArray(project.apiEndpoints) ||
      !Array.isArray(project.techStack)
    ) {
      return NextResponse.json({ error: "project analysis is required" }, { status: 400 });
    }

    const answer = await answerFromProjectAnalysis(project, question);
    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

