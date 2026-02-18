/**
 * @jest-environment node
 */
import { createRequest } from "../helpers/request";

// Mock db before importing the route
const mockSelect = jest.fn();
const mockSelectDistinct = jest.fn();
const mockExecute = jest.fn();

jest.mock("@/db", () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return {
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            execute: mockExecute,
          }),
          execute: mockExecute,
        }),
      };
    },
    selectDistinct: (...args: unknown[]) => {
      mockSelectDistinct(...args);
      return {
        from: jest.fn().mockReturnValue({
          execute: mockExecute,
        }),
      };
    },
    execute: jest.fn().mockResolvedValue({
      rows: [],
    }),
  },
}));

// Must import after mock
import { GET } from "@/app/api/v1/graph/route";

const fakeNodes = [
  { id: 1, slug: "0-0", depth: 1, played: true, occurrences: 10 },
  { id: 2, slug: "1-0", depth: 2, played: true, occurrences: 5 },
  { id: 3, slug: "0-1", depth: 2, played: false, occurrences: 0 },
];

const fakeEdges = [
  { frm: 1, to: 2 },
  { frm: 1, to: 3 },
];

beforeEach(() => {
  jest.clearAllMocks();
  // Default: nodes query returns fakeNodes, edges query returns fakeEdges
  mockExecute.mockResolvedValueOnce(fakeNodes).mockResolvedValueOnce(fakeEdges);
});

describe("GET /api/v1/graph", () => {
  it("returns nodes, edges, and progress with default params", async () => {
    const req = createRequest("/api/v1/graph");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("nodes");
    expect(body).toHaveProperty("edges");
    expect(body).toHaveProperty("progress", 1);
  });

  it("includes root node as first element", async () => {
    const req = createRequest("/api/v1/graph");
    const res = await GET(req);
    const body = await res.json();

    expect(body.nodes[0]).toEqual({
      id: 0,
      slug: "love-all",
      played: false,
      depth: 0,
      occurrences: 0,
      norm: 0,
    });
  });

  it("normalizes occurrences by max value", async () => {
    const req = createRequest("/api/v1/graph");
    const res = await GET(req);
    const body = await res.json();

    // Node at index 1 has occurrences=10 (max), so norm=1
    expect(body.nodes[1].norm).toBe(1);
    // Node at index 2 has occurrences=5, so norm=0.5
    expect(body.nodes[2].norm).toBe(0.5);
  });

  it("creates root edges to all depth-1 nodes", async () => {
    const req = createRequest("/api/v1/graph");
    const res = await GET(req);
    const body = await res.json();

    const rootEdges = body.edges.filter((e: { frm: number }) => e.frm === 0);
    expect(rootEdges).toEqual([{ frm: 0, to: 1 }]);
  });

  it("accepts sets=3", async () => {
    const req = createRequest("/api/v1/graph", { sets: "3" });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("rejects sets=7 with 400", async () => {
    const req = createRequest("/api/v1/graph", { sets: "7" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/sets must be 3 or 5/);
  });

  it("rejects invalid sex with 400", async () => {
    const req = createRequest("/api/v1/graph", { sex: "invalid" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/gender must be men\|women\|all/);
  });

  it("rejects women + sets=5 with 400", async () => {
    const req = createRequest("/api/v1/graph", {
      sets: "5",
      sex: "women",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/women only play best of 3 sets/);
  });

  it("rejects non-numeric year with 400", async () => {
    const req = createRequest("/api/v1/graph", { year: "abc" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/year must be a number/);
  });

  it("rejects non-numeric tournament with 400", async () => {
    const req = createRequest("/api/v1/graph", { tournament: "abc" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/tournament must be a number/);
  });

  it("accepts year=all (default)", async () => {
    const req = createRequest("/api/v1/graph", { year: "all" });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it("sets Cache-Control header", async () => {
    const req = createRequest("/api/v1/graph");
    const res = await GET(req);

    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=60, stale-while-revalidate=240"
    );
  });
});
