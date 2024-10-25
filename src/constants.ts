export const YEARS = Array.from({ length: 20 }, (_, i) => ({
  value: (2023 - i).toString(),
  label: (2023 - i).toString(),
}));

export const POSSIBLE_SCORES = [
  "6-0",
  "6-1",
  "6-2",
  "6-3",
  "6-4",
  "7-5",
  "7-6",
  "6-7",
  "5-7",
  "4-6",
  "3-6",
  "2-6",
  "1-6",
  "0-6",
];

const from_seconds_to_minutes = 1000 * 60;
export const REACT_QUERY_STALE_TIME_MIN = 30 * from_seconds_to_minutes; // 30 minutes
