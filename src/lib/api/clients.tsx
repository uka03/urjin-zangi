const BASE = process.env.NEXT_PUBLIC_API_URL;

type ApiError = { message?: string; error?: string; statusCode?: number };

export async function api<T>(path: string, init: RequestInit = {}) {
  console.log("API BASE:", `${BASE}${path}`);

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.log(res);
    let msg = `Request failed: ${res.status}`;
    try {
      const data = (await res.json()) as ApiError;
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  console.log(res);

  return (await res.json()) as T;
}

export function qs(params: Record<string, any>) {
  const s = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    s.set(k, String(v));
  });
  const out = s.toString();
  return out ? `?${out}` : "";
}
