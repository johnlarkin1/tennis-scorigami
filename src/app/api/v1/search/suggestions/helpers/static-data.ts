import { NextResponse } from "next/server";

export function getSexSuggestions() {
  return NextResponse.json({
    type: "sex",
    items: [
      { id: "M", name: "Men's", value: "M" },
      { id: "F", name: "Women's", value: "F" },
    ],
  });
}

export function getHasSuggestions() {
  return NextResponse.json({
    type: "has",
    items: [
      { id: "tiebreak", name: "Tiebreak", value: "tiebreak" },
      { id: "bagel", name: "Bagel (6-0 set)", value: "bagel" },
      {
        id: "breadstick",
        name: "Breadstick (6-1 set)",
        value: "breadstick",
      },
      { id: "double_bagel", name: "Double Bagel", value: "double_bagel" },
      {
        id: "straight_sets",
        name: "Straight Sets",
        value: "straight_sets",
      },
      { id: "comeback", name: "Comeback Win", value: "comeback" },
    ],
  });
}

export function getNeverSuggestions() {
  return NextResponse.json({
    type: "never",
    items: [
      {
        id: "occurred",
        name: "Never Occurred (Scorigami)",
        value: "occurred",
      },
    ],
  });
}

export function getStatusSuggestions() {
  return NextResponse.json({
    type: "status",
    items: [
      { id: "complete", name: "complete", value: "complete" },
      { id: "incomplete", name: "incomplete", value: "incomplete" },
    ],
  });
}
