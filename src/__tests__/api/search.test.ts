/**
 * @jest-environment node
 */
import { createRequest } from "../helpers/request";

// Mock the database — the search route builds: db.select().from().where().limit()
// then calls query.toSQL() and query.execute() on the result of .limit()
const mockExecute = jest.fn();
const mockToSQL = jest.fn().mockReturnValue({ sql: "", params: [] });
const mockLimit = jest
  .fn()
  .mockReturnValue({ execute: mockExecute, toSQL: mockToSQL });
const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

jest.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

jest.mock("@/db/schema", () => ({
  mvMatchesByScore: {
    matchId: "match_id",
    scoreId: "score_id",
    eventId: "event_id",
    eventName: "event_name",
    year: "year",
    gender: "gender",
    location: "location",
    drawSize: "draw_size",
    prizeMoney: "prize_money",
    eventStartDate: "event_start_date",
    eventEndDate: "event_end_date",
    tournamentId: "tournament_id",
    tournamentName: "tournament_name",
    surfaceType: "surface_type",
    establishedYear: "established_year",
    matchDuration: "match_duration",
    matchStartTime: "match_start_time",
    matchEndTime: "match_end_time",
    bestOf: "best_of",
    score: "score",
    roundId: "round_id",
    roundName: "round_name",
    roundAbbr: "round_abbr",
    playerAId: "player_a_id",
    playerAName: "player_a_name",
    playerAFirstName: "player_a_first_name",
    playerALastName: "player_a_last_name",
    playerACountryId: "player_a_country_id",
    playerACountryCode: "player_a_country_code",
    playerACountryName: "player_a_country_name",
    playerADateOfBirth: "player_a_dob",
    playerAHandedness: "player_a_hand",
    playerAHeightCm: "player_a_height",
    playerAWeightKg: "player_a_weight",
    playerBId: "player_b_id",
    playerBName: "player_b_name",
    playerBFirstName: "player_b_first_name",
    playerBLastName: "player_b_last_name",
    playerBCountryId: "player_b_country_id",
    playerBCountryCode: "player_b_country_code",
    playerBCountryName: "player_b_country_name",
    playerBDateOfBirth: "player_b_dob",
    playerBHandedness: "player_b_hand",
    playerBHeightCm: "player_b_height",
    playerBWeightKg: "player_b_weight",
    winnerId: "winner_id",
    loserId: "loser_id",
  },
}));

// Mock search-mapper to avoid its own db calls
jest.mock("@/lib/search/search-mapper", () => ({
  SearchMapper: {
    mapKeywordFilters: jest.fn().mockResolvedValue([]),
    clearCaches: jest.fn(),
  },
}));

import { GET } from "@/app/api/v1/search/route";
import { SearchMapper } from "@/lib/search/search-mapper";

const fakeMatch = {
  match_id: 1,
  player_a_name: "Roger Federer",
  player_b_name: "Rafael Nadal",
  event_name: "Wimbledon",
  year: 2008,
  score: "6-4 6-4 6-7 6-7 9-7",
};

beforeEach(() => {
  jest.clearAllMocks();
  mockExecute.mockResolvedValue([fakeMatch]);
  mockToSQL.mockReturnValue({ sql: "", params: [] });
  mockLimit.mockReturnValue({ execute: mockExecute, toSQL: mockToSQL });
  mockWhere.mockReturnValue({ limit: mockLimit });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockSelect.mockReturnValue({ from: mockFrom });
});

describe("GET /api/v1/search", () => {
  it("returns 400 when q param is missing", async () => {
    const req = createRequest("/api/v1/search");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/q is required/);
  });

  it("returns 400 when q is empty string", async () => {
    const req = createRequest("/api/v1/search", { q: "  " });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/q is required/);
  });

  it("returns results with correct shape", async () => {
    const req = createRequest("/api/v1/search", { q: "federer" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("type", "matches");
    expect(body).toHaveProperty("query", "federer");
    expect(body).toHaveProperty("count");
    expect(body).toHaveProperty("hasMore");
    expect(body).toHaveProperty("items");
    expect(body).toHaveProperty("filters");
  });

  it("formats items with id, name, slug, match_data", async () => {
    const req = createRequest("/api/v1/search", { q: "federer" });
    const res = await GET(req);
    const body = await res.json();

    expect(body.items[0]).toHaveProperty("id", 1);
    expect(body.items[0]).toHaveProperty(
      "name",
      "Roger Federer vs Rafael Nadal"
    );
    expect(body.items[0]).toHaveProperty("slug", "Wimbledon 2008");
    expect(body.items[0]).toHaveProperty("match_data");
  });

  it("caps limit at 100", async () => {
    const req = createRequest("/api/v1/search", {
      q: "test",
      limit: "500",
    });
    await GET(req);

    // The limit call should receive 101 (100 + 1 for hasMore check)
    expect(mockLimit).toHaveBeenCalledWith(101);
  });

  it("defaults limit to 100", async () => {
    const req = createRequest("/api/v1/search", { q: "test" });
    await GET(req);

    expect(mockLimit).toHaveBeenCalledWith(101);
  });

  it("sets hasMore=false when results fit within limit", async () => {
    mockExecute.mockResolvedValue([fakeMatch]);
    const req = createRequest("/api/v1/search", { q: "test" });
    const res = await GET(req);
    const body = await res.json();

    expect(body.hasMore).toBe(false);
    expect(body.count).toBe(1);
  });

  it("returns empty items for no results", async () => {
    mockExecute.mockResolvedValue([]);
    const req = createRequest("/api/v1/search", { q: "zzzznotfound" });
    const res = await GET(req);
    const body = await res.json();

    expect(body.count).toBe(0);
    expect(body.items).toEqual([]);
  });

  it("calls SearchMapper.mapKeywordFilters with parsed keywords", async () => {
    const req = createRequest("/api/v1/search", {
      q: "player:Federer",
    });
    await GET(req);

    expect(SearchMapper.mapKeywordFilters).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "player", value: "Federer" }),
      ])
    );
  });

  it("returns 400 on database error", async () => {
    mockExecute.mockRejectedValue(new Error("DB connection failed"));
    const req = createRequest("/api/v1/search", { q: "test" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Match search failed/);
  });
});
