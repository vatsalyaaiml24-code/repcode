import { NextResponse } from "next/server";
import { storeMemory } from "@/lib/membrain";
import { summarizeDecision } from "@/lib/ai";

type LogBody = {
  title?: string;
  decision?: string;
  context?: string;
  tags?: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LogBody;
    const title = body.title?.trim();
    const decision = body.decision?.trim();
    const context = body.context?.trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !decision) {
      return NextResponse.json(
        { error: "title and decision are required" },
        {
          status: 400
        }
      );
    }

    const projectId = process.env.DEFAULT_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: "DEFAULT_PROJECT_ID is not configured" }, { status: 500 });
    }

    let summary = "";
    try {
      summary = await summarizeDecision(`${title}\n\n${decision}\n\n${context ?? ""}`);
    } catch (summarizeError) {
      console.error("[api/log] OpenRouter summarize failed (continuing without summary):", summarizeError);
    }

    const memory = await storeMemory({
      projectId,
      title,
      decision,
      context,
      tags,
      summary
    });

    return NextResponse.json({ memory }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
