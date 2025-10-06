export async function api(path: string, init?: RequestInit) {
  const base = import.meta.env.VITE_API_BASE_URL;
  const auth = await (await import("./auth")).getIdToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (auth) headers.set("Authorization", `Bearer ${auth}`);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (res.status === 401) location.href = "/";
  return res;
}
