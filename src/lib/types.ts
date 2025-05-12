export type U32 = number;

export interface NodeDTO {
  id: U32;
  slug: string;
  played: boolean;
  norm: number; // 0–1
}

export interface EdgeDTO {
  frm: U32;
  to: U32;
}
