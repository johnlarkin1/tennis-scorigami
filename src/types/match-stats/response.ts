export interface Sample {
  sequence_id: number;
  slug: string;
}

export type Gender = "men" | "women";
export type BestOf = 3 | 5;

export interface MatchStatWithSamples {
  gender: Gender;
  best_of: BestOf;
  total_possible: string;
  total_occurred: string;
  total_never_occurred: string;
  completion_pct: string;
  samples: Sample[];
}
