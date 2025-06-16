import { bad } from "@/lib/errors";
import { NextRequest } from "next/server";
import {
  getCountrySuggestions,
  getHasSuggestions,
  getNeverSuggestions,
  getPlayerSuggestions,
  getRoundSuggestions,
  getSexSuggestions,
  getSurfaceSuggestions,
  getTournamentSuggestions,
  getYearSuggestions,
} from "./helpers";

export async function GET(req: NextRequest) {
  const searchParams = new URL(req.url).searchParams;
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  if (!type) {
    return bad("type parameter is required");
  }

  try {
    switch (type) {
      case "player":
        return await getPlayerSuggestions(q, limit);

      case "tournament":
        return await getTournamentSuggestions(q, limit);

      case "country":
        return await getCountrySuggestions(q, limit);

      case "surface":
        return await getSurfaceSuggestions(q, limit);

      case "round":
        return await getRoundSuggestions(q, limit);

      case "year":
        return await getYearSuggestions(q, limit);

      case "sex":
        return getSexSuggestions();

      case "has":
        return getHasSuggestions();

      case "never":
        return getNeverSuggestions();

      default:
        return bad(`Unsupported suggestion type: ${type}`);
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return bad("Internal server error");
  }
}
