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
};
