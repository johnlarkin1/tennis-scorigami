import { db } from "@/db";
import { matchRound, player, surfaceType, tournament } from "@/db/schema";
import { ilike } from "drizzle-orm";
import { SearchMappingContext } from "./search-context";
import { KeywordFilter, KeywordType } from "./search-parser";

export interface MappedSearchFilter {
  type: KeywordType;
  field: string;
  value: string | number | number[] | boolean;
  operator: "equals" | "ilike" | "in" | "between" | "regex";
  originalValue: string;
}

export class SearchMapper {
  private static playerCache = new Map<string, number>();
  private static tournamentCache = new Map<string, number>();
  private static surfaceCache = new Map<string, number>();
  private static roundCache = new Map<string, number>();

  static async mapKeywordFilters(
    keywords: KeywordFilter[]
  ): Promise<MappedSearchFilter[]> {
    const mappedFilters: MappedSearchFilter[] = [];

    // Check for player vs opponent combination
    const playerFilter = keywords.find((k) => k.type === "player");
    const opponentFilter = keywords.find((k) => k.type === "opponent");

    if (playerFilter && opponentFilter) {
      // Handle player vs opponent combination specially
      const combinedFilter = await this.mapPlayerVsOpponent(
        playerFilter,
        opponentFilter
      );
      if (combinedFilter) {
        mappedFilters.push(combinedFilter);
      }

      // Process all other keywords except player and opponent
      for (const keyword of keywords) {
        if (keyword.type !== "player" && keyword.type !== "opponent") {
          const mapped = await this.mapSingleKeyword(keyword);
          if (mapped) {
            mappedFilters.push(mapped);
          }
        }
      }
    } else {
      // Normal processing when we don't have both player and opponent
      for (const keyword of keywords) {
        const mapped = await this.mapSingleKeyword(keyword);
        if (mapped) {
          mappedFilters.push(mapped);
        }
      }
    }

    return mappedFilters;
  }

  private static async mapPlayerVsOpponent(
    playerFilter: KeywordFilter,
    opponentFilter: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    try {
      // Extract player ID
      let playerId: number | null = null;
      if (playerFilter.id !== undefined) {
        playerId =
          typeof playerFilter.id === "string"
            ? parseInt(playerFilter.id)
            : playerFilter.id;
      } else {
        // Try to resolve player name to ID
        const playerMapping = await this.resolvePlayerId(playerFilter);
        playerId = playerMapping;
      }

      // Extract opponent ID
      let opponentId: number | null = null;
      if (opponentFilter.id !== undefined) {
        opponentId =
          typeof opponentFilter.id === "string"
            ? parseInt(opponentFilter.id)
            : opponentFilter.id;
      } else {
        // Try to resolve opponent name to ID
        const opponentMapping = await this.resolvePlayerId(opponentFilter);
        opponentId = opponentMapping;
      }

      if (playerId && opponentId) {
        // Both players have IDs - create combined filter
        return {
          type: "player" as KeywordType,
          field: "playerVsOpponent",
          value: [playerId, opponentId],
          operator: "equals",
          originalValue: `${playerFilter.rawValue} ${opponentFilter.rawValue}`,
        };
      }

      // If we can't resolve both to IDs, fall back to separate processing
      console.warn(
        "Could not resolve both player and opponent to IDs, falling back to separate filters"
      );
      return null;
    } catch (error) {
      console.error("Error mapping player vs opponent:", error);
      return null;
    }
  }

  private static async resolvePlayerId(
    playerFilter: KeywordFilter
  ): Promise<number | null> {
    // Check cache first
    const cacheKey = playerFilter.value.toLowerCase();
    const cachedPlayerId = this.playerCache.get(cacheKey);
    if (cachedPlayerId !== undefined) {
      return cachedPlayerId;
    }

    // If it's a numeric ID, use it directly
    if (/^\d+$/.test(playerFilter.value)) {
      const playerId = parseInt(playerFilter.value);
      this.playerCache.set(cacheKey, playerId);
      return playerId;
    }

    // Check search context for name-to-ID mapping
    const playerId = SearchMappingContext.getPlayerId(playerFilter.value);
    if (playerId) {
      this.playerCache.set(cacheKey, playerId);
      return playerId;
    }

    // Search by name in database
    const players = await db
      .select({ id: player.player_id, name: player.full_name })
      .from(player)
      .where(ilike(player.full_name, `%${playerFilter.value}%`))
      .limit(1)
      .execute();

    if (players.length > 0) {
      this.playerCache.set(cacheKey, players[0].id);
      return players[0].id;
    }

    return null;
  }

  private static async mapSingleKeyword(
    keyword: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    switch (keyword.type) {
      case "player":
      case "opponent":
        return await this.mapPlayer(keyword);

      case "tournament":
        return await this.mapTournament(keyword);

      case "surface":
        return await this.mapSurface(keyword);

      case "round":
        return await this.mapRound(keyword);

      case "year":
        return this.mapYear(keyword);

      case "sex":
        return this.mapSex(keyword);

      case "score":
        return this.mapScore(keyword);

      case "status":
        return this.mapStatus(keyword);

      default:
        return null;
    }
  }

