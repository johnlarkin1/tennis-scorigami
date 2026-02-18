import { isMatchComplete, parseSetScores } from "@/lib/utils/scoring";

describe("isMatchComplete", () => {
  it("returns false for empty scores", () => {
    expect(isMatchComplete([])).toBe(false);
  });

  it("detects best-of-3 completion (2-0)", () => {
    expect(isMatchComplete(["6-4", "6-3"])).toBe(true);
  });

  it("detects best-of-3 completion (2-1)", () => {
    expect(isMatchComplete(["6-4", "4-6", "6-3"])).toBe(true);
  });

  it("detects best-of-5 completion (3-0)", () => {
    expect(isMatchComplete(["6-4", "6-3", "6-2"])).toBe(true);
  });

  it("detects best-of-5 completion (3-2)", () => {
    expect(isMatchComplete(["6-4", "4-6", "6-3", "3-6", "6-4"])).toBe(true);
  });

  it("detects incomplete match (1-0)", () => {
    expect(isMatchComplete(["6-4"])).toBe(false);
  });
});

describe("parseSetScores", () => {
  it("parses space-separated scores", () => {
    expect(parseSetScores("6-4 6-3 6-2")).toEqual(["6-4", "6-3", "6-2"]);
  });

  it("returns empty array for empty string", () => {
    expect(parseSetScores("")).toEqual([]);
  });

  it("handles single set", () => {
    expect(parseSetScores("6-4")).toEqual(["6-4"]);
  });
});
