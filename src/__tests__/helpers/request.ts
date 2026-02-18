import { NextRequest } from "next/server";

export function createRequest(
  path: string,
  params?: Record<string, string>
): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return new NextRequest(url);
}
