"use client";

import { FilesApi, UploadedFile } from "@/lib/api/files.api";
import {
  Download,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

type FileGroup = {
  id: string;
  deviceName: string;
  batchLabel: string;
  uploadedAt: string;
  totalSize: number;
  files: UploadedFile[];
};

function groupFiles(files: UploadedFile[]) {
  const groups = new Map<string, FileGroup>();

  for (const file of files) {
    const groupId = file.batchId
      ? `${file.deviceId ?? "unknown"}:${file.batchId}`
      : file.key;
    const deviceName =
      file.deviceName ??
      (file.deviceId ? `Device ${file.deviceId.slice(-6)}` : "Unknown device");
    const uploadedAt = file.uploadedAt ?? "";
    const existing = groups.get(groupId);

    if (existing) {
      existing.files.push(file);
      existing.totalSize += file.size ?? 0;
      if (uploadedAt > existing.uploadedAt) {
        existing.uploadedAt = uploadedAt;
      }
      continue;
    }

    groups.set(groupId, {
      id: groupId,
      deviceName,
      batchLabel: file.batchId ? file.batchId.slice(-8) : "Legacy upload",
      uploadedAt,
      totalSize: file.size ?? 0,
      files: [file],
    });
  }

  return Array.from(groups.values()).sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );
}

function formatUploadedAt(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export default function DownloadFilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState("");
  const [downloadingKey, setDownloadingKey] = useState("");
  const [downloadingZipKey, setDownloadingZipKey] = useState("");
  const [error, setError] = useState("");

  const selectedFiles = files.filter((file) => selectedKeys.includes(file.key));
  const zipFiles = selectedFiles.length > 0 ? selectedFiles : files;
  const allSelected = files.length > 0 && selectedKeys.length === files.length;
  const fileGroups = useMemo(() => groupFiles(files), [files]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const response = await FilesApi.list();
      setFiles(response.data);
      setSelectedKeys((current) =>
        current.filter((key) => response.data.some((file) => file.key === key)),
      );
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
      setSelectedKeys((current) => current.filter((key) => key !== file.key));
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

  async function downloadZip(targetFiles = zipFiles, downloadKey = "main") {
    if (!targetFiles.length) return;

    try {
      setDownloadingZipKey(downloadKey);
      setError("");
      const { blob, fileName } = await FilesApi.downloadZip(
        targetFiles.map((file) => ({
          key: file.key,
          fileName: file.fileName ?? file.key.split("/").pop(),
        })),
      );
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
      setDownloadingZipKey("");
    }
  }

  function toggleFile(key: string) {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  function toggleAll() {
    setSelectedKeys(allSelected ? [] : files.map((file) => file.key));
  }

  function toggleGroup(group: FileGroup) {
    const groupKeys = group.files.map((file) => file.key);
    const groupSelected = groupKeys.every((key) => selectedKeys.includes(key));

    setSelectedKeys((current) =>
      groupSelected
        ? current.filter((key) => !groupKeys.includes(key))
        : Array.from(new Set([...current, ...groupKeys])),
    );
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
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => downloadZip()}
            disabled={!files.length || downloadingZipKey !== ""}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {downloadingZipKey === "main" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {selectedFiles.length > 0
              ? `Download selected (${selectedFiles.length})`
              : `Download all (${files.length})`}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCcw className="h-5 w-5" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <section className="overflow-hidden rounded-lg bg-white">
        <div className="hidden grid-cols-[36px_minmax(0,1fr)_120px_170px_160px] gap-4 border-b px-4 py-3 text-sm font-semibold text-gray-600 md:grid">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            aria-label="Select all files"
            className="h-4 w-4"
          />
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
            {fileGroups.map((group) => (
              <div key={group.id}>
                <div className="flex flex-col gap-3 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={group.files.every((file) =>
                        selectedKeys.includes(file.key),
                      )}
                      onChange={() => toggleGroup(group)}
                      aria-label={`Select ${group.deviceName} upload group`}
                      className="h-4 w-4"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {group.deviceName}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {group.files.length} files, {formatBytes(group.totalSize)}
                        {group.uploadedAt
                          ? `, ${formatUploadedAt(group.uploadedAt)}`
                          : ""}
                      </span>
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => downloadZip(group.files, group.id)}
                    disabled={downloadingZipKey !== ""}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {downloadingZipKey === group.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download group
                  </button>
                </div>
                {group.files.map((file) => (
                  <div
                    key={file.key}
                    className="grid gap-3 px-4 py-3 md:grid-cols-[36px_minmax(0,1fr)_120px_170px_160px] md:items-center md:gap-4"
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(file.key)}
                      onChange={() => toggleFile(file.key)}
                      aria-label={`Select ${file.fileName ?? file.key}`}
                      className="h-4 w-4"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {file.fileName ?? file.key}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {file.key}
                      </p>
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
