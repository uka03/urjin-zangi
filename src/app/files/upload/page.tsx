"use client";

import { FilesApi, UploadedFile } from "@/lib/api/files.api";
import { CheckCircle2, FileUp, Loader2, UploadCloud, X } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

function formatBytes(bytes?: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function parseError(err: unknown) {
  return err instanceof Error ? err.message : "Upload failed";
}

export default function UploadFilesPage() {
  const [selected, setSelected] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const totalSize = useMemo(
    () => selected.reduce((total, file) => total + file.size, 0),
    [selected],
  );

  function onSelect(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setSelected(Array.from(event.target.files ?? []));
  }

  async function uploadFiles() {
    if (!selected.length) return;

    try {
      setUploading(true);
      setError("");

      const results: UploadedFile[] = [];
      for (const file of selected) {
        const response = await FilesApi.upload(file);
        results.push(response.data);
      }

      setUploaded((current) => [...results, ...current]);
      setSelected([]);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Upload Files</h1>
          <p className="text-sm text-gray-600">Files are delivered through your CDN and expire after 1 day.</p>
        </div>
        <button
          type="button"
          onClick={uploadFiles}
          disabled={!selected.length || uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          {uploading ? "Uploading" : "Upload"}
        </button>
      </div>

      <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center transition hover:border-black">
        <FileUp className="mb-3 h-10 w-10 text-gray-500" />
        <span className="text-lg font-semibold">Choose files</span>
        <span className="mt-1 text-sm text-gray-500">Select one or more files from your computer.</span>
        <input className="hidden" type="file" multiple onChange={onSelect} />
      </label>

      {selected.length > 0 && (
        <section className="rounded-lg bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Selected files</h2>
            <span className="text-sm text-gray-500">
              {selected.length} files, {formatBytes(totalSize)}
            </span>
          </div>
          <div className="divide-y">
            {selected.map((file) => (
              <div key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected((current) => current.filter((item) => item !== file))}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {uploaded.length > 0 && (
        <section className="rounded-lg bg-white p-4">
          <h2 className="mb-3 font-semibold">Uploaded</h2>
          <div className="divide-y">
            {uploaded.map((file) => (
              <a
                key={file.key}
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 py-3 hover:text-gray-700"
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="min-w-0 flex-1 truncate">{file.key}</span>
                <span className="text-sm text-gray-500">{new Date(file.expiresAt).toLocaleString()}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
