import {
  convertSexFilter,
  convertYearFilter,
  convertTournamentFilter,
  convertSetsFilter,
} from "@/utils/filter-converters";

describe("convertSexFilter", () => {
  it('returns "all" for null', () => {
    expect(convertSexFilter(null)).toBe("all");
  });

  it('returns "all" for "Men and Women"', () => {
    expect(convertSexFilter("Men and Women")).toBe("all");
  });

  it("lowercases other values", () => {
    expect(convertSexFilter("Men")).toBe("men");
    expect(convertSexFilter("Women")).toBe("women");
  });
});

describe("convertYearFilter", () => {
  it('returns "all" for null', () => {
    expect(convertYearFilter(null)).toBe("all");
  });

  it('returns "all" for "All Years"', () => {
    expect(convertYearFilter("All Years")).toBe("all");
  });

  it("returns the year string for specific years", () => {
    expect(convertYearFilter("2023")).toBe("2023");
  });
});

describe("convertTournamentFilter", () => {
  it('returns "all" for null', () => {
    expect(convertTournamentFilter(null)).toBe("all");
  });

  it('returns "all" for "All Tournaments"', () => {
    expect(convertTournamentFilter("All Tournaments")).toBe("all");
  });

  it("returns the value for specific tournaments", () => {
    expect(convertTournamentFilter("Wimbledon")).toBe("Wimbledon");
  });
});

describe("convertSetsFilter", () => {
  it('returns "all" for null', () => {
    expect(convertSetsFilter(null)).toBe("all");
  });

  it('returns "all" for "All Sets"', () => {
    expect(convertSetsFilter("All Sets")).toBe("all");
  });

  it("returns the value for specific sets", () => {
    expect(convertSetsFilter("3")).toBe("3");
    expect(convertSetsFilter("5")).toBe("5");
  });
});
