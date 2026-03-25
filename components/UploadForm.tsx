"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  readUploadedProjectSummary,
  writeUploadedProjectSummary,
  type UploadedProjectSummary
} from "@/lib/uploadedProjectStorage";

type UploadApiResponse = {
  error?: string;
} & Partial<UploadedProjectSummary> & { message?: string };

type UploadPayloadFile = {
  fileName: string;
  content: string;
};

type FileWithRelativePath = File & {
  webkitRelativePath?: string;
};

const ACCEPTED_EXTENSIONS = [".js", ".ts", ".tsx", ".json", ".py"] as const;
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",");

function getFileExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1) return "";
  return fileName.slice(idx).toLowerCase();
}

function getDisplayPath(file: FileWithRelativePath): string {
  return (file.webkitRelativePath && file.webkitRelativePath.length > 0
    ? file.webkitRelativePath
    : file.name) as string;
}

function isAcceptedFile(file: FileWithRelativePath): boolean {
  const ext = getFileExtension(file.name);
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext);
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function UploadForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [projectSummary, setProjectSummary] = useState<UploadedProjectSummary | null>(null);

  const acceptedTypesAttr = useMemo(() => ACCEPT_ATTR, []);
  const webkitDirectoryProps = useMemo(() => ({ webkitdirectory: "true" as any }), []);

  useEffect(() => {
    setProjectSummary(readUploadedProjectSummary());
  }, []);

  const selectedCount = files.length;
  const totalSizeBytes = useMemo(() => {
    return files.reduce((sum, f) => sum + (f.size || 0), 0);
  }, [files]);

  const addOrReplaceFiles = (incoming: File[]) => {
    const normalized = incoming.filter((f) => isAcceptedFile(f as FileWithRelativePath));
    setFiles(normalized);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragActive(false);

    const dtFiles = Array.from(event.dataTransfer.files || []);
    if (dtFiles.length === 0) return;

    addOrReplaceFiles(dtFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files || []);
    if (picked.length === 0) {
      setFiles([]);
      return;
    }
    addOrReplaceFiles(picked);
  };

  const buildUploadPayload = async (selectedFiles: File[]): Promise<UploadPayloadFile[]> => {
    const out: UploadPayloadFile[] = [];

    // Sequential keeps memory usage predictable for large folder uploads.
    for (const f of selectedFiles) {
      const file = f as FileWithRelativePath;
      // Keep request sizes small and align with backend token limits.
      const content = (await f.text()).slice(0, 300);
      out.push({
        fileName: getDisplayPath(file),
        content
      });
    }

    return out;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setStatus(null);
    setIsUploading(true);

    try {
      const payloadFiles = await buildUploadPayload(files);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ files: payloadFiles })
      });

      const data = (await res.json()) as UploadApiResponse;
      if (!res.ok) {
        setStatus({ type: "error", text: data.error ?? "Upload failed." });
        return;
      }

      const nextSummary: UploadedProjectSummary | null =
        typeof data.summary === "string" &&
        Array.isArray(data.techStack) &&
        typeof data.architecture === "string" &&
        Array.isArray(data.apiEndpoints)
          ? {
              summary: data.summary,
              techStack: data.techStack.filter((x) => typeof x === "string"),
              architecture: data.architecture,
              apiEndpoints: data.apiEndpoints.filter((x) => typeof x === "string")
            }
          : null;

      if (!nextSummary) {
        setStatus({
          type: "error",
          text: "Upload succeeded, but project analysis was missing from the response."
        });
        return;
      }

      setProjectSummary(nextSummary);
      writeUploadedProjectSummary(nextSummary);
      setStatus({ type: "success", text: data.message ?? "Project analyzed successfully." });
      setFiles([]); // reset after successful upload
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unexpected upload error."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const topFiles = files.slice(0, 20) as FileWithRelativePath[];
  const hasMore = files.length > 20;

  return (
    <div className="min-h-screen w-full p-6 flex items-center justify-center">
      <section
        className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 shadow-xl backdrop-blur"
        aria-label="Upload files"
      >
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-100">Project Upload</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Upload code/text files (and folders) from your project. The backend will log file
            contents and generate an AI summary.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div
              className={[
                "rounded-xl border p-5 transition-colors",
                isDragActive
                  ? "border-indigo-400/80 bg-indigo-400/10"
                  : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
              ].join(" ")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop upload zone"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-100">
                  ⬆
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">Drag & drop</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Drop files or a folder (where supported). Nested paths are preserved.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-zinc-400">
                  Accepted: {ACCEPTED_EXTENSIONS.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/35 p-4">
              <label className="block text-sm font-medium text-zinc-100" htmlFor="upload-files">
                Choose files
              </label>
              <input
                id="upload-files"
                type="file"
                accept={acceptedTypesAttr}
                multiple
                className="mt-2 block w-full cursor-pointer rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500/20 file:px-3 file:py-2 file:text-indigo-100 hover:file:bg-indigo-500/30"
                onChange={handleFileInput}
              />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/35 p-4">
              <label
                className="block text-sm font-medium text-zinc-100"
                htmlFor="upload-folder"
              >
                Choose a folder
              </label>
              <input
                id="upload-folder"
                type="file"
                {...webkitDirectoryProps}
                multiple
                accept={acceptedTypesAttr}
                className="mt-2 block w-full cursor-pointer rounded-md border border-zinc-800 bg-zinc-950 p-2 text-sm text-zinc-200 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500/20 file:px-3 file:py-2 file:text-indigo-100 hover:file:bg-indigo-500/30"
                onChange={handleFileInput}
              />
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/35 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-100">Selection</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {selectedCount > 0 ? `${selectedCount} files` : "No files selected"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Total size: {formatBytes(totalSizeBytes)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {files.length > 0 ? (
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/35 p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-zinc-100">Files to upload</p>
              <p className="text-xs text-zinc-400">Showing first 20</p>
            </div>

            <div className="mt-3 max-h-60 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/40">
              <ul className="divide-y divide-zinc-800">
                {topFiles.map((f, idx) => (
                  <li key={`${getDisplayPath(f)}-${idx}`} className="px-3 py-2">
                    <p className="truncate text-xs text-zinc-200">{getDisplayPath(f)}</p>
                  </li>
                ))}
                {hasMore ? (
                  <li className="px-3 py-2">
                    <p className="text-xs text-zinc-500">...and more</p>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            {files.length > 0 ? "Ready to upload." : "Pick files or a folder to begin."}
          </div>

          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={files.length === 0 || isUploading}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
              files.length === 0 || isUploading
                ? "cursor-not-allowed bg-zinc-800 text-zinc-400"
                : "bg-indigo-500/90 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            ].join(" ")}
          >
            {isUploading ? (
              <svg
                className="h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : null}
            <span>{isUploading ? "Analyzing project..." : "Upload"}</span>
          </button>
        </div>

        {status ? (
          <div
            className={[
              "mt-4 rounded-xl border p-4 text-sm",
              status.type === "success"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                : "border-red-400/30 bg-red-400/10 text-red-100"
            ].join(" ")}
            role="status"
          >
            {status.text}
          </div>
        ) : null}

        {projectSummary ? (
          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/35 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">AI Project Summary</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">
                  {projectSummary.summary}
                </p>
              </div>
            </div>

            {projectSummary.architecture ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-300">Architecture</p>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-200">
                  {projectSummary.architecture}
                </pre>
              </div>
            ) : null}

            {projectSummary.apiEndpoints.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-300">API Endpoints</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {projectSummary.apiEndpoints.map((e, i) => (
                    <span
                      key={`${e}-${i}`}
                      className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-indigo-200"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {projectSummary.techStack.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-zinc-300">Tech stack</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {projectSummary.techStack.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-indigo-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}