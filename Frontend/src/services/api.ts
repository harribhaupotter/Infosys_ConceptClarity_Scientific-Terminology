const API_BASE = "http://127.0.0.1:8000";

export async function apiRequest(
  endpoint: string,
  method: string,
  body?: any,
  token?: string
) {
  const headers: any = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
}
