import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple query to test if the schema is properly organized
    const tournaments = await db.query.tournament.findMany({
      limit: 5,
      with: {
        events: {
          limit: 3,
        },
      },
    });

    return NextResponse.json({
      message: "Drizzle schema organization is working correctly!",
      data: tournaments,
    });
  } catch (error: any) {
    console.error("Error testing Drizzle schema:", error);
    return NextResponse.json(
      {
        error: error.message,
        message: "There was an error with the Drizzle schema organization.",
      },
      { status: 500 }
    );
  }
}
