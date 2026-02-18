import { SearchMappingContext } from "@/lib/search/search-context";

afterEach(() => {
  SearchMappingContext.clear();
});

describe("SearchMappingContext", () => {
  it("sets and gets player mapping", () => {
    SearchMappingContext.setPlayerMapping("Roger Federer", 1);
    expect(SearchMappingContext.getPlayerId("Roger Federer")).toBe(1);
  });

  it("is case-insensitive for lookups", () => {
    SearchMappingContext.setPlayerMapping("Roger Federer", 1);
    expect(SearchMappingContext.getPlayerId("roger federer")).toBe(1);
  });

  it("returns null for unknown player", () => {
    expect(SearchMappingContext.getPlayerId("Unknown Player")).toBeNull();
  });

  it("sets and gets tournament mapping", () => {
    SearchMappingContext.setTournamentMapping("Wimbledon", 10);
    expect(SearchMappingContext.getTournamentId("Wimbledon")).toBe(10);
  });

  it("returns null for unknown tournament", () => {
    expect(SearchMappingContext.getTournamentId("Unknown")).toBeNull();
  });

  it("sets and gets country mapping", () => {
    SearchMappingContext.setCountryMapping("Switzerland", 5);
    expect(SearchMappingContext.getCountryId("Switzerland")).toBe(5);
  });

  it("sets and gets surface mapping", () => {
    SearchMappingContext.setSurfaceMapping("Grass", 2);
    expect(SearchMappingContext.getSurfaceId("Grass")).toBe(2);
  });

  it("sets and gets round mapping", () => {
    SearchMappingContext.setRoundMapping("Final", 7);
    expect(SearchMappingContext.getRoundId("Final")).toBe(7);
  });

  it("clears all mappings", () => {
    SearchMappingContext.setPlayerMapping("Federer", 1);
    SearchMappingContext.setTournamentMapping("Wimbledon", 10);
    SearchMappingContext.setCountryMapping("CH", 5);
    SearchMappingContext.setSurfaceMapping("Grass", 2);
    SearchMappingContext.setRoundMapping("Final", 7);

    SearchMappingContext.clear();

    expect(SearchMappingContext.getPlayerId("Federer")).toBeNull();
    expect(SearchMappingContext.getTournamentId("Wimbledon")).toBeNull();
    expect(SearchMappingContext.getCountryId("CH")).toBeNull();
    expect(SearchMappingContext.getSurfaceId("Grass")).toBeNull();
    expect(SearchMappingContext.getRoundId("Final")).toBeNull();
  });

  it("loads mappings from data object", () => {
    SearchMappingContext.loadMappingsFromData({
      players: [
        { id: 1, name: "Federer", value: "federer" },
        { id: 2, name: "Nadal", value: "nadal" },
      ],
      tournaments: [{ id: 10, name: "Wimbledon", value: "wimbledon" }],
      countries: [{ id: 5, name: "Switzerland", value: "ch" }],
      surfaces: [{ id: 2, name: "Grass", value: "grass" }],
      rounds: [{ id: 7, name: "Final", value: "final" }],
    });

    expect(SearchMappingContext.getPlayerId("Federer")).toBe(1);
    expect(SearchMappingContext.getPlayerId("Nadal")).toBe(2);
    expect(SearchMappingContext.getTournamentId("Wimbledon")).toBe(10);
    expect(SearchMappingContext.getCountryId("Switzerland")).toBe(5);
    expect(SearchMappingContext.getSurfaceId("Grass")).toBe(2);
    expect(SearchMappingContext.getRoundId("Final")).toBe(7);
  });

  it("handles empty data in loadMappingsFromData", () => {
    SearchMappingContext.loadMappingsFromData({});
    expect(SearchMappingContext.getPlayerId("anyone")).toBeNull();
  });
});
