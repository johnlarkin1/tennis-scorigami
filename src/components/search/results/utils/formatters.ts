export const calculateAge = (dateOfBirth?: string, matchDate?: string) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const eventDate = matchDate ? new Date(matchDate) : new Date();
  const age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())
  ) {
    return age - 1;
  }
  return age;
};

export const formatHeight = (heightCm?: number) => {
  if (!heightCm) return null;
  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm / 2.54) % 12);
  return `${feet}'${inches}"`;
};

export const formatWeight = (weightKg?: number) => {
  if (!weightKg) return null;
  const pounds = Math.round(weightKg * 2.205);
  return `${weightKg}kg (${pounds}lbs)`;
};

export const formatHandedness = (hand?: string) => {
  if (!hand) return null;
  return hand === "L"
    ? "Left-handed"
    : hand === "R"
      ? "Right-handed"
      : "Unknown";
};
