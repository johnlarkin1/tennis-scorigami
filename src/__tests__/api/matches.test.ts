/**
 * @jest-environment node
 */
import { createRequest } from "../helpers/request";

// Mock db
const mockExecute = jest.fn();
const mockLimit = jest.fn().mockReturnValue({ execute: mockExecute });
const mockOrderBy = jest.fn().mockReturnValue({ limit: mockLimit });
const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });
const mockInnerJoin3 = jest.fn().mockReturnValue({ where: mockWhere });
const mockInnerJoin2 = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin3 });
const mockInnerJoin1 = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin2 });
const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin1 });
const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });

jest.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

jest.mock("@/db/schema", () => ({
  match: {
    match_id: "match_id",
    event_id: "event_id",
    player_a_id: "player_a_id",
    player_b_id: "player_b_id",
    score_id: "score_id",
    year: "year",
    match_start_time: "match_start_time",
  },
  event: {
    event_id: "event_id",
    name: "name",
  },
  player: {
    player_id: "player_id",
    full_name: "full_name",
  },
}));

import { GET } from "@/app/api/v1/matches/route";

const fakeRows = [
  {
    match_id: 100,
    event_name: "Wimbledon 2023",
    player_a: "Roger Federer",
    player_b: "Rafael Nadal",
    year: 2023,
    start_time: "2023-07-10T14:00:00Z",
  },
  {
    match_id: 99,
    event_name: "US Open 2022",
    player_a: "Novak Djokovic",
    player_b: "Carlos Alcaraz",
    year: 2022,
    start_time: "2022-09-11T18:00:00Z",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockExecute.mockResolvedValue(fakeRows);
  mockLimit.mockReturnValue({ execute: mockExecute });
  mockOrderBy.mockReturnValue({ limit: mockLimit });
  mockWhere.mockReturnValue({ orderBy: mockOrderBy });
});

describe("GET /api/v1/matches", () => {
  it("returns 400 when scoreId is missing", async () => {
    const req = createRequest("/api/v1/matches");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/scoreId is required/);
  });

  it("returns 400 when scoreId is 0 (falsy)", async () => {
    const req = createRequest("/api/v1/matches", { scoreId: "0" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/scoreId is required/);
  });

  it("returns matches for valid scoreId", async () => {
    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(2);
  });

  it("returns correct response shape", async () => {
    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    const res = await GET(req);
    const body = await res.json();

    expect(body[0]).toHaveProperty("match_id");
    expect(body[0]).toHaveProperty("event_name");
    expect(body[0]).toHaveProperty("player_a");
    expect(body[0]).toHaveProperty("player_b");
    expect(body[0]).toHaveProperty("year");
    expect(body[0]).toHaveProperty("start_time");
  });

  it("defaults limit to 50", async () => {
    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    await GET(req);

    // limit + 1 = 51
    expect(mockLimit).toHaveBeenCalledWith(51);
  });

  it("caps limit at 100", async () => {
    const req = createRequest("/api/v1/matches", {
      scoreId: "42",
      limit: "999",
    });
    await GET(req);

    // Math.min(999, 100) + 1 = 101
    expect(mockLimit).toHaveBeenCalledWith(101);
  });

  it("respects custom limit", async () => {
    const req = createRequest("/api/v1/matches", {
      scoreId: "42",
      limit: "10",
    });
    await GET(req);

    expect(mockLimit).toHaveBeenCalledWith(11);
  });

  it("sets X-Next-Cursor header when more results exist", async () => {
    // Return limit+1 rows to indicate more exist (default limit=50, so 51 rows)
    const manyRows = Array.from({ length: 51 }, (_, i) => ({
      match_id: 100 - i,
      event_name: `Event ${i}`,
      player_a: "Player A",
      player_b: "Player B",
      year: 2023,
      start_time: null,
    }));
    mockExecute.mockResolvedValue(manyRows);

    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    const res = await GET(req);

    expect(res.headers.get("X-Next-Cursor")).toBe("51");
  });

  it("does not set X-Next-Cursor when no more results", async () => {
    mockExecute.mockResolvedValue([fakeRows[0]]);

    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    const res = await GET(req);

    expect(res.headers.get("X-Next-Cursor")).toBeNull();
  });

  it("returns empty array when no matches found", async () => {
    mockExecute.mockResolvedValue([]);

    const req = createRequest("/api/v1/matches", { scoreId: "42" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});
