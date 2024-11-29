import { atom } from "jotai";

import { SexType, ViewType } from "@/types/tree-control-types";

// View type control
export const viewTypeAtom = atom<ViewType>("vertical");

// Visual controls
export const showGradientAtom = atom<boolean>(false);
export const showCountAtom = atom<boolean>(false);

// Filter controls
export const selectedYearAtom = atom<string>("All Years");
export const selectedSexAtom = atom<SexType>("Men and Women");
