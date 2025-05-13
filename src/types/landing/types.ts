export type MatchStat = {
  gender: "women" | "men";
  best_of: 3 | 5;
  total_possible: number;
  total_occurred: number;
  total_never_occurred: number;
  completion_pct: number;
};

export type StatCarouselProps = {
  stats: MatchStat[];
  isLoading: boolean;
  error: string | null;
};

export type StatCardProps = {
  title: string;
  stat: MatchStat;
  isActive: boolean;
};
