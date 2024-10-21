export type TennisMatch = {
  id: number;
  player1: string;
  player2: string;
  set1_score: string;
  set2_score: string;
  set3_score: string;
  set4_score?: string;
  set5_score?: string;
  tournament: string;
  date: string;
};
