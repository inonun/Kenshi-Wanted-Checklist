export const MAX_DIFFICULTY = 5;

export function difficultyLevel(entry) {
  const level = Math.round(Number(entry.difficulty));
  return Number.isFinite(level) ? Math.min(MAX_DIFFICULTY, Math.max(1, level)) : 1;
}
