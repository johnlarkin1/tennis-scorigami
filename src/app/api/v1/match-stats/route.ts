import { db } from "@/db";
import { NextResponse } from "next/server";

export type MatchStat = {
  gender: "women" | "men";
  best_of: 3 | 5;
  total_possible: number;
  total_occurred: number;
  total_never_occurred: number;
  completion_pct: number;
};

export async function GET() {
  try {
    const result = await db.execute<MatchStat>(`
      SELECT
        gender,
        best_of,
        total_possible,
        total_occurred,
        total_never_occurred,
        completion_pct
      FROM mv_match_completion
    `);

    // Convert string values to numbers
    const processedRows = result.rows.map((row) => ({
      ...row,
      best_of: Number(row.best_of),
      total_possible: Number(row.total_possible),
      total_occurred: Number(row.total_occurred),
      total_never_occurred: Number(row.total_never_occurred),
      completion_pct: Number(row.completion_pct),
    }));

    return NextResponse.json(processedRows);
  } catch (err: any) {
    console.error("🔴 match-stats error:", err);
    return NextResponse.json(
      { error: "Could not load match stats" },
      { status: 500 }
    );
  }
}
