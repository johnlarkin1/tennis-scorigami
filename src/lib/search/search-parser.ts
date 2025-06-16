export interface ParsedSearchQuery {
  keywords: KeywordFilter[];
  plainText: string;
}

export interface KeywordFilter {
  type: KeywordType;
  value: string;
  operator?: 'equals' | 'range' | 'regex' | 'contains';
  rawValue: string;
}

export type KeywordType = 
  | 'player'
  | 'opponent' 
  | 'score'
  | 'tournament'
  | 'year'
  | 'sex'
  | 'surface'
  | 'round'
  | 'has'
  | 'never'
  | 'country'
  | 'location';

export const KEYWORD_PREFIXES: Record<KeywordType, string[]> = {
  player: ['player:', 'p:'],
  opponent: ['opponent:', 'opp:', 'vs:'],
  score: ['score:', 's:'],
  tournament: ['tournament:', 'tour:', 't:'],
  year: ['year:', 'y:'],
  sex: ['sex:', 'gender:', 'g:'],
  surface: ['surface:', 'surf:'],
  round: ['round:', 'r:'],
  has: ['has:', 'h:'],
  never: ['never:', 'n:'],
  country: ['country:', 'c:'],
  location: ['location:', 'loc:', 'l:']
};

export const SUPPORTED_KEYWORDS = Object.keys(KEYWORD_PREFIXES) as KeywordType[];

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const keywords: KeywordFilter[] = [];
  let remainingText = query;

  // Find all keyword patterns
  for (const [keywordType, prefixes] of Object.entries(KEYWORD_PREFIXES)) {
    for (const prefix of prefixes) {
      const regex = new RegExp(`${escapeRegExp(prefix)}([^\\s]+(?:\\s+[^\\s:]+)*)`, 'gi');
      let match;
      
      while ((match = regex.exec(query)) !== null) {
        const rawValue = match[1];
        const keyword = parseKeywordValue(keywordType as KeywordType, rawValue);
        
        if (keyword) {
          keywords.push(keyword);
          // Remove from remaining text
          remainingText = remainingText.replace(match[0], '').trim();
        }
      }
    }
  }

  return {
    keywords,
    plainText: remainingText.replace(/\s+/g, ' ').trim()
  };
}

function parseKeywordValue(type: KeywordType, rawValue: string): KeywordFilter | null {
  const trimmedValue = rawValue.trim();
  
  if (!trimmedValue) return null;

  // Handle quoted strings
  const quotedMatch = trimmedValue.match(/^"([^"]+)"$/);
  if (quotedMatch) {
    return {
      type,
      value: quotedMatch[1],
      operator: 'equals',
      rawValue: trimmedValue
    };
  }

  // Handle regex patterns
  if (trimmedValue.startsWith('/') && trimmedValue.endsWith('/')) {
    return {
      type,
      value: trimmedValue.slice(1, -1),
      operator: 'regex',
      rawValue: trimmedValue
    };
  }

  // Handle year ranges (e.g., 2020-2023)
  if (type === 'year') {
    const rangeMatch = trimmedValue.match(/^(\d{4})-(\d{4})$/);
    if (rangeMatch) {
      return {
        type,
        value: `${rangeMatch[1]},${rangeMatch[2]}`,
        operator: 'range',
        rawValue: trimmedValue
      };
    }
  }

  // Handle score patterns with wildcards
  if (type === 'score') {
    // Convert * to % for SQL LIKE queries
    const sqlPattern = trimmedValue.replace(/\*/g, '%');
    return {
      type,
      value: sqlPattern,
      operator: 'contains',
      rawValue: trimmedValue
    };
  }

  // Default case - exact match or contains
  return {
    type,
    value: trimmedValue,
    operator: 'contains',
    rawValue: trimmedValue
  };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getKeywordSuggestions(input: string): KeywordType[] {
  const lowerInput = input.toLowerCase();
  
  return SUPPORTED_KEYWORDS.filter(keyword => {
    const prefixes = KEYWORD_PREFIXES[keyword];
    return prefixes.some(prefix => prefix.startsWith(lowerInput));
  });
}

export function isKeywordPrefix(input: string): boolean {
  const lowerInput = input.toLowerCase();
  
  return Object.values(KEYWORD_PREFIXES).some(prefixes =>
    prefixes.some(prefix => prefix.startsWith(lowerInput))
  );
}