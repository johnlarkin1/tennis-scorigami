import {
  getKeywordSuggestions,
  isKeywordPrefix,
  parseSearchQuery,
} from "@/lib/search/search-parser";

describe("parseSearchQuery", () => {
  it("returns plain text for queries without keywords", () => {
    const result = parseSearchQuery("federer");
    expect(result.keywords).toHaveLength(0);
    expect(result.plainText).toBe("federer");
  });

  it("parses a single keyword", () => {
    const result = parseSearchQuery("player:Federer");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("player");
    expect(result.keywords[0].value).toBe("Federer");
  });

  it("parses multiple keywords", () => {
    const result = parseSearchQuery("player:Federer year:2020");
    expect(result.keywords).toHaveLength(2);

    const types = result.keywords.map((k) => k.type);
    expect(types).toContain("player");
    expect(types).toContain("year");
  });

  it("parses ID format: player:#123:Roger Federer", () => {
    const result = parseSearchQuery("player:#123:Roger Federer");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].id).toBe(123);
    expect(result.keywords[0].displayName).toBe("Roger Federer");
    expect(result.keywords[0].operator).toBe("equals");
  });

  it("parses regex patterns", () => {
    const result = parseSearchQuery("score:/6-[0-3]/");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].operator).toBe("regex");
    expect(result.keywords[0].value).toBe("6-[0-3]");
  });

  it("parses year ranges", () => {
    const result = parseSearchQuery("year:2020-2023");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].operator).toBe("range");
    expect(result.keywords[0].value).toBe("2020,2023");
  });

  it("converts score wildcards to SQL LIKE patterns", () => {
    const result = parseSearchQuery("score:6-*");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].value).toBe("6-%");
    expect(result.keywords[0].operator).toBe("contains");
  });

  it("parses alternate prefixes (vs: → opponent)", () => {
    const result = parseSearchQuery("vs:Nadal");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("opponent");
    expect(result.keywords[0].value).toBe("Nadal");
  });

  it("parses opp: prefix as opponent", () => {
    const result = parseSearchQuery("opp:Djokovic");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("opponent");
  });

  it("parses tour: prefix as tournament", () => {
    const result = parseSearchQuery("tour:Wimbledon");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("tournament");
  });

  it("parses surf: prefix as surface", () => {
    const result = parseSearchQuery("surf:grass");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("surface");
  });

  it("parses gender: prefix as sex", () => {
    const result = parseSearchQuery("gender:male");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("sex");
  });

  it("captures multi-word values after keyword prefix", () => {
    // Parser captures "Federer wimbledon" as the full keyword value
    // since there's no subsequent keyword prefix to delimit it
    const result = parseSearchQuery("player:Federer wimbledon");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("player");
    expect(result.keywords[0].value).toContain("Federer");
  });

  it("separates plain text when followed by a keyword", () => {
    const result = parseSearchQuery("wimbledon player:Federer");
    const playerKw = result.keywords.find((k) => k.type === "player");
    expect(playerKw).toBeDefined();
    expect(result.plainText).toBe("wimbledon");
  });

  it("returns empty for empty query", () => {
    const result = parseSearchQuery("");
    expect(result.keywords).toHaveLength(0);
    expect(result.plainText).toBe("");
  });

  it("handles y: prefix as year", () => {
    const result = parseSearchQuery("y:2023");
    expect(result.keywords).toHaveLength(1);
    expect(result.keywords[0].type).toBe("year");
    expect(result.keywords[0].value).toBe("2023");
  });
});

describe("getKeywordSuggestions", () => {
  it('returns matching keywords for "pl"', () => {
    const suggestions = getKeywordSuggestions("pl");
    expect(suggestions).toContain("player");
  });

  it('returns multiple matches for "s"', () => {
    const suggestions = getKeywordSuggestions("s");
    expect(suggestions).toContain("score");
    expect(suggestions).toContain("sex");
    expect(suggestions).toContain("surface");
    expect(suggestions).toContain("status");
  });

  it("returns empty for unmatched prefix", () => {
    const suggestions = getKeywordSuggestions("zzz");
    expect(suggestions).toHaveLength(0);
  });
});

describe("isKeywordPrefix", () => {
  it("returns true for valid prefix start", () => {
    expect(isKeywordPrefix("player:")).toBe(true);
  });

  it("returns true for partial prefix", () => {
    expect(isKeywordPrefix("pl")).toBe(true);
  });

  it("returns false for invalid prefix", () => {
    expect(isKeywordPrefix("xyz:")).toBe(false);
  });
});
