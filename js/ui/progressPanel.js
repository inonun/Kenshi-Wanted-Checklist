import { byId } from "../utils/dom.js";
import { formatNumber } from "../utils/format.js";
import { t } from "../services/i18n.js";

export function updateProgressPanel(stats, lang) {
  const cats = t("card.cats");

  byId("progress-count").textContent = t("progress.captured", { done: stats.done, total: stats.total });
  byId("progress-percent").textContent = `${stats.percent}%`;
  byId("progress-fill").style.width = `${stats.percent}%`;
  byId("progress-meter").setAttribute("aria-valuenow", String(stats.percent));
  byId("reward-claimed").textContent = `${formatNumber(stats.claimedReward, lang)} ${cats}`;
  byId("reward-remaining").textContent = `${formatNumber(stats.remainingReward, lang)} ${cats}`;
}
