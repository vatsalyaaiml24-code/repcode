export type UploadedProjectSummary = {
  summary: string;
  techStack: string[];
  architecture: string;
  apiEndpoints: string[];
};

const STORAGE_KEY = "repcode:uploadedProjectSummary:v1";

export function readUploadedProjectSummary(): UploadedProjectSummary | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<UploadedProjectSummary> | null;
    if (
      !parsed ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.techStack)
    ) {
      // Backward-compat: older uploads might have a different schema.
      // We still accept if it at least looks like a summary payload.
      if (!parsed || typeof parsed.summary !== "string") return null;
    }

    const keyPointsLike = (parsed as Record<string, unknown>).keyPoints;
    const hasArchitecture = typeof parsed.architecture === "string";
    const hasApiEndpoints = Array.isArray(parsed.apiEndpoints);
    const keyPointsFallback =
      Array.isArray(keyPointsLike) ? keyPointsLike.filter((x) => typeof x === "string").join("\n") : "";

    return {
      summary: parsed.summary,
      techStack: (Array.isArray(parsed.techStack) ? parsed.techStack : []).filter((x) => typeof x === "string"),
      // Backward-compat defaults
      architecture: hasArchitecture
        ? (parsed.architecture as string)
        : keyPointsFallback || (typeof parsed.summary === "string" ? parsed.summary.slice(0, 1200) : ""),
      apiEndpoints: hasApiEndpoints
        ? (parsed.apiEndpoints as unknown[]).filter((x) => typeof x === "string")
        : []
    };
  } catch {
    return null;
  }
}

export function writeUploadedProjectSummary(summary: UploadedProjectSummary) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(summary));
}

export function clearUploadedProjectSummary() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

