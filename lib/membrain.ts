type MembrainMemoryPayload = {
  projectId: string;
  title: string;
  decision: string;
  context?: string;
  tags?: string[];
  summary?: string;
};

export type StoredMemory = {
  id: string;
  projectId: string;
  title: string;
  decision: string;
  context?: string;
  tags?: string[];
  summary?: string;
  createdAt?: string;
};

export type SearchMemoryResult = {
  id: string;
  title?: string;
  decision?: string;
  context?: string;
  summary?: string;
  score?: number;
};

type IngestJobAccepted = {
  job_id: string;
  status_url?: string;
};

type IngestJobStatus = {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  result?: {
    memory_id: string;
    memory?: MemoryResponse;
  };
  error?: { message?: string; code?: string };
};

type MemoryResponse = {
  id: string;
  content: string;
  context: string;
  tags: string[];
  timestamp?: string;
  category?: string | null;
};

function getMembrainEnv() {
  const apiKey = process.env.MEMBRAIN_API_KEY;
  const baseUrl = process.env.MEMBRAIN_BASE_URL;

  if (!apiKey) {
    throw new Error("Missing MEMBRAIN_API_KEY");
  }
  if (!baseUrl) {
    throw new Error("Missing MEMBRAIN_BASE_URL");
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/+$/, "") };
}

function membrainHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Key": apiKey
  };
}

function buildMemoryContent(payload: MembrainMemoryPayload): string {
  const parts = [
    `# ${payload.title}`,
    "",
    "## Decision",
    payload.decision,
    payload.context ? `\n## Context\n${payload.context}` : "",
    payload.summary ? `\n## Summary\n${payload.summary}` : ""
  ];
  return parts.filter(Boolean).join("\n");
}

async function pollIngestJob(
  baseUrl: string,
  apiKey: string,
  jobId: string
): Promise<{ memory_id: string; memory?: MemoryResponse }> {
  const maxAttempts = 90;
  const delayMs = 600;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${baseUrl}/api/v1/memories/jobs/${encodeURIComponent(jobId)}`, {
      headers: membrainHeaders(apiKey)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Membrain job poll failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as IngestJobStatus & Record<string, unknown>;

    if (data.status === "completed") {
      const result = data.result as
        | { memory_id?: string; memory?: MemoryResponse }
        | null
        | undefined;
      if (result && typeof result.memory_id === "string") {
        return { memory_id: result.memory_id, memory: result.memory };
      }
      throw new Error("Membrain job completed but result.memory_id was missing");
    }

    if (data.status === "failed") {
      const err = data.error as { message?: string } | undefined;
      throw new Error(err?.message ?? "Membrain ingest job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("Membrain ingest job timed out");
}

export async function storeMemory(payload: MembrainMemoryPayload): Promise<StoredMemory> {
  const { apiKey, baseUrl } = getMembrainEnv();

  try {
    const content = buildMemoryContent(payload);
    const tags = [...(payload.tags ?? []), `project:${payload.projectId}`];

    const response = await fetch(`${baseUrl}/api/v1/memories`, {
      method: "POST",
      headers: membrainHeaders(apiKey),
      body: JSON.stringify({
        content,
        tags,
        category: payload.projectId
      })
    });

    if (response.status !== 202) {
      const errorText = await response.text();
      throw new Error(`Membrain store failed: ${response.status} ${errorText}`);
    }

    const accepted = (await response.json()) as IngestJobAccepted;
    const result = await pollIngestJob(baseUrl, apiKey, accepted.job_id);

    const memory = result.memory;
    const id = result.memory_id ?? memory?.id ?? accepted.job_id;

    return {
      id,
      projectId: payload.projectId,
      title: payload.title,
      decision: payload.decision,
      context: payload.context,
      tags: payload.tags,
      summary: payload.summary,
      createdAt: memory?.timestamp
    };
  } catch (error) {
    throw new Error(
      `storeMemory error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function normalizeSearchHit(raw: Record<string, unknown>, index: number): SearchMemoryResult | null {
  const score =
    typeof raw.score === "number"
      ? raw.score
      : typeof raw.similarity === "number"
        ? raw.similarity
        : undefined;

  const memory = raw.memory as Record<string, unknown> | undefined;
  const node = (memory ?? raw) as Record<string, unknown>;

  const id =
    (typeof node.id === "string" && node.id) ||
    (typeof raw.memory_id === "string" && raw.memory_id) ||
    (typeof raw.id === "string" && raw.id) ||
    `hit-${index}`;

  const content = typeof node.content === "string" ? node.content : undefined;
  const context = typeof node.context === "string" ? node.context : undefined;

  const title =
    typeof node.title === "string"
      ? node.title
      : content
        ? content.split("\n")[0]?.replace(/^#\s*/, "").slice(0, 200)
        : undefined;

  return {
    id,
    title,
    decision: content,
    context,
    summary: context || (content ? content.slice(0, 400) : undefined),
    score
  };
}

export async function searchMemories(
  projectId: string,
  query: string,
  limit = 5
): Promise<SearchMemoryResult[]> {
  const { apiKey, baseUrl } = getMembrainEnv();

  try {
    const response = await fetch(`${baseUrl}/api/v1/memories/search`, {
      method: "POST",
      headers: membrainHeaders(apiKey),
      body: JSON.stringify({
        query: `[project:${projectId}] ${query}`,
        k: limit,
        keyword_filter: projectId,
        response_format: "raw"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Membrain search failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as {
      results?: unknown[] | null;
      count?: number;
    };

    const rawResults = Array.isArray(data.results) ? data.results : [];
    const normalized: SearchMemoryResult[] = [];

    rawResults.forEach((item, index) => {
      if (item && typeof item === "object") {
        const hit = normalizeSearchHit(item as Record<string, unknown>, index);
        if (hit) {
          normalized.push(hit);
        }
      }
    });

    return normalized;
  } catch (error) {
    throw new Error(
      `searchMemories error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function searchMemoriesByTag(
  projectId: string,
  tag: string,
  query: string,
  limit = 5
): Promise<SearchMemoryResult[]> {
  try {
    // Membrain supports field filters using a bracket syntax in many deployments.
    // We attempt a tag-filter query first, then fall back to keyword-based search.
    const tagQuery = `[tag:${tag}] ${query}`.trim();
    return await searchMemories(projectId, tagQuery, limit);
  } catch (error) {
    console.error("[membrain] searchMemoriesByTag failed; falling back to keyword search", error);
    return searchMemories(projectId, `${tag} ${query}`.trim(), limit);
  }
}
