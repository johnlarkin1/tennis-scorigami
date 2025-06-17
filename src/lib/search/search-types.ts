import { KeywordType } from "./search-parser";

// Map of singular search types to their data key names
export const SEARCH_TYPE_DATA_KEYS: Record<KeywordType, keyof SearchDataKeys> =
  {
    player: "player",
    opponent: "player", // opponent uses player data
    tournament: "tournament",
    country: "country",
    surface: "surface",
    round: "round",
    year: "year",
    sex: "sex",
    has: "has",
    never: "never",
    score: "score",
    location: "location",
  };

// Data structure keys (all singular)
export interface SearchDataKeys {
  player: Array<{
    id: number;
    name: string;
    value: string;
    country: number;
    sex: string;
  }>;
  tournament: Array<{
    id: number;
    name: string;
    value: string;
    surface_type_id: number;
    country_id: number;
  }>;
  country: Array<{
    id: number;
    name: string;
    value: string;
    code: string;
    continent: string;
  }>;
  surface: Array<{ id: number | string; name: string; value: string }>;
  round: Array<{ id: number | string; name: string; value: string }>;
  year: Array<{ id: number | string; name: string; value: string }>;
  sex: Array<{ id: string; name: string; value: string }>;
  has: Array<{ id: string; name: string; value: string }>;
  never: Array<{ id: string; name: string; value: string }>;
  score?: Array<{ id: number | string; name: string; value: string }>;
  location?: Array<{ id: number | string; name: string; value: string }>;
}

// Helper to get data key from keyword type
export function getDataKeyForKeywordType(
  keywordType: KeywordType
): keyof SearchDataKeys {
  return SEARCH_TYPE_DATA_KEYS[keywordType];
}
