// Mock db before importing
jest.mock("@/db", () => ({
  db: {
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            execute: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
  },
}));

jest.mock("@/db/schema", () => ({
  player: { player_id: "player_id", full_name: "full_name" },
  tournament: { tournament_id: "tournament_id", name: "name" },
  surfaceType: {
    surface_type_id: "surface_type_id",
    surface_type: "surface_type",
  },
  matchRound: { round_id: "round_id", round_name: "round_name" },
}));

import { SearchMapper } from "@/lib/search/search-mapper";
import type { KeywordFilter } from "@/lib/search/search-parser";

afterEach(() => {
  SearchMapper.clearCaches();
});

function makeKeyword(
  overrides: Partial<KeywordFilter> & { type: KeywordFilter["type"] }
): KeywordFilter {
  return {
    value: "",
    rawValue: "",
    ...overrides,
  };
}

describe("SearchMapper.mapKeywordFilters", () => {
  it("maps year keyword to equals filter", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({ type: "year", value: "2020", rawValue: "2020" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("year");
    expect(result[0].operator).toBe("equals");
    expect(result[0].value).toBe(2020);
  });

  it("maps year range to between filter", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "year",
        value: "2020,2023",
        operator: "range",
        rawValue: "2020-2023",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("year");
    expect(result[0].operator).toBe("between");
    expect(result[0].value).toEqual([2020, 2023]);
  });

  it('maps sex keyword "men" to M', async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({ type: "sex", value: "men", rawValue: "men" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("sex");
    expect(result[0].value).toBe("M");
  });

  it('maps sex keyword "F" to F', async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({ type: "sex", value: "F", rawValue: "F" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("F");
  });

  it("maps sex keyword with ID", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "sex",
        value: "Men's",
        rawValue: "#M:Men's",
        id: "M",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe("M");
  });

  it("returns null for invalid sex value", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({ type: "sex", value: "unknown", rawValue: "unknown" }),
    ]);

    expect(result).toHaveLength(0);
  });

  it("maps score keyword to ilike filter", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "score",
        value: "6-4",
        operator: "contains",
        rawValue: "6-4",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("score");
    expect(result[0].operator).toBe("ilike");
    expect(result[0].value).toBe("%6-4%");
  });

  it("maps score regex to regex filter", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "score",
        value: "6-[0-3]",
        operator: "regex",
        rawValue: "/6-[0-3]/",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].operator).toBe("regex");
    expect(result[0].value).toBe("6-[0-3]");
  });

  it("maps status complete", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "status",
        value: "complete",
        rawValue: "complete",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("status");
    expect(result[0].value).toBe("complete");
  });

  it("maps status incomplete", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "status",
        value: "incomplete",
        rawValue: "incomplete",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("status");
    expect(result[0].value).toBe("incomplete");
  });

  it("maps player keyword with ID to playerEitherId", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({
        type: "player",
        value: "Federer",
        rawValue: "#1:Federer",
        id: 1,
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].field).toBe("playerEitherId");
    expect(result[0].value).toBe(1);
    expect(result[0].operator).toBe("equals");
  });

  it("maps invalid year to empty result", async () => {
    const result = await SearchMapper.mapKeywordFilters([
      makeKeyword({ type: "year", value: "notanumber", rawValue: "abc" }),
    ]);

    expect(result).toHaveLength(0);
  });
});

describe("SearchMapper.clearCaches", () => {
  it("clears caches without error", () => {
    expect(() => SearchMapper.clearCaches()).not.toThrow();
  });
});
