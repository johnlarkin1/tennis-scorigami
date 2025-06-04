export type Tournament = {
  tournament_id: number;
  name: string;
  surface_type_id: number;
  country_id: number;
  event_type_id: number;
  established_year: number;
  event_type?: {
    event_type_id: number;
    event_type: string;
    event_abbr: string;
  };
};

export type TournamentGroup = {
  event_type: string;
  event_abbr: string;
  tournaments: Tournament[];
};
