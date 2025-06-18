export interface ParsedSearchQuery {
  keywords: KeywordFilter[];
  plainText: string;
}

export interface KeywordFilter {
  type: KeywordType;
  value: string;
  operator?: "equals" | "range" | "regex" | "contains";
  rawValue: string;
  id?: string | number; // ID for precise matching when available
  displayName?: string; // Human-readable name for display
}

export type KeywordType =
  | "player"
  | "opponent"
  | "score"
  | "tournament"
  | "year"
  | "sex"
  | "surface"
  | "round"
  | "status";

export const KEYWORD_PREFIXES: Record<KeywordType, string[]> = {
  player: ["player:"],
  opponent: ["opponent:", "opp:", "vs:"],
  score: ["score:"],
  tournament: ["tournament:", "tour:"],
  year: ["year:", "y:"],
  sex: ["sex:", "gender:"],
  surface: ["surface:", "surf:"],
  round: ["round:"],
  status: ["status:"],
};

export const SUPPORTED_KEYWORDS = Object.keys(
  KEYWORD_PREFIXES
) as KeywordType[];

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const keywords: KeywordFilter[] = [];
  const foundMatches: string[] = [];

  // Find all keyword patterns
  for (const [keywordType, prefixes] of Object.entries(KEYWORD_PREFIXES)) {
    for (const prefix of prefixes) {
      // First try to match ID format: prefix#id:displayName
      // Use a simpler approach - match until we hit a space followed by another keyword
      const idRegex = new RegExp(
        `${escapeRegExp(prefix)}(#[^:\\s]+:[^\\s]+(?:\\s+[^\\s]+)*?)(?=\\s+\\w+:|$)`,
        "gi"
      );
      let match: RegExpExecArray | null;

      // Reset regex lastIndex for each iteration
      idRegex.lastIndex = 0;
      while ((match = idRegex.exec(query)) !== null) {
        const rawValue = match[1];
        const keyword = parseKeywordValue(keywordType as KeywordType, rawValue);

        if (keyword) {
          keywords.push(keyword);
          foundMatches.push(match[0]);
        }
      }

      // Then try regular text format for anything that wasn't matched
      const textRegex = new RegExp(
        `${escapeRegExp(prefix)}([^\\s#:]+(?:\\s+[^\\s:]+)*?)(?=\\s+\\w+:|$)`,
        "gi"
      );

      textRegex.lastIndex = 0;
      while ((match = textRegex.exec(query)) !== null) {
        const rawValue = match[1];
        // Skip if this was already processed as an ID format or already found
        if (
          !rawValue.startsWith("#") &&
          !foundMatches.some((fm) => fm.includes(match![0]))
        ) {
          const keyword = parseKeywordValue(
            keywordType as KeywordType,
            rawValue
          );

          if (keyword) {
            keywords.push(keyword);
            foundMatches.push(match[0]);
          }
        }
      }
    }
  }

  // Remove all found keyword matches from the original query to get remaining text
  let remainingText = query;
  for (const match of foundMatches) {
    remainingText = remainingText.replace(match, "");
  }

  return {
    keywords,
    plainText: remainingText.replace(/\s+/g, " ").trim(),
  };
}

function parseKeywordValue(
  type: KeywordType,
  rawValue: string
): KeywordFilter | null {
  const trimmedValue = rawValue.trim();

  // Don't create a keyword if there's no value after the prefix
  if (!trimmedValue || trimmedValue === "") return null;

  // Handle ID format: #id:displayName
  const idMatch = trimmedValue.match(/^#([^:]+):(.+)$/);
  if (idMatch) {
    const idPart = idMatch[1];
    // Try to parse as number, otherwise keep as string
    const parsedId = /^\d+$/.test(idPart) ? parseInt(idPart) : idPart;

    return {
      type,
      value: idMatch[2], // Display name
      operator: "equals",
      rawValue: trimmedValue,
      id: parsedId, // Parsed ID (number or string)
      displayName: idMatch[2],
    };
  }

  // Handle quoted strings
  const quotedMatch = trimmedValue.match(/^"([^"]+)"$/);
  if (quotedMatch) {
    return {
      type,
      value: quotedMatch[1],
      operator: "equals",
      rawValue: trimmedValue,
    };
  }

  // Handle regex patterns
  if (trimmedValue.startsWith("/") && trimmedValue.endsWith("/")) {
    return {
      type,
      value: trimmedValue.slice(1, -1),
      operator: "regex",
      rawValue: trimmedValue,
    };
  }

  // Handle year ranges (e.g., 2020-2023)
  if (type === "year") {
    const rangeMatch = trimmedValue.match(/^(\d{4})-(\d{4})$/);
    if (rangeMatch) {
      return {
        type,
        value: `${rangeMatch[1]},${rangeMatch[2]}`,
        operator: "range",
        rawValue: trimmedValue,
      };
    }
  }

  // Handle score patterns with wildcards
  if (type === "score") {
    // Convert * to % for SQL LIKE queries
    const sqlPattern = trimmedValue.replace(/\*/g, "%");
    return {
      type,
      value: sqlPattern,
      operator: "contains",
      rawValue: trimmedValue,
    };
  }

  // Default case - exact match or contains
  return {
    type,
    value: trimmedValue,
    operator: "contains",
    rawValue: trimmedValue,
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getKeywordSuggestions(input: string): KeywordType[] {
  const lowerInput = input.toLowerCase();

  return SUPPORTED_KEYWORDS.filter((keyword) => {
    const prefixes = KEYWORD_PREFIXES[keyword];
    return prefixes.some((prefix) => prefix.startsWith(lowerInput));
  });
}

export function isKeywordPrefix(input: string): boolean {
  const lowerInput = input.toLowerCase();

  return Object.values(KEYWORD_PREFIXES).some((prefixes) =>
    prefixes.some((prefix) => prefix.startsWith(lowerInput))
  );
}
