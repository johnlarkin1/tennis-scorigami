export type MatchData = {
  // Basic match info
  match_id: number;
  score_id: number;
  event_id: number;

  // Event details
  event_name: string;
  year: number;
  gender: "M" | "F";
  location?: string | null;
  draw_size?: number | null;
  prize_money?: number | null;
  event_start_date?: string | null;
  event_end_date?: string | null;

  // Tournament info
  tournament_id?: number | null;
  tournament_name?: string | null;
  surface_type?: string | null;
  established_year?: number | null;

  // Match details
  match_duration?: number | null;
  match_start_time?: string | null;
  match_end_time?: string | null;
  best_of?: number | null;
  score?: string | null;
  round_id?: number | null;
  round_name?: string | null;
  round_abbr?: string | null;

  // Player A details
  player_a_id: number;
  player_a_name: string;
  player_a_first_name?: string | null;
  player_a_last_name?: string | null;
  player_a_country_id?: number | null;
  player_a_country_code?: string | null;
  player_a_country_name?: string | null;
  player_a_date_of_birth?: string | null;
  player_a_handedness?: string | null;
  player_a_height_cm?: number | null;
  player_a_weight_kg?: number | null;

  // Player B details
  player_b_id: number;
  player_b_name: string;
  player_b_first_name?: string | null;
  player_b_last_name?: string | null;
  player_b_country_id?: number | null;
  player_b_country_code?: string | null;
  player_b_country_name?: string | null;
  player_b_date_of_birth?: string | null;
  player_b_handedness?: string | null;
  player_b_height_cm?: number | null;
  player_b_weight_kg?: number | null;

  // Winner/Loser info
  winner_id?: number | null;
  loser_id?: number | null;

  // Legacy/backward compatibility fields
  player_a_country?: string;
  player_b_country?: string;
  player_a_seed?: number;
  player_b_seed?: number;
  player_a_ranking?: number;
  player_b_ranking?: number;
  player_a_age?: number;
  player_b_age?: number;
  raw_score?: string;
  sets?: string[];
  duration_minutes?: number;
  is_retirement?: boolean;
  is_scorigami?: boolean;
  rarity_rank?: number;
  occurrence_count?: number;
};

export type SearchResult = {
  id: number;
  name?: string;
  slug?: string;
  match_data?: MatchData;
};

export type SearchResponse = {
  type: string;
  query: string;
  count: number;
  items: SearchResult[];
  filters?: unknown[]; // For debugging
};

export type Match = {
  match_id: number;
  event_name: string;
  player_a: string;
  player_b: string;
  year: number;
  start_time: string;
};
