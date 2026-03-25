"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  readUploadedProjectSummary,
  writeUploadedProjectSummary,
  type UploadedProjectSummary
} from "@/lib/uploadedProjectStorage";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FolderUp, CheckCircle2, AlertCircle, Loader2, FileCode2, Sparkles } from "lucide-react";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pt-8 pb-12 flex justify-center"
    >
      <section
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        aria-label="Upload files"
      >
        <header className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <FolderUp className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Project Upload</h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload code or folders from your project. The backend will log file
              contents and generate an AI summary.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <div
              className={[
                "h-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300",
                isDragActive
                  ? "border-indigo-400 bg-indigo-500/10 scale-[1.02]"
                  : "border-white/10 bg-black/20 hover:border-indigo-500/50 hover:bg-white/5"
              ].join(" ")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop upload zone"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 mb-4 group-hover:bg-indigo-500/30 transition-colors">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-lg font-medium text-slate-200">Drag & drop files or folders here</p>
              <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
                Accepted: {ACCEPTED_EXTENSIONS.join(", ")}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Choose files
              </label>
              <input
                type="file"
                accept={acceptedTypesAttr}
                multiple
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:transition-colors cursor-pointer"
                onChange={handleFileInput}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Choose a folder
              </label>
              <input
                type="file"
                {...webkitDirectoryProps}
                multiple
                accept={acceptedTypesAttr}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 file:transition-colors cursor-pointer"
                onChange={handleFileInput}
              />
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-200">Selection</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-400">
                    {selectedCount > 0 ? selectedCount : "0"} <span className="text-sm font-medium text-indigo-300 opacity-80">files</span>
                  </p>
                  <p className="mt-1 text-xs text-indigo-300/70">
                    Total size: {formatBytes(totalSizeBytes)}
                  </p>
                </div>
                <FileCode2 className="w-8 h-8 text-indigo-400/50" />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 rounded-2xl border border-white/10 bg-black/20 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                <p className="text-sm font-semibold text-slate-200">Files to upload</p>
                <p className="text-xs text-slate-400">Showing first 20</p>
              </div>

              <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <ul className="space-y-1 text-sm">
                  {topFiles.map((f, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${getDisplayPath(f)}-${idx}`} 
                      className="px-3 py-2 rounded-lg bg-white/5 text-slate-300 truncate"
                    >
                      {getDisplayPath(f)}
                    </motion.li>
                  ))}
                  {hasMore && (
                    <li className="px-3 py-2 text-slate-500 italic text-xs">...and more</li>
                  )}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-white/10">
          <div className="text-sm text-slate-400 font-medium">
            {files.length > 0 ? "Ready to upload." : "Pick files or a folder to begin."}
          </div>

          <button
            type="button"
            onClick={() => void handleUpload()}
            disabled={files.length === 0 || isUploading}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-300 shadow-lg",
              files.length === 0 || isUploading
                ? "cursor-not-allowed bg-white/5 text-slate-500 shadow-none border border-white/5"
                : "bg-indigo-500 text-white shadow-indigo-500/25 hover:bg-indigo-600 hover:scale-[1.02] hover:shadow-indigo-500/40"
            ].join(" ")}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                Analyzing project...
              </>
            ) : "Upload and Analyze"}
          </button>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={[
                "mt-6 rounded-xl flex items-start gap-3 p-4 text-sm font-medium",
                status.type === "success"
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border border-red-500/20 bg-red-500/10 text-red-300"
              ].join(" ")}
              role="status"
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              {status.text}
            </motion.div>
          )}

          {projectSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-md"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Project Summary
                </h2>
                <p className="mt-3 leading-relaxed text-sm text-slate-300">
                  {projectSummary.summary}
                </p>
              </div>

              {projectSummary.architecture && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Architecture</p>
                  <pre className="max-h-56 overflow-auto scrollbar-thin scrollbar-thumb-white/10 whitespace-pre-wrap rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300 leading-relaxed font-mono">
                    {projectSummary.architecture}
                  </pre>
                </div>
              )}

              {projectSummary.apiEndpoints.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">API Endpoints</p>
                  <div className="flex flex-wrap gap-2">
                    {projectSummary.apiEndpoints.map((e, i) => (
                      <span
                        key={`${e}-${i}`}
                        className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {projectSummary.techStack.length > 0 && (
                <div className="mt-6 flex flex-col">
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Tech stack</p>
                  <div className="flex flex-wrap gap-2">
                    {projectSummary.techStack.map((t, i) => (
                      <span
                        key={`${t}-${i}`}
                        className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}