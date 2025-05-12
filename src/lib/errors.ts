import { NextResponse } from "next/server";

export const bad = (msg: string, code = 400) =>
  NextResponse.json({ error: msg }, { status: code });
