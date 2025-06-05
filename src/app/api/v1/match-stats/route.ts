import { db } from "@/db";
import { mvMatchWithSamples } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        gender: mvMatchWithSamples.gender,
        best_of: mvMatchWithSamples.bestOf,
        total_possible: mvMatchWithSamples.totalPossible,
        total_occurred: mvMatchWithSamples.totalOccurred,
        total_never_occurred: mvMatchWithSamples.totalNeverOccurred,
        completion_pct: mvMatchWithSamples.completionPct,
        samples: mvMatchWithSamples.samples,
      })
      .from(mvMatchWithSamples)
      .where(
        not(
          and(
            eq(mvMatchWithSamples.gender, "women"),
            eq(mvMatchWithSamples.bestOf, 5)
          )!
        )
      );

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("🔴 match-stats error:", err);
    return NextResponse.json(
      { error: "Could not load match stats with samples" },
      { status: 500 }
    );
  }
}
