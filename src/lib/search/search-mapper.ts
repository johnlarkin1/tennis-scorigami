import { db } from "@/db";
import { 
  player, 
  tournament, 
  country, 
  surfaceType, 
  matchRound
} from "@/db/schema";
import { ilike } from "drizzle-orm";
import { KeywordFilter, KeywordType } from "./search-parser";
import { SearchMappingContext } from "./search-context";

export interface MappedSearchFilter {
  type: KeywordType;
  field: string;
  value: string | number | number[] | boolean;
  operator: 'equals' | 'ilike' | 'in' | 'between' | 'regex';
  originalValue: string;
}

export class SearchMapper {
  private static playerCache = new Map<string, number>();
  private static tournamentCache = new Map<string, number>();
  private static countryCache = new Map<string, number>();
  private static surfaceCache = new Map<string, number>();
  private static roundCache = new Map<string, number>();

  static async mapKeywordFilters(keywords: KeywordFilter[]): Promise<MappedSearchFilter[]> {
    const mappedFilters: MappedSearchFilter[] = [];

    for (const keyword of keywords) {
      const mapped = await this.mapSingleKeyword(keyword);
      if (mapped) {
        mappedFilters.push(mapped);
      }
    }

    return mappedFilters;
  }

  private static async mapSingleKeyword(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    switch (keyword.type) {
      case 'player':
      case 'opponent':
        return await this.mapPlayer(keyword);
      
      case 'tournament':
        return await this.mapTournament(keyword);
      
      case 'country':
        return await this.mapCountry(keyword);
      
      case 'surface':
        return await this.mapSurface(keyword);
      
      case 'round':
        return await this.mapRound(keyword);
      
      case 'year':
        return this.mapYear(keyword);
      
      case 'sex':
        return this.mapSex(keyword);
      
      case 'score':
        return this.mapScore(keyword);
      
      case 'has':
        return this.mapHas(keyword);
      
      case 'never':
        return this.mapNever(keyword);
      
      case 'location':
        return this.mapLocation(keyword);
      
      default:
        return null;
    }
  }

