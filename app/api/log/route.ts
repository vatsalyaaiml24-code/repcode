import { NextResponse } from "next/server";
import { storeMemory } from "@/lib/membrain";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, decision, context, tags } = body as {
      title?: string;
      decision?: string;
      context?: string;
      tags?: string[];
    };

    if (!title || !decision) {
      return NextResponse.json({ error: "Missing title or decision" }, { status: 400 });
    }

    const projectId = process.env.DEFAULT_PROJECT_ID ?? "default";

    const memory = await storeMemory({
      projectId,
      title,
      decision,
      context,
      tags
    });

    return NextResponse.json({ message: "Decision logged", memory: { id: memory.id } }, { status: 200 });
  } catch (error) {
    console.error("[api/log] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}