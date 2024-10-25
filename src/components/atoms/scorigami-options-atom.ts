// scorigami-options-atom.ts
import { atom } from "jotai";

export type SexType = "Men and Women" | "Men" | "Women";
export const selectedSexAtom = atom<SexType>("Men and Women");
export const selectedYearAtom = atom<string>("All Years");
