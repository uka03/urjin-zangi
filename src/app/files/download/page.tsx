"use client";

import { FilesApi, UploadedFile } from "@/lib/api/files.api";
import {
  Download,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

function formatBytes(bytes?: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatRemaining(seconds: number) {
  if (seconds <= 0) return "Expired";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function parseError(err: unknown) {
  return err instanceof Error ? err.message : "Could not load files";
}

export default function DownloadFilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState("");
  const [downloadingKey, setDownloadingKey] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const response = await FilesApi.list();
      setFiles(response.data);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeFile(file: UploadedFile) {
    try {
      setDeletingKey(file.key);
      setError("");
      await FilesApi.remove(file.key);
      setFiles((current) => current.filter((item) => item.key !== file.key));
    } catch (err) {
      setError(parseError(err));
    } finally {
      setDeletingKey("");
    }
  }

  async function downloadFile(file: UploadedFile) {
    try {
      setDownloadingKey(file.key);
      setError("");
      const { blob, fileName } = await FilesApi.downloadBlob(file.key);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setDownloadingKey("");
    }
  }

  return (
    <main className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Download Files</h1>
          <p className="text-sm text-gray-600">
            Only files still present in R2 are shown here.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCcw className="h-5 w-5" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="overflow-hidden rounded-lg bg-white">
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_170px_160px] gap-4 border-b px-4 py-3 text-sm font-semibold text-gray-600 md:grid">
          <span>File</span>
          <span>Size</span>
          <span>Expires</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-4 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading files
          </div>
        ) : files.length === 0 ? (
          <p className="p-4 text-gray-600">No uploaded files found.</p>
        ) : (
          <div className="divide-y">
            {files.map((file) => (
              <div
                key={file.key}
                className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_120px_170px_160px] md:items-center md:gap-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {file.fileName ?? file.key}
                  </p>
                  <p className="truncate text-sm text-gray-500">{file.key}</p>
                </div>
                <span className="text-sm text-gray-600">
                  {formatBytes(file.size)}
                </span>
                <span className="text-sm text-gray-600">
                  {formatRemaining(file.ttlSeconds)}
                </span>
                <div className="flex justify-start gap-2 md:justify-end">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 hover:bg-gray-100"
                    aria-label={`Open ${file.fileName ?? file.key}`}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    disabled={downloadingKey === file.key}
                    className="rounded-lg p-2 hover:bg-gray-100"
                    aria-label={`Download ${file.fileName ?? file.key}`}
                  >
                    {downloadingKey === file.key ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(file)}
                    disabled={deletingKey === file.key}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Delete ${file.fileName ?? file.key}`}
                  >
                    {deletingKey === file.key ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
