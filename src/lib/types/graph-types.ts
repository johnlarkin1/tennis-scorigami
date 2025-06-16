export type U32 = number;

export interface EdgeDTO {
  frm: U32;
  to: U32;
}

export interface NodeDTO {
  id: number;
  slug: string;
  played: boolean;
  depth: number;
  occurrences: number; // raw count
  norm: number; // occurrences / maxOccurrences
  x?: number; // Pre-computed x position (optional for backward compatibility)
  y?: number; // Pre-computed y position (optional for backward compatibility)
}
