import { SexType } from "@/types/tree-control-types";
import { atom } from "jotai";

// View type atom
export const viewTypeAtom = atom<"horizontal" | "vertical">("vertical");

// Visual control atoms
export const showGradientAtom = atom<boolean>(false);
export const showCountAtom = atom<boolean>(true);

// Filter control atoms
export const selectedYearAtom = atom<string>("All Years");
export const selectedSexAtom = atom<SexType>("Men and Women");