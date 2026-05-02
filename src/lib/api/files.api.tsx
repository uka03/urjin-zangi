import { ApiResponse } from "@/types/api.type";

const BASE = process.env.NEXT_PUBLIC_API_URL;

export type UploadedFile = {
  key: string;
  fileName?: string;
  url: string;
  size?: number;
  uploadedAt?: string;
  expiresAt: string;
  ttlSeconds: number;
};

export const FilesApi = {
  downloadUrl(key: string) {
    return `${BASE}/files/download?key=${encodeURIComponent(key)}`;
  },

  async downloadBlob(key: string) {
    const res = await fetch(FilesApi.downloadUrl(key), {
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `Download failed: ${res.status}`;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch {}
      throw new Error(msg);
    }

    const disposition = res.headers.get("content-disposition") ?? "";
    const blob = await res.blob();

    return {
      blob,
      fileName: getFileNameFromDisposition(disposition) ?? key.split("/").pop() ?? "download",
    };
  },

  async list() {
    const res = await fetch(`${BASE}/files`, {
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `Load files failed: ${res.status}`;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return (await res.json()) as ApiResponse<UploadedFile[]>;
  },

  async remove(key: string) {
    const res = await fetch(`${BASE}/files?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `Delete failed: ${res.status}`;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return (await res.json()) as ApiResponse<{ key: string }>;
  },

  async upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    console.log("Uploading file:", file.name, file.size);
    console.log(`${BASE}/files`);

    const res = await fetch(`${BASE}/files`, {
      method: "POST",
      body,
      cache: "no-store",
    });

    if (!res.ok) {
      let msg = `Upload failed: ${res.status}`;
      try {
        const data = await res.json();
        msg = data.message || data.error || msg;
      } catch {}
      throw new Error(msg);
    }

    return (await res.json()) as ApiResponse<UploadedFile>;
  },

  uploadWithProgress(
    file: File,
    onProgress: (progress: { loaded: number; total: number }) => void,
  ) {
    const body = new FormData();
    body.set("file", file);

    return new Promise<ApiResponse<UploadedFile>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        onProgress({ loaded: event.loaded, total: event.total });
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as ApiResponse<UploadedFile>);
          } catch {
            reject(new Error("Upload response was not valid JSON"));
          }
          return;
        }

        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.message || data.error || `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error while uploading"));
      xhr.onabort = () => reject(new Error("Upload cancelled"));
      xhr.open("POST", `${BASE}/files`);
      xhr.send(body);
    });
  },
};

function getFileNameFromDisposition(disposition: string) {
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = disposition.match(/filename="([^"]+)"/i);
  return asciiMatch?.[1];
}
