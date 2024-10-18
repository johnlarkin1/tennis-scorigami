export const SLAMS = [
  { value: 'wimbledon', label: 'Wimbledon' },
  { value: 'us-open', label: 'US Open' },
  { value: 'australian-open', label: 'Australian Open' },
  { value: 'french-open', label: 'French Open' },
];

export const YEARS = Array.from({ length: 20 }, (_, i) => ({
  value: (2023 - i).toString(),
  label: (2023 - i).toString(),
}));

export const POSSIBLE_SCORES = [
  '6-0',
  '6-1',
  '6-2',
  '6-3',
  '6-4',
  '7-5',
  '7-6',
  '6-7',
  '5-7',
  '4-6',
  '3-6',
  '2-6',
  '1-6',
  '0-6',
];
