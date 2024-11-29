import { NextResponse } from "next/server";

type ScoreData = {
  matchDate: string;
  playerA: string;
  playerB: string;
  score: string;
};

const mockData: ScoreData[] = [
  {
    matchDate: "2024-01-22",
    playerA: "Player A",
    playerB: "Player B",
    score: "6-4, 3-6, 7-5",
  },
  {
    matchDate: "2024-01-23",
    playerA: "Player C",
    playerB: "Player D",
    score: "6-3, 6-4",
  },
];

export async function GET() {
  return NextResponse.json(mockData);
}
