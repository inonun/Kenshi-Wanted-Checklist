export function computeProgress(entries, completed) {
  let claimedReward = 0;
  let totalReward = 0;
  let done = 0;

  for (const entry of entries) {
    totalReward += entry.reward;
    if (completed.has(entry.id)) {
      done += 1;
      claimedReward += entry.reward;
    }
  }

  const total = entries.length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    claimedReward,
    totalReward,
    remainingReward: totalReward - claimedReward,
  };
}
