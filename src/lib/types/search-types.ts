export type SearchResult = {
  id: number;
  name?: string;
  slug?: string;
};

export type SearchResponse = {
  items: SearchResult[];
};

export type Match = {
  match_id: number;
  event_name: string;
  player_a: string;
  player_b: string;
  year: number;
  start_time: string;
};
