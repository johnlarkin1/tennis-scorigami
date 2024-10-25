export type InitialScore = {
  tournament_id: number;
  event_id: number;
  event_name: string;
  event_year: number;
  event_gender: string;
  player_a_scores: number;
  player_b_scores: number;
  player_a_tiebreak_points: number;
  player_b_tiebreak_points: number;
};
