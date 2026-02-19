const API_BASE = "http://localhost:8000";

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
    let errorMessage = "Something went wrong";
    try {
      const err = await res.json();
      errorMessage = err.detail || err.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