  private static async mapPlayer(
    keyword: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    try {
      // If we have a parsed ID from the frontend, use it directly (highest priority)
      if (keyword.id !== undefined) {
        const playerId =
          typeof keyword.id === "string" ? parseInt(keyword.id) : keyword.id;
        return {
          type: keyword.type,
          field: keyword.type === "player" ? "playerEitherId" : "playerBId", // Use special field for "either player" search
          value: playerId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // Check cache first
      const cacheKey = keyword.value.toLowerCase();
      const cachedPlayerId = this.playerCache.get(cacheKey);
      if (cachedPlayerId !== undefined) {
        return {
          type: keyword.type,
          field: keyword.type === "player" ? "playerEitherId" : "playerBId",
          value: cachedPlayerId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // If it's a numeric ID, use it directly
      if (/^\d+$/.test(keyword.value)) {
        const playerId = parseInt(keyword.value);
        this.playerCache.set(cacheKey, playerId);
        return {
          type: keyword.type,
          field: keyword.type === "player" ? "playerEitherId" : "playerBId",
          value: playerId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // Check search context for name-to-ID mapping (from frontend suggestions)
      const playerId = SearchMappingContext.getPlayerId(keyword.value);
      if (playerId) {
        this.playerCache.set(cacheKey, playerId);
        return {
          type: keyword.type,
          field: keyword.type === "player" ? "playerEitherId" : "playerBId",
          value: playerId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // Search by name (fallback for manual entry)
      const players = await db
        .select({ id: player.player_id, name: player.full_name })
        .from(player)
        .where(ilike(player.full_name, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (players.length > 0) {
        this.playerCache.set(cacheKey, players[0].id);
        return {
          type: keyword.type,
          field: keyword.type === "player" ? "playerEitherId" : "playerBId",
          value: players[0].id,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // If no exact match, return ILIKE search on name fields
      return {
        type: keyword.type,
        field: keyword.type === "player" ? "playerEitherName" : "playerBName",
        value: `%${keyword.value}%`,
        operator: "ilike",
        originalValue: keyword.rawValue,
      };
    } catch (error) {
      console.error("Error mapping player:", error);
      return null;
    }
  }

  private static async mapTournament(
    keyword: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    try {
      // If we have a parsed ID from the frontend, use it directly (highest priority)
      if (keyword.id !== undefined) {
        const tournamentId =
          typeof keyword.id === "string" ? parseInt(keyword.id) : keyword.id;
        return {
          type: keyword.type,
          field: "tournamentId", // Use tournamentId field for exact ID matches
          value: tournamentId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const cacheKey = keyword.value.toLowerCase();
      const cachedTournamentId = this.tournamentCache.get(cacheKey);
      if (cachedTournamentId !== undefined) {
        return {
          type: keyword.type,
          field: "tournamentId",
          value: cachedTournamentId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const tournamentId = parseInt(keyword.value);
        this.tournamentCache.set(cacheKey, tournamentId);
        return {
          type: keyword.type,
          field: "tournamentId",
          value: tournamentId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      // Check search context for name-to-ID mapping
      const tournamentId = SearchMappingContext.getTournamentId(keyword.value);
      if (tournamentId) {
        this.tournamentCache.set(cacheKey, tournamentId);
        return {
          type: keyword.type,
          field: "tournamentId",
          value: tournamentId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const tournaments = await db
        .select({ id: tournament.tournament_id, name: tournament.name })
        .from(tournament)
        .where(ilike(tournament.name, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (tournaments.length > 0) {
        this.tournamentCache.set(cacheKey, tournaments[0].id);
        return {
          type: keyword.type,
          field: "tournamentId",
          value: tournaments[0].id,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      return {
        type: keyword.type,
        field: "tournamentName",
        value: `%${keyword.value}%`,
        operator: "ilike",
        originalValue: keyword.rawValue,
      };
    } catch (error) {
      console.error("Error mapping tournament:", error);
      return null;
    }
  }

  private static async mapSurface(
    keyword: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    try {
      // If we have a parsed ID from the frontend, use it directly (highest priority)
      if (keyword.id !== undefined) {
        const surfaceId =
          typeof keyword.id === "string" ? parseInt(keyword.id) : keyword.id;
        return {
          type: keyword.type,
          field: "surface_type_id",
          value: surfaceId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const cacheKey = keyword.value.toLowerCase();
      const cachedSurfaceId = this.surfaceCache.get(cacheKey);
      if (cachedSurfaceId !== undefined) {
        return {
          type: keyword.type,
          field: "surface_type_id",
          value: cachedSurfaceId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const surfaceId = parseInt(keyword.value);
        this.surfaceCache.set(cacheKey, surfaceId);
        return {
          type: keyword.type,
          field: "surface_type_id",
          value: surfaceId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const surfaces = await db
        .select({
          id: surfaceType.surface_type_id,
          name: surfaceType.surface_type,
        })
        .from(surfaceType)
        .where(ilike(surfaceType.surface_type, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (surfaces.length > 0) {
        this.surfaceCache.set(cacheKey, surfaces[0].id);
        return {
          type: keyword.type,
          field: "surface_type_id",
          value: surfaces[0].id,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      return {
        type: keyword.type,
        field: "surface_type.surface_type",
        value: `%${keyword.value}%`,
        operator: "ilike",
        originalValue: keyword.rawValue,
      };
    } catch (error) {
      console.error("Error mapping surface:", error);
      return null;
    }
  }

  private static async mapRound(
    keyword: KeywordFilter
  ): Promise<MappedSearchFilter | null> {
    try {
      // If we have a parsed ID from the frontend, use it directly (highest priority)
      if (keyword.id !== undefined) {
        const roundId =
          typeof keyword.id === "string" ? parseInt(keyword.id) : keyword.id;
        return {
          type: keyword.type,
          field: "round_id",
          value: roundId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const cacheKey = keyword.value.toLowerCase();
      const cachedRoundId = this.roundCache.get(cacheKey);
      if (cachedRoundId !== undefined) {
        return {
          type: keyword.type,
          field: "round_id",
          value: cachedRoundId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const roundId = parseInt(keyword.value);
        this.roundCache.set(cacheKey, roundId);
        return {
          type: keyword.type,
          field: "round_id",
          value: roundId,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      const rounds = await db
        .select({ id: matchRound.round_id, name: matchRound.round_name })
        .from(matchRound)
        .where(ilike(matchRound.round_name, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (rounds.length > 0) {
        this.roundCache.set(cacheKey, rounds[0].id);
        return {
          type: keyword.type,
          field: "round_id",
          value: rounds[0].id,
          operator: "equals",
          originalValue: keyword.rawValue,
        };
      }

      return {
        type: keyword.type,
        field: "match_round.round_name",
        value: `%${keyword.value}%`,
        operator: "ilike",
        originalValue: keyword.rawValue,
      };
    } catch (error) {
      console.error("Error mapping round:", error);
      return null;
    }
  }

  private static mapYear(keyword: KeywordFilter): MappedSearchFilter | null {
    if (keyword.operator === "range") {
      const [startYear, endYear] = keyword.value.split(",").map(Number);
      return {
        type: keyword.type,
        field: "year",
        value: [startYear, endYear],
        operator: "between",
        originalValue: keyword.rawValue,
      };
    }

    const year = parseInt(keyword.value);
    if (isNaN(year)) return null;

    return {
      type: keyword.type,
      field: "year",
      value: year,
      operator: "equals",
      originalValue: keyword.rawValue,
    };
  }

  private static mapSex(keyword: KeywordFilter): MappedSearchFilter | null {
    let sex: string;

    // If we have a parsed ID from the frontend (e.g., #F:Women's), use the ID
    if (keyword.id !== undefined) {
      sex = keyword.id.toString().toUpperCase();
    } else {
      // Handle direct value format (e.g., sex:F or sex:Women's)
      const value = keyword.value.toUpperCase();
      if (value === "M" || value === "F") {
        sex = value;
      } else if (value.includes("MEN") || value.includes("MALE")) {
        sex = "M";
      } else if (value.includes("WOMEN") || value.includes("FEMALE")) {
        sex = "F";
      } else {
        return null;
      }
    }

    if (sex !== "M" && sex !== "F") return null;

    return {
      type: keyword.type,
      field: "sex",
      value: sex,
      operator: "equals",
      originalValue: keyword.rawValue,
    };
  }

  private static mapScore(keyword: KeywordFilter): MappedSearchFilter | null {
    if (keyword.operator === "regex") {
      return {
        type: keyword.type,
        field: "score",
        value: keyword.value,
        operator: "regex",
        originalValue: keyword.rawValue,
      };
    }

    return {
      type: keyword.type,
      field: "score",
      value: `%${keyword.value}%`,
      operator: "ilike",
      originalValue: keyword.rawValue,
    };
  }

  private static mapStatus(keyword: KeywordFilter): MappedSearchFilter | null {
    const value = keyword.value.toLowerCase();

    // Map status values to boolean backend values
    if (value === "complete") {
      // complete = true (exclude RET/W/O)
      return {
        type: keyword.type,
        field: "status",
        value: keyword.value,
        operator: "equals",
        originalValue: keyword.rawValue,
      };
    } else if (value === "incomplete") {
      // incomplete = false (include only RET/W/O)
      return {
        type: keyword.type,
        field: "status",
        value: keyword.value,
        operator: "equals",
        originalValue: keyword.rawValue,
      };
    }

    return null;
  }

  static clearCaches(): void {
    this.playerCache.clear();
    this.tournamentCache.clear();
    this.surfaceCache.clear();
    this.roundCache.clear();
  }
}
