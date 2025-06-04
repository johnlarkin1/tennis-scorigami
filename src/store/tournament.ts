// src/atoms/tournament-atom.ts
import { Tournament, TournamentGroup } from "@/types/tournament";
import { atom } from "jotai";

// Atom to hold the list of tournaments fetched from the API
export const tournamentsAtom = atom<Tournament[] | null>(null);

// Atom to hold the list of tournament groups fetched from the API
export const tournamentGroupsAtom = atom<TournamentGroup[] | null>(null);

export const ALL_TOURNAMENTS_STRING = "All Tournaments";

// Atom to hold the currently selected tournament
export const defaultAllTournament: Tournament = {
  tournament_id: 0,
  name: ALL_TOURNAMENTS_STRING,
  surface_type_id: 0,
  country_id: 0,
  event_type_id: 0,
  established_year: 0,
};
export const selectedTournamentAtom = atom<Tournament>(defaultAllTournament);
