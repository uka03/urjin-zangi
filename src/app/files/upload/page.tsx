"use client";

import { FilesApi, UploadedFile } from "@/lib/api/files.api";
import {
  CheckCircle2,
  FileUp,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";

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

function parseError(err: unknown) {
  return err instanceof Error ? err.message : "Файл хуулахад алдаа гарлаа";
}

export default function UploadFilesPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [activeName, setActiveName] = useState("");
  const [completedBytes, setCompletedBytes] = useState(0);
  const [activeLoadedBytes, setActiveLoadedBytes] = useState(0);

  const totalSize = useMemo(
    () => selected.reduce((total, file) => total + file.size, 0),
    [selected],
  );

  const progress =
    totalSize > 0
      ? Math.min(
          100,
          Math.round(((completedBytes + activeLoadedBytes) / totalSize) * 100),
        )
      : 0;

  function onSelect(event: ChangeEvent<HTMLInputElement>) {
    setError("");
    setCompletedBytes(0);
    setActiveLoadedBytes(0);
    setActiveName("");
    setSelected(Array.from(event.target.files ?? []));
  }

  function removeSelected(file: File) {
    setSelected((current) => current.filter((item) => item !== file));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadFiles() {
    if (!selected.length) return;

    try {
      setUploading(true);
      setError("");
      setCompletedBytes(0);
      setActiveLoadedBytes(0);

      const results: UploadedFile[] = [];
      let uploadedBytes = 0;
      for (const file of selected) {
        setActiveName(file.name);
        setActiveLoadedBytes(0);
        const response = await FilesApi.uploadWithProgress(
          file,
          ({ loaded }) => {
            setActiveLoadedBytes(loaded);
          },
        );
        results.push(response.data);
        uploadedBytes += file.size;
        setCompletedBytes(uploadedBytes);
        setActiveLoadedBytes(0);
      }

      setUploaded((current) => [...results, ...current]);
      setSelected([]);
      setActiveName("");
      setCompletedBytes(0);
      setActiveLoadedBytes(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:gap-6">
        <header className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/log.jpg"
              alt="Urjin Zangi"
              width={56}
              height={56}
              className="h-12 w-12 rounded-lg object-cover"
              priority
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">Urjin Zangi</p>
              <p className="text-sm text-gray-500">Файл хадгалах систем</p>
            </div>
          </div>
          <p className="hidden text-sm font-medium text-gray-600 sm:block">
            Made by Urjin Zangi LLC
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-lg bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-1">
            <h1 className="text-2xl font-bold sm:text-3xl">Файл хуулах</h1>
            <p className="mt-1 text-sm text-gray-600">
              Олон файл зэрэг сонгож хуулна. Файлууд R2/CDN-ээр дамжин хүрнэ
              бөгөөд 1 өдрийн дараа автоматаар устгагдана.
            </p>
          </div>

          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:border-black sm:min-h-72">
            <FileUp className="mb-3 h-12 w-12 text-gray-500" />
            <span className="text-lg font-semibold">Файл сонгох</span>
            <span className="mt-1 max-w-xs text-sm text-gray-500">
              Гар утсан дээр энд дарна уу. Компьютер дээр файлаа чирж оруулж
              болно.
            </span>
            <input
              ref={inputRef}
              className="hidden"
              type="file"
              multiple
              onChange={onSelect}
            />
          </label>
          <button
            type="button"
            onClick={uploadFiles}
            disabled={!selected.length || uploading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
            {uploading
              ? "Хуулж байна"
              : `Хуулах${selected.length ? ` (${selected.length})` : ""}`}
          </button>
          {uploading && (
            <div className="mt-5 rounded-lg bg-gray-100 p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-gray-700">
                  {activeName}
                </span>
                <span className="shrink-0 font-medium">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{formatBytes(completedBytes + activeLoadedBytes)}</span>
                <span>{formatBytes(totalSize)}</span>
              </div>
            </div>
          )}
        </section>

        {selected.length > 0 && (
          <section className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">Selected files</h2>
              <span className="text-sm text-gray-500">
                {selected.length} файл, {formatBytes(totalSize)}
              </span>
            </div>
            <div className="divide-y">
              {selected.map((file) => (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelected(file)}
                    disabled={uploading}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black disabled:opacity-50"
                    aria-label={`${file.name} файлыг хасах`}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {uploaded.length > 0 && (
          <section className="rounded-lg bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 font-semibold">Хуулсан файлууд</h2>
            <div className="divide-y">
              {uploaded.map((file) => (
                <a
                  key={file.key}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 py-3 hover:text-gray-700"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  <span className="min-w-0 flex-1 truncate">
                    {file.fileName ?? file.key}
                  </span>
                  <span className="hidden text-sm text-gray-500 sm:inline">
                    {new Date(file.expiresAt).toLocaleString()}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        <footer className="pb-3 text-center text-sm font-medium text-gray-500 sm:hidden">
          Made by Urjin Zangi LLC
        </footer>
      </div>
    </main>
  );
}
