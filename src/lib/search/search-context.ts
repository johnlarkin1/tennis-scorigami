// Search context for maintaining name-to-ID mappings
export class SearchMappingContext {
  private static playerNameToId = new Map<string, number>();
  private static tournamentNameToId = new Map<string, number>();
  private static countryNameToId = new Map<string, number>();
  private static surfaceNameToId = new Map<string, number>();
  private static roundNameToId = new Map<string, number>();

  static setPlayerMapping(name: string, id: number) {
    this.playerNameToId.set(name.toLowerCase(), id);
  }

  static setTournamentMapping(name: string, id: number) {
    this.tournamentNameToId.set(name.toLowerCase(), id);
  }

  static setCountryMapping(name: string, id: number) {
    this.countryNameToId.set(name.toLowerCase(), id);
  }

  static setSurfaceMapping(name: string, id: number) {
    this.surfaceNameToId.set(name.toLowerCase(), id);
  }

  static setRoundMapping(name: string, id: number) {
    this.roundNameToId.set(name.toLowerCase(), id);
  }

  static getPlayerId(name: string): number | null {
    return this.playerNameToId.get(name.toLowerCase()) || null;
  }

  static getTournamentId(name: string): number | null {
    return this.tournamentNameToId.get(name.toLowerCase()) || null;
  }

  static getCountryId(name: string): number | null {
    return this.countryNameToId.get(name.toLowerCase()) || null;
  }

  static getSurfaceId(name: string): number | null {
    return this.surfaceNameToId.get(name.toLowerCase()) || null;
  }

  static getRoundId(name: string): number | null {
    return this.roundNameToId.get(name.toLowerCase()) || null;
  }

  static loadMappingsFromData(data: {
    players?: Array<{ id: number; name: string; value: string }>;
    tournaments?: Array<{ id: number; name: string; value: string }>;
    countries?: Array<{ id: number; name: string; value: string }>;
    surfaces?: Array<{ id: number; name: string; value: string }>;
    rounds?: Array<{ id: number; name: string; value: string }>;
    years?: Array<{ id: number; name: string; value: string }>;
  }) {
    // Load player mappings
    if (data.players) {
      data.players.forEach((player) => {
        this.setPlayerMapping(player.name, player.id);
      });
    }

    // Load tournament mappings
    if (data.tournaments) {
      data.tournaments.forEach((tournament) => {
        this.setTournamentMapping(tournament.name, tournament.id);
      });
    }

    // Load country mappings
    if (data.countries) {
      data.countries.forEach((country) => {
        this.setCountryMapping(country.name, country.id);
      });
    }

    // Load surface mappings
    if (data.surfaces) {
      data.surfaces.forEach((surface) => {
        this.setSurfaceMapping(surface.name, surface.id);
      });
    }

    // Load round mappings
    if (data.rounds) {
      data.rounds.forEach((round) => {
        this.setRoundMapping(round.name, round.id);
      });
    }
  }

  static clear() {
    this.playerNameToId.clear();
    this.tournamentNameToId.clear();
    this.countryNameToId.clear();
    this.surfaceNameToId.clear();
    this.roundNameToId.clear();
  }
}
