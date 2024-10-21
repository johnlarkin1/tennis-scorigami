// Type for Country
type Country = {
  country_id: number;
  country_name: string;
};

// Type for Player
type Player = {
  player_id: number;
  full_name: string;
  country: Country;
};

// Type for Surface Type
type SurfaceType = {
  surface_type_id: number;
  surface_type: string;
};

// Type for Event Type
type EventType = {
  event_type_id: number;
  event_type: string;
};

// Type for Event
type Event = {
  event_id: number;
  name: string;
  location: string;
  event_start_date: string;
  event_end_date: string;
  event_year: number;
  length: number;
  surface_type: SurfaceType;
  event_type: EventType;
};

// Type for Match
type Match = {
  match_id: number;
  match_start_time: string;
  match_end_time: string;
  match_duration: string;
  external_id: string;
  event: Event;
  player_a: Player;
  player_b: Player;
  winner: Player;
};

// Type for Set Score
type SetScore = {
  set_number: number;
  player_a_score: number;
  player_b_score: number;
  tie_break_points_a?: number | null;
  tie_break_points_b?: number | null;
  match: Match;
};

// Final response type to return to the frontend
export type SetScoreResponse = SetScore[];

export type AggregatedMatchScore = {
  match_id: number;
  player_a_full_name: string;
  player_b_full_name: string;
  round_name: string;
  event_name: string;
  event_gender: string;
  event_year: number;
  player_a_scores: number[];
  player_b_scores: number[];
  match_start_time: string;
};
