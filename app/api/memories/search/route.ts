import { NextResponse } from "next/server";
import { searchMemories } from "@/lib/membrain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, limit } = body as { query?: string; limit?: number };

    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const projectId = process.env.DEFAULT_PROJECT_ID ?? "default";

    const results = await searchMemories(projectId, query.trim(), limit ?? 5);

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("[api/memories/search] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