  private static async mapPlayer(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    try {
      // Check cache first
      const cacheKey = keyword.value.toLowerCase();
      const cachedPlayerId = this.playerCache.get(cacheKey);
      if (cachedPlayerId !== undefined) {
        return {
          type: keyword.type,
          field: keyword.type === 'player' ? 'playerAId' : 'playerBId',
          value: cachedPlayerId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      // If it's a numeric ID, use it directly
      if (/^\d+$/.test(keyword.value)) {
        const playerId = parseInt(keyword.value);
        this.playerCache.set(cacheKey, playerId);
        return {
          type: keyword.type,
          field: keyword.type === 'player' ? 'playerAId' : 'playerBId',
          value: playerId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      // Check search context for name-to-ID mapping (from frontend suggestions)
      const playerId = SearchMappingContext.getPlayerId(keyword.value);
      if (playerId) {
        this.playerCache.set(cacheKey, playerId);
        return {
          type: keyword.type,
          field: keyword.type === 'player' ? 'playerAId' : 'playerBId',
          value: playerId,
          operator: 'equals',
          originalValue: keyword.rawValue
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
          field: keyword.type === 'player' ? 'playerAId' : 'playerBId',
          value: players[0].id,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      // If no exact match, return ILIKE search on name fields
      return {
        type: keyword.type,
        field: keyword.type === 'player' ? 'playerAName' : 'playerBName',
        value: `%${keyword.value}%`,
        operator: 'ilike',
        originalValue: keyword.rawValue
      };
    } catch (error) {
      console.error('Error mapping player:', error);
      return null;
    }
  }

  private static async mapTournament(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    try {
      const cacheKey = keyword.value.toLowerCase();
      const cachedTournamentId = this.tournamentCache.get(cacheKey);
      if (cachedTournamentId !== undefined) {
        return {
          type: keyword.type,
          field: 'eventName',
          value: cachedTournamentId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const tournamentId = parseInt(keyword.value);
        this.tournamentCache.set(cacheKey, tournamentId);
        return {
          type: keyword.type,
          field: 'eventName',
          value: tournamentId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      // Check search context for name-to-ID mapping
      const tournamentId = SearchMappingContext.getTournamentId(keyword.value);
      if (tournamentId) {
        this.tournamentCache.set(cacheKey, tournamentId);
        return {
          type: keyword.type,
          field: 'eventName',
          value: tournamentId,
          operator: 'equals',
          originalValue: keyword.rawValue
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
          field: 'eventName',
          value: tournaments[0].id,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      return {
        type: keyword.type,
        field: 'eventName',
        value: `%${keyword.value}%`,
        operator: 'ilike',
        originalValue: keyword.rawValue
      };
    } catch (error) {
      console.error('Error mapping tournament:', error);
      return null;
    }
  }

  private static async mapCountry(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    try {
      const cacheKey = keyword.value.toLowerCase();
      const cachedCountryId = this.countryCache.get(cacheKey);
      if (cachedCountryId !== undefined) {
        return {
          type: keyword.type,
          field: 'country_id',
          value: cachedCountryId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const countryId = parseInt(keyword.value);
        this.countryCache.set(cacheKey, countryId);
        return {
          type: keyword.type,
          field: 'country_id',
          value: countryId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      const countries = await db
        .select({ id: country.country_id, name: country.country_name })
        .from(country)
        .where(ilike(country.country_name, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (countries.length > 0) {
        this.countryCache.set(cacheKey, countries[0].id);
        return {
          type: keyword.type,
          field: 'country_id',
          value: countries[0].id,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      return {
        type: keyword.type,
        field: 'country.country_name',
        value: `%${keyword.value}%`,
        operator: 'ilike',
        originalValue: keyword.rawValue
      };
    } catch (error) {
      console.error('Error mapping country:', error);
      return null;
    }
  }

  private static async mapSurface(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    try {
      const cacheKey = keyword.value.toLowerCase();
      const cachedSurfaceId = this.surfaceCache.get(cacheKey);
      if (cachedSurfaceId !== undefined) {
        return {
          type: keyword.type,
          field: 'surface_type_id',
          value: cachedSurfaceId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const surfaceId = parseInt(keyword.value);
        this.surfaceCache.set(cacheKey, surfaceId);
        return {
          type: keyword.type,
          field: 'surface_type_id',
          value: surfaceId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      const surfaces = await db
        .select({ id: surfaceType.surface_type_id, name: surfaceType.surface_type })
        .from(surfaceType)
        .where(ilike(surfaceType.surface_type, `%${keyword.value}%`))
        .limit(1)
        .execute();

      if (surfaces.length > 0) {
        this.surfaceCache.set(cacheKey, surfaces[0].id);
        return {
          type: keyword.type,
          field: 'surface_type_id',
          value: surfaces[0].id,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      return {
        type: keyword.type,
        field: 'surface_type.surface_type',
        value: `%${keyword.value}%`,
        operator: 'ilike',
        originalValue: keyword.rawValue
      };
    } catch (error) {
      console.error('Error mapping surface:', error);
      return null;
    }
  }

  private static async mapRound(keyword: KeywordFilter): Promise<MappedSearchFilter | null> {
    try {
      const cacheKey = keyword.value.toLowerCase();
      const cachedRoundId = this.roundCache.get(cacheKey);
      if (cachedRoundId !== undefined) {
        return {
          type: keyword.type,
          field: 'round_id',
          value: cachedRoundId,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      if (/^\d+$/.test(keyword.value)) {
        const roundId = parseInt(keyword.value);
        this.roundCache.set(cacheKey, roundId);
        return {
          type: keyword.type,
          field: 'round_id',
          value: roundId,
          operator: 'equals',
          originalValue: keyword.rawValue
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
          field: 'round_id',
          value: rounds[0].id,
          operator: 'equals',
          originalValue: keyword.rawValue
        };
      }

      return {
        type: keyword.type,
        field: 'match_round.round_name',
        value: `%${keyword.value}%`,
        operator: 'ilike',
        originalValue: keyword.rawValue
      };
    } catch (error) {
      console.error('Error mapping round:', error);
      return null;
    }
  }

  private static mapYear(keyword: KeywordFilter): MappedSearchFilter | null {
    if (keyword.operator === 'range') {
      const [startYear, endYear] = keyword.value.split(',').map(Number);
      return {
        type: keyword.type,
        field: 'year',
        value: [startYear, endYear],
        operator: 'between',
        originalValue: keyword.rawValue
      };
    }

    const year = parseInt(keyword.value);
    if (isNaN(year)) return null;

    return {
      type: keyword.type,
      field: 'year',
      value: year,
      operator: 'equals',
      originalValue: keyword.rawValue
    };
  }

  private static mapSex(keyword: KeywordFilter): MappedSearchFilter | null {
    const sex = keyword.value.toUpperCase();
    if (sex !== 'M' && sex !== 'F') return null;

    return {
      type: keyword.type,
      field: 'sex',
      value: sex,
      operator: 'equals',
      originalValue: keyword.rawValue
    };
  }

  private static mapScore(keyword: KeywordFilter): MappedSearchFilter | null {
    if (keyword.operator === 'regex') {
      return {
        type: keyword.type,
        field: 'score',
        value: keyword.value,
        operator: 'regex',
        originalValue: keyword.rawValue
      };
    }

    return {
      type: keyword.type,
      field: 'score',
      value: `%${keyword.value}%`,
      operator: 'ilike',
      originalValue: keyword.rawValue
    };
  }

  private static mapHas(keyword: KeywordFilter): MappedSearchFilter | null {
    switch (keyword.value.toLowerCase()) {
      case 'tiebreak':
        return {
          type: keyword.type,
          field: 'score',
          value: '%7-6%',
          operator: 'ilike',
          originalValue: keyword.rawValue
        };
      
      case 'bagel':
        return {
          type: keyword.type,
          field: 'score',
          value: '%6-0%',
          operator: 'ilike',
          originalValue: keyword.rawValue
        };
      
      case 'breadstick':
        return {
          type: keyword.type,
          field: 'score',
          value: '%6-1%',
          operator: 'ilike',
          originalValue: keyword.rawValue
        };
      
      case 'double_bagel':
        return {
          type: keyword.type,
          field: 'score',
          value: '%6-0,6-0%',
          operator: 'ilike',
          originalValue: keyword.rawValue
        };
      
      default:
        return null;
    }
  }

  private static mapNever(keyword: KeywordFilter): MappedSearchFilter | null {
    if (keyword.value.toLowerCase() === 'occurred') {
      // This is handled specially in the search endpoint
      return {
        type: keyword.type,
        field: 'scorigami',
        value: true,
        operator: 'equals',
        originalValue: keyword.rawValue
      };
    }
    
    return null;
  }

  private static mapLocation(keyword: KeywordFilter): MappedSearchFilter | null {
    return {
      type: keyword.type,
      field: 'event.location',
      value: `%${keyword.value}%`,
      operator: 'ilike',
      originalValue: keyword.rawValue
    };
  }

  static clearCaches(): void {
    this.playerCache.clear();
    this.tournamentCache.clear();
    this.countryCache.clear();
    this.surfaceCache.clear();
    this.roundCache.clear();
  }
}