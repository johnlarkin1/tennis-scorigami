// src/lib/api-client.ts
export async function fetchGraph(sets = 5, gender?: "men" | "women") {
  const params = new URLSearchParams();
  params.set("sets", sets.toString());
  if (gender) params.set("gender", gender);

  const res = await fetch(`/api/v1/graph?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch graph: ${res.statusText}`);
  return res.json();
}

export async function fetchNode(id: number, gender?: "men" | "women") {
  const params = new URLSearchParams();
  if (gender) params.set("gender", gender);

  const res = await fetch(`/api/v1/node/${id}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch node: ${res.statusText}`);
  return res.json();
}

export async function fetchMatches(
  scoreId: number,
  limit = 50,
  cursor?: string
) {
  const params = new URLSearchParams();
  params.set("scoreId", scoreId.toString());
  params.set("limit", limit.toString());
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/v1/matches?${params.toString()}`);
  const nextCursor = res.headers.get("X-Next-Cursor");
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.statusText}`);
  const data = await res.json();

  return { data, nextCursor };
}

export async function fetchFilters() {
  const res = await fetch("/api/v1/filters");
  if (!res.ok) throw new Error(`Failed to fetch filters: ${res.statusText}`);
  return res.json();
}

export async function searchScoreOrPlayer(query: string) {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`/api/v1/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to search: ${res.statusText}`);
  return res.json();
}
