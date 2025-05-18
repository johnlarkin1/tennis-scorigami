/**
 * Utility functions for converting UI filter values to API parameters
 */

/**
 * Converts gender/sex filter value to API parameter
 */
export function convertSexFilter(sex: string | null): string {
  if (!sex) return "all";
  return sex === "Men and Women" ? "all" : sex.toLowerCase();
}

/**
 * Converts year filter value to API parameter
 */
export function convertYearFilter(year: string | null): string {
  if (!year) return "all";
  return year === "All Years" ? "all" : year;
}

/**
 * Converts tournament filter value to API parameter
 */
export function convertTournamentFilter(tournament: string | null): string {
  if (!tournament) return "all";
  return tournament === "All Tournaments" ? "all" : tournament;
}

/**
 * Converts sets filter value to API parameter
 */
export function convertSetsFilter(sets: string | null): string {
  if (!sets) return "all";
  return sets === "All Sets" ? "all" : sets;
}
