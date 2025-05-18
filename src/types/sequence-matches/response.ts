export interface SequenceMatch {
  match_id: number;
  event_name: string;
  event_year: number;
  player_a: string;
  player_b: string;
  player_a_id: number;
  player_b_id: number;
  winner_id: number | null;
  sex: string;
  match_start_time: string | null;
  score: string | null;
}

export interface SequenceInfo {
  id: number;
  slug: string;
  depth: number;
  best_of: number;
}

export interface SequenceMatchesResponse {
  sequence: SequenceInfo;
  matches: SequenceMatch[];
  total: number;
}
